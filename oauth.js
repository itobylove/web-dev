(function() {
    const params = new URLSearchParams(window.location.search);

    // 自动获取 AppID
    const appid = params.get('appid') || 'wx7843eee320daac3a';

    // 自定义 scope，可通过 URL 参数传入，默认 snsapi_base
    const scope = params.get('scope') || 'snsapi_base';

    const code = params.get('code');
    const state = params.get('state');
    let redirect_uri = decodeURIComponent(params.get('redirect_uri') || '');


    // 回调映射
    const map = [
        { host: 'localhost:5137', url: 'http://localhost:5137/#home' },
        { host: 'office.ltepcb.com:8002', url: 'http://office.ltepcb.com:8002/#home' },
        { host: '', url: 'https://office.ltepcb.com:52030/#home' },
        { host: 'office.ltepcb.com:52030', url: 'https://office.ltepcb.com:52030/#home' },
        { host: 'www.ltepcb.com', url: 'https://office.ltepcb.com:52030/#home' },
    ];

    if (redirect_uri) {
        const referHost = new URL(redirect_uri).host;
        const target = map.find(m => m.host === referHost);
        if (!target) {
            alert('未授权的来源: ' + referHost);
            return;
        }
    } else {
        const refer = document.referrer;
        const referHost = refer ? new URL(refer).host : '';
        const target = map.find(m => m.host === referHost);
        redirect_uri= target?.url || '';
        if (!target) {
            alert('未知回调目标: ' + referHost);
            return;
        }
    }

    function addUrlParams(url, params = {}) {
        if (typeof url !== 'string' || !params || typeof params !== 'object') {
            return url;
        }

        const [rawUrl, hash] = url.split('#');
        let u;

        try {
            // 绝对 URL
            u = new URL(rawUrl);
        } catch {
            // 相对 URL → 默认加个 base
            u = new URL(rawUrl, window.location.origin);
        }

        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                if (Array.isArray(v)) {
                    v.forEach(item => u.searchParams.append(k, String(item)));
                } else {
                    u.searchParams.set(k, String(v));
                }
            }
        });

        return `${u.origin}${u.pathname}${u.search}${hash ? `#${hash}` : ''}`;
    }


    // 已获取 code 返回到原来的地址
    if (code && state) {
        redirect_uri = addUrlParams(redirect_uri,{appid,code,state});
        window.location.href = redirect_uri;
        return;
    }

    // 第一次访问：拼微信授权 URL
    window.location.href =`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(window.location.href)}&response_type=code&scope=${scope}&state=${appid}#wechat_redirect`;

})();