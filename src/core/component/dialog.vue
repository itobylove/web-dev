<template>
  <teleport :to="dialog.container">
    <div ref="dialogDom" :class="['dialogBox',dialog.type,dialog.device,dialog.className,{open:dialogReactive.openAnimation,close:dialogReactive.closeAnimation}]" :style="dialogReactive.dialogStyle" @mousedown="dialog.zIndex()" @mouseenter="dialog.mouseenter()" @mouseleave="dialog.mouseleave()">
      <div class="header" v-if="dialog.showHeader" @mousedown="dialog.mousedown('move',$event)" @mouseup="dialog.mouseup()">
        <div ref="titleDom" class="title" v-if="dialog.showTitle" @dblclick="dialog.fullscreenSwitch()">
          <slot name="title">{{ dialogReactive.title }}</slot>
        </div>
        <i :class="['fullscreen',dialogReactive.isFullscreen?'ri-fullscreen-exit-fill':'ri-fullscreen-line']" @click="dialog.fullscreenSwitch()" v-if="dialog.showFullscreen&&dialog.changeSize"/>
        <i class="close ri-close-line" @click="dialog.close()" v-if="dialog.showClose"/>
      </div>
      <div class="main">
        <div ref="bodyDom" class="body" :style="dialog.bodyStyle" @mousedown="dialog.bodyMove&&dialog.mousedown('move',$event)" @mouseup="dialog.bodyMove&&dialog.mouseup()">
          <slot name="default">
            <div class="content">
              <i :class="dialog.iconName[dialog.type]" v-if="dialog.showIcon==='icon'"></i>
              <img :src="noData" v-if="dialog.showIcon==='yazi'"/>
              <span ref="textDom" class="text" v-if="dialog.showText">{{ dialogReactive.content }}</span>
              <i class="close ri-close-fill" @click="dialog.close()" v-if="dialog.showTextClose"></i>
              <t-input class="input" v-model="dialogReactive.inputValue" v-bind="dialogReactive.input" v-if="dialog.showInput"/>
              <t-select class="select" v-model="dialogReactive.selectValue" v-bind="dialogReactive.select" v-if="dialog.showSelect && !dialogReactive.select?.isTree"/>
              <t-tree-select class="select tree-select" v-model="dialogReactive.selectValue" v-bind="dialogReactive.select" v-if="dialog.showSelect && dialogReactive.select?.isTree"/>
            </div>
          </slot>
        </div>
        <div class="footer" v-if="dialog.showFooter">
          <button class="no" @click="dialog.no()" v-if="dialog.noval">{{ dialog.noval }}</button>
          <button class="ok" @click="dialog.ok()" v-if="dialog.okval">{{ dialog.okval }}</button>
          <button class="other" @click="dialog.other()" v-if="dialog.otherval">{{ dialog.otherval }}</button>
        </div>
      </div>
      <i class="size left" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('left',$event)" @mouseup.stop="dialog.mouseup()"></i>
      <i class="size top" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('top',$event)" @mouseup.stop="dialog.mouseup()"></i>
      <i class="size right" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('right',$event)" @mouseup.stop="dialog.mouseup()"></i>
      <i class="size bottom" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('bottom',$event)" @mouseup.stop="dialog.mouseup()"></i>
      <i class="size lefttop" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('lefttop',$event)" @mouseup.stop="dialog.mouseup()"></i>
      <i class="size righttop" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('righttop',$event)" @mouseup.stop="dialog.mouseup()"></i>
      <i class="size rightbottom" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('rightbottom',$event)" @mouseup.stop="dialog.mouseup()"></i>
      <i class="size leftbottom" v-if="dialog.changeSize" @mousedown.stop="dialog.mousedown('leftbottom',$event)" @mouseup.stop="dialog.mouseup()"></i>
    </div>
    <div ref="maskDom" class="dialogMask" v-if="dialog.showMask" @click="dialog.clickMask()" :style="dialogReactive.maskStyle"></div>
  </teleport>
</template>
<script setup>
import {onMounted, onBeforeUnmount, ref, reactive, shallowRef, render, isVNode, createApp, useAttrs} from 'vue';
import noData from '@/core/assets/img/nodata.gif';
import siyi from '@/core/script/siyi.js';
import * as load from '@/core/script/load.js';
import * as core from '@/core/script/core.js';
import {sendTrack} from "@/utils/track.js";


const dialogDom = ref();  //窗口dom
const titleDom = ref();   //标题dom
const bodyDom = ref();    //内容dom
const textDom = ref();    //内容dom
const maskDom = ref();    //遮罩dom
const TInput = shallowRef('i');  //shallowRef 必须是一个有效的html标签，不能传空 null undefined
const TSelect = shallowRef('i'); //shallowRef 必须是一个有效的html标签，不能传空 null undefined
const TTreeSelect = shallowRef('i'); //shallowRef 必须是一个有效的html标签，不能传空 null undefined
siyi.zIndex = siyi.zIndex > 0 ? siyi.zIndex++ : 999999; //层级

