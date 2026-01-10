<template>
  <div ref="box" class="workOrderStatusQuery">
    <div class="header">
      <Menu :menu :table="reportOptions" :search="searchRef" :default-menu-hide-list="['submitApprove', 'resetApprove', 'approve']"/>
      <Search ref="searchRef" :search :table="reportOptions" :filterCallBack/>
    </div>
    <div :class="['body',{'hidecount':siyi.navHide}]">
      <div class="table mainTable">
        <div ref="report"></div>
      </div>
      <div class="table stephuizong">
        <div ref="stephuizong"></div>
      </div>
      <div class="table partnumhuizong">
        <div ref="partnumhuizong"></div>
      </div>
      <div class="table jiecun">
        <div ref="jiecun"></div>
      </div>
      <div class="table kucun">
        <div ref="kucun"></div>
      </div>
      <div class="vchart">
        <t-space :size="0">
          <t-statistic v-bind="statisticOptions" :value="statisticValue.area" color="blue" title="总结存面积" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.wo" color="blue" title="总工单" unit="张"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.chaoshi" color="red" title="超时面积" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.wochaoshi" color="red" title="超时工单" unit="张"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.status" color="black" title="未排产面积" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.wono" color="black" title="未排产工单" unit="张"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.status1" color="green" title="生产中" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.wosc" color="green" title="生产工单" unit="张"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.status0" color="orange" title="暂停中" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.wozt" color="orange" title="暂停工单" unit="张"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.level3" color="red" title="3级(十万火急)" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.level2" color="orange" title="2级(特急)" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.level1" color="blue" title="1级(加急)" unit="m²"/>
          <t-statistic v-bind="statisticOptions" :value="statisticValue.level0" color="black" title="0级(普通)" unit="m²"/>
          <t-statistic :value="time" color="green" title="数据更新" unit="S"/>
          <template #separator>
            <t-divider layout="vertical"/>
          </template>
        </t-space>
      </div>
    </div>
    <dialogComponent v-if="standardTimeShow" v-bind="standardTime.dialog">
      <TableComponent ref="standardTimeReport" v-bind="standardTime.table"/>
    </dialogComponent>
    <dialogComponent v-if="holidayTimeShow" v-bind="holidayTime.dialog">
      <TableComponent ref="holidayTimeReport" v-bind="holidayTime.table"/>
    </dialogComponent>
    <dialogComponent v-if="woManagementShow" v-bind="woManagement.dialog">
      <t-tabs v-model="woManagementTab" v-bind="woManagement.tabs">
        <t-tab-panel value="detail" :destroyOnHide="false" label="工单数据">
          <div class="detail">
            <dl v-for="item in woManagement.detail">
              <dt>{{ item.title }}</dt>
              <dd>{{ item.value }}</dd>
            </dl>
          </div>
        </t-tab-panel>
        <t-tab-panel value="guoshu" :destroyOnHide="false" label="过数记录">
          <TableComponent ref="guoshu" v-bind="woManagement.guoshu"/>
        </t-tab-panel>
        <t-tab-panel value="salesorder" :destroyOnHide="false" label="订单情况">
          <TableComponent ref="salesorder" v-bind="woManagement.salesorder"/>
        </t-tab-panel>
        <t-tab-panel value="processparam" :destroyOnHide="false" label="MI参数">
          <TableComponent ref="processparam" v-bind="woManagement.processparam"/>
        </t-tab-panel>
        <t-tab-panel value="miprocess" :destroyOnHide="false" label="MI流程">
          <TableComponent ref="miprocess" v-bind="woManagement.miprocess"/>
        </t-tab-panel>
        <t-tab-panel value="moprocess" :destroyOnHide="false" label="MO流程">
          <TableComponent ref="moprocess" v-bind="woManagement.moprocess"/>
        </t-tab-panel>
        <t-tab-panel value="mibom" :destroyOnHide="false" label="工程BOM">
          <TableComponent ref="mibom" v-bind="woManagement.mibom"/>
        </t-tab-panel>
        <t-tab-panel value="mobom" :destroyOnHide="false" label="计划配料">
          <TableComponent ref="mobom" v-bind="woManagement.mobom"/>
        </t-tab-panel>
        <t-tab-panel value="baofei" :destroyOnHide="false" label="报废记录">
          <TableComponent ref="baofei" v-bind="woManagement.baofei"/>
        </t-tab-panel>
        <t-tab-panel value="wolog" :destroyOnHide="false" label="操作记录">
          <TableComponent ref="wolog" v-bind="woManagement.wolog"/>
        </t-tab-panel>
      </t-tabs>
    </dialogComponent>
    <dialogComponent v-if="oaPauseDialog.show" v-bind="oaPauseDialog.dialogConfig">
      <div class="oaPauseDialog">
        <t-select v-model="oaPauseDialog.value" v-bind="oaPauseDialog.selectoptions"/>
        <t-textarea v-model="oaPauseDialog.remark" v-bind="oaPauseDialog.textareaoptions"/>
      </div>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from 'vue'
import {ListTable} from '@visactor/vtable'
import _ from 'lodash'
import Exceljs from 'exceljs'
import FileSaver from 'file-saver'
import VtableOptions from '@/core/script/tableOptions'
import vtableOptions from '@/core/script/tableOptions'
import apiUrl from '@/core/config/url'
import * as tableFn from '@/core/script/tableFn'
import * as api from '@/core/script/api'
import * as user from '@/core/script/user'
import * as core from '@/core/script/core'
import Menu from '@/core/component/menu.vue'
import dialog from '@/core/script/dialog'
import siyi from '@/core/script/siyi'
import Search from '@/core/component/search.vue'
import dialogComponent from '@/core/component/dialog.vue'
import TableComponent from '@/core/component/table.vue'


