<template>
  <div class="loading">
    <div>
      <t-progress theme="line" :color="{ from: '#00b2ff', to: '#00A870' }" :percentage="percentage" status="active"/>
    </div>
  </div>
</template>
<script setup>
import {ref} from 'vue'

const percentage = ref(0)
let T = setInterval(() => {
  percentage.value++
  if (percentage.value >= 99) clearInterval(T)
}, 50)
</script>
<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    width: 50%;
  }
}
</style>