const props = defineProps({
  type: {type: String, default: 'window', validator: val => ['info', 'success', 'warning', 'error', 'question', 'loading', 'confirm', 'input', 'select', 'window'].includes(val)},//类型
  createType: {type: String, default: null, validator: val => ['html', 'js'].includes(val)},             //调用形式：html标签模式，js模式
  container: {type: [Object, String], default: null}, //容器,要将窗口移动到指定的容器内
  className: {type: String, default: null},                  //容器类名
  bodyStyle: {type: Object, default: null},                  //body样式
  appendChild: {type: String, default: null, validator: val => ['body', 'text'].includes(val)},                 //添加内容挂载点JS形式调用才有作用
  title: {type: [String, Object], default: null},            //标题JS形式调用才有作用
  content: {type: [String, Object], default: null},          //内容JS形式调用才有作用
  titleProps: {type: Object, default: null},                 //标题Props JS形式调用才有作用
  contentProps: {type: Object, default: null},               //内容Props JS形式调用才有作用
  width: {type: [Number, String], default: null},        //窗口宽  可以是 % 数字 auto  px
  height: {type: [Number, String], default: null},       //窗口高  可以是 % 数字 auto   px
  minWidth: {type: Number, default: null},              //最小宽度
  minHeight: {type: Number, default: null},              //最小高度
  maxWidth: {type: Number, default: null},                 //最大宽度
  maxHeight: {type: Number, default: null},                //最大高度
  left: {type: [Number, String], default: null},       //左 可以是 center % 数字 px
  top: {type: [Number, String], default: null},        //上 可以是 center % 数字 px
  offset: {type: Number, default: null},               //边界保留像素，防止拖出视图区外
  headerBg: {type: String, default: null},            //标题背景
  bodyBg: {type: String, default: null},                 //主体背景色
  footerBg: {type: String, default: null},    //底部背景色
  maskBg: {type: String, default: null},       //遮罩背景色
  bodyMove: {type: Boolean, default: null},    //点击body区移动
  changeSize: {type: Boolean, default: null},        //是否允许改变大小 八全方位
  forceEnlarge: {type: Boolean, default: null},      //打开时强制全屏
  showHeader: {type: Boolean, default: null},      //禁用header
  showTitle: {type: Boolean, default: null},          //标题
  showFullscreen: {type: Boolean, default: null},     //最大化
  showClose: {type: Boolean, default: null},         //关闭按钮
  showIcon: {type: String, default: null},   //图标，可以是 icon  yazi
  showText: {type: Boolean, default: null},   //禁用内容
  showTextClose: {type: Boolean, default: null},   //禁用内容关闭按钮
  showInput: {type: Boolean, default: null},         //禁用输入框
  showSelect: {type: Boolean, default: null},        //禁用选择框
  showFooter: {type: Boolean, default: null},     //禁用footer栏
  showMask: {type: Boolean, default: null},       //遮罩，如果为fasle则不启用遮罩
  esc: {type: Boolean, default: null},                      //esc退出
  duration: {type: Number, default: null},            //定时关闭  'info', 'success', 'warning', 'error', 'question' 才有效
  okval: {type: String, default: null},                   //确定
  noval: {type: String, default: null},                   //取消
  otherval: {type: String, default: null},                   //其他
  select: {type: Object, default: null},                     //选择框配置
  input: {type: Object, default: null},                      //输入框配置
  value: {type: String, default: null},//输入框值
  okCallback: {type: Function, default: null},//确定回调
  noCallback: {type: Function, default: null},//取消回调
  otherCallback: {type: Function, default: null},//其他回调
});

const attrs = useAttrs()  // 未定义的 props 会在这里
if (Object.keys(attrs).length > 0) {
  console.log('存在未定义的属性', attrs);
  sendTrack({message: '使用了未定义的属性', stack: attrs});
}

const emits = defineEmits([
  'beforeInit', //初始化前
  'afterInit', //初始化后
  'beforeOpen', //打开前
  'afterOpen', //打开后
  'beforeClose',//关闭前
  'afterClose',//关闭后
  'beforeEnlarge',//放大前
  'afterEnlarge',//放大后
  'beforeRestore',//还原前
  'afterRestore',//还原后
  'clickMask', //点击遮罩关闭窗口
  'ok',//确定
  'no',//取消
  'other',//其他
]);


