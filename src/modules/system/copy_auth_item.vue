<template>
    <div class="copy-auth-item-container">
        <div class="employee-table">
            <TableComponent v-bind="table.employeeTableConfig"/>
        </div>
        <div class="select-employee-auth-item-lists">
            <TableComponent ref="selectEmployeeAuthItemTable" v-bind="table.selectEmployeeAuthItemTableConfig"/>
        </div>
        <div class="all-employees-table">
            <TableComponent ref="allEmployeeTable" v-bind="table.allEmployeeTableConfig"/>
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
    })
    const selectEmployeeAuthItemTable = ref(null);
    const allEmployeeTable = ref(null);
    const fromUid = ref(0);
    const fromName = ref('');
    const table = reactive({
        //已授权员工列表
        employeeTableConfig: ref({
            menuConfig:false,
            searchConfig: false,
            query: {
                id: props.query.auth_id
            },
            tableConfig: {
                showCheck:'radio',
                url: apiUrl2.sys.auth.getEmployeeLists,
                disablePage: true,
                columns: [
                    {field: 'uid', title: '员工ID', align: 'left'},
                    {field: 'code', title: '员工号', align: 'left'},
                    {field: 'name', title: '员工姓名', align: 'left'},
                ],
                events:{
                    click_cell: ({originData}) => {
                        allEmployeeTable.value.reportConfig.getData({id: originData.uid}, true);
                        selectEmployeeAuthItemTable.value.reportConfig.getData({id: originData.uid}, true);
                        fromUid.value = originData.uid;
                        fromName.value = originData.name;
                    },
                },
            }            
        }),
        //所选员工权限列表
        selectEmployeeAuthItemTableConfig: ref({
            menuConfig:false,
            searchConfig: false,
            tableConfig: {
                showCheck: true,
                url: apiUrl2.sys.auth.getAuthAssignmentByUid,
                disablePage: true,
                columns: [
                    {field: 'remark', title: '权限名称', align: 'left'}
                ],
            },
        }),
        // 所有员工列表
        allEmployeeTableConfig: ref({
            menuConfig: {
                enableHeader: true,
                defaultMenuHideList: ['search','clearCache','submitApprove', 'resetApprove', 'approve','pageExport', 'advancedExport','moreSettings','clearWhere',],
                menu: {
                    add: {
                        title: '提交复制授权',
                        icon: 'ri-user-add-line',
                        sort: 100,
                        click:() => fn.copyAuthItemToEmployee()
                    },
                }
            },
            searchConfig: false,
            tableConfig: {
                showCheck:true,
                url: apiUrl2.sys.auth.getAllEmployeeLists,
                disablePage: true,
                columns: [
                    {field: 'id', title: '员工ID', align: 'left'},
                    {field: 'code', title: '员工号', align: 'left'},
                    {field: 'name', title: '员工姓名', align: 'left'},
                ],
            },
        }),
    })
    const fn = {
         async copyAuthItemToEmployee(){
            if(fromUid.value === 0){
                dialog.warning('请选择要复制权限的员工');
                return;
            }
            let itemAuthIds = tableFn.getCheckedRecords(selectEmployeeAuthItemTable.value.reportConfig).map(i => i.auth_id);
            if(itemAuthIds.length === 0){
                dialog.warning('请选择要复制的权限');
                return;
            }
            let toUids = tableFn.getCheckedRecords(allEmployeeTable.value.reportConfig).map(i => i.id);
            if(toUids.length === 0){
                dialog.warning('请选择要接受复制授权的员工');
                return;
            }
            let msg = `您确定要把员工《${fromName.value}》的权限复制给选中的(${toUids.length})位员工吗？`;
            dialog.confirm(msg,async() =>{
                const res = await api.post(apiUrl2.sys.auth.copyAuthAssignment,{
                    fromUid: fromUid.value,
                    itemAuthIds,
                    toUids
                });
                if(res.count > 0) {
                    dialog.success(`成功为${res.count}位员工复制权限`);
                } else {
                    dialog.info('所选员工均已拥有该权限，无需重复分配');
                }
            });
         }
    }
</script>
<style scoped>
    .copy-auth-item-container {
        display: flex;
        gap: 5px;
        height: 100vh;
        .select-employee-auth-item-lists{
            flex: 1;
        }
        .employee-table{
            flex: 1;
        }
        .all-employees-table{
            flex: 1;
        }
    }
</style>