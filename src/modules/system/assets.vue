<template>
    <div ref="body" class="body">
        <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
        <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
          <t-tab-panel class="t-tabs-panel" value="processTable" v-bind="obj.panelConfig" label="工艺">
            <TableComponent ref="processTable" v-if="refObj.processTableShow" v-bind="obj.processTableConfig" />
          </t-tab-panel>
          <t-tab-panel class="t-tabs-panel" value="userTable" v-bind="obj.panelConfig" label="用户">
                <TableComponent ref="userTable" v-if="refObj.userTableShow" v-bind="obj.userTableConfig" />
            </t-tab-panel>
          <t-tab-panel class="t-tabs-panel" value="assetsTable" v-bind="obj.panelConfig" label="资产">
              <TableComponent ref="assetsTable" v-if="refObj.assetsTableShow" v-bind="obj.assetsTableConfig" />
          </t-tab-panel>
          <t-tab-panel class="t-tabs-panel" value="eapTable" v-bind="obj.panelConfig" label="eap参数">
            <TableComponent ref="eapTable" v-if="refObj.eapTableShow" v-bind="obj.eapTableConfig" />
          </t-tab-panel>
          <t-tab-panel class="t-tabs-panel" value="parameterTable" v-bind="obj.panelConfig" label="属性">
            <TableComponent ref="parameterTable" v-if="refObj.parameterTableShow" v-bind="obj.parameterTableConfig" />
          </t-tab-panel>
          <t-tab-panel class="t-tabs-panel" value="repairTable" v-bind="obj.panelConfig" label="维修记录">
            <TableComponent ref="repairTable" v-if="refObj.repairTableShow" v-bind="obj.repairTableConfig" />
          </t-tab-panel>
        </t-tabs>
        <DialogComponent v-if="dialogParameterConfig.show" v-bind="dialogParameterConfig.config">
          <div class="dialogClass">
            <t-form>
              <t-row>
                <t-col :span="11">
                  <t-form-item label="资产" name="assets_id" >
                    <t-select v-model="dialogParameterConfig.data.assets_id" :options="refObj.selectOptions.assets_id" disabled />
                  </t-form-item>
                  <t-form-item label="参数名称" name="parameter_id" >
                    <t-select v-model="dialogParameterConfig.data.parameter_id" :options="refObj.selectOptions.parameter_id" disabled />
                  </t-form-item>
                  <t-form-item label="参数值" name="parameter_value" >
                    <t-textarea v-model="dialogParameterConfig.data.parameter_value" :autosize="{ minRows: 2, maxRows: 5 }" />
                  </t-form-item>
                  <t-form-item label="排序" name="sort" >
                    <t-input-number v-model="dialogParameterConfig.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"  placeholder="数字小靠前" />
                  </t-form-item>
                  <t-form-item label="状态" name="status" >
                    <t-select v-model="dialogParameterConfig.data.status" :options="refObj.selectOptions.status" />
                  </t-form-item>
                  <t-form-item label="备注" name="remark">
                    <t-input v-model="dialogParameterConfig.data.remark" />
                  </t-form-item>
                </t-col>
              </t-row>
            </t-form>
          </div>
        </DialogComponent>

        <DialogComponent v-if="dialogRepairConfig.show" v-bind="dialogRepairConfig.config">
        <div class="dialogClass">
          <t-form>
            <t-row>
              <t-col :span="11">
                <t-form-item label="资产" name="assets_id" >
                  <t-select v-model="dialogRepairConfig.data.assets_id" :options="refObj.selectOptions.assets_id" disabled style="width: 100%"/>
                </t-form-item>
                <t-form-item label="开始时间" name="start_time" >
                  <t-date-picker v-model="dialogRepairConfig.data.start_time" clearable allow-input format="YYYY-MM-DD" style="width: 100%"/>
                </t-form-item>
                <t-form-item label="结束时间" name="end_time" >
                  <t-date-picker v-model="dialogRepairConfig.data.end_time" clearable allow-input format="YYYY-MM-DD" style="width: 100%"/>
                </t-form-item>
                <t-form-item label="维修内容" name="content" >
                  <t-textarea v-model="dialogRepairConfig.data.content" :autosize="{ minRows: 2, maxRows: 5 }" style="width: 100%"/>
                </t-form-item>
                <t-form-item label="状态" name="status" >
                  <t-select v-model="dialogRepairConfig.data.status" :options="refObj.selectOptions.status" style="width: 100%"/>
                </t-form-item>
                <t-form-item label="备注" name="remark">
                  <t-input v-model="dialogRepairConfig.data.remark" style="width: 100%"/>
                </t-form-item>
              </t-col>
            </t-row>
          </t-form>
        </div>
      </DialogComponent>
    </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import addAsset from "@/modules/system/addAsset.vue";
