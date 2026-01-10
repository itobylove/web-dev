<template>
  <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
</template>
<script setup>
import {onMounted, ref} from 'vue';
import apiUrl from '@/core/config/url.js';
import dialog from '@/core/script/dialog.js';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api.js';
import * as tableFn from '@/core/script/tableFn.js';


const fn = {
  resetPushData: async rows => {
    const res = await api.post(apiUrl.sales.bainengSyncOrder.update_status, {id: rows[0].id});
    dialog.success(res);
    mainReport.value.reportConfig.getData()
  },
  del: async rows => {
    const res = await api.post(apiUrl.sales.bainengSyncOrder.del, {id: rows[0].id});
    dialog.success(res);
    mainReport.value.reportConfig.getData()
  },
};


const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache', 'submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      resetPushData: {sort: 650, title: '推送订单', icon: 'ri-list-settings-fill', listAction: fn.resetPushData},
      del: {sort: 651, title: '取消推送', icon: 'ri-list-settings-fill', listAction: fn.del},
    },
  },
  searchConfig: {
    search: [
      {type: 'select', field: 'jdplant', options: {placeholder: '接单工厂'}, load: 'factory'},
      {type: 'select', field: 'scplant', options: {placeholder: '生产工厂'}, load: 'factory'},
      {type: 'input', field: 'partnum', style: {width: '200px'}, options: {placeholder: '生产型号'}},
    ],
  },
  tableConfig: {
    url: apiUrl.sales.bainengSyncOrder.main_list,
    showCheck: 'radio',
    disablePage: false,
  }
}


onMounted(() => {
  api.get(apiUrl.sales.bainengSyncOrder.main_config).then(res => {
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    mainReportShow.value = true;
  });
});


</script>