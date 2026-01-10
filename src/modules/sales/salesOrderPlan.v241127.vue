<template>
  <div ref="box" class="salesOrderPlan">
    <div class="header">
      <Menu :table="reportOptions" :menu :defaultMenuHideList="['pageExport','clearCache','advancedExport']" :search="searchRef"/>
      <Search :search :table="reportOptions" :filter ref="searchRef"/>
    </div>
    <div class="body">
      <div class="table huizong">
        <div ref="huizong"></div>
      </div>
      <div class="table mainTable">
        <div ref="report"></div>
      </div>
      <div class="message">{{ message }}</div>
    </div>
    <dialogComponent v-if="channengShow" v-bind="channeng.dialog">
      <TableComponent ref="channengReport" v-bind="channeng.table"/>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import _ from 'lodash'
import Menu from '@/core/component/menu.vue'
import Search from '@/core/component/search.vue'
import {ListTable, register} from '@visactor/vtable'
import {ListEditor} from '@visactor/vtable-editors'
import apiUrl from '@/core/config/url'
import vtableOptions from '@/core/script/tableOptions.js'
import salesOrderPlandateList from '@/modules/sales/salesOrderPlandateList.v241215.vue'
import * as listTableFn from '@/core/script/tableFn.js'
import * as api from '@/core/script/api'
import * as core from '@/core/script/core'
import dialog from "@/core/script/dialog.js";
import siyi from '@/core/script/siyi.js'
import dialogComponent from '@/core/component/dialog.vue'
import TableComponent from '@/core/component/table.vue'


register.editor('salesOrderPlandate', new ListEditor({values: ['未排单', '已排单', '不排单']}));


