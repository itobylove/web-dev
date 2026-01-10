/**
 *  1、此文件为入口启动文件
 *  2、我们使用的是ES6模块化开发，并且主要使用VUE3+字节跳动的visactor+腾讯的TDesign组件库
 *  3、在前端开发中，请一定非常要注意import引入模块的顺序，因为模块高度依赖，有的模块中写的代码是引入的时候直接执行，有的是暴露的方法调用才执行，所有加载顺序很关键
 *  4、siyi为全局对象，用于公用数据保存，将贯穿正个项目所有模块，必须在第一个引入不可以改变顺序
 *  5、ES6的特性：所有模块只会在第一次引入的时候会执行立即执行的代码，后面在其它依赖模块多次引入也不会在次执行
 *  6、如果是在html页面通过script标签引入，则会重复执行，开发时需要注意
 *  7、一个网站只允许创建一个应用，非必要情况不创建多个应用，创建多个应用会增加内存开销
 */
import siyi from '@/core/script/siyi.js';
import {createApp} from 'vue';
import appComponent from '@/core/component/app.vue';
import * as load from '@/core/script/load.js';

import {errorTrack} from '@/utils/track.js';
import fingerprint from '@/utils/BrowserFinger.js';

(async () => {
    const app = createApp(appComponent);
    // import message from '@/utils/message.js'
    // app.config.globalProperties.$message = message  //注册全局组件方法
    await load.all(app);
    app.mount('body');

    window.fingerprint = await fingerprint.getFingerprint(); //获取浏览器指纹
    if (siyi.env === 'prod') {
        errorTrack(app); //检测错误
        await import('@/utils/version.js'); //自动版本更新
    }
})();