//默认配置
const defaultConfig = {
  window: {
    type: 'window',
    createType: 'html',
    container: '',
    className: '',
    bodyStyle: {},
    appendChild: 'body',
    title: '',
    content: '',
    titleProps: {},
    contentProps: {},
    width: 'auto',
    height: 'auto',
    minWidth: 50,
    minHeight: 150,
    maxWidth: 9999,
    maxHeight: 9999,
    left: 'center',
    top: siyi.pc ? '10%' : 'center',
    offset: 38,
    headerBg: '#f3f4f7',
    bodyBg: '#fff',
    footerBg: '#fff',
    maskBg: 'rgba(0,0,0,.2)',
    bodyMove: false,
    changeSize: true,
    forceEnlarge: siyi.mobile,
    showHeader: true,
    showTitle: true,
    showFullscreen: true,
    showClose: true,
    showIcon: '',
    showText: false,
    showTextClose: false,
    showInput: false,
    showSelect: false,
    showFooter: false,
    showMask: true,
    esc: true,
    duration: 0,
    okval: '',
    noval: '',
    otherval: '',
    select: {},
    input: {},
    value: '',
    okCallback: async () => '',
    noCallback: async () => '',
    otherCallback: async () => '',
  },
  loading: {
    type: 'loading',
    createType: 'html',
    container: '',
    className: '',
    bodyStyle: {},
    appendChild: 'text',
    title: '',
    content: '疯狂查询中',
    titleProps: {},
    contentProps: {},
    width: '100%',
    height: '100%',
    minWidth: 50,
    minHeight: 50,
    maxWidth: 9999,
    maxHeight: 9999,
    left: 'center',
    top: 'center',
    offset: 38,
    headerBg: '#f3f4f7',
    bodyBg: 'rgba(255,255,255,.4)',
    footerBg: '#fff',
    maskBg: '',
    bodyMove: false,
    changeSize: false,
    forceEnlarge: true,
    showHeader: false,
    showTitle: false,
    showFullscreen: false,
    showClose: false,
    showIcon: 'yazi',
    showText: true,
    showTextClose: false,
    showInput: false,
    showSelect: false,
    showFooter: false,
    showMask: false,
    esc: false,
    duration: 0,
    okval: '',
    noval: '',
    otherval: '',
    select: {},
    input: {},
    value: '',
    okCallback: async () => '',
    noCallback: async () => '',
    otherCallback: async () => '',
  },
  confirm: {
    type: 'confirm',
    createType: 'html',
    container: '',
    className: '',
    bodyStyle: {},
    appendChild: 'text',
    title: '请确认',
    content: '',
    titleProps: {},
    contentProps: {},
    width: 'auto',
    height: 'auto',
    minWidth: 50,
    minHeight: 150,
    maxWidth: 9999,
    maxHeight: 9999,
    left: 'center',
    top: siyi.pc ? '10%' : 'center',
    offset: 38,
    headerBg: '#f3f4f7',
    bodyBg: '#fff',
    footerBg: '#fff',
    maskBg: 'rgba(0,0,0,.2)',
    bodyMove: false,
    changeSize: false,
    forceEnlarge: false,
    showHeader: true,
    showTitle: true,
    showFullscreen: false,
    showClose: false,
    showIcon: '',
    showText: true,
    showTextClose: false,
    showInput: false,
    showSelect: false,
    showFooter: true,
    showMask: true,
    esc: true,
    duration: 0,
    okval: '确定',
    noval: '取消',
    otherval: '',
    select: {},
    input: {},
    value: '',
    okCallback: async () => '',
    noCallback: async () => '',
    otherCallback: async () => '',
  },
  input: {
    type: 'input',
    createType: 'html',
    container: '',
    className: '',
    bodyStyle: {},
    appendChild: 'body',
    title: '请输入',
    content: '',
    titleProps: {},
    contentProps: {},
    width: 'auto',
    height: 'auto',
    minWidth: 50,
    minHeight: 150,
    maxWidth: 9999,
    maxHeight: 9999,
    left: 'center',
    top: siyi.pc ? '10%' : 'center',
    offset: 38,
    headerBg: '#f3f4f7',
    bodyBg: '#fff',
    footerBg: '#fff',
    maskBg: 'rgba(0,0,0,.2)',
    bodyMove: false,
    changeSize: false,
    forceEnlarge: false,
    showHeader: true,
    showTitle: true,
    showFullscreen: false,
    showClose: false,
    showIcon: '',
    showText: false,
    showTextClose: false,
    showInput: true,
    showSelect: false,
    showFooter: true,
    showMask: true,
    esc: true,
    duration: 0,
    okval: '确定',
    noval: '取消',
    otherval: '',
    select: {},
    input: {},
    value: '',
    okCallback: async () => '',
    noCallback: async () => '',
    otherCallback: async () => '',
  },
  select: {
    type: 'select',
    createType: 'html',
    container: '',
    className: '',
    bodyStyle: {},
    appendChild: 'body',
    title: '请选择',
    content: '',
    titleProps: {},
    contentProps: {},
    width: 'auto',
    height: 'auto',
    minWidth: 50,
    minHeight: 150,
    maxWidth: 9999,
    maxHeight: 9999,
    left: 'center',
    top: siyi.pc ? '10%' : 'center',
    offset: 38,
    headerBg: '#f3f4f7',
    bodyBg: '#fff',
    footerBg: '#fff',
    maskBg: 'rgba(0,0,0,.2)',
    bodyMove: false,
    changeSize: false,
    forceEnlarge: false,
    showHeader: true,
    showTitle: true,
    showFullscreen: false,
    showClose: false,
    showIcon: '',
    showText: false,
    showTextClose: false,
    showInput: false,
    showSelect: true,
    showFooter: true,
    showMask: true,
    esc: true,
    duration: 0,
    okval: '确定',
    noval: '取消',
    otherval: '',
    select: {},
    input: {},
    value: [],
    okCallback: async () => '',
    noCallback: async () => '',
    otherCallback: async () => '',
  },
  info: {
    type: 'info',
    createType: 'html',
    container: '',
    className: '',
    bodyStyle: {},
    appendChild: 'text',
    title: '',
    content: '',
    titleProps: {},
    contentProps: {},
    width: 'auto',
    height: 'auto',
    minWidth: 50,
    minHeight: 50,
    maxWidth: 9999,
    maxHeight: 9999,
    left: 'center',
    top: '10%',
    offset: 38,
    headerBg: '#f3f4f7',
    bodyBg: '#fff',
    footerBg: '#fff',
    maskBg: 'rgba(0,0,0,.2)',
    bodyMove: true,
    changeSize: false,
    forceEnlarge: false,
    showHeader: false,
    showTitle: false,
    showFullscreen: false,
    showClose: false,
    showIcon: 'icon',
    showText: true,
    showTextClose: true,
    showInput: false,
    showSelect: false,
    showFooter: false,
    showMask: false,
    esc: true,
    duration: 1500,
    okval: '',
    noval: '',
    otherval: '',
    select: {},
    input: {},
    value: '',
    okCallback: async () => '',
    noCallback: async () => '',
    otherCallback: async () => '',
  }
}
Object.assign(defaultConfig, {
  success: {...defaultConfig.info, type: props.type ?? 'success', duration: props.duration ?? 1500},
  warning: {...defaultConfig.info, type: props.type ?? 'warning', duration: props.duration ?? 3000},
  error: {...defaultConfig.info, type: props.type ?? 'error', duration: props.duration ?? 5000},
  question: {...defaultConfig.info, type: props.type ?? 'question', duration: props.duration ?? 1500},
});