const menu = {
  search: {title: '查询订单'},
  queryHuizong: {sort: 110, title: '查询汇总', icon: 'ri-repeat-2-line', click: () => huizongOptions.getData()},
  exportHuizong: {
    sort: 120,
    title: '导出汇总', icon: 'ri-file-copy-2-line', click: () => core.files.exportExcel({
      data: huizongOptions.options.records,
      columns: huizongOptions.options.columns,
      fileName: siyi.user.nickname + '.' + huizongOptions.name,
      //自定义导出
      callback: (opts) => {
        const columns = opts.columns.filter(col => ['plandate', 'kstxt', 'ksmb', 'areatxt', 'areamb', 'szsktxt', 'szskmb', 'cjtxt', 'cjmb', 'httxt', 'htmb', 'gmktxt', 'gmkmb'].includes(col.field))
        const rows = [columns.map(col => col.title)] //添加表头
        //添加行数据
        opts.data.forEach(item => {
          const row = []
          columns.forEach(col => row.push(item[col.field]))
          rows.push(row)
        })
        return rows
      }
    }),
  },
  setChanneng: {sort: 301, title: '产能设置', icon: 'ri-line-chart-fill', click: () => channengShow.value = true},
}
const searchRef = ref()
const filter = ref({fieldOptions: {options: []}})
const search = [
  {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
  {type: 'rangeDate', field: 'plandate', options: {placeholder: '汇总范围'}},
  {type: 'select', load: 'customer', field: 'customer', options: {placeholder: '客户代号'}},
  {type: 'input', field: 'partnum', options: {placeholder: '生产型号'}, style: {width: '194px'}},
  {type: 'input', field: 'sonumber', options: {placeholder: '订单号:特殊搜索'}, style: {width: '140px'}},
  {type: 'input', field: 'gylx', options: {placeholder: '沉金'}, style: {width: '80px'}},
  {type: 'input', field: 'qtyq', options: {placeholder: '树脂塞孔'}, style: {width: '100px'}},
  {type: 'input', field: 'th', options: {placeholder: '铜厚'}, style: {width: '60px'}},
  {type: 'date', field: 'enterdate', options: {placeholder: '下单日期', presets: false}},
  {
    type: 'select', field: 'planstatus',
    options: {
      placeholder: '排单状态',
      options: [
        {label: '已排单', value: 1},
        {label: '未排单', value: -1},
        {label: '不排单', value: 0},
      ]
    }
  },
]


/*设置流程标准生产时间*/
const channengShow = ref(false)
const channengReport = ref('')
const channeng = {
  dialog: {title: '产能设置', type: 'window', width: '80%', height: '90%', top: 'center', onAfterClose: () => channengShow.value = false},
  table: {
    defaultMenuShowList: ['search', 'pageExport', 'clearWhere'],
    search: [
      {type: 'select', load: 'factory', field: 'factory', filter: true, options: {placeholder: '工厂'}},
      {type: 'input', field: 'plandate', filter: true, options: {placeholder: '排单交期'}},
      {type: 'input', field: 'week', filter: true, options: {placeholder: '星期'}},
      {type: 'input', field: 'remark', filter: true, options: {placeholder: '备注'}},
    ],
    tableConfig: {
      id: siyi.nav.id + '_channeng',
      name: siyi.nav.title + '-标准时间',
      url: apiUrl.sales.salesOrderPlan.getchanneng
    },
    vTableOptions: {
      dragHeaderMode: 'none', //移动表头位置
      columnResizeMode: 'none', //拖动列宽模式
    },
    dblclickCell: false,
    colAfterCallback: col => {
      col.showSort = false
      if (['ks', 'area', 'szsk', 'cj', 'ht', 'gmk', 'remark'].includes(col.field)) col.editor = 'inputEditor'
      return col
    },
    changeCellValue: ({row, col, changedValue, currentValue}) => {
      if (changedValue === currentValue) return;
      const ro = channengReport.value.reportOptions
      const columns = ro.options.columns.filter(column => column.hide === false)[col - (ro.options.rowSeriesNumber ? 1 : 0)]
      if (['ks', 'area', 'szsk', 'cj', 'ht', 'gmk', 'remark'].includes(columns.field)) {
        const rows = ro.options.records[row - 1]
        const loading = dialog.loading(ro.box, `正在设置${rows.plandate}${columns.title}产能`)
        api.post(apiUrl.sales.salesOrderPlan.setchanneng, rows).then(res => {
          rows.id = res.id
          rows.version = res.version
          for (const item of ro.data) {
            if (item.id === rows.id || item.plandate === rows.plandate) {
              _.merge(item, rows)
              break
            }
          }
          loading.close()
        })
      }
    },
  },
}


const change_cell_value = ({row, col, changedValue, currentValue}) => {
  col = col - (reportOptions.options.rowSeriesNumber ? 1 : 0)
  const columns = reportOptions.options.columns.filter(column => column.hide === false)[col]
  if (['planstatus', 'plandate', 'remark'].includes(columns.field)) {
    if (changedValue !== currentValue) {
      const loading = dialog.loading(report.value, '正在排单，请稍等...')
      const newRow = reportOptions.options.records[row - 1]
      api.post(apiUrl.sales.salesOrderPlan.plan, {...newRow, ...{submit: columns.field}}).then(res => {
        if (res) {
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
          huizongOptions.getData()
        } else {
          newRow[columns.field] = currentValue
        }
        listTableFn.update(reportOptions)
        loading.close()
      })
    }
  }
}


const dblclick_cell = args => {
  const newRow = huizongOptions.options.records[args.row - 1]
  const where = searchRef.value.get()
  where.dblclick_cell = ''
  where.selectfactory = newRow.factoryid ?? ''
  where.selectplandate = newRow.plandate ?? ''
  dialog.window(salesOrderPlandateList, {where, huizongOptions, reportOptions}, {
    title: '排单明细',
    width: '90%',
    height: '90%',
    top: 'center',
  })
}


const box = ref()
const message = ref('')
const report = ref('')
const reportOptions = _.merge({}, listTableFn.defaultConfig(), {
  dom: report.value,              //报表挂载的DOM节点
  url: apiUrl.sales.salesOrderPlan.index,         //获取数据的API接口
  options: vtableOptions,
  events: {change_cell_value},
  async getData() {
    const startTime = Date.now()
    const loading = dialog.loading(box.value)
    const userConfig = await listTableFn.mergeConfig(reportOptions)
    reportOptions.data = await api.get(reportOptions.url, {where: await searchRef.value.get()})
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
      if (col.field === 'szsk') col.style = args => {
        if (args.value && args.value.indexOf('树脂塞孔') > -1) {
          return {bgColor: 'rgb(255,255,0)'}
        }
      }
      if (col.field === 'gylx') col.style = args => {
        if (args.value && args.value.indexOf('沉金') > -1) {
          return {bgColor: 'rgb(255,255,0)'}
        }
      }
      if (col.field === 'remark') col.style = args => {
        if (args.value && args.value.indexOf('加急') > -1) {
          return {bgColor: 'rgb(255,50,50)'}
        }
      }
      return col
    })
    await listTableFn.mergeColumn(reportOptions, userConfig.columns)
    listTableFn.update(reportOptions)
    filter.value.fieldOptions.options = []
    reportOptions.options.columns.forEach(col => col.hide === false && col.cellType !== 'checkbox' && filter.value.fieldOptions.options.push({label: col.title, value: col.field}))//生成过滤列表
    loading.close()
    message.value = listTableFn.footerMessage(reportOptions, startTime)
  }
})


