import dayjs from 'dayjs'
import {pinyin} from 'pinyin-pro'
import Exceljs from 'exceljs'
import FileSaver from 'file-saver'
import * as api from '@/core/script/api.js'
import siyi from '@/core/script/siyi.js'
import dialog from '@/core/script/dialog.js'

/**
 * 核心类在其它模块用的时候建引入* as core 使用与防止冲突
 */


siyi.fullscreen = true//是否全屏状态


/**
 * 获取当前元素与容器的位置信息
 * @param dom 容器dom
 * @param event 鼠标事件
 * @returns {{containerTop, containerLeft, containerWidth, containerHeight, domTop, domLeft, domWidth, domHeight, x, y}}
 */
export const getBoundingClientRect = (dom, event) => {
    const containerRect = dom.parentNode.getBoundingClientRect();//容器位置
    const domRect = dom.getBoundingClientRect();//窗口位置
    //内容区位置
    return {
        containerTop: containerRect.top,
        containerLeft: containerRect.left,
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        //弹窗位置
        domTop: domRect.top,
        domLeft: domRect.left,
        domWidth: domRect.width,
        domHeight: domRect.height,
        //按下时鼠标位置
        x: event?.pageX,
        y: event?.pageY,
    };
}

/**
 * 改变Dom大小与位置
 * obj参数说明
 * bcr: 当前元素与容器的位置信息也就是 getBoundingClientRect()
 * event: 鼠标事件
 * minWidth: 最小宽度
 * maxWidth: 最大宽度
 * minHeight: 最小高度
 * maxHeight: 最大高度
 * offset: 偏移量防止跑出容器
 * unit: 单位开关
 */
export const changeDomSize = {
    /**
     * 获取鼠标在容器中的位置，不允许超容器范围，offset为偏移量
     * @param obj
     * @returns {{x: number, y: number}}
     */
    mousexy: obj => {
        let {bcr, event, offset} = obj;
        offset = offset || 38;
        return {
            x: Math.min(Math.max(event.pageX, bcr.containerLeft + offset), bcr.containerWidth + bcr.containerLeft - offset),
            y: Math.min(Math.max(event.pageY, bcr.containerTop + offset), bcr.containerHeight + bcr.containerTop - offset),
        }
    },
    /**
     * 移动位置
     * @param obj
     * @returns {{left: string|number, top: string|number}}
     */
    move: obj => {
        let {bcr, event, offset, unit} = obj;
        offset = offset || 38;
        unit = (unit || true) ? 'px' : 0;
        const left = bcr.domLeft - bcr.containerLeft; //dom距离左边位置
        const leftMin = -(bcr.domWidth + left - offset); //向左最大偏移量
        const leftMax = bcr.containerWidth - left - offset; //向右最大偏移量
        const leftOffset = Math.min(Math.max(event.pageX - bcr.x, leftMin), leftMax);
        const top = bcr.domTop - bcr.containerTop; //dom距离上边位置
        const topMin = -top; //向上最大偏移量  但是不允许偏移出去了
        const topMax = bcr.containerHeight - top - offset; //向上最大偏移量
        const topOffset = Math.min(Math.max(event.pageY - bcr.y, topMin), topMax);
        return {left: left + leftOffset + unit, top: top + topOffset + unit}
    },
    left: obj => {
        let {bcr, event, minWidth, maxWidth, offset, unit} = obj;
        offset = offset || 38;
        minWidth = minWidth || 0;
        maxWidth = maxWidth || 999999;
        unit = (unit || true) ? 'px' : 0;
        const left = bcr.domLeft - bcr.containerLeft; //dom距离左边位置
        const min = bcr.domWidth - maxWidth; //向左最大偏移量
        const max = bcr.domWidth - minWidth; //向右最大偏移量
        const pageX = Math.min(event.pageX, bcr.containerWidth + bcr.containerLeft - offset);
        const xoffset = Math.min(Math.max(pageX - bcr.x, min), max);
        return {left: left + xoffset + unit, width: bcr.domWidth - xoffset + unit}
    },
    right: obj => {
        let {bcr, event, minWidth, maxWidth, offset, unit} = obj;
        offset = offset || 38;
        minWidth = minWidth || 0;
        maxWidth = maxWidth || 999999;
        unit = (unit || true) ? 'px' : 0;
        const min = minWidth - bcr.domWidth; //向左最大偏移量
        const max = maxWidth - bcr.domWidth; //向右最大偏移量
        const pageX = Math.max(event.pageX, bcr.containerLeft + offset);
        const xoffset = Math.min(Math.max(pageX - bcr.x, min), max);
        return {width: bcr.domWidth + xoffset + unit}
    },
    top: obj => {
        let {bcr, event, minHeight, maxHeight, offset, unit} = obj;
        offset = offset || 38;
        minHeight = minHeight || 0;
        maxHeight = maxHeight || 999999;
        unit = (unit || true) ? 'px' : 0;
        const top = bcr.domTop - bcr.containerTop; //dom距离上边位置
        const min = Math.max(bcr.domHeight - maxHeight, -top); //向上最大偏移量  但是不允许偏移出去了
        const max = bcr.domHeight - minHeight; //向下最大偏移量
        const pageY = Math.min(event.pageY, bcr.containerHeight + bcr.containerTop - offset);
        const yoffset = Math.min(Math.max(pageY - bcr.y, min), max);
        return {height: bcr.domHeight - yoffset + unit, top: top + yoffset + unit}
    },
    bottom: obj => {
        let {bcr, event, minHeight, maxHeight, offset, unit} = obj;
        minHeight = minHeight || 0;
        maxHeight = maxHeight || 999999;
        unit = (unit || true) ? 'px' : 0;
        const min = minHeight - bcr.domHeight; //向上最大偏移量  但是不允许偏移出去了
        const max = maxHeight - bcr.domHeight; //向上最大偏移量
        const pageY = Math.max(event.pageY, bcr.containerTop);
        const yoffset = Math.min(Math.max(pageY - bcr.y, min), max);
        return {height: bcr.domHeight + yoffset + unit}
    },
    lefttop: obj => {
        return {...changeDomSize.left(obj), ...changeDomSize.top(obj)}
    },
    righttop: obj => {
        return {...changeDomSize.right(obj), ...changeDomSize.top(obj)}
    },
    leftbottom: obj => {
        return {...changeDomSize.left(obj), ...changeDomSize.bottom(obj)}
    },
    rightbottom: obj => {
        return {...changeDomSize.right(obj), ...changeDomSize.bottom(obj)}
    },
}


