<template>
  <div class="scrollbar">
  <div class="checkin-page">
    <div class="header">
      <img class="logo" :src="logoUrl" />
      <div class="welcome-text">欢迎使用 <br/> {{vData.dataOption['plant_id'][vData.plant_id]}}电子通行证</div>
    </div>

    <!--    申请单展示   -->
    <t-cell-group bordered v-if="apply?.id"  >
      <t-cell title="访客公司" :note="apply.contact_company"  v-if="apply.contact_company" style="margin-top: 20px"/>
      <t-cell title="来访目的" :note="vData.dataOption['scene_id']?.[apply.scene_id] +' - '+ apply.remark"/>
      <t-cell title="访客备注" :note="apply.visitor_remark" v-if="apply.visitor_remark?.length>0" />
      <t-cell title="来访人数" :note="apply.visitor_number+1+'人'" />
      <t-cell title="有效时间" :note="apply.stay_day+'天'"  style="margin-top: 20px"/>
      <t-cell title="开始时间" :note="apply.start_time" v-if="apply.start_time?.length>0" />
      <t-cell title="结束时间" :note="apply.end_time" v-if="apply.start_time?.length>0" />
      <t-cell title="入厂时间" :note="apply.checkin_at" v-if="apply.checkin_at" />
      <t-cell title="出厂时间" :note="apply.checkout_at" v-if="apply.checkout_at" />
      <t-cell title="入厂放行" :note="apply?._text?.checkin_user_id" v-if="apply?.checkin_user_id" />
      <t-cell title="状态" v-if="apply.status===STATUS_CHECKIN" :note="(apply.checkout_at?'已出厂':'已入厂')+'(' + apply.checkin_times+(apply.checkin_limit?'/':'')+(apply?.checkin_limit || '')+'次)'"/>
      <t-cell title="状态" v-else :note="vData.dataOption['status']?.[apply.status]"/>

      <t-cell title="放行检测"  style="margin-top: 20px">
        <template #note><t-tag  :theme="vData.checkResult.theme" size="large">{{vData.checkResult.msg}}</t-tag></template>
      </t-cell>
    </t-cell-group>

    <t-form ref="formRef" v-if="apply?.id" v-show="vData.checkResult?.in || vData.checkResult?.in"  :rules="form.rules" :data="form.data"
            @submit="form.onSubmit" :disabled="form.readonly"
            reset-type="empty" labelWidth="100px" label-align="left"  style="margin-top: 20px">
      <t-form-item label="放行备注" name="checkin_remark" >
        <t-input v-model="form.data.checkin_remark" borderless align="right"/>
        <t-input v-model="form.data.checkout" type="hidden" borderless align="right"/>
      </t-form-item>
    </t-form>

    <!--   操作按钮  -->
    <div class="form-btn-group" v-show="!list.isShow">
      <t-button theme="primary" size="small" v-if="vData.checkResult?.in" @click="doCheckin(false)">放行：入厂</t-button>
      <t-button theme="warning" size="small" v-if="vData.checkResult?.out" @click="doCheckin(true)">放行：出厂</t-button>
      <t-button theme="default" size="small" v-show="vData.checkResult?.in || vData.checkResult?.out"  @click="log.isShow=true">出入记录</t-button>
    </div>

    <!--  申请单信息-补充（只读） -->
    <t-cell-group bordered v-if="apply?.id" >
      <t-cell title="访客姓名" :note="apply.contact_name"  v-if="apply.contact_name"/>
      <t-cell title="访客电话" v-if="apply.contact_phone">
        <template #note>
          <a :href="`tel:${apply.contact_phone}`">{{apply.contact_phone }}</a>
        </template>
      </t-cell>
      <t-cell title="身份证号" :note="apply.contact_idcard"  v-if="apply.contact_idcard"/>
      <t-cell title="接待人" :note="apply.reception_user_name" v-if="apply.reception_user_name"/>
      <t-cell title="接待电话" v-if="apply.reception_user_phone">
        <template #note>
          <a :href="`tel:${apply.reception_user_phone}`">{{apply.reception_user_phone }}</a>
        </template>
      </t-cell>
      <t-cell title="接待地址" :note="apply.reception_address"  v-if="apply.reception_address" />
      <t-cell title="审核时间" :note="apply.approval_at" v-if="apply.approval_at" />
    </t-cell-group>

    <t-pull-down-refresh v-else ref="listRef" v-show="list.isShow" v-model="list.refreshing"  @refresh="list.onRefresh"
                         style="overflow:auto;height: calc(100vh - 120px - 50px);" >
      <t-input  placeholder="搜索 访客姓名/接待人姓名" v-model="list.keyword" @change="list.load" clearable />
      <t-list  @scroll="list.onScroll" v-show="list.list.length">
        <t-cell @click="list.click(item)" v-for="item in list.list" :key="item.id" align="middle"
                :title="item.title"  :note="item.note"
        >
          <template #description>
            <p v-html="item.description"></p>
          </template>
        </t-cell>
      </t-list>
      <t-empty v-show="!list.list.length" :description="list.loading?'加载中...':'暂无数据'" />
    </t-pull-down-refresh>

    <div class="form-btn-group" v-show="!list.isShow" >
      <t-button theme="default" size="small" v-if="siyi.wechat"  @click="scanQRCode()">扫码</t-button>
      <t-button theme="default" size="small" v-if="!list.isShow"  @click="list.load()">返回列表</t-button>
    </div>

  </div>

    <dialogComponent title="出入记录" v-if="log.isShow" width="95%" :forceEnlarge="false" height="70%" maxWidth="480" type="window" :className="logBox" @afterClose="()=>log.isShow=false">
          <t-cell v-for="item in log.list" :key="item.id" align="middle"
                  :title="item.user_id_text + '        ' + item.created_at_text"
                  :description="item.text"
          >
            <template #note>
              <t-tag :theme="item.type==='check-in'?'primary':'success'">{{item.type_text}}</t-tag>
            </template>
          </t-cell>
        <t-empty v-show="!log.list.length" description="暂无数据" />
    </dialogComponent>


  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import * as core from '@/core/script/core.js'