const huizong = ref('')
const huizongOptions = _.merge({}, listTableFn.defaultConfig(), {
  id: siyi.nav.id + '_huizong',        //id
  name: siyi.nav.title + '-汇总',       //报表名称
  dom: huizong.value,              //报表挂载的DOM节点
  url: apiUrl.sales.salesOrderPlan.huizong,         //获取数据的API接口
  options: _.merge({}, vtableOptions, {
    rowSeriesNumber: null,
    // dragHeaderMode: 'none', //移动表头位置
    // columnResizeMode: 'none', //拖动列宽模式
    // sortState: [{field: 'plandate', order: 'asc'}]
  }),
  events: {dblclick_cell},
  async getData() {
    const loading = dialog.loading(huizong.value)
    const userConfig = await listTableFn.mergeConfig(huizongOptions)
    const where = await searchRef.value.get()
    huizongOptions.data = await api.get(huizongOptions.url, {where})
    listTableFn.createTable(huizongOptions, undefined, function (col) {
      col.showSort = false
      if (['ks', 'area', 'szsk', 'cj', 'ht', 'gmk'].includes(col.field)) {
        col.cellType = 'progressbar'
        col.width = 95
        col.min = 0
        col.max = 1
        col.style = listTableFn.progressbar()
        col.fieldFormat = data => {
          if (data[col.field] === undefined) return ''
          if (data.holiday > 0) return data[col.field + 'txt']
          return data[col.field + 'txt'] + '/' + data[col.field + 'mb']
        }
      }
      return col
    })
    await listTableFn.mergeColumn(reportOptions, userConfig.columns)
    listTableFn.update(huizongOptions)
    loading.close()
  }
})


onMounted(() => {
  reportOptions.table = new ListTable(report.value, reportOptions.options)
  // reportOptions.getData()

  huizongOptions.table = new ListTable(huizong.value, huizongOptions.options)
  huizongOptions.getData()


})
</script>
<style scoped>
.salesOrderPlan {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;
  padding: 5px;

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
    display: grid;
    grid-template-columns:30% 70%;
    grid-template-rows:auto 25px;
    grid-template-areas:
      "huizong mainTable"
      "message message";

    > .table {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
      }
    }

    > .table.huizong {
      grid-area: huizong;
    }

    > .table.mainTable {
      grid-area: mainTable;
    }


    > .message {
      grid-area: message;
      width: 100%;
      height: 100%;
      line-height: 28px;
      padding: 0 5px;
      font-size: 12px;
      border: 1px solid #ddd;
      border-top: 0 none;
      border-radius: 0 0 5px 5px;
      overflow: auto hidden;
      text-wrap: nowrap;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>