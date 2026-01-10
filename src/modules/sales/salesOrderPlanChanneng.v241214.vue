<template>
  <window ref="win" v-bind="winOptions">
    <template #title>排单产能目标设置</template>
    <template #default>
      <div ref="box" class="winContent">
        <div class="header">
          <Menu :menu="menuData" :disableDefaultMenu="true" :table="reportOptions" :search="searchRef"/>
          <Search ref="searchRef" :table="reportOptions" :search="searchData"/>
        </div>
        <div class="body">
          <div class="table mainTable">
            <div ref="report"></div>
          </div>
        </div>
      </div>
    </template>
  </window>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import _ from 'lodash'
import {ListTable} from '@visactor/vtable'
import siyi from '@/core/script/siyi.js'
import * as api from '../../core/script/api'
import * as listTableFn from '../../core/script/tableFn.js'
import window from '../../core/component/window1.vue'
import Search from '../../core/component/search.vue'
import VtableOptions from '../../core/script/tableOptions.js'
import apiUrl from '../../core/config/url'
import Menu from "../../core/component/menu.vue"
import dialog from "@/core/script/dialog.js";


const props = defineProps({opts: {type: Object, default: {}}})


const win = ref()
const winOptions = {
  container: `#${siyi.nav.key}`,
  maskClickClose: false,
  onBeforeOpen() {
    onBeforeOpen()
    return true
  },
  onAfterClose() {
    props.opts.app.unmount()
  }
}

const menuData = {
  search: {options: {disabled: false}},
  pageExport: {options: {disabled: false}},
  clearWhere: {options: {disabled: false}},
}
const searchRef = ref()
const searchData = [
  {type: 'select', load: 'factory', field: 'factory', filter: true, options: {placeholder: '工厂'}},
  {type: 'input', field: 'plandate', filter: true, options: {placeholder: '排单交期'}},
  {type: 'input', field: 'week', filter: true, options: {placeholder: '星期'}},
  {type: 'input', field: 'remark', filter: true, options: {placeholder: '备注'}},
]


const box = ref()
const report = ref()
const reportOptions = _.merge({}, listTableFn.defaultConfig(), {
  id: siyi.nav.id + '_channeng',        //id
  name: siyi.nav.title + '-产能设置',   //报表名称
  dom: report.value,              //报表挂载的DOM节点
  url: apiUrl.sales.salesOrderPlan.getchanneng,         //获取数据的API接口
  options: _.merge({}, VtableOptions, {
    rowSeriesNumber: null,
    dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
  }),
  async getData() {
    const loading = dialog.loading(box.value)
    reportOptions.data = await api.get(reportOptions.url)
    listTableFn.createTable(reportOptions, undefined, function (col) {
      col.showSort = false
      if (['ks', 'area', 'szsk', 'cj', 'ht', 'gmk', 'remark'].includes(col.field)) col.editor = 'inputEditor'
      return col
    })
    listTableFn.update(reportOptions)
    searchRef.value.dataFilter()
    loading.close()
  }
})


const onBeforeOpen = () => {
  reportOptions.table = new ListTable(report.value, reportOptions.options)
  // reportOptions.getData()

  reportOptions.table.on('change_cell_value', ({row, col, changedValue, currentValue}) => {
    col = col - (reportOptions.options.rowSeriesNumber ? 1 : 0)
    const columns = reportOptions.options.columns.filter(column => column.hide === false)[col]
    if (['ks', 'area', 'szsk', 'cj', 'ht', 'gmk', 'remark'].includes(columns.field)) {
      const newRow = reportOptions.options.records[row - 1]
      if (changedValue !== currentValue) {
        const loading = dialog.loading(box.value, '正在设置' + newRow.plandate + columns.title + '产能。')
        api.post(apiUrl.sales.salesOrderPlan.setchanneng, newRow).then(res => {
          newRow.id = res.id
          newRow.version = res.version
          for (const item of reportOptions.data) {
            if (item.id === newRow.id || item.plandate === newRow.plandate) {
              _.merge(item, newRow)
              break
            }
          }
          loading.close()
        })
      }
    }
  })
}
onMounted(() => win.value.open())
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