import * as api from "@/core/script/api.js"
import {getOptionMap, getOptionsLabel} from "@/utils/vars.js";
import {plantList} from "@/utils/erp.js";
import * as ww from '@wecom/jssdk'
import {useWechat} from "@/utils/Wechat.js";
import apiUrl from "@/core/config/url.js";
import _ from 'lodash';
import dialogComponent from "@/core/component/dialog.vue";
import dialog from "@/core/script/dialog.js";
import dayjs from "dayjs";
import siyi from "@/core/script/siyi.js";
import {STATUS_APPROVED, STATUS_CHECKIN, STATUS_EDIT, STATUS_FINISH} from "@/modules/visitor/const.js";

const logoUrl = '/img/logo.png';

//页面数据
const vData = reactive({
  plant_id:core.getDefaultPlantId(),
  sn:'',
  token:'',
  dataOption: {plant_id:{},scene_id: {},status: {}, },
  selectOption: {plant_id:[],scene_id: [],status: [],employee:[]},
  checkResult:{theme:'danger',msg:'',in:false,out:false},
});


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
    const apiResult=await api.get(api.url.visitor.apply.list,{
      sort:'desc',
      keyword:list.keyword,
      plant_id:vData.plant_id,
      rangeTime1:dayjs().subtract(7,'days').format('YYYY-MM-DD 00:00:00'),
      sortBy:'apply.start_time',
      status:[STATUS_CHECKIN],
    });
    apply.value={};
    list.list=apiResult.list.map((item,index)=>{
      console.log('item',item);
      return {
        ...item,
        title:(index+1)+'.【'+item.scene_name+'】'+item.contact_name + '（'+item.remark+'）',
        description:"公司："+item.contact_company+"<br/>"+"接待："+item['dept_id_text']+' / '+item.reception_user_name+"<br/>"+item.start_time?.substring(0,10)+' - '+item.end_time?.substring(0,10),
        note:item._text.status,
      }
    });
    list.loading=false;
    list.refreshing=false;
  },
  click:(item)=>{
    list.isShow=false;
    getDetail(item.source_data,null,item.id);
  },
  onRefresh:(e) => {
    list.load();
    console.log('onRefresh',e);
  },
  onScroll:(e) => {
    // console.log('onScroll',e);
  }
});


const log=reactive({
  isShow:false,
  list:[],
});

const apply=ref({id:0,plant_id:0,start_time:'',end_time:''});