const menu = {
  hidecount: {sort: 110, title: '切换', icon: 'ri-layout-4-line', click: () => siyi.navHide = !siyi.navHide},
  plan: {sort: 120, title: '开始', icon: 'ri-exchange-funds-line', click: () => start_cancel()},
  delplan: {sort: 130, title: '取消', icon: 'ri-close-circle-line', click: () => start_cancel(false)},
  planPause: {sort: 140, title: '暂停', icon: 'ri-pause-line', click: () => pause_restore()},
  planStart: {sort: 150, title: '恢复', icon: 'ri-play-line', click: () => pause_restore(false)},
  addlevel: {sort: 160, title: '插队', icon: 'ri-skip-up-line', click: () => planLevel(true)},
  reduceevel: {sort: 170, title: '降级', icon: 'ri-skip-down-line', click: () => planLevel(false)},
  settime: {sort: 175, title: '时间', icon: 'ri-calendar-2-line', click: () => standardTimeShow.value = true},
  setjiaqitime: {sort: 180, title: '假日', icon: 'ri-calendar-schedule-line', click: () => holidayTimeShow.value = true},
  oaPause: {sort: 185, title: '品质暂停', icon: 'ri-pause-line', click: () => oaPause()},
  oaStart: {sort: 190, title: '品质恢复', icon: 'ri-play-line', click: () => oaStart()},
  miPDF: {sort: 195, title: '查看MI', icon: 'ri-file-pdf-2-line', click: () => getMI()},
  stepMoreSettings: {title: '工序汇总设置', icon: 'ri-settings-3-line', click: () => tableFn.seting({table: stephuizongOptions}),},
  partnumhuizongMoreSettings: {title: '型号汇总设置', icon: 'ri-settings-3-line', click: () => tableFn.seting({table: partnumhuizongOptions}),},
  jiecunMoreSettings: {title: '结存汇总设置', icon: 'ri-settings-3-line', click: () => tableFn.seting({table: jiecunOptions}),},
  kucunMoreSettings: {title: '库存汇总设置', icon: 'ri-settings-3-line', click: () => tableFn.seting({table: kucunOptions}),},
  pageExport: {click: () => pageExport()},
}


const searchRef = ref()
const search = [
  {type: 'select', load: 'factory', field: 'factory', filter: true, options: {placeholder: '生产工厂'}},
  {type: 'select', load: 'step', field: 'sname', filter: true, options: {placeholder: '结存工序'}},
  {
    type: 'select', field: 'planstatus', filter: true, options: {
      placeholder: '排产状态',
      options: [
        {label: '未排产', value: '未排产'},
        {label: '生产中', value: '生产中'},
        {label: '暂停中', value: '暂停中'},
      ]
    }
  },
  {
    type: 'select', field: 'wostatus', filter: true, options: {
      placeholder: '工单状态',
      options: [
        {label: '已发放', value: '已发放'},
        {label: '未发放', value: '未发放'},
        {label: '外协', value: '外协'},
        {label: '暂停', value: '暂停'},
      ]
    }
  },
  {type: 'select', load: 'customer', field: 'custcode', filter: true, options: {placeholder: '客户代码'}},
  {type: 'input', field: 'partnum', filter: true, options: {placeholder: '生产型号'}, style: {width: '150px'}},
  {type: 'input', field: 'wonumber', filter: true, options: {placeholder: '工单号'}, style: {width: '150px'}},
  {type: 'input', field: 'monumber', filter: true, options: {placeholder: '制造单号'}, style: {width: '150px'}},
  {type: 'input', field: 'custmatdesc', filter: true, options: {placeholder: '客户物料号'}, style: {width: '150px'}},
  {type: 'input', field: 'custcontractnumber', filter: true, options: {placeholder: '客户订单号'}, style: {width: '150px'}},
  {type: 'date', field: 'zwwoplandate', filter: true, options: {placeholder: '最晚排产', presets: false}},
  {type: 'date', field: 'soplandate', filter: true, options: {placeholder: '排单交期', presets: false}},
]

/**
 * 开始与取消
 * @param type true 开始生产  false 取消生产
 * @param n 每次处理条数
 */
const start_cancel = (type = true, n = 100) => {
  const txt = type ? '未排产' : '生产中'
  const rows = tableFn.getCheckedRecords(reportOptions).filter(item => item.planstatus === txt)
  if (rows.length === 0 || rows.length > n) return dialog.warning(`每次最多操作${n}个${txt}的工单，当前已选${rows.length}个${txt}的工单`)
  dialog.info('正在处理中，请稍等')
  api.post(apiUrl.sc.workOrderStatusQuery[type ? 'plan' : 'delplan'], {woid: rows.map(item => item.woid)}).then(res => {
    reportOptions.getData()
    dialog.success(res)
  })
}


/**
 * 暂停与恢复
 * @param type true 暂停生产  false 恢复生产
 * @param n 每次处理条数
 */