import addAssetsUser from '@/modules/system/addAssetsUser.vue';
import addAssetsGroup from '@/modules/system/addAssetsGroup.vue';
import AddAssetsParameterEap from "@/modules/system/addAssetsParameterEap.vue";
import addAssetsParameter from "@/modules/system/addAssetsParameter.vue";
import DialogComponent from "@/core/component/dialog.vue";
import {getOptionsLabel} from "@/utils/vars.js";

const mainTable = ref();
const userTable = ref();
const assetsTable = ref();
const processTable = ref();
const eapTable = ref();
const parameterTable = ref();
const repairTable = ref();

const refObj = reactive({
    mainTableShow: false,
    userTableShow: false,
    assetsTableShow: false,
    processTableShow: false,
    eapTableShow: false,
    parameterTableShow: false,
    repairTableShow: false,
    tab: 'processTable',
    selectOptions: {status:[],assets_id:[],parameter_id:[]},
});

const tableEvent={
  addLabel:async (rows)=>{
    const types =  [...new Set(rows.map(item=>item.type))];
    if (types.length!==1){
      dialog.error('请选择同类型的数据!');
      return ;
    }
    const id= rows.map(item=>item.id);
    const label =  await dialog.inputAsync('','请输入标签名',{width:'300px'});
    if (!label) return;
    const res = await api.post(apiUrl.sys.asset.addAssetLabel,{id,label,type:types[0]});
    if (!res) return;
    dialog.success('添加成功!');
    mainTable.value.reportConfig.getData();
  },
  delLabel:async (rows)=>{
    const types =  [...new Set(rows.map(item=>item.type))];
    if (types.length!==1){
      dialog.error('请选择同类型的数据!');
      return ;
    }
    const id= rows.map(item=>item.id);
    const label =  await dialog.inputAsync('','请输入标签名',{width:'300px'});
    if (!label) return;
    const res = await api.post(apiUrl.sys.asset.delAssetLabel,{id,label,type:types[0]});
    if (!res) return;
    dialog.success('删除成功!');
    mainTable.value.reportConfig.getData();
  },
};

