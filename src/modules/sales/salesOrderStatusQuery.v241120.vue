<template>
  <div ref="box" class="salesOrderQuery">
    <div class="header">
      <Menu :menu :table="reportOptions" :search="searchRef"/>
      <Search :search :table="reportOptions" ref="searchRef"/>
    </div>
    <div class="body">
      <div class="table mainTable">
        <div ref="report"></div>
      </div>
      <div class="table jiecun">
        <div ref="jiecun"></div>
      </div>
      <div class="table kucun">
        <div ref="kucun"></div>
      </div>
      <div class="footer">{{ footer }} {{ jtsum }}</div>
    </div>
    <dialogComponent v-if="detailsShow" :title type="window" width="80%" height="90%" @afterClose="detailsShow=false">
      <t-descriptions bordered size="small" :column="3" :labelStyle :contentStyle>
        <t-descriptions-item v-for="(value,field) in detailsData" :label="field" :content="value"/>
      </t-descriptions>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import _ from 'lodash'
import Menu from '@/core/component/menu.vue'
import Search from '@/core/component/search.vue'
import VtableOptions from '@/core/script/tableOptions.js'
import {ListTable} from '@visactor/vtable'
import apiUrl from '@/core/config/url'
import * as listTableFn from '@/core/script/tableFn.js'
import * as api from '@/core/script/api'
import dialog from "@/core/script/dialog.js"
import dialogComponent from '@/core/component/dialog.vue'
import siyi from '@/core/script/siyi.js'


const menu = {
  jiecunMoreSettings: {
    title: '结存更多设置',
    icon: 'ri-settings-3-line',
    click: () => jiecunOptions.options.records.length > 0 && listTableFn.seting({table: jiecunOptions}),
  },
  kucunMoreSettings: {
    title: '库存更多设置',
    icon: 'ri-settings-3-line',
    click: () => kucunOptions.options.records.length > 0 && listTableFn.seting({table: kucunOptions}),
  },
}
const searchRef = ref()
const search = [
  {type: 'select', load: 'factory', field: '接单工厂', filter: true, options: {placeholder: '接单工厂'}},
  {type: 'select', load: 'customer', field: '客户代码', filter: true, options: {placeholder: '客户代号'}},
  {
    type: 'select', field: '订单类型', filter: true,
    options: {
      placeholder: '订单类型',
      options: [
        {label: '正式订单', value: '免费订单'},
        {label: '退货订单', value: '退货订单'},
        {label: '备料订单', value: '备料订单'},
        {label: '外协订单', value: '外协订单'},
        {label: '预付费订单', value: '预付费订单'},
        {label: '内部订单', value: '内部订单'},
        {label: '库存订单', value: '库存订单'},
        {label: '返单', value: '返单'},
        {label: '样板订单', value: '样板订单'},
        {label: '赠品订单', value: '赠品订单'},
        {label: '临时订单', value: '临时订单'},
        {label: '免投产订单', value: '免投产订单'},
        {label: '制工具/额外费用订单', value: '制工具/额外费用订单'},
        {label: '半制程', value: '半制程'},
      ]
    }
  },
  {type: 'input', field: '生产型号', filter: true, options: {placeholder: '生产型号'}, style: {width: '194px'}},
  {type: 'input', field: '版本', filter: true, options: {placeholder: '版本'}, style: {width: '80px'}},
  {type: 'input', field: '销售订单号', filter: true, options: {placeholder: '销售订单号'}, style: {width: '180px'}},
  {type: 'input', field: '客户订单号', filter: true, options: {placeholder: '客户订单号'}, style: {width: '160px'}},
  {type: 'input', field: '客户型号', filter: true, options: {placeholder: '客户型号'}},
  {type: 'input', field: '客户物料编号', filter: true, options: {placeholder: '客户物料编号'}},
]


const labelStyle = {width: '170px', color: 'black'}
const contentStyle = {color: 'black', wordWrap: 'break-word'}
const detailsShow = ref(false)
const detailsData = ref({})
const title = siyi.nav.title + '详细信息'


