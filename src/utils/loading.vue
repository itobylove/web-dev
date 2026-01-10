<template>
  <div v-if="visible" class="loading-overlay" ref="el">
    <div class="loading-spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>


<script setup>
import {ref} from "vue"

const visible = ref(false)
const message = ref("")
const el = ref();

const open = (msg) => {
  message.value = msg
  visible.value = true
};

const close = () => {
  visible.value = false
};

const update=(msg)=>{
  message.value = msg
}
// 通过 defineExpose暴露open和close方法,显式地暴露组件内部的方法或属性，使得这些方法或属性可以在外部被访问和调用
defineExpose({
  open,
  close,
  update,
  $el: el
})
</script>


<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  p {
    margin-top: 60px;
    font-size: 26px;
    color: var(--module-hover-background-color);
  }

  .loading-spinner {
    position: relative;
    width: 106px;
    height: 56px;
    background-image: linear-gradient(var(--module-hover-background-color) 50px, transparent 0),
    linear-gradient(var(--module-hover-background-color) 50px, transparent 0),
    linear-gradient(var(--module-hover-background-color) 50px, transparent 0),
    linear-gradient(var(--module-hover-background-color) 50px, transparent 0),
    radial-gradient(circle 14px, var(--module-hover-background-color) 100%, transparent 0);
    background-size: 48px 15px, 15px 35px, 15px 35px, 25px 15px, 28px 28px;
    background-position: 25px 5px, 58px 20px, 25px 17px, 2px 37px, 76px 0;
    background-repeat: no-repeat;
    transform: rotate(-45deg);

    &::after,
    &::before {
      content: "";
      position: absolute;
      left: -45px;
      top: -10px;
      width: 56px;
      height: 56px;
      border: 6px solid var(--module-hover-background-color);
      border-radius: 50%;
      background-repeat: no-repeat;
      background-image: linear-gradient(var(--module-hover-background-color) 64px, transparent 0),
      linear-gradient(var(--module-hover-background-color) 66px, transparent 0),
      radial-gradient(circle 4px, var(--module-hover-background-color) 100%, transparent 0);
      background-size: 40px 1px, 1px 40px, 8px 8px;
      background-position: center center;
      -webkit-animation: rotation 0.3s linear infinite;
      animation: rotation 0.3s linear infinite;
    }

    &::before {
      left: 25px;
      top: 60px;
    }
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>