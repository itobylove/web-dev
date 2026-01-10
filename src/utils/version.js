// 用户空闲时间检测
import dialog from "@/core/script/dialog.js";
import siyi from "@/core/script/siyi.js";

let idleTime = 0; // 计时时间
let errTimes = 0;  // 错误次数
let isRunning = true; //定时间是否在运行
const idleLimit = 30 * 1000; // 30秒检测一次

// 监听用户活动,重置检测时间
document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keydown', resetIdleTimer);
document.addEventListener('scroll', resetIdleTimer);

const timer = setInterval(async () => {
    if (!isRunning) return;
    idleTime += 1000;  // 每秒增加 1000 毫秒
    if (idleTime >= idleLimit) {
        resetIdleTimer();
        if (!await checkVersion()) {
            errTimes++;
        }
    }
    if (errTimes > 3) {
        console.log('获取版本已失败，不再重试');
        clearInterval(timer);
    }
}, 1000);

// 检查版本的函数
async function checkVersion() {
    const currentVersion = window?.APP_VERSION;
    console.log('当前版本:', currentVersion);
    try {
        const data = JSON.parse(await (await fetch('/version.js?t=' + new Date().getTime())).text());
        const latestVersion = data.version;
        // 如果当前版本未定义，初始化并返回
        if (currentVersion === undefined) {
            window.APP_VERSION = latestVersion;
            return;
        }
        // 如果版本不一致，
        if (currentVersion !== latestVersion) {
            isRunning = false;//暂停计时器
            const isConfirm = siyi.navHide ||  (await dialog.confirmAsync('有新版本发布，是否更新?')); // 全屏下直接更新，否则弹窗确认
            isConfirm && window.location.reload();
            isRunning = true;
        }
        return latestVersion;
    } catch (e) {
        console.log('e',e);
        return null;
    }
}

// 重置空闲计时器
function resetIdleTimer() {
    idleTime = 0;  // 重置空闲时间
}


