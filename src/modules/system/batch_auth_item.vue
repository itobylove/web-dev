<template>
    <div class="batch-auth-item-container">
        <div class="employees-lists-table">
            <TableComponent v-bind="table.employeeTableConfig"/>
        </div>
        <div class="auth-lists-table">
            <TableComponent ref="authItemTable" v-bind="table.authItemTableConfig"/>
        </div>
    </div>
</template>
<script setup>
    import { ref } from 'vue';
    import TableComponent from '@/core/component/table_v2.vue';
    import apiUrl2 from '@/core/config/url2.js';
    import * as api from "@/core/script/api.js";
    import dialog from "@/core/script/dialog.js";
    import * as tableFn from "@/core/script/tableFn.js";
    import _ from "lodash"
    const authItemTable = ref();
    const employee =ref(null);
    const employeeClickCell = _.debounce((e) =>{
        authItemTable.value.reportConfig.getData({uid:e.id});
        employee.value = e
    },500)
    const table = {
        employeeTableConfig:{
            menuConfig:false,
            searchConfig: {},
            tableConfig: {
                showCheck:'radio',
                url: apiUrl2.sys.auth.getAllEmployeeLists,
                disablePage: true,
                columns: [
                    {field: 'id', title: '员工ID', align: 'left', width:80},
                    {field: 'username', title: '员工号', align: 'left'},
                    {field: 'nickname', title: '员工姓名', align: 'left'},
                ],
                events:{
                    click_cell: ({originData}) => {
                        employeeClickCell(originData)
                    },
                },
            }  
        },
        authItemTableConfig:{
            menuConfig:{
                enableHeader: true,
                defaultMenuHideList: ['search','clearCache','submitApprove', 'resetApprove', 'approve','pageExport', 'advancedExport','moreSettings','clearWhere',],
                menu: {
                    add: {
                        title: '提交授权',
                        icon: 'ri-map-pin-add-line',
                        sort: 100,
                        click:() => fn.addAuthItem()
                    },
                }
            },
            searchConfig: {},
            tableConfig: {
                showCheck:true,
                url: apiUrl2.sys.auth.getMenuLists,
                disablePage: true,
                columns: [
                    {field: 'id', title: '权限ID', align: 'left', width: 80},
                    {field: 'name', title: '权限名称', align: 'left', width: 200},
                    {field: 'title', title: '描述', align: 'left'},
                ]
            } 
        }
    };
    const fn = {
        addAuthItem(){
            if(employee.value == null){
                dialog.warning('请选择一位员工');
                return;
            }
            let employeesIds = tableFn.getCheckedRecords(authItemTable.value.reportConfig).map(i => i.id);
            let msg = `您确定要对员工《${employee.value.nickname}》的权限进行批量操作吗？`;
            dialog.confirm(msg,async()=>{
                const ret = await api.post(apiUrl2.sys.auth.operateAuth,{
                    employeesIds,
                    uid:employee.value.id
                });
                if(ret.result){
                    dialog.success('操作成功');
                }else{
                    dialog.error('操作失败');
                }
            });
        }
    }
</script>
<style scoped>
    .batch-auth-item-container{
        height: 100%;
        display: flex;
        gap: 3px;
        .employees-lists-table{
            width: 40%;
        }
        .auth-lists-table{
            flex: 1;
        }
    }
</style>