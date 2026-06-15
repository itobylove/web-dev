<template>
  <div ref="body" class="body">
    <TableComponent class="processTable" ref="processTable" v-if="refObj.process.tableShow"
                    v-bind="obj.process.tableConfig"/>
    <t-tabs class="tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel class="tabsPanel" value="process" v-bind="obj.panelConfig" label="资产">
        <TableComponent ref="assetTable" v-if="refObj.assets.tableShow" v-bind="obj.asset.tableConfig"/>
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
          <t-select v-model="refObj.process.data.erp_process_id" :options="refObj.process.options"
                    @change="obj.process.change.process" filterable clearable/>
        </t-form-item>
        <t-form-item label="编号" name="code">
          <t-input v-model="refObj.process.data.code"/>
        </t-form-item>
        <t-form-item label="名称" name="name">
          <t-input v-model="refObj.process.data.name"/>
        </t-form-item>
        <t-form-item label="单位" name="unit_id">
          <t-select filterable v-model="refObj.process.data.unit_id" :options="obj.process.options.unit"/>
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
    <dialogComponent ref="assetDialog" v-if="refObj.assetBind.dialogShow" v-bind="obj.assetBind.dialogConfig">
      <TableComponent class="assetBindTable" ref="assetBindTable" v-if="refObj.assetBind.tableShow"
                      v-bind="obj.assetBind.tableConfig"></TableComponent>
    </dialogComponent>
    <dialogComponent v-if="refObj.assetEdit.dialogShow" v-bind="obj.assetEdit.dialogConfig">
      <t-form class="form" :data="refObj.assetEdit.data">
        <t-form-item label="名称" name="status" v-if="refObj.assetEdit.count">
          <t-input readonly v-model="refObj.assetEdit.data.name"/>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="refObj.assetEdit.data.status" :options="obj.asset.options.status"/>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea style="height:160px" placeholder="请输入备注内容" v-model="refObj.assetEdit.data.remark"/>
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
import {AutoFillPlugin} from "@visactor/vtable-plugins";

const body = ref();//容器DOM
const processTable = ref();//工艺表DOM
const processDialog = ref();//工艺添加修改窗口DOM
const processForm = ref();//工艺添加修改表单DOM
const assetTable = ref();//资产表DOM
const assetDialog = ref();
const assetBindTable = ref();
const parameterTable = ref();


const refObj = reactive({
  tab: 'process',
  currentProcess:{id:null},
  process: {tableShow: false, dialogShow: false, options: {}, data: {}},
  assets: {tableShow: false, dialogShow: false, options: {}, data: {}},
  parameter: {tableShow: false, dialogShow: false, options: {}, data: {}},
  assetBind: {tableShow: false, dialogShow: false, options: {}, data: {}},
  assetEdit: {tableShow: false, dialogShow: false, options: {}, data: {}, count: false}
});

