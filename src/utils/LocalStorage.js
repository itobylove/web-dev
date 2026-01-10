/**
 * 增强的 LocalStorage 管理类
 */
class LocalStorage {
    static version = '1.0.0';

    constructor(prefix = '', options = {}) {
        this.prefix = prefix;
        this.options = {
            serialize: true,      // 是否序列化数据
            compression: false,   // 是否压缩数据
            encrypt: false,       // 是否加密数据
            events: true,        // 是否触发事件
            ...options
        };

        // 存储事件监听器
        this.listeners = new Set();

        // 初始化
        this._init();
    }

    /**
     * 初始化
     */
    _init() {
        // 清理过期数据
        this.clear(true);

        // 监听存储事件
        if (this.options.events) {
            window.addEventListener('storage', this._handleStorageEvent.bind(this));
        }
    }

    /**
     * 安全性检查
     * @private
     */
    _securityCheck() {
        // 检查是否在安全上下文中运行
        if (window.isSecureContext === false) {
            console.warn('Storage is running in insecure context');
        }

        // 检查存储是否可用
        try {
            const testKey = `${this.prefix}_test_${Date.now()}`;
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
        } catch (e) {
            throw new Error('LocalStorage is not available');
        }

        // 检查加密选项
        if (this.options.encrypt && !this.options.encryptKey) {
            throw new Error('Encryption key is required when encryption is enabled');
        }
    }

    /**
     * 数据验证
     * @private
     */
    _validateData(data, key) {
        // 检查数据大小
        const size = new Blob([JSON.stringify(data)]).size;
        if (size > 5242880) { // 5MB
            throw new Error(`Data for key "${key}" exceeds size limit`);
        }

        // 检查键名格式
        if (!/^[\w-]+$/.test(key)) {
            throw new Error('Invalid key format');
        }

        return true;
    }

    /**
     * 设置数据
     * @param {string} key 键名
     * @param {*} data 数据
     * @param {Object} options 选项
     */
    set(key, data, options = {}) {
        try {
            this._validateData(data, key);
            const {
                expire = 0,          // 过期时间（秒）
                encrypt = this.options.encrypt,
                compression = this.options.compression
            } = options;

            const item = {
                data,
                meta: {
                    time: Date.now(),
                    expire: expire ? Date.now() + expire * 1000 : 0,
                    type: typeof data
                }
            };

            let value = item;

            // 序列化
            if (this.options.serialize) {
                value = JSON.stringify(item);
            }

            // 压缩
            if (compression) {
                value = this._compress(value);
            }

            // 加密
            if (encrypt) {
                value = this._encrypt(value);
            }

            localStorage.setItem(this.prefix + key, value);
            this._emit('set', { key, data });
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    }

    /**
     * 获取数据
     * @param {string} key 键名
     * @param {*} def 默认值
     */
    get(key, def = null) {
        try {
            let value = localStorage.getItem(this.prefix + key);
            if (!value) return def;

            // 解密
            if (this.options.encrypt) {
                value = this._decrypt(value);
            }

            // 解压
            if (this.options.compression) {
                value = this._decompress(value);
            }

            // 反序列化
            if (this.options.serialize) {
                value = JSON.parse(value);
            }

            const { data, meta } = value;

            // 检查过期
            if (meta.expire && meta.expire < Date.now()) {
                this.remove(key);
                return def;
            }

            // 类型转换
            return this._convertType(data, meta.type);
        } catch (e) {
            return def;
        }
    }

    /**
     * 批量设置数据
     * @param {Object} items 键值对
     * @param {Object} options 选项
     */
    setMany(items, options = {}) {
        Object.entries(items).forEach(([key, value]) => {
            this.set(key, value, options);
        });
    }

    /**
     * 批量获取数据
     * @param {Array} keys 键名数组
     * @param {*} def 默认值
     */
    getMany(keys, def = null) {
        return keys.reduce((acc, key) => {
            acc[key] = this.get(key, def);
            return acc;
        }, {});
    }

    /**
     * 获取存储使用情况
     */
    getStats() {
        const total = localStorage.length;
        const used = Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
            .length;

        return {
            total,
            used,
            available: total - used,
            prefix: this.prefix
        };
    }

    /**
     * 添加事件监听器
     */
    on(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * 触发事件
     */
    _emit(type, data) {
        if (!this.options.events) return;
        this.listeners.forEach(listener => {
            try {
                listener({ type, data, timestamp: Date.now() });
            } catch {}
        });
    }

    /**
     * 处理存储事件
     */
    _handleStorageEvent(event) {
        if (event.key?.startsWith(this.prefix)) {
            this._emit('external', {
                key: event.key.slice(this.prefix.length),
                oldValue: event.oldValue,
                newValue: event.newValue
            });
        }
    }

    /**
     * 类型转换
     */
    _convertType(value, type) {
        switch (type) {
            case 'number': return Number(value);
            case 'boolean': return Boolean(value);
            case 'undefined': return undefined;
            default: return value;
        }
    }

    /**
     * 删除数据
     * @param {string} key 键名
     */
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    /**
     * 清空数据
     * @param {boolean} [onlyExpired=false] 是否只清除过期数据
     */
    clear(onlyExpired = false) {
        if (!onlyExpired) {
            Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
            return;
        }

        // 清除过期数据
        Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
            try {
                const { expire } = JSON.parse(localStorage.getItem(key));
                if (expire && expire < Date.now()) {
                    localStorage.removeItem(key);
                }
            } catch {}
        });
    }

