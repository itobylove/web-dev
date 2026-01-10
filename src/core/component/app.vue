<template>
  <transition>
    <keep-alive>
      <component :is="app.component.value" :key="app.key.value"/>
    </keep-alive>
  </transition>
</template>
<script setup>
import * as app from '@/core/script/app.js';

const url = new URL(window.location.href); //URL
if (url.pathname === '/') {
  const hash = url.hash.slice(1); //获取URL锚点去掉#号
  app.to(['workbench', 'login'].includes(hash) ? hash : 'index');
} else {
  app.to('page'); //单页应用
}
</script>