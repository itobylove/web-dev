<template>
  <div class="siyi-log-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind" @click="listBtn.action.click"   />

<!--        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />-->


        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small"  style="width: 100px"
                    @change="searchList('init')" :options="getUserPlantList('outwork-')">
        </vxe-select>

        <vxe-select v-show="!vData.isSupplier" v-model="vData.params.sup_id" placeholder="供应商" size="small" clearable filterable remote style="width: 200px"
                    :remoteMethod="async ({searchValue})=>{vData.supplierList=await api.supplierSelector(searchValue)}"  :options="vData.supplierList"
          @change="searchList"
        />

        <vxe-select v-model="vData.params.type" placeholder="类型" size="small" clearable style="width: 160px"
                    @change="searchList('init')" :options="vData.listLabel.type">
        </vxe-select>

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.status">
        </vxe-select>


        <vxe-input type="search" v-model="vData.params.search" size="small" placeholder="搜索" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 200px" />

        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>

      </template>
      <template #empty><span><img :src="noData"><p>{{ vData.msg }}</p></span></template>
    </vxe-grid>


  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import * as core from "@/core/script/core"
import * as api from "@/core/script/api"
import noData from '@/core/assets/img/nodata.gif'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import {VxeUI} from "vxe-pc-ui";
import {getOptionsLabel} from "@/utils/vars.js";
import {getUserPlantList} from "@/utils/erp.js";
import dialog from "@/core/script/dialog.js";
import siyi from '@/core/script/siyi.js'
import {USER_TYPE} from "@/core/config/const.js";

const userPlantList = getUserPlantList('outwork-'); //用户的工厂
const userInfo = siyi.user
const _apiUrl=api.url.outwork;

//列配置
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '供应商ID', width: 100, field: 'suppliersId', sortable: true,visible:false},
  {title: '工厂', width: 100, field: 'plant_name', sortable: true},
  {title: '供应商(简称)', width: 120, field: 'sup_name', sortable: true},
  {title: '供应商(代码)', width: 120, field: 'sup_code', sortable: true},
  {title: '型号', width: 160, field: 'partNum', sortable: true},
  {title: '版本', width: 80, field: 'partRev', sortable: true},
  {title: '外协单号', width: 150, field: 'sn_order', sortable: true},

  {title: '操作类型', minWidth: 150, field: 'type', sortable: true,formatter:({row})=>{
      return vData.listOption['type']?.[row['type']] || '';
  }},
  {title: '单位', width: 100, field: 'unit_name', sortable: true,visible: false,},
  {title: '产出数量', width: 100, field: 'qty', sortable: true,visible: false},
  {title: '未加工数量', width: 100, field: 'qty_backout', sortable: true,visible: false},
  {title: '赠品数量', width: 100, field: 'qty_free', sortable: true,visible: false},
  {title: '单价(元)', width: 100, field: 'price', sortable: true,visible: false,formatter:({row})=>{
      return ['supplier_check2','employee_check'].includes(row.type)?row.price:'';
    }},
  {title: '总价(元)', width: 100, field: 'price', sortable: true,visible: false,formatter:({row})=>{
      return ['supplier_check2','employee_check'].includes(row.type)?(row.price*row.qty):'';
   }},
  {title: '内容', minWidth: 200, field: 'description', sortable: true},
  {title: '备注', minWidth: 100, field: 'remark', sortable: true},
  {title: '操作人', width: 100, field: '_text.createUid', sortable: true},
  {title: '日期', width: 150, field: 'createAt', sortable: true,formatter:core.date.formatterYMDHms},
  {title: '流水号', width: 140, field: 'serialNo', sortable: true},
];

//默认数据
const defaultData={
  typeList:[],
  params:{
    search: '',//搜索关键字
    type:'',//类型
    status:undefined,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
    plant_id:core.getDefaultPlantId(), //工厂ID,
    sup_id:siyi.user.link?.supplier?.value,//代理商ID
  },
};

//页面数据
const vData = reactive({
  isSupplier:userInfo.type===USER_TYPE.supplier,
  params:{...defaultData.params},
  supplierList:[],
  list:[],
  msg:'',
  listOption: {},
  listLabel: {},
});


//列表
const gridRef = ref()
const grid=reactive({
  bind:{
    ...gridOptionsDefault,
    id: 'siyi-log-list',
    columns: columns,
    seqConfig: {
      seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
    }
  },
  on:{
    cellClick:async ({row,columnIndex})=>{
      columnIndex>1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick:({row})=>{
      listBtn.action.click({name:'view'},row)
    },
    zoom:({type})=>core.fullscreenSwitch(type==='max'),
  }
})

//列表批量操作
const listBtn=reactive({
  status:{
    bind:{
      modelValue:vData.params.statusAction,
      size:"small",
      placeholder: '批量修改-状态',
      prefixIcon: 'vxe-icon-checkbox-checked',
      options:[],
      className:'search-select',
    },
    on: {
      focus:()=>{
        listBtn.status.bind.options = [...vData.listLabel.status || [],...[{label:'删除',value:-1}]];
      },
      change:async ({value})=>{
        await formEvent.set(listBtn.getSelectedRows(true,'recId'), value,'status');
        await searchList('init');
      }
    },
  },
  action:{
    bind:{
      className:'list-action',
      size:"small",
      options:[

      ]
    },
    click:({name},row)=>{
      switch (name){
        default : {

        }
      }
    }
  },
  getSelectedRow: (getId = false,field='id') => {
    const res = listBtn.getSelectedRows(getId,field);
    if (res && res?.length !== 1) {
      dialog.warning('请勾选一个需要操作的数据')
      return;
    }
    return res?.[0];
  },
  getSelectedRows: (getIds=false,field='id')=>{
    const selectedRows = gridRef.value.getCheckboxRecords();
    if (selectedRows===undefined || selectedRows.length === 0) {
      dialog.warning('请勾选要操作的数据！')
      return
    }
    return getIds?selectedRows.map((item) => item[field]):selectedRows;
  }
})


const formEvent = {
  set: async (id, value,key='status') => {
    if(id===undefined){
      return ;
    }
    let confirm= await VxeUI.modal.confirm({content: '确认操作？',});
    if(confirm!=='confirm'){
      return ;
    }
    let data = await api.post(_apiUrl.log.set, {recId: id, [key]: value});
    if(data===undefined) return ;
    await searchList()
  },
  delete: async (id) => {
    return await formEvent.set(id, -1,'status');
  },
}

const searchListDelay=_.debounce((e)=>{
  searchList('search',{search:e?.value});
},500)

//搜索
const searchList = async (type = 'init',param={}) => {
  vData.params={...vData.params,...param, currentPage:api.getCurrentPage(type,vData.params,vData.list.length)};
  type==='reset' && (vData.params={...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let data = await api.get(_apiUrl.log.list, vData.params);
  vData.msg = '没有搜索到数据！'
  if(data===undefined) return ;
  vData.list = _.cloneDeep(data.list);
  vData.listOption = data?.option?.list;
  vData.listLabel = getOptionsLabel(vData.listOption);
}



// 首次挂载
onMounted(() => {
  searchList()
})

// 页面显示时
onActivated(() => {

})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})


</script>

<style>
.siyi-log-list {
  width: 100%;
  height: 100%;
  position: absolute;

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .list-action{
    .vxe-button+.vxe-button.type--button{
      margin-left: 2px;
    }
    .mr10{
      margin-left: 10px;
    }
  }
  .search-select {
    width: 140px ;
  }

  .avatar{
    width: 30px;
    border-radius: 50%;
  }

}
</style>