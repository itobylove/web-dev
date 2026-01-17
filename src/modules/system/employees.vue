<template>
    <div class="employee-list">
        <TableComponent ref="employeesTable" v-bind="employeeTableConfig"/>
    </div>
</template>
<script setup>
    import { ref } from 'vue';
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
    })
    const employeesTable = ref();
    const employeeTableConfig = ref({
        menuConfig: {
            enableHeader: true,
            defaultMenuHideList: ['search','clearCache','submitApprove', 'resetApprove', 'approve','pageExport', 'advancedExport','moreSettings','clearWhere',],
            menu: {
                add: {
                    title: '提交授权',
                    icon: 'ri-user-add-line',
                    sort: 100,
                    click:() => fn.addAuthItemForEmployee()
                },
            }
        },
        searchConfig: {},
        query: {
            auth_id: props.query.auth_id
        },
        tableConfig: {
            url: apiUrl2.sys.auth.getEmployeeListsByAuthId,
            showCheck: true,
            disablePage: true,
            options:{
                rowSeriesNumber: false
            },
            columns: [
                {field: 'id', title: '员工ID', align: 'left', width: 120},
                {field: 'code', title: '员工号', align: 'left', width: 200},
                {field: 'name', title: '员工姓名', align: 'left', width: 200},
                {field: 'status_text', title: '状态', align: 'left', width: 200},
                {field: 'created_time', title: '创建时间', align: 'left', width: 200},
            ],
            afterLoaded:(res)=>{
                if(res.data.length === 0) {
                    dialog.info('此权限已分配给所有员工');
                }
            },
        },
    })
    const fn = {
        async addAuthItemForEmployee() {
            let employeeIds = tableFn.getCheckedRecords(employeesTable.value.reportConfig).map(i => i.id),authId = props.query.auth_id;
            if(!authId) {
                return dialog.warning('缺少权限ID，无法分配权限');
            }
            if(employeeIds.length === 0) {
                return dialog.warning('请先选择要授权的员工');
            }
            let msg = `您确定要给${employeeIds.length}位员工分配《${props.query.title}》权限吗？`;
            dialog.confirm(msg,async() =>{
                const res = await api.post(apiUrl2.sys.auth.addAuthAssignment,{
                    auth_id: authId,
                    employee_ids: employeeIds
                });
                if(res.count > 0) {
                    dialog.success(`成功为${res.count}位员工分配权限`);
                } else {
                    dialog.info('所选员工均已拥有该权限，无需重复分配');
                }
            });
        },
    }
</script>
<style scoped>
    .employee-list{
        height: 100vh;
    }
</style>