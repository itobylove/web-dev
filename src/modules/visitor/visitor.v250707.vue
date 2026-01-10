<template>
  <div class="visitor-page scrollbar">

    <div class="header">
      <img class="logo" :src="logoUrl" />
      <div class="welcome-text">欢迎使用 <br/> {{vData.plantName}} 电子通行证</div>
    </div>

    <t-pull-down-refresh   v-show="list.isShow" v-model="list.refreshing"  style="min-height: 500px" @refresh="list.onRefresh"  desc="历史记录">
      <t-list  @scroll="list.onScroll" v-show="list.list.length">
        <t-cell @click="list.click(item)" v-for="(item,index) in list.list"
                :key="item.source_type" align="middle"
                :title="(index+1)+': 【'+item.scene_name+'】'+item.contact_name+'：'+item.visitor_remark +'（'+item.stay_day+'天）' "
                :description="item.start_time+'~'+item.end_time"
                :note="item.status_text"
        />
      </t-list>
      <t-empty v-show="!list.list.length" :description="list.loading?'加载中...':'暂无数据'" />
    </t-pull-down-refresh>
    <div class="form-btn-group"  v-show="list.isShow" >
      <t-button theme="default" type="button" size="small" @click="addApply()">申请入场码</t-button>
    </div>

    <t-form ref="formRef" v-show="!list.isShow"  :rules="form.data.id ? form.rules:{...form.rules,...form.rules0}" :data="form.data"
            @submit="form.onSubmit" @reset="form.onReset" :disabled="form.readonly"
            reset-type="empty" labelWidth="100px" label-align="left" >

      <t-form-item label="来访类型" name="scene_id" contentAlign="right" v-if="!form.data.id">
        <m-select  v-model="form.data.scene_id"  :options="vData.selectOption.scene_id" :input-opt="{align:'right',borderless:true}"/>
      </t-form-item>

      <t-form-item label="来访目的" name="remark" contentAlign="right" v-if="!form.data.id">
        <t-input v-model="form.data.remark" borderless align="right" placeholder="来做什么事，必填" />
      </t-form-item>

      <t-form-item label="接待人" name="reception_user_name" contentAlign="right" v-if="!form.data.id">
        <t-input v-model="form.data.reception_user_name" borderless align="right" placeholder="来找谁，必填" />
      </t-form-item>

      <t-form-item label="访客姓名" name="contact_name" contentAlign="right">
        <t-input v-model="form.data.contact_name" borderless align="right" placeholder="来访人的中文姓名，必填" />
      </t-form-item>
      <t-form-item label="访客电话" name="contact_phone">
        <t-input v-model="form.data.contact_phone" align="right" borderless placeholder="来访人的手机号，必填"/>
      </t-form-item>
      <t-form-item label="身份证号" name="contact_idcard">
        <t-input v-model="form.data.contact_idcard" align="right" borderless placeholder="来访人身份证号码，必填"/>
      </t-form-item>
      <t-form-item label="访客公司" name="contact_company">
        <t-input v-model="form.data.contact_company" align="right" borderless placeholder="来访人的公司、部门等，必填"/>
      </t-form-item>
      <t-form-item label="同行人数" name="visitor_number" contentAlign="right">
        <t-stepper v-model="form.data.visitor_number" theme="filled" :min="0" :step="1"/>
      </t-form-item>
      <t-form-item label="来访时间" name="start_time">
        <t-cell :note="form.data.start_time || '请选择'" @click="datetimePicker.open('start_time')"/>
      </t-form-item>

      <t-form-item label="结束时间" name="end_time" >
        <t-cell :note="form.data.end_time || '请选择' " @click="datetimePicker.open('end_time')"/>
      </t-form-item>

      <t-popup v-model="datetimePicker.isShow" placement="bottom">
        <t-date-time-picker @cancel="datetimePicker.dayIsShow=false" @confirm="datetimePicker.confirm"
                            title="选择时间" :value="datetimePicker.value" format="YYYY-MM-DD HH:mm"
                            mode="minute" :start="dateNow.toString()" :end="dateNow.add(1, 'month').toString()"
        />
      </t-popup>
      <t-form-item label="备注" name="visitor_remark" v-show="!form.readonly || form.data.visitor_remark">
        <t-input v-model="form.data.visitor_remark" borderless align="right" placeholder="其他补充说明，选填"/>
      </t-form-item>
    </t-form>


    <div class="form-btn-group" v-show="!list.isShow">
      <t-button theme="primary" type="submit" size="small" v-show="!form.readonly" @click="formRef.submit()">提交</t-button>
      <t-button theme="danger" v-if="siyi.user?.id && applyData?.user_id===siyi.user?.id" v-show="!form.readonly" type="button" size="small" @click="delApply()">删除</t-button>
      <t-button theme="danger" v-if="siyi.user?.id && applyData?.user_id===siyi.user?.id" v-show="[STATUS_APPROVING,STATUS_REJECT].includes(applyData?.status)" type="button" size="small"  @click="editApply()">撤销重填</t-button>
      <t-button theme="default" v-if="siyi.user?.id" type="button" size="small" @click="showList()">返回</t-button>
    </div>


    <t-popup v-model="qrcode.isShow" v-if="applyData?.id" class="visitor-page-qrcode" placement="center" destroy-on-close >
      <p>通行码 - <span :class="'text-'+qrcode.result['theme']">{{qrcode.result['msg']}}</span></p>
      <div class="qrcode-image">
        <img class="qrcode-img" :src="qrcode.url" alt="二维码" @click="getApply()" :title="qrcode.text"/>
        <div class="qrcode-overlay" v-show="qrcode?.expire_left<=0">
          <div class="overlay-center">
            <div class="title">已失效，点此重新获取</div>
          </div>
        </div>
      </div>
      <h5>{{applyData.start_time}} ~ {{applyData.end_time}}</h5>
      <h4 v-show="qrcode.result?.tips">{{qrcode.result.tips}}</h4>
      <h4 v-show="qrcode?.tips">{{qrcode.tips}}</h4>
      <h3>出入厂时请出示此二维码</h3>
    </t-popup>

    <t-cell-group bordered :class="['info',form.readonly?'':'is_edit']" v-if="applyData?.id" v-show="!list.isShow">
      <t-cell title="来访目的" :note="vData.dataOption['scene_id']?.[applyData.scene_id]"/>
      <t-cell title="有效天数" :note="applyData['stay_day']+'天'"/>
      <t-cell title="接待人" :note="applyData.reception_user_name" v-show="applyData.reception_user_name"/>
      <t-cell title="接待电话" v-show="applyData.reception_user_phone">
        <template #note>
          <a :href="`tel:${applyData.reception_user_phone}`">{{ applyData.reception_user_phone }}</a>
        </template>
      </t-cell>
      <t-cell title="接待地址" :note="applyData.reception_address" v-show="applyData.reception_address"/>
      <t-cell title="状态" v-if="[STATUS_APPROVED,STATUS_CHECKIN].includes(applyData.status)" :note="qrcode.result['msg']"/>
      <t-cell title="状态" v-else :note="vData.dataOption['status']?.[applyData.status]"/>
      <t-cell title="备注" :note="applyData['approval_remark']" v-show="applyData['approval_remark']"/>
      <t-cell title="入厂码" >
        <template #rightIcon>
          <t-icon name="qrcode" @click="showQrcode()"/>
        </template>
      </t-cell>
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
import _ from 'lodash';
import dialog from "@/core/script/dialog.js";
import dayjs from "dayjs";
import siyi from "@/core/script/siyi.js";
import {STATUS_EDIT, STATUS_APPROVED, STATUS_CHECKIN, STATUS_APPROVING, STATUS_REJECT} from "@/modules/visitor/const.js";
import * as user from '@/core/script/user.js';
import MSelect from "@/core/component/m-select.vue";

