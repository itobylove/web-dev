<template>
  <div class="page">
    <transition>
      <keep-alive>
        <component :is="page.component" :key="page.key"/>
      </keep-alive>
    </transition>
  </div>
</template>

<script setup>
import {onActivated, onMounted, ref, shallowRef} from "vue"
import siyi from '@/core/script/siyi.js'
import * as user from "@/core/script/user.js";

const pageMap = {
  '404': () => import('@/modules/home/404.vue'),
  test: () => import('@/modules/page/test.vue'),
  visitor: () => import('@/modules/visitor/visitor.v250707.vue'),
};

const pageConfig = {
  visitor: {title: '电子通行证', login: false},
  test: {title: '测试', login: true},
};

const pageName = ref('');

const page = shallowRef({});


const pageInit=()=>{
  pageName.value= window.location.pathname.split('/').filter(i => i && i !== 'page')?.[0] || 'index';
}

const pageOpen = async () => {
  const name = pageName.value;
  const pageComponent = pageMap[name] || pageMap['404'];
  const component = await pageComponent();
  page.value = {
    name,
    title: pageConfig[name]?.title || '页面',
    component: component.default,
    key: `page-${name}`,
  };
  document.title = page.value.title || siyi.nav.title;
};

const checkLogin = async () => {
  const name = pageName.value;
  if (pageConfig[name]?.login) {
    return await user.isLogin();
  }
  return true;
}



onMounted(async () => {
  console.log('page onMounted',siyi.user)
});

onActivated(async() =>{
  console.log('page onActivated start',siyi.user)
  pageInit();
  await checkLogin();
  await pageOpen();
  console.log('page onActivated end',siyi.user)
})

</script>

<style scoped>
.page {
  height: 100%;
  overflow: auto;
}
</style>