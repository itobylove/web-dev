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
    import { ref,nextTick,onMounted } from 'vue';
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
    import {InputEditor} from "@visactor/vtable-editors";
    const mainReport = ref();
    const authItemRow = ref(null);
    const detailListReport = ref(null);
    const tableShow = ref(false);
    onMounted(async() =>{
        VTable.register.editor('input-editor', new InputEditor());
        await api.get(apiUrl2.sys.auth.config).then((res) =>{
            mainReport.value.reportConfig.columns = tableFn.createColumns(res.columns, res.table.columnSplit ||'#');
            mainReport.value.reportConfig.getData();
        })
    });
    const mainReportConfig = {
        menuConfig: {
            enableHeader: true,
            defaultMenuHideList: ['search','clearCache','submitApprove', 'resetApprove', 'approve','pageExport', 'advancedExport','moreSettings','clearWhere',],
            menu: {
                add: {
                    title: '导入权限节点',
                    icon: 'ri-import-line',
                    sort: 100,
                    click:() => fn.importAuthItem()
                },
            }
        },
        searchConfig: {},
        tableConfig: {
            url: apiUrl2.sys.auth.getMenuLists,
            showCheck: 'radio',
            checkField:false,
            disablePage: true,
            events:{
                click_cell: ({originData}) => {
                    clickCellDebounce(originData)
                },
                change_cell_value: async (e) =>{
                    if(e.changedValue !== e.rawValue){
                        const newRow = mainReport.value.reportConfig.options.records[e.row - 1];
                        const res = await api.post(apiUrl2.sys.auth.updateAuthItem,{
                            newRow
                        })
                        if(res?.ret){
                            dialog.success('权限描述修改成功');
                        }else{
                            mainReport.value.reportConfig.table.changeCellValue(e.col,e.row,e.rawValue)
                        }
                    }
                }
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
    }
    const clickCellDebounce = _.debounce((e) =>{
        authItemRow.value = e;
        detailListReport.value.reportConfig.getData({id: e.id}, true);
    },500);
    const updateData = async(id,tableConfig) =>{
        const newRow = await api.get(apiUrl2.sys.auth.getAuthItemDetailsById,{id:id});
        await tableFn.updateRow(tableConfig,newRow); // 更新使用人数
    }
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
                    title:"权限查询："+authItemRow.value.title,width:'60%',height:'80%',
                    onAfterClose:async ()=>{
                        updateData(authItemRow.value.id,mainReport.value.reportConfig)
                        //更新员工表
                        clickCellDebounce(authItemRow.value);
                    }
                }
            )
        },
        cancelAuthItem() {
            if(!authItemRow.value?.id) {
                return dialog.warning('请先选择一个权限');
            }
            let uids = tableFn.getCheckedRecords(detailListReport.value.reportConfig).map(i => i.id);
            if(uids.length === 0) {
                return dialog.warning('请先选择要取消权限的员工');
            }
            dialog.confirm(`您确定要取消所选的${uids.length}位员工的《${authItemRow.value.title}》权限吗？`,async() =>{
                const res = await api.post(apiUrl2.sys.auth.delAuthAssignment,{
                    auth_id: authItemRow.value.id,
                    uids
                });
                if(res.count > 0) {
                    dialog.success(`成功为${res.count}位员工取消权限`);
                    //更新员工表
                    updateData(authItemRow.value.id,mainReport.value.reportConfig);
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
                    title:"复制权限："+authItemRow.value.title,width:'60%',height:'80%',
                    onAfterClose:async()=>{
                        mainReport.value.reportConfig.getData();
                    }
                }
            )
        },
        batchAuthItem(){
            dialog.window(
                batchAuthItem,
                {
                    scene:'auth'
                },
                {
                    title:"批量授权",width:'60%',height:'80%',
                    onAfterClose:async()=>{
                        mainReport.value.reportConfig.getData();
                    }
                }
            )
        },
        batchCancelAuthItem(){
            dialog.window(
                batchCancelAuthItem,
                {
                    scene:'auth'
                },
                {
                    title:"批量取消授权",width:'60%',height:'80%',
                    onAfterClose:async()=>{
                        mainReport.value.reportConfig.getData();
                    }
                }
            )
        },
        async importAuthItem(){
            await api.get(apiUrl2.sys.auth.getMenu).then((res) =>{
                if(res.count > 0){
                    dialog.success(`成功导入${res.count}个新权限节点`);
                    mainReport.value.reportConfig.getData();
                }else{
                    dialog.success(`没有新权限节点可导入`);
                }
            });
        }
    }
    const authItemEmployeesTableConfig = {
        menuConfig: {
            defaultMenuHideList: ['search','clearCache','submitApprove', 'resetApprove', 'approve','pageExport', 'advancedExport','moreSettings','clearWhere',],
            menu: {
                addAuthItem: {sort: 650, title: '添加权限', icon: 'ri-map-pin-add-line', click: () => fn.addAuthItem()},
                cancelAuthItem: {sort: 651, title: '取消权限', icon: 'ri-send-plane-fill', click: () => fn.cancelAuthItem()},
                copyAuthItem: {sort: 651, title: '复制权限', icon: 'ri-file-copy-2-line', click: () => fn.copyAuthItem()},
                batchAuthItem: {sort: 651, title: '批量授权', icon: 'ri-arrow-down-circle-fill', click: () => fn.batchAuthItem()},
                batchCancelAuthItem: {sort: 651, title: '批量取消', icon: 'ri-stack-line', click: () => fn.batchCancelAuthItem()},
            },
        },
        searchConfig: false,
        tableConfig:{
            url: apiUrl2.sys.auth.getEmployeeLists,
            showCheck: true,
            disablePage: true,
            columns: [
                {field: 'uid', title: '员工ID', align: 'left', width: 120},
                {field: 'username', title: '员工号', align: 'left', width: 200},
                {field: 'nickname', title: '员工姓名', align: 'left', width: 200},
            ],
        },
    }
</script>
<style scoped>
    .auth-item-container {
        display: flex;
        gap: 3px;
        .auth-item-lists{
            flex: 1;
        }
        .auth-item-employees{
            width: 30vw;
        }
    }
</style>
