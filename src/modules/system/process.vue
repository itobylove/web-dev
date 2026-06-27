<template>
  <div ref="body" class="body">
    <TableComponent class="processTable" ref="processTable" v-if="refObj.process.tableShow"
                    v-bind="obj.process.tableConfig"/>
    <t-tabs class="tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel class="tabsPanel" value="assets" v-bind="obj.panelConfig">
        <TableComponent ref="assetsTable" v-if="refObj.assets.tableShow" v-bind="obj.assets.tableConfig"/>
      </t-tab-panel>

      <t-tab-panel class="tabsPanel" value="parameter" v-bind="obj.panelConfig" label="参数">
        <TableComponent ref="parameterTable" v-if="refObj.parameter.tableShow" v-bind="obj.parameter.tableConfig"/>
      </t-tab-panel>

    </t-tabs>
    <dialogComponent ref="processDialog" v-if="refObj.process.dialogShow" v-bind="obj.process.dialogConfig">
      <t-form class="form" ref="processForm" :data="refObj.process.data" v-bind="obj.process.formConfig">
        <t-form-item label="工厂" name="plant_id">
          <t-select v-model="refObj.process.data.plant_id" :options="plantList" @change="obj.process.change.plant()"/>
        </t-form-item>
        <t-form-item label="ERP工艺" name="erp_process_id">
          <t-select v-model="refObj.process.data.erp_process_id" :options="refObj.process.options.erp_process_id"
                    @change="obj.process.change.process" filterable clearable/>
        </t-form-item>
        <t-form-item label="编号" name="code">
          <t-input v-model="refObj.process.data.code"/>
        </t-form-item>
        <t-form-item label="名称" name="name">
          <t-input v-model="refObj.process.data.name"/>
        </t-form-item>
        <t-form-item label="单位" name="unit_id">
          <t-select v-model="refObj.process.data.unit_id" :options="obj.process.options.unit_id" filterable clearable/>
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="refObj.process.data.sort" theme="column" style="width: 100%" type="integer" min="0"
                          step="1" max="9999" placeholder="数字小靠前"/>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="refObj.process.data.status" :options="obj.process.options.status"/>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-input v-model="refObj.process.data.remark"/>
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
const processTable = ref();//工艺表DOM
const assetsTable = ref();//资产表DOM
const parameterTable = ref(); //参数表DOM
const processDialog = ref();//工艺添加修改窗口DOM
const processForm = ref();//工艺添加修改表单DOM


const refObj = reactive({
  tab: 'assets',
  process: {tableShow: false, dialogShow: false, options: {}, data: {}},
  assets: {tableShow: false, dialogShow: false},
  parameter: {tableShow: false, dialogShow: false},
});


