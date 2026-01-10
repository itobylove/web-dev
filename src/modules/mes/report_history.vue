<template>
  <div class="report-history">
    <TableComponent class="list" ref="listReport" v-if="listReportShow" v-bind="listReportConfig" />
    <TableComponent class="detailList" ref="detailListReport" v-if="detailListReportShow" v-bind="detailListReportConfig"  />
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import apiUrl from '@/core/config/url2.js';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api.js';
import * as tableFn from '@/core/script/tableFn.js';
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
const props = defineProps({
  where: {type: Object, required: false}
});

//页面数据
const vData=reactive({
  selectOptions: {status:[],user_id:[],step_id:[],process_id:[],equipment_id:[]},
})
const listReport = ref();
const listReportShow = ref(false);
const listReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache', 'submitApprove', 'resetApprove', 'approve', 'advancedExport'],
  },
  searchConfig: {
    search: [
      {type: 'input', field: 'wo', options: {placeholder: '工单'}},
      {type: 'input', field: 'job', options: {placeholder: '生产型号'}},
      {type: 'select', field: 'step_id', options: {multiple:false,placeholder: '工序',style:{width:'160px'}, options: vData.selectOptions.step_id}},
      {type: 'select', field: 'process_id', options: {multiple:false,placeholder: '工艺',style:{width:'160px'}, options: vData.selectOptions.process_id}},
      {type: 'select', field: 'equipment_id', options: {multiple:false,placeholder: '设备',style:{width:'160px'}, options: vData.selectOptions.equipment_id}},
      {type: 'select', field: 'employee_id', options: {multiple:false,placeholder: '人员',style:{width:'160px'}, options: vData.selectOptions.user_id}},
      {type: 'select', field: 'result', options: {multiple:false,placeholder: '结果',style:{width:'160px'}, options: vData.selectOptions.result}},
      {type: 'rangeTime', field: 'intime', options: {placeholder: '开始时间范围'}},
      {type: 'rangeTime', field: 'outtime', options: {placeholder: '开始时间范围'}},
    ],
  },
  where: props.where,
  tableConfig: {
    url: apiUrl.mes.report_data.historyMain,
    showCheck: true,
    disablePage: false,
    useEncryptionFields: false,
    events: {
      click_cell: ({originData}) => {//双击单元格
        if (originData?.index === undefined) return;//索引为undefined的行不处理
        detailListReport.value.reportConfig.getData({reportdata_id: originData.id}, false);
      }
    },
  },

}

const detailListReport = ref();
const detailListReportShow = ref(false);
const detailListReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
  },
  tableConfig: {
    url: apiUrl.mes.report_data.historyDetail,
    showCheck: true,
    disablePage: false,
    useEncryptionFields: false,
  }
}

onMounted(() => {
  if (props.where && Object.keys(props.where).length > 0) {
    siyi.navHide = true; // 隐藏导航栏
  }
  api.get(apiUrl.mes.report_data.historyMainConfig).then(res => {
    vData.selectOptions = getOptionsLabel(res?.option);
    listReportConfig.tableConfig = {...listReportConfig.tableConfig, ...res.table};
    listReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const searchFields = ['status', 'result', 'employee_id', 'step_id', 'process_id', 'equipment_id'];
    searchFields.forEach(field => {
      const searchItem = listReportConfig.searchConfig.search.find(item => item.field === field);
      if (searchItem) searchItem.options.options = vData.selectOptions[field] || [];
      if (props.where && props.where[field] !== undefined) {
        searchItem.value = props.where[field];
        searchItem.options.disabled = true;
      }
    });
    listReportShow.value = true;
  });
  api.get(apiUrl.mes.report_data.historyDetailConfig).then(res => {
    detailListReportConfig.tableConfig = {...detailListReportConfig.tableConfig, ...res.table};
    detailListReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    detailListReportShow.value = true;
  });
});
defineExpose({reportTable:listReport, detailTable:detailListReport})

</script>
<style>
.report-history {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.report-history .list {
  flex: 1 1 50%;
  min-height: 50%;
  overflow: auto;
  padding-bottom: 0;
}

.report-history .detailList {
  flex: 1 1 50%;
  min-height: 50%;
  overflow: auto;
}
</style>