/**
 * 防抖 (setTimeout定时器)
 * @param fn  要执行的函数
 * @param delay 延迟时间
 */
export const debounce = (fn, delay) => {
    let timer
    return (...args) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

/**
 * 将字符串转换成DOM结构
 * @param htmlString
 * @returns {HTMLCollection}
 */
export const stringToDom = htmlString => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.children;
}

/**
 * 深度冻结对象，可指定排除路径
 * @param {Object} obj 要冻结的对象
 * @param {Array<string>} exclude 排除路径列表，例如 ['user.a.b.c', 'user.r.e.q']
 * @param {number} deep 当前递归层级
 * @returns {Object} 冻结后的对象
 */
export const deepFreeze = (obj, exclude, deep = 0) => {
    exclude = typeof exclude === 'string' ? [exclude] : exclude
    const excludeList = []
    exclude.forEach(path => {
        const segments = path.split('.')
        const currentKey = segments[deep]
        if ((segments.length - 1) === deep && currentKey) excludeList.push(currentKey)
    })
    for (const key in obj) {
        if (typeof obj[key] === 'object') deepFreeze(obj[key], exclude, deep + 1);
        Object.defineProperty(obj, key, {
            value: obj[key],
            writable: excludeList.includes(key), //是否可修改属性值  白名单内允许
            configurable: excludeList.includes(key),// 是否可以删除属性或再次修改描述符  白名单内允许
            enumerable: true //允许枚举 循环 遍历
        })
    }
}


//随机视频背景
export const videoFile = '/video/bg' + (Math.floor(Math.random() * 15) + 1) + '.mp4'//随机视频背景


/**
 * 获取随机颜色
 * @returns {string}
 */
export const getRandomColor = () => {
    let color = '#'
    const letters = '0123456789ABCDEF'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}


/**
 * 创建图标
 * @param icon 图标名称
 * @param style 样式
 * @returns {VNode}
 */
// export const getIcon = (icon, style = {}) => h('i', {class: icon, style: {fontSize: '26px', color: '#006EFF', ...style}})


