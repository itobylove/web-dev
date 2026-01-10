import siyi from '@/core/script/siyi.js'
//加载库组件
export const frame = async app => {
    if (siyi.pc) {
        app.use(await import('tdesign-vue-next'));
        await import('@/core/assets/css/t-pc-theme.css');

        app.use(await import('vxe-table'));
        await import('vxe-table/lib/style.css');
        app.use(await import('vxe-pc-ui'));
        await import('vxe-pc-ui/lib/style.css');
    } else {
        app.use(await import('tdesign-mobile-vue'));
        await import('@/core/assets/css/t-mobile-theme.css');
    }
    await import('remixicon/fonts/remixicon.css');
}


//加载自定义组件
export const fixed = async () => {
    await import('@/core/assets/css/base.css');
    await import(`@/core/assets/css/base_${siyi.deviceName}.css`);
}


//加载核心组件 （库+自定义）
export const all = async app => {
    await frame(app)
    await fixed(app)
}

// 手动加载腾讯组件
export const tdesign = async (name) => {
    if (siyi.mobile) {
        const mod = await import('tdesign-mobile-vue')
        return mod[name]
    } else {
        const mod = await import('tdesign-vue-next')
        return mod[name]
    }
}