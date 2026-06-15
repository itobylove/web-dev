<template>
    <div ref="box" class="body">
        <div class="users-lists-table">
            <TableComponent v-bind="obj.userTableConfig" />
        </div>
        <div class="auth-lists-table">
            <TableComponent ref="authItemTable" v-if="refObj.authTableShow" v-bind="obj.authItemTableConfig" />
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl2 from '@/core/config/url2.js';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import * as tableFn from "@/core/script/tableFn.js";
import _ from "lodash"
const props = defineProps({
    dialog: { type: Object },
    getAttach: { type: Function, default: () => { } },
})
const authItemTable = ref();
const refObj = reactive({
    authTableShow: false,
});
const userClickCell = _.debounce((e) => {
    authItemTable.value.reportConfig.getData({ uid: e.id });
    obj.user = e
}, 500)
const obj = {
    user: {},
    userTableConfig: {
        menuConfig: false,
        searchConfig: {},
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
                    userClickCell(originData)
                },
            },
        }
    },
    authItemTableConfig: {
        menuConfig: {
            enableHeader: true,
            defaultMenuHideList: ['search', 'update', 'delete', 'clearCache', 'submitApprove', 'resetApprove', 'approve', 'pageExport', 'advancedExport', 'moreSettings', 'clearWhere',],
            menu: {
                create: { title: '提交授权', click: () => fn.addAuthItem() },
            }
        },
        searchConfig: {},
        tableConfig: { showCheck: 'multiple', url: apiUrl2.sys.auth.getMenuLists, disablePage: true }
    }
};
const fn = {
    addAuthItem() {
        if (Object.keys(obj.user).length === 0) {
            dialog.warning('请选择一位用户');
            return;
        }
        let uids = tableFn.getCheckedRecords(authItemTable.value.reportConfig).map(i => i.id);
        let msg = `您确定要对用户《${obj.user.nickname}》的权限进行批量操作吗？`;
        dialog.confirm(msg, async () => {
            const ret = await api.post(apiUrl2.sys.auth.operateAuth, {
                uids,
                uid: obj.user.id
            });
            props.getAttach(ret);
            props.dialog.close();
        });
    }
}
onMounted(() => {
    api.get(apiUrl2.sys.auth.config).then(res => {
        obj.authItemTableConfig.tableConfig = { ...obj.authItemTableConfig.tableConfig, ...res.table };
        obj.authItemTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.authTableShow = true;
    });
});
</script>
<style scoped>
.body {
    height: 100%;
    display: flex;
    gap: 3px;
    padding: 3px;

    .users-lists-table {
        width: 40%;
    }

    .auth-lists-table {
        flex: 1;
    }
}
</style>