const logoUrl = '/img/logo.png';

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
const list=reactive({
  isShow:false,
  refreshing:false,
  loading:false,
  list:[],
  keyword:'',
  load:async (keyword) => {
    if (keyword){
      list.keyword=keyword;
    }
    list.refreshing=true;
    list.loading=true;
    list.isShow=true;
    await getApply();
    list.loading=false;
    list.refreshing=false;
  },
  click: async (item) => {
    list.isShow = false;
    vData.sn = item.source_data;
    await getApply();
  },
  onRefresh:(e) => {
    list.load();
    console.log('onRefresh',e);
  },
  onScroll:(e) => {
    // console.log('onScroll',e);
  }
});

const showList= async () => {
  list.isShow = true;
  vData.sn = '';
  core.query.set('sn', '');
  await getApply();
}

//申请单信息
const applyData=ref({});

// 打开地图
const openMap= () => {
  const {reception_gps,reception_address}=applyData.value;
  if (!reception_gps || !reception_address) return ;
  const addrStr=';title:'+encodeURIComponent(vData.plantName)+';addr:'+encodeURIComponent(reception_address)+'&referer=myapp';
  const url =(siyi.pc?'https://apis.map.qq.com/uri/v1/geocoder?coord=':'https://apis.map.qq.com/uri/v1/marker?marker=coord:')+reception_gps+addrStr;
  dialog.confirm('是否查看地图?', async () => {
    window.open(url);
  })
}

