<template>
  <div>
    <p>开发中...</p>
  </div>
</template>
<script setup>
import {onActivated, onDeactivated, onMounted} from 'vue'
import siyi from '@/core/script/siyi.js'

const a = '123'

// 首次挂载
onMounted(() => {
})
// 页面显示时
onActivated(() => {
  siyi.nav.menus = [{
    label: '微信',
    icon: 'https://tdesign.gtimg.com/mobile/demos/wechat.png',
    fn() {
      console.log(a)
    }
  },
    {
      label: '朋友圈',
      icon: 'https://tdesign.gtimg.com/mobile/demos/times.png',
      fn() {
      }
    },
    {
      label: '朋友圈',
      icon: 'https://tdesign.gtimg.com/mobile/demos/times.png',
      fn() {
      }
    },
    {
      label: '朋友圈',
      icon: 'https://tdesign.gtimg.com/mobile/demos/times.png',
      fn() {
      }
    },
    {
      label: '朋友圈',
      icon: 'https://tdesign.gtimg.com/mobile/demos/times.png',
      fn() {
      }
    },
    {
      label: '朋友圈',
      icon: 'https://tdesign.gtimg.com/mobile/demos/times.png',
      fn() {
      }
    },
    {
      label: 'QQ',
      icon: 'https://tdesign.gtimg.com/mobile/demos/qq.png',
      fn() {
      }
    },
    {
      label: '企业微信',
      icon: 'https://tdesign.gtimg.com/mobile/demos/wecom.png',
      fn() {
      }
    },
    {
      label: 'QQ',
      icon: 'https://tdesign.gtimg.com/mobile/demos/qq.png',
      fn() {
      }
    }]
})
// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
})
</script>