/**
 * 使用随机数生成 UUID
 * @returns {string}
 */
export const getUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; // 生成一个随机数
        const v = c === 'x' ? r : (r & 0x3 | 0x8); // 'x' 为随机数，'y' 为特殊格式
        return v.toString(16); // 转换为十六进制
    });
}


/**
 * 输入框模拟输入提示效果
 * @param dom
 * @param txt
 */
export const setPlaceholder = (dom, txt) => {
    dom.value = ''
    dom.placeholder = ''
    dom.focus()
    let i = 0
    let str = ''
    let t = setInterval(() => {
        dom.placeholder = str += txt[i++]
        i >= txt.length && clearInterval(t)
    }, 50)
}


/**
 * 获取兄弟元素最高层级
 * @param element 目标元素
 * @param includeSelf 是否包含自身
 * @returns {number|number|number} 最高层级
 */
export const getHighestSiblingZIndex = (element, includeSelf = false) => {
    const parent = element.parentElement;//获取父元素
    if (!parent) return 0;//如果没有父元素，则返回0
    const siblings = includeSelf ? Array.from(parent.children) : Array.from(parent.children).filter(el => el !== element);
    return siblings.reduce((maxZ, sibling) => {
        const zIndex = window.getComputedStyle(sibling).zIndex;
        return (zIndex !== 'auto' && !isNaN(parseInt(zIndex))) ? Math.max(maxZ, parseInt(zIndex)) : maxZ;
    }, 0);
}


/**
 * 添加水印
 * @param {Object} config - 配置选项
 */