const pause_restore = (type = true, n = 100) => {
  const txt = type ? '生产中' : '暂停中'
  const rows = tableFn.getCheckedRecords(reportOptions).filter(item => item.planstatus === txt)
  for (const row of rows) if (row.pendingstatus === '出站') return dialog.warning('请不要选择出站状态的工单')
  if (rows.length === 0 || rows.length > n) return dialog.warning(`每次最多操作${n}个${txt}的工单，当前已选${rows.length}个${txt}的工单`)
  dialog.input('', (val, obj) => {
    if (val === '') {
      dialog.error('请输入原因')
      obj.close = false
      return
    }
    dialog.info('正在处理中，请稍等')
    api.post(apiUrl.sc.workOrderStatusQuery[type ? 'planPause' : 'planStart'], {planid: rows.map(item => item.planid), remark: val}).then(res => {
      reportOptions.getData()
      dialog.success(res)
    })
  }, '原因', {input: {placeholder: '请输入原因'}})
}

/**
 * 插队与降级
 * @param type true 插队  false 降级
 * @param n 每次处理条数
 */
const planLevel = (type = true, n = 100) => {
  const rows = tableFn.getCheckedRecords(reportOptions).filter(item => item.planid > 0)
  if (rows.length === 0 || rows.length > n) return dialog.warning(`每次最多操作${n}个工单，当前已选${rows.length}个工单`)
  dialog.input('', (val, obj) => {
    if (val === '') {
      dialog.error('请输入原因')
      obj.close = false
      return
    }
    dialog.info('正在处理中，请稍等')
    api.post(apiUrl.sc.workOrderStatusQuery[type ? 'planLevel' : 'planLevel2'], {rows, remark: val}).then(res => {
      reportOptions.getData()
      dialog.info(res)
    })
  }, '原因', {input: {placeholder: '请输入原因'}})
}


/*设置流程标准生产时间*/
const standardTimeShow = ref(false)
const standardTimeReport = ref('')
const standardTime = {
  dialog: {title: '标准时间管理', type: 'window', width: '80%', height: '90%', top: 'center', onAfterClose: () => standardTimeShow.value = false},
  table: {
    defaultMenuShowList: ['search', 'pageExport', 'clearWhere'],
    search: [
      {type: 'select', load: 'factory', field: 'gc', filter: true, options: {placeholder: '工厂'}},
      {type: 'select', load: 'step', field: 'gx', filter: true, options: {placeholder: '工序'}},
      {type: 'select', load: 'process', field: 'gy', filter: true, options: {placeholder: '工艺'}},
      {type: 'input', field: 'ifbarcodentry', filter: true, value: '是', options: {placeholder: '是否过数'}},
    ],
    tableConfig: {
      id: siyi.nav.id + '_standardTime',
      name: siyi.nav.title + '-标准时间',
      url: apiUrl.sc.workOrderStatusQuery.planGettime
    },
    vTableOptions: {
      dragHeaderMode: 'none', //移动表头位置
      columnResizeMode: 'none', //拖动列宽模式
    },
    dblclickCell: false,
    colAfterCallback: col => {
      if (col.field === 'standardtime') col.editor = 'inputEditor'
      return col
    },
    changeCellValue: ({row, col, changedValue, currentValue}) => {
      if (changedValue === currentValue) return;
      const ro = standardTimeReport.value.reportOptions
      const columns = ro.options.columns.filter(column => column.hide === false)[col - (ro.options.rowSeriesNumber ? 1 : 0)]
      if (columns.field !== 'standardtime') return;
      const rows = ro.options.records[row - 1]
      const loading = dialog.loading(ro.box, `正在设置${rows.gy}标准时间`)
      api.post(apiUrl.sc.workOrderStatusQuery.planSettime, rows).then(res => {
        rows.id = res.id
        rows.version = res.version
        for (const item of ro.data) {
          if (item.processid === rows.processid) {
            _.merge(item, rows)
            break
          }
        }
        loading.close()
      })
    },
  },
}


/*设置假期时间*/
const holidayTimeShow = ref(false)
const holidayTimeReport = ref('')
const holidayTime = {
  dialog: {title: '假期时间管理', type: 'window', width: '80%', height: '90%', top: 'center', onAfterClose: () => holidayTimeShow.value = false},
  table: {
    defaultMenuShowList: ['search', 'pageExport', 'clearWhere'],
    search: [
      {type: 'select', load: 'factory', field: 'factory', filter: true, options: {placeholder: '工厂'}},
      {type: 'input', field: 'holiday', filter: true, options: {placeholder: '日期'}},
      {type: 'input', field: 'week', filter: true, options: {placeholder: '星期'}},
      {type: 'input', field: 'remark', filter: true, options: {placeholder: '假日名称'}},
    ],
    tableConfig: {
      id: siyi.nav.id + '_holidayTime',
      name: siyi.nav.title + '-假期时间',
      url: apiUrl.sc.workOrderStatusQuery.getholiday
    },
    vTableOptions: {
      dragHeaderMode: 'none', //移动表头位置
      columnResizeMode: 'none', //拖动列宽模式
    },
    dblclickCell: false,
    colAfterCallback: col => {
      if (col.field === 'remark') col.editor = 'inputEditor'
      return col
    },
    changeCellValue: ({row, col, changedValue, currentValue}) => {
      if (changedValue === currentValue) return;
      const ro = holidayTimeReport.value.reportOptions
      const columns = ro.options.columns.filter(column => column.hide === false)[col - (ro.options.rowSeriesNumber ? 1 : 0)]
      if (columns.field !== 'remark') return;
      const rows = ro.options.records[row - 1]
      const loading = dialog.loading(ro.box, `正在设置${rows.gy}标准时间`)
      api.post(apiUrl.sc.workOrderStatusQuery.setholiday, rows).then(res => {
        rows.id = res.id
        rows.version = res.version
        for (const item of ro.data) {
          if (item.processid === rows.processid) {
            _.merge(item, rows)
            break
          }
        }
        loading.close()
      })
    },
  },
}

