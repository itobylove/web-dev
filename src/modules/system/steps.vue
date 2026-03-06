<template>
  <div ref="box" class="steps">
    <TableComponent class="table" ref="steps" v-if="refObj.stepsShow" v-bind="obj.stepsConfig"/>
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel value="process" v-bind="obj.panelConfig" label="工艺">
        <TableComponent ref="process" v-if="refObj.processShow" v-bind="obj.processConfig"/>
      </t-tab-panel>
      <t-tab-panel v-if="false" value="user" v-bind="obj.panelConfig" label="过数员">未来扩展，待开发</t-tab-panel>
      <t-tab-panel v-if="false" value="assets" v-bind="obj.panelConfig" label="资产">未来扩展，待开发</t-tab-panel>
    </t-tabs>
    <dialogComponent v-if="dialogConfig.steps.isShow" v-bind="dialogConfig.steps.bind" v-on="dialogConfig.steps.on">
      <t-form :data="dialogConfig.steps.data" :rules="dialogConfig.steps.rules" @submit="dialogConfig.steps.submit"
              v-bind="dialogConfig.steps.form">
        <t-row>
          <t-col :span="11">
            <t-form-item label="工厂" name="plant_id">
              <t-select v-model="dialogConfig.steps.data.plant_id" :options="plantList"
                        @change="dialogConfig.steps.change('plant_id',$event)"/>
            </t-form-item>
            <t-form-item label="ERP工序" name="erp_step_id">
              <t-select filterable v-model="dialogConfig.steps.data.erp_step_id"
                        :options="dialogConfig.steps.erp_step_id" clearable
                        @change="dialogConfig.steps.change('erp_step_id',$event)"/>
            </t-form-item>
            <t-form-item label="编码" name="code">
              <t-input v-model="dialogConfig.steps.data.code"/>
            </t-form-item>
            <t-form-item label="名称" name="name">
              <t-input v-model="dialogConfig.steps.data.name"/>
            </t-form-item>
            <t-form-item label="排序" name="sort">
              <t-input-number v-model="dialogConfig.steps.data.sort" theme="column" style="width: 100%" type="integer"
                              min="0"
                              step="1" max="9999" placeholder="数字小靠前"/>
            </t-form-item>
            <t-form-item label="状态" name="status">
              <t-select v-model="dialogConfig.steps.data.status" :options="dialogConfig.steps.options.status"/>
            </t-form-item>
            <t-form-item label="备注" name="remark">
              <t-input v-model="dialogConfig.steps.data.remark"/>
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" type="submit">保存</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </dialogComponent>
    <dialogComponent v-if="dialogConfig.process.isShow" v-bind="dialogConfig.process.bind"
                     v-on="dialogConfig.process.on">
      <div style="height:60vh;">
        <TableComponent ref="processBindView" v-bind="obj.processBindConfig"></TableComponent>
      </div>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import {plantList} from "@/utils/erp.js";
import DialogComponent from "@/core/component/dialog.vue";
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel} from "@/utils/vars.js";
import {post} from "@/core/script/api";
import ResizeBox from "@/core/component/ResizeBox.vue";

const box = ref();
const steps = ref();
const process = ref();
const checkRowsData = ref();
const processBindView = ref();

const refObj = reactive({
  stepsShow: false,
  processShow: false,
  tab: 'process',
  plant_id: 0,
  step_id: 0
});

