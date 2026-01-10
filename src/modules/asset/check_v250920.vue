<template>
  <div class="asset_check scrollbar">

    <div class="header">
      <img class="logo" :src="logoUrl"/>
      <div class="welcome-text">{{ vData.dataOption['plant_id'][vData.plant_id] }} 资产盘点</div>
    </div>

    <div class="search" v-if="siyi.user.administrator">
      <t-input v-model="list.search" placeholder="输入资产代码/名称" align="center" clearable @clear="list.clear()">
        <template #prefixIcon>
          <i style="font-size: 26px" @click="scan()" class="ri-qr-scan-2-line"></i>
        </template>
        <template #suffix>
          <i class="ri-search-line" @click="list.doSearch()" style="font-size: 26px;margin-left: 20px;"></i>
        </template>
      </t-input>
    </div>
    <div class="form-btn-group search" v-else>
      <t-button theme="primary" type="button" size="small"  @click="scan()"><i class="ri-qr-scan-2-line" style="font-weight: lighter" /> 扫码</t-button>
    </div>

    <div class="main" style="min-height: 70%">
      <t-pull-down-refresh v-show="list.isShow" v-model="list.refreshing"  @refresh="list.onRefresh">
        <t-list @scroll="list.onScroll" v-show="list.list.length">
          <t-cell @click="list.detail(item.asset,true)" v-for="item in list.list"
                  :key="item.id" align="middle" :title="item.title" :description="item.description" :note="item.note"
          />
        </t-list>
        <t-empty v-show="!list.list.length" :description="list.loading?'加载中...':'暂无数据'"/>
      </t-pull-down-refresh>
      <div class="detail" v-show="!list.isShow && form.data.id">

        <t-form ref="formRef" :rules="form.rules" :disabled="form.readonly" :data="form.data" @submit="form.onSubmit" @reset="form.onReset" labelWidth="100px" label-align="left" >

          <t-form-item label="编码" name="code" >
            <t-input v-model="form.data.code" borderless align="right"/>
          </t-form-item>

          <t-form-item label="名称" name="name" >
            <t-input v-model="form.data.name" borderless align="right"/>
          </t-form-item>

          <t-form-item label="分类" name="cate_id" >
            <m-select-tree v-model="form.data.cate_id" :tree="vData.cateTree" title="分类" filterable />
          </t-form-item>

          <t-form-item label="状态" name="status" >
            <m-select v-model="form.data.status" :options="vData.selectOption['status']" />
          </t-form-item>

          <t-form-item label="备注" name="remark" >
            <t-input v-model="form.data.remark" borderless align="right" />
          </t-form-item>

          <t-form-item label="位置" name="area_id" >
            <m-select-tree v-model="form.data.area_id" :tree="vData.areaTree" title="位置" filterable />
          </t-form-item>

<!--          <t-form-item label="位置信息" name="area_remark" >
            <t-input v-model="form.data.area_remark" borderless align="right" />
          </t-form-item>-->

          <t-form-item label="领用人" name="manager_code" >
            <m-select v-model="form.data.manager_code" @change="form.onManagerChange"  :options="vData.selectOption.employee" filterable />
          </t-form-item>

          <t-form-item label="领用时间" name="manager_at" >
            <t-input v-model="form.data.manager_at" readonly  borderless align="right"  @click="datetimePicker.open('manager_at')" />
          </t-form-item>