const oaPauseDialog = reactive({
  show: false,
  dialogConfig: {
    type: 'confirm', width: '350', height: '200', top: 'center', onOk: async () => {
      if (oaPauseDialog.remark === '') return dialog.error('请输入暂停原因');
      const status = await api.post(apiUrl.sc.workOrderStatusQuery[oaPauseDialog.type === 'oaPause' ? 'oaPause' : 'oaStart'], {
        row: oaPauseDialog.row,
        processid: oaPauseDialog.value,
        remark: oaPauseDialog.remark
      });
      if (status) {
        dialog.info('操作成功');
      }
    },
    onAfterClose: () => oaPauseDialog.show = false
  },
  value: '',
  remark: '',
  selectoptions: {
    placeholder: '请要选择要暂停到那个工艺'
  },
  textareaoptions: {
    placeholder: '请输入暂停原因'
  },
})

const oaPause = async () => {
  const row = tableFn.getCheckedRecords(reportOptions);
  if (row.length === 0) {
    return dialog.error('请选择工单');
  }
  if ([...new Set(row.map(item => item.jobid))].length > 1) {
    return dialog.error('只允许暂停相同型号的工单');
  }
  if (row.filter(item => item.pendingstatus === '出站').length > 0) {
    return dialog.error('出站状态的工单不允许暂停，请下工序接收后才可以暂停');
  }
  const result = await api.get(apiUrl.sc.workOrderStatusQuery.moprocess, {woid: row[0].woid});
  oaPauseDialog.selectoptions.options = result.map(item => {
    return {
      label: item.processnumber_步骤号 + '.' + item.pname_工艺名称,
      value: item.processid,
      disabled: item.ifbarcodentry_是否过数 === '否'
    }
  })
  oaPauseDialog.show = true;
  oaPauseDialog.row = row;
  oaPauseDialog.type = 'oaPause';
  oaPauseDialog.selectoptions.disabled = false;
  oaPauseDialog.dialogConfig.title = '品质暂停'
}


const oaStart = () => {
  const row = tableFn.getCheckedRecords(reportOptions)
  if (row.length > 0) {
    oaPauseDialog.show = true;
    oaPauseDialog.row = row;
    oaPauseDialog.type = 'oaStart';
    oaPauseDialog.selectoptions.disabled = true;
    oaPauseDialog.value = '';
    oaPauseDialog.dialogConfig.title = '品质取消暂停'
  } else {
    dialog.info('请勾选工单');
  }
}

const getMI = () => {
  let jobIdList = tableFn.getCheckedRecords(reportOptions, 'jobid');
  if (jobIdList.length < 1) return dialog.info('请勾选工单')
  const loading = dialog.loading(report.value)
  jobIdList.map(async id => {
    await api.getErpPdf('mi', {id})
    loading.close()
  })
}


const pageExport = () => {
  const excel = new Exceljs.Workbook()
  //在线工单明细
  const columns = reportOptions.options.columns.filter(col => !col.disabledExport && !col.hide && col.cellType !== 'checkbox')
  const woRows = [columns.map(col => col.title)]
  reportOptions.options.records.forEach(item => {
    const row = []
    columns.forEach(col => row.push(col.field === 'ysjdtime' ? item.standardtime > 0 ? item.yytimetxt + '/' + item.standardtime : '' : item[col.field]))
    woRows.push(row)
  })
  const sheet1 = excel.addWorksheet('在线工单明细')
  sheet1.addRows(woRows)
  //工序结存汇总
  const stephuizongRows = [stephuizongOptions.options.columns.map(col => col.title)]
  stephuizongOptions.options.records.forEach(item => {
    const row = []
    stephuizongOptions.options.columns.forEach(col => row.push(item[col.field]))
    stephuizongRows.push(row)
  })
  const sheet2 = excel.addWorksheet('工序结存汇总')
  sheet2.addRows(stephuizongRows)
  //型号结存汇总
  const partnumhuizongRows = [partnumhuizongOptions.options.columns.map(col => col.title)]
  partnumhuizongOptions.options.records.forEach(item => {
    const row = []
    partnumhuizongOptions.options.columns.forEach(col => row.push(item[col.field]))
    partnumhuizongRows.push(row)
  })
  const sheet3 = excel.addWorksheet('型号结存汇总')
  sheet3.addRows(partnumhuizongRows)
  // 导出Excel文件
  excel.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    })
    FileSaver(blob, reportOptions.name + '.xlsx')
  })
}