// 表单
const formRef = ref();
const form = reactive({
  data: {
    id:null,
    scene_id:null,
    plant_id:1,
    contact_name:'',
    contact_phone:'',
    visitor_number:0,
    contact_company:'',
    start_time:'',
    end_time:'',
    visitor_remark:''
  },
  readonly: true,
  rules0: {
    scene_id:[
      { required: true, message: '请选择来访类型', trigger: 'change' },
      { type: 'number', min: 1, message: '请选择来访类型', trigger: 'change' }
    ],
    remark:[{ required: true, message: '请输入来访目的', trigger: 'change' },],
    reception_user_name:[{ required: true, message: '请输入接待人信息', trigger: 'change' },],
  },
  rules: {
    contact_name: [
      { required: true, message: '请输入来访人姓名', trigger: 'blur' },
      { type: 'string', pattern: /^[\u4e00-\u9fa5]{2,8}$/, message: '请输入中文姓名', trigger: 'blur' }
    ],
    contact_phone: [
      { required: true, message: '请输入来访人手机号', trigger: 'blur' },
      { type: 'string', pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    contact_idcard: [
      { required: true, message: '请输入来访人身份证号', trigger: 'blur' },
      { type: 'string', idcard: true,  message: '请输入18位身份证号', trigger: 'blur' }
    ],
    contact_company: [
      { required: true, message: '请输入来访人公司', trigger: 'blur' },
    ],
    visitor_number:[
      { required: true, message: '请填写人数', trigger: 'change' },
      { type: 'number', min: 0, message: '人数必须>=0', trigger: 'change' }
    ],
    start_time:[{ required: true, message: '请选择开始时间', trigger: 'change' },],
    end_time:[{ required: true, message: '请选择结束时间', trigger: 'change' },],
  },
  onSubmit: async ({validateResult,firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '数据提交中...')
    const {data:{message,data:result}} = await api.http.post(apiUrl.visitor.apply.visitor, form.data);
    loading.close();
    if (!result?.id) return dialog.error(message);
    dialog.success(message);
    if (!applyData.value?.id && result?.sn){
      vData.sn = result.sn;
    }
    await getApply();
  },
  onReset: (e) => {
    console.log('onReset', e)
  }
})

// 时间选择器
const datetimePicker=reactive({
  isShow: false,
  field:'',
  value:'',
  open:(field) => {
    datetimePicker.isShow = true;
    datetimePicker.field = field;
    const _date= form.data[field] ? dayjs(form.data[field]) : dayjs().add(1, 'day');
    datetimePicker.value = _date.format('YYYY-MM-DD HH:mm').toString();
  },
  confirm: (value) => {
    datetimePicker.isShow = false;
    form.data[datetimePicker.field] = value;
    if (datetimePicker.field==='start_time'){
      form.data.end_time =  dayjs(value).add(applyData.value['stay_day']-1, 'day').format('YYYY-MM-DD 17:30').toString();
    }
  }
})


const getApply = async () => {
  const loading= dialog.loading(null, '数据加载中...');
  const apiResult = await api.get(api.url.visitor.apply.visitor, {sn:vData.sn,plant_id:vData.plant_id});
  if (!apiResult) return;
  loading.close();
  applyData.value = {...apiResult.data,
    start_time:dayjs(apiResult.data.start_time).format('YYYY-MM-DD HH:mm').toString(),
    end_time:dayjs(apiResult.data.end_time).format('YYYY-MM-DD HH:mm').toString(),
  }

  form.data = _.pick(apiResult.data,['id','scene_id','plant_id','source_data','contact_name','contact_phone','contact_idcard','contact_company','visitor_number','start_time','end_time','visitor_remark']);
  if (!form.data?.start_time){
    form.data.start_time = dayjs().add(1, 'day').format('YYYY-MM-DD 08:00').toString();
  }
  if(!form.data.end_time){
    form.data.end_time = dayjs(form.data.start_time).add(applyData.value['stay_day']-1, 'day').format('YYYY-MM-DD 17:30').toString();
  }
  form.readonly= apiResult.data.status!==STATUS_EDIT;

  if (!vData.isInit){
    vData.dataOption = apiResult?.option || {};
    vData.selectOption = getOptionsLabel(vData.dataOption);
    vData.selectOption.plant_id = plantList;
    vData.selectOption.scene_id= apiResult?.scene_list;
    vData.dataOption.scene_id=getOptionMap(apiResult?.scene_list)
  }

  vData.plant_id = form.data.plant_id;
  vData.plantName = getPlant(form.data.plant_id);

  qrcode.result= apiResult.result;
  if(qrcode.result?.['in'] || qrcode.result?.['out']){
    showQrcode();
  }
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

// 修改申请单
const editApply=async ()=>{
  const confirm= await dialog.confirmAsync('是否撤销当前申请单 （撤销后需要重新审批）?', '操作确认');
  if (!confirm) return;
  const res= await api.post(api.url.visitor.apply.visitor, {sn:vData.sn,status:STATUS_EDIT});
  if (!res) return;
  dialog.success('撤回成功，请重新编辑后提交');
  await getApply();
}

// 删除申请单
const delApply= async () => {
  const confirm= await dialog.confirmAsync('是否删除当前申请单 （删除后无法找回）?', '操作确认');
  if (!confirm) return;
  const res= await api.post(api.url.visitor.apply.visitor, {sn:vData.sn,status:-1});
  if (!res) return;
  dialog.success('删除成功！');
  await showList();
}

// 二维码
const qrcode = reactive({
  isOK: false,
  isShow: false, title: '', url: '', text: '',expire_left:null,tips:'',
});

const showQrcode = () => {
  console.log('qrcode.result',qrcode.result);
  if (!qrcode.result?.['in'] && !qrcode.result?.['out']){
    dialog.warning(qrcode.result['msg']);
    return ;
  }
  qrcode.expire_left=null;
  qrcode.isShow=true;
  const qrText = api.getPageUrl('/',{sn:vData.sn,device:0,key:applyData.value.checkin_token},'checkin');
  QRCode.toDataURL(qrText, {width: 500,margin:0}, function (err, url) {
    if (err) console.error(err);
    qrcode.url = url;
    qrcode.text = qrText;
  })

  if (qrcode.result?.expire_at){
    const timer=setInterval(async ()=>{
      qrcode.expire_left = Math.ceil((dayjs(qrcode.result.expire_at) - Date.now())/1000);
      if (qrcode.expire_left<=0){
        clearInterval(timer);
        qrcode.tips='二维码已过期,点击图片重新获取';
      }else{
        qrcode.tips=qrcode.result.expire_at_tips.replace('{second}',qrcode.expire_left);
      }
    },1000)
  }

}

onMounted(async () => {
  vData.sn = core.query.get('sn');
  vData.sn || (await user.isLogin());
  vData.plant_id = core.query.get('plant_id');
  await getApply();
  if (list.list.length>0){
    list.isShow = true;
  }
  vData.isInit=true;
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
    position: absolute;
    bottom: 10px;
    width: 100%;
  }

}
</style>