    /**
     * 获取所有数据
     */
    getAll() {
        const data = {};
        Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
            const realKey = key.slice(this.prefix.length);
            data[realKey] = this.get(realKey);
        });
        return data;
    }

    /**
     * 加密数据
     * @private
     */
    _encrypt(data) {
        if (!this.options.encryptKey) {
            return btoa(data); // 如果没有密钥，仅做 Base64 编码
        }

        try {
            // 简单的 XOR 加密
            const key = this.options.encryptKey;
            const text = btoa(data);
            let result = '';

            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }

            return btoa(result); // 再次 Base64 编码
        } catch (e) {
            console.warn('Encryption failed:', e);
            return data;
        }
    }

    /**
     * 解密数据
     * @private
     */
    _decrypt(data) {
        if (!this.options.encryptKey) {
            return atob(data); // 如果没有密钥，仅做 Base64 解码
        }

        try {
            // 解密过程
            const key = this.options.encryptKey;
            const text = atob(data);
            let result = '';

            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }

            return atob(result);
        } catch (e) {
            console.warn('Decryption failed:', e);
            return data;
        }
    }

    /**
     * 压缩数据
     * @private
     */
    _compress(data) {
        try {
            // 使用简单的 LZW 压缩算法
            const dict = new Map();
            const uncompressed = String(data);
            let dictSize = 256;

            for (let i = 0; i < 256; i++) {
                dict.set(String.fromCharCode(i), i);
            }

            let current = '';
            const result = [];

            for (let i = 0; i < uncompressed.length; i++) {
                const char = uncompressed.charAt(i);
                const phrase = current + char;

                if (dict.has(phrase)) {
                    current = phrase;
                } else {
                    result.push(dict.get(current));
                    dict.set(phrase, dictSize++);
                    current = char;
                }
            }

            if (current !== '') {
                result.push(dict.get(current));
            }

            return btoa(JSON.stringify(result)); // Base64 编码压缩后的数据
        } catch (e) {
            console.warn('Compression failed:', e);
            return data;
        }
    }

    /**
     * 解压数据
     * @private
     */
    _decompress(data) {
        try {
            // LZW 解压
            const compressed = JSON.parse(atob(data));
            const dict = new Map();
            let dictSize = 256;

            for (let i = 0; i < 256; i++) {
                dict.set(i, String.fromCharCode(i));
            }

            let current = String.fromCharCode(compressed[0]);
            let result = current;

            for (let i = 1; i < compressed.length; i++) {
                const entry = compressed[i];
                let phrase;

                if (dict.has(entry)) {
                    phrase = dict.get(entry);
                } else if (entry === dictSize) {
                    phrase = current + current.charAt(0);
                } else {
                    throw new Error('Invalid compressed data');
                }

                result += phrase;
                dict.set(dictSize++, current + phrase.charAt(0));
                current = phrase;
            }

            return result;
        } catch (e) {
            console.warn('Decompression failed:', e);
            return data;
        }
    }

    /**
     * 完整性检查
     * @private
     */
    _checkIntegrity(value, key) {
        try {
            const parsed = JSON.parse(value);
            if (!parsed.meta || typeof parsed.meta.time !== 'number') {
                throw new Error('Data corruption detected');
            }
            return true;
        } catch {
            this.remove(key);
            return false;
        }
    }
}

// 创建默认实例
const ls = new LocalStorage('app_', {
    serialize: true,
    compression: false,
    encrypt: false,
    encryptKey: 'your-secret-key', // 加密密钥
    events: true
});

// Vue 插件
export const createStoragePlugin = (options = {}) => ({
    install(app) {
        const storage = new LocalStorage(options.prefix || 'app_', options);
        app.config.globalProperties.$storage = storage;
        app.provide('storage', storage);
    }
});

// Composition API Hook
export function useStorage(customPrefix, options = {}) {
    const storage = customPrefix ?
        new LocalStorage(customPrefix, options) :
        ls;

    return {
        storage,
        set: storage.set.bind(storage),
        get: storage.get.bind(storage),
        remove: storage.remove.bind(storage),
        clear: storage.clear.bind(storage),
        getAll: storage.getAll.bind(storage),
        setMany: storage.setMany.bind(storage),
        getMany: storage.getMany.bind(storage),
        getStats: storage.getStats.bind(storage),
        on: storage.on.bind(storage)
    };
}

export default ls;
export { LocalStorage };