import {h, render} from 'vue';
import dialogComponent from '@/core/component/dialog.vue';


const dialog = (opts = {}) => {
    const container = document.createElement('div');//创建一个容器
    document.body.appendChild(container);//添加到body中
    const vnode = h(dialogComponent, {
        ...opts, createType: 'js',
        onAfterClose: res => {
            typeof opts.onAfterClose === 'function' && opts.onAfterClose(res);//关闭后执行
            render(null, container);//移除
        },
    });
    render(vnode, container);//渲染
    document.body.removeChild(container);//移除
    return vnode.component.exposed;
};


const confirmAsync = async (content, title = '请确认', opts = {}) => {
    return new Promise(resolve => dialog({
        title, content,
        onOk: () => resolve(true),
        onNo: () => resolve(false),
        onOther: () => resolve(null),
        ...opts, type: 'confirm',
    }));
};

const inputAsync = async (value = '', title = '请输入', opts = {}) => {
    return new Promise(resolve => dialog({
        title, value,
        onOk: obj => resolve(obj.action === 'ok' ? obj.value : null),
        onNo: () => resolve(false),
        onOther: () => resolve(null),
        ...opts, type: 'input',
    }));
};


const selectAsync = async (options, value, title = '请选择', opts = {},selectOpts={}) => {
    const getResult = opts?.getResult || function (obj) {
        return obj.value;
    }
    return new Promise(resolve => dialog({
        title, value, select: {'options': options, ...selectOpts},
        onOk: obj => resolve(obj.action === 'ok' ? getResult(obj) : null),
        onNo: () => resolve(false),
        onOther: () => resolve(null),
        ...opts, type: 'select',
    }));
};

const treeSelectAsync = async (tree, value, title = '请选择', opts = {},treeOpts={}) => {
    const getResult = opts?.getResult || function (obj) {
        return obj.value;
    }
    return new Promise(resolve => dialog({
        title, value, select: {data:tree, ...treeOpts,options:[],isTree:true},
        onOk: obj => resolve(obj.action === 'ok' ? getResult(obj) : null),
        onNo: () => resolve(false),
        onOther: () => resolve(null),
        width: '400px',
        height: '200px',
        ...opts, type: 'select',
    }));
};



export default {
    window: (content, contentProps, opts = {}) => dialog({content, contentProps, ...opts, type: 'window'}),
    info: (content, duration, opts = {}) => dialog({content, duration, ...opts, type: 'info'}),
    success: (content, duration, opts = {}) => dialog({content, duration, ...opts, type: 'success'}),
    warning: (content, duration, opts = {}) => dialog({content, duration, ...opts, type: 'warning'}),
    error: (content, duration, opts = {}) => dialog({content, duration, ...opts, type: 'error'}),
    question: (content, duration, opts = {}) => dialog({content, duration, ...opts, type: 'question'}),
    loading: (container, content, opts = {}) => dialog({content, container, ...opts, type: 'loading'}),
    confirm: (content, onOk, onNo, onOther, container) => {
        const opts = typeof content === 'object' ? content : {content, onOk, onNo, onOther, container};
        opts.type = 'confirm';
        return dialog(opts);
    },
    input: (value, okCallback = () => '', title, opts = {}) => dialog({
        title, value,
        onOk: obj => okCallback(obj.action === 'ok' ? obj.value : null, obj),
        ...opts, type: 'input',
    }),
    select: (options, value, okCallback = () => '', title = '请选择', opts = {}) => dialog({
        title, value, select: {'options': options},
        onOk: obj => okCallback(obj.action === 'ok' ? obj.value : null, obj),
        ...opts, type: 'select',
    }),
    confirmAsync, inputAsync, selectAsync,treeSelectAsync
};


/**
 * 新窗口打开（兼容window.open）
 * @param url 链接
 * @param target  标签页名称 默认_blank, _self, _parent, _top
 * @param features 窗口参数
 * @param width 宽度
 * @param height 高度
 * @param title 标题
 * @returns {WindowProxy}
 */

export function openWindow(url, target = '', features = '', width = 0, height = 0, title = '') {
    if (width && height) {
        // 获取系统屏幕信息
        const screenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        const screenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

        // 获取浏览器窗口尺寸
        const windowInnerWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
        const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;
        // 计算中心位置
        const left = screenLeft + (windowInnerWidth - width) / 2;
        const top = screenTop + (windowInnerHeight - height) / 2;
        // 防止超出屏幕边界
        const finalLeft = Math.max(left, 0);
        const finalTop = Math.max(top, 0);
        features += `,width=${width},height=${height},top=${finalTop},left=${finalLeft}`;
    }
    if (target !== '_blank') {
        features += `,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;
    }
    const newWindow = window.open(url, target, features);
    // 聚焦窗口
    if (newWindow && newWindow.focus) {
        newWindow.focus();
    }
    title && (newWindow.document.title = title);
    return newWindow;
}