const box = ref()
const report = ref()
const reportOptions = _.merge({}, tableFn.defaultConfig(), {
  url: apiUrl.sc.workOrderStatusQuery.index, //获取数据的API接口
  disablePage: true,
  showCheck: true,
  options: _.merge({}, vtableOptions, {
    select: {
      blankAreaClickDeselect: false,//点击空白区域是否取消选中。
      outsideClickDeselect: false,//点击外部区域是否取消选中。
    }
    // sortState: [{field: 'csl', order: 'asc'}] 默认排序
  }),
  async getData(query = {}) {
    const loading = dialog.loading(box.value)
    const userConfig = await tableFn.mergeConfig(reportOptions)
    reportOptions.data = await api.get(reportOptions.url, query)
    tableFn.createTable(reportOptions, undefined, function (col) {
      // col.showSort = false
      if (col.field === 'planstatus') col.style = args => {
        if (args.value === '生产中') {
          return {bgColor: 'rgb(0,200,0)'}
        } else if (args.value === '暂停中') {
          return {bgColor: 'rgb(255,255,0)'}
        }
      }
      if (col.field === 'woleveltxt') col.style = args => {
        if (args.value === '1级(加急)') {
          return {bgColor: 'rgb(255,255,0)'}
        } else if (args.value === '2级(特急)') {
          return {bgColor: 'rgb(255,125,0)'}
        } else if (args.value === '3级(十万火急)') {
          return {bgColor: 'rgb(255,80,80)'}
        }
      }
      if (col.field === 'reworkid') col.style = args => {
        if (args.value === '是') return {bgColor: 'rgb(255,80,80)'}
      }
      if (col.field === 'ysjdtime') {
        col.cellType = 'progressbar'
        col.min = 0
        col.max = 1
        col.style = tableFn.progressbar()
        col.fieldFormat = data => data[col.field] > 0 ? data['yytimetxt'] + '/' + data['standardtime'] : ''
      }
      return col
    })
    await tableFn.mergeColumn(reportOptions, userConfig.columns)
    tableFn.update(reportOptions)
    searchRef.value.loadFilter()
    searchRef.value.dataFilter()
    loading.close()
    time.value = 600
  }
})


const stephuizong = ref('')
const stephuizongOptions = _.merge({}, tableFn.defaultConfig(), {
  id: siyi.nav.id + '_stephuizong',        //id
  name: siyi.nav.title + '-工序汇总',   //报表名称
  disablePage: true,
  options: _.merge({}, vtableOptions, {
    // dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: null,
    // sortState: [{field: 'csl', order: 'asc'}] 默认排序
  }),
  factory: '-',
  async getData() {
    const factory = []
    const selectFactory = searchRef.value.get('save')
    selectFactory?.factory?.forEach(value => {
      const list = {1: '湖北龙腾', 4: '深圳龙腾', 6: '珠海龙昌'}
      factory.push(list[value])
    })
    if (factory.join(',') === stephuizongOptions.factory) return
    stephuizongOptions.factory = factory.join(',')
    const loading = dialog.loading(stephuizong.value)
    const userConfig = await tableFn.mergeConfig(stephuizongOptions)
    let data = reportOptions.data
    if (factory.length > 0) {
      data = core.data.search({data, keyword: stephuizongOptions.factory, columns: [{type: 'string', field: 'factory'}]})
    }
    const _data = {}
    data.forEach(item => {
      if (_data[item.factory] === undefined) _data[item.factory] = {}
      if (_data[item.factory][item.sname] === undefined) _data[item.factory][item.sname] = {}
      if (_data[item.factory][item.sname][item.pname] === undefined) _data[item.factory][item.sname][item.pname] = {
        'wo_总工单': {},
        'wosc_生产中工单': {},
        'wochaoshi_超时工单': {},
        'wozt_暂停中工单': {},
        'wono_未排产工单': {},
        'csl_超时率': 0,

        'area_总结存面积': 0,
        'status1_生产中面积': 0,
        'chaoshi_超时面积': 0,
        'status0_暂停中面积': 0,
        'status_未排产面积': 0,

        'stepsort_工序顺序_h': '',
      }
      _data[item.factory][item.sname][item.pname]['stepsort_工序顺序_h'] = item.stepsort
      _data[item.factory][item.sname][item.pname]['area_总结存面积'] += item.jarea
      _data[item.factory][item.sname][item.pname]['wo_总工单'][item.woid] = 1
      if (item.planstatusid === '') {
        _data[item.factory][item.sname][item.pname]['status_未排产面积'] += item.jarea
        _data[item.factory][item.sname][item.pname]['wono_未排产工单'][item.woid] = 1
      }
      if (item.planstatusid === 1) {
        _data[item.factory][item.sname][item.pname]['status1_生产中面积'] += item.jarea
        _data[item.factory][item.sname][item.pname]['wosc_生产中工单'][item.woid] = 1
      }
      if (item.planstatusid === 0) {
        _data[item.factory][item.sname][item.pname]['status0_暂停中面积'] += item.jarea
        _data[item.factory][item.sname][item.pname]['wozt_暂停中工单'][item.woid] = 1
      }
      if (item.ysjdtime >= 1) {
        _data[item.factory][item.sname][item.pname]['chaoshi_超时面积'] += item.jarea
        _data[item.factory][item.sname][item.pname]['wochaoshi_超时工单'][item.woid] = 1
      }

    })
    stephuizongOptions.data = []
    for (const factory in _data) {
      for (const sname in _data[factory]) {
        for (const pname in _data[factory][sname]) {
          _data[factory][sname][pname]['wo_总工单'] = Object.keys(_data[factory][sname][pname]['wo_总工单']).length
          _data[factory][sname][pname]['wono_未排产工单'] = Object.keys(_data[factory][sname][pname]['wono_未排产工单']).length
          _data[factory][sname][pname]['wosc_生产中工单'] = Object.keys(_data[factory][sname][pname]['wosc_生产中工单']).length
          _data[factory][sname][pname]['wozt_暂停中工单'] = Object.keys(_data[factory][sname][pname]['wozt_暂停中工单']).length
          _data[factory][sname][pname]['wochaoshi_超时工单'] = Object.keys(_data[factory][sname][pname]['wochaoshi_超时工单']).length
          if (_data[factory][sname][pname]['wochaoshi_超时工单'] > 0) {
            _data[factory][sname][pname]['csl_超时率'] = _data[factory][sname][pname]['wochaoshi_超时工单'] / _data[factory][sname][pname]['wosc_生产中工单']
          }
          for (const key in _data[factory][sname][pname]) {
            _data[factory][sname][pname][key] = _.round(_data[factory][sname][pname][key], 2)
          }
          stephuizongOptions.data.push({...{'sname_工序': sname, 'pname_工艺': pname}, ..._data[factory][sname][pname]})
        }
      }
    }
    core.data.sortData(stephuizongOptions.data, 'stepsort_工序顺序_h')//倒序
    tableFn.createTable(stephuizongOptions, undefined, function (col) {
      if (col.field === 'csl') {
        col.cellType = 'progressbar'
        col.min = 0
        col.max = 1
        col.style = tableFn.progressbar()
        col.fieldFormat = data => {
          if (data[col.field] === undefined) return ''
          return _.round(data['csl'] * 100, 2) + '%'
        }
      }
      if (!/csl|sname|pname|stepsort/.test(col.field)) col.aggregationType = 'SUM'
      return col
    })
    await tableFn.mergeColumn(stephuizongOptions, userConfig.columns)
    tableFn.update(stephuizongOptions)
    loading.close()
  }
})


