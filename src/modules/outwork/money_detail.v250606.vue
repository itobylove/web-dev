<template>
  <div style="height: 100%">
    <div style="height: 70%">
      <TableComponent ref="report" v-bind="table1" />
    </div>
    <div style="height: 30%">
      <TableComponent  ref="report2" v-bind="table2"/>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref,} from 'vue'
import * as api from '@/core/script/api.js'
import apiUrl from '@/core/config/url.js'
import * as core from '@/core/script/core.js'
import TableComponent from '@/core/component/table.vue'
import _ from "lodash";
import {parseNumber} from "@/utils/vars.js";

const props = defineProps({
  param: {type: Object, default: {}},
})


const report = ref()
const menu = {
  scene: {sort: 120, title: '场景管理', icon: 'ri-arrow-right-circle-line', click: console.log},
  edit: {sort: 120, title: '修改', icon: 'ri-arrow-right-circle-line', click: console.log},
  cancel: {sort: 120, title: '作废', icon: 'ri-arrow-right-circle-line', click: console.log},
  del: {sort: 120, title: '删除', icon: 'ri-arrow-right-circle-line', click: console.log},
  approval: {sort: 120, title: '终审', icon: 'ri-arrow-right-circle-line', click: console.log},
  checkin: {sort: 120, title: '核销', icon: 'ri-arrow-right-circle-line', click: console.log},
  reception: {sort: 120, title: '接待', icon: 'ri-arrow-right-circle-line', click: console.log},
  finish: {sort: 120, title: '完结', icon: 'ri-arrow-right-circle-line', click: console.log},
}

const search = [
  {type: 'select', field: 'factory', options: {placeholder: '工厂'}, load: 'factory'},
  {
    type: 'select', field: 'status',
    options: {placeholder: '审批状态', options: [{label: '审批中', value: 1}, {label: '审批完成', value: 2}]}
  },
  {type: 'rangeTime', field: 'time', options: {placeholder: '创建时间'}, value: core.date.list().month['7天内']},
]


// 获取API数据
const apiData=ref();
const getMainData=async () => {
   if (!apiData.value){
     console.log('apiData',apiData.value);
     const query = _.pick(props.param, ['plantsId','suppliersId','jobId']);
     apiData.value= await api.get(apiUrl.outwork.money.detail, query);
     apiData.value.list1 = (apiData.value?.['list1'] || []).map((item) => {
       item.moneyAll = (parseNumber(item.qtyReceivedNum) * parseNumber(item.priceInTax)).toFixed(5)
       return item;
     })
     console.log('apiData.value',apiData.value);
   }
  return apiData.value;
}

const columns1=[
  {field: 'plantName', title: '工厂', hide: true},
  {field: 'supplierName', title: '供应商', hide: true},
  {field: 'supplierCode', title: '供应商代码', hide: true},
  {field: 'supplierNameNick', title: '供应商简称', hide: true},
  {field: 'sn_order', title: '外协单号', width: 100},
  // { field: 'type', title:'外协类型',formatter:({row})=>row['type']==='SO'?'订单外协':row['sct_name']},
  {field: 'partNum', title: '型号', width: 140},
  {field: 'partRev', title: '版本', width: 80},
  // { field: 'pcspnl',title:'PCS/PNL',width: 80},
  {field: 'qty', title: '采购数量', hide: true},
  {field: 'qty_Reconciled', title: '产出数量', hide: true},
  {field: 'qtyFree_Reconciled', title: '赠品数量', hide: true},
  {field: 'qtyPcsReturned', title: '退回PCS', hide: true},
  {field: 'qtyPcsStocked', title: '入库PCS', hide: true},
  {field: 'qtyPcsScrapped', title: '报废PCS', hide: true},
  {field: 'qty_Invoiced', title: '对账数量', hide: true},
  {field: 'qtyReceivedNum', title: '计价数量', aggregationType: "SUM"},
  {field: 'ut_name', title: '送货单位'},
  {field: 'priceInTax', title: '单价', fieldFormat: ({priceInTax}) => isNaN(priceInTax) ? '' : priceInTax * 1},
  {field: 'moneyAll', title: '计价金额', aggregationType: "SUM", width: 120},
  {field: 'itemNote', title: '备注'},
  {field: 'createTimeStr', title: '建单时间', width: 120},
  {field: 'date_orderStr', title: '采购时间', hide: true},
  {field: 'suppliersId', title: '供应商ID', hide: true},
  {field: 'jobId', title: 'jobId', hide: true},
  {field: 'id', title: 'ID', hide: true},
];

const table1={
  tableConfig: {
    id:'outwork_money_detail',
    columnSplit:'',
    showCheck: false,
    useUserTableConfig:false,
    useEncryptionFields:false,
    columns:columns1
  },
  search:false,
  menu:true,
  dataFetcher: async () => (await getMainData())['list1'],
  afterLoaded: async () => {
    await report2.value.reportOptions.getData();
  },
};



const  columns2=[
  {field: 'sn_order', title: '外协单号', width: 200},
  {field: 'partNum', title: '型号', width: 200},
  {field: 'partRev', title: '版本', width: 100},
  {field: 'name', title: '费用项目', width: 200},
  {field: 'amount', title: '费用金额', width: 100, aggregationType: "SUM"},
  {field: 'createTimeStr', title: '建单时间', width: 160},
];

const report2=ref();
const table2={
  tableConfig: {
    columnSplit:'',
    showCheck: false,
    useUserTableConfig:false,
    useEncryptionFields:false,
    columns:columns2
  },
  search:false,
  menu:false,
  footer:false,
  dataFetcher: async () => (await getMainData())['list2'],
};

onMounted(async () => {
  await report.value.reportOptions.getData();
});



</script>