const obj = {
  tabsConfig: {theme: 'card', defaultValue: 'process', onChange: val => refObj.tab = val},
  panelConfig: {destroyOnHide: false},
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
              erp_step_id: null,
              code: '',
              name: '',
              unit_id: null,
              sort: 100,
              status: 1,
              remark: ''
            };
            refObj.process.data.plant_id = processTable.value.search.search.searchList[0].value[0];
            const erp_process_Ids = processTable.value.reportConfig.data.map(item => item.erp_process_id).filter(id => id !== undefined);
            refObj.process.options = obj.process.options.erp_process.filter(item => item.plantsId === refObj.process.data.plant_id && !erp_process_Ids.includes(item.recId));
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
              const erp_process_Ids = processTable.value.reportConfig.data.map(item => item.erp_process_id).filter(id => id !== undefined);
              refObj.process.options = obj.process.options.erp_process.filter(item => item.plantsId === refObj.process.data.plant_id && !erp_process_Ids.includes(item.recId));
              refObj.process.options.push({value: originData.erp_process_id, label: originData.name})
              refObj.process.dialogShow = true;
            }
          },
          click_cell: ({originData}) => {
            if (originData?.index > 0 && originData.index !== processTable.value.reportConfig.prveSelectRow.index) {
              refObj.currentProcess={...originData};
              assetTable.value.reportConfig.getData({id: originData.id});
              parameterTable.value.reportConfig.getData({id: originData.id});
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
        refObj.process.data.erp_process_id = '';
        refObj.process.data.name = '';
        refObj.process.data.code = '';
        const erp_process_Ids = processTable.value.reportConfig.data.map(item => item.erp_process_id).filter(id => id !== undefined);
        refObj.process.options = obj.process.options.erp_process.filter(item => item.plantsId === refObj.process.data.plant_id && !erp_process_Ids.includes(item.recId));
      },
      process: value => {
        const option = refObj.process.options.find(item => item.value === value) || {name: '', code: ''};
        refObj.process.data.name = option.name;
        refObj.process.data.code = option.code;
      }
    },
  },
  asset: {
    dialogConfig: {
      width: 450,
      changeSize: false,
      showFooter: true,
      showClose: false,
      okval: '保存',
      noval: '关闭',
      okCallback: obj => {
        // obj.close = false;
        // processForm.value.submit();
      },
      // beforeOpenCallback: () => processForm.value.validate(), // 点开添加按钮时验证数据
      afterCloseCallback: () => refObj.assets.dialogShow = false, // 弹窗关闭动画
    },
    options: {},
    tableConfig: {
      menuConfig: {
        defaultMenuHideList: ['search', 'update', 'submitApprove', 'resetApprove', 'approve', 'advancedExport', 'clearWhere', 'clearCache'],
        menu: {
          create: async () => {
            obj.assetBind.dialogConfig.title = '绑定资产';
            const processCheckedRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!processCheckedRows?.length) return dialog.info('请勾选工艺');
            refObj.assetBind.dialogShow = true;
            obj.assetBind.tableConfig.query = {
              plant_id: processCheckedRows[0].plant_id,
              step_id: processCheckedRows[0].step_id,
              process_id: processCheckedRows[0].id,
              group: [], // 用于将资产数据区分为组和资产,方便后端遍历
              asset: [] // 用于将资产数据区分为组和资产,方便后端遍历
            };
            assetTable.value.reportConfig.data.map(item => {
              if (item.type === 'group') {
                obj.assetBind.tableConfig.query.group.push(item.id);
              } else {
                obj.assetBind.tableConfig.query.asset.push(item.id);
              }
            });
            refObj.assetBind.tableShow = true;
          },
          update: async () => {
            const assetCheckedRows = tableFn.getCheckedRecords(assetTable.value.reportConfig); // 检测资产是否有选中的
            if (!assetCheckedRows?.length) return dialog.info('请勾选需要删除的资产');
            refObj.assetEdit.data = assetCheckedRows[0];
            refObj.assetEdit.data.ids = assetCheckedRows.map(item => item.process_assets_id);
            if (assetCheckedRows.length > 1) { // 如果是批量的,不显示名称并且弹窗标题显示批量,无其它作用
              obj.assetEdit.dialogConfig.title = '批量修改资产';
              refObj.assetEdit.count = false;
            } else {
              obj.assetEdit.dialogConfig.title = '修改资产';
              refObj.assetEdit.data.name = assetCheckedRows[0].name;
              refObj.assetEdit.count = true;
            }
            refObj.assetEdit.dialogShow = true;
          },
          delete: async () => {
            const processCheckedRows = tableFn.getCheckedRecords(processTable.value.reportConfig); // 检测工艺是否有选中的
            if (!processCheckedRows?.length) return dialog.info('请勾选工艺');
            const assetCheckedRows = tableFn.getCheckedRecords(assetTable.value.reportConfig); // 检测资产是否有选中的
            if (!assetCheckedRows?.length) return dialog.info('请勾选需要删除的资产');
            const asset_ids = assetCheckedRows.map(item => item.process_assets_id);
            const result = await dialog.confirmAsync('确定要删除' + asset_ids.length + '条数据吗？');
            if (!result) return;
            const load = dialog.loading(undefined, '正在删除数据，请稍等···');
            const res = await api.post(apiUrl.sys.process.unBindAssets, {
              process_id: processCheckedRows[0].id,
              ids: asset_ids
            });
            load.close();
            if (res) {
              dialog.success('删除成功!');
              refObj.assetBind.dialogShow = false;
              assetTable.value.reportConfig.getData({id: processCheckedRows[0].id});
            } else {
              dialog.error(res.message);
            }
          }
        },
      },
      searchConfig: false,
      tableConfig: {
        url: apiUrl.sys.process.assetsList,
        autoLoad: false,
        showCheck: 'multiple',
        events: {
          dblclick_cell: ({originData}) => {
            if (originData?.index > 0) {
              obj.assetEdit.dialogConfig.title = '修改资产';
              refObj.assetEdit.data = originData;
              refObj.assetEdit.data.ids = [originData.process_assets_id];
              refObj.assetEdit.data.name = originData.name;
              refObj.assetEdit.count = true;
              refObj.assetEdit.dialogShow = true;
            }
          }
        },
      },
    },
  },
  assetBind: {
    dialogConfig: {
      width: 724,
      height: 700,
      offset: 2,
      changeSize: false,
      showFooter: true,
      showClose: false,
      okval: '保存',
      noval: '关闭',
      okCallback: async obj => {
        // obj.close = false;
        let processCheckedRows = tableFn.getCheckedRecords(processTable.value.reportConfig); // 检测工艺是否有选中的
        if (!processCheckedRows?.length) return dialog.info('请勾选工艺');
        let checkedRows = tableFn.getCheckedRecords(assetBindTable.value.reportConfig);
        if (checkedRows.length < 1) {
          dialog.warning('请勾选需要添加的资产！');
          return;
        }
        let query = {
          plant_id: processCheckedRows[0].plant_id,
          step_id: processCheckedRows[0].step_id,
          process_id: processCheckedRows[0].id,
          group: [],
          asset: []
        };
        checkedRows.map(item => {
          if (item.type === 'group') {
            query.group.push(item.id);
          } else {
            query.asset.push(item.id);
          }
        });
        const load = dialog.loading(undefined, '数据保存中，请稍等···');
        const res = await api.post(apiUrl.sys.process.bindAssets, query);
        load.close();
        if (res) {
          dialog.success('保存成功!');
          refObj.assetBind.dialogShow = false;
          assetTable.value.reportConfig.getData({id: query.process_id});
        }
      },
      afterCloseCallback: () => refObj.assetBind.dialogShow = false, // 弹窗关闭动画
    },
    tableConfig: {
      menuConfig: false,
      // searchConfig: false,
      query: {},
      tableConfig: {
        url: apiUrl.sys.process.mainList,
        showCheck: 'multiple',
        disablePage: true,
        options: {rowSeriesNumber: false},
        columns: tableFn.createColumns(["code#编号", "name#资产名称", "type_text#类型", "id#资产ID#H"]),
        events: {
          dblclick_cell: () => {

          },
        }
      }
    },
  },
  assetEdit: {
    dialogConfig: {
      width: 450,
      changeSize: false,
      showFooter: true,
      showClose: false,
      okval: '保存',
      noval: '关闭',
      okCallback: async () => {
        const load = dialog.loading(undefined, '数据修改中，请稍等···');
        const params = {
          ids: refObj.assetEdit.data.ids,
          process_id: refObj.assetEdit.data.process_id,
          status: refObj.assetEdit.data.status,
          remark: refObj.assetEdit.data.remark
        };
        const res = await api.post(apiUrl.sys.process.updateAssets, params);
        load.close();
        if (res) {
          dialog.success('修改成功!');
          refObj.assetEdit.dialogShow = false;
          assetTable.value.reportConfig.getData({id: refObj.assetEdit.data.process_id});
        }
      },
      afterCloseCallback: () => refObj.assetEdit.dialogShow = false, // 弹窗关闭动画
    }
  },
  parameter: {
    editorFields:['link_sort','remark','default_value','sort','code','name'],
    dialogConfig: {
      width: 450,
      changeSize: false,
      showFooter: true,
      showClose: false,
      okval: '保存',
      noval: '关闭',
      okCallback: obj => {
        // obj.close = false;
        // processForm.value.submit();
      },
      // beforeOpenCallback: () => processForm.value.validate(), // 点开添加按钮时验证数据
      // afterCloseCallback: () => refObj.assets.dialogShow = false, // 弹窗关闭动画
    },
    options: {},
    tableConfig: {
      menuConfig: {
        defaultMenuHideList: ['update', 'submitApprove', 'resetApprove', 'approve', 'advancedExport', 'clearWhere', 'clearCache'],
        menu: {
          create: async () => {
            const processRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!processRows?.length) return dialog.info('请勾选工艺');
            const process_id = processRows[0].id;
            const exist_ids = parameterTable.value.reportConfig.table.options.records.map(v => v.id).filter(id => id !== undefined);
            const ids = await dialog.selectAsync(obj.parameter.options.parameters.filter(v => !exist_ids.includes(v.value)), [], '请选择', {width: '600px'}, {
              multiple: true, placeholder: '请输入名称过滤', clearable: true, reserveKeyword: true, minCollapsedNum: 10,
            });
            if (!ids || !ids.length) return;
            const res = await api.post(apiUrl.sys.process.parameterAdd, {ids, process_id, exist_ids});
            if (res) {
              dialog.success('添加成功');
              await parameterTable.value.reportConfig.getData({id: process_id});
            }
          },
          delete: async () => {
            const processRows = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (!processRows?.length) return dialog.info('请勾选工艺');
            const process_id = processRows[0].id;
            const parameterRows = tableFn.getCheckedRecords(parameterTable.value.reportConfig);
            const ids = parameterRows.map(item => item.link_id);
            const result = await dialog.confirmAsync('确定要删除' + ids.length + '条数据吗？');
            if (!result) return;
            const loading = dialog.loading(undefined, '删除中...');
            const res = await api.post(apiUrl.sys.process.parameterDel, {id: ids});
            loading && loading.close();
            if (res) {
              dialog.success('删除成功');
              await parameterTable.value.reportConfig.getData({id: process_id});
            }
          }
        },
      },
      searchConfig: false,
      tableConfig: {
        url: apiUrl.sys.process.parameterList,
        getQuery:()=>{
          return {id: refObj.currentProcess.id}
        },
        showCheck: 'multiple',
        checkField: 'check',
        disablePage: true,
        options: {
          enableLineBreak: true, // 自动解析换行符
          editCellTrigger:'doubleclick', // 单元格双击触发编辑
          select: {
            outsideClickDeselect: false,//点击外部区域是否取消选中。
          },
          excelOptions: {
            fillHandle: true // 启用填充炳功能
          },
          plugins: [new AutoFillPlugin()] // 下拉填充
        },
        colAfterCallback: (col) => {
          if (obj.parameter.editorFields.includes(col.field)) {
            col.editor = 'inputEditor';
          }
          return col;
        },
        events:{
          change_cell_value: async ({row, col, changedValue, currentValue,rawValue}) => {
            console.log('change_cell_value', row, col, changedValue, currentValue,rawValue)
            if (changedValue===rawValue){
              return ;
            }
            const vTable=parameterTable.value.reportConfig.table; // 表格实例
            const field = vTable.getHeaderField(col, row); //获取列名
            const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
            if (!record?.id || !obj.parameter.editorFields.includes(field)) {
              vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
              return;
            }
            if (field==='link_sort' && typeof changedValue!=='number'){
              dialog.warning('请输入正整数!');
              vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
              return ;
            }
            const isLinkEditor = !['sort','code','name'].includes(field); // 是否是修改关联表,仅仅这些修改参数表，其他都修改关联表
            const url = isLinkEditor ? apiUrl.sys.process.parameterSet : apiUrl.sys.parameter.set;
            const post = isLinkEditor ? {id: record['link_id'], field, value: changedValue} : {id: record['id'], data: {[field]: changedValue}};
            const res = await api.post(url, post);
            if (!res) {
              vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
            }
          },
        },
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
    obj.process.options.erp_process = res.option.erp_process;
    obj.process.options.process = res.option.process;
    obj.process.options.unit = res.option.unit;
  });
  api.get(apiUrl.sys.asset.assetsConfig).then(res => {
    obj.asset.tableConfig.tableConfig = {...obj.asset.tableConfig.tableConfig, ...res.table};
    obj.asset.tableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.asset.options = getOptionsLabel(res.option);
    refObj.assets.tableShow = true;
  });
  api.get(apiUrl.sys.process.parameterConfig).then(res => {
    obj.parameter.tableConfig.tableConfig = {...obj.parameter.tableConfig.tableConfig, ...res.table};
    obj.parameter.tableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.parameter.options = getOptionsLabel(res.option);
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

  .assetBindTable {
    padding: 2px;
  }
}
</style>