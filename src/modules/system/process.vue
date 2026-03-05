<template>
  <div ref="box" class="process">
    <resize-box mode='vertical' :size="500" :storage-key="siyi.nav?.id">
      <TableComponent class="table" ref="process" v-if="refObj.processShow" v-bind="obj.processConfig"/>
    </resize-box>
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel value="assets" v-bind="obj.panelConfig" label="资产">
        <TableComponent ref="assets" v-if="refObj.assetsShow" v-bind="obj.assetsConfig"/>
      </t-tab-panel>
      <t-tab-panel v-if="false" value="user" v-bind="obj.panelConfig" label="人员">未来扩展，待开发</t-tab-panel>
    </t-tabs>
    <dialogComponent v-if="dialogConfig.process.isShow" v-bind="dialogConfig.process.bind"
                     v-on="dialogConfig.process.on">
      <t-form :data="dialogConfig.process.data" :rules="dialogConfig.process.rules"
              @submit="dialogConfig.process.submit"
              v-bind="dialogConfig.process.form">
        <t-row>
          <t-col :span="11">
            <t-form-item label="工厂" name="plant_id">
              <t-select v-model="dialogConfig.process.data.plant_id" :options="plantList"
                        @change="dialogConfig.process.change('plant_id',$event)"/>
            </t-form-item>
            <t-form-item label="erp工艺" name="erp_process_id">
              <t-select filterable v-model="dialogConfig.process.data.erp_process_id"
                        :options="dialogConfig.process.erp_process_id" clearable
                        @change="dialogConfig.process.change('erp_process_id',$event)"/>
            </t-form-item>
            <t-form-item label="编码" name="code">
              <t-input v-model="dialogConfig.process.data.code"/>
            </t-form-item>
            <t-form-item label="名称" name="name">
              <t-input v-model="dialogConfig.process.data.name"/>
            </t-form-item>
            <t-form-item label="工序" name="step_ids">
              <t-select filterable multiple v-model="dialogConfig.process.data.step_ids"
                        :options="dialogConfig.process.step_id"/>
            </t-form-item>
            <t-form-item label="单位" name="unit_id">
              <t-select filterable v-model="dialogConfig.process.data.unit_id"
                        :options="dialogConfig.process.options.unit_id"/>
            </t-form-item>
            <t-form-item label="排序" name="sort">
              <t-input-number v-model="dialogConfig.process.data.sort" theme="column" style="width: 100%" type="integer"
                              min="0"
                              step="1" max="9999" placeholder="数字小靠前"/>
            </t-form-item>
            <t-form-item label="状态" name="status">
              <t-select v-model="dialogConfig.process.data.status" :options="dialogConfig.process.options.status"/>
            </t-form-item>
            <t-form-item label="备注" name="remark">
              <t-input v-model="dialogConfig.process.data.remark"/>
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" type="submit">保存</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </dialogComponent>
    <dialogComponent v-if="dialogConfig.assets.isShow" v-bind="dialogConfig.assets.bind"
                     v-on="dialogConfig.assets.on">
      <div style="height:60vh;">
        <TableComponent ref="assetsBindView" v-bind="obj.assetsBindConfig"></TableComponent>
      </div>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import apiUrl from '@/core/config/url2';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import {plantList} from "@/utils/erp.js";
import DialogComponent from "@/core/component/dialog.vue";
import {getOptionsLabel} from "@/utils/vars.js";
import ResizeBox from "@/core/component/ResizeBox.vue";

const box = ref();
const process = ref();
const assets = ref();
const checkRowsData = ref();
const assetsBindView = ref();

const refObj = reactive({
  processShow: false,
  assetsShow: false,
  tab: 'assets',
});

