<template>
    <div class="auth-item-container">
        <div class="auth-item-lists">
            <TableComponent ref="mainReport" v-bind="mainReportConfig"/>
        </div>
        <div class="auth-item-employees">
            <TableComponent v-if="tableShow" ref="detailListReport" v-bind="authItemEmployeesTableConfig"/>
        </div>
    </div>
</template>
<script setup>
    import { ref,nextTick } from 'vue';
    import TableComponent from '@/core/component/table_v2.vue';
    import apiUrl2 from '@/core/config/url2.js';
    import * as api from "@/core/script/api.js";
    import dialog from "@/core/script/dialog.js";
    import employees from '@/modules/system/employees.vue'
    import copyAuthItem from '@/modules/system/copy_auth_item.vue'
    import * as tableFn from "@/core/script/tableFn.js";
    const mainReport = ref();
    const authItemRow = ref(null);
    const detailListReport = ref(null);
    const tableShow = ref(false);
    const mainReportConfig = ref({
        menuConfig: false,
        searchConfig: {},
        tableConfig: {
            url: apiUrl2.sys.auth.getMenuLists,
            showCheck: true,
            checkField:false,
            disablePage: true,
            columns: [
                {field: 'id', title: 'ID', align: 'left', width: 120},
                {field: 'name', title: '权限名称', align: 'left', width: 200},
                {field: 'title', title: '描述', align: 'left'},
                {field: 'total', title: '使用人数', align: 'left'},
                {field: 'status_text', title: '状态', align: 'left'},
                {field: 'is_auth_text', title: '是否授权', align: 'left', width: 200},            
                {field: 'created_time', title: '创建时间', align: 'center', width: 180, type: 'datetime'},
                {field: 'updated_time', title: '更新时间', align: 'center', width: 180, type: 'datetime'},
            ],
            events:{
                click_cell: ({originData}) => {
                    authItemRow.value = originData
                    detailListReport.value.reportConfig.getData({id: originData.id}, true);
                },
            },
            afterLoaded:()=>{
                if(mainReport.value.reportConfig.data?.length > 0){
                    tableShow.value = true;
                if(mainReport.value.reportConfig.data?.length > 0){
                    authItemRow.value = mainReport.value.reportConfig.data?.[0];
                    nextTick(()=>{
                        detailListReport.value.reportConfig.getData({id: mainReport.value.reportConfig.data?.[0]?.id}, false);
                    })
                    }
                }
            }
        }
    })
    const fn = {
        addAuthItem() {
            if(!authItemRow.value?.id) {
                return dialog.warning('请先选择一个权限');
            }
            dialog.window(
                employees,
                {
                    query:{
                        auth_id:authItemRow.value.id,
                        title:authItemRow.value.title
                    },
                    scene:'auth'
                },
                {
                    title:"权限查询："+authItemRow.value.title,width:'60%',height:'80%'
                })
        },
        cancelAuthItem() {
            if(!authItemRow.value?.id) {
                return dialog.warning('请先选择一个权限');
            }
            let employeeIds = tableFn.getCheckedRecords(detailListReport.value.reportConfig).map(i => i.id);
            if(employeeIds.length === 0) {
                return dialog.warning('请先选择要取消权限的员工');
            }
            dialog.confirm(`您确定要取消所选的${employeeIds.length}位员工的《${authItemRow.value.title}》权限吗？`,async() =>{
                const res = await api.post(apiUrl2.sys.auth.delAuthAssignment,{
                    auth_id: authItemRow.value.id,
                    employee_ids: employeeIds
                });
                if(res.count > 0) {
                    dialog.success(`成功为${res.count}位员工取消权限`);
                    detailListReport.value.reportConfig.getData({id: authItemRow.value.id}, false);
                } else {
                    dialog.info('所选员工均未拥有该权限，无需取消');
                }
            });
        },
        copyAuthItem() {
             if(!authItemRow.value?.id) {
                return dialog.warning('请先选择一个权限');
            }
            dialog.window(
                copyAuthItem,
                {
                    query:{
                        auth_id:authItemRow.value.id,
                        title:authItemRow.value.title,
                    },
                    scene:'auth'
                },
                {
                    title:"复制权限："+authItemRow.value.title,width:'60%',height:'80%'
                })
        },
    }
    const authItemEmployeesTableConfig = ref({
        menuConfig: {
            defaultMenuHideList: ['search','clearCache','submitApprove', 'resetApprove', 'approve','pageExport', 'advancedExport','moreSettings','clearWhere',],
            menu: {
                addAuthItem: {sort: 650, title: '添加权限', icon: 'ri-list-settings-fill', click: () => fn.addAuthItem()},
                cancelAuthItem: {sort: 651, title: '取消权限', icon: 'ri-send-plane-fill', click: () => fn.cancelAuthItem()},
                copyAuthItem: {sort: 651, title: '复制权限', icon: 'ri-send-plane-fill', click: () => fn.copyAuthItem()},                
            },
        },
        searchConfig: false,
        tableConfig:{
            url: apiUrl2.sys.auth.getEmployeeLists,
            showCheck: true,
            disablePage: true,
            columns: [
                {field: 'uid', title: '员工ID', align: 'left', width: 120},
                {field: 'code', title: '员工号', align: 'left', width: 200},
                {field: 'name', title: '员工姓名', align: 'left', width: 200},
            ],
        },
    })
</script>
<style scoped>
    .auth-item-container {
        display: flex;
        gap: 20px;
        .auth-item-lists{
            flex: 1;
        }
        .auth-item-employees{
            width: 30vw;
        }
    }
</style>
