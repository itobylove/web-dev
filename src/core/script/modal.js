import {createApp} from 'vue'
import messageComponent from '@/core/component/message1.vue'
import {getUUID} from '@/core/script/core.js'
import * as load from '@/core/script/load.js'

/**
 * 窗口创建
 * @param component
 * @param opts
 * @returns {App<Element>}
 */
//窗口创建
export const win = async (component, opts = {}) => {
    opts.appNode = document.createElement('div')
    document.body.appendChild(opts.appNode)
    opts.app = createApp(component, {opts}) //不能传解构的，解构后app传不进去
    await load.all(opts.app)
    opts.app.mount(opts.appNode)
    opts.appNode.remove()
    // setTimeout(() => appNode.remove(), 0)
    return opts.app
}

/**
 * 消息提示
 * @param opts 可以是对象，也可以是提示文本
 * @param type  类型：info、success、warning、error、question
 * @param duration 显示时长
 */
export const msg = {
    show: (opts, type = 'info', duration = 5000) => {
        // 图标
        const iconName = {
            info: 'info ri-information-fill',
            success: 'success ri-checkbox-circle-fill',
            warning: 'warning ri-error-warning-fill',
            error: 'error ri-error-warning-fill',
            question: 'question ri-question-fill'
        }
        opts = typeof opts === 'string' ? {content: opts, type, duration} : opts
        opts = {
            ...{
                id: getUUID(),
                type: 'info',
                content: '内容',
                duration: 5000,
            }, ...opts
        }
        // 模板
        const tpl = `<div id="${opts.id}" class="siyi-message">
                    <i class="${opts.type} ${iconName[opts.type]}"></i>
                    <p>${opts.content}</p>
                    <i class="ri-close-fill"></i>
                    </div>`
        document.body.insertAdjacentHTML('beforeend', tpl)//插入模板
        const messageNode = document.getElementById(opts.id)//获取模板节点
        const closeButton = messageNode.querySelector('.ri-close-fill')//获取关闭按钮节点
        // todo 位置计算后面在写
        // if (window.siyi.msgcount > 0) {
        //     window.siyi.msgtop += messageNode.offsetHeight
        //     window.siyi.msgcount += 1
        // } else {
        //     window.siyi.msgcount = 1
        //     window.siyi.msgtop = 20
        // }
        // messageNode.style.top = window.siyi.msgtop + 30 + 'px'
        setTimeout(() => messageNode.classList.add('show'))//显示
        let timer = null //定时器
        //自动关闭
        const close = (duration = opts.duration) => {
            timer = setTimeout(() => {
                messageNode.classList.remove('show')
                setTimeout(() => {
                    messageNode.remove()
                    // window.siyi.msgcount -= 1
                }, 300)
            }, duration)
        }
        closeButton.addEventListener('click', () => close(0))//点击关闭按钮时立即关闭
        messageNode.addEventListener('mouseenter', () => clearTimeout(timer))//鼠标移入时暂停自动关闭
        messageNode.addEventListener('mouseleave', () => close())//鼠标移出时继续自动关闭
        close()//默认自动关闭
    },
    info: (content, duration) => msg.show(content, 'info', duration),
    success: (content, duration) => msg.show(content, 'success', duration),
    error: (content, duration) => msg.show(content, 'error', duration),
    warning: (content, duration) => msg.show(content, 'warning', duration),
    question: (content, duration) => msg.show(content, 'question', duration),


    confirm: (content, okCallback = () => '', title = '请确认', opts = {}) => win(messageComponent, {
        title, content, ok: okCallback, theme: 'confirm', maskClickClose: false, disabledClose: true, ...opts
    }),
    prompt: (title = '请输入', content, okCallback = () => '', opts = {}) => win(messageComponent, {
        title, content, ok: okCallback, theme: 'prompt', maskClickClose: false, disabledClose: true, ...opts
    }),
    promptAsync: (title = '请输入', content = '', opts = {}) => {
        return new Promise((resolve) => {
            win(messageComponent, {
                title,
                content,
                ok: (value) => resolve(value),
                no: () => resolve(false),
                other: () => resolve(null),
                theme: 'prompt',
                maskClickClose: false,
                disabledClose: true,
                ...opts
            })
        })
    },
    select: (options, content = null, okCallback = () => '', title = '请选择', opts = {}) => win(messageComponent, {
        title, content, select: {bind: {'options': options}},
        ok: okCallback, theme: 'prompt', maskClickClose: false, disabledClose: true, ...opts,
    }),
    selectAsync: (options, content = null, title = '请选择', opts = {}) => {
        return new Promise((resolve) => {
            win(messageComponent, {
                title,
                content,
                select: {bind: {'options': options}},
                ok: (value) => resolve(value),
                no: () => resolve(false),
                other: () => resolve(null),
                theme: 'select',
                maskClickClose: false,
                disabledClose: true,
                ...opts
            })
        })
    },
    confirmAsync: (title = '请确认', content = '', opts = {}) => {
        return new Promise((resolve) => {
            win(messageComponent, {
                title,
                content,
                ok: () => resolve(true),
                no: () => resolve(false),
                other: () => resolve(null),
                theme: 'confirm',
                maskClickClose: false,
                disabledClose: true,
                ...opts
            })
        })
    }
}

