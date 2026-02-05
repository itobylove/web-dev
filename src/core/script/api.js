import axios from 'axios'
import apiUrl from '@/core/config/url.js'
import apiUrl2 from '@/core/config/url2.js'
import * as core from '@/core/script/core.js'
import * as user from '@/core/script/user.js'
import {useStorage} from '@/utils/LocalStorage.js'
import {query} from '@/core/script/core.js'
import dialog from "@/core/script/dialog.js"
import siyi from '@/core/script/siyi.js'

// api URL
export const url = apiUrl
export const url2 = apiUrl2

// 获取HTTP 默认请求头
export const getHttpDefaultHeaders = () => {
    const clientIp = useStorage().get('clientIp');
    return {
        'x-requested-with': 'XMLHttpRequest',
        'x-api-key': sessionStorage.getItem('x-api-key') || query.get('token'),
        'x-api-uuid': core.getUUID(),
        'x-api-finger': window?.fingerprint,
        'x-api-page': location.hash,
        'x-api-version': window?.APP_VERSION,
        'x-api-screen': window.screen.width + 'x' + window.screen.height,// 屏幕宽度/高度
        'x-api-window': window.innerWidth + 'x' + window.innerHeight,// 当前窗口的宽度/高度
        'x-api-pixel-Ratio': window.devicePixelRatio,// 屏幕的设备像素比
        'x-api-ip': clientIp?.ip,
        'x-api-location': encodeURI(clientIp?.location),
        'x-api-isp': encodeURI(clientIp?.isp),
    }
}

// const CancelToken = axios.CancelToken
// const source = CancelToken.source()

//http请求方法
export const http = axios.create({
    baseURL: '',
    timeout: 60000 * 10,
})

// 添加请求拦截器
http.interceptors.request.use(async config => {
    // if( !token.x_api_key  || Date.now()/1000 > token.expire_time){
    //     source.cancel('取消了')
    // }
    if (!config.url.startsWith(apiUrl2.base) && !config.url.startsWith(apiUrl.base) && !config.url.startsWith('http')) {
        config.baseURL = apiUrl.base; // 临时兼容旧接口
    }
    config.headers = {...config.headers,  ...getHttpDefaultHeaders()}
    return config
}, function (error) {
    return Promise.reject(error)
})


// 添加响应拦截器
http.interceptors.response.use(res => {
    const token = res.headers['x-api-key']
    const time = res.headers['x-api-time']
    if (token?.length === 32 && time?.length === 10) {
        sessionStorage.setItem('x-api-key', token)
        sessionStorage.setItem('x-api-time', time)
    } else if(siyi.env==='prod'){
        sessionStorage.removeItem('x-api-key')
        sessionStorage.removeItem('x-api-time')
    }
    if ((res.data?.action ?? res.data?.data?.action) === 'to_login') {
        user.logout().then(() => null);// 重新登录
    }
    if ([301, 302].includes(res.data.status)) {
        res.data.message && dialog.info(res.data.message)// 这句没啥作用，都跳转了提示也看不到了
        window.location.href = res.data.url;
        return;
    }
    if (res.data.code === 20002) {
        dialog.confirm(res.data.message + '，是否申请?', () => {
            const path = (new URL(res.request.responseURL)).pathname
            authApply({type: 2, data: [{name: path}]}).then((applyIds) => {
                applyIds?.length > 0 && dialog.success('申请成功,请等待审核!', 9999999)
            })
        })
    }
    return res
}, error => {
    dialog.error(error.message)
    return Promise.reject(error)
})

const response = (res, fields, getRaw) => {
    const code = res?.data?.code;
    const message = res?.data?.message || '出错了';
    const data = res?.data?.data || null;
    if (![0,200,20000].includes(code)) {
        if (code === 20002) return; // 无权限，在响应拦截器已经提示过了，不在提示
        const dialogMap = {
            21000: dialog.info, //提示
            22000: dialog.warning,//警告
            // 23000: dialog.error,//错误
        };
        const handler = dialogMap?.[code] || dialog.error;
        handler(message);
        return getRaw && dialogMap?.[code] ? res : null;
    }
    if (getRaw) return res;
    return fields ? core.pick(data, fields) : data;
}

/**
 * 通用的GET请求
 * @param _url
 * @param params
 * @param fields
 * @param getRaw
 * @returns {Promise<{}|*>}
 */
