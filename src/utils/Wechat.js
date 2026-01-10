import * as ww from '@wecom/jssdk'
import * as api from '@/core/script/api.js'
import siyi from "@/core/script/siyi.js";
const corpId='ww55ce28bd9f65e158';
const agentId='1000011';


export const useWechat = (jsApiList) => {
    ww.register({
        corpId,
        agentId,
        getConfigSignature: api.getWxConfig,
        getAgentConfigSignature: (url) => api.getWxConfig(url, 1),
        jsApiList: ['scanQRCode', 'openLocation', 'getLocation', ...(jsApiList || [])],
        onConfigFail: (e) => {
            console.log('wx config fail', e)
        }, onAgentConfigFail: (e) => {
            console.log('wx agent config fail', e)
        },
    })
}

export const scanQRCode = () => {
    if (!siyi.wechat) return Promise.resolve('');
    return new Promise((resolve, reject) => {
        ww.scanQRCode({
            needResult: 1, // 1 表示直接返回结果
            scanType: ['qrCode', 'barCode'],
            success(res) {
                resolve(res.resultStr || '');
            },
            fail(err_msg) {
                console.log('scanQRCode fail',err_msg)
                resolve('');
            }
        });
    });
};

export const getLocation = async (gpsType='gcj02') => {
    if (!siyi.wechat) return Promise.resolve('');
    return new Promise((resolve, reject) => {
        ww.getLocation({
            type: gpsType,
            success(res) {
                resolve(res.latitude + ',' + res.longitude);
            },
            fail(err) {
                console.log('getLocation fail',err)
                resolve('');
            }
        });
    });
}


export const openLocation = (latitude, longitude,opts) => {
    if (!siyi.wechat) return Promise.resolve('');
    return new Promise((resolve, reject) => {
        ww.openLocation({
            latitude,
            longitude,
            scale: 18,
            ...opts,
            success(res) {
                resolve(res);
            },
            fail(err) {
                console.log('openLocation fail',err)
                resolve(null);
            }
        });
    });
}


export const pcLogin = (el,redirect_type,onSuccess,onError,redirect_uri, args={}) => {
    // 初始化登录组件
    ww.createWWLoginPanel({
        el: el || 'body',
        params: {
            login_type: 'CorpApp',
            appid: corpId,
            agentid: agentId,
            redirect_uri: redirect_uri || window.location.href,
            state: agentId,
            redirect_type: redirect_type || 'top',
            ...args,
        },
        onCheckWeComLogin({isWeComLogin}) {
            console.log('onCheckWeComLogin',isWeComLogin)
        },
        onLoginSuccess({code}) {
            onSuccess && onSuccess(code,agentId);
        },
        onLoginFail(err) {
            console.log('onLoginFail',err)
            onError && onError(err);
        },
    });
}

export { ww };