const partnumhuizong = ref('')
const partnumhuizongOptions = _.merge({}, tableFn.defaultConfig(), {
  id: siyi.nav.id + '_partnumhuizong',        //id
  name: siyi.nav.title + '-型号汇总',   //报表名称
  disablePage: true,
  options: _.merge({}, vtableOptions, {
    dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: null,
    // sortState: [{field: 'csl', order: 'asc'}] 默认排序
  }),
  async getData(data) {
    const loading = dialog.loading(partnumhuizong.value)
    const userConfig = await tableFn.mergeConfig(partnumhuizongOptions)
    partnumhuizongOptions.data = Object.values(data)
    core.data.sortData(partnumhuizongOptions.data, 'partnum_生产型号')//倒序
    tableFn.createTable(partnumhuizongOptions, undefined, function (col) {
      if (/area|pnl|set|pcs/.test(col.field)) col.aggregationType = 'SUM'
      if (col.field === 'partnum') col.aggregationType = 'ONLYCOUNT'
      return col
    })
    await tableFn.mergeColumn(partnumhuizongOptions, userConfig.columns)
    tableFn.update(partnumhuizongOptions)
    loading.close()
  }
})


//结存
const jiecun = ref()
const jiecunOptions = _.merge({}, tableFn.defaultConfig(), {
  id: siyi.nav.id + '_jiecun',        //id
  name: siyi.nav.title + '-结存',   //报表名称
  disablePage: true,
  url: apiUrl.sc.workOrderStatusQuery.jiecun, //获取数据的API接口
  options: _.merge({}, VtableOptions, {
    // dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: null,
  }),
  async getData() {
    const loading = dialog.loading(jiecun.value)
    const userConfig = await tableFn.mergeConfig(jiecunOptions)
    jiecunOptions.data = await api.get(jiecunOptions.url, {partnum: reportOptions.selectRow.partnum})
    tableFn.createTable(jiecunOptions, undefined, function (col) {
      if (['pnl', 'set', 'pcs', 'wpnl', 'wset', 'wpcs', 'spnl', 'sset', 'spcs', 'rework'].includes(col.field)) col.aggregationType = 'SUM'
      return col
    })
    await tableFn.mergeColumn(jiecunOptions, userConfig.columns)
    tableFn.update(jiecunOptions)
    loading.close()
  },
})


//库存
const kucun = ref()
const kucunOptions = _.merge({}, tableFn.defaultConfig(), {
  id: siyi.nav.id + '_kucun',        //id
  name: siyi.nav.title + '-库存',   //报表名称
  disablePage: true,
  url: apiUrl.sc.workOrderStatusQuery.kucun, //获取数据的API接口
  options: _.merge({}, VtableOptions, {
    // dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: null,
  }),
  async getData() {
    const loading = dialog.loading(kucun.value)
    const userConfig = await tableFn.mergeConfig(kucunOptions)
    kucunOptions.data = await api.get(kucunOptions.url, {partnum: reportOptions.selectRow.partnum})
    tableFn.createTable(kucunOptions, undefined, function (col) {
      if (['qtyofunit', 'qtytransit', 'qtyiqctransit'].includes(col.field)) col.aggregationType = 'SUM'
      return col
    })
    await tableFn.mergeColumn(kucunOptions, userConfig.columns)
    tableFn.update(kucunOptions)
    loading.close()
  },
})


const statisticOptions = {animationStart: true, animation: {valueFrom: 0, duration: 2000}, separator: ''}
const statisticValue = ref({
  level0: 0, level1: 0, level2: 0, level3: 0,
  status: 0, wono: 0,
  status1: 0, wosc: 0,
  status0: 0, wozt: 0,
  chaoshi: 0, wochaoshi: 0,
  area: 0, wo: 0,
})