const box = ref()
const footer = ref('')
const report = ref()
const reportOptions = _.merge({}, listTableFn.defaultConfig(), {
  dom: report.value,
  url: apiUrl.sales.salesOrderStatusQuery.index,
  disablePage: true,
  getQuery() {
    return {exec: reportOptions.id, where: searchRef.value.get()}
  },
  async getData() {
    const startTime = Date.now()
    const loading = dialog.loading(box.value)
    const userConfig = await listTableFn.mergeConfig(reportOptions)
    reportOptions.data = await api.get(reportOptions.url, reportOptions.getQuery())
    if (reportOptions.data === undefined) return
    listTableFn.createTable(reportOptions)
    await listTableFn.mergeColumn(reportOptions, userConfig.columns)
    listTableFn.update(reportOptions)
    searchRef.value.dataFilter()
    getTongjiData()
    loading.close()
    footer.value = listTableFn.footerMessage(reportOptions, startTime)
    loading.close()
  }
})


//结存
const jiecun = ref()
const jiecunOptions = _.merge({}, listTableFn.defaultConfig(), {
  id: siyi.nav.id + '_jiecun',        //id
  name: siyi.nav.title + '-结存',   //报表名称
  dom: jiecun.value,              //报表挂载的DOM节点
  disablePage: true,
  url: apiUrl.sc.workOrderStatusQuery.jiecun, //获取数据的API接口
  options: _.merge({}, VtableOptions, {
    // dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: null,
  }),
  getQuery() {
    return {partnum: reportOptions.selectRow.生产型号}
  },
  async getData() {
    const loading = dialog.loading(jiecun.value)
    const userConfig = await listTableFn.mergeConfig(jiecunOptions)
    jiecunOptions.data = await api.get(jiecunOptions.url, jiecunOptions.getQuery())
    listTableFn.createTable(jiecunOptions, undefined, function (col) {
      if (['pnl', 'set', 'pcs', 'wpnl', 'wset', 'wpcs', 'spnl', 'sset', 'spcs'].includes(col.field)) col.aggregationType = 'SUM'
      return col
    })
    await listTableFn.mergeColumn(jiecunOptions, userConfig.columns)
    listTableFn.update(jiecunOptions)
    loading.close()
  },
})


//库存
const kucun = ref()
const kucunOptions = _.merge({}, listTableFn.defaultConfig(), {
  id: siyi.nav.id + '_kucun',        //id
  name: siyi.nav.title + '-库存',   //报表名称
  dom: kucun.value,              //报表挂载的DOM节点
  disablePage: true,
  url: apiUrl.sc.workOrderStatusQuery.kucun, //获取数据的API接口
  options: _.merge({}, VtableOptions, {
    // dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: null,
  }),
  getQuery() {
    return {partnum: reportOptions.selectRow.生产型号}
  },
  async getData() {
    const loading = dialog.loading(kucun.value)
    const userConfig = await listTableFn.mergeConfig(kucunOptions)
    kucunOptions.data = await api.get(kucunOptions.url, kucunOptions.getQuery())
    listTableFn.createTable(kucunOptions, undefined, function (col) {
      if (['qtyofunit', 'qtytransit', 'qtyiqctransit', 'qtyofunitalloc'].includes(col.field)) col.aggregationType = 'SUM'
      return col
    })
    await listTableFn.mergeColumn(kucunOptions, userConfig.columns)
    listTableFn.update(kucunOptions)
    loading.close()
  },
})


