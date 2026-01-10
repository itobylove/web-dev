<template>
  <div>
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <DialogComponent v-if="dialogConfig.show" v-bind="dialogConfig.config">
      <div class="dialogClass">
        <t-radio-group variant="primary-filled" v-model="dialogConfig.plantid" theme="button" :options="dialogConfig.plantOptions"/>
        <t-date-picker v-model="dialogConfig.ym" presetsPlacement="" mode="month" clearable allow-input/>
      </div>
    </DialogComponent>
  </div>
</template>
<script setup>
import {onMounted, ref, reactive} from 'vue';
import apiUrl from '@/core/config/url.js';
import dialog from '@/core/script/dialog.js';
import TableComponent from '@/core/component/table_v2.vue';
import DialogComponent from "@/core/component/dialog.vue";
import * as api from '@/core/script/api.js';
import * as tableFn from '@/core/script/tableFn.js';
import * as core from '@/core/script/core';
import * as select from "@/core/config/select.js";


const fn = {
  sendPandian: () => {
    dialogConfig.config.title = '推送盘点表';
    dialogConfig.type = 'step_material_send';
    dialogConfig.show = true;
  }
}

const dialogConfig = reactive({
  show: false,
  plantid: core.getDefaultPlantId(),
  ym: '',
  plantOptions: [],
  config: {
    type: 'confirm',
    onAfterClose: () => dialogConfig.show = false,
    onOk: async obj => {
      if (!dialogConfig.plantid) {
        dialog.warning('请选工厂');
        obj.close = false;
        return;
      }
      if (!dialogConfig.ym) {
        dialog.warning('请选择月份');
        obj.close = false;
        return;
      }
      const load = dialog.info('正在处理，请稍等', 999999);
      const res = await api.post(apiUrl.ac.pandian[dialogConfig.type], {plantid: dialogConfig.plantid, ym: dialogConfig.ym});
      load.close();
      dialog.success(res);
    },
  }
})

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      sendPandian: {sort: 650, title: '推送盘点表', icon: 'ri-send-plane-fill', click: () => fn.sendPandian()},
    },
  },
  searchConfig: {
    search: [
      {type: 'radio', field: 'plantid', load: 'factory', value: core.getDefaultPlantId()},
      {type: 'month', field: 'ym', value: core.date.Ym(), options: {placeholder: '月份'}},
    ],
  },
  tableConfig: {
    url: apiUrl.ac.pandian.step_material_list,
    showCheck: false,
    disablePage: false,
  }
}


onMounted(async () => {
  dialogConfig.plantOptions = await select.getOptions('factory');
  api.get(apiUrl.ac.pandian.step_material_config).then(res => {
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
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