const obj = {
  tabsConfig: {
    theme: 'card',
    defaultValue: 'process',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  stepsConfig: {
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          sort: 152, title: '添加', icon: 'ri-add-circle-line', click: () => {
            dialogConfig.steps.bind.title = '新增工序';
            dialogConfig.steps.type = 'add';
            dialogConfig.steps.data = {status: 1, plant_id: steps.value.search.search.searchList[0].value};
            dialogConfig.steps.erp_step_id = dialogConfig.steps.options.erp_step_id.filter(item => item.plantsId === dialogConfig.steps.data.plant_id);
            dialogConfig.steps.data.sort = 100;
            dialogConfig.steps.isShow = true;
          }
        },
        delete: {
          sort: 153, title: '删除', icon: 'ri-indeterminate-circle-line', click: async () => {
            const checkedRows = tableFn.getCheckedRecords(steps.value.reportConfig);
            if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
            const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
            if (!result) return;
            await api.post(apiUrl.sys.step.del, {ids: checkedRows.map(item => item.id)}).then(
                res => {
                  if (res) {
                    dialog.success('删除成功');
                    steps.value.reportConfig.getData();
                  }
                }
            );
          }
        },
      },
    },
    searchConfig: {
      search: [{
        type: 'select', field: 'plant_id', style: {width: '100px'}, value: siyi.user.plantId, load: 'factory',
        options: {multiple: false, clearable: false},
        onChange: val => steps.value.reportConfig.getData({where: {plant_id: val}}),
      }],
    },
    tableConfig: {
      url: apiUrl.sys.steps.list,
      showCheck: 'radio',
      disablePage: true,
      events: {
        dblclick_cell: ({originData, field}) => {
          if (!field) return;
          dialogConfig.steps.bind.title = '修改工序';
          dialogConfig.steps.type = 'edit';
          dialogConfig.steps.data = originData;
          dialogConfig.steps.erp_step_id = dialogConfig.steps.options.erp_step_id.filter(item => item.plantsId === originData.plant_id);
          dialogConfig.steps.isShow = true;
        },
        click_cell: ({originData, field}) => {
          if (originData?.index > 0 && originData.index !== steps.value.reportConfig.prveSelectRow.index) {
            refObj.plant_id = originData.plant_id;
            refObj.step_id = originData.id;
            process.value.reportConfig.getData({exec: null, step_id: originData.id});
          }
        }
      },
    },
  },
  processConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'moreSettings'],
      menu: {
        create: {
          sort: 152, title: '添加', icon: 'ri-add-circle-line', click: () => {
            const checkedRows = tableFn.getCheckedRecords(steps.value.reportConfig);
            if (checkedRows?.length < 1) return dialog.warning('请勾选需要操作的工序!');
            checkRowsData.value = checkedRows[0];
            checkRowsData.value.ids = [];
            process.value.reportConfig.data.map(item => {
              checkRowsData.value.ids.push(item.id);
            });
            obj.processBindConfig.query = {
              plant_id: checkRowsData.value.plant_id,
              step_id: checkRowsData.value.id,
              ids: checkRowsData.value.ids
            };
            dialogConfig.process.isShow = true;
          }
        },
        delete: {
          sort: 153, title: '删除', icon: 'ri-indeterminate-circle-line', click: async () => {
            let rowData = tableFn.getCheckedRecords(process.value.reportConfig, 'sp_id');
            let ids = rowData.map(item => item.sp_id);
            if (ids.length < 1) return dialog.warning('请勾选需要删除的工艺！');
            const result = await dialog.confirmAsync('确定要删除' + ids.length + '条数据吗？');
            console.log(process.value.reportConfig.data);
            if (!result) return;
            await api.post(
                apiUrl.sys.steps.unbindProcess,
                {
                  plant_id: refObj.plant_id,
                  step_id: refObj.step_id,
                  ids: ids
                }
            ).then(
                res => {
                  if (res) {
                    dialog.success('删除成功');
                    process.value.reportConfig.getData({exec: null, step_id: refObj.plant_id});
                  }
                }
            );
          }
        },
      },
    },
    tableConfig: {
      url: apiUrl.sys.steps.processList,
      showCheck: 'multiple',
      disablePage: true,
      events: {
        dblclick_cell: ({originData, field}) => {

        },
        click_cell: ({originData, field}) => {

        }
      }
    },
  },
  processBindConfig: {
    menuConfig: {
      defaultMenuShowList: ['search'],
      menu: {
        save: {
          sort: 650, title: '保存', icon: 'ri-save-line', click: async () => {
            let now_check = tableFn.getCheckedRecords(processBindView.value.reportConfig, 'id');
            let old_check = [...obj.processBindConfig.query.ids]
            let ids = [];
            now_check.forEach(item => {
              if (!old_check.includes(item.id)) {
                ids.push(item.id);
              }
            });
            if (ids.length < 1) {
              dialog.warning('请正确勾选需要添加的工艺！');
              return;
            }
            const load = dialog.loading(undefined, '数据保存中，请稍等···');
            const res = await api.post( // 数据原型: data:{code: 20000, message: "成功", data: true}   这里实际的res = data.data
                apiUrl.sys.steps.bindProcessToStep,  // url
                {
                  plant_id: checkRowsData.value.plant_id,
                  step_id: checkRowsData.value.id,
                  ids: ids
                }, // 参数
            );
            load.close();
            if (res) {
              dialog.success('保存成功!');
              dialogConfig.process.isShow = false;
              process.value.reportConfig.getData({exec: null, step_id: checkRowsData.value.id});
            }
          }
        },
      }
    },
    searchConfig: false,
    query: {},
    tableConfig: {
      url: apiUrl.sys.steps.processListAll,
      showCheck: true,
      disablePage: true,
      options: {rowSeriesNumber: false},
      columns: tableFn.createColumns(["name#工艺名称", "id#工艺ID#F", "erp_process_id#ERP_ID", "status_text#状态#F"]),
      events: {
        dblclick_cell: ({originData, field}) => {

        },
        click_cell: ({originData, field}) => {

        }
      }
    }
  }
}

