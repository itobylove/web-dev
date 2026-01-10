<template>
  <div>
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <DialogComponent v-if="dialogConfig.show" v-bind="dialogConfig.config">
      <div class="dialogClass">
        <t-radio-group variant="primary-filled" v-model="dialogConfig.plantid" theme="button" @change="fn.dialogStepOptions()" :options="dialogConfig.plantOptions"/>
        <t-input v-model="dialogConfig.holidayName" placeholder="请输入假日名称"/>
        <t-select v-model="dialogConfig.stepId" placeholder="请选择工序" multiple :min-collapsed-num="1" :options="dialogConfig.stepOptions" />
        <t-date-picker v-model="dialogConfig.startTime" :disable-date="fn.disableBeforeToday" placeholder="请选择开始时间" enable-time-picker  @change="fn.handleStartTimeChange"/>
        <t-date-picker v-model="dialogConfig.endTime" :disable-date="fn.disableAfterStartTime" placeholder="请选择结束时间" enable-time-picker/>
      </div>
    </DialogComponent>
  </div>
</template>
<script setup>
import {onMounted, ref, reactive} from 'vue';
import siyi from "@/core/script/siyi.js";
import apiUrl from '@/core/config/url.js';
import dialog from "@/core/script/dialog.js";
import TableComponent from '@/core/component/table_v2.vue';
import DialogComponent from "@/core/component/dialog.vue";
import * as api from '@/core/script/api.js';
import * as tableFn from '@/core/script/tableFn.js';
import * as select from '@/core/config/select.js'
import * as core from '@/core/script/core';

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      holidayAdd: {sort: 650, title: '新增节假日' , icon: 'ri-list-settings-fill', click: () => fn.holidayAdd()},
      holidayDel: {sort: 651, title: '删除节假日', icon: 'ri-send-plane-fill', click: () => fn.holidayDel()},
    },
  },
  searchConfig: {
    search: [
      {type: 'radio', field: 'factory', options: {placeholder: '生产工厂',filter: true}, value:core.getDefaultPlantId() , onChange: (val) => fn.searchStepOptions(val)},
      {type: 'input', field: 'holidayName', options: {placeholder: '假日名称'}},
      {type: 'select', field: 'stepId', options: { minCollapsedNum: 1, placeholder: '工序', options:[]}},
      {type: 'rangeTime', field: 'rangeTime', options: {placeholder: '时间范围'}},
    ],
  },
  tableConfig: {
    url: apiUrl.sc.mesHoliday.holiday_list,
    showCheck: true,
    disablePage: false,
    options: {
      select: {
        outsideClickDeselect: false,//点击外部区域是否取消选中。
      }
    },
  }
}

const fn = {
  holidayAdd: () => {
    dialogConfig.config.title = '新增节假日';
    dialogConfig.type = 'holiday_add';
    dialogConfig.holidayName='';
    dialogConfig.stepId=[];
    dialogConfig.startTime='';
    dialogConfig.endTime='';
    dialogConfig.show = true;
  },
  holidayDel: () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (!dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？','删除确认')) {
      return;
    }
    api.post(apiUrl.sc.mesHoliday.holiday_del, {ids: checkedRows.map(item => item.id)}).then(res => {
      if (!res) return;
      dialog.success(res);
      mainReport.value.reportConfig.getData({}, false);
    });
  },
  getStepOptions: (val) => { //根据选择的工厂过滤工序
    const filterOptions = dialogConfig.stepOptionsAll.filter(item => parseInt(item.plantsId) === parseInt(val) && parseInt(item.ifActive) === 1 && item.analysisCode5 == '生产');
    return [{ label: '全选', checkAll: true },...filterOptions];
  },
  searchStepOptions: (val) => { //根据查询页面的工厂过滤工序
    mainReport.value.search.updateSearchItem('stepId',{options:fn.getStepOptions(val),value:[]});
  },
  dialogStepOptions: () => { //根据新增弹出框选择的工厂过滤工序
    dialogConfig.stepOptions =  fn.getStepOptions(dialogConfig.plantid);
  },
  getPlantOptions: () => { //过滤深圳工厂
    return dialogConfig.plantOptionsAll.filter(item =>parseInt(item.value) !== 4);
  },
  disableBeforeToday: (date) => { //开始时间禁止今天之前的数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  },
  disableAfterStartTime: (date) => { //结束时间禁止开始时间之前的数据
    if (!dialogConfig.startTime) return false;
    const startTime = new Date(dialogConfig.startTime);
    return date < startTime;
  },
  handleStartTimeChange: (value) => { //结束日期禁止开始时间之前的数据
    if (value && dialogConfig.endTime) {
      const start = new Date(value);
      const end = new Date(dialogConfig.endTime);
      if (end < start) {
        dialogConfig.endTime = '';
      }
    }
  },

}
const dialogConfig = reactive({
  show: false,
  plantid: core.getDefaultPlantId(),
  holidayName: '',
  stepId: [],
  stepOptions: [],
  startTime: '',
  endTime: '',
  config: {
    type: 'confirm',
    onAfterClose: () => dialogConfig.show = false,
    onOk: async obj => {
      if (!dialogConfig.holidayName) {
        dialog.warning('请输入节假日名称');
        obj.close = false;
        return;
      }
      if (dialogConfig.stepId.length === 0) {
        dialog.warning('请选择工序');
        obj.close = false;
        return;
      }
      if (!dialogConfig.startTime) {
        dialog.warning('请选择开始时间');
        obj.close = false;
        return;
      }
      if (!dialogConfig.endTime) {
        dialog.warning('请选择结束时间');
        obj.close = false;
        return;
      }
      const load = dialog.info('正在处理，请稍等', 999999);
      const res = await api.post(apiUrl.sc.mesHoliday[dialogConfig.type], {holidayName: dialogConfig.holidayName, stepId: dialogConfig.stepId, startTime:dialogConfig.startTime, endTime:dialogConfig.endTime})
      load.close();
      if (!res) return;
      dialog.success(res);
      mainReport.value.reportConfig.getData({}, false);
    },
  }
})


onMounted(async () => {
  const defaultPlantId= core.getDefaultPlantId(); // 默认工厂ID
  dialogConfig.stepOptionsAll = await select.getOptions('step', '', {showMore: true});
  dialogConfig.stepOptions = fn.getStepOptions(defaultPlantId);
  dialogConfig.plantOptionsAll = await select.getOptions('factory',{showMore: true});
  dialogConfig.plantOptions = fn.getPlantOptions();
  api.get(apiUrl.sc.mesHoliday.holiday_config).then(res => {
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const searchIndex = mainReportConfig.searchConfig.search.findIndex(item => item.field === 'stepId');
    mainReportConfig.searchConfig.search[searchIndex].options.options = fn.getStepOptions(defaultPlantId);
    const searchIndex1 = mainReportConfig.searchConfig.search.findIndex(item => item.field === 'factory');
    mainReportConfig.searchConfig.search[searchIndex1].options.options = fn.getPlantOptions();
    mainReportShow.value = true;
  });
});

</script>

<style scoped>
.dialogClass {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  > div {
    width: auto;
  }
}
</style>