const filterCallBack = () => {
  stephuizongOptions.getData()
  //底部统计
  for (const key in statisticValue.value) statisticValue.value[key] = 0
  const wo = {}, wono = {}, wozt = {}, wosc = {}, wochaoshi = {}, partnumList = {}
  reportOptions.options.records.forEach(item => {
    if (item.morouteid) {
      statisticValue.value.area += item.jarea
      wo[item.woid] = 1
      statisticValue.value['level' + item.wolevel] += item.jarea
      statisticValue.value['status' + item.planstatusid] += item.jarea
      if (item.planstatusid === '') wono[item.woid] = 1 //未排产
      if (item.planstatusid === 0) wozt[item.woid] = 1  //暂停中
      if (item.planstatusid === 1) wosc[item.woid] = 1  //生产中
      if (item.ysjdtime >= 1) {
        statisticValue.value.chaoshi += item.jarea
        wochaoshi[item.woid] = 1 //超时
      }
      //按型号统计
      if (partnumList[item.jobid] === undefined) {
        partnumList[item.jobid] = {
          partnum_生产型号: item.partnum,
          partrev_版本: item.partrev,
          pnl_pnl: 0,
          set_set: 0,
          pcs_pcs: 0,
          area_净面积: 0,
        }
      }
      partnumList[item.jobid]['pnl_pnl'] += item.pnl * 1
      partnumList[item.jobid]['set_set'] += item.set * 1
      partnumList[item.jobid]['pcs_pcs'] += item.pcs * 1
      partnumList[item.jobid]['area_净面积'] += item.jarea * 1
    }
  })
  statisticValue.value.wo = Object.keys(wo).length
  statisticValue.value.wono = Object.keys(wono).length
  statisticValue.value.wozt = Object.keys(wozt).length
  statisticValue.value.wosc = Object.keys(wosc).length
  statisticValue.value.wochaoshi = Object.keys(wochaoshi).length
  for (const key in statisticValue.value) {
    statisticValue.value[key] = _.round(statisticValue.value[key])
  }
  //按型号统计
  for (const key in partnumList) {
    partnumList[key]['area_净面积'] = _.round(partnumList[key]['area_净面积'], 4)
    partnumList[key]['pnl_pnl'] = _.round(partnumList[key]['pnl_pnl'])
    partnumList[key]['set_set'] = _.round(partnumList[key]['set_set'])
    partnumList[key]['pcs_pcs'] = _.round(partnumList[key]['pcs_pcs'])
  }
  partnumhuizongOptions.getData(partnumList)
}

//防止退出
const T = ref()
const time = ref(600)
const noLoginOut = () => {
  T.value = setInterval(() => {
    time.value--
    if (time.value <= 0) {
      time.value = 600
      user.isLogin(false)
      reportOptions.getData()
    }
  }, 1000)
}


//工单管理
const guoshu = ref('')
const salesorder = ref('')
const processparam = ref('')
const miprocess = ref('')
const moprocess = ref('')
const mibom = ref('')
const mobom = ref('')
const baofei = ref('')
const wolog = ref('')
const woManagementShow = ref(false)
const woManagementTab = ref('detail')
const woManagement = {
  dialog: {
    title: '', type: 'window', width: '80%', height: '90%', top: 'center',
    onAfterClose: () => woManagementShow.value = false, onBeforeOpen: () => woManagementTab.value = 'detail'
  },
  tabs: {
    theme: 'card',
    defaultValue: 'detail',
    onChange(newValue) {
      woManagementTab.value = newValue
      switch (newValue) {
        case 'guoshu':
          guoshu.value.reportOptions.getData({woid: reportOptions.selectRow.woid})
          break
        case 'salesorder':
          salesorder.value.reportOptions.getData({partnum: reportOptions.selectRow.partnum})
          break
        case 'processparam':
          processparam.value.reportOptions.getData({jobid: reportOptions.selectRow.jobid})
          break
        case 'miprocess':
          miprocess.value.reportOptions.getData({jobid: reportOptions.selectRow.jobid})
          break
        case 'moprocess':
          moprocess.value.reportOptions.getData({woid: reportOptions.selectRow.woid})
          break
        case 'mibom':
          mibom.value.reportOptions.getData({jobid: reportOptions.selectRow.jobid})
          break
        case 'mobom':
          mobom.value.reportOptions.getData({moid: reportOptions.selectRow.moid})
          break
        case 'baofei':
          baofei.value.reportOptions.getData({woid: reportOptions.selectRow.woid})
          break
        case 'wolog':
          wolog.value.reportOptions.getData({woid: reportOptions.selectRow.woid})
          break
      }
    }
  },
  detail: [],
  guoshu: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_guoshu', name: siyi.nav.title + '-过数记录', url: apiUrl.sc.workOrderStatusQuery.guoshu},
    vTableOptions: {dragHeaderMode: 'none',},
  },
  salesorder: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_salesorder', name: siyi.nav.title + '-订单情况', url: apiUrl.sc.workOrderStatusQuery.salesorder},
    vTableOptions: {dragHeaderMode: 'none'},
  },
  processparam: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_processparam', name: siyi.nav.title + '-MI参数', url: apiUrl.sc.workOrderStatusQuery.processparam},
    vTableOptions: {dragHeaderMode: 'none'},
  },
  miprocess: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_miprocess', name: siyi.nav.title + '-MI流程', url: apiUrl.sc.workOrderStatusQuery.miprocess},
    vTableOptions: {dragHeaderMode: 'none'},
  },
  moprocess: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_moprocess', name: siyi.nav.title + '-MO流程', url: apiUrl.sc.workOrderStatusQuery.moprocess},
    vTableOptions: {dragHeaderMode: 'none'},
  },
  mibom: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_mibom', name: siyi.nav.title + '-工程BOM', url: apiUrl.sc.workOrderStatusQuery.mibom},
    vTableOptions: {dragHeaderMode: 'none'},
  },
  mobom: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_mobom', name: siyi.nav.title + '-计划配料', url: apiUrl.sc.workOrderStatusQuery.mobom},
    vTableOptions: {dragHeaderMode: 'none'},
  },
  baofei: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_baofei', name: siyi.nav.title + '-报废记录', url: apiUrl.sc.workOrderStatusQuery.baofei},
    vTableOptions: {dragHeaderMode: 'none'},
  },
  wolog: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {id: siyi.nav.id + '_wolog', name: siyi.nav.title + '-操作记录', url: apiUrl.sc.workOrderStatusQuery.wolog},
    vTableOptions: {dragHeaderMode: 'none'},
  },
}


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  // nav.hide.value = true
  noLoginOut()
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  // nav.hide.value = false
  clearInterval(T.value)
})

