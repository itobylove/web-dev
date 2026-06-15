<template>
  <div class="visitor-page scrollbar">

    <div class="header">
      <img class="logo" :src="logoUrl" />
      <div class="welcome-text">欢迎使用 <br/> {{vData.plantName}} 举手文化</div>
    </div>


    <t-form ref="formRef"
        :rules="form.data.id ? form.rules:{...form.rules,...form.rules0}"
        :data="form.data"
        @submit="form.onSubmit"
        @reset="form.onReset"
        reset-type="empty"
        labelWidth="100px"
        label-align="left"
    >
      <t-form-item label="发现问题区域" name="problem_area" contentAlign="right" v-if="!form.data.id" :labelWidth="120" >
        <t-input v-model="form.data.problem_area" borderless align="right" placeholder="发现问题区域，必填" />
      </t-form-item>

      <t-form-item label="问题类型" name="problem_type" contentAlign="right" v-if="!form.data.id">
        <m-select  v-model="form.data.problem_type"  :options="vData.selectOption.scene_id" :input-opt="{align:'right',borderless:true}"/>
      </t-form-item>

      <t-form-item label="举手内容" name="problem_details" contentAlign="right" v-if="!form.data.id">
        <t-textarea
          v-model="form.data.problem_details"
          borderless
        :autosize="{ minRows: 3 }"
          style="display: contents;"
        ></t-textarea>
      </t-form-item>

      <t-form-item label="上传附件" name="problem_attach" contentAlign="right">
        <t-upload
            accept="image/*"
            :max="3"
            placeholder="未选择文件"
            name="file"
            :action="uploadUrl"
            useMockProgress
            showUploadProgress
            :headers="headers"
            autoUpload
            multiple
            v-model="form.data.problem_attach"
        />
      </t-form-item>

      <t-form-item label="要求完成时间" name="problem_time" :labelWidth="120" >
        <t-cell :note="form.data.problem_time || '请选择'" @click="datetimePicker.open('problem_time')"/>
      </t-form-item>

      <t-popup v-model="datetimePicker.isShow" placement="bottom">
        <t-date-time-picker @cancel="datetimePicker.dayIsShow=false" @confirm="datetimePicker.confirm"
          title="选择时间"
          :value="datetimePicker.value"
          format="YYYY-MM-DD"
          mode="date"
          :start="dateNow.toString()"
          :end="dateNow.add(1, 'month').toString()"
        />
      </t-popup>
    </t-form>


    <div class="form-btn-group" >
      <t-button theme="primary" type="submit" size="small" @click="formRef.submit()">提交</t-button>
    </div>

    <t-cell-group bordered >
      <template v-for="(item, index) in raiseUserData" :key="index"  >
        <t-cell @click="form.dianji(item)" arrow >
          <template #title>
            {{item.problem_area}} | {{item.state_text}}
          </template>
        </t-cell>

      </template>
    </t-cell-group>

    <div class="footer">
      <p>© 2010–2025 湖北龙腾电子科技股份有限公司</p>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import * as core from '@/core/script/core.js'
import * as api from "@/core/script/api.js"
import QRCode from "qrcode";
import {getOptionMap, getOptionsLabel} from "@/utils/vars.js";
import {getPlant, plantList} from "@/utils/erp.js";
import {dateNow} from "@/utils/tdesign.js";
import apiUrl from "@/core/config/url.js";
import {to as navTo} from "@/core/script/nav.js"
import apiUrl2 from "@/core/config/url2.js";

import dialog from "@/core/script/dialog.js";
import dayjs from "dayjs";
import siyi from "@/core/script/siyi.js";

import * as user from '@/core/script/user.js';
import MSelect from "@/core/component/m-select.vue";

const logoUrl = '/img/logo.png';
const uploadUrl = ref(apiUrl2.home.raise_mobile.uploadUrl)
const raiseUserData = ref([]);

import { getHttpDefaultHeaders, url } from '@/core/script/api.js'

const headers = ref(getHttpDefaultHeaders())

//页面数据
const vData = reactive({
  sn:'',
  plant_id: 1,
  plantName:'湖北龙腾',
  isInit: false,
  dataOption: {scene_id: {},  status: {}, checkin_type: {}},
  selectOption: {scene_id: [],  status: [], checkin_type: []},
});


//申请记录
const list = reactive({
  isShow: false,
  refreshing: false,
  loading: false,
  list:[],
  keyword:'',
  load:async (keyword) => {
    if (keyword){
      list.keyword=keyword;
    }
    list.refreshing = true;
    list.loading = true;
    list.isShow = true;
    // await getApply();
    list.loading=false;
    list.refreshing=false;
  },
  click: async (item) => {
    list.isShow = false;
    vData.sn = item.source_data;
    // await getApply();
  },
  onRefresh:(e) => {
    // list.load();
    console.log('onRefresh',e);
  },
  onScroll:(e) => {
  }
});

// 表单
const formRef = ref();

