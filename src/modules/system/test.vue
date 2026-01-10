<template>
  <div ref="mainRef" class="main">
    <div class="btn-list">
      <p>消息</p>
      <button @click="dialog.info('info')">info</button>
      <button @click="dialog.success('success')">success</button>
      <button @click="dialog.warning('warning')">warning</button>
      <button @click="dialog.error('error')">error</button>
      <button @click="dialog.question('question')">question</button>
    </div>
    <div class="btn-list">
      <p>loading</p>
      <button @click="loadingTest">loading</button>
    </div>
    <div class="btn-list">
      <p>对话框（同步）</p>
      <button @click="dialog.confirm('是否删除？',()=>{dialog.info('ok')},()=>{dialog.info('no')})">confirm</button>
      <button @click="dialog.input('Hello world',(val)=>{dialog.info(val)},'请输入')">Hello world</button>
      <button @click="dialog.select([{value:'1',label:'option 1'},{value:'2',label:'option 2'}],'2',(result)=>{dialog.info(JSON.stringify(result))},'请选择')">select</button>
    </div>
    <div class="btn-list">
      <p>对话框（异步）</p>
      <button @click="asyncConformTest">async confirm</button>
      <button @click="asyncInputTest">async input</button>
      <button @click="asyncSelectTest">async select</button>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";
import dialog from "@/core/script/dialog.js";
import * as api from "@/core/script/api.js"

const mainRef=ref();

const loadingTest=async () => {
  const loading = dialog.loading(mainRef.value,'数据加载中');
  setTimeout(()=>loading.close(), 2000)
};

const asyncConformTest=async () => {
  const result= await dialog.confirmAsync('确定要删除吗？');
  console.log('asyncConformTest result',result);
  result ? dialog.success('ok') : dialog.error('no');
};

const asyncInputTest=async () => {
const result= await dialog.inputAsync('Hello');
console.log('asyncInputTest result',result);
dialog.info(result)
};

const asyncSelectTest=async () => {
  const result= await dialog.selectAsync([{value:'1',label:'option 1'},{value:'2',label:'option 2'}],'1','请选择');
  console.log('asyncSelectTest result',result);
  dialog.info(JSON.stringify( result))
};

onMounted(async () => {
  console.log('onMounted');
  const res= await api.get(api.url2.user.info)
  console.log('res',res);

// Message: 'info', 'success', 'warning', 'error', 'question',
// loading: 'loading',
// Form: 'confirm','input','select',
// window: 'window'

})
</script>
<style scoped>
.main{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  background-color: #f5f5f5;

  .btn-list{
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    button{
      padding: 5px 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #fff;
      cursor: pointer;
    }
  }


}
</style>