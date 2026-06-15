<template>
    <div ref="box" class="body">
        <TableComponent ref="userTable" v-if="refObj.userTableShow" v-bind="obj.userTableConfig" />
    </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from "@/core/script/api.js";
import apiUrl2 from '@/core/config/url2.js';
import dialog from "@/core/script/dialog.js";
import * as tableFn from "@/core/script/tableFn.js";
const props = defineProps({
    query: {
        type: Object,
        default: {}
    },
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
            defaultMenuHideList: ['search', 'delete', 'update', 'clearCache', 'submitApprove', 'resetApprove', 'approve', 'pageExport', 'advancedExport', 'moreSettings', 'clearWhere',],
            menu: {
                create: { title: '提交授权', click: () => fn.addAuthItemForEmployee() },
            }
        },
        searchConfig: {},
        query: {
            auth_id: props.query.auth_id
        },
        tableConfig: {
            url: apiUrl2.sys.auth.getEmployeeListsByAuthId,
            showCheck: 'multiple',
            disablePage: true,
            options: {
                rowSeriesNumber: false
            },
        }
    }
}
const fn = {
    async addAuthItemForEmployee() {
        let uids = tableFn.getCheckedRecords(userTable.value.reportConfig).map(i => i.id), authId = props.query.auth_id;
        if (!authId) {
            return dialog.warning('缺少权限ID，无法分配权限');
        }
        if (uids.length === 0) {
            return dialog.warning('请先选择要授权的员工');
        }
        let msg = `您确定要给${uids.length}位员工分配《${props.query.title}》权限吗？`;
        dialog.confirm(msg, async () => {
            const res = await api.post(apiUrl2.sys.auth.addAuthAssignment, {
                auth_id: authId,
                uids
            });
            if (res.count > 0) {
                props.getAttach(res.count);
                dialog.success(`成功为${res.count}位员工分配权限`);
            } else {
                dialog.info('所选员工均已拥有该权限，无需重复分配');
            }
            await props.dialog.close()
        });
    },
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
    height: 100%;
}
</style>