export const get = async (_url, params = {}, fields = null, getRaw = false) => {
    if (typeof _url!=='string'){
        const lastCall = (new Error().stack.split('\n').pop() || '').trim();
        dialog.error('url不存在：'+lastCall,30000);
        return;
    }
    return response(await http.get(_url, { params }),fields, getRaw);
};

/**
 * 通用的post请求
 * @param _url
 * @param params
 * @param fields
 * @param getRaw
 * @returns {Promise<{}|*>}
 */
export const post = async (_url, params = {}, fields = null, getRaw = false) => {
    if (typeof _url!=='string'){
        const lastCall = (new Error().stack.split('\n').pop() || '').trim();
        dialog.error('url不存在：'+lastCall,30000);
        return;
    }
    return response(await http.post(_url, params),fields, getRaw);
}

// utils/jsonp.js
export function jsonp(url, params = {}, callbackName = "callback") {
    return new Promise((resolve, reject) => {
        const cbName = "jsonp_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

        // 拼接参数
        params[callbackName] = cbName;
        const query = Object.keys(params)
        .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
        .join("&");

        const script = document.createElement("script");
        script.src = url + (url.includes("?") ? "&" : "?") + query;

        // 定义回调
        window[cbName] = (data) => {
            resolve(data);
            document.body.removeChild(script);
            delete window[cbName];
        };

        script.onerror = (err) => {
            reject(err);
            document.body.removeChild(script);
            delete window[cbName];
        };

        document.body.appendChild(script);
    });
}



/**
 * 封装的fetch (没有拦截)
 * @param url
 * @param params
 * @param options
 * @param toJson
 * @returns {Promise<Promise<any>|Response>}
 */
export const apiFetch = async (url, params = {}, options = {}, toJson = true) => {
    const response = await (await fetch(url, {
        ...options,
        headers: getHttpDefaultHeaders(),
    }));
    return toJson ? response.json() : response
}

/**
 * 带超时的fetch
 * @param url
 * @param options
 * @param timeout
 * @returns {Promise<T | void>}
 */