const dialogConfig = reactive({
  steps: {
    isShow: false,
    erp_step_id: [],
    options: {erp_step_id: [], status: []},
    data: {},
    type: '',
    rules: {
      plant_id: [{required: true, message: '请选择工厂', trigger: 'change'}],
      code: [{required: true, message: '请输入工序编码', trigger: 'change'}],
      name: [{required: true, message: '请输入工序名称', trigger: 'change'}],
      erp_step_id: [{required: true, message: '请选择ERP工序', trigger: 'change'}]
    },
    bind: {
      width: '450px',
      height: 'auto',
      changeSize: false,
      forceEnlarge: false
    },
    form: {
      style: {
        padding: '20px 10px',
      },
    },
    change: async (key, value) => {
      if (key === 'erp_step_id') {
        const option = dialogConfig.steps.options.erp_step_id.find(item => item.value === value) || {
          label: '',
          value: ''
        };
        dialogConfig.steps.data.name = option.label;
        dialogConfig.steps.data.code = option?.code || '';
      } else if (key === 'plant_id') {
        dialogConfig.steps.erp_step_id = dialogConfig.steps.options.erp_step_id.filter(item => item.plantsId === value);
        dialogConfig.steps.data.erp_step_id = '';
        dialogConfig.steps.data.name = '';
        dialogConfig.steps.data.code = '';
      }
    },
    submit: async ({validateResult, firstError}) => {
      if (validateResult !== true) return dialog.warning(firstError);
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.sys.step[dialogConfig.steps.type], dialogConfig.steps.data);
      loading && loading.close();
      if (res) {
        dialog.success('保存成功');
        dialogConfig.steps.close();
        await steps.value.reportConfig.getData();
      }
    },
    close: () => {
      dialogConfig.steps.isShow = false;
    },
    on: {
      afterClose: () => {
        dialogConfig.steps.close();
      }
    }
  },
  process: {
    isShow: false,
    bind: {
      title: '添加工艺',
      width: '700px',
      height: 'auto',
      changeSize: false,
      forceEnlarge: false
    },
    form: {
      style: {
        padding: '20px 10px',
      },
    },
    close: () => {
      dialogConfig.process.isShow = false;
    },
    on: {
      afterClose: () => {
        dialogConfig.process.close();
      }
    }
  }
});
onMounted(() => {
  api.get(apiUrl.sys.steps.config).then(res => {
    obj.stepsConfig.tableConfig = {...obj.stepsConfig.tableConfig, ...res.table};
    obj.stepsConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    dialogConfig.steps.options = getOptionsLabel(res.option);
    dialogConfig.steps.options.erp_step_id = res.option.erp_step_id;
    refObj.stepsShow = true;
  });
  api.get(apiUrl.sys.steps.processConfig).then(res => {
    obj.processConfig.tableConfig = {...obj.processConfig.tableConfig, ...res.table};
    obj.processConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.processShow = true;
  });
});
</script>
<style scoped>
.steps {
  display: flex;
  flex-direction: column;

  > .table {
    height: 40%;
    flex-shrink: 0;
  }

  .t-tabs {
    flex: 1;
    flex-shrink: 0;
    border-radius: 5px;
    border: 1px solid #ccc;
    margin: 0 2px 2px 2px;
  }
}
</style>