<template>
  <div ref="body" class="body">
    <TableComponent class="stepsTable" ref="stepsTable" v-if="refObj.steps.tableShow" v-bind="obj.steps.tableConfig"/>
    <t-tabs class="tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel class="tabsPanel" value="process" v-bind="obj.panelConfig">
        <TableComponent ref="processTable" v-if="refObj.process.tableShow" v-bind="obj.process.tableConfig"/>
      </t-tab-panel>
    </t-tabs>
    <dialogComponent ref="stepsDialog" v-if="refObj.steps.dialogShow" v-bind="obj.steps.dialogConfig">
      <t-form class="form" ref="stepsForm" :data="refObj.steps.data" v-bind="obj.steps.formConfig">
        <t-form-item label="工厂" name="plant_id">
          <t-select v-model="refObj.steps.data.plant_id" :options="plantList" @change="obj.steps.change.plant()"/>
        </t-form-item>
        <t-form-item label="车间" name="workshop_id">
          <t-select v-model="refObj.steps.data.workshop_id" :options="refObj.steps.workshop"/>
        </t-form-item>
        <t-form-item label="ERP工序" name="erp_step_id">
          <t-select v-model="refObj.steps.data.erp_step_id" :options="refObj.steps.options" @change="obj.steps.change.steps" filterable clearable/>
        </t-form-item>
        <t-form-item label="编号" name="code">
          <t-input v-model="refObj.steps.data.code"/>
        </t-form-item>
        <t-form-item label="名称" name="name">
          <t-input v-model="refObj.steps.data.name"/>
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="refObj.steps.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999" placeholder="数字小靠前"/>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="refObj.steps.data.status" :options="obj.steps.options.status"/>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-input v-model="refObj.steps.data.remark"/>
        </t-form-item>
      </t-form>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import {plantList} from '@/utils/erp.js';
import DialogComponent from '@/core/component/dialog.vue';
import dialog from '@/core/script/dialog.js';
import {getOptionsLabel} from '@/utils/vars.js';


const body = ref();//容器DOM
const stepsTable = ref();//工序表DOM
const processTable = ref();//工艺表DOM
const stepsDialog = ref();//工序添加修改窗口DOM
const stepsForm = ref();//工序添加修改表单DOM


const refObj = reactive({
  tab: 'process',
  steps: {tableShow: false, dialogShow: false, options: {}, workshop: {}, data: {}},
  process: {tableShow: false, dialogShow: false},
});


