import {ref, shallowRef, defineAsyncComponent as reg} from 'vue';
import loadingComponent from '@/core/component/loadingComponent.vue';
import errorComponent from '@/core/component/errorComponent.vue';
import {isLogin} from '@/core/script/user.js';
import siyi from '@/core/script/siyi.js';

const mainComponents = {
    //工作台
    workbench: {
        name: 'workbench', isLogin: false, isStorage: false,
        component: reg({loader: () => import('@/core/component/workbench.vue'), loadingComponent, errorComponent})
    },
    //登录
    login: {
        name: 'login', isLogin: true, isStorage: true,
        component: reg({loader: () => import('@/core/component/login.vue'), loadingComponent, errorComponent})
    },
    //系统
    index: {
        name: 'index', isLogin: true, isStorage: true,
        component: reg({loader: () => import('@/core/component/index.vue'), loadingComponent, errorComponent})
    },
    //单页
    page: {
        name: 'page', isLogin: false, isStorage: true,
        component: reg({loader: () => import('@/core/component/page.vue'), loadingComponent, errorComponent})
    },
}


export const key = ref('');
export const component = shallowRef();
//组件切换
export const to = async opts => {
    opts = typeof opts === 'string' ? {name: opts} : opts; //转换为对象
    opts = {...mainComponents[opts.name], ...opts}; //合并对象
    //如果进登录界面存在token值就直接进入系统主页
    if (opts.name === 'login' && opts.isStorage && sessionStorage.getItem('x-api-key')) {
        const hash = new URL(window.location.href).hash;
        window.location.href = '?device=' + siyi.device + (hash !== '#login' ? hash : '#home');
    }
    if (opts.isLogin === true && await isLogin() === false) {
        opts = mainComponents['login']; //检测登录
    }
    component.value = opts.component; //切换组件
    key.value = opts.name;
}