<template>
  <TableComponent ref="report" :menu :defaultMenuHideList="['clearCache','advancedExport']" :search :rowBeforCallback :colAfterCallback :tableConfig/>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import apiUrl from '@/core/config/url.js'
import * as api from '@/core/script/api.js'
import * as core from '@/core/script/core.js'
import TableComponent from '@/core/component/table.vue'
import dialog from '@/core/script/dialog.js'
import * as listTableFn from '@/core/script/tableFn.js'

const report = ref()


const menu = {
  sync: {sort: 101, title: '保存参数', icon: 'ri-settings-3-line', click: () => saveData()},
  unlink: {sort: 102, title: '解除关联', icon: 'ri-link-unlink', click: () => unlink()},
  notice: {sort: 103, title: '通知百能', icon: 'ri-megaphone-line', click: () => noticeems()},
}

const search = ref([
  {
    type: 'select',
    field: 'salespartid',
    load: 'sale_part',
    remote: true,
    save: false,
    options: {multiple: false, empty: "请输入销售部件型号", placeholder: '可以搜索销售部件型号', style: "width:270px"},
    onChange: async value => {
      await getSearchData(value)
      return true
    },
  },
  {
    type: 'select',
    field: 'emsorderid',
    load: 'lt_erpsyncems',
    remote: true,
    save: false,
    options: {multiple: false, empty: "请输入客户型号", placeholder: '可以搜索客户代码、客户型号、客户物料号、EMS订单号、姓名', style: "width:800px"},
    onChange: () => {
      const where = report.value.search.get()
      if (where.salespartid > 0 && where.emsorderid?.length > 30) report.value.reportOptions.getData()
    },
  },
])


const getSearchData = async salespartid => {
  const result = await api.get(apiUrl.sales.salesPartsSyncBaineng.getsalesparts, {salespartid})
  if (result) {
    for (const item of search.value) {
      if (item.field === 'salespartid' && result?.salespartData?.length > 0) {
        item.value = result.salespartData[0].value
        item.options.options = result.salespartData
        continue
      }
      if (item.field === 'emsorderid' && result?.emsorderData?.length > 0) {
        item.value = result.emsorderData[0].value
        item.options.options = result.emsorderData
      }
    }
    if (result?.salespartData?.length > 0 && result?.emsorderData?.length > 0) report.value.reportOptions.getData()
  }
}

const rowBeforCallback = row => {
  if (row.islink === '已绑定') row.check = true
  return row
}

const colAfterCallback = col => {
  if (col.field === 'contrast') {
    col.style = args => {
      if (args.value === '✓') {
        return {bgColor: 'rgb(0,255,0)'}
      } else if (args.value === '×') {
        return {bgColor: 'rgb(255,0,0)'}
      }
    }
  }
  if (col.field === 'islink') {
    col.style = args => {
      if (args.value === '已绑定') {
        return {bgColor: 'rgb(53,161,253)'}
      }
    }
  }
  return col
}


const tableConfig = {
  autoLoad: false,
  showCheck: true,
  url: apiUrl.sales.salesPartsSyncBaineng.index,
}

//追加搜索销售部件改变时回调


//保存数据
const saveData = async () => {
  const where = report.value.search.get()
  const data = listTableFn.getCheckedRecords(report.value.reportOptions)?.filter(item => item.emscode)
  if (where.salespartid > 0 && where.emsorderid?.length > 30 && data?.length > 0) {
    dialog.confirm('确定报价单没有选错，一旦保存此报价单将无法在关联给其它销售部件，请谨慎操作！', async () => {
      await api.post(apiUrl.sales.salesPartsSyncBaineng.sync, {salespartid: where.salespartid, emsorderid: where.emsorderid, data})
      await report.value.reportOptions.getData()
    })
  } else {
    dialog.error('请选择销售部件和报价单，并且要查询出数据')
  }
}

const unlink = async () => {
  const where = report.value.search.get()
  await api.get(apiUrl.sales.salesPartsSyncBaineng.unlink, {salespartid: where.salespartid})
  dialog.info('解绑完成')
}

const noticeems = async () => {
  const where = report.value.search.get()
  await api.get(apiUrl.sales.salesPartsSyncBaineng.noticeems, {salespartid: where.salespartid})
  dialog.info('通知完成')
}

onMounted(async () => {
  const salespartid = core.query.get('orderId')
  salespartid > 0 && getSearchData(salespartid)
})
</script>