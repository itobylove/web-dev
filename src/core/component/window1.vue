<template>
  <div ref="winRef" class="windowBox" :id="winid" :style="style" :class="props.disabledHeader?'disabledHeader':''">
    <div class="header" v-if="!props.disabledHeader">
      <div class="title">
        <slot name="title"><p>{{ props.title }}</p></slot>
      </div>
      <div class="button">
        <span @click="fullscreenSwitch()" v-if="props.resize" class="fullscreen">
          <i :class="isFullscreen?'ri-fullscreen-exit-fill':'ri-fullscreen-line'"/>
        </span>
        <span @click="props.closeType==='hide'?hide():close()" v-if="!props.disabledClose" class="close"><i class="ri-close-line"/></span>
      </div>
    </div>
    <div class="body">
      <slot name="default"></slot>
    </div>
    <i class="size left"></i>
    <i class="size top"></i>
    <i class="size right"></i>
    <i class="size bottom"></i>
    <i class="size lefttop"></i>
    <i class="size righttop"></i>
    <i class="size rightbottom"></i>
    <i class="size leftbottom"></i>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import $ from 'jquery'

const props = defineProps({
  container: {type: String, default: 'body'},              //窗口生成到那个节点下，也是窗口的有效区
  width: {type: [Number, String], default: '80%'},      //窗口宽  可以是 % 数字
  height: {type: [Number, String], default: '90%'},     //窗口高  可以是 % 数字
  left: {type: [Number, String], default: 'center'},  //左 可以是 center % 数字
  top: {type: [Number, String], default: '5%'},       //上 可以是 center % 数字
  title: {type: String, default: '标题'},                 //标题
  theme: {type: String, default: ''},                 //主题，预留后面可能会用的上   success   error   info   warning  confirm
  zIndex: {type: Number, default: 9999},              //层级
  offset: {type: Number, default: 50},                //左右保留像素，防止拖出视图区外
  maskColor: {type: [Boolean, String], default: 'rgba(0,0,0,.2)'},//遮罩，如果为fasle则不启用遮罩
  maskClickClose: {type: Boolean, default: true},   //点击遮罩关闭窗口
  minWidth: {type: Number, default: 200},            //最小宽度
  minHeight: {type: Number, default: 150},           //最小高度
  esc: {type: Boolean, default: true},               //esc退出
  closeType: {type: String, default: 'remove'},        //关闭类型   hide 隐藏   remove  销毁
  disabledClose: {type: Boolean, default: false},     //禁用关闭按钮
  disabledHeader: {type: Boolean, default: false},    //禁用标题栏
  resize: {type: Boolean, default: true},            //是否允许改变大小
  onResizeing: {type: Function, default: (obj) => true}, //改变大小中
  onMoveing: {type: Function, default: (obj) => true}, //移动中
  onBeforeOpen: {type: Function, default: () => true},  //打开前
  onAfterOpen: {type: Function, default: () => true},  //打开后
  onBeforeClose: {type: Function, default: () => true},  //关闭前
  onAfterClose: {type: Function, default: (obj) => true},  //关闭后
  onBeforeHide: {type: Function, default: () => true},  //隐藏前
  onAfterHide: {type: Function, default: () => true},  //隐藏后
  onBeforeEnlarge: {type: Function, default: () => true},//放大前
  onAfterEnlarge: {type: Function, default: () => true},//放大后
  onBeforeRestore: {type: Function, default: () => true},//还原前
  onAfterRestore: {type: Function, default: () => true},//还原后
})


let dom        //dom文档
let container  //窗口生成到那个节点下，也是窗口的有效区
let win        //窗口
let header     //窗口标题栏
const style = ref({})                 //窗口样式
const isFullscreen = ref(false)       //是否全屏
const winid = 'win' + Date.now()             //唯一ID
const mask = $('<div class="windowMask"/>')  //遮罩层
const exportObj = {}                         //返回窗口数据

//关闭
const close = async () => {
  const res = await props.onBeforeClose();
  if (res) {
    win.removeClass('open')
    win.removeClass('close')
    win.addClass('close')
    setTimeout(() => {
      win.remove()
      mask.remove()
      props.onAfterClose(res)
    }, 300)
  }
}