export async function fetchWithTimeout(url, options = {}, timeout = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

/**
 * 权限申请
 * @param param
 * @returns {Promise<*>}
 */
export const authApply = async (param = {}) => {
    return await post(url.system.authApply.add, param);
}


/**
 * 读取用户配置
 * @param name 配置名
 * @param type 0:字符串  1:数组  2:对象
 * @param group 组
 */
export const getUserConfig = async (name, type = 1, group = null) => await get(url.user.config, {
    name, type, group
})

/**
 * 保存用户配置
 * @param name
 * @param data
 * @param type 0:字符串  1:数组  2:对象
 * @param group
 * @returns {Promise<*>}
 */
export const saveUserConfig = async (name, data, type = 1, group = null) => await http.post(url.user.config, {
    name, group, type, data
})


/**
 * 料号选择器
 * @param keyword 料号（模糊搜索）
 * @param params
 * @returns {Promise<*|{}|{}>} 列表
 */
export const jobSelector = async (keyword = '', params = {}) => {
    return await get(url.common.jobSelector, {keyword, ...params});
};


/**
 * 销售部件选择器
 * @param keyword 料号（模糊搜索）
 * @param params
 * @returns {Promise<*|{}|{}>} 列表
 */
export const salePartSelector = async (keyword = '', params = {}) => {
    return await get(url.common.selector, {type: 'sale_part', keyword, ...params});
};


/**
 * 员工选择器
 * @param keyword
 * @param params
 * @returns {Promise<*|{}|{}>}
 */
export const employeeSelector = async (keyword = '', params = {}) => {
    return await get(url.common.employeeSelector, {keyword, ...params});
};


/**
 * 部门选择器(MySQL中的)
 * @param keyword
 * @param params
 * @returns {Promise<*|{}|{}>}
 */
export const departmentSelector = async (keyword = '', params = {}) => {
    return await get(url.common.selector, {type:'department',showMore:1,keyword, ...params});
};
/**
 * 部门树选择器(MSSQL中的)
 * @param keyword
 * @param params
 * @returns
 */
export const departmentTreeSelector = async (keyword = '', params = {}) => {
    return await get(apiUrl2.dept.list, {type:'department',showMore:1,keyword, ...params});
}


/**
 * 岗位选择器(MySQL中的)
 * @param keyword
 * @param params
 * @returns {Promise<*|{}|{}>}
 */
export const positionSelector = async (keyword = '', params = {}) => {
    return await get(url.common.selector, {type:'position',showMore:1,keyword, ...params});
};

/**
 * 用户选择器
 * @param keyword
 * @param params
 * @returns {Promise<*|{}|{}>}
 */
export const userSelector = async (keyword = '', params = {}) => {
    return await get(url.common.selector, {type: 'user', keyword, ...params});
};

/**
 * 用户选择器(mysql)
 * @param keyword
 * @param params
 * @returns {Promise<*|{}|{}>}
 */
export const localUserSelector = async (keyword = '', params = {}) => {
    return await get(url.common.selector, {type: 'user_local', keyword, ...params});
};


/**
 * 供应商选择器
 * @param keyword
 * @param params
 * @returns {Promise<*|{}|{}>}
 */
export const supplierSelector = async (keyword = '', params = {}) => {
    return await get(url.common.selector, {type: 'supplier', keyword, ...params});
};


/**
 * 上传文件
 * @param file 文件
 * @param server_url 上传地址
 * @param data 提交参数
 * @param fileFiled 字段
 * @returns {Promise<*>}
 */
export const uploader = async ({file}, server_url, data = {}, fileFiled = 'file') => {
    const formData = new FormData()
    formData.append(fileFiled, file)
    Object.keys(data).forEach(key => {
        formData.append(key, data[key])
    })
    return await post(server_url || url.common.uploader, formData);
}

export async function getWxConfig(_url, isAgent = 0) {
    return await post(url.common.jssdk, {url: _url, isAgent});
}

/**
 * 获取ERP报表
 * @param type 类型
 * @param params 参数
 * @param open 展示的类型 view:显示
 * @returns {Promise<{}|*|null>}
 */
export const getErpPdf = async (type, params, open = 'view') => {
    const _url = url.erpReport?.[type];
    const data = _url ? await get(_url, {...params}) : null;
    open === 'view' && data?.url && dialog.window(`<iframe class='iframe_full' src='${data.url}'>`, {}, {title: data.name, width: 800, height: 800})
    return data;
}

// 获取分页信息
export const getCurrentPage = (type, currentPage, listSize, pageSize) => {
    if (typeof currentPage === 'object') {
        let params = {...currentPage};
        currentPage = params.currentPage;
        pageSize = params.pageSize;
    }
    if (type === 'prev' && currentPage > 1) {
        currentPage -= 1
    } else if (type === 'next' && (listSize === undefined || pageSize === listSize)) {
        currentPage += 1
    } else if (
        type === 'init' ||
        type?.$event?.type === 'click' ||
        type?.$event?.type === 'keydown' && type?.$event?.keyCode === 13
    ) {
        currentPage = 1
    } else if (type === 'search') {
        currentPage = 1
    }
    return currentPage;
}

export const getClientIP3 = async (field = null) => {
    try {
        const storage = useStorage();
        let ipInfo = storage.get('clientIp');
        if (typeof ipInfo?.ip === "undefined" || ipInfo?.ip?.length < 1) {
            const apiResult = await (await fetchWithTimeout('https://api.vore.top/api/IPdata?ip=', {referrerPolicy: 'no-referrer'})).json();
            if (apiResult?.ipinfo?.text){
                ipInfo = {
                    ip: apiResult.ipinfo.text,
                    isp: apiResult?.ipdata?.isp,
                    location: (apiResult.ipdata?.info1 + " " + apiResult.ipdata?.info2 + " " + apiResult.ipdata?.info3).trim(),
                }
            }
            ipInfo?.ip && storage.set('clientIp', ipInfo, {expire: 86400});
        }
        return field ? ipInfo?.[field] : ipInfo;
    } catch (e) {
        console.log('getClientIP', e);
        return null;
    }
}

export const getClientIP = async (field = null) => {
    try {
        const storage = useStorage();
        let ipInfo = storage.get('clientIp');
        if (!ipInfo?.ip) {
            const res = await (await fetchWithTimeout('https://myip.ipip.net/json', { referrerPolicy: 'no-referrer' })).json();
            if (res?.data?.ip) {
                const loc = (res.data?.location || []).filter(Boolean);
                ipInfo = {
                    ip: res.data.ip,
                    isp: loc.pop(),
                    location: loc.join(' '),
                };
                storage.set('clientIp', ipInfo, { expire: 86400 });
            }
        }
        return field ? ipInfo?.[field] : ipInfo;
    } catch (e) {
        console.log('getClientIP', e);
        return null;
    }
};

// 获取客户端IP (腾讯地图)
export const getClientIP2 = async (field = null) => {
    try {
        const storage = useStorage();
        let ipInfo = storage.get('clientIp');
        if (typeof ipInfo?.ip === "undefined" || ipInfo?.ip?.length < 1) {
            const apiResult = await jsonp('https://apis.map.qq.com/ws/location/v1/ip?ip=&key=M5CBZ-6M5WA-P3OKD-CRKBJ-IDJ6F-NUBRH&output=jsonp', {}, 'callback');
            if (apiResult?.result?.ip) {
                ipInfo = {
                    ip: apiResult.result?.ip,
                    location: apiResult.result?.ad_info?.nation + " " + apiResult.result.ad_info?.province + " " + apiResult.result.ad_info?.city + " " + apiResult.result.ad_info?.district
                }
            }
            ipInfo?.ip && storage.set('clientIp', ipInfo, {expire: 86400});
        }
        return field ? ipInfo?.[field] : ipInfo;
    } catch (e) {
        console.log('getClientIP', e);
        return null;
    }
}

/**
 * 组件异步事件
 * @param {string} eventName 事件名
 * @param {Object} payload 事件参数
 * @param {{getCurrentInstance:vue.getCurrentInstance}} instance 组件实例
 * @returns {Promise<Awaited<*>>|Promise<never>|Promise<unknown>}
 */
export function emitWithPromise(eventName, payload, instance) {
    if (!instance) {
        console.warn(`[emitWithPromise] must be used in setup()`)
        return Promise.reject(new Error('No component instance'))
    }
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const emit = instance.emit
    const isListened = instance.vnode.props?.[`on${capitalize(eventName)}`] != null
    if (!isListened) {
        console.warn(`[emitWithPromise] event "${eventName}" is not listened by parent`)
        return Promise.resolve(payload?.e) // or reject(new Error(...)) depending on your preference
    }
    return new Promise((resolve, reject) => {
        emit(eventName, {
            ...payload,
            resolve,
            reject,
        })
    })
}


/**
 * 将对象转换为 URL 查询字符串
 * 支持数组和一层嵌套对象，自动跳过 null 和 undefined
 */
export function toQueryString(obj) {
    const parts = [];

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];
        if (value === null || value === undefined) continue;

        if (Array.isArray(value)) {
            for (const item of value) {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
            }
        } else if (typeof value === 'object') {
            for (const subKey in value) {
                if (!Object.prototype.hasOwnProperty.call(value, subKey)) continue;
                const subVal = value[subKey];
                parts.push(
                    `${encodeURIComponent(`${key}[${subKey}]`)}=${encodeURIComponent(subVal)}`
                );
            }
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    }

    return parts.join('&');
}

