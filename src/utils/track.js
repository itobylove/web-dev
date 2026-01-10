//获取页面加载信息
import {getClientIP} from "../core/script/api.js";

// 监听常见的用户操作
const userActions = [
    'click',
    'dblclick',
    'contextmenu',
    'dragstart',
    'drag',
    'dragend',
    'drop',
    'mousedown',
    'mouseup',
    'keydown',
    'keyup',
    'input',
    'change',
    'submit',
    'touchstart',
    'touchend'
];

// 记录用户操作的函数
const recordUserAction=(event)=>{
    window.lastUserAction = {
        type: event.type,
        target: {
            tagName: event.target.tagName,
            id: event.target.id,
            className: event.target.className,
            textContent: event.target.textContent?.trim()
        },
        snapshot:undefined
    };

    // 对于拖拽事件，记录额外信息
    if (event.type.startsWith('drag')) {
        window.lastUserAction.dragData = {
            x: event.clientX,
            y: event.clientY,
            dataTransfer: event.dataTransfer?.types || []
        };
    }

    // 处理 Canvas 相关事件
    if (event.target instanceof HTMLCanvasElement) {
        window.lastUserAction.snapshot = captureCanvasSnapshot(
            event.target,
            event.offsetX,
            event.offsetY
        );
    }
}


// Canvas 截图
const captureCanvasSnapshot = (canvas, x, y, radius = 200) => {
    const ctx = canvas.getContext('2d');

    // 计算截取区域的边界，确保不超出画布范围
    const centerX = Math.max(radius, Math.min(x, canvas.width - radius));
    const centerY = Math.max(radius, Math.min(y, canvas.height - radius));

    if (x < radius || x > canvas.width - radius || y < radius || y > canvas.height - radius){
        return;
    }

    // 获取以点击位置为中心，半径为200像素的圆形区域的图像数据
    const imageData = ctx.getImageData(
        parseInt(centerX - radius),  // 左上角X坐标
        parseInt(centerY - radius),  // 左上角Y坐标
        parseInt(radius) * 2,  // 宽度
        parseInt(radius) * 2   // 高度
    );

    // 创建一个新的canvas来存储截取的区域
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = radius * 2;
    tempCanvas.height = radius * 2;
    const tempCtx = tempCanvas.getContext('2d');

    // 将图像数据绘制到临时canvas
    tempCtx.putImageData(imageData, 0, 0);

    // 创建圆形裁剪路径
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.beginPath();
    tempCtx.arc(radius, radius, radius, 0, Math.PI * 2);
    tempCtx.fill();

    return {
        dataUrl: tempCanvas.toDataURL(),
        x: centerX,
        y: centerY,
        radius: radius
    };
};

const getPerformanceData = () => {
    const timing = performance.timing;
    // 页面加载时长
    const performanceTiming = {
        //加载完成的时间点
        finishAt:dateToLocalString(new Date(window.performance.timing.loadEventEnd)),
        // 页面加载总时长
        totalLoadTime: timing.loadEventEnd - timing.navigationStart,
        // DNS 查询时间
        dnsLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
        // TCP 连接时间
        tcpConnectionTime: timing.connectEnd - timing.connectStart,
        // 服务器响应时间（从请求到首字节接收）
        serverResponseTime: timing.responseStart - timing.requestStart,
        // 内容加载时间（从首字节到完成）
        contentLoadTime: timing.responseEnd - timing.responseStart,
        // DOM 解析时间
        domParsingTime: timing.domComplete - timing.domInteractive,
        // DOMContentLoaded 事件时间
        domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
    };

    // 资源加载信息
  /*  const resourceInfo = performance.getEntries().filter(entry => ['xmlhttprequest','fetch'].includes(entry.initiatorType)).map(entry => ({
        name: entry.name,
        type: entry.initiatorType,
        startTime: entry.startTime,
        duration: entry.duration,
        size: entry.transferSize || 0,
    }));*/

    // 导航信息
    const navigationInfo = {
        type: performance.navigation.type,
        redirectCount: performance.navigation.redirectCount,
    };

    return {
        navigation: navigationInfo,
        timing: performanceTiming,
        // resources: resourceInfo,
    };
}



// 获取环境信息
const getEnvData = async () => {
    return {
        'name':window?.envName || 'dev',
        'version':window?.APP_VERSION,
        'time': dateToLocalString(),
        'url': window.location.href,
        'ip':await getClientIP(),
        'browser': {
            finger:window?.fingerprint || '',
            userAgent: navigator.userAgent,  // 浏览器的 userAgent 字符串
            screen:window.screen.width+"x" +window.screen.height, // 屏幕宽度/高度
            window:window.innerWidth+"x"+window.innerHeight,// 当前窗口的宽度/高度
            pixelRatio: window.devicePixelRatio,  // 屏幕的设备像素比
            onlineStatus: navigator.onLine ? 'Online' : 'Offline',  // 当前是否在线
        },
        'performance': getPerformanceData(),
        'userAction':window?.lastUserAction,
    }
};

//上报信息
export const sendTrack = async (data, type = 'error') => {

    const env=await getEnvData();
    fetch('/api/v1/common-api/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key':sessionStorage.getItem('x-api-key'),
        },
        body: JSON.stringify({type, data, env}),
    }).then(response => response.json()).then(data => console.log('Error reported:', data)).catch(error => console.error('Error reporting failed:', error));
}

export const logTrack = (action,data={},title = '日志上报') => {
    sendTrack({
        title,action,data
    }, 'log').then(r => {
    });
}

export function errorTrack(app) {
    const formatTrack = (str) => {
        return typeof str==='string'?str.split("\n").map(item => item.trim()):str;
    }

    //记录上次操作
    // userActions.forEach(action => document.addEventListener(action, recordUserAction, true));

    // Vue 错误处理
    app.config.errorHandler = (err, instance, info) => {
        console.error('Vue error:', err);
        sendTrack({
            message: err.message, stack: formatTrack(err.stack), component: instance?.$options.name, info
        }, 'Vue error').then(r => {});
    };

    // Vue 警告处理
    app.config.warnHandler = (msg, instance, trace) => {
        console.warn('Vue warning:', msg);
        sendTrack({ message: msg, component: instance?.$options.name, trace:formatTrack(trace) },'warn').then(r => {});
    };

    // 全局 JavaScript 错误
    window.addEventListener('error', (event) => {
        console.error('Global error:', event);
        sendTrack({
            message: event.message, stack: formatTrack(event.error?.stack), filename: event.filename
        }, 'Global error').then(r => {});
    });

    // 未捕获的 Promise 异常
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise rejection:', event.reason);
        sendTrack({message: event.reason?.message, stack: formatTrack(event.reason?.stack)}, 'Unhandled Promise rejection').then(r => {});
    });

    // 资源加载失败
    window.addEventListener('error', (event) => {
        if (event.target instanceof HTMLElement) {
            console.error('Resource load error:', event.target);
            sendTrack({type: 'resource', source: event.target.src || event.target.href}, 'resource error').then(r => {});
        }
    }, true);


}

const dateToLocalString=(date)=>{
    typeof date==='undefined' && (date=new Date())
    const options = { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return  date.toLocaleString('zh-CN', options);
}





