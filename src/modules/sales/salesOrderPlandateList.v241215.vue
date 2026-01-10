<template>
  <div ref="box" class="winContent">
    <div class="header">
      <Menu :menu="menuData" :showDefaultMenu="false" :table="reportOptions" :search="searchRef"/>
      <Search ref="searchRef" :table="reportOptions" :search="searchData"/>
    </div>
    <div class="body">
      <div class="table mainTable">
        <div ref="report"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import _ from 'lodash'
import {ListTable} from '@visactor/vtable'
import * as listTableFn from '../../core/script/tableFn.js'
import * as api from '../../core/script/api'
import apiUrl from '../../core/config/url'
import Search from '../../core/component/search.vue'
import Menu from '../../core/component/menu.vue'
import dialog from "@/core/script/dialog.js";


const props = defineProps({
  where: {type: Object},
  huizongOptions: {type: Object},
  reportOptions: {type: Object},
  dialog: {type: Object},
})


const menuData = {
  cancel: {
    title: '批量取消排单', click: () => {
      const id = listTableFn.getCheckedRecords(reportOptions, 'id')
      if (id.length > 0) {
        dialog.info('正在取消，请稍等...')
        api.post(apiUrl.sales.salesOrderPlan.cancel, {id}).then(res => {
          reportOptions.getData()
          props.huizongOptions.getData()
          props.reportOptions.getData()
          dialog.success('取消成功。')
        })
      } else {
        dialog.info('请勾选订单')
      }
    }
  },
  pageExport: {show: true},
  clearWhere: {show: true},
  nextPage: {show: false},
}
const searchRef = ref()
const searchData = [
  {type: 'input', field: 'partnum', filter: true, style: {width: '120px'}, options: {placeholder: '生产型号'}},
  {type: 'input', field: 'sonumber', filter: true, style: {width: '120px'}, options: {placeholder: '销售订单号'}},
  {type: 'input', field: 'gylx', filter: true, style: {width: '120px'}, options: {placeholder: '工艺类型'}},
  {type: 'input', field: 'qtyq', filter: true, style: {width: '120px'}, options: {placeholder: '其它要求'}},
  {type: 'input', field: 'cpth', filter: true, style: {width: '80px'}, options: {placeholder: '成品铜厚'}},
]


const change_cell_value = ({row, col, changedValue, currentValue}) => {
  col = col - (reportOptions.options.rowSeriesNumber ? 1 : 0) - 1 //减序号列在减选择列
  const columns = reportOptions.options.columns.filter(column => column.hide === false)[col]
  if (['planstatus', 'plandate', 'remark'].includes(columns.field)) {
    if (changedValue !== currentValue) {
      const loading = dialog.loading(report.value, '正在排单，请稍等...')
      const newRow = reportOptions.options.records[row - 1]
      api.post(apiUrl.sales.salesOrderPlan.plan, {...newRow, ...{submit: columns.field}}).then(res => {
        if (res === undefined) {
          newRow[columns.field] = currentValue
        } else {
          newRow.id = res.id
          newRow.planstatus = res.status === 0 ? '不排单' : (res.plandate ? '已排单' : '未排单');
          if (res.status === 0) newRow.plandate = '';
          newRow.version = res.version
          for (const item of reportOptions.data) {
            if (item.id === newRow.id || item.contractitemid === newRow.contractitemid) {
              _.merge(item, newRow)
              break
            }
          }
          props.huizongOptions.getData()
          props.reportOptions.getData()
        }
        listTableFn.update(reportOptions)
        loading.close()
      })
    }
  }
}


const box = ref()
const report = ref('')
const reportOptions = _.merge({}, listTableFn.defaultConfig(), {
  dom: report.value,                      //报表挂载的DOM节点
  url: apiUrl.sales.salesOrderPlan.index, //获取数据的API接口
  showCheck: true,
  events: {change_cell_value},
  async getData() {
    const loading = dialog.loading(box.value)
    reportOptions.data = await api.get(reportOptions.url, {where: props.where})
    listTableFn.createTable(reportOptions, undefined, function (col) {
      if (col.field === 'plandate') col.editor = 'dateEditor'
      if (col.field === 'remark') col.editor = 'inputEditor'
      if (col.field === 'planstatus') {
        col.editor = 'salesOrderPlandate'
        col.style = args => {
          if (args.value === '已排单') {
            return {bgColor: 'rgb(0,200,0)'}
          } else if (args.value === '不排单') {
            return {bgColor: 'rgb(255,255,0)'}
          }
        }
      }
      if (col.field === 'cpth') {
        col.style = args => {
          if (args.dataValue <= 0) {
            return {bgColor: 'rgb(255,0,0)'}
          } else if (args.dataValue >= 70) {
            return {bgColor: 'rgb(255,255,0)'}
          }
        }
        col.fieldFormat = data => data['cpthold']
      }
      if (col.field === 'qtyq') col.style = args => {
        if (args.value && /树脂塞孔|光模块/.test(args.value)) {
          return {bgColor: 'rgb(255,255,0)'}
        }
      }
      if (col.field === 'gylx') col.style = args => {
        if (args.value && args.value.indexOf('沉金') > -1) {
          return {bgColor: 'rgb(255,255,0)'}
        }
      }
      return col
    })
    listTableFn.update(reportOptions)
    searchRef.value.dataFilter()
    loading && loading.close()
  }
})


onMounted(() => {
  reportOptions.table = new ListTable(report.value, reportOptions.options)
});

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

    > .menuBox {
      border-bottom: 1px solid #ddd;
    }
  }

  > .body {
    width: 100%;
    height: 100%;
    overflow: hidden;

    > .table {
      width: 100%;
      height: 100%;
      position: relative;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
      }
    }
  }
}
</style>