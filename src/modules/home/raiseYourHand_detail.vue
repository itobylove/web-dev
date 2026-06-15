<template>
  <div>
    <t-form ref="formDataRef" :data="formData"  class="dialogClass" >
      <t-form-item label="发现问题区域" name="problem_area"  style="margin-top: 20px;" >
        <t-input v-model="formData.problem_area" disabled  placeholder="请输入内容" style="width: 95%;" />
      </t-form-item>
      <t-form-item label="问题类型" name="problem_type"  style="margin-top: 20px;" >
        <t-select v-model="formData.problem_type"  disabled  placeholder="请选择" style="width: 95%;"  />
      </t-form-item>
      <t-form-item label="举手内容" name="problem_details"  style="margin-top: 20px;" >
        <t-textarea v-model="formData.problem_details" disabled  placeholder="请输入内容" style="width: 95%;" :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
      </t-form-item>

      <t-form-item label="上传附件" name="problem_attach"   style="margin-top: 20px;" >
        <t-upload
            name="file"
            theme="file"
            v-model="formData.problem_attach"
            placeholder="未选择文件"
            accept="image/*|doc/*|excel/*|pdf"
            style="width: 279px;"
            clearable
            :max="3"
            filterable
            multiple
            disabled
        />
      </t-form-item>

      <t-form-item label="要求完成时间" name="problem_time_text"  style="margin-top: 20px;" >
        <t-date-picker v-model="formData.problem_time_text" disabled  />
      </t-form-item>

      <t-form-item label="处理部门经理" name="problem_time_text"  style="margin-top: 20px;" >
        <t-input v-model="formData.process_depar_uid_text" disabled  placeholder="请输入内容" style="width: 95%;" />
      </t-form-item>

      <t-form-item label="处理人" name="problem_time_text"  style="margin-top: 20px;" >
        <t-input v-model="formData.process_uid_text" disabled  placeholder="请输入内容" style="width: 95%;" />
      </t-form-item>

      <t-form-item label="处理描述" name="problem_time_text"  style="margin-top: 20px;" >
        <t-textarea v-model="formData.pu_details" disabled  placeholder="请输入内容" style="width: 95%;" :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
      </t-form-item>

      <t-form-item label="计划完成时间" name="problem_time_text"  style="margin-top: 20px;" >
        <t-date-picker v-model="formData.processing_time" disabled  />
      </t-form-item>

      <t-form-item label="处理附件" name="problem_time_text"  style="margin-top: 20px;" >
        <t-upload
            name="file"
            theme="file"
            v-model="formData.pu_atta"
            placeholder="未选择文件"
            accept="image/*|doc/*|excel/*|pdf"
            style="width: 279px;"
            clearable
            :max="3"
            filterable
            multiple
            disabled
        />
      </t-form-item>

<!--      <t-form-item style="margin-top: 20px;" v-show="formData.state === 3" >-->
<!--        <t-button theme="warning" style="margin-right: 35px;" @click="form.reset_submit(2)" >未完成</t-button>-->
<!--        <t-button theme="success" type="reset" @click="form.reset_submit(4)" >完成</t-button>-->
<!--      </t-form-item>-->

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

const formData = ref({})

const props = defineProps({
  query: {
    type: Object,
    default: {}
  },
  dialog: { type: Object },
  getAttach: { type: Function, default: () => { } },
})

const form = reactive({
  reset_submit:async (state) => {
    const res = await api.post(apiUrl.home.raise_mobile.user_process, {id: props.query.asset?.id, state: state})
    if(res){
      dialog.success(`数据提交成功`);
      props.getAttach(true);
      props.dialog.close();
    }
  }
})

onMounted(async () => {
  let id = props.query.asset?.id
  console.log('id',  props.query)
  console.log('id',  props.query.asset)
  if(id){
    const loading = dialog.loading()
    const res = await api.get(apiUrl.home.raise_mobile.details, {id})
    loading.close()
    if(res){
      formData.value = res.list
    }
  }
})

</script>

<style scoped>


.dialogClass{
  margin-left: 35px;
}
</style>