const obj = {
  tabsConfig: {
    theme: 'card',
    defaultValue: 'assets',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  processConfig: {
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          sort: 152, title: '添加', icon: 'ri-add-line', click: async () => {
            console.log('添加工艺');
            dialogConfig.process.bind.title = '新增工艺';
            dialogConfig.process.type = 'add';
            dialogConfig.process.data = {step_ids: []}; // 防止选中了工艺时新增产生的缓存数据
            dialogConfig.process.data.plant_id = process.value.search.search.searchList[0].value;
            dialogConfig.process.data.status = 1;
            dialogConfig.process.data.sort = 100;
            dialogConfig.process.step_id = dialogConfig.process.options.step_id.filter(item => item.plant_id === dialogConfig.process.data.plant_id);
            dialogConfig.process.erp_process_id = dialogConfig.process.options.erp_process_id.filter(item => item.plantsId === dialogConfig.process.data.plant_id);
            dialogConfig.process.isShow = true;
          }
        },
        delete: {
          sort: 153, title: '删除', icon: 'ri-add-line', click: async () => {
            const checkedRows = tableFn.getCheckedRecords(process.value.reportConfig);
            if (checkedRows?.length < 1) return dialog.warning('请勾选需要删除的工艺！');
            const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
            if (!result) return;
            await api.post(apiUrl.sys.process.del, {ids: checkedRows.map(item => item.id)}).then(
                res => {
                  if (res) {
                    dialog.success('删除成功');
                    process.value.reportConfig.getData();
                  }
                }
            );
          }
        }
      },
    },
    searchConfig: {
      search: [{
        type: 'select', field: 'plant_id', style: {width: '100px'}, value: siyi.user.plantId, load: 'factory',
        options: {multiple: false, clearable: false},
        onChange: val => process.value.reportConfig.getData({where: {plant_id: val}}),
      }],
    },
    tableConfig: {
      url: apiUrl.sys.process.list,
      showCheck: 'radio',
      disablePage: true,
      events: {
        dblclick_cell: ({originData, field}) => {
          if (!field) return;
          dialogConfig.process.bind.title = '修改工序';
          dialogConfig.process.type = 'edit';
          dialogConfig.process.data = originData;
          dialogConfig.process.step_id = dialogConfig.process.options.step_id.filter(item => item.plant_id === dialogConfig.process.data.plant_id);
          dialogConfig.process.erp_process_id = dialogConfig.process.options.erp_process_id.filter(item => item.plantsId === dialogConfig.process.data.plant_id);
          dialogConfig.process.isShow = true;
        },
        click_cell: ({originData, field}) => {
          if (originData?.index > 0 && originData.index !== process.value.reportConfig.prveSelectRow.index) {
            dialogConfig.process.data = originData;
            assets.value.reportConfig.getData({exec: null, id: originData.id});
          }
        }
      },
    },
  },
  assetsConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'moreSettings'],
      menu: {
        create: {
          sort: 152, title: '添加', icon: 'ri-add-circle-line', click: () => {
            const checkedRows = tableFn.getCheckedRecords(process.value.reportConfig);
            if (checkedRows?.length < 1) return dialog.warning('请勾选需要操作的工艺!');
            checkRowsData.value = checkedRows[0];
            // console.log(checkRowsData.value); // 操作的工艺ID
            let assets_data = {group: [], asset: []}; // 用于将资产数据区分为组和资产,方便后端遍历
            assets.value.reportConfig.data.map(item => {
              if (item.type === 'group') {
                assets_data.group.push(item.id);
              } else {
                assets_data.asset.push(item.id);
              }
            });
            obj.assetsBindConfig.query = {
              plant_id: checkRowsData.value.plant_id,
              step_id: checkRowsData.value.step_id,
              id: checkRowsData.value.id,
              group: assets_data.group,
              asset: assets_data.asset
            };
            dialogConfig.assets.isShow = true;
          }
        },
        delete: {
          sort: 153, title: '删除', icon: 'ri-indeterminate-circle-line', click: async () => {
            let rowData = tableFn.getCheckedRecords(assets.value.reportConfig);
            if (rowData.length < 1) return dialog.warning('请勾选需要删除的资产！');
            const result = await dialog.confirmAsync('确定要删除' + rowData.length + '条数据吗？');
            if (!result) return;
            let query = {
              plant_id: dialogConfig.process.data.plant_id,
              step_id: dialogConfig.process.data.step_id,
              process_id: dialogConfig.process.data.id,
              ids: rowData.map(item => item.process_assets_id)
            }
            await api.post(
                apiUrl.sys.process.delAssets,
                query
            ).then(
                res => {
                  if (res) {
                    dialog.success('删除成功');
                    assets.value.reportConfig.getData({exec: null, id: dialogConfig.process.data.id});
                  }
                }
            );
          }
        },
      },
    },
    tableConfig: {
      url: apiUrl.sys.process.assetsList,
      showCheck: 'multiple',
      disablePage: true,
      events: {
        dblclick_cell: ({originData, field}) => {

        },
        click_cell: ({originData, field}) => {
          if (originData?.index > 0 && originData.index !== process.value.reportConfig.prveSelectRow.index) {

          }
        }
      },
    },
  },
  assetsBindConfig: {
    menuConfig: {
      defaultMenuShowList: ['search'],
      menu: {
        save: {
          sort: 650, title: '保存', icon: 'ri-save-line', click: async () => {
            let now_check = tableFn.getCheckedRecords(assetsBindView.value.reportConfig);
            // console.log(now_check);
            // console.log(dialogConfig.process.data);
            if (now_check.length < 1) {
              dialog.warning('请勾选需要添加的资产！');
              return;
            }
            let query = {
              plant_id: dialogConfig.process.data.plant_id,
              step_id: dialogConfig.process.data.step_id,
              process_id: dialogConfig.process.data.id,
              group: [],
              asset: []
            };
            now_check.map(item => {
              if (item.type === 'group') {
                query.group.push(item.id);
              } else {
                query.asset.push(item.id);
              }
            });
            const load = dialog.loading(undefined, '数据保存中，请稍等···');
            const res = await api.post(
                apiUrl.sys.process.addAssets,  // url
                query, // 参数
            );
            load.close();
            if (res) {
              dialog.success('保存成功!');
              dialogConfig.assets.isShow = false;
              assets.value.reportConfig.getData({exec: null, id: query.process_id});
            }
          }
        },
      }
    },
    searchConfig: {},
    query: {},
    tableConfig: {
      url: apiUrl.sys.process.mainList,
      showCheck: true,
      disablePage: true,
      options: {rowSeriesNumber: false},
      columns: tableFn.createColumns(["code#编号", "name#资产名称", "id#资产ID#F", "status_text#状态#F"]),
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
  process: {
    isShow: false,
    step_id: [],
    erp_process_id: [],
    options: {unit_id: [], erp_process_id: [], erp_step_id: [], status: []},
    data: {},
    type: '',
    rules: {
      code: [{required: true, message: '请输入工艺编码', trigger: 'change'},],
      name: [{required: true, message: '请输入工艺名称', trigger: 'change'},],
      step_ids: [{required: true, message: '请选择工序', trigger: 'change'},],
      erp_process_id: [{required: true, message: '请选择ERP工艺', trigger: 'change'},],
      status: [{required: true, message: '请选择状态', trigger: 'change'},],
    },
    bind: {
      width: '580px',
      height: '700px',
      changeSize: false,
      forceEnlarge: false
    },
    form: {
      style: {
        padding: '20px 10px',
      },
    },
    change: async (key, value) => {
      if (key === 'erp_process_id') {
        const option = dialogConfig.process.options.erp_process_id.find(item => item.value === value) || {
          label: '',
          value: ''
        };
        dialogConfig.process.data.name = option.label;
        dialogConfig.process.data.code = option?.code || '';
      } else if (key === 'plant_id') {
        dialogConfig.process.step_id = dialogConfig.process.options.step_id.filter(item => item.plant_id === value);
        dialogConfig.process.erp_process_id = dialogConfig.process.options.erp_process_id.filter(item => item.plantsId === value);
        dialogConfig.process.data.erp_process_id = '';
        dialogConfig.process.data.name = '';
        dialogConfig.process.data.code = '';
        dialogConfig.process.data.step_ids = '';
      }
    },
    submit: async ({validateResult, firstError}) => {
      if (validateResult !== true) return dialog.warning(firstError);
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.sys.process[dialogConfig.process.type], dialogConfig.process.data);
      loading && loading.close();
      if (res) {
        dialog.success('保存成功');
        dialogConfig.process.close();
        await process.value.reportConfig.getData();
      }
    },
    close: () => {
      // console.log('close');
      dialogConfig.process.isShow = false;
    },
    on: {
      afterClose: () => {
        dialogConfig.process.close();
      }
    }
  },
  assets: {
    isShow: false,
    bind: {
      title: '添加资产',
      width: '800px',
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
      dialogConfig.assets.isShow = false;
    },
    on: {
      afterClose: () => {
        dialogConfig.assets.close();
      }
    }
  }
})
onMounted(() => {
  api.get(apiUrl.sys.process.config).then(res => {
    obj.processConfig.tableConfig = {...obj.processConfig.tableConfig, ...res.table};
    obj.processConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    dialogConfig.process.options = getOptionsLabel(res.option);
    dialogConfig.process.options.step_id = res.option.step_id;
    dialogConfig.process.options.erp_process_id = res.option.erp_process_id;
    dialogConfig.process.options.unit_id = res.option.unit_id;
    refObj.processShow = true;
  });
  api.get(apiUrl.sys.process.assetsConfig).then(res => {
    obj.assetsConfig.tableConfig = {...obj.assetsConfig.tableConfig, ...res.table};
    obj.assetsConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.assetsShow = true;
  });
});
</script>
<style scoped>
.process {
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