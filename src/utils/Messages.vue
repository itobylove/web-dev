<template>
  <div class="message-modal" v-show="showList.length>0">
    <div :ref="(el) => setRef(el, index)" v-for="(item, index) in showList" :key="item.content + index" class="message-box"
         :class="[item.type]" :style="item.style">
      <div class="message-title">
        <span v-show="item.icon" class="message-icon" v-html="item.icon"></span>
        <span>{{ item.title }}</span>
        <span class="close-icon" @click="closeTarget(item._key)">×</span>
      </div>
      <div class="message-body" v-show="item.type==='confirm'">
        <p class="message-desc" v-show="item?.desc">{{item.desc}}</p>
        <div class="message-action">
          <button class="button yes" @click="closeTarget(item._key,{confirm:true})">是</button>
          <button class="button no" @click="closeTarget(item._key,{confirm:false})">否</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from "vue";

const props = defineProps({
  closeAll: Function
})

const emit = defineEmits(['close'])
let lastRef = null

function setRef(el, index) {
  if (el) {
    index ? (lastRef = el) : (lastRef = null)
    const height = lastRef?.clientHeight || 0
    el.style.top = 20+(height*index) + 'px'
  }
}

const showList = ref([])

function createMessage(options) {
  console.log('options',options);
  const _key=Math.random();
  showList.value.push({
    ...options,
    _key,
    icon:options?.icon || '❕️️',
    timer: options.duration===0?null:setTimeout(() => {
      closeTarget(_key);
    }, options.duration || 3000)
  })
  console.log('showList',showList.value);
}

function closeTarget(_key,param={}) {
  const target = showList.value.find(item => item._key === _key);
  console.log('target',target);
  console.log('showList',showList.value);
  target?.timer && clearTimeout(target.timer)
  showList.value = showList.value.filter(item => item._key !== _key);
  typeof target.onClose==='function' && target.onClose(param);
  if (!showList.value.length) {
    props.closeAll()
  }
}

defineExpose({
  createMessage
})
onMounted(() => {
})
onUnmounted(() => {
})
</script>

<style scoped lang="less">
.message-modal{
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99999999;
}

.message-box {
  display: flex;
  align-items: center;
  flex-direction:column;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translate(-50%, 0px);
  border-radius: 5px;
  padding: 12px 16px;
  font-size: 14px;

  //background-color: #f4f4f5;
  //color: #909399;

  background-color: #eee;
  color: rgba(0, 0, 0, 0.9);

  min-width: 300px;

  &.confirm{
    top: 40% !important;
    left: 50%;
    background-color: #eee;
    color: #5e5e5e;
  }

  &.success {
    //background-color: rgb(43, 164, 113);
    .message-icon{
      color: rgb(43, 164, 113);
    }
  }

  &.error {
    //background-color: rgb(246, 104, 93);
    .message-icon{
      color: rgb(246, 104, 93);
    }
  }

  &.warning {
    //background-color: rgb(250, 149, 80);
    .message-icon{
      color: rgb(250, 149, 80);
    }
  }

  &.info {
    //background-color: rgb(54, 110, 244);
    .message-icon{
      color: rgb(54, 110, 244);
    }
  }

  .message-title{
    font-size: 14px;
    padding: 10px;
  }
  .message-desc{
    font-size: 14px;
    padding: 10px;
    line-height: 40px;
  }

  .message-icon {
    width: 16px;
    height: 16px;
    line-height: 16px;
    margin-right: 5px;
    font-size: 20px;
  }

  .close-icon {
    width: 20px;
    height: 20px;
    line-height: 20px;
    margin-left: 10px;
    font-size: 20px;
    cursor: pointer;
    position: absolute;
    right: 10px;
    top: 10px;
  }

 .message-body {
    width: 100%;
    padding: 10px 10px 20px;


   .message-action{
     display: flex;
     justify-content: space-evenly;
   }

    .button{
      padding: 8px 30px;
      display: block;
      border: 1px solid gray;
      border-radius: 5px;
      font-size: 16px;
      line-height: 20px;
      color: #fff;
      cursor: pointer;
    }
   .yes{
     background-color: rgb(43, 164, 113);
   }
   .no{
     background-color: rgb(250, 149, 80);
   }
  }
}
</style>