const obj = {
  tabsConfig: {theme: 'card', defaultValue: 'assets', onChange: val => refObj.tab = val},
  panelConfig: {destroyOnHide: false, label: '资产组'},
  process: {
    tableConfig: {
      changeSizeBottom: true,
      menuConfig: {
        defaultMenuHideList: ['submitApprove', 'resetApprove', 'approve', 'advancedExport'],
        menu: {
          create: () => {
            obj.process.formType = 'processCreate';
            obj.process.dialogConfig.title = '添加工艺';
            refObj.process.data = {
              id: 0,
              unit_id: '',
              erp_process_id: null,
              code: '',
              name: '',
              sort: 100,
              status: 1,
              remark: ''
            };
            refObj.process.data.plant_id = processTable.value.search.search.searchList[0].value[0];
            const erpProcessIds = processTable.value.reportConfig.data.map(item => item.erp_process_id).filter(id => id !== undefined);
            refObj.process.options.erp_process_id = obj.process.options.erp_process_id.filter(item => item.plantsId === refObj.process.data.plant_id && !erpProcessIds.includes(item.recId));
            refObj.process.dialogShow = true;
          },
          update: () => {
            const checkedRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工艺');
            obj.process.tableConfig.tableConfig.events.dblclick_cell({originData: checkedRows[0]});
          },
          delete: async () => {
            const checkedRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工艺');
            const result = await dialog.confirmAsync('确定要删除【' + checkedRows[0].name + '】工艺吗？<br>删除后无法恢复，建议禁用。', '请确认', {
              okval: '禁用',
              noval: '删除',
              showClose: true
            });
            const res = await api.post(apiUrl.sys.process[result ? 'processDisabled' : 'processDelete'], {id: checkedRows[0].id});
            if (res) {
              dialog.success(res);
              processTable.value.reportConfig.getData();
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
        url: apiUrl.sys.process.processList,
        showCheck: 'radio',
        events: {
          dblclick_cell: ({originData}) => {
            if (originData?.index > 0) {
              obj.process.formType = 'processUpdate';
              obj.process.dialogConfig.title = '修改工艺';
              refObj.process.data = {...refObj.process.data, ...originData};
              const erpProcessIds = processTable.value.reportConfig.data.map(item => item.erp_process_id).filter(id => id !== undefined);
              refObj.process.options.erp_process_id = obj.process.options.erp_process_id.filter(item => item.plantsId === refObj.process.data.plant_id && !erpProcessIds.includes(item.recId));
              refObj.process.options.push({value: originData.erp_process_id, label: originData.name})
              refObj.process.dialogShow = true;
            }
          },
          click_cell: ({originData}) => {
            if (originData?.index > 0 && originData.index !== processTable.value.reportConfig.prveSelectRow.index) {
              assetsTable.value.reportConfig.getData({process_id: originData.id});
              parameterTable.value.reportConfig.getData({process_id: originData.id});
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
        processForm.value.submit();
      },
      beforeOpenCallback: () => processForm.value.validate(),
      afterCloseCallback: () => refObj.process.dialogShow = false,
    },
    formConfig: {
      rules: {
        plant_id: [{required: true, message: '请选择工厂', trigger: 'change'}],
        erp_process_id: [{required: true, message: '请选择ERP工艺', trigger: 'change'}],
        code: [{required: true, message: '请输入编号', trigger: 'change'}],
        name: [{required: true, message: '请输入名称', trigger: 'change'}],
      },
      onSubmit: async ({validateResult, firstError}) => {
        if (validateResult !== true) return dialog.warning(firstError);
        const loading = dialog.loading(body.value, '保存中...');
        const res = await api.post(apiUrl.sys.process[obj.process.formType], refObj.process.data);
        loading.close();
        if (res) {
          processDialog.value.close();
          dialog.success(res);
          processTable.value.reportConfig.getData();
        }
      },
    },
    formType: 'processCreate',
    options: {},//工艺选项数据
    change: {
      plant: () => {
        refObj.process.data.unit_id = '';
        refObj.process.data.erp_process_id = '';
        refObj.process.data.code = '';
        refObj.process.data.name = '';
        const erpProcessIds = processTable.value.reportConfig.data.map(item => item.erp_process_id).filter(id => id !== undefined);
        refObj.process.options.erp_process_id = obj.process.options.erp_process_id.filter(item => item.plantsId === refObj.process.data.plant_id && !erpProcessIds.includes(item.recId) && item.ifActive === 0);
      },
      process: value => {
        const option = refObj.process.options.erp_process_id.find(item => item.value === value) || {
          label: '',
          value: ''
        };
        refObj.process.data.name = option.label;
        refObj.process.data.code = option.code;
      },
    },
  },
  assets: {
    tableConfig: {
      menuConfig: {
        defaultMenuHideList: ['search', 'update', 'submitApprove', 'resetApprove', 'approve', 'advancedExport', 'clearWhere', 'clearCache'],
        menu: {
          create: async () => {
            const checkedRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工艺');
            const assetsGroupIds = assetsTable.value.reportConfig.options.records.map(item => item.id).filter(id => id !== undefined);
            const options = obj.process.options.assetsGroup.filter(item => !assetsGroupIds.includes(item.id) && item.status === 1 && item.plant_id === checkedRows[0].plant_id);

            const result = await dialog.selectAsync(options, '', '请选择要关联的资产组', {
              width: '500px'
            }, {
              multiple: true,
              placeholder: '请输入名称过滤',
              clearable: true,
              reserveKeyword: true,
              minCollapsedNum: 10
            });
            if (result && result.length > 0) {
              const res = await api.post(apiUrl.sys.process.bindProcessAssets, {
                process_id: checkedRows[0].id,
                assetsGroupIds: result
              });
              if (res) {
                dialog.success(res);
                assetsTable.value.reportConfig.getData({process_id: checkedRows[0].id});
              }
            }
          },
          delete: async () => {
            const checkedRows = tableFn.getCheckedRecords(assetsTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工艺');
            const assetsGroupIds = checkedRows.map(item => item.id).filter(id => id !== undefined);
            const result = await dialog.confirmAsync('确定要删除' + assetsGroupIds.length + '条数据吗？');
            if (!result) return;
            const res = await api.post(apiUrl.sys.process.unBindProcessAssets, {
              process_id: processTable.value.reportConfig.selectRow.id,
              assetsGroupIds: assetsGroupIds
            });
            if (res) {
              dialog.success(res);
              assetsTable.value.reportConfig.getData({process_id: processTable.value.reportConfig.selectRow.id});
            }
          }
        },
      },
      searchConfig: false,
      tableConfig: {
        url: apiUrl.sys.asset.mainList,
        autoLoad: false,
        showCheck: 'multiple',
      },
    },
  },
  parameter: {
    tableConfig: {
      menuConfig: {
        defaultMenuHideList: ['search', 'update', 'submitApprove', 'resetApprove', 'approve', 'advancedExport', 'clearWhere', 'clearCache'],
        menu: {
          create: async () => {
            const checkedRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工艺');
            const parameterIds = parameterTable.value.reportConfig.options.records.map(item => item.id).filter(id => id !== undefined);
            const options = obj.process.options.parameters.filter(item => !parameterIds.includes(item.id) && item.status === 1);
            const result = await dialog.selectAsync(options, '', '请选择要关联的参数', {
              width: '500px'
            }, {
              multiple: true,
              placeholder: '请输入名称过滤',
              clearable: true,
              reserveKeyword: true,
              minCollapsedNum: 10
            });
            if (result && result.length > 0) {
              const res = await api.post(apiUrl.sys.process.bindProcessParameter, {
                process_id: checkedRows[0].id,
                parameterIds: result
              });
              if (res) {
                dialog.success(res);
                parameterTable.value.reportConfig.getData({process_id: checkedRows[0].id});
              }
            }
          },
          delete: async () => {
            const checkedRows = tableFn.getCheckedRecords(parameterTable.value.reportConfig);
            if (!checkedRows?.length) return dialog.info('请勾选工艺');
            const parameterIds = checkedRows.map(item => item.id).filter(id => id !== undefined);
            const result = await dialog.confirmAsync('确定要删除' + parameterIds.length + '条数据吗？');
            if (!result) return;
            const res = await api.post(apiUrl.sys.process.unBindProcessParameter, {
              process_id: processTable.value.reportConfig.selectRow.id,
              parameterIds
            });
            if (res) {
              dialog.success(res);
              parameterTable.value.reportConfig.getData({process_id: processTable.value.reportConfig.selectRow.id});
            }
          }
        },
      },
      searchConfig: false,
      tableConfig: {
        url: apiUrl.sys.parameter.list,
        autoLoad: false,
        showCheck: 'multiple',
      },
    },
  },
}


onMounted(() => {
  api.get(apiUrl.sys.process.processConfig).then(res => {
    obj.process.tableConfig.tableConfig = {...obj.process.tableConfig.tableConfig, ...res.table};
    obj.process.tableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.process.tableShow = true;
    obj.process.options = getOptionsLabel(res.option);
    obj.process.options.erp_process_id = res.option.erp_process_id;
    obj.process.options.assetsGroup = res.option.assetsGroup;
    obj.process.options.parameters = res.option.parameters;
    obj.process.options.unit_id = res.option.unit_id;
  });
  api.get(apiUrl.sys.asset.mainConfig).then(res => {
    obj.assets.tableConfig.tableConfig = {...obj.assets.tableConfig.tableConfig, ...res.table};
    obj.assets.tableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.assets.tableShow = true;
  });
  api.get(apiUrl.sys.parameter.config).then(res => {
    obj.parameter.tableConfig.tableConfig = {...obj.parameter.tableConfig.tableConfig, ...res.table};
    obj.parameter.tableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.parameter.tableShow = true;
  });
});
</script>
<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;

  > .processTable {
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