//隐藏
const hide = () => {
  if (props.onBeforeHide()) {
    win.removeClass('open')
    win.removeClass('close')
    win.addClass('close')
    setTimeout(() => {
      win.removeClass('open')
      win.removeClass('close')
      mask.css({display: 'none'})
      props.onAfterHide()
    }, 300)
  }
}

//打开
const open = () => {
  if (props.onBeforeOpen()) {
    win.removeClass('open')
    win.removeClass('close')
    win.addClass('open')
    mask.css({display: props.maskColor ? 'block' : 'none'})
    props.onAfterOpen()
  }
}

//移动回调
const moveing = () => {
  for (const key in style.value) {
    exportObj[key] = ['width', 'height', 'top', 'left'].includes(key) ? parseFloat(style.value[key].replace('px', '')) : style.value[key]
  }
  props.onMoveing(exportObj)
}

//改大小回调
const resizeing = () => {
  for (const key in style.value) {
    exportObj[key] = ['width', 'height', 'top', 'left'].includes(key) ? parseFloat(style.value[key].replace('px', '')) : style.value[key]
  }
  props.onResizeing(exportObj)
}
/**
 * 获取当前窗口的状态信息
 */
const get = e1 => {
  return {
    //内容区位置
    contentLeft: container.offset().left,
    contentTop: container.offset().top,
    contentWidth: container.outerWidth(true),
    contentHeight: container.outerHeight(true),
    //弹窗位置
    winLeft: win.offset().left,
    winTop: win.offset().top,
    winWidth: win.outerWidth(true),
    winHeight: win.outerHeight(true),
    //按下时鼠标位置
    downX: e1.pageX,
    downY: e1.pageY,
    //是否全屏
    fullscreen: isFullscreen.value,
  }
}

/**
 * 移动窗口
 */
const move = (e1, e2) => {
  style.value.left = Math.min(Math.max(-e1.winWidth + props.offset, (e1.winLeft - e1.contentLeft) + (e2.pageX - e1.downX)), e1.contentWidth - props.offset) + 'px'
  style.value.top = Math.min(Math.max(0, (e1.winTop - e1.contentTop) + (e2.pageY - e1.downY)), e1.contentHeight - header.outerHeight(true)) + 'px'
}

/**
 * 左
 */
const left = (e1, e2) => {
  style.value.width = Math.max(e1.winWidth - (e2.pageX - e1.downX), props.minWidth) + 'px'
  style.value.left = Math.min((e1.winLeft - e1.contentLeft) + (e2.pageX - e1.downX), (e1.winLeft - e1.contentLeft) + (e1.winWidth - props.minWidth)) + 'px'
}

/**
 * 上
 */
const top = (e1, e2) => {
  style.value.height = Math.max(Math.min(e1.winHeight - (e2.pageY - e1.downY), e1.winHeight + (e1.winTop - e1.contentTop)), props.minHeight) + 'px'
  style.value.top = Math.min(Math.max((e1.winTop - e1.contentTop) + (e2.pageY - e1.downY), 0), (e1.winTop - e1.contentTop) + (e1.winHeight - props.minHeight)) + 'px'
}

/**
 * 宽
 */
const right = (e1, e2) => style.value.width = Math.max(e1.winWidth + (e2.pageX - e1.downX), props.minWidth) + 'px'

/**
 * 高
 */
const bottom = (e1, e2) => style.value.height = Math.max(e1.winHeight + (e2.pageY - e1.downY), props.minHeight) + 'px'

/**
 * 全屏切换
 */
const fullscreenSwitch = () => isFullscreen.value ? restore() : enlarge()

/**
 * 全屏
 */
const historyStyle = {} //历史位置与尺寸
const enlarge = () => {
  if (props.resize && props.onBeforeEnlarge()) {
    isFullscreen.value = true
    //记录原始位置与尺寸
    historyStyle.width = style.value.width
    historyStyle.height = style.value.height
    historyStyle.left = style.value.left
    historyStyle.top = style.value.top
    //最大化
    style.value.width = container.innerWidth() + 'px'
    style.value.height = container.innerHeight() + 'px'
    style.value.left = '0px'
    style.value.top = '0px'
    props.onAfterEnlarge()
    resizeing()
  }
}