const obj = {
  tabsConfig: {theme: 'card', defaultValue: 'process', onChange: val => refObj.tab = val},
  panelConfig: {destroyOnHide: false, label: '工艺'},
  steps: {
    tableConfig: {
      changeSizeBottom: true,
      menuConfig: {
        defaultMenuHideList: ['submitApprove', 'resetApprove', 'approve', 'advancedExport'],
        menu: {
          create: () => {
            obj.steps.formType = 'stepsCreate';
            obj.steps.dialogConfig.title = '添加工序';
            refObj.steps.data = {id: 0, workshop_id: '', erp_step_id: null, code: '', name: '', sort: 100, status: 1, remark: ''};
            refObj.steps.data.plant_id = stepsTable.value.search.search.searchList[0].value[0];
            const erpStepsIds = stepsTable.value.reportConfig.data.map(item => item.erp_step_id).filter(id => id !== undefined);
            refObj.steps.options = obj.steps.options.erp_steps.filter(item => item.plantsId === refObj.steps.data.plant_id && !erpStepsIds.includes(item.recId));
            refObj.steps.workshop = obj.steps.options.workshop.filter(item => item.plant_id === refObj.steps.data.plant_id && item.status === 1);
            refObj.steps.dialogShow = true;
          },
          update: () => {
            const checkedRows = tableFn.getCheckedRecords(stepsTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工序');
            obj.steps.tableConfig.tableConfig.events.dblclick_cell({originData: checkedRows[0]});
          },
          delete: async () => {
            const checkedRows = tableFn.getCheckedRecords(stepsTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工序');
            const result = await dialog.confirmAsync('确定要删除【' + checkedRows[0].name + '】工序吗？<br>删除后无法恢复，建议禁用。', '请确认', {okval: '禁用', noval: '删除', showClose: true});
            const res = await api.post(apiUrl.sys.steps[result ? 'stepsDisabled' : 'stepsDelete'], {id: checkedRows[0].id});
            if (res) {
              dialog.success(res);
              stepsTable.value.reportConfig.getData();
            }
          },
        },
      },
      searchConfig: {
        filter: false,
        search: [
          {type: 'select', field: 'plant_id_text', load: 'factory', filter: true, options: {placeholder: '生产工厂'}},
          {type: 'input', field: 'code', filter: true, options: {placeholder: '编号'}},
          {type: 'input', field: 'name', filter: true, options: {placeholder: '名称'}},
        ],
      },
      tableConfig: {
        url: apiUrl.sys.steps.stepsList,
        showCheck: 'radio',
        events: {
          dblclick_cell: ({originData}) => {
            if (originData?.index > 0) {
              obj.steps.formType = 'stepsUpdate';
              obj.steps.dialogConfig.title = '修改工序';
              refObj.steps.data = {...refObj.steps.data, ...originData};
              const erpStepsIds = stepsTable.value.reportConfig.data.map(item => item.erp_step_id).filter(id => id !== undefined);
              refObj.steps.options = obj.steps.options.erp_steps.filter(item => item.plantsId === refObj.steps.data.plant_id && !erpStepsIds.includes(item.recId));
              refObj.steps.options.push({value: originData.erp_step_id, label: originData.name})
              refObj.steps.dialogShow = true;
            }
          },
          click_cell: ({originData}) => {
            if (originData?.index > 0 && originData.index !== stepsTable.value.reportConfig.prveSelectRow.index) {
              processTable.value.reportConfig.getData({step_id: originData.id});
            }
          }
        },
      },
    },
    dialogConfig: {
      width: 450,
      changeSize: false,
      showFooter: true,
      showClose: false,
      okval: '保存',
      noval: '关闭',
      okCallback: obj => {
        obj.close = false;
        stepsForm.value.submit();
      },
      beforeOpenCallback: () => stepsForm.value.validate(),
      afterCloseCallback: () => refObj.steps.dialogShow = false,
    },
    formConfig: {
      rules: {
        plant_id: [{required: true, message: '请选择工厂', trigger: 'change'}],
        workshop_id: [{required: true, message: '请选择车间', trigger: 'change'}],
        erp_step_id: [{required: true, message: '请选择ERP工序', trigger: 'change'}],
        code: [{required: true, message: '请输入编号', trigger: 'change'}],
        name: [{required: true, message: '请输入名称', trigger: 'change'}],
      },
      onSubmit: async ({validateResult, firstError}) => {
        if (validateResult !== true) return dialog.warning(firstError);
        const loading = dialog.loading(body.value, '保存中...');
        const res = await api.post(apiUrl.sys.steps[obj.steps.formType], refObj.steps.data);
        loading.close();
        if (res) {
          stepsDialog.value.close();
          dialog.success(res);
          stepsTable.value.reportConfig.getData();
        }
      },
    },
    formType: 'stepsCreate',
    options: {},//工序选项数据
    change: {
      plant: () => {
        refObj.steps.data.workshop_id = '';
        refObj.steps.data.erp_step_id = '';
        refObj.steps.data.code = '';
        refObj.steps.data.name = '';
        const erpStepsIds = stepsTable.value.reportConfig.data.map(item => item.erp_step_id).filter(id => id !== undefined);
        refObj.steps.options = obj.steps.options.erp_steps.filter(item => item.plantsId === refObj.steps.data.plant_id && !erpStepsIds.includes(item.recId) && item.ifActive === 0);
        refObj.steps.workshop = obj.steps.options.workshop.filter(item => item.plant_id === refObj.steps.data.plant_id && item.status === 1);
      },
      steps: value => {
        const option = refObj.steps.options.find(item => item.value === value) || {label: '', value: ''};
        refObj.steps.data.name = option.label;
        refObj.steps.data.code = option.code;
      }
    },
  },
  process: {
    tableConfig: {
      menuConfig: {
        defaultMenuHideList: ['search', 'update', 'submitApprove', 'resetApprove', 'approve', 'advancedExport', 'clearWhere', 'clearCache'],
        menu: {
          create: async () => {
            const checkedRows = tableFn.getCheckedRecords(stepsTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工序');
            const processIds = processTable.value.reportConfig.options.records.map(item => item.id).filter(id => id !== undefined);
            const options = obj.steps.options.process.filter(item => item.plant_id === checkedRows[0].plant_id && !processIds.includes(item.id) && item.status === 1);
            const result = await dialog.selectAsync([], '', '请选择要关联的工艺', {select: {options, placeholder: '请选择工艺'}});
            if (result !== false && result > 0) {
              const res = await api.post(apiUrl.sys.steps.bindstepsProcess, {step_id: checkedRows[0].id, process_id: result});
              if (res) {
                dialog.success(res);
                processTable.value.reportConfig.getData({step_id: checkedRows[0].id});
              }
            }
          },
          delete: async () => {
            const checkedRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工艺');
            const processIds = checkedRows.map(item => item.id).filter(id => id !== undefined);
            const result = await dialog.confirmAsync('确定要删除' + processIds.length + '条数据吗？');
            if (!result) return;
            const res = await api.post(apiUrl.sys.steps.unBindstepsProcess, {step_id: stepsTable.value.reportConfig.selectRow.id, processIds});
            if (res) {
              dialog.success(res);
              processTable.value.reportConfig.getData({step_id: stepsTable.value.reportConfig.selectRow.id});
            }
          }
        },
      },
      searchConfig: false,
      tableConfig: {
        url: apiUrl.sys.steps.processList,
        autoLoad: false,
        showCheck: 'multiple',
      },
    },
  },
}


onMounted(() => {
  api.get(apiUrl.sys.steps.stepsConfig).then(res => {
    obj.steps.tableConfig.tableConfig = {...obj.steps.tableConfig.tableConfig, ...res.table};
    obj.steps.tableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.steps.tableShow = true;
    obj.steps.options = getOptionsLabel(res.option);
    obj.steps.options.erp_steps = res.option.erp_steps;
    obj.steps.options.process = res.option.process;
    obj.steps.options.workshop = res.option.workshop;
  });
  api.get(apiUrl.sys.steps.processConfig).then(res => {
    obj.process.tableConfig.tableConfig = {...obj.process.tableConfig.tableConfig, ...res.table};
    obj.process.tableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.process.tableShow = true;
  });
});
</script>
<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;

  > .stepsTable {
    height: 40%;
    flex-shrink: 0;
  }

  .tabs {
    flex: 1;
    flex-shrink: 0;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .form {
    padding: 10px 30px 10px 10px;
  }

  .tabsPanel {
    padding: 3px;
  }
}
</style>