<!--          <t-form-item label="领用备注" name="manager_remark" >
            <t-input v-model="form.data.manager_remark" borderless align="right" />
          </t-form-item>-->

        </t-form>

        <div class="form-btn-group">
          <t-button theme="primary" type="submit" size="small" v-show="!form.readonly"  @click="formRef.submit()">更新</t-button>
          <t-button theme="default" type="button" size="small"  @click="list.isShow=true">返回</t-button>
        </div>

        <t-cell-group bordered class="check_info">
          <t-cell title="盘点时间" :note="form.data.check_at_text" v-show="form.data.check_at_text" @click="openMap(form.data)"/>
          <t-cell title="盘点人" :note="form.data.check_uid_text" v-show="form.data.check_uid_text" />
        </t-cell-group>

        <t-cell-group bordered class="attrs">
          <t-cell v-for="attr in form.attrs" :key="attr.bind_id" :title="attr.name" :note="attr.attr_value" v-show="attr.attr_value"/>
        </t-cell-group>
      </div>

    </div>


    <t-popup v-model="datetimePicker.isShow" placement="bottom">
      <t-date-time-picker  @confirm="datetimePicker.confirm"
            title="选择时间" :value="datetimePicker.value" format="YYYY-MM-DD"
            mode="date" :start="dateNow.subtract(5, 'year').toString()" :end="dateNow.toString()"
      />
    </t-popup>

    <div class="footer">
      <p>© 2010–2025 湖北龙腾电子科技股份有限公司</p>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import * as api from "@/core/script/api.js"
import {getOptionLabel, getOptionMap, listToTree} from "@/utils/vars.js";
import {plantList} from "@/utils/erp.js";
import {dateNow} from "@/utils/tdesign.js";
import _ from 'lodash';
import dialog from "@/core/script/dialog.js";
import dayjs from "dayjs";
import siyi from "@/core/script/siyi.js";
import * as user from '@/core/script/user.js';
import MSelect from "@/core/component/m-select.vue";
import MSelectTree from "@/core/component/m-select-tree.vue";
import {useWechat, getLocation, scanQRCode, openLocation} from "@/utils/Wechat.js";

const logoUrl = '/img/logo.png';

//页面数据
const vData = reactive({
  plant_id: 1,
  cate_id: 1,
  cateTree:[],
  areaTree:[],
  isInit: false,
  dataOption: {plant_id: {}, cate_id: {}, area_id: {}, status: {},employee:{}},
  selectOption: {plant_id: [], cate_id: [], area_id: [], status: [],employee:[]},
});


const scan=async () => {
  const code = await scanQRCode();
  if (typeof code==='string' && code.length>0){
    list.code=code;
    list.search=code;
    await list.load(true)
  }
}

const openMap=async (asset)=>{
  const gps =  asset.check_gps ? asset.check_gps.split(',') : null;
  if (!gps || !siyi.wechat) return;
  await openLocation(...gps,{
    name: asset.name + `(${asset.code})`,
    address:vData.dataOption.area_id?.[asset.area_id]?.full_name + ' '+ (asset?.area_remark || ''),
  })
};

//申请记录
const list = reactive({
  isShow: false,
  refreshing: false,
  loading: false,
  list: [],
  search: '',
  doSearch:()=>{
    list.code='';
    list.load(true)
  },
  load: async (doCheck=false) => {
    list.refreshing = true;
    list.loading = true;
    list.isShow = true;
    const apiResult = await api.get(api.url.asset.list.list, {
      plant_id: vData.plant_id,
      cate_id: vData.cate_id,
      code: list.code,
      search: list.search,
    });
    if (!apiResult) return;
    list.list=apiResult.map((item,index) => {
      return {
        id:item.id,
        title: (index+1)+": "+item.name +' '+item.code ,
        description:  item.manager_dept +'('+item.manager_name+')'+ ' '+ (vData.area_id?.[item.area_id]?.['area_full_name'] || '') + ' '+(item?.area_remark || ''),
        note: item.status_text,
        asset:item,
      }
    });
    list.loading = false;
    list.refreshing = false;
    if (list.list.length===1){
      await list.detail(list.list[0].asset,doCheck);
    }
  },
  clear:()=>{
    list.code='';
    list.search='';
    list.list=[];
    form.data={};
    form.attrs=[];
  },
  detail: async (asset,doCheck=false) => {
    if (doCheck) {
      asset = await form.doCheck(asset.id); // 自动提交，上报更新
      if (!asset) return;
      dialog.success('盘点成功');
    }
    list.isShow = false;
    await form.show(asset);
  },
  onRefresh: (e) => {
    list.load();
    console.log('onRefresh', e);
  },
  onScroll: (e) => {
    // console.log('onScroll',e);
  }
});