export const watermark = (config = {}) => {
    config = {
        ...{
            fontSize: '16px',
            fontFamily: '微软雅黑',
            color: 'rgba(128, 128, 128, 0.1)',
            rotate: -45, // 旋转角度
            gap: 150,
            container: 'body',
            id: 'siyi-watermark' + Date.now(),
            lineHeight: 20,
            zIndex: 999,
        }, ...config
    };
    const watermarkContainer = document.createElement('div');// 创建水印容器
    watermarkContainer.id = config.id;//dom id
    config.container === 'body' ? document.body.appendChild(watermarkContainer) : config.container.appendChild(watermarkContainer);//添加水印容器
    const canvas = document.createElement('canvas');//创建画布
    const ctx = canvas.getContext('2d');//获取画布上下文
    canvas.width = config.gap;//水印大小
    canvas.height = config.gap;//水印大小
    ctx.font = `${config.fontSize} ${config.fontFamily}`;//水印字体
    ctx.fillStyle = config.color;//水印颜色
    ctx.textAlign = 'center';// 设置文本水平居中
    ctx.textBaseline = 'middle';// 设置文本基线
    const t1 = setInterval(() => {// 绘制水印图案 1秒画一次
        ctx.save();// 先保存原始状态
        ctx.clearRect(0, 0, canvas.width, canvas.height);// 清空画布
        ctx.translate(canvas.width / 2, canvas.height / 2);// 移动到画布中心
        ctx.rotate(config.rotate * Math.PI / 180);//然后旋转
        const text = config.text || siyi.user.nickname + "@龙腾电子\n" + date.YmdHis()// 处理文本换行
        const lines = text.split('\n');// 处理换行
        const startY = -(lines.length - 1) * config.lineHeight / 2; // 垂直居中
        lines.forEach((line, index) => ctx.fillText(line, 0, startY + index * config.lineHeight));// 在中心位置绘制
        ctx.restore();// 恢复原始状态
        if (config.text) clearInterval(t1);//存在用户自定义水印则停止时间水印
    }, 10)
    // 定时刷新水印
    const t2 = setInterval(() => {
        const newIndex = getHighestSiblingZIndex(watermarkContainer)//获取兄弟元素最高层级
        config.zIndex = newIndex >= config.zIndex ? newIndex + 1 : config.zIndex//获取新的层级
        !document.getElementById(config.id) && watermark(config);//删除水印则重新创建
        watermarkContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background-repeat: repeat;
        z-index: ${config.zIndex};
        background-image:url(${canvas.toDataURL()});
      `;
    }, 10)
    const observer = new MutationObserver(() => !document.getElementById(config.id) && watermark(config));// 防止删除
    observer.observe(document.body, {childList: true, subtree: true});// 监听DOM变化
}


/**
 * 模式切换
 * @param type 标题 图标
 * @param {function}  callback 回调函数
 * @returns {string}
 */
export const themeSwitch = (type = '', callback) => {
    if (type === 'title') {
        return siyi.user.view.theme === 'default' ? '白天模式' : '夜晚模式'
    } else if (type === 'icon') {
        return siyi.user.view.theme === 'default' ? 'ri-sun-line' : 'ri-moon-fill'
    } else {
        siyi.user.view.theme = siyi.user.view.theme === 'default' ? 'bright' : 'default'
        callback = callback || function () {
        }
        api.saveUserConfig('theme', siyi.user.view.theme, 0, 'view').then(callback)
    }
}


/**
 * 电脑版/手机版切换
 * @param type  title:返回文本，icon:返回图标class名，其它直接跳转0:手机版，1:电脑版
 * @returns {string|string}
 */
export const deviceSwitch = (type = '') => {
    if (type === 'title') {
        return '切换到' + (siyi.pc ? '手机版' : '电脑版')
    } else if (type === 'icon') {
        return siyi.pc ? 'ri-smartphone-line' : 'ri-computer-line'
    } else {
        const url = new URL(window.location.href)
        window.location.href = '?device=' + (type || (siyi.pc ? 0 : 1)) + (url.hash || '#home')
    }
}


/**
 * 全屏切换
 * @param status
 * @param callback
 */
export const fullscreenSwitch = (status = null, callback) => {
    status = status === null ? siyi.fullscreen : status
    if (status === true) {
        enterFullscreen(callback)
    } else if (status === false) {
        exitFullscreen(callback)
    } else if (status === 'title') {
        return siyi.fullscreen ? '全屏' : '退出全屏'
    } else if (status === 'icon') {
        return siyi.fullscreen ? 'ri-fullscreen-line' : 'ri-fullscreen-exit-fill'
    }
    return status
}

/**
 * 进入全屏
 * @param callback
 * @param dom
 */
export const enterFullscreen = (callback, dom) => {
    const element = dom || document.documentElement // 获取指定元素或默认根元素
    const requestFullScreen = element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen
    if (requestFullScreen) {
        requestFullScreen.call(element).then(() => {
            siyi.fullscreen = false
            callback = callback || function () {
            }
            callback('enter')
        }).catch(() => {
            dialog.error('进入全屏模式失败。')
        })
    } else {
        dialog.error('浏览器不支持全屏。')
    }
}


/**
 * 退出全屏
 * @param callback
 */
export const exitFullscreen = callback => {
    const exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen
    if (exitFullscreen) {
        exitFullscreen.call(document).then(() => {
            siyi.fullscreen = true
            callback = callback || function () {
            }
            callback('exit')
        }).catch(() => {
            dialog.error('退出全屏模式失败。')
        })
    } else {
        dialog.error('浏览器不支持全屏。')
    }
}


/**
 * 监听设备输入：扫码枪，PDA，键盘，电子秤等输入设备
 * 第一个参数为回调函数 返回一个参数做了为扫描到的字符串，第二个参数为 延迟时间ms，可能不同的PDA设备响应时间不一样
 * 例如：scan(char=>{ console.log(char) })
 * @param handler 回调函数
 * @param target
 * @param delayTime 延迟时间用与检测是扫码输入还是人为输入
 */
export const scan = (handler, target = '', delayTime = 20) => {
    let lastTime = 0;      // 上一次按键时间
    let buffer = '';        // 输入缓冲区
    const keydownHandler = e => {
        if (target && e.target !== target) return;
        const currentTime = Date.now();
        const timeDiff = currentTime - lastTime;
        lastTime = currentTime;
        // 结束符
        if (e.key === 'Enter') {
            const result = buffer.replace(/\r?\n$/, '').replace(/Shift/g, '');//移除结尾的回车和换行
            result && handler(result);
            buffer = '';
            return;
        }
        if (e.key.length !== 1) return;// 只接收可打印字符
        if (timeDiff > delayTime) buffer = '';// 非高速连续输入，丢弃
        buffer += e.key;
    }
    // 移除旧的事件监听器并添加新的
    document.removeEventListener('keydown', keydownHandler);
    document.addEventListener('keydown', keydownHandler);
}


/**
 * 对数据的操作
 */
export const data = {
    /**
     * 排序
     * @param a
     * @param b
     * @param order
     * @returns {number|*}
     */
    sort(a, b, order = true) {
        if (a === null || a === undefined || a === '') return 1
        if (b === null || b === undefined || b === '') return -1
        return a > -Infinity && b > -Infinity ? (order ? a - b : b - a) : (order ? a.localeCompare(b) : b.localeCompare(a))
    },
    /**
     * 数组下面的对象排序
     * @param dataList
     * @param field
     * @param order
     * @returns {*[]}
     */
    sortData(dataList, field, order = true) {
        if (field === undefined) {
            for (const key in dataList[0]) {
                field = key
                break
            }
        }
        dataList.sort((a, b) => data.sort(a[field], b[field], order))
        return dataList
    },
    /**
     *
     * {
     * keyword:'', 搜索的关键字，如果是范围用逗号隔开
     * columns:[], 搜索的列 {field: '字段名', type: 'string'} type  string  time  date  number
     * data:[], //搜索的数据源
     * operator:'' % 模糊搜索   - 范围搜索  > 大于 < 小于 = 等于  >=大于等于 <=小于等于,
     * pinyin: true/false 启用拼首字母搜索，仅限 operator 为 %
     * }
     * @param opts
     * @returns {*}
     */
    search(opts) {
        let keyword = String(opts.keyword).trim().toUpperCase() //去掉空字符转换成大写
        if (keyword === '' || keyword === 'UNDEFINED') return opts.data
        keyword = keyword.split(',')
        const columns = opts.columns || []
        if (columns.length === 0) for (const key in opts.data[0]) columns.push({field: key, type: 'string'})
        opts.operator = opts.operator || '%'
        opts.pinyin = opts.pinyin || true
        return opts.data.filter(
            row => columns.some(({field, type}) => {
                    let text = String(row[field]).trim().toUpperCase()
                    if (opts.operator !== '%') {
                        //todo:有问题，年月日不精确
                        if (['time', 'date'].includes(type)) {
                            text = dayjs(text).valueOf()//时间转换成时间戳
                            keyword[0] = dayjs(keyword[0]).valueOf()//时间转换成时间戳
                            if (opts.operator === '-') keyword[1] = dayjs(keyword[1]).valueOf()
                        } else if (type === 'number') {
                            text = parseFloat(text)//数字转换成数字
                            keyword[0] = parseFloat(keyword[0])//数字转换成数字
                            if (opts.operator === '-') keyword[1] = parseFloat(keyword[1])//数字转换成数字
                        }
                    }
                    switch (opts.operator) {
                        case '%':
                            let zm = '';
                            if (opts.pinyin) {
                                pinyin(text, {toneType: 'none', type: 'array'}).forEach(pinyin => zm += pinyin[0].toUpperCase())
                                text = text + '_' + zm
                            }
                            for (const k of keyword) if (text.indexOf(k) > -1) return true
                            return false
                        case 'in':
                            for (const k of keyword) if (text.split(',').includes(k)) return true
                            return false
                        case '-':
                            return text >= Math.min(keyword[0], keyword[1]) && text <= Math.max(keyword[0], keyword[1])
                        case '>':
                            return text > keyword[0]
                        case '<':
                            return text < keyword[0]
                        case '=':
                            return text === keyword[0]
                        case '>=':
                            return text >= keyword[0]
                        case '<=':
                            return text <= keyword[0]
                    }
                }
            )
        )
    }
}

/**
 * 对日期的操作
 */
export const date = {
    /**
     * 时间获取
     * @type {{week(): *, d: string, list(): {month: {}, startMonth: {}, endMonth: {}}, time(): string}}
     */
    list() {
        let startMonth = {}
        let endMonth = {}
        let month = {}
        let format = 'YYYY-MM-DD HH:mm:ss'

        for (let i = 4; i >= 1; i--) {
            const monthName = dayjs().subtract(i, 'month').format('M月');
            startMonth[monthName] = date.datetimeFormat(dayjs().subtract(i, 'month').startOf('month').toDate(), format)
            endMonth[monthName] = date.datetimeFormat(dayjs().subtract(i, 'month').endOf('month').toDate(), format)
            month[monthName] = [startMonth[monthName], endMonth[monthName]]
        }
        startMonth = {
            '去年': date.datetimeFormat(dayjs().subtract(1, 'year').startOf('year').toDate(), format),
            ...startMonth,
            '本月': date.datetimeFormat(dayjs().startOf('month').toDate(), format),
            '7天内': date.datetimeFormat(dayjs().subtract(7, 'day').startOf('day').toDate(), format),
            '3天内': date.datetimeFormat(dayjs().subtract(3, 'day').startOf('day').toDate(), format),
            '昨天': dayjs().subtract(1, 'day').format('YYYY-MM-DD 08:00:00'),
            '今天': dayjs().format('YYYY-MM-DD 08:00:00'),
            '今年': date.datetimeFormat(dayjs().startOf('year').toDate(), format),
        }
        endMonth = {
            '去年': date.datetimeFormat(dayjs().subtract(1, 'year').endOf('year').toDate(), format),
            ...endMonth,
            '本月': dayjs().format('YYYY-MM-DD 23:59:59'),
            '7天内': date.datetimeFormat(dayjs().endOf('day').toDate(), format),
            '3天内': date.datetimeFormat(dayjs().endOf('day').toDate(), format),
            '昨天': dayjs().format('YYYY-MM-DD 07:59:59'),
            '今天': dayjs().add(1, 'day').format('YYYY-MM-DD 07:59:59'),
            '今年': date.datetimeFormat(dayjs().endOf('year').toDate(), format),
        }
        month = {
            '去年': [startMonth['去年'], endMonth['去年']],
            ...month,
            '本月': [startMonth['本月'], endMonth['本月']],
            '7天内': [startMonth['7天内'], endMonth['7天内']],
            '3天内': [startMonth['3天内'], endMonth['3天内']],
            '昨天': [startMonth['昨天'], endMonth['昨天']],
            '今天': [startMonth['今天'], endMonth['今天']],
            '今年': [startMonth['今年'], endMonth['今年']],
        }
        return {startMonth, endMonth, month}
    },
    d: dayjs().format('d'),
    time: (format = 'YYYY-MM-DD HH:mm:ss') => dayjs().format(format),
    YmdHis: (format = 'YYYY-MM-DD HH:mm:ss') => dayjs().format(format),
    yesterday: (format = 'YYYY-MM-DD') => dayjs().subtract(1, 'day').format(format),
    lastMonth: (format = 'YYYY-MM') => dayjs().subtract(1, 'month').format(format),
    Ymd: (format = 'YYYY-MM-DD') => dayjs().format(format),
    Ym: (format = 'YYYY-MM') => dayjs().format(format),
    week: () => ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.d],


    datetime: ({cellValue, formater}) => date.datetimeFormat(cellValue, formater),
    date: ({cellValue, formater}) => date.dateFormat(cellValue, formater),
    /**
     * 日期-时间 格式化
     * @param str
     * @param format
     * @returns {string|string}
     */
    datetimeFormat(str, format = 'YYYY-MM-DD HH:mm') {
        if (!isNaN(parseFloat(str)) && isFinite(str)) {
            str += 0
        }
        str = (typeof str == 'number' && str.toString().length === 10) ? str * 1000 : str
        return str ? dayjs(str).format(format) : ''
    },
    /**
     * 日期 格式化
     * @param str
     * @param format
     * @returns {string|string}
     */
    dateFormat(str, format = 'YYYY-MM-DD') {
        return date.datetimeFormat(str, format)
    },
    /**
     * 时间 格式化
     * @param str
     * @param format
     * @returns {string|string}
     */
    timeFormat(str, format = 'HH:mm:ss') {
        return date.datetimeFormat(str, format)
    },
    /**
     * 格式时间 （返回日期）
     * @returns {string} 年-月-日
     */
    formatterYMD({cellValue, formater = 'YYYY-MM-DD'}) {
        return date.datetimeFormat(cellValue, formater)
    },
    /**
     * 格式时间 （返回日期+时间） （不带秒）
     * @returns {string} 年-月-日 时-分
     */
    formatterYMDHm({cellValue, formater = 'YYYY-MM-DD HH:mm'}) {
        return date.datetimeFormat(cellValue, formater)
    },
    /**
     * 格式时间 （返回日期+时间）
     * @returns {string} 年-月-日 时-分-秒
     */
    formatterYMDHms({cellValue, formater = 'YYYY-MM-DD HH:mm:ss'}) {
        return date.datetimeFormat(cellValue, formater)
    },
}


/**
 * 对文件的操作
 */
export const files = {
    /**
     * 导出Excel
     * @param opts
     * columns[].disabledExport 禁用导出的列        columns[].fieldOptions 状态替换
     */
    exportExcel(opts) {
        opts = {
            ...{
                data: [],
                columns: [],
                fileName: Date.now(),
                sheetName: 'sheet1'
            },
            ...opts
        }
        opts.callback = opts.callback || function (opts) {
            opts.columns = opts.columns.filter(col => !col.disabledExport && !col.hide && col.cellType !== 'checkbox')
            const rows = [opts.columns.map(col => col.title)]// 添加表头
            //添加行数据
            opts.data.forEach(item => {
                const row = []
                opts.columns.forEach(col => row.push(col?.fieldOptions?.[item[col.field]] || item[col.field]))
                rows.push(row)
            })
            return rows
        }
        const excel = new Exceljs.Workbook() //创建Excel
        const sheet = excel.addWorksheet(opts.sheetName) // 添加工作表
        sheet.addRows(opts.callback(opts))
        // 导出Excel文件
        excel.xlsx.writeBuffer().then(data => {
            const blob = new Blob([data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
            })
            FileSaver(blob, `${opts.fileName}.xlsx`)
        })
    },
    downloadFile(url) {
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', '') // 设置下载属性
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}


export const query = {
    /**
     * 获取参数
     * @param name {string|{string}|null} 参数名 {string} :单个获取 [array] 多个获取 null 获取全部
     * @param type {string|null} 参数类型，默认取search
     * @param url {string|null} URL(默认当前的访问地址)
     * @returns {string|Object}
     */
    get: (name = null, type = 'search', url = null) => {
        url = new URL(url || window.location.href)
        const urlParams = type === 'search' ? Object.fromEntries(url.searchParams.entries()) : url[type]
        const params = query._default(urlParams, type)
        if (Array.isArray(name)) return Object.fromEntries(Object.entries(params).filter(([key]) => name.includes(key)))
        return name ? params?.[name] : params
    },
    /**
     * 设置URL参数
     * @param name {string} 参数名
     * @param value {string} 参数值
     * @param type  {string|null} 参数类型，默认取search
     * @param url {string|null} URL(默认当前的访问地址)
     */
    set: (name, value, type = 'search', url = null) => {
        let urlObj = new URL(url ? url : window.location.href)
        let urlParams = new URLSearchParams(urlObj[type])
        if (value === null || value === undefined) {
            urlParams.delete(name)
        } else {
            urlParams.set(name, value)
        }
        urlObj[type] = urlParams.toString()
        history.pushState({}, '', urlObj)
    },
    _default: (params = {}, type = 'search') => {
        if (type !== 'search') return params //暂时只有search需要默认值
        return {
            ...query.cache(null, null, type),
            ...params,
        }
    },
    cache: (name = null, value = null, type = 'search') => {
        const params = JSON.parse(localStorage.getItem('query_cache') || '{}')
        if (typeof name === undefined || name === null) {
            return params[type]
        }
        if (typeof value === undefined || value === null) {
            return params[type]?.[name]
        }
        query.set(name, value, type)
        typeof params[type] === 'undefined' && (params[type] = {})
        params[type][name] = value
        return localStorage.setItem('query_cache', JSON.stringify(params))
    },
    toString: (param = {}, withHash = true) => {
        const params = query.get(null, 'search')
        const hash = query.get(null, 'hash')
        const queryString = new URLSearchParams({...params, ...param}).toString()
        return withHash ? queryString + hash : queryString
    },
}

/**
 * 获取对象中的部分属性
 * @param object 源对象
 * @param keys 属性
 * @returns {{}}
 */
export function pick(object, keys) {
    const result = {};
    if (typeof keys === 'string' && keys.length > 0) {
        if (!keys.includes(',')) {
            return object?.[keys];
        }
        keys = keys.split(',')
    }
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            result[key] = object[key];
        }
    }
    return result;
}

/**
 * 获取默认的工厂ID
 * @param plantId
 * @returns {*|number}
 */
export const getDefaultPlantId = (plantId) => {
    return siyi.user.plantId || plantId || 1;
}

/**
 * 获取默认的部门ID
 * @param deptId
 * @returns {*}
 */
export const getDefaultDeptId = (deptId) => {
    return siyi.user.assignment?.[0]?.['dept_id'] || deptId;
}