import {createApp} from 'vue';
import LoadingComponent from './loading.vue';

let loadingInstance;

const LoadingService = {
    open: (message = '加载中...', dom) => {
        const isShow = loadingInstance?.$el ? window.getComputedStyle(loadingInstance.$el).visibility === 'visible' : false;
        if (!isShow) {
            const loadingDom = dom === undefined ? document.body : dom;
            const loadingApp = createApp(LoadingComponent);
            const mountNode = document.createElement('div');
            loadingDom.appendChild(mountNode);
            loadingInstance = loadingApp.mount(mountNode);
        }
        loadingInstance.open(message);
    },
    close: () => {
        if (loadingInstance) {
            loadingInstance.close();
        }
    },
    update:(message)=>{
        loadingInstance.update(message)
    },
    hide: () => LoadingService.close(),
    show: (message, dom) => LoadingService.open(message, dom),
};
export default LoadingService;
