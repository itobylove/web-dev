<template>
<p>{{siyi.user?.nickname}} {{siyi.user?.id}}</p>
</template>
<script setup >
import siyi from "../../core/script/siyi.js";
import {onActivated,onMounted} from "vue";

onMounted(() =>{
  console.log('test onMounted',siyi.user)
})
onActivated(() =>{
  console.log('test onActivated',siyi.user)
})

</script>
