export const checkBrowser=()=>{
    return new Promise((resolve, reject) => {
        const userAgent = navigator.userAgent.toLowerCase();
        let isCompatible = true;

        // 浏览器规则配置（支持 2023 年 1 月及以后的版本）
        const browserRules = [
            // Chrome 浏览器
            { name: 'chrome', versionKey: 'chrome', minVersion: 109, exclude: ['edge'] },
            // Firefox 浏览器
            { name: 'firefox', versionKey: 'firefox', minVersion: 108 },
            // Safari 浏览器
            { name: 'safari', versionKey: 'version', minVersion: 16.3, exclude: ['chrome'] },
            // Opera 浏览器
            { name: 'opera', versionKey: 'opera', minVersion: 100 },
            // Edge 浏览器
            { name: 'edge', versionKey: 'edge', minVersion: 109 },
            // QQ 浏览器
            { name: 'qq', versionKey: 'tencenttraveler', minVersion: 12, match: ['compatible'] },
            // 360 安全浏览器
            { name: '360', versionKey: '360', minVersion: 12, match: ['compatible'] },
            // IE 浏览器
            { name: 'ie', versionKey: 'rv', minVersion: 11, match: ['trident'], unsupported: true },
            // 基于 WebKit 的浏览器（如老版本的 Safari, UC 浏览器等）
            { name: 'webkit', versionKey: 'version', minVersion: 537.36, exclude: ['chrome', 'safari'], unsupported: true },
        ];

        // 获取浏览器版本号的通用函数
        function getVersion(versionKey) {
            const match = userAgent.match(new RegExp(`${versionKey}/([\\d.]+)`));
            return match ? parseFloat(match[1]) : 0;
        }

        // 检测函数
        browserRules.forEach((rule) => {
            if (rule.unsupported) {
                // 如果浏览器明确标记为不支持，直接标记为不兼容
                if (rule.match && rule.match.every((str) => userAgent.includes(str))) {
                    isCompatible = false;
                }
                return;
            }

            if (rule.match && !rule.match.every((str) => userAgent.includes(str))) return;
            if (rule.exclude && rule.exclude.some((str) => userAgent.includes(str))) return;

            if (userAgent.includes(rule.name)) {
                const version = getVersion(rule.versionKey);
                if (version < rule.minVersion) {
                    isCompatible = false;
                }
            }
        });

        // 根据兼容性结果返回 Promise 状态
        if (isCompatible) {
            resolve('浏览器兼容，可以继续访问。');
        } else {
            reject('浏览器版本太低，请升级浏览器。');
        }
    });
}
