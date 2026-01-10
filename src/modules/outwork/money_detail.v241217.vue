<template>
  <div class="winContent">
    <div class="header">
      <Menu :table="tableOptions" :menu="menus" :search="searchRef" disableDefaultMenu/>
      <Search ref="searchRef" :table="tableOptions" :search="[]" :filter/>
    </div>
    <div class="body">
      <div class="table mainTable">
        <div ref="tableRef" style="height: 70%"></div>
        <div ref="table2Ref" style="height: 30%"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue'
import _ from 'lodash'
import {ListTable} from '@visactor/vtable'
import siyi from '@/core/script/siyi.js'
import * as listTableFn from '@/core/script/tableFn.js'
import * as api from "@/core/script/api.js";
import apiUrl from "@/core/config/url.js";
import Search from "@/core/component/search.vue";
import {parseNumber} from "@/utils/vars.js";
import Menu from "@/core/component/menu.vue";
import dialog from "@/core/script/dialog.js";


const props = defineProps({
  param: {type: Object, default: {}},
  type:{type: String, default: ''},
})

const emit = defineEmits(['updateWindow'])

const columns = [
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
]

const columns2 = [
  {field: 'sn_order', title: '外协单号', width: 200},
  {field: 'partNum', title: '型号', width: 200},
  {field: 'partRev', title: '版本', width: 100},
  {field: 'name', title: '费用项目', width: 200},
  {field: 'amount', title: '费用金额', width: 100, aggregationType: "SUM"},
  {field: 'createTimeStr', title: '建单时间', width: 160},
];


const menus = {
  pageExport: {options: {disabled: false}},
  moreSettings: {title: "表格设置", options: {disabled: false}},
}

const searchRef = ref()
const searchData = []
const filter = ref({fieldOptions: {options: []}})


const tableRef = ref('')
const tableOptions = _.merge({}, listTableFn.defaultConfig(), {
  id: `${siyi.nav.id}_detail`,
  dom: tableRef.value,
  url: apiUrl.outwork.money.detail,
  options: {columns},
  async getData(init = false) {
    const loading = dialog.loading(document.querySelector('.mainTable'))
    if (init) {
      //第2.0步： 去除多余的列
      tableOptions.options.columns = _.filter(tableOptions.options.columns, item => !_.isEmpty(item?.title));
      //第2.1步： 合并用户的表格基本配置：如分页，冻结列
      const userConfig = await listTableFn.mergeConfig(tableOptions)
      //第2.2步： 合并用户自定的列配置信息
      await listTableFn.mergeColumn(tableOptions, userConfig.columns)
      //第2.3步： 合并默认列配置
      tableOptions.options.columns = tableOptions.options.columns.map(column => ({
        ...column,
        showSort: true, // 显示排序图标，使用自定义排序
        sort: false,    // 禁用内置排序
      }));
      //第2.4步： 初始化本地过滤列
      filter.value.fieldOptions.options = [...tableOptions.options.columns].map(col => ({
        label: col.title,
        value: col.field,
      }));
    }
    //第3步:获取数据
    const {plantsId, suppliersId, jobId} = props.param;
    const apiData = await api.get(tableOptions.url, {plantsId, suppliersId, jobId});

    const list1 = (apiData?.['list1'] || []).map((item) => {
      item.moneyAll = (parseNumber(item.qtyReceivedNum) * parseNumber(item.priceInTax)).toFixed(5)
      return item;
    })
    tableOptions.data = tableOptions.options.records = list1;
    listTableFn.update(tableOptions, false)

    table2Options.data = table2Options.options.records = apiData?.['list2'] || [];
    listTableFn.update(table2Options, false)
    loading.close()
  }
})

const table2Ref = ref('')
const table2Options = _.merge({}, listTableFn.defaultConfig(), {
  id: `${siyi.nav.id}_detail2`,
  dom: table2Ref.value,
  options: {columns: columns2},
  async getData(init = false) {
    if (init) {
      table2Options.options.columns = _.filter(table2Options.options.columns, item => !_.isEmpty(item?.title));//去除多余的列
      table2Options.options.columns.map(async (column) => {
        await listTableFn.aggregation(table2Options, column)
      })
    }
  }
})


onMounted(() => {
  console.log('props',props);
  const {supplierName, partNum, partRev, qtySum, moneySum, moneyAddSum}= props.param;
  emit('update',{
    title:supplierName + "\t" + partNum + " " + partRev + "\t" + "总数：" + qtySum + "\t总金额：" + moneySum.toFixed(2) + "\t已付：" + moneyAddSum
  });
  tableOptions.table = new ListTable(tableRef.value, tableOptions.options)
  tableOptions.getData(true)

  table2Options.table = new ListTable(table2Ref.value, table2Options.options)
  table2Options.getData(true)

})

</script>
<style scoped>
.winContent {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;

  > .header {
    width: 100%;
    border: 1px solid #ddd;
    border-bottom: 0 none;
    border-radius: 5px 5px 0 0;

    > .menuBox {
      border-bottom: 1px solid #ddd;
    }
  }

  > .body {
    width: 100%;
    height: 100%;

    .mainTable {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}
</style>