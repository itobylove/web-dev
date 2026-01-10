import _ from 'lodash'
import * as core from '@/core/script/core.js'
import * as app from '@/core/script/app.js'
import * as api from '@/core/script/api.js'
import siyi from '@/core/script/siyi.js'
import avatar_0 from '@/core/assets/img/avatar_0.jpg'
import avatar_1 from '@/core/assets/img/avatar_1.jpg'
import avatar_null from '@/core/assets/img/avatar_null.jpg'
import dialog from '@/core/script/dialog.js'
import {USER_INFO} from "@/core/config/const.js";


//头像
const avatar = {
    avatar_0,    //女
    avatar_1,    //男
    avatar_null, //求真像
}

/**
 * 检测是否有登录
 * @returns {Promise<boolean>}
 */
export const isLogin = async (autoLogin = true,param) => {
    //考虑企业微信
    const query = param || core.query.get();
    const isWxLogin=query?.code && query?.state;
    const res = await api.http.get(isWxLogin ? api.url.user.loginWx : api.url.user.info, {params: query})
    //清空URL中的参数
    if (query?.code && query?.state) {
        core.query.set('code')
        core.query.set('state')
        core.query.set('appid')
    }
    //成功
    if (res.data.code === 20000) {
        siyi.user = _.merge({}, USER_INFO, res.data.data)//合并用户信息
        siyi.user.avatar = siyi.user.avatar || avatar['avatar_' + (typeof siyi.user.gender==='number'?siyi.user.gender:'null')]//处理头像
        core.deepFreeze(siyi.user, 'view.theme') //冻结user对象属性，但允许修改view的theme
        return true
    }
    if (siyi.wechat && autoLogin && siyi.env === 'prod') {
        dialog.loading(undefined, '企业微信登录中···');
        await wxJumpLogin();
    }
    return false
}


export const login = async (username, password, client_info) => {
    const res = await api.http.post(api.url.user.login, {username, password, client_info})
    return res.data.code === 20000 ? true : res.data.message
}

export function getWxLoginUrl(agentid, redirect_uri) {
    redirect_uri = redirect_uri || window.location.href;
    return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww55ce28bd9f65e158&response_type=code&scope=snsapi_privateinfo&redirect_uri=' + encodeURIComponent(redirect_uri) + '&state=' + agentid + '&agentid=' + agentid + '#wechat_redirect'
}

export function getWeixinLoginUrl(scope,redirect_uri) {
    redirect_uri = redirect_uri || window.location.href;
    return 'http://www.ltepcb.com/oauth.html?scope='+(scope || 'snsapi_userinfo')+'&redirect_uri=' + encodeURIComponent(redirect_uri) + '#wechat_redirect'
}

/**
 * 跳转的微信登录页面
 * @param url
 * @returns {Promise<void>}
 */
export const wxJumpLogin = async (url) => {
    location.href = getWxLoginUrl('1000011', url)
}

/**
 * 微信服务号登录
 * @param scope
 * @param redirect_uri
 * @returns {Promise<void>}
 */
export const weixinJumpLogin = async (scope,redirect_uri) => {
    location.href = getWeixinLoginUrl(scope,redirect_uri)
}


/**
 * 用户退出登录
 * @param target
 * @returns {Promise<void>}
 */
export const logout = async (target = false) => {
    sessionStorage.getItem('x-api-key') && await api.http.get(api.url.user.logout);
    sessionStorage.removeItem('x-api-key');
    sessionStorage.removeItem('x-api-time');
    if(target){
        window.location.href = '?' + core.query.toString({time: 0});
    }else{
        await app.to({name: 'login', isLogin: false, isStorage: false});
    }
}

/**
 * 心跳检测
 * @returns {Promise<*>}
 */
export const heartbeat = async (checkLogin=true) => {
    const  {uid, command,msg} = await api.apiFetch(api.url.common.heartbeat)
    if (checkLogin && typeof uid != 'number') {
        await logout()
    }
    if (msg?.type && msg?.content) {
        dialog[msg?.type](msg?.content,...Object.values(msg.opts));
    }
    if (typeof command==='string') {
        command === 'refresh' && window.location.reload(); //强制刷新页面
    }
    return uid;
}