const form = reactive({
  data: {
    problem_area: '',
    problem_type: '',
    problem_details: '',
    problem_attach: [],
    problem_time: '',
  },
  readonly: true,

  rules0: {},
  rules: {
    problem_area: [{required: true, message: '请填写问题发现区域', trigger: 'change'}],
    problem_type: [{required: true, message: '请选择问题发现类型', trigger: 'change'}],
    problem_time: [{required: true, message: '请选择要求完成时间', trigger: 'change'}],
  },
  onSubmit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '数据提交中...')
    await api.http.post(apiUrl2.home.raise_mobile.save, form.data);
    loading.close()
    formRef.value?.reset()
    await raiseList()
  },
  dianji: async (e) => {
    navTo('raise_detail', {id: e.id });
    console.log('dianji', e.id)
  },
  onReset: (e) => {
    console.log('onReset', e)
  }
})

// 时间选择器
const datetimePicker = reactive({
  isShow: false,
  field:'',
  value:'',
  open:(field) => {
    datetimePicker.isShow = true;
    datetimePicker.field = field;
    const _date= form.data[field] ? dayjs(form.data[field]) : dayjs().add(1, 'day');
    datetimePicker.value = _date.format('YYYY-MM-DD').toString();
  },
  confirm: (value) => {
    datetimePicker.isShow = false;
    form.data[datetimePicker.field] = value;
    // if (datetimePicker.field==='start_time'){
      // form.data.problem_time =  dayjs(value).add(applyData.value['stay_day']-1, 'day').format('YYYY-MM-DD').toString();
    // }
  }
})


const getApply = async () => {
  // const loading= dialog.loading(null, '数据加载中...');
  const apiResult = await api.get(api.url.visitor.apply.visitor, {sn:vData.sn,plant_id:vData.plant_id});
  if (!apiResult) return;
  const Result = await api.get(apiUrl2.home.raise_mobile.mobile_init, {sn:vData.sn,plant_id:vData.plant_id});
  vData.selectOption.scene_id = Result?.scene_list;
  vData.dataOption.scene_id = getOptionMap(Result?.scene_list)
  vData.plant_id = siyi.user.plantId;
  vData.plantName = getPlant(siyi.user.plantId);
  list.list = apiResult.history;
}

// 添加申请单
const addApply = async () => {
  list.list = [];
  list.isShow = false;
  vData.sn = '';
  core.query.set('sn', '');
  await getApply();
}

const raiseList = async () => {
  const res = await api.get(apiUrl2.home.raise_mobile.mobile_list);
  raiseUserData.value = res.list;
}


onMounted(async () => {
  await user.isLogin()
  await getApply();
  await raiseList();
  vData.isInit=true;
  siyi.mobile = false
})

</script>

<style>
:root {
  --td-button-primary-bg-color: #ae7a51;
  --td-button-primary-outline-color: #ae7a51;
  --td-button-primary-text-color: #fff;
}
.t-form{
  .t-form__item-extra{
    justify-content: end !important;
  }
}
.visitor-page-qrcode {
  max-width: 400px;
  width: 94%;
  text-align: center;
  padding: 10px;
  p{
    color: #07c160;
    font-size: 2rem;
    text-align: center;
    line-height: 3.5rem;
  }

  h3{
    font-size: 1.2rem;
    line-height: 2rem;
    color: #ae7a51;
  }
  h4{
    font-size: 1.1rem;
    line-height: 2.5rem;
    color: orangered;
  }
  h5{
    font-size: 1rem;
    line-height: 3rem;
  }
  .text-warning{
    color: orangered;
  }
  .text-success{
    color: green;
  }
  .text-danger{
    color: red;
  }

  .qrcode-image{
    position: relative;
    img{
      width:100%; height: 100%;
      padding: 10px 15px 0;
    }
    .qrcode-overlay {
      position: absolute;
      inset: 0; /* top/right/bottom/left 全 0 */
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border-radius: 8px;
      pointer-events: none; /* 遮罩不挡点击，如要禁止点击改成 auto */

      .overlay-center {
        z-index: 1;
      }

      .title {
        font-size: 18px;
        font-weight: 700;
        color: #c0392b;
        margin-bottom: 6px;
      }

    }
  }



}

</style>
<style scoped>

.visitor-page {
  padding: 0 0 50px 0 ;
  background: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
  max-width: 480px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;

  .header{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 120px;

    .logo {
      width: 160px;
      display: block;
      object-fit: contain;
      background: none;
    }

    .welcome-text {
      text-align: center;
      font-size: 24px;
      color: #333;
    }
  }

  .form-btn-group {
    display: flex;
    justify-content: center;
    margin: 30px 20px;
    gap: 20px;
    align-items: center;

    button {
      line-height: 40px;
      height: 40px;
      flex: 1;
      //background-color: #ae7a51;
    }
  }

  .info {
    margin: 5px 0;
  }
  .footer{
    text-align: center;
    font-size: 14px;
    line-height: 40px;
    color: gray;
    position: fixed;
    bottom: 10px;
    width: 100%;
  }

}
</style>
