<template>
<div>
  <div style="border-bottom: 1px solid #e0e0e0;">
    <t-link style="padding: 10px;" :onClick="download" v-if="download" theme="success" >文件下载</t-link>
  </div>
  <vue-office-pdf :src="src" v-if="ext === 'pdf'" />
  <vue-office-excel :key="src" :src="src" v-if="ext === 'xlsx' && isf" @error="handleError" @rendered="handleRendered" />
  <vue-office-docx :src="src" v-if="ext === 'docx'" />
  <div style="text-align: center"><img :src="src" v-if="ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' " /></div>

  <div v-if="isf===false" style="text-align: center;margin-top:10px;color: #888;">文件预览失败， 请点击下载预览</div>


</div>
</template>

<script setup>
import VueOfficePdf from "@vue-office/pdf";
import VueOfficeDocx from "@vue-office/docx";
import VueOfficeExcel from '@vue-office/excel'

import {onMounted, reactive, ref, watch} from 'vue';
import siyi from '@/core/script/siyi';
import apiUrl from "@/core/config/url2.js";
import * as api from '@/core/script/api';
import dialog from "@/core/script/dialog.js";


const src = ref('')
const ext = ref('')
const downloadUrl = ref('')
const isf= ref(true)

const props = defineProps({
  query: {
    type: Object,
    default: {}
  },
  dialog: { type: Object },
  getAttach: { type: Function, default: () => { } },
})

const name = ref('')

const handleRendered = () => {
  console.log('Excel 渲染成功')
}

const handleError = (err) => {
  isf.value = false
  console.log('Excel 渲染失败:', err)
}

const download =  async () => {
  try {
    const response = await fetch(downloadUrl.value)
    if (!response.ok) throw new Error(`请求失败: ${response.status}`)

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = name.value
    link.click()

    URL.revokeObjectURL(url)
  } catch (err) {

  }

}

onMounted(async () => {
  let field = props.query.asset?.field
  // console.log('col', props.query.asset)
  // console.log('col', field)
  if(field === 'attachment_one'){
    src.value = props.query.asset.attachment[0]?.response?.url
    ext.value = props.query.asset.attachment[0]?.response?.ext
    name.value = props.query.asset.attachment[0].name
    downloadUrl.value = props.query.asset.attachment[0]?.response?.url;
    console.log('src.value', src.value, ext.value, name.value, downloadUrl.value)
  }

  if(field === 'attachment_two'){
    src.value = props.query.asset.attachment[1]?.response?.url
    ext.value = props.query.asset.attachment[1]?.response?.ext
    name.value = props.query.asset.attachment[1]?.name
    downloadUrl.value = props.query.asset.attachment[1]?.response?.url
    console.log('src.value', src.value, ext.value, name.value, downloadUrl.value)
  }
  if(field === 'attachment_three'){
    src.value = props.query.asset.attachment[2]?.response?.url
    ext.value = props.query.asset.attachment[2]?.response?.ext
    name.value = props.query.asset.attachment[2]?.name
    downloadUrl.value = props.query.asset.attachment[2]?.response?.url
    console.log('src.value', src.value, ext.value, name.value, downloadUrl.value)
  }
})
</script>

<style scoped>
.form-body {
  padding: 20px 30px;
}

.w297{
  width: 297px;
}
.fleft{
  float: left;
}
.clear{
  clear:both
}
.w274{
  width: 274px;
}
.download{
  margin-left:  20px;font-size: 22px;cursor: pointer;
}
.download:hover{
  color: royalblue;
}
</style>