//统计集团信息  BR1030P02W0120572
const jtsum = ref('')
const getTongjiData = () => {
  let _orderArea = 0 //订单面积
  let _qty_Order = 0 //订单数
  let _qty_Gift = 0 //赠品数量
  let _qty_Shipped = 0 //已交数
  let _qty_wj = 0 //未交数
  for (const row of reportOptions.options.records) {
    if (row.生产型号大版本 === reportOptions.selectRow.生产型号大版本) {
      _orderArea += parseFloat(row.订单面积)
      _qty_Order += parseInt(row.订单数量)
      _qty_Gift += parseInt(row.赠品数量)
      _qty_Shipped += parseInt(row.已交数量)
      _qty_wj += parseInt(row.未交数量)
    }
  }
  let _jc = 0
  const ncjc = {}
  for (const record of jiecunOptions.options.records) {
    if (record.partnumrev !== undefined && record.partnumrev === reportOptions.selectRow.生产型号大版本) {
      const _tempjc = (parseInt(record.pcs) + parseInt(record.wpcs) + parseInt(record.spcs))
      if (record.partlevel === '内层') {
        if (ncjc[record.mfgpartid] === undefined) ncjc[record.mfgpartid] = 0
        ncjc[record.mfgpartid] += _tempjc
      } else {
        _jc += _tempjc
      }
    }
  }
  const ncjclist = Object.values(ncjc)
  _jc += ncjclist.length > 0 ? Math.min(...Object.values(ncjc)) : 0

  let _kc = 0 //库存
  let _zy = 0 //占用
  for (const record of kucunOptions.options.records) {
    if (record.partnumrev !== undefined && record.partnumrev === reportOptions.selectRow.生产型号大版本) {
      _kc += parseInt(record.qtyofunit)
      _zy += parseInt(record.qtyofunitalloc)
    }
  }
  // let _wj = _qty_Order + _qty_Gift - _qty_Shipped
  let _qs = (_qty_wj - _zy) - _jc - (_kc - _zy)
  jtsum.value = `
  ，${reportOptions.selectRow.生产型号大版本 || ''}
  ，面积：${_.round(_orderArea, 2)}
  ，数量：${_qty_Order}
  ，赠品：${_qty_Gift}
  ，已交：${_qty_Shipped}
  ，占用：${_zy}
  ，未交：${_qty_wj}
  ，在线：${_jc}
  ，库存：${_kc}
  ，欠数：${_qs > 0 ? _qs : '多' + Math.abs(_qs)}
  ，欠数=(未交-占用)-在线-(库存-占用)
  `
}


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
// onActivated(() => {
//   nav.hide.value = true
// })

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
// onDeactivated(() => {
//   nav.hide.value = false
// })


onMounted(() => {
  reportOptions.table = new ListTable(report.value, reportOptions.options)
  // reportOptions.getData()
  jiecunOptions.table = new ListTable(jiecun.value, jiecunOptions.options)
  kucunOptions.table = new ListTable(kucun.value, kucunOptions.options)

  reportOptions.table.on('dblclick_cell', function (args) {
    if (args.originData?.index === undefined) return
    for (const col of reportOptions.options.columns) {
      if (col.cellType === 'checkbox' || col.hide === true) continue
      detailsData.value[col.title] = args.originData[col.field]
    }
    detailsShow.value = true
  })

  reportOptions.table.on('click_cell', args => {
    if (args.cellLocation === 'columnHeader') return;
    if (!args.originData?.生产型号大版本 || args.originData?.生产型号大版本 === reportOptions.selectRow?.生产型号大版本) return
    reportOptions.selectRow = args.originData
    Promise.all([jiecunOptions.getData(), kucunOptions.getData()]).then(() => getTongjiData())
  })
})
</script>
<style scoped>
.salesOrderQuery {
  padding: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .header {
    width: 100%;
    border: 1px solid #e1e4e8;
    border-bottom: 0 none;
    border-radius: 5px 5px 0 0;
    background-color: #f3f3f3;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }

  > .body {
    flex: 1;
    flex-shrink: 0;
    display: grid;
    grid-template-columns: repeat(2, 50%);
    grid-template-rows:auto 50% 25px;
    grid-template-areas:
      "mainTable mainTable"
      "jiecun kucun"
      "footer footer";

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

    > .table.mainTable {
      grid-area: mainTable;
    }

    > .table.jiecun {
      grid-area: jiecun;
    }

    > .table.kucun {
      grid-area: kucun;
    }

    > .footer {
      grid-area: footer;
      width: 100%;
      height: 100%;
      padding: 0 5px;
      font-size: 12px;
      border: 1px solid #ddd;
      border-top: 0 none;
      border-radius: 0 0 5px 5px;
      overflow: auto hidden;
      white-space: nowrap;
      display: flex;
      align-items: center;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>