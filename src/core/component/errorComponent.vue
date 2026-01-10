<template>
  <div class="devingbg" :style="devingbg">
    <div>模块加载出错了
      <t-progress theme="line" :color="{ from: '#00b2ff', to: '#00A870' }" :percentage="99" :status="'active'"/>
    </div>
  </div>
</template>
<script setup>
import devingimg from '@/core/assets/img/deving.jpg'

const devingbg = {backgroundImage: `url('${devingimg}')`}
</script>
<style scoped>
.devingbg {
  background: no-repeat 0 50% / contain;
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    width: 50%;
    text-align: center;
  }
}
</style>
