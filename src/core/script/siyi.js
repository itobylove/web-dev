import {reactive} from 'vue';
import {HOST, USER_INFO} from '@/core/config/const.js';

const isMobile = () => /Android|iPhone/i.test(navigator.userAgent) || window.innerWidth <= 768;//判断是否移动端
const path = window.location.pathname; //路径
const url = new URL(window.location.href); //获取URL参数
const params = Object.fromEntries(url.searchParams.entries()); //获取Query参数
const env = url.host === HOST ? 'prod' : 'dev'; //环境
const device = params?.device?.length ? parseInt(params.device) : isMobile() ? 0 : 1;//设备
const deviceName = device === 1 ? 'pc' : 'mobile'; //设备名称
const pc = device === 1; //PC端
const mobile = !pc; //移动端
const wechat = /wxwork/i.test(navigator.userAgent); //企业微信
const weixin = !wechat && /micromessenger/.test(navigator.userAgent.toLowerCase()); //微信浏览器
const time = Date.now(); //时间戳
if (path === '/' && ((time - (parseInt(params.time) || 0)) > 1000)) {
    params.time = time;
    const href = new URLSearchParams(params).toString();//生成参数字符串
    window.location.href = (href ? `?${href}` : '') + (url.hash || (wechat ? '#home' : '#workbench')); //跳转
}
//禁止input类型为number时滚轮默认行为改变数字
document.addEventListener('wheel', e => e.target.type === 'number' && e.preventDefault(), {passive: false});
export default reactive({
    version: '0.1.0',
    name: 'siyi',
    env,
    isDev: env === 'dev',
    device,
    deviceName,
    pc,
    mobile,
    isMobile,
    wechat,
    weixin,
    user: USER_INFO, //用户信息
    nav: {}, //当前活动导航
    navHide: false, //隐藏左侧导航
    from: {}, //上一次的导航
});