// 时间选择器
const datetimePicker=reactive({
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
  }
})


// 表单
const formRef = ref();
const form = reactive({
  data: {
    id: null,
    plant_id: 1,
    cate_id: null,
    area_id: null,
    name: '',
    code: '',
    status: '',
    area_remark: '',
    remark: '',
    is_checked:true,
  },
  attrs:[],
  readonly: !siyi.user.administrator && !siyi.user.permissions.includes(`asset/list/save`),
  rules: {
    plant_id: [{required: true, message: '请选择工厂', trigger: 'blur'},],
    cate_id: [{required: true, message: '请选择分类', trigger: 'blur'},],
    name: [{required: true, message: '请输入名称', trigger: 'blur'},],
    code: [{required: true, message: '请输入编号', trigger: 'blur'},],
    status: [{required: true, message: '请选择状态', trigger: 'blur'},],
  },
  show:async (asset)=>{
    const loading = dialog.loading(null, '数据加载中...');
    form.data = {...asset,is_checked:true};
    const list = await api.get(api.url.asset.list.value, {asset_id:asset.id, cate_id:asset.cate_id}, 'list');
    loading.close();
    form.attrs=list;
  },
  onManagerChange:(manager_code)=>{
    const manager=vData.selectOption.employee.find(item=>item.value===manager_code);
    form.data.manager_name=manager.hr.EmpName;
    form.data.manager_dept=manager.hr.PartName;
    form.data.manager_code=manager.hr.EmpNo;
    form.data.manager_uid=manager?.user?.id || null;
  },
  onSubmit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url.asset.list.save, {asset:form.data});
    loading && loading.close();
    if (res)  dialog.success('保存成功');
    await list.load()
  },
  doCheck:async (id) => {
    const loading = dialog.loading(undefined, '盘点中...');
    const check_gps = (await getLocation()) || null;
    const list = await api.post(api.url.asset.list.check, {id,check_gps});
    loading.close();
    return list?.[0];
  },
  onReset: (e) => {
    console.log('onReset', e)
  }
})


const initPage = async () => {
  const loading = dialog.loading(null, '数据加载中...');

  const apiResult= await api.get(api.url.asset.list.init,{hide_columns:true});

  vData.dataOption.status = apiResult.option.status;
  vData.selectOption.status = getOptionLabel(vData.dataOption.status);


  vData.selectOption.plant_id = plantList;
  vData.dataOption.plant_id = getOptionMap(plantList);

  vData.selectOption.cate_id = getOptionLabel(apiResult.option.cate,'name','id');
  vData.dataOption.cate_id = _.keyBy(apiResult.option.cate,'id');
  vData.cateTree=listToTree(apiResult.option.cate.map((item) => {
    return {...item, value: item.id, label: item?.name}
  }));

  vData.selectOption.area_id = getOptionLabel(apiResult.option.area,'name','id');
  vData.dataOption.area_id = _.keyBy(apiResult.option.area,'id');
  vData.areaTree=listToTree(apiResult.option.area.map((item) => {
    return {...item, value: item.id, label: item?.name}
  }));

  vData.selectOption.employee = await api.employeeSelector(null,{with:'user'});

  loading.close();
}


onMounted(async () => {
  await initPage();
  useWechat();
})

</script>

<style>
:root {
  --td-button-primary-bg-color: #ae7a51;
  --td-button-primary-outline-color: #ae7a51;
  --td-button-primary-text-color: #fff;
  --td-search-height: 40px;
}

</style>
<style scoped>

.asset_check {
  padding: 0 0 50px 0;
  background: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
  max-width: 480px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100px;

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

  .search {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }
  .detail{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap:10px;

    > * {
      width: 100%;
    }


  }

  .form-btn-group {
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    padding: 0 30px;
    margin:10px;

    button {
      line-height: 40px;
      height: 40px;
      flex: 1;
      //background-color: #ae7a51;
    }
  }

  .footer {
    text-align: center;
    font-size: 14px;
    line-height: 40px;
    color: gray;
    width: 100%;
  }

}
</style>
