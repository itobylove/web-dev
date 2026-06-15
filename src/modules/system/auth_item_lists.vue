<template>
    <div ref="box" class="body">
        <TableComponent class="mainTable" ref="mainReport" v-bind="obj.mainReportConfig" />
        <div class="t-tabs">
            <TableComponent v-if="refObj.userTableShow" ref="detailListReport" v-bind="obj.authUserTableConfig" />
        </div>
    </div>
</template>
<script setup>
import { ref, nextTick, onMounted, reactive } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl2 from '@/core/config/url2.js';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import employees from '@/modules/system/employees.vue'
import copyAuthItem from '@/modules/system/copy_auth_item.vue'
import batchAuthItem from '@/modules/system/batch_auth_item.vue'
import batchCancelAuthItem from '@/modules/system/batch_cancel_auth_item.vue'
import * as tableFn from "@/core/script/tableFn.js";
import _ from "lodash";
import * as VTable from '@visactor/vtable';
import { InputEditor } from "@visactor/vtable-editors";
const mainReport = ref();
const detailListReport = ref(null);
const refObj = reactive({
    userTableShow: false,
    authItemRow: {}
});

const obj = {
    mainReportConfig: {
        changeSizeBottom: true,
        menuConfig: {
            enableHeader: true,
            defaultMenuHideList: ['search', 'delete', 'update', 'clearCache', 'submitApprove', 'resetApprove', 'approve', 'pageExport', 'advancedExport', 'moreSettings', 'clearWhere',],
            menu: {
                create: { title: '导入权限节点', click: () => fn.importAuthItem() },
            }
        },
        searchConfig: {},
        tableConfig: {
            url: apiUrl2.sys.auth.getMenuLists,
            showCheck: 'radio',
            checkField: false,
            disablePage: true,
            events: {
                click_cell: ({ originData }) => {
                    if (originData?.index > 0 && originData.index !== mainReport.value.reportConfig.prveSelectRow.index) {
                        clickCellDebounce(originData)
                    }
                },
                change_cell_value: async (e) => {
                    if (e.changedValue !== e.rawValue) {
                        const newRow = mainReport.value.reportConfig.options.records[e.row - 1];
                        const res = await api.post(apiUrl2.sys.auth.updateAuthItem, {
                            newRow
                        })
                        if (res?.ret) {
                            dialog.success('权限描述修改成功');
                        } else {
                            mainReport.value.reportConfig.table.changeCellValue(e.col, e.row, e.rawValue)
                        }
                    }
                }
            }
        }
    },
    authUserTableConfig: {
        menuConfig: {
            defaultMenuHideList: ['search', 'delete', 'update', 'clearCache', 'submitApprove', 'resetApprove', 'approve', 'pageExport', 'advancedExport', 'moreSettings', 'clearWhere',],
            menu: {
                create: { title: '添加权限', click: () => fn.addAuthItem() },
                cancelAuthItem: { sort: 651, title: '取消权限', icon: 'ri-send-plane-fill', click: () => fn.cancelAuthItem() },
                copyAuthItem: { sort: 651, title: '复制权限', icon: 'ri-file-copy-2-line', click: () => fn.copyAuthItem() },
                batchAuthItem: { sort: 651, title: '批量授权', icon: 'ri-arrow-down-circle-fill', click: () => fn.batchAuthItem() },
                batchCancelAuthItem: { sort: 651, title: '批量取消', icon: 'ri-stack-line', click: () => fn.batchCancelAuthItem() },
            },
        },
        searchConfig: false,
        tableConfig: { url: apiUrl2.sys.auth.getEmployeeLists, showCheck: 'multiple', disablePage: true },
    }
}
const clickCellDebounce = _.debounce((e) => {
    refObj.authItemRow = e;
    detailListReport.value.reportConfig.getData({ id: e.id }, true);
}, 500);
const updateData = async (id, tableConfig) => {
    const newRow = await api.get(apiUrl2.sys.auth.getAuthItemDetailsById, { id: id });
    await tableFn.updateRow(tableConfig, newRow); // 更新使用人数
}
const fn = {
    //添加权限
    addAuthItem() {
        if (Object.keys(refObj.authItemRow).length === 0) {
            return dialog.warning('请先选择一个权限');
        }
        dialog.window(
            employees,
            {
                query: {
                    auth_id: refObj.authItemRow.id,
                    title: refObj.authItemRow.title
                },
                scene: 'auth',
                getAttach: (e) => {
                    if (e) {
                        if (e > 0) {
                            updateData(refObj.authItemRow.id, mainReport.value.reportConfig)
                            clickCellDebounce(refObj.authItemRow);
                        }
                    }
                }
            },
            {
                title: "权限查询：" + refObj.authItemRow.title, width: '60%', height: '80%',
            }
        )
    },
    //取消权限
    cancelAuthItem() {
        if (Object.keys(refObj.authItemRow).length === 0) {
            return dialog.warning('请先选择一个权限');
        }
        let aids = tableFn.getCheckedRecords(detailListReport.value.reportConfig).map(i => i.aid);
        if (aids.length === 0) {
            return dialog.warning('请先选择要取消权限的员工');
        }
        dialog.confirm(`您确定要取消所选的${aids.length}位员工的《${refObj.authItemRow.title}》权限吗？`, async () => {
            const res = await api.post(apiUrl2.sys.auth.delAuthAssignment, {
                auth_id: refObj.authItemRow.id,
                aids
            });
            if (res.count > 0) {
                dialog.success(`成功为${res.count}位员工取消权限`);
                //更新员工表
                updateData(refObj.authItemRow.id, mainReport.value.reportConfig);
                detailListReport.value.reportConfig.getData({ id: refObj.authItemRow.id }, false);
            } else {
                dialog.info('所选员工均未拥有该权限，无需取消');
            }
        });
    },
    //复制权限
    copyAuthItem() {
        dialog.window(
            copyAuthItem,
            {
                scene: 'auth'
            },
            {
                title: "复制权限", width: '60%', height: '80%',
                onAfterClose: () => {
                    mainReport.value.reportConfig.getData();
                }
            }
        )
    },
    //批量授权
    batchAuthItem() {
        dialog.window(
            batchAuthItem,
            {
                scene: 'auth',
                getAttach: (e) => {
                    if (e.result > 0) {
                        dialog.success('操作成功');
                        mainReport.value.reportConfig.getData();
                    } else {
                        dialog.info('没有权限项可授权');
                    }
                }
            },
            {
                title: "批量授权", width: '60%', height: '80%',
            }
        )
    },
    //批量取消授权
    batchCancelAuthItem() {
        dialog.window(
            batchCancelAuthItem,
            {
                scene: 'auth',
                getAttach: (e) => {
                    if (e > 0) {
                        dialog.success('操作成功');
                        mainReport.value.reportConfig.getData();
                    } else {
                        dialog.info('没有权限项可取消');
                    }
                }
            },
            {
                title: "批量取消授权", width: '60%', height: '80%',
            }
        )
    },
    async importAuthItem() {
        await api.get(apiUrl2.sys.auth.getMenu).then((res) => {
            if (res.count > 0) {
                dialog.success(`成功导入${res.count}个新权限节点`);
                mainReport.value.reportConfig.getData();
            } else {
                dialog.success(`没有新权限节点可导入`);
            }
        });
    }
}
onMounted(() => {
    VTable.register.editor('input-editor', new InputEditor());
    api.get(apiUrl2.sys.auth.config).then((res) => {
        mainReport.value.reportConfig.columns = tableFn.createColumns(res.columns, res.table.columnSplit || '#');
    });
    api.get(apiUrl2.sys.auth.userConfig).then(res => {
        obj.authUserTableConfig.tableConfig = { ...obj.authUserTableConfig.tableConfig, ...res.table };
        obj.authUserTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.userTableShow = true;
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
}
</style>
