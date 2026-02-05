<template>
    <div class="container">
        <div class="employees-lists-table">
            <TableComponent ref="employeeTable" v-bind="table.employeeTableConfig"/>
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
    import _ from "lodash";
    const employeeTable = ref();
    const table = {
        employeeTableConfig:{
            menuConfig:{
                enableHeader: true,
                defaultMenuHideList: ['search','clearCache','submitApprove', 'resetApprove', 'approve','pageExport', 'advancedExport','moreSettings','clearWhere',],
                menu: {
                    add: {
                        title: '确定提交',
                        icon: 'ri-map-pin-add-line',
                        sort: 100,
                        click:() => fn.batchCancelAuthItem()
                    },
                }
            },
            searchConfig: {},
            tableConfig: {
                showCheck:true,
                url: apiUrl2.sys.auth.getAllEmployeeLists,
                disablePage: true,
                columns: [
                    {field: 'id', title: '员工ID', align: 'left', width:80},
                    {field: 'username', title: '员工号', align: 'left'},
                    {field: 'nickname', title: '员工姓名', align: 'left'},
                ],
            } 
        }
    };
    const fn = {
        batchCancelAuthItem(){
            const uids = tableFn.getCheckedRecords(employeeTable.value.reportConfig).map(i => i.id);
            if(uids.length == 0){
                dialog.warning('请至少选择一个员工');
                return;
            }
            let msg = `您确定要批量取消选中的（${uids.length}）位员工的权限吗？`;
            dialog.confirm(msg, async ()=>{
                const res = await api.post(apiUrl2.sys.auth.batchCancelAuthItem,{
                    uids
                });
                if(res.count >= 0) {
                    dialog.success('操作成功');
                } else {
                    dialog.error('操作失败');
                }
            })
        }
    }
</script>
<style scoped>
    .container{
        display: flex;
        height: 100%;
        .employees-lists-table{
            flex: 1;
        }
    }
</style>