const dialog = defaultConfig?.[props.type] || defaultConfig.window;  //选择配置
for (const key in props) if (props[key] !== null) dialog[key] = props[key];

dialog.container = getTeleportTarget(dialog.container);

function getTeleportTarget(target) {
  if (typeof target === 'string' && target.length > 0) return target;
  if (target instanceof Node) return target;
  if (target?.value) return getTeleportTarget(target.value);
  if (target?.$el) return getTeleportTarget(target.$el);
  return siyi?.nav?.key ? `#${siyi.nav.key}` : 'body';// 默认容器
}


const dialogReactive = reactive({
  title: dialog.title,
  content: dialog.content,
  dialogStyle: {}, //窗口样式
  maskStyle: {},   //遮罩样式
  openAnimation: false,
  closeAnimation: false,
  isFullscreen: false,
  inputValue: dialog.value,
  selectValue: dialog.value,
  input: {
    clearable: true,
    ...dialog.input,
    onEnter: val => typeof dialog.input.onEnter === 'function' ? dialog.input.onEnter(val, dialogReactive) : dialog.ok(val),
    ...(typeof dialog.input.onChange === 'function' ? {onChange: val => dialog.input.onChange(val, dialogReactive)} : {})
  },
  select: {
    filterable: true,
    clearable: true,
    options: [],
    ...dialog.select,
    ...(typeof dialog.select.onChange === 'function' ? {onChange: val => dialog.select.onChange(val, dialogReactive)} : {}),
    ...(typeof dialog.select.onSearch === 'function' ? {onSearch: val => dialog.select.onSearch(val, dialogReactive)} : {}),
  },
});


