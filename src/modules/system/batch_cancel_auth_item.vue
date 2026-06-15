<template>
    <div ref="box" class="body">
        <TableComponent ref="userTable" class="table" v-if="refObj.userTableShow" v-bind="obj.userTableConfig" />
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl2 from '@/core/config/url2.js';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import * as tableFn from "@/core/script/tableFn.js";
const props = defineProps({
    dialog: { type: Object },
    getAttach: { type: Function, default: () => { } },
})
const userTable = ref();
const refObj = reactive({
    userTableShow: false,
});
const obj = {
    userTableConfig: {
        menuConfig: {
            enableHeader: true,
            defaultMenuHideList: ['search', 'create', 'delete', 'update', 'clearCache', 'submitApprove', 'resetApprove', 'approve', 'pageExport', 'advancedExport', 'moreSettings', 'clearWhere',],
            menu: {
                create: { title: '确定提交', click: () => fn.batchCancelAuthItem() },
            }
        },
        searchConfig: {},
        tableConfig: { url: apiUrl2.sys.auth.getAllEmployeeLists, showCheck: 'multiple', disablePage: true }
    }
};
const fn = {
    batchCancelAuthItem() {
        const uids = tableFn.getCheckedRecords(userTable.value.reportConfig).map(i => i.id);
        if (uids.length == 0) {
            dialog.warning('请至少选择一个员工');
            return;
        }
        let msg = `您确定要批量取消选中的（${uids.length}）位员工的权限吗？`;
        dialog.confirm(msg, async () => {
            const res = await api.post(apiUrl2.sys.auth.batchCancelAuthItem, {
                uids
            });
            props.getAttach(res.count);
            await props.dialog.close()
        })
    }
}
onMounted(() => {
    api.get(apiUrl2.sys.auth.userConfig).then(res => {
        obj.userTableConfig.tableConfig = { ...obj.userTableConfig.tableConfig, ...res.table };
        obj.userTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.userTableShow = true;
    });
});
</script>
<style scoped>
.body {
    display: flex;
    height: 100%;

    .table {
        flex: 1;
    }
}
</style>