onMounted(() => {
  reportOptions.table = new ListTable(report.value, reportOptions.options)
  reportOptions.dom = report.value
  reportOptions.box = box.value

  stephuizongOptions.table = new ListTable(stephuizong.value, stephuizongOptions.options)
  stephuizongOptions.dom = stephuizong.value
  stephuizongOptions.box = stephuizong.value

  partnumhuizongOptions.table = new ListTable(partnumhuizong.value, partnumhuizongOptions.options)
  partnumhuizongOptions.dom = partnumhuizong.value
  partnumhuizongOptions.box = partnumhuizong.value

  jiecunOptions.table = new ListTable(jiecun.value, jiecunOptions.options)
  jiecunOptions.dom = jiecun.value
  jiecunOptions.box = jiecun.value

  kucunOptions.table = new ListTable(kucun.value, kucunOptions.options)
  kucunOptions.dom = kucun.value
  kucunOptions.box = kucun.value

  reportOptions.table.on('click_cell', args => {
    if (args.cellLocation === 'columnHeader') return
    if (!args.originData?.jobid || args.originData?.jobid === reportOptions.selectRow?.jobid) return
    reportOptions.prveSelectRow = reportOptions.selectRow
    reportOptions.selectRow = args.originData
    jiecunOptions.getData()
    kucunOptions.getData()
  })

  reportOptions.table.on('dblclick_cell', ({originData}) => {
    if (originData?.index === undefined) return
    woManagement.detail = tableFn.detail(reportOptions, originData, (field, rows) => field === 'ysjdtime' ? rows['standardtime'] > 0 ? `${rows['yytimetxt']}/${rows['standardtime']}` : '' : rows[field])
    const rows = reportOptions.selectRow
    woManagement.dialog.title = `工单管理(${rows.wonumber}/${rows.partnum}/${rows.partrev}/${rows.mfgpartcode})`
    woManagementShow.value = true
  })
})
</script>
<style scoped>
.workOrderStatusQuery {
  padding: 5px;
  overflow: hidden;
  background-color: #f3f4f7;
  display: flex;
  flex-direction: column;

  > .header {
    flex-shrink: 0;
    overflow: hidden;
    border: 1px solid #c9d0da;
    border-bottom: 0 none;
    border-radius: 5px 5px 0 0;
  }

  > .body {
    flex: 1;
    flex-shrink: 0;
    overflow: hidden;
    display: grid;
    grid-template-columns: auto 700px 800px;
    grid-template-rows: auto 22% 22% 86px;
    grid-template-areas:
      "mainTable mainTable mainTable"
      "stephuizong partnumhuizong jiecun"
      "stephuizong partnumhuizong kucun"
      "vchart vchart vchart";

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

    > .table.stephuizong {
      grid-area: stephuizong;
    }

    > .table.partnumhuizong {
      grid-area: partnumhuizong;
    }

    > .table.jiecun {
      grid-area: jiecun;
    }

    > .table.kucun {
      grid-area: kucun;
    }

    > .vchart {
      grid-area: vchart;
      width: 100%;
      height: 100%;
      border: 1px solid #c9d0da;
      border-top: 0 none;
      text-wrap: nowrap;
      padding: 10px;
      border-radius: 0 0 5px 5px;
      font-weight: bold;
      overflow: auto hidden;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  > .body.hidecount {
    grid-template-rows: auto 0 0 86px;
  }
}

.detail {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  > dl {
    font-size: 16px;
    display: flex;

    > dt, > dd {
      flex-shrink: 0;
      line-height: 20px;
      word-wrap: break-word;
      border-bottom: 1px solid #c9d0da;
      border-right: 1px solid #c9d0da;
      display: flex;
      align-items: center;
      padding: 10px 5px;
    }

    > dt {
      width: 160px;
      background-color: #f3f4f7;
    }

    > dd {
      flex: 1;
    }
  }
}

.oaPauseDialog {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px
}

.pauseInput {
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  > input {
    width: 100%;
    height: 40px;
    font-size: 14px;
    border: 1px solid #eaeaea;
    background-color: #FFF;
    outline: none;
    border-radius: 5px;
  }
}
</style>
