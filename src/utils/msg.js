import {createApp} from "vue";
import Message from "./Messages.vue";

let newInstance = null;

const msg = (options,dom) => {
    const onClose=(e)=>{
        typeof options.onClose==='function' && options.onClose(e);
    }

    typeof dom?.appendChild==='function' || (dom=document.body);
    if (newInstance) {
        newInstance.createMessage({
            ...options, onClose,
        });
    } else {
        const el = document.createElement("div");
        const app = createApp(Message, {
            closeAll:()=>{
                app.unmount();
                el.remove();
                newInstance = null;
            }
        });
        const vm = app.mount(el);
        dom.appendChild(el);
        newInstance = vm;
        newInstance.createMessage({
            ...options, onClose,
        });
    }
}

/**
 * 消息提示 - 成功
 * @param title 提示的文本
 * @param duration 延迟的时间（毫秒）
 * @param onClose 关闭后的回调
 * @param options 其他参数
 * @param dom 要挂在的位置
 */
const success = (title,duration=1000,onClose,options={},dom=null) => {
    if(typeof title==="object") options={...options,...title};
    msg({icon:"✔️",...options, type: "success",title,duration,onClose},dom);
}
const error = (title,duration=3000,onClose,options={},dom=null) => {
    if(typeof title==="object") options={...options,...title};
    msg({icon:"❌️",...options, type: "error",title,duration,onClose},dom);
}
const confirm = (title,onClose,options={},dom=null) => {
    if(typeof title==="object") options={...options,...title};
    msg({icon:"❓️",...options, type: "confirm",title,duration:0,onClose},dom);
}

const warning = (title,duration=2000,onClose,options={},dom=null) => {
    if(typeof title==="object") options={...options,...title};
    msg({icon:"️⚠️",...options, type: "warning",title,duration,onClose},dom);
}

const info = (title,duration=1000,onClose,options={},dom=null) => {
    if(typeof title==="object") options={...options,...title};
    msg({icon:"❕️",...options, type: "info",title,duration,onClose},dom);
}

export default {msg,success,error,warning,info,confirm};