/**
 * 将 query 参数安全地追加到原始 URL 上
 * @param {string} url 原始 URL
 * @param {object} queryObj 要追加的查询参数
 * @returns {string} 新的 URL
 */
export function createUrl(url, queryObj) {
    if (typeof url !== 'string' || typeof queryObj !== 'object' || queryObj === null) {
        return url;
    }

    const queryString = toQueryString(queryObj);
    if (!queryString) return url;

    // 拆分 hash 锚点（如果存在）
    const [baseUrl, hash] = url.split('#');
    const hasQuery = baseUrl.includes('?');
    const endsWithQuestion = baseUrl.endsWith('?');
    const endsWithAmp = baseUrl.endsWith('&');

    const connector = hasQuery
        ? (endsWithQuestion || endsWithAmp ? '' : '&')
        : '?';

    return `${baseUrl}${connector}${queryString}${hash ? '#' + hash : ''}`;
}


/**
 * 获取页面URL
 * @param path
 * @param query
 * @param hash
 * @returns {string}
 */
export function getPageUrl(path, query, hash = '') {
    const host = window.location.origin;
    return createUrl(host + path + (hash.length > 0 ? '#' + hash : ''), query);
}

export function getUrl(query, hash = ''){
    return createUrl(window.location.href, query) + (hash.length > 0 ? '#' + hash : '');
}