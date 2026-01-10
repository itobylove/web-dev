<template>
  <div class="mainReport">
    <TableComponent ref="mainReport" :tableConfig="mainTableConfig" :defaultMenuHideList="['clearCache','advancedExport']"
                    :search="mainSearch" :colAfterCallback="mainColAfterCallback" :clickCell="mainClickCell"
                    :changeCellValue="mainChangeCellValue"/>
    <dialogComponent v-if="subShow" title="请选择物料" type="window" top="center" width="80%" height="90%" @afterClose="subShow=false">
      <div class="subReport">
        <TableComponent ref="subReport" :tableConfig="subTableConfig" :defaultMenuShowList="['search','clearWhere']"
                        :search="subSearch" :query :dblclickCell="subDblclickCell"/>
      </div>
    </dialogComponent>
  </div>
</template>
<script setup>
import {ref} from 'vue'
import {register} from '@visactor/vtable'
import apiUrl from '../../core/config/url'
import dialogComponent from '@/core/component/dialog.vue'
import TableComponent from '@/core/component/table.vue'
import {ListEditor} from '@visactor/vtable-editors'
import * as api from '@/core/script/api.js'
import * as listTableFn from '@/core/script/tableFn.js'
import _ from 'lodash'

register.editor('moWaitingMaterialsCompleteOptions', new ListEditor({values: ['已到料', '未到料', '']}));

const mainReport = ref()
const mainTableConfig = {
  url: apiUrl.sc.moWaitingMaterials.list,
}
const mainSearch = [
  {type: 'select', load: 'factory', field: 'factory', filter: true, options: {placeholder: '生产工厂'}},
  {type: 'input', field: 'monumber', filter: true, options: {placeholder: '制造单号'}, style: {width: '120px'}},
  {type: 'input', field: 'partnum', filter: true, options: {placeholder: '生产型号'}, style: {width: '130px'}},
  {type: 'input', field: 'pmcode', filter: true, options: {placeholder: '工程BOM物料编号'}, style: {width: '120px'}},
  {type: 'input', field: 'pmstandard', filter: true, options: {placeholder: '工程BOM物料规格'}, style: {width: '150px'}},
  {type: 'input', field: 'mcode', filter: true, options: {placeholder: '计划配料物料编号'}, style: {width: '120px'}},
  {type: 'input', field: 'mstandard', filter: true, options: {placeholder: '计划配料物料规格'}, style: {width: '150px'}},
  {type: 'input', field: 'wcode', filter: true, options: {placeholder: '备料编号'}, style: {width: '120px'}},
  {type: 'input', field: 'wstandard', filter: true, options: {placeholder: '备料规格'}, style: {width: '150px'}},
  {type: 'input', field: 'mostatus', filter: true, options: {placeholder: '投产状态'}, style: {width: '100px'}},
  {type: 'input', field: 'materialsgroup', filter: true, options: {placeholder: '物料分类'}, style: {width: '120px'}},
  {type: 'input', field: 'custmatcode', filter: true, options: {placeholder: '物料分类'}, style: {width: '120px'}},
]
const mainColAfterCallback = col => {
  if (col.field === 'qty') {
    col.editor = 'inputEditor'
    col.style = args => {
      return {bgColor: args.dataValue > 0 ? 'rgb(255,125,0)' : 'rgb(0,197,35)'}
    }
  }
  if (col.field === 'plandate') {
    col.editor = 'dateEditor'
    col.style = () => {
      return {bgColor: 'rgb(0,197,35)'}
    }
  }
  if (col.field === 'wcode') {
    col.style = () => {
      return {bgColor: 'rgb(0,197,35)'}
    }
  }
  if (col.field === 'complete') {
    col.editor = 'moWaitingMaterialsCompleteOptions'
    col.style = args => {
      if (args.value === '已到料') {
        return {bgColor: 'rgb(0,200,0)'}
      } else if (args.value === '未到料') {
        return {bgColor: 'rgb(255,255,0)'}
      }
    }
  }
  if (col.field === 'mwmremark') {
    col.editor = 'inputEditor'
  }
  return col
}


const mainClickCell = args => {
  if (args.field === 'wcode' && args.originData?.materialtypeid > 0) {
    subShow.value = true
    mainReport.value.reportOptions.selectRow = args.originData
    query.materialtypeid = args.originData.materialtypeid
  }
}

const mainChangeCellValue = ({row, col, changedValue, currentValue}) => {
  col = col - (mainReport.value.reportOptions.options.rowSeriesNumber ? 1 : 0)//处理起始列
  const columns = mainReport.value.reportOptions.options.columns.filter(column => column.hide === false)[col]
  if (['qty', 'plandate', 'complete', 'mwmremark'].includes(columns.field)) {
    if (changedValue !== currentValue) {
      const newRow = mainReport.value.reportOptions.options.records[row - 1]
      api.post(apiUrl.sc.moWaitingMaterials.save, newRow).then(res => {
        newRow.id = res.id
        newRow.version = res.version
        newRow.completetime = res.completetime
        //合并到原始数据
        for (const item of mainReport.value.reportOptions.data) {
          if (item.index === newRow.index) {
            _.merge(item, newRow)
            break
          }
        }
        listTableFn.update(mainReport.value.reportOptions)
      })
    }
  }
}


//子表格功能开始
const subShow = ref(false)
const subReport = ref()
const subTableConfig = {
  url: apiUrl.sc.moWaitingMaterials.materials,
}
const subSearch = [
  {type: 'input', field: 'code', filter: true, options: {placeholder: '物料编号'}, style: {width: '120px'}},
  {type: 'input', field: 'standard', filter: true, options: {placeholder: '物料规格'}, style: {width: '120px'}},
  {type: 'input', field: 'standard', filter: true, options: {placeholder: '物料规格'}, style: {width: '120px'}},
  {type: 'input', field: 'standard', filter: true, options: {placeholder: '物料规格'}, style: {width: '120px'}},
  {type: 'input', field: 'standard', filter: true, options: {placeholder: '物料规格'}, style: {width: '120px'}},
]

const query = {
  materialtypeid: 0
}


const subDblclickCell = args => {
  let data;
  for (const item of mainReport.value.reportOptions.options.records) {
    if (item.index === mainReport.value.reportOptions.selectRow.index) {
      item.waitingmaterialsid = args.originData.recid
      data = item
      break
    }
  }
  api.post(apiUrl.sc.moWaitingMaterials.save, data).then(res => {
    data.id = res.id
    data.version = res.version
    data.wcode = res.wcode
    data.wstandard = res.wstandard
    for (const item of mainReport.value.reportOptions.data) {
      if (item.index === data.index) {
        _.merge(item, data)
        break
      }
    }
    listTableFn.update(mainReport.value.reportOptions)
    subShow.value = false
  })
}


</script>
<style scoped>
.subReport {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>