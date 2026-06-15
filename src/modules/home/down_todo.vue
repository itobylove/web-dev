<template>
<div>
  <div style="border-bottom: 1px solid #e0e0e0;">
    <t-link style="padding: 10px;" :onClick="download" theme="success" >文件下载</t-link>
  </div>
  <vue-office-pdf :src="src" v-if="ext === 'pdf'" />
  <vue-office-excel :src="src" v-if="ext === 'xlsx'" />
  <vue-office-docx :src="src" v-if="ext === 'docx'" />
  <div style="text-align: center"><img :src="src" v-if="ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' " /></div>


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

const props = defineProps({
  query: {
    type: Object,
    default: {}
  },
  dialog: { type: Object },
  getAttach: { type: Function, default: () => { } },
})

const name = ref('')

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
  let col = props.query.asset?.col
  // console.log('col', props.query.asset.attachment)
  if(col === 10){
    src.value = props.query.asset.attachment[0]?.response?.url
    ext.value = props.query.asset.attachment[0]?.response?.ext
    name.value = props.query.asset.attachment[0].name
    downloadUrl.value = props.query.asset.attachment[0]?.response?.url;
    console.log('src.value', src.value, ext.value, name.value, downloadUrl.value)
  }

  if(col === 11){
    src.value = props.query.asset.attachment[1]?.response?.url
    ext.value = props.query.asset.attachment[1]?.response?.ext
    name.value = props.query.asset.attachment[1]?.name
    downloadUrl.value = props.query.asset.attachment[1]?.response?.url
  }
  if(col === 12){
    src.value = props.query.asset.attachment[2]?.response?.url
    ext.value = props.query.asset.attachment[2]?.response?.ext
    name.value = props.query.asset.attachment[2]?.name
    downloadUrl.value = props.query.asset.attachment[2]?.response?.url
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