const obj = {
    options: [],
    plantId: siyi.user.plantId,
    tabsConfig: {
        theme: 'card',
        defaultValue: 'userTable',
        onChange: val => refObj.tab = val,
    },
    panelConfig: {
        destroyOnHide: false,
    },
    mainTableConfig: {
        changeSizeBottom:true,
        menuConfig: {
            defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
            menu: {
                create: {
                  click: () => {
                    dialog.window(addAsset, {
                          query: {options: obj.options, plantId: obj.plantId},
                          scene: 'auth',
                          getAttach: e => e && mainTable.value.reportConfig.getData()
                        }, {title: "添加资产：", width: '580px', height: '660px', forceEnlarge: false, changeSize: false,}
                    );
                  }
                },
                delete: {
                  click: () => {
                    let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                    if (asset.length === 0) {
                      dialog.info('请先选择要删除的资产或资产组');
                      return;
                    }
                    const data = asset.map(i => ({id: i.id, type: i.type}));
                    dialog.confirm(`确定要删除吗？`, async () => {
                      await api.post(apiUrl.sys.asset.delAssets, {data}).then(res => {
                        if (res.ret > 0) {
                          dialog.success(`成功删除${data.length}个资产或资产组`);
                          mainTable.value.reportConfig.getData();
                        } else {
                          dialog.error(res.msg || '删除失败');
                        }
                      })
                    });
                  }
                },
                update: {
                    click: () => {
                        let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                        if (asset.length === 0) {
                            dialog.info('请先选择要修改的资产或资产组');
                            return;
                        }
                        let title = asset[0].type === 'group' ? '修改资产组' : '修改资产';
                        dialog.window(addAsset, {
                              query: {asset: asset[0], options: obj.options, edit: true,},
                              scene: 'auth',
                              getAttach:(e)=>{
                                mainTable.value.reportConfig.getData()
                              }
                            }, {title: title, width: '580px', height: '660px', forceEnlarge: false, changeSize: false,}
                        );
                    }
                },
              addLabel: {title: '添加标签', listAction: tableEvent.addLabel, icon: 'ri-file-add-line', sort: 450,},
              delLabel: {title: '删除标签', listAction: tableEvent.delLabel, icon: 'ri-file-reduce-line', sort: 460,},
            },
        },
        searchConfig: {
            search: [{
                type: 'select', field: 'plant_id', style: { width: '100px' }, value: siyi.user.plantId, load: 'factory',
                options: { multiple: false, clearable: false },
                onChange: (val => {
                    obj.plantId = val;
                    mainTable.value.reportConfig.getData({ where: { plant_id: val } })
                })
            }],
        },
        tableConfig: {
            url: apiUrl.sys.asset.mainList, showCheck: true, disablePage: true,
            events: {
                click_cell: args => {
                    if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
                        userTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
                        assetsTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
                        processTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
                        eapTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
                        parameterTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
                        repairTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
                    }
                }
            },
        },
    },
    userTableConfig: {
        searchConfig: false,
        menuConfig: {
            defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
            menu: {
                create: {
                    //添加人员
                    click: () => {
                        let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                        if (asset.length === 0) {
                            dialog.info('请先选择资产');
                            return;
                        }
                        dialog.window(
                            addAssetsUser,
                            {
                                query: {
                                    asset: asset[0],
                                },
                                scene: 'auth',
                                getAttach: (e) => {
                                    if (e) {
                                        userTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                                    }
                                }
                            },
                            {
                                title: "添加资产人员：", width: '1260px', height: '800px', forceEnlarge: false, changeSize: false,
                            }
                        )
                    }
                },
                delete: {
                    click: () => {
                        let uids = tableFn.getCheckedRecords(userTable.value.reportConfig).map(i => i.user_link_id);
                        if (uids.length === 0) {
                            dialog.info('请先选择要删除的用户');
                            return;
                        }
                        dialog.confirm('确定要删除吗？', async () => {
                            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                            const res = await api.post(apiUrl.sys.asset.deleteUser, { aid: asset[0].id, type: asset[0].type, uids });
                            if (res !== null && res !== undefined) {
                                if (res.ret > 0) {
                                    dialog.success(`成功删除${res.ret}条记录`);
                                    userTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                                } else {
                                    dialog.info('网络错误，请稍后再试');
                                }
                            }
                        });
                    }
                }
            },
        },
        tableConfig: { url: apiUrl.sys.asset.userList, showCheck: 'multiple', disablePage: true },
    },
    assetsTableConfig: {
        searchConfig: false,
        menuConfig: {
            defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
            menu: {
                create: {
                    click: () => {
                        let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                        if (asset.length === 0) {
                            dialog.info('请先选择资产组');
                            return;
                        }
                        if (asset[0]?.type !== 'group') {
                            dialog.info('资产暂不支持添加资产，请选择资产组');
                            return;
                        }
                        dialog.window(
                            addAssetsGroup,
                            {
                                query: {
                                    asset: asset[0],
                                },
                                scene: 'auth',
                                getAttach: (e) => {
                                    if (e) {
                                        userTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                                        assetsTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                                    }
                                }
                            },
                            {
                                title: "添加资产：", width: '1260px', height: '800px', forceEnlarge: false, changeSize: false,
                            }
                        )
                    }
                },
                delete: {
                    click: () => {
                        let uids = tableFn.getCheckedRecords(assetsTable.value.reportConfig).map(i => i.group_link_id);
                        if (uids.length === 0) {
                            dialog.info('请先选择要删除的用户');
                            return;
                        }
                        dialog.confirm('确定要删除吗？', async () => {
                            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                            const res = await api.post(apiUrl.sys.asset.deleteAssetsGroup, { aid: asset[0].id, type: asset[0].type, uids });
                            if (res !== null && res !== undefined) {
                                if (res.ret > 0) {
                                    dialog.success(`成功删除${res.ret}条记录`);
                                    assetsTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                                } else {
                                    dialog.info('网络错误，请稍后再试');
                                }
                            }
                        });
                    }
                }
            },
        },
        tableConfig: { url: apiUrl.sys.asset.assetsList, showCheck: 'multiple', disablePage: true },
    },
    processTableConfig:{
      searchConfig: false,
      menuConfig: {
        defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
      },
      tableConfig: { url: apiUrl.sys.asset.processList, showCheck: 'multiple', disablePage: true },
    },
    eapTableConfig:{
      searchConfig: false,
      menuConfig: {
        defaultMenuShowList: ['pageExport', 'moreSettings'],
        menu: {
          create: {
            //添加eap参数
            click: () => {
              let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
              if (asset.length === 0) {
                dialog.info('请先选择资产');
                return;
              }
              if (asset[0]?.type === 'group') {
                dialog.info('资产组暂不支持添加eap参数，请选择资产');
                return;
              }
              dialog.window(
                  AddAssetsParameterEap,
                  {
                    query: {
                      asset: asset[0],
                    },
                    scene: 'auth',
                    getAttach: (e) => {
                      if (e) {
                        eapTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                      }
                    }
                  },
                  {
                    title: "添加eap参数：", width: '1260px', height: '800px', forceEnlarge: false, changeSize: false,
                  }
              )
            }
          },
          delete: {
            click: () => {
              let ids = tableFn.getCheckedRecords(eapTable.value.reportConfig).map(i => i.id);
              if (ids.length === 0) {
                dialog.info('请先选择要删除的eap参数');
                return;
              }

              dialog.confirm('确定要删除吗？', async () => {
                let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                const res = await api.post(apiUrl.sys.asset.deleteParameterEap, { aid: asset[0].id, ids });
                if (res !== null && res !== undefined) {
                  if (res.ret > 0) {
                    dialog.success(`成功删除${res.ret}条记录`);
                    eapTable.value.reportConfig.getData({ id: asset[0].id });
                  } else {
                    dialog.info('网络错误，请稍后再试');
                  }
                }
              });
            }
          },
          update: {
            click: () => {
              dialogParameterConfig.config.title = '修改eap信息';
              dialogParameterConfig.type = 'editParameterEap';
              const checkedRows = tableFn.getCheckedRecords(eapTable.value.reportConfig);
              if (checkedRows?.length < 1) return dialog.warning('请勾选eap参数');
              if (checkedRows?.length > 1) return dialog.warning('只能编辑一条eap参数');
              dialogParameterConfig.data= {...checkedRows[0]};
              dialogParameterConfig.show = true;
            }
          },
        },
      },
      tableConfig: {url: apiUrl.sys.asset.parametersEapList, showCheck: 'multiple', disablePage: true},
    },
    parameterTableConfig:{
      searchConfig: false,
      menuConfig: {
        defaultMenuShowList: ['pageExport', 'moreSettings'],
        menu: {
          create: {
            //添加eap
            click: () => {
              let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
              if (asset.length === 0) {
                dialog.info('请先选择资产');
                return;
              }
              if (asset[0]?.type === 'group') {
                dialog.info('资产组暂不支持添加资产属性，请选择资产');
                return;
              }
              dialog.window(
                  addAssetsParameter,
                  {
                    query: {asset: asset[0],},
                    scene: 'auth',
                    getAttach: (e) => {
                      if (e) {
                        parameterTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                      }
                    }
                  },
                  {
                    title: "添加资产属性：", width: '1260px', height: '800px', forceEnlarge: false, changeSize: false,
                  }
              )
            }
          },
          delete: {
            click: () => {
              let ids = tableFn.getCheckedRecords(parameterTable.value.reportConfig).map(i => i.id);
              if (ids.length === 0) {
                dialog.info('请先选择要删除的资产属性');
                return;
              }
              dialog.confirm('确定要删除吗？', async () => {
                let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                const res = await api.post(apiUrl.sys.asset.deleteParameter, { aid: asset[0].id, ids });
                if (res !== null && res !== undefined) {
                  if (res.ret > 0) {
                    dialog.success(`成功删除${res.ret}条记录`);
                    parameterTable.value.reportConfig.getData({ id: asset[0].id });
                  } else {
                    dialog.info('网络错误，请稍后再试');
                  }
                }
              });
            }
          },
          update: {
            click: () => {
              dialogParameterConfig.config.title = '修改资产属性';
              dialogParameterConfig.type = 'editParameter';
              const checkedRows = tableFn.getCheckedRecords(parameterTable.value.reportConfig);
              if (checkedRows?.length < 1) return dialog.warning('请勾选资产属性');
              if (checkedRows?.length > 1) return dialog.warning('只能编辑一条资产属性');
              dialogParameterConfig.data= {...checkedRows[0]};
              dialogParameterConfig.show = true;
            }
          },
        },
      },
      tableConfig: {url: apiUrl.sys.asset.parameterList, showCheck: 'multiple', disablePage: true},
    },
    repairTableConfig:{
      searchConfig: false,
      menuConfig: {
        defaultMenuShowList: ['pageExport', 'moreSettings'],
        menu: {
          create: {
            //添加eap
            click: () => {
              let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
              if (asset.length === 0) {
                dialog.info('请先选择资产');
                return;
              }
              if (asset[0]?.type === 'group') {
                dialog.info('资产组暂不支持添加资产维修信息，请选择资产');
                return;
              }
              dialogRepairConfig.config.title = '新增资产维修信息';
              dialogRepairConfig.type = 'addRepair';
              if (asset?.length > 1) return dialog.warning('只能勾选一条资产信息');
              dialogRepairConfig.data.assets_id = asset[0].id;
              dialogRepairConfig.data.type = asset[0].type;
              dialogRepairConfig.show = true;
            }
          },
          delete: {
            click: () => {
              let ids = tableFn.getCheckedRecords(repairTable.value.reportConfig).map(i => i.id);
              if (ids.length === 0) {
                dialog.info('请先选择要删除的资产维修信息');
                return;
              }
              dialog.confirm('确定要删除吗？', async () => {
                let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
                const res = await api.post(apiUrl.sys.asset.deleteRepair, { aid: asset[0].id, ids });
                if (res !== null && res !== undefined) {
                  if (res.ret > 0) {
                    dialog.success(`成功删除${res.ret}条记录`);
                    repairTable.value.reportConfig.getData({ id: asset[0].id });
                  } else {
                    dialog.info('网络错误，请稍后再试');
                  }
                }
              });
            }
          },
          update: {
            click: () => {
              dialogRepairConfig.config.title = '修改资产维修信息';
              dialogRepairConfig.type = 'editRepair';
              const checkedRows = tableFn.getCheckedRecords(repairTable.value.reportConfig);
              if (checkedRows?.length < 1) return dialog.warning('请勾选资产维修信息');
              if (checkedRows?.length > 1) return dialog.warning('只能编辑一条资产维修信息');
              dialogRepairConfig.data= {...checkedRows[0]};
              dialogRepairConfig.show = true;
            }
          },
        },
      },
      tableConfig: {url: apiUrl.sys.asset.repairList, showCheck: 'multiple', disablePage: true},
    },
}

