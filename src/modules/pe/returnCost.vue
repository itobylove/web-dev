<template>
    <div class="box">
        <div class="return-cost-table">
            <TableComponent ref="tableRef" v-bind="table" />
        </div>
    </div>
</template>
<script setup>
import { onMounted, reactive, ref, nextTick } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl2 from '@/core/config/url2.js';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import * as tableFn from "@/core/script/tableFn.js";
import * as VTable from '@visactor/vtable';
import { InputEditor, DateInputEditor } from "@visactor/vtable-editors";
const tableRef = ref(null);
const refobj = reactive({
    created_date: 0,//创建日期
    product_model: '',//型号
    area: 0,//面积
    //钻孔
    stacked_boards_num_before: 0,//修改前叠板数(手动填写)
    stacked_boards_num_after: 0,//修改后叠板数(手动填写)
    drill_time_before: 0,//修改前钻孔时间(手动填写)
    drill_time_after: 0,//修改后钻孔时间(手动填写)
    drill_efficiency_improve_rate: 0,//效率提升
    drill_save_money: 0,//钻孔节省金额
    //利用率
    utilization_rate_before: 0,//修改前利用率(手动填写)
    utilization_rate_after: 0,//修改后利用率(手动填写)
    bom_pp_lists: [],//获取型号bom的板材和pp
    material_price: 0,//材料价格(自动获取板材单价，只获取首次)
    utilization_save_money: 0,//利用率节省金额(（修改后利用率-修改前利用率）*材料价格)
    //加大拼版效率提升
    pnl_area_before: 0,//修改前pnl面积(手动填写)
    pnl_area_after: 0,//修改后pnl面积(手动填写)
    pnl_efficiency_improve_rate: 0,//效率提升(修改后pnl面积/修改前pnl面积)
    pnl_efficiency_money: 0,//效率金额(自动按规则输入)
    pnl_save_money: 0,//节省金额(效率提升*效率金额)
    //铜皮改铜点
    copper_area_before: 0,//双面外层修改前铜面积（dm²）(手动填写)
    copper_area_after: 0,//双面外层修改后铜面积(手动填写)
    copper_thick: 0,//铜厚（um）(手动填写)
    copper_save_weight: 0,//pnl节约铜重(（修改后-修改前）*100*铜厚/10000*8.9)
    copper_price: 0,//单价（抓取铜球价格）
    copper_save_money: 0,//节省价格（修改后铜重-修改前铜重）*单价
})
onMounted(async () => {
    nextTick(() => {
        VTable.register.editor('input-editor', new InputEditor());
        VTable.register.editor('date-input-editor', new DateInputEditor());
    });
    // await api.get(apiUrl2.mes.return_cost.config).then((res) => {//获取表头信息
    //     // tableRef.value.reportConfig.columns = tableFn.createColumns(res.columns, res.table.columnSplit || '#');
    //     // tableRef.value.reportConfig.getData();
    // })

});
const table = {
    menuConfig: {
        enableHeader: true,
        defaultMenuHideList: ['search', 'clearCache', 'submitApprove', 'resetApprove', 'approve', 'pageExport', 'advancedExport', 'moreSettings', 'clearWhere',],
        menu: {
            add: { sort: 151, title: '添加型号', icon: 'ri-add-line', click: () => fn.addModel() },
            update: { sort: 152, title: '更新面积', icon: 'ri-refresh-line', click: () => fn.updateArea() },
        },
    },
    searchConfig: false,
    tableConfig: {
        url: apiUrl2.mes.return_cost.index,
        showCheck: true,
        checkField: false,
        disablePage: true,
        options: {
            heightMode: 'autoHeight',
            defaultRowHeight: 180,
        },
        columns: [
            { field: 'created_date', title: '日期', align: 'left', width: '125px', editor: 'date-input-editor' },
            { field: 'product_model', title: '型号', align: 'left' },
            { field: 'area', title: '面积', align: 'left' },
            { field: 'stacked_boards_num_before', title: '修改前叠板数', align: 'left', editor: 'input-editor' },
            { field: 'stacked_boards_num_after', title: '修改后叠板数', align: 'left', editor: 'input-editor' },
            { field: 'drill_time_before', title: '修改前钻孔时间', align: 'left', editor: 'input-editor' },
            { field: 'drill_time_after', title: '修改后钻孔时间', align: 'left', editor: 'input-editor' },
            { field: 'drill_efficiency_improve_rate', title: '效率提升', align: 'left' },
            { field: 'drill_save_money', title: '钻孔节省金额', align: 'left' },
            {
                field: 'utilization_rate_before', title: '修改前利用率', align: 'left', editor: 'input-editor',
                fieldFormat(args) {
                    if (args?.['utilization_rate_before'] !== undefined && args?.['utilization_rate_before'] !== '' && args?.['utilization_rate_before'] !== null) {
                        return args?.['utilization_rate_before'] + '%';
                    }
                }
            },
            {
                field: 'utilization_rate_after', title: '修改后利用率', align: 'left', editor: 'input-editor',
                fieldFormat(args) {
                    if (args?.['utilization_rate_after'] !== undefined && args?.['utilization_rate_after'] !== '' && args?.['utilization_rate_after'] !== null) {
                        return args?.['utilization_rate_after'] + '%';
                    }
                }
            },
            {
                field: 'bom_pp_lists',
                title: '获取型号bom的板材和pp',
                align: 'left',
                cellType: 'text',
                width: 230,
                customRender(args) {
                    const { dataValue } = args;
                    const elements = [];
                    let top = 2;
                    const left = 15;
                    if (dataValue != undefined) {
                        dataValue.forEach((item, i) => {
                            top += 20;
                            elements.push({
                                type: 'text',
                                fill: 'black',
                                fontSize: 12,
                                textBaseline: 'middle',
                                text: item,
                                x: left + 6,
                                y: top
                            });
                        });
                        return {
                            elements,
                            expectedHeight: top + 20,
                        };
                    }
                }
            },
            { field: 'material_price', title: '材料价格', align: 'left' },
            { field: 'utilization_save_money', title: '利用率节省金额', align: 'left' },
            { field: 'pnl_area_before', title: '修改前pnl面积', align: 'left', editor: 'input-editor' },
            { field: 'pnl_area_after', title: '修改后pnl面积', align: 'left', editor: 'input-editor' },
            { field: 'pnl_efficiency_improve_rate', title: '效率提升', align: 'left' },
            { field: 'pnl_efficiency_money', title: '效率金额', align: 'left', editor: 'input-editor' },
            { field: 'pnl_save_money', title: '节省金额', align: 'left' },
            { field: 'copper_area_before', title: '双面外层修改前铜面积（dm²）', align: 'left', editor: 'input-editor' },
            { field: 'copper_area_after', title: '双面外层修改后铜面积', align: 'left', editor: 'input-editor' },
            { field: 'copper_thick', title: '铜厚（um）', align: 'left', editor: 'input-editor' },
            { field: 'copper_save_weight', title: 'pnl节约铜重(（修改后-修改前）*100*铜厚/10000*8.9)', align: 'left' },
            { field: 'copper_price', title: '单价（抓取铜球价格）', align: 'left' },
            { field: 'copper_save_money', title: '节省价格（修改后铜重-修改前铜重）*单价', align: 'left' },
        ],
        events: {
            change_cell_value: async (e) => {
                if (e.changedValue !== e.currentValue && e.changedValue != '') {
                    const fieldName = tableRef.value.reportConfig.table.getHeaderField(e.col, e.row);//获取列名
                    const record = tableRef.value.reportConfig.table.getRecordByCell(e.col, e.row); //根据单元格获取行数据
                    let updateData = {}
                    //修改日期
                    if (fieldName === 'created_date') {
                        updateData = {
                            id: record.id,
                            created_date: record.created_date,
                        };
                        fn.editData(updateData)
                    }
                    //钻孔模块
                    const drillArr = Array.of('stacked_boards_num_before', 'stacked_boards_num_after', 'drill_time_before', 'drill_time_after');//钻孔模块需要手动输入参数的单元格
                    if (drillArr.includes(fieldName)) {
                        if (Number.isNaN(Number(record.stacked_boards_num_before)) && (record.stacked_boards_num_before !== undefined && record.stacked_boards_num_before !== null && record.stacked_boards_num_before !== '')) { //判断用户输入的是否数字
                            dialog.info('修改前叠板数请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.stacked_boards_num_after)) && (record.stacked_boards_num_after != undefined && record.stacked_boards_num_after !== null && record.stacked_boards_num_after !== '')) { //判断用户输入的是否数字
                            dialog.info('修改后叠板数请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.drill_time_before)) && (record.drill_time_before != undefined && record.drill_time_before !== null && record.drill_time_before !== '')) { //判断用户输入的是否数字
                            dialog.info('修改前钻孔时间请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.drill_time_after)) && (record.drill_time_after != undefined && record.drill_time_after !== null && record.drill_time_after !== '')) { //判断用户输入的是否数字
                            dialog.info('修改后钻孔时间请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if ((record.stacked_boards_num_before !== undefined && record.stacked_boards_num_before !== null && record.stacked_boards_num_before !== '') &&
                            (record.stacked_boards_num_after != undefined && record.stacked_boards_num_after !== null && record.stacked_boards_num_after !== '') &&
                            (record.drill_time_before != undefined && record.drill_time_before !== null && record.drill_time_before !== '') &&
                            (record.drill_time_after != undefined && record.drill_time_after !== null && record.drill_time_after !== '')) {
                            //计算钻孔效率提升率（修改后叠板数/修改前叠板数*修改前钻孔时间/修改后钻孔时间）
                            const rate = (parseInt(record.stacked_boards_num_after) / parseInt(record.stacked_boards_num_before)) * (parseInt(record.drill_time_after) / parseInt(record.drill_time_before))
                            const drillRate = (rate * 100).toFixed(2);
                            tableRef.value.reportConfig.table.changeCellValue(9, e.row, drillRate + '%');
                            const drillSaveMoney = (17 / rate).toFixed(4);
                            tableRef.value.reportConfig.table.changeCellValue(10, e.row, drillSaveMoney);
                            updateData = {
                                id: record.id,
                                stacked_boards_num_before: record.stacked_boards_num_before,
                                stacked_boards_num_after: record.stacked_boards_num_after,
                                drill_time_before: record.drill_time_before,
                                drill_time_after: record.drill_time_after,
                                drill_efficiency_improve_rate: drillRate,
                                drill_save_money: drillSaveMoney
                            };
                            fn.editData(updateData)
                        }

                    }
                    //利用率模块
                    const useRateArr = Array.of('utilization_rate_before', 'utilization_rate_after');//钻孔模块需要手动输入参数的单元格
                    if (useRateArr.includes(fieldName)) {
                        if (Number.isNaN(Number(record.utilization_rate_before)) && (record.utilization_rate_before !== undefined && record.utilization_rate_before !== null && record.utilization_rate_before !== '')) { //判断用户输入的是否数字
                            dialog.info('修改前利用率请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.utilization_rate_before)) && (record.utilization_rate_after !== undefined && record.utilization_rate_after !== null && record.utilization_rate_after !== '')) { //判断用户输入的是否数字
                            dialog.info('修改后利用率请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if ((record.utilization_rate_before !== undefined && record.utilization_rate_before !== null && record.utilization_rate_before !== '') &&
                            (record.utilization_rate_after != undefined && record.utilization_rate_after !== null && record.utilization_rate_after !== '')) {
                            //节省金额（修改后利用率-修改前利用率）* 材料价格
                            const materialPrice = tableRef.value.reportConfig.table.getRecordByCell(13, e.row)?.material_price; //材料价格;
                            const area = tableRef.value.reportConfig.table.getRecordByCell(3, e.row)?.area; //面积;
                            const utilizationSaveMoney = (((Number(record.utilization_rate_after) / 100 - Number(record.utilization_rate_before) / 100)) * materialPrice * area).toFixed(4);
                            tableRef.value.reportConfig.table.changeCellValue(15, e.row, utilizationSaveMoney);
                            //utilization_save_money
                            updateData = {
                                id: record.id,
                                utilization_rate_before: record.utilization_rate_before,
                                utilization_rate_after: record.utilization_rate_after,
                                utilization_save_money: utilizationSaveMoney,
                            };
                            fn.editData(updateData)
                        }

                    }
                    //加大拼版效率提升模块
                    const pnlArr = Array.of('pnl_area_before', 'pnl_area_after', 'pnl_efficiency_money');//钻孔模块需要手动输入参数的单元格
                    if (pnlArr.includes(fieldName)) {
                        if (Number.isNaN(Number(record.pnl_area_before)) && (record.pnl_area_before !== undefined && record.pnl_area_before !== null && record.pnl_area_before !== '')) { //判断用户输入的是否数字
                            dialog.info('修改前pnl面积请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.pnl_area_after)) && (record.pnl_area_after !== undefined && record.pnl_area_after !== null && record.pnl_area_after !== '')) { //判断用户输入的是否数字
                            dialog.info('修改后pnl面积请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.pnl_efficiency_money)) && (record.pnl_efficiency_money !== undefined && record.pnl_efficiency_money !== null && record.pnl_efficiency_money !== '')) { //判断用户输入的是否数字
                            dialog.info('效率金额请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, 104);
                            return;
                        } else {
                            if ((record.pnl_efficiency_improve_rate !== undefined && record.pnl_efficiency_improve_rate !== null && record.pnl_efficiency_improve_rate !== '')) { //判断用户输入的是否数字
                                //pnl_save_money 节省金额
                                const pnlSaveMoney = (Number(record.pnl_efficiency_money) * Number(record.pnl_efficiency_improve_rate.slice(0, -1)) / 100).toFixed(4);
                                tableRef.value.reportConfig.table.changeCellValue(20, e.row, pnlSaveMoney);
                                updateData = {
                                    id: record.id,
                                    pnl_efficiency_money: record.pnl_efficiency_money,
                                    pnl_save_money: pnlSaveMoney,
                                };
                                fn.editData(updateData)
                            }
                        }
                        if ((record.pnl_area_before !== undefined && record.pnl_area_before !== null && record.pnl_area_before !== '') &&
                            (record.pnl_area_after !== undefined && record.pnl_area_after !== null && record.pnl_area_after !== '')) {
                            //效率提升(修改后pnl面积/修改前pnl面积)
                            const pnlRate = Number(record.pnl_area_after) / Number(record.pnl_area_before);
                            const pnlSaveMoney = (Number(record.pnl_efficiency_money) * pnlRate).toFixed(4);
                            const pnlImproveRate = (pnlRate * 100).toFixed(2);
                            tableRef.value.reportConfig.table.changeCellValue(18, e.row, pnlImproveRate + '%');
                            tableRef.value.reportConfig.table.changeCellValue(20, e.row, pnlSaveMoney);
                            updateData = {
                                id: record.id,
                                pnl_area_before: record.pnl_area_before,
                                pnl_area_after: record.pnl_area_after,
                                pnl_efficiency_improve_rate: pnlImproveRate,
                                pnl_save_money: pnlSaveMoney,
                            };
                            fn.editData(updateData)
                        }

                    }
                    //铜皮改铜点模块
                    const copperArr = Array.of('copper_area_before', 'copper_area_after', 'copper_thick');//钻孔模块需要手动输入参数的单元格
                    if (copperArr.includes(fieldName)) {
                        if (Number.isNaN(Number(record.copper_area_before)) && (record.copper_area_before !== undefined && record.copper_area_before !== null && record.copper_area_before !== '')) { //判断用户输入的是否数字
                            dialog.info('修改前铜面积请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.copper_area_after)) && (record.copper_area_after != undefined && record.copper_area_after !== null && record.copper_area_after !== '')) { //判断用户输入的是否数字
                            dialog.info('修改后铜面积请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if (Number.isNaN(Number(record.copper_thick)) && (record.copper_thick != undefined && record.copper_thick !== null && record.copper_thick !== '')) { //判断用户输入的是否数字
                            dialog.info('铜厚请输入数字')
                            tableRef.value.reportConfig.table.changeCellValue(e.col, e.row, '');
                            return;
                        }
                        if ((record.copper_area_before !== undefined && record.copper_area_before !== null && record.copper_area_before !== '') &&
                            (record.copper_area_after != undefined && record.copper_area_after !== null && record.copper_area_after !== '') &&
                            (record.copper_thick != undefined && record.copper_thick !== null && record.copper_thick !== '')) {
                            // pnl节约铜重（修改后-修改前）*100*铜厚/10000*8.9
                            const pnlSaveCopperWeight = ((Number(record.copper_area_after) - Number(record.copper_area_before)) * 100 * Number(record.copper_thick) / 1000 * 8.9).toFixed(4);
                            tableRef.value.reportConfig.table.changeCellValue(24, e.row, pnlSaveCopperWeight)
                            const copperPrice = tableRef.value.reportConfig.table.getRecordByCell(13, e.row)?.copper_price; //铜单价
                            //节省价格（修改后铜重-修改前铜重）*单价
                            const copperSaveMoney = ((Number(record.copper_area_after) - Number(record.copper_area_before)) * copperPrice).toFixed(2);
                            tableRef.value.reportConfig.table.changeCellValue(26, e.row, copperSaveMoney);
                            updateData = {
                                id: record.id,
                                copper_area_before: record.copper_area_before,
                                copper_area_after: record.copper_area_after,
                                copper_thick: record.copper_thick,
                                copper_save_weight: pnlSaveCopperWeight,
                                copper_save_money: copperSaveMoney,
                            };
                            fn.editData(updateData)
                        }
                    }
                }
            }
        }
    }
}
const fn = {
    //添加型号
    addModel() {
        dialog.select(
            [],
            '',
            ((jobId) => {
                api.get(apiUrl2.mes.return_cost.getData, {
                    jobId
                }).then(res => {
                    tableRef.value.reportConfig.getData();
                })
            }),
            '请选择型号',
            {
                select: {
                    style: {
                        width: '250px'
                    },
                    onSearch: async (val, obj) => {
                        //获取型号信息
                        await api.get(apiUrl2.mes.return_cost.getJobInfo, { keyword: val }).then((res) => {
                            obj.select.options = res.job
                        });
                    }
                }
            }
        );
    },
    updateArea() {
        const ids = tableFn.getCheckedRecords(tableRef.value.reportConfig).map(i => i.id);
        if (ids.length === 0) {
            dialog.info('请选择要更新的型号');
            return;
        }
        dialog.confirm('确定要批量更新面积吗？', async () => {
            const loading = dialog.loading();
            const res = await api.post(apiUrl2.mes.return_cost.updateArea, {
                ids
            });
            if (res.ret) {
                dialog.success('更新面积成功');
                tableRef.value.reportConfig.getData({}, true);
            } else {
                dialog.success('面积无新变化');
            }
            loading.close();
        });
    },
    async editData(data) {
        if (data.id === undefined) {
            return
        }
        api.post(apiUrl2.mes.return_cost.editData, { data });
    },
}

</script>
<style scoped>
.box {
    .return-cost-table {
        height: 100%;
    }
}
</style>