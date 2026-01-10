<template>
  mobile home 开发中
</template>
<script setup>
import {onActivated} from "vue";
import siyi from '@/core/script/siyi.js'

onActivated(() => {
  siyi.nav.menus = [{
    label: '微信1',
    icon: 'https://tdesign.gtimg.com/mobile/demos/wechat.png',
    fn() {
      console.log(a)
    }
  },
    {
      label: '朋友圈1',
      icon: 'https://tdesign.gtimg.com/mobile/demos/times.png',
      fn() {
      }
    },
    {
      label: 'QQ1',
      icon: 'https://tdesign.gtimg.com/mobile/demos/qq.png',
      fn() {
      }
    },
    {
      label: '企业微信1',
      icon: 'https://tdesign.gtimg.com/mobile/demos/wecom.png',
      fn() {
      }
    },
    {
      label: 'QQ1',
      icon: 'https://tdesign.gtimg.com/mobile/demos/qq.png',
      fn() {
      }
    }]
})
</script>