const dialogParameterConfig = reactive({
  show: false,
  data: {},
  config: {
    type: 'confirm',
    onAfterClose: () => dialogParameterConfig.show = false,
    onOk: async obj => {
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.sys.asset[dialogParameterConfig.type], dialogParameterConfig.data);
      loading && loading.close();
      if (res) {
        dialog.success('保存成功');
        dialogParameterConfig.show = false;
        if(dialogParameterConfig.type === 'editParameterEap'){
          eapTable.value.reportConfig.getData({ id: dialogParameterConfig.data.assets_id });
        }
        if(dialogParameterConfig.type === 'editParameter'){
          parameterTable.value.reportConfig.getData({ id: dialogParameterConfig.data.assets_id });
        }
      }
    }
  },
});

const dialogRepairConfig = reactive({
  show: false,
  data: {status:1,start_time:new Date(),end_time:new Date()},
  config: {
    type: 'confirm',
    onAfterClose: () => dialogRepairConfig.show = false,
    onOk: async obj => {
      if (!dialogRepairConfig.data.start_time) {
        dialog.warning('请选择维修开始时间');
        obj.close = false;
        return;
      }
      if (!dialogRepairConfig.data.end_time) {
        dialog.warning('请选择维修结束时间');
        obj.close = false;
        return;
      }
      if (!dialogRepairConfig.data.content) {
        dialog.warning('请输入维修内容');
        obj.close = false;
        return;
      }
      if (!dialogRepairConfig.data.status) {
        dialog.warning('请选择状态');
        obj.close = false;
        return;
      }
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.sys.asset[dialogRepairConfig.type], dialogRepairConfig.data);
      loading && loading.close();
      if (res) {
        dialog.success('保存成功');
        dialogRepairConfig.show = false;
        repairTable.value.reportConfig.getData({ exec: null, id: dialogRepairConfig.data.assets_id, type: dialogRepairConfig.data.type });
        dialogRepairConfig.data = {status:1,start_time:new Date(),end_time:new Date(),content:''};
      }
    }
  },
});