/**
 * 缩小
 */
const restore = () => {
  if (props.resize && props.onBeforeRestore()) {
    isFullscreen.value = false
    //还原
    style.value.width = historyStyle.width
    style.value.height = historyStyle.height
    style.value.left = historyStyle.left
    style.value.top = historyStyle.top
    props.onAfterRestore()
    resizeing()
  }
}

onMounted(() => {
  exportObj.dom = dom = $(document)
  exportObj.container = container = $(props.container)
  exportObj.win = win = $(`#${winid}`)
  exportObj.header = header = $(`#${winid} > .header`)
  exportObj.mask = mask
  container.append(win)
  if (props.maskColor) {
    container.append(mask)
    mask.css({
      width: '100%',
      height: '100%',
      position: 'absolute',
      display: 'none',
      left: 0,
      top: 0,
      backgroundColor: props.maskColor,
      zIndex: (dom.data('winIndex') > 0 ? dom.data('winIndex') : props.zIndex) + 1,
    })
    win.css({boxShadow: 'none'})
    //单击遮罩关闭
    mask.off(`click.${winid}`).on(`click.${winid}`, () => {
      if (props.maskClickClose) props.closeType === 'hide' ? hide() : close()
    })
  }

  //初始尺寸与位置
  style.value = {
    width: isFinite(props.width) ? props.width + 'px' : props.width,
    height: isFinite(props.height) ? props.height + 'px' : props.height,
    top: isFinite(props.top) ? props.top + 'px' : (props.top === 'center' ? (container.outerHeight(true) - (isFinite(props.height) ? props.height : props.height.replace('%', '') / 100 * container.outerHeight(true))) / 2 + 'px' : props.top),
    left: isFinite(props.left) ? props.left + 'px' : (props.left === 'center' ? (container.outerWidth(true) - (isFinite(props.width) ? props.width : props.width.replace('%', '') / 100 * container.outerWidth(true))) / 2 + 'px' : props.left),
    zIndex: (dom.data('winIndex') > 0 ? dom.data('winIndex') : props.zIndex) + 2,
  }

  //禁用改变大小
  !props.resize && $(`#${winid} > .size`).remove()

  //记录最大层
  dom.data('winIndex', style.value.zIndex)

  //屏幕大小改变时
  $(window).resize(() => {
    style.value.top = Math.max((container.outerHeight(true) - style.value.height.replace('px', '')) / 2, 0) + 'px'
    style.value.left = Math.max((container.outerWidth(true) - style.value.width.replace('px', '')) / 2, 0) + 'px'
  })

  //按下ESC
  dom.off(`keydown.${winid}`).on(`keydown.${winid}`, e => {
    if (e.keyCode === 27) props.closeType === 'hide' ? hide() : close()
  })

  //双击标题栏最大化切换
  header.on(`dblclick.${winid}`, () => fullscreenSwitch())

  //禁用动画
  dom.on(`mousedown.${winid}`, `#${winid}>.header,#${winid}>.size`, () => win.css('transitionDuration', '0ms'))

  //层级
  dom.on(`mousedown.${winid}`, `#${winid},#${winid}>.header,#${winid}>.size`, () => dom.data('winIndex', style.value.zIndex = dom.data('winIndex') + 1))

  //松开鼠标
  dom.on(`mouseup.${winid}`, () => {
    win.css('transitionDuration', '')   //恢复动画
    dom.off(`mousemove.${winid}`)          //释放移动监听
    return false
  })

  //移动
  dom.on(`mousedown.${winid}`, `#${winid}>.header`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      move(e1, e2)
      moveing() //移动中
      return false
    })
    return false
  })

  //左
  dom.on(`mousedown.${winid}`, `#${winid}>.size.left`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      left(e1, e2)
      resizeing()
      return false
    })
    return false
  })

  //上
  dom.on(`mousedown.${winid}`, `#${winid}>.size.top`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      top(e1, e2)
      resizeing()//改变大小中
      return false
    })
    return false
  })

  //右
  dom.on(`mousedown.${winid}`, `#${winid}>.size.right`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      right(e1, e2)
      resizeing()//改变大小中
      return false
    })
    return false
  })

  //下
  dom.on(`mousedown.${winid}`, `#${winid}>.size.bottom`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      bottom(e1, e2)
      resizeing()//改变大小中
      return false
    })
    return false
  })

  //左上
  dom.on(`mousedown.${winid}`, `#${winid}>.size.lefttop`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      left(e1, e2)
      top(e1, e2)
      resizeing()//改变大小中
      return false
    })
    return false
  })

  //右上
  dom.on(`mousedown.${winid}`, `#${winid}>.size.righttop`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      right(e1, e2)
      top(e1, e2)
      resizeing()//改变大小中
      return false
    })
    return false
  })

  //右下
  dom.on(`mousedown.${winid}`, `#${winid}>.size.rightbottom`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      right(e1, e2)
      bottom(e1, e2)
      resizeing()//改变大小中
      return false
    })
    return false
  })

  //左下
  dom.on(`mousedown.${winid}`, `#${winid}>.size.leftbottom`, e1 => {
    e1 = get(e1)
    dom.on(`mousemove.${winid}`, e2 => {
      left(e1, e2)
      bottom(e1, e2)
      resizeing()//改变大小中
      return false
    })
    return false
  })

})
// 通过 defineExpose暴露open和close方法,显式地暴露组件内部的方法或属性，使得这些方法或属性可以在外部被访问和调用
defineExpose({open, close, hide})
</script>
<style scoped>
@keyframes openScale {
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

@keyframes closeScale {
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

.windowBox {
  overflow: auto;
  background-color: #fff;
  box-shadow: 0 0 10px -1px #d4d4d4;
  border: 1px solid #dadce0;
  border-radius: 5px;
  position: absolute;
  transition-duration: 200ms;
  transform-origin: center;
  display: none;
  grid-template-rows: 38px auto;


  > .header {
    width: 100%;
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: space-between;
    padding-left: 5px;
    border-bottom: 1px solid #dadce0;
    background-color: #f3f3f3;
    user-select: none;

    > .title {
      font-weight: bold;
    }

    > .button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      > span {
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.close {
          font-size: 20px;

          &:hover {
            color: #FFF;
            background-color: red;
          }
        }

        &.fullscreen {
          font-size: 18px;

          &:hover {
            color: #35a1fd;
            background-color: #e8e8e8;
          }
        }
      }
    }
  }

  > .body {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  &.disabledHeader {
    grid-template-rows:auto;
  }

  &.close {
    display: grid;
    animation: closeScale .3s;
  }

  &.open {
    display: grid;
    animation: openScale .3s;
  }

  > .size {
    position: absolute;
    z-index: 1;
  }

  > .size.left {
    width: 5px;
    height: 100%;
    cursor: ew-resize;
  }

  > .size.top {
    width: 100%;
    height: 5px;
    cursor: ns-resize;
  }

  > .size.right {
    width: 5px;
    height: 100%;
    right: 0;
    cursor: ew-resize;
  }

  > .size.bottom {
    width: 100%;
    height: 5px;
    bottom: 0;
    cursor: ns-resize;
  }

  > .size.lefttop {
    width: 10px;
    height: 10px;
    cursor: nwse-resize;
  }

  > .size.righttop {
    width: 10px;
    height: 10px;
    right: 0;
    cursor: nesw-resize;
  }

  > .size.rightbottom {
    width: 10px;
    height: 10px;
    right: 0;
    bottom: 0;
    cursor: nwse-resize;
  }

  > .size.leftbottom {
    width: 10px;
    height: 10px;
    bottom: 0;
    cursor: nesw-resize;
  }
}
</style>
<style>
.windowBox.open {
  > .body {
    > .t-descriptions {
      width: 100%;
      height: 100%;
      overflow: hidden auto;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .t-tabs {
      height: 100%;

      > .t-tabs__content {
        height: calc(100% - 48px);

        > .t-tab-panel {
          height: 100%;

          > .t-descriptions {
            width: 100%;
            height: 100%;
            overflow: hidden auto;

            &::-webkit-scrollbar {
              display: none;
            }
          }
        }
      }
    }
  }
}
</style>