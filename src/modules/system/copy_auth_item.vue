<template>
    <div ref="box" class="body">
        <div class="employee-table">
            <TableComponent ref="userTable" v-bind="obj.userTableConfig" />
        </div>
        <div class="select-employee-auth-item-lists">
            <TableComponent ref="selectUserTable" v-bind="obj.selectUserTableConfig" />
        </div>
        <div class="all-employees-table">
            <TableComponent ref="allUserTable" v-bind="obj.allUserTableConfig" />
        </div>
    </div>
</template>
<script setup>
import { ref, reactive } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl2 from '@/core/config/url2.js';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import * as tableFn from "@/core/script/tableFn.js";
import _ from 'lodash'
const props = defineProps({
    query: {
        type: Object,
        default: {}
    },
    dialog: { type: Object }
})
const selectUserTable = ref(null);
const userTable = ref(null)
const allUserTable = ref(null);

const refObj = reactive({
    fromUid: '',
    fromName: ''
});
const selectUser = {}
const obj = {
    //已授权员工列表
    userTableConfig: {
        menuConfig: false,
        searchConfig: false,
        // query: {
        //     id: props.query.auth_id
        // },
        tableConfig: {
            showCheck: 'radio',
            url: apiUrl2.sys.auth.getAllEmployeeLists,
            disablePage: true,
            columns: [
                { field: 'id', title: 'ID', align: 'left', width: 80 },
                { field: 'username', title: '用户名', align: 'left' },
                { field: 'nickname', title: '姓名', align: 'left' },
            ],
            events: {
                click_cell: ({ originData }) => {
                    if (originData?.index > 0 && originData.index !== userTable.value.reportConfig.prveSelectRow.index) {
                        selectUserTable.value.reportConfig.getData({ id: originData.id }, true);
                        allUserTable.value.reportConfig.getData({ id: originData.id }, true);
                        refObj.fromUid = originData.id;
                        refObj.fromName = originData.nickname;
                    }
                },
            },
        }
    },
    //所选员工权限列表
    selectUserTableConfig: {
        menuConfig: false,
        searchConfig: false,
        tableConfig: {
            showCheck: 'multiple',
            url: apiUrl2.sys.auth.getAuthAssignmentByUid,
            disablePage: true,
            columns: [
                { field: 'remark', title: '权限名称', align: 'left' }
            ],
        },
    },
    // 所有员工列表
    allUserTableConfig: {
        menuConfig: {
            enableHeader: true,
            defaultMenuHideList: ['search', 'delete', 'update', 'clearCache', 'submitApprove', 'resetApprove', 'approve', 'pageExport', 'advancedExport', 'moreSettings', 'clearWhere',],
            menu: {
                create: { title: '提交复制授权', click: () => fn.copyAuthItemToEmployee() },
            }
        },
        searchConfig: false,
        tableConfig: {
            showCheck: 'multiple',
            url: apiUrl2.sys.auth.getAllEmployeeLists,
            disablePage: true,
            columns: [
                { field: 'id', title: 'ID', align: 'left', width: 80 },
                { field: 'username', title: '用户名', align: 'left' },
                { field: 'nickname', title: '姓名', align: 'left' },
            ],
        },
    },
}
const fn = {
    async copyAuthItemToEmployee() {
        if (refObj.fromUid === 0) {
            dialog.warning('请选择要复制权限的员工');
            return;
        }
        let itemAuthIds = tableFn.getCheckedRecords(selectUserTable.value.reportConfig).map(i => i.auth_id);
        if (itemAuthIds.length === 0) {
            dialog.warning('请选择要复制的权限');
            return;
        }
        let toUids = tableFn.getCheckedRecords(allUserTable.value.reportConfig).map(i => i.id);
        if (toUids.length === 0) {
            dialog.warning('请选择要接受复制授权的员工');
            return;
        }
        let msg = `您确定要把员工《${refObj.fromName}》的权限复制给选中的(${toUids.length})位员工吗？`;
        dialog.confirm(msg, async () => {
            const res = await api.post(apiUrl2.sys.auth.copyAuthAssignment, {
                fromUid: refObj.fromUid,
                itemAuthIds,
                toUids
            });
            if (res.ret) {
                dialog.success('复制权限成功');
                tableFn.update(selectUserTable.value.reportConfig);
                tableFn.update(allUserTable.value.reportConfig);
                userTable.value.reportConfig.getData()
            } else {
                dialog.error('复制权限失败');
            }
        });
    }
}
</script>
<style scoped>
.body {
    display: flex;
    gap: 3px;
    height: 100%;
    padding: 3px;

    .select-employee-auth-item-lists {
        flex: 1;
    }

    .employee-table {
        flex: 1;
    }

    .all-employees-table {
        flex: 1;
    }
}
</style>