Object.assign(dialog, {
  iconName: {
    info: 'icon info ri-information-fill',
    success: 'icon success ri-checkbox-circle-fill',
    warning: 'icon warning ri-error-warning-fill',
    error: 'icon error ri-close-circle-fill',
    question: 'icon question ri-question-fill',
    loading: 'icon loading ri-loader-4-fill',
  },
  flexdirection: dialog.showIcon === 'icon' ? 'row' : 'column',
  device: siyi.pc ? 'pc' : 'mobile',
  zIndex: () => {
    dialogReactive.maskStyle.zIndex = siyi.zIndex++;
    dialogReactive.dialogStyle.zIndex = siyi.zIndex++;
  },
  contentApp: null,
  ///渲染内容
  render: async (dom, content, props = {}) => {
    if (!dom?.innerHTML) return;
    dom.innerHTML = '';
    if (typeof content === 'string') {//HTML字符串
      dom.innerHTML = content;
    } else if (content instanceof HTMLElement) {//HTMLElement
      content.removeAttribute('style');
      dom.appendChild(content);
    } else if (typeof content === 'object' && typeof content.setup === 'function') {//组件
      dialog.contentApp = createApp(content, {...props, dialog: {...dialog, dialogReactive}});
      await load.all(dialog.contentApp);
      dialog.contentApp.mount(dom);
    } else if (isVNode(content)) {//vnode
      render(content, dom);
    }
  },
  update: opts => {
    if (['info', 'success', 'warning', 'error', 'question', 'loading', 'confirm'].includes(dialog.type)) {
      opts = typeof opts === 'string' ? {content: opts} : opts;
      Object.assign(dialogReactive, opts);
    }
  },
  //初始化
  init: async () => {
    const obj = {status: true};
    emits('beforeInit', obj);
    if (obj.status === false) return;
    if (dialog.createType === 'js') { //JS形式调用
      if (dialog.showInput){
        const inputType= dialog.input?.inputType || 'Input';
        TInput.value = await load.tdesign(inputType ? inputType[0].toUpperCase() + inputType.slice(1) : '');//输入框
      }
      if (dialog.showSelect) TSelect.value = await load.tdesign('Select');//下拉框
      if (dialog.showSelect) TTreeSelect.value = await load.tdesign('TreeSelect');//下拉框
      let dom = false;
      if (dialog.appendChild === 'body') {
        dom = bodyDom.value;
      } else if (dialog.appendChild === 'text') {
        dom = textDom.value;
      }
      dialog.title && dialog.showTitle && await dialog.render(titleDom.value, dialog.title, dialog.titleProps); //处理标题
      dialog.content && await dialog.render(dom, dialog.content, dialog.contentProps); //处理内容
    }
    dialog.position();
    emits('afterInit');
  },
  getWHLT: (val, type, wh = 0) => {
    const parentNode = dialogDom.value.parentNode;
    if (isFinite(val)) {
      val = Number(val);
    } else if (/px$/.test(val)) {
      val = Number(val.replace(/px$/, ''));
    } else if (/%$/.test(val)) {
      val = Number(val.replace(/%$/, '')) / 100 * (['w', 'l'].includes(type) ? parentNode.clientWidth : parentNode.clientHeight);
    } else if (val === 'auto' && ['w', 'h'].includes(type)) {
      val = type === 'w' ? dialogDom.value.clientWidth : dialogDom.value.clientHeight;
    } else if (val === 'center' && ['l', 't'].includes(type)) {
      val = Math.max(((type === 'l' ? parentNode.clientWidth : parentNode.clientHeight) - wh) / 2, 0);
    }
    return ['w', 'h'].includes(type) ? val + 2 : val; //因为border 有2px 会导致字母情况下宽度不够而换行
  },
  position: () => {
    !dialogDom.value?.parentNode && console.warn('弹窗挂载点未找到:', dialogDom.value);
    dialog.zIndex();
    const width = dialog.getWHLT(dialog.width, 'w');
    const height = dialog.getWHLT(dialog.height, 'h');
    dialogReactive.dialogStyle.width = `${width}px`;
    dialogReactive.dialogStyle.height = `${height}px`;
    dialogReactive.dialogStyle.minWidth = `${dialog.minWidth}px`;
    dialogReactive.dialogStyle.minHeight = `${dialog.minHeight}px`;
    dialogReactive.dialogStyle.maxWidth = `${dialog.maxWidth}px`;
    dialogReactive.dialogStyle.maxHeight = `${dialog.maxHeight}px`;
    if (['info', 'success', 'warning', 'error', 'question'].includes(dialog.type)) {
      dialogReactive.dialogStyle.maxWidth = '80%';
      dialogReactive.dialogStyle.maxHeight = '80%';
    }
    dialogReactive.dialogStyle.left = dialog.getWHLT(dialog.left, 'l', Math.min(Math.max(width, dialog.minWidth), dialog.maxWidth)) + 'px';
    dialogReactive.dialogStyle.top = dialog.getWHLT(dialog.top, 't', Math.min(Math.max(height, dialog.minHeight), dialog.maxHeight)) + 'px';
  },
  //获取返回结果
  getResult: action => {
    const obj = {action};
    if (dialog.type === 'input') obj.value = dialogReactive.inputValue;
    if (dialog.type === 'select') {
      obj.value = dialogReactive.selectValue;
      if (dialog.select?.isTree) {
        obj.tree = dialogReactive.select?.data;
      }
      obj.options = dialogReactive.select.options;
    }
    return obj;
  },
  //取消
  no: async () => {
    const obj = dialog.getResult('no');
    obj.close = true;
    emits('no', obj);
    await dialog.noCallback(obj);
    obj.close && dialog.close();
  },
  //确定
  ok: async () => {
    const obj = dialog.getResult('ok');
    obj.close = true;
    emits('ok', obj);
    await dialog.okCallback(obj);
    obj.close && dialog.close();
  },
  other: async () => {
    const obj = dialog.getResult('other');
    obj.close = true;
    emits('other', obj);
    await dialog.otherCallback(obj);
    obj.close && dialog.close();
  },
  //点击遮罩，默认不关闭窗口，事件返回true表示关闭窗口
  clickMask: () => {
    const obj = {close: false};
    emits('clickMask', obj);
    if (obj.close === true) dialog.close();
  },
  //按ESC关闭
  escClose: e => {
    dialog.esc === true && e.key === 'Escape' && dialog.close();
  },
  //全屏切换
  fullscreenSwitch: () => {
    dialogReactive.isFullscreen ? dialog.restore() : dialog.enlarge();
  },
  historyDialogStyle: {}, //历史位置与尺寸
  //全屏
  enlarge: enlarge => {//强制全屏
    if (dialog.changeSize || enlarge) {
      const obj = {status: true};
      emits('beforeEnlarge', obj);
      if (obj.status === false) return;
      dialogReactive.isFullscreen = true;
      dialog.historyDialogStyle = {...dialogReactive.dialogStyle}; //记录原始位置与尺寸
      dialogReactive.dialogStyle.width = '100%';
      dialogReactive.dialogStyle.height = '100%';
      dialogReactive.dialogStyle.left = 0;
      dialogReactive.dialogStyle.top = 0;
      dialogReactive.dialogStyle.borderRadius = 0;
      emits('afterEnlarge');
    }
  },
  //还原
  restore: () => {
    if (dialog.changeSize) {
      const obj = {status: true};
      emits('beforeRestore', obj);
      if (obj.status === false) return;
      dialogReactive.isFullscreen = false;
      Object.assign(dialogReactive.dialogStyle, dialog.historyDialogStyle); //还原
      dialogReactive.dialogStyle.borderRadius = 'revert-layer';
      dialog.zIndex();
      emits('afterRestore');
    }
  },
  open: () => {
    const obj = {status: true};
    emits('beforeOpen', obj)
    if (obj.status === false) return;
    dialogReactive.openAnimation = true;
    dialogReactive.closeAnimation = false;
    setTimeout(() => emits('afterOpen'), 300); //300毫秒后回调打开后事件
  },
  closeTimer: null, //定时器
  close: (time = 0) => {
    dialog.closeTimer = setTimeout(() => {
      const obj = {status: true};
      emits('beforeClose', obj);
      if (obj.status === false) return;
      dialogReactive.openAnimation = false;
      dialogReactive.closeAnimation = true;
      setTimeout(() => {
        dialog.contentApp && dialog.contentApp.unmount();
        emits('afterClose');
      }, dialog.type === 'loading' ? 0 : 300);
      clearTimeout(dialog.closeTimer); //清除定时器
      dialog.closeTimer = null;
    }, time);
  },
  bcr: {},
  mousedown: (name, event) => {
    if (event.button === 0) {//左键
      dialog.bcr = core.getBoundingClientRect(dialogDom.value, event);
      dialog.bcr.name = name;
      document.addEventListener('mousemove', dialog.move); //添加监听
    }
  },
  mouseup: () => {
    document.removeEventListener('mousemove', dialog.move); //移除监听
    dialog.bcr = {};
  },
  move: event => {
    dialogReactive.dialogStyle = {
      ...dialogReactive.dialogStyle,
      ...core.changeDomSize[dialog.bcr.name]({
        event,
        unit: true,
        bcr: dialog.bcr,
        offset: dialog.offset,
        minWidth: dialog.minWidth,
        minHeight: dialog.minHeight,
        maxWidth: dialog.maxWidth,
        maxHeight: dialog.maxHeight,
      })
    }
  },
  mouseenter: () => {
    dialog.duration > 0 && clearTimeout(dialog.closeTimer);
  },
  mouseleave: () => {
    dialog.duration > 0 && dialog.close(dialog.duration);//延迟关闭
  },
  // 创建 ResizeObserver 实例
  resizeObserverOne: false,
  resizeObserver: new ResizeObserver(() => {
    if (dialog.resizeObserverOne && dialog.type !== 'loading') {
      const bcr = core.getBoundingClientRect(dialogDom.value);
      dialogReactive.dialogStyle.top = bcr.domHeight >= (bcr.containerHeight - bcr.domHeight * 0.1) ? 0 : '10%';
      dialogReactive.dialogStyle.left = Math.max((bcr.containerWidth - bcr.domWidth) / 2, 0) + 'px';
    } else {
      dialog.resizeObserverOne = true;
    }
  })
})