onMounted(() => {
    api.get(apiUrl.sys.asset.mainConfig).then(res => {
        obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
        obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        obj.options = res.option;
        refObj.mainTableShow = true;
    });
    api.get(apiUrl.sys.asset.userConfig).then(res => {
        obj.userTableConfig.tableConfig = { ...obj.userTableConfig.tableConfig, ...res.table };
        obj.userTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.userTableShow = true;
    });
    api.get(apiUrl.sys.asset.assetsConfig).then(res => {
        obj.assetsTableConfig.tableConfig = { ...obj.assetsTableConfig.tableConfig, ...res.table };
        obj.assetsTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.assetsTableShow = true;
    });
    api.get(apiUrl.sys.asset.processConfig).then(res => {
      obj.processTableConfig.tableConfig = { ...obj.processTableConfig.tableConfig, ...res.table };
      obj.processTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
      refObj.processTableShow = true;
    });
    api.get(apiUrl.sys.asset.parameterEapConfig).then(res => {
      obj.eapTableConfig.tableConfig = { ...obj.eapTableConfig.tableConfig, ...res.table };
      obj.eapTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
      refObj.selectOptions = getOptionsLabel(res.option);
      refObj.eapTableShow = true;
    });
    api.get(apiUrl.sys.asset.parameterConfig).then(res => {
      obj.parameterTableConfig.tableConfig = { ...obj.parameterTableConfig.tableConfig, ...res.table };
      obj.parameterTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
      refObj.selectOptions = getOptionsLabel(res.option);
      refObj.parameterTableShow = true;
    });
    api.get(apiUrl.sys.asset.repairConfig).then(res => {
      obj.repairTableConfig.tableConfig = { ...obj.repairTableConfig.tableConfig, ...res.table };
      obj.repairTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
      refObj.selectOptions = getOptionsLabel(res.option);
      refObj.repairTableShow = true;
    });
});
</script>
<style scoped>
.body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 3px;

    >.mainTable {
        height: 40%;
        flex-shrink: 0;
    }

    .t-tabs {
        flex: 1;
        flex-shrink: 0;
        border-radius: 5px;
        border: 1px solid #ccc;
    }

    .t-tabs-panel {
        padding: 3px;
    }
    .dialogClass {
      width: 450px;
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
}
</style>