<template>
<div>
  <t-form class="form-body" :data="formData" :rules="tableRules" requiredMarkPosition="right" @submit="formRef.submit"  >
    <t-form-item label="提出人" name="require_uid"  class="w297 fleft" >
      <t-select
          v-model="formData.require_uid"
          :options="permission"
          :minCollapsedNum="10"
          placeholder="请选择人员"
          :onClear="() => {formRef.onClearSelect({key:'require_uid'})}"
          clearable
          filterable
          :disabled="!formData.is_require_uid"
      />
    </t-form-item>

    <t-form-item label="提出日期" name="propose_time" class="w274 fleft" style="margin-left:10px;" >
      <t-date-picker v-model="formData.propose_time" placeholder="请选择" :disabled="!formData.is_propose_time" ></t-date-picker>
    </t-form-item>

    <t-form-item label="待办事项" name="todo_matter"  class="clear" >
      <t-textarea v-model="formData.todo_matter" :disabled="!formData.is_todo_matter" placeholder=""></t-textarea>
    </t-form-item>

    <t-form-item label="责任(汇报)人" name="duty_user"  class=" fleft" style="width: 430px;" >
      <t-select
          v-model="formData.duty_user"
          :disabled="!formData.is_duty_user"
          :options="permission"
          :minCollapsedNum="3"
          placeholder="请选择人员"
          :onClear="() => {formRef.onClearSelect({key:'duty_user'})}"
          clearable
          filterable
          multiple
      />
    </t-form-item>

    <t-form-item label="计划完成时间" name="complete_time" class="w274 fleft" style="margin-left:10px;" >
      <t-date-picker v-model="formData.complete_time" placeholder="请选择" :disabled="!formData.is_complete_time" ></t-date-picker>
    </t-form-item>

    <t-form-item label="回复情况" name="reply" class="clear" >
      <t-textarea v-model="formData.reply" placeholder=""></t-textarea>
    </t-form-item>

    <t-form-item label="附件" name="attachment" tips="附件不能超过三个，格式为图片，pdf,xlsx,docx 其他格式不支持" >
      <t-upload 
        name="file"
        :action="uploadUrl" 
        :headers="headers"
        useMockProgress
        showUploadProgress
        autoUpload
        multiple
        v-model="formData.attachment"
        placeholder="未选择文件"
        accept="image/*|pdf|docx|excel"
        :max="3"
        style="width: 279px;"
        />
        <i title="下载附件" class="ri-file-download-fill download" v-if="false" ></i>
    </t-form-item>

    <t-form-item label="标色" name="marking" v-if="formData.is_marking" >
      <t-radio-group v-model="formData.marking" variant="primary-filled" default-value="0" style="background-color: #fff;border: 1px solid #b7c1ce;" >
        <t-radio-button value="red" >红<i class="ri-brush-2-fill" style="color:#ffc8ce"></i></t-radio-button>
        <t-radio-button value="green" >绿<i class="ri-brush-2-fill" style="color:#c6efcd;"></i></t-radio-button>
        <t-radio-button value="blue" >蓝<i class="ri-brush-2-fill" style="color:#4dc2ed;"></i></t-radio-button>
      </t-radio-group>
    </t-form-item>

    <t-form-item label="评论" name="comment" v-if="formData.is_comment" >
      <t-textarea v-model="formData.comment" placeholder=""></t-textarea>
    </t-form-item>

    <t-form-item style="clear: both;padding-top: 20px;">
      <t-button theme="primary" type="submit" >提交</t-button>
    </t-form-item>

  </t-form>

</div>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from 'vue';
import siyi from '@/core/script/siyi';
import apiUrl from "@/core/config/url2.js";
import * as api from '@/core/script/api';
import dialog from "@/core/script/dialog.js";
import { param } from 'jquery';

const uploadUrl = ref(apiUrl.home.todo_matter.uploadUrl)
const headers = ref(api.getHttpDefaultHeaders())
const props = defineProps({
  query: {
    type: Object,
    default: {}
  },
  dialog: { type: Object },
  getAttach: { type: Function, default: () => { } },
})

const permission = ref()

const getNowDateTime = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // 新增：补充分秒（如果接口需要完整时间）
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // 2. 返回完整格式：YYYY-MM-DD HH:mm:ss
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formData = ref({
  require_uid: '',
  todo_matter: '',
  duty_user: '',
  complete_time: '',
  attachment: [],
  comment: '',
  marking: '',
  is_admin: true,
  propose_time: getNowDateTime(),

  is_propose_time: true,
  is_todo_matter: true,
  is_duty_user: true,
  is_complete_time: true,
  is_marking: true,
  is_comment: true,




})



const tableRules = reactive({
  complete_time: [{required: true, message: '请选择计划时间'}],
})

const formRef = {
  submit: async ({ validateResult, firstError }) => {
    if (validateResult === true) {
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.home.todo_matter.save, formData.value, {}, true)
      loading && loading.close();
      if(res?.data?.code === 20000){
        dialog.success(`数据提交成功`);
        props.getAttach(true);
        props.dialog.close();
      }
    } else {
      dialog.warning(firstError);
    }
  },
  onClearSelect: ({key}) => {
    formData.value[key] = '';
  }
}

onMounted(async () => {
  let id = props.query.asset?.id
  formData.value.require_uid = props.query?.uid;
  formData.value.depart_id = props?.query?.departId
  formData.value.is_require_uid = true;
  if(id){
    const res = await api.get(apiUrl.home.todo_matter.details, {id})
    if(res){
      formData.value = res
    }
  }

  api.post(apiUrl.home.excel.userList).then(res => {    
    permission.value = res.list
  })

  

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