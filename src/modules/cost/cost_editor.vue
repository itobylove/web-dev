<template>
  <div>
    <div class="label">
        <span>字符颜色</span>
    </div>
    <div class="editor">
      <div v-if="type==='radio'">
        <dd class="name">设备组</dd>
        <dd class="value active">1#大族钻孔机组</dd>
        <dd class="value">2#激光钻孔机组</dd>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  modelValue: {type: Object, default: null},
  options: {type: Object, default: null},
  type: {type: String, default: null},
})


</script>
<style scoped>

</style>