//挂载后
onMounted(async () => {
  await dialog.init(); //初始化
  dialog.open(); //打开窗口
  document.addEventListener('mouseup', dialog.mouseup); //鼠标抬起时
  document.addEventListener('keydown', dialog.escClose); //esc退出
  dialog.resizeObserver.observe(dialogDom.value.parentNode); //容器大小改变时触发事件
  if (['info', 'success', 'warning', 'error', 'question'].includes(dialog.type)) dialog.close(dialog.duration);  //延迟关闭
  if (['window', 'loading'].includes(dialog.type) && dialog.forceEnlarge) dialog.enlarge(true); //强制窗口全屏
})


onBeforeUnmount(() => {
  document.removeEventListener('mouseup', dialog.mouseup);//鼠标抬起时
  document.removeEventListener('keydown', dialog.escClose);//esc退出
  dialog.resizeObserver.unobserve(dialogDom.value.parentNode);//卸载容器大小改变时触发事件
})


defineExpose({...dialog, dialogReactive}) // 暴露 updateContent 方法给外部调用
</script>
<style scoped>
@keyframes siyiDialogOpenAnimation {
  0% {
    transform: scale(0.9);
  }
  30% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes siyiDialogCloseAnimation {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(0.9);
  }
}

@keyframes siyiDialogLoadingAnimation {
  0% {
    transform: rotate(0deg);
  }
  30% {
    transform: rotate(300deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.dialogMask {
  width: 100%;
  height: 100%;
  background-color: v-bind(dialog.maskBg);
  position: absolute;
  top: 0;
  left: 0;
}

.dialogBox {
  position: absolute;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 0 10px 0 #9a9a9a;
  display: flex;
  flex-direction: column;
  opacity: 0;

  &.open {
    opacity: 1;
    animation: siyiDialogOpenAnimation 0.3s
  }


  &.close {
    opacity: 1;
    animation: siyiDialogCloseAnimation 0.3s
  }

  > .header {
    width: 100%;
    height: 38px;
    user-select: none;
    border-bottom: 1px solid #c9d0da;
    background-color: v-bind(dialog.headerBg);
    flex-shrink: 0;
    display: flex;

    > .title {
      width: 100%;
      height: 100%;
      padding-left: 5px;
      font-weight: bold;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: 1;
      flex-shrink: 0;
      display: flex;
      justify-content: left; /*左对齐*/
      align-items: center; /*垂直居中*/
    }

    > i {
      width: 38px;
      height: 100%;
      cursor: pointer;
      transition: all .2s ease-out;
      flex-shrink: 0;
      display: flex;
      align-items: center; /*垂直居中*/
      justify-content: center; /*水平居中*/
    }

    > i.fullscreen {
      font-size: 18px;
    }

    > i.fullscreen:hover {
      color: #00a9ff;
      background-color: #ebebeb;
    }

    > i.close {
      font-size: 20px;
    }

    > i.close:hover {
      color: #FFF;
      background-color: red;
    }
  }

  > .main {
    width: 100%;
    height: 100%;
    overflow: hidden;
    flex: 1;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    > .body {
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: v-bind(dialog.bodyBg);
      flex: 1;
      flex-shrink: 0;

      &::-webkit-scrollbar {
        display: none;
      }

      > .content {
        width: 100%;
        height: 100%;
        user-select: none;
        word-break: break-all;
      }
    }

    > .footer {
      width: 100%;
      height: 50px;
      user-select: none;
      background-color: v-bind(dialog.footerBg);
      flex-shrink: 0;
      display: flex;
      align-items: center; /*垂直居中*/
      justify-content: center; /*水平居中*/
      gap: 20px;
      padding: 0 20px;

      > button {
        height: 30px;
        padding: 0 20px;
        font-size: 14px;
        border-radius: 2px;
        border: 0 none;
        outline: none;
        cursor: pointer;
        transition: all .2s ease-out;
        flex-shrink: 0;
        display: flex;
        align-items: center; /*垂直居中*/
        justify-content: center; /*水平居中*/
      }

      > button.ok {
        background-color: #35a1fd;
        color: #fff;
      }

      > button.ok:hover {
        background-color: #0a8dff;
      }

      > button.no {
        background-color: #cfd1da;
      }

      > button.no:hover {
        background-color: #b4b7c0;
      }

      > button.other {
        background-color: #ffb01a;
      }

      > button.other:hover {
        background-color: #f49b00;
      }
    }
  }

  > .size {
    user-select: none;
    position: absolute;
    z-index: 1;
  }

  > .size.left {
    width: 5px;
    height: 100%;
    top: 0;
    left: 0;
    cursor: ew-resize;
  }

  > .size.top {
    width: 100%;
    height: 5px;
    top: 0;
    left: 0;
    cursor: ns-resize;
  }

  > .size.right {
    width: 5px;
    height: 100%;
    top: 0;
    right: 0;
    cursor: ew-resize;
  }

  > .size.bottom {
    width: 100%;
    height: 5px;
    left: 0;
    bottom: 0;
    cursor: ns-resize;
  }

  > .size.lefttop {
    width: 10px;
    height: 10px;
    top: 0;
    left: 0;
    z-index: 2;
    cursor: nwse-resize;
  }

  > .size.righttop {
    width: 10px;
    height: 10px;
    top: 0;
    right: 0;
    z-index: 2;
    cursor: nesw-resize;
  }

  > .size.rightbottom {
    width: 10px;
    height: 10px;
    right: 0;
    bottom: 0;
    z-index: 2;
    cursor: nwse-resize;
  }

  > .size.leftbottom {
    width: 10px;
    height: 10px;
    left: 0;
    bottom: 0;
    z-index: 2;
    cursor: nesw-resize;
  }
}


.dialogBox:is(.confirm,.input,.select) {
  > .main {
    > .body {
      > .content {
        padding: 20px;
        display: flex;
        align-items: center; /*垂直居中*/
        justify-content: center; /*水平居中*/
      }
    }
  }
}


.dialogBox.loading {
  border-radius: 0;
  box-shadow: 0 0 0 0 #9a9a9a;


  > .main {
    > .body {
      > .content {
        color: #35a1fd;
        display: flex;
        align-items: center; /*垂直居中*/
        justify-content: center; /*水平居中*/
        text-align: center;
        flex-direction: v-bind(dialog.flexdirection);

        > i {
          font-size: 24px;
          animation: siyiDialogLoadingAnimation 1s infinite linear;
        }

        > .text {
          font-size: 16px
        }
      }
    }
  }
}

.dialogBox:is(.info,.success,.warning,.error,.question) {
  > .main {
    > .body {
      > .content {
        padding: 12px 10px;
        line-height: 26px;
        display: grid;
        grid-template-columns: 30px auto 25px;

        > i.icon {
          font-size: 24px;
          display: flex;
          align-items: center; /*垂直居中*/
          justify-content: center; /*水平居中*/
        }

        > i.icon.info {
          color: #006eff;
        }

        > i.icon.success {
          color: #0abf5b;
        }

        > i.icon.warning {
          color: #ff7200;
        }

        > i.icon.error {
          color: #FF0000;
        }

        > i.icon.question {
          color: #7d00ff;
        }

        > .text {
          display: flex;
          align-items: center; /*垂直居中*/
          justify-content: left; /*左对齐*/
        }

        > i.close {
          height: fit-content;
          font-weight: bold;
          font-size: 16px;
          color: #000;
          display: flex;
          cursor: pointer;
          align-items: flex-start;
          justify-content: end;

          &:hover {
            color: red;
          }
        }
      }
    }
  }
}

.dialogBox.mobile {
  > .main {
    > .footer {
      height: 45px;
      padding: 0;
      gap: 0;
      border-top: 1px solid #e1e4e8;

      > button {
        height: 100%;
        border-radius: 0;
        padding: 0;
        border-right: 1px solid #e1e4e8;
        flex-grow: 1;
      }

      > button:last-child {
        border-right: 0;
      }

      > button.ok {
        background-color: transparent;
        color: #35a1fd;
      }

      > button.ok:hover {
        background-color: #f5f5f5;
      }

      > button.no {
        background-color: transparent;
      }

      > button.no:hover {
        background-color: #f5f5f5;
      }

      > button.other {
        background-color: transparent;
      }

      > button.other:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>
<style>
/*处理腾讯tabs样式*/
.dialogBox > .main > .body {
  .t-tabs {
    height: 100%;

    > .t-tabs__header > .t-tabs__nav > .t-tabs__nav-container > .t-tabs__nav-scroll > .t-tabs__nav-wrap > .t-tabs__nav-item {
      height: 36px;
      line-height: 36px;
    }

    > .t-tabs__header > .t-tabs__nav > .t-tabs__nav-container:after {
      background-color: #cfd5de;
    }

    > .t-tabs__content {
      height: calc(100% - 36px);

      > .t-tab-panel {
        height: 100%;
        overflow: hidden auto;

        &::-webkit-scrollbar {
          display: none;
        }
      }
    }
  }
}
</style>