/**
 * 增强的本地存储类
 */
class LocalStorage {
    constructor(prefix = '') {
        this.prefix = prefix;
    }

    set(key, data, expire = 0) {
        const item = {
            data,
            expire: expire ? Date.now() + expire * 1000 : 0
        };

        try {
            localStorage.setItem(
                this.prefix + key,
                JSON.stringify(item)
            );
            return true;
        } catch (e) {
            console.warn('LocalStorage 存储失败:', e);
            return false;
        }
    }

    get(key, def = null) {
        const item = localStorage.getItem(this.prefix + key);

        if (!item) return def;

        try {
            const { data, expire } = JSON.parse(item);

            // 检查是否过期
            if (expire && expire < Date.now()) {
                this.remove(key);
                return def;
            }

            return data;
        } catch (e) {
            return def;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
}

/**
 * 浏览器指纹生成器
 */
class BrowserFinger {
    constructor(options = {}) {
        this.options = {
            enableCache: true,
            cacheExpiry: 30 * 60, // 30分钟（秒）
            useLocalStorage: true,
            ...options
        };
    }

    /**
     * 获取浏览器指纹
     */
    async getFingerprint(forceRefresh = false) {
        try {
            // 检查缓存
            if (!forceRefresh) {
                const cached = this._getFromCache();
                if (cached) return cached;
            }

            // 收集浏览器特征
            const components = {
                // 基本信息
                basic: {
                    ua: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform,
                    cores: navigator.hardwareConcurrency || '',
                    memory: navigator.deviceMemory || '',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    touch: navigator.maxTouchPoints
                },

                // 屏幕信息
                screen: {
                    width: screen.width,
                    height: screen.height,
                    depth: screen.colorDepth
                },

                // Canvas 指纹
                canvas: this._getCanvasFingerprint(),

                // WebGL 信息
                webgl: this._getWebGLInfo(),

                // 已安装插件
                plugins: this._getPlugins()
            };

            // 生成指纹
            const fingerprint = await this._generateHash(components);

            // 保存到缓存
            this._saveToCache(fingerprint);

            return fingerprint;
        } catch (error) {
            console.error('Fingerprint generation failed:', error);
            return null;
        }
    }

    /**
     * 生成 Canvas 指纹
     */
    _getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = 200;
            canvas.height = 50;

            // 绘制文本
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#1a73e8';
            ctx.fillText('Browser Fingerprint', 2, 15);

            return canvas.toDataURL();
        } catch {
            return null;
        }
    }

    /**
     * 获取 WebGL 信息
     */
    _getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');

            if (!gl) return null;

            return {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER)
            };
        } catch {
            return null;
        }
    }

    /**
     * 获取已安装的插件信息
     */
    _getPlugins() {
        try {
            return Array.from(navigator.plugins)
            .map(p => p.name)
            .sort();
        } catch {
            return [];
        }
    }

    /**
     * 生成哈希值
     */
    async _generateHash(data) {
        const text = JSON.stringify(data);
        const msgBuffer = new TextEncoder().encode(text);
        if (!crypto?.subtle?.digest) {
            console.warn('当前浏览器不支持 crypto.subtle.digest，无法生成指纹');
            return null;
        }
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 从缓存获取指纹
     */
    _getFromCache() {
        if (!this.options.useLocalStorage) return null;

        try {
            const stored = localStorage.getItem('browser_fingerprint');
            if (!stored) return null;

            const { fingerprint, expire } = JSON.parse(stored);

            // 检查是否过期
            if (expire && expire < Date.now()) {
                this._removeFromStorage();
                return null;
            }

            return fingerprint;
        } catch {
            return null;
        }
    }

    /**
     * 保存指纹到缓存
     */
    _saveToCache(fingerprint) {
        if (!this.options.useLocalStorage) return;

        try {
            const data = {
                fingerprint,
                expire: this.options.cacheExpiry ?
                    Date.now() + (this.options.cacheExpiry * 1000) : 0
            };

            localStorage.setItem(
                'browser_fingerprint',
                JSON.stringify(data)
            );
        } catch (e) {
            console.warn('Cache save failed:', e);
        }
    }

    /**
     * 清除缓存
     */
    clearCache() {
        if (this.options.useLocalStorage) {
            localStorage.removeItem('browser_fingerprint');
        }
    }
}

// 导出
export default new BrowserFinger();
export { BrowserFinger };