const formRef = ref();
const form = reactive({
  isShow:false,
  data: {
    id:'',
    checkout:false,
    source_data:'',
    checkin_remark:'',
  },
  rules: {},
  onSubmit: async ({validateResult,firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);

    const result = await api.post(apiUrl.visitor.apply.checkin, {...form.data,status: STATUS_CHECKIN});
    if (!result?.id) return ;
    dialog.success('操作成功！');
    await getDetail(form.data.source_data,null,result.id);
  }
})

const doCheckin=async (isCheckOut)=>{
  if (!await dialog.confirmAsync('确定要放行，登记'+(isCheckOut?'出厂':'进厂')+'吗？')){
    return ;
  }
  form.data.checkout=isCheckOut;
  formRef.value.submit();
}



const initPage = async () => {
  const apiData=  await api.get(apiUrl.visitor.apply.init);
  vData.scene_list=apiData.scene_list;
  vData.dataOption = apiData?.option || {};
  vData.dataOption.plant_id = getOptionMap(plantList);
  vData.dataOption.scene_id = getOptionMap(vData.scene_list);
  vData.selectOption = getOptionsLabel(vData.dataOption);
}


const getDetail = async (sn,token,id) => {
  list.isShow=false;
  const loading=dialog.loading(formRef.value);
  const apiData = await api.get(api.url.visitor.apply.detail, {sn,token,id});
  loading.close();
  if (!apiData) return;
  form.data = _.pick(apiData.data,['id','source_data','checkin_remark']);
  apply.value = {...apiData.data};
  if (apply.value?.start_time){
    apply.value.start_time = dayjs(apply.value.start_time).format('YYYY-MM-DD HH:mm').toString();
    apply.value.end_time = dayjs(apply.value.end_time).format('YYYY-MM-DD HH:mm').toString();
  }else{
    apply.value.start_time = dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm').toString();
    apply.value.end_time = dayjs().add(apiData['stay_day'], 'day').format('YYYY-MM-DD HH:mm').toString();
  }
  if (apply.value?.plant_id ){
    vData.plant_id=apply.value.plant_id;
  }
  vData.checkResult=apiData?.checkResult || {theme:'danger',msg:'',in:false,out:false};
  log.list=apiData?.history || []
}



const scanQRCode=async () => {
  await ww.scanQRCode({
    needResult: true,
    scanType: ['qrCode'],
    success: async (res) => {
      const sn = core.query.get('sn','search',res?.resultStr);
      const token = core.query.get('key','search',res?.resultStr);
      if (typeof sn==='string' && sn.length>0){
        await getDetail(sn,token);
      }
    },
    error: async (e) => {
      console.log(JSON.stringify(e));
    }
  }).catch(async e => {
    console.log(JSON.stringify(e));
  })
}

onMounted(async () => {
  await initPage();
  vData.sn=core.query.get('sn');
  vData.token=core.query.get('key');
  core.query.set('sn');
  core.query.set('key');
  if (vData.sn){
    await getDetail(vData.sn,vData.token);
  }else{
    await list.load();
  }
  useWechat();
})

</script>

<style>

:root {
  --td-button-primary-bg-color: #ae7a51;
  --td-button-primary-border-color:#ae7a51;
  --td-button-primary-outline-color: #ae7a51;
  --td-button-primary-text-color: #fff;
  --td-button-primary-hover-bg-color: #9b6c45;
  --td-button-primary-hover-border-color: #9b6c45;
  --td-button-primary-active-bg-color: #935f3a;
  --td-button-primary-active-border-color: #935f3a;
  --td-button-primary-disabled-bg-color: #d6c2b4;
  --td-button-primary-disabled-outline-color: #d6c2b4;
  --td-button-primary-disabled-border-color: #d6c2b4;

  --td-button-default-text-color: #ae7a51;
}

.t-form{
  .t-form__item-extra{
    justify-content: end !important;
  }
}
.t-pull-down-refresh{
  .t-cell__note{
    min-width: 65px;
  }
}
</style>
<style scoped>

.checkin-page {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  box-sizing: border-box;
  max-width: 480px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: auto;

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
      flex: 1;
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

  :deep(.t-cell__note) {
    min-width: 50px;
  }

  :deep(.t-cell__description) {
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
    white-space: normal;
  }


  .info {
    margin: 5px 0;
  }

}
</style>
