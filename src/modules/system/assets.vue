<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig"/>
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel class="t-tabs-panel" value="userTable" v-bind="obj.panelConfig" label="用户">
        <TableComponent ref="userTable" v-if="refObj.userTableShow" v-bind="obj.userTableConfig"/>
      </t-tab-panel>
      <t-tab-panel class="t-tabs-panel" value="assetsTable" v-bind="obj.panelConfig" label="资产">
        <TableComponent ref="assetsTable" v-if="refObj.assetsTableShow" v-bind="obj.assetsTableConfig"/>
      </t-tab-panel>
      <t-tab-panel class="t-tabs-panel" value="propertyTable" v-bind="obj.panelConfig" label="属性">后续开发中</t-tab-panel>
    </t-tabs>
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

const mainTable = ref();
const userTable = ref();
const assetsTable = ref();

const refObj = reactive({
  mainTableShow: false,
  userTableShow: false,
  assetsTableShow: false,
  tab: 'userTable',
});

const obj = {
    options:[],
    tabsConfig: {
        theme: 'card',
        defaultValue: 'userTable',
        onChange: val => refObj.tab = val,
    },
    panelConfig: {
        destroyOnHide: false,
    },
    mainTableConfig: {
        menuConfig: {
            defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
            menu: {
                create: {
                    click: () => {
                        dialog.window(
                            addAsset,
                            {
                                query:{
                                    options: obj.options,
                                },
                                scene: 'auth',
                                getAttach: (e) => {
                                    if (e) {
                                        mainTable.value.reportConfig.getData();
                                    }
                                }
                            },
                            {
                                title: "添加资产：", width: '60%', height: '80%', forceEnlarge: false, changeSize: false,
                            }
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
                        const data = asset.map(i => ({ id: i.id, type: i.type }));
                        dialog.confirm(`确定要删除吗？`, async () => {
                            await api.post(apiUrl.sys.asset.delAssets, { data }).then(res => {
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
                        dialog.window(
                            addAsset,
                            {
                                query: {
                                    asset: asset[0],
                                    options: obj.options,
                                    edit: true,
                                },
                                scene: 'auth',
                                getAttach: (e) => {
                                    if (e) {
                                        mainTable.value.reportConfig.getData();
                                    }
                                }
                            },
                            {
                                title: title, width: '60%', height: '80%', forceEnlarge: false, changeSize: false,
                            }
                        );
                    }
                },
            },
        },
        searchConfig: {
            search: [{
                type: 'select', field: 'plant_id', style: { width: '100px' }, value: siyi.user.plantId, load: 'factory',
                options: { multiple: false, clearable: false },
                onChange: val => mainTable.value.reportConfig.getData({ where: { plant_id: val } }),
            }],
        },
        tableConfig: {
            url: apiUrl.sys.asset.mainList, showCheck: 'radio', disablePage: true,
            events: {
                click_cell: args => {
                    if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
                        userTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
                        assetsTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
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
                                title: "添加资产人员：", width: '60%', height: '80%', forceEnlarge: false, changeSize: false,
                            }
                        )
                    }
                },
                delete: {
                    click: () => {
                        let uids = tableFn.getCheckedRecords(userTable.value.reportConfig).map(i => i.user_link_id);
                        if (uids.length === 0) {
                            dialog.info('请先选择要删除的员工');
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
                                title: "添加资产：", width: '60%', height: '80%', forceEnlarge: false, changeSize: false,
                            }
                        )
                    }
                },
                delete: {
                    click: () => {
                        let uids = tableFn.getCheckedRecords(assetsTable.value.reportConfig).map(i => i.group_link_id);
                        if (uids.length === 0) {
                            dialog.info('请先选择要删除的员工');
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
}
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
});
</script>
<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;

  > .mainTable {
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
}
</style>