<template>
  <div>
    <TableComponent ref="report" :menu :search  :tableConfig :dblclickCell="()=>null" :events="tableEvent.bind()" :onLoaded="tableEvent.init"/>
  </div>
</template>
<script setup>
import TableComponent from '@/core/component/table.vue'
import dialog from "@/core/script/dialog.js";
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import * as api from "@/core/script/api.js"
import * as VTable from '@visactor/vtable';
import {isNumber, parseNumber} from "@/utils/vars.js";
import {InputEditor} from "@visactor/vtable-editors";
import * as core from "@/core/script/core.js";
import apiUrl from "@/core/config/url.js";
import moneyDetail from './money_detail.v250606.vue'

//表格事件

const tableEvent= {
  tableOptions:{},
  bind:function(){
    return {
      change_cell_value:tableEvent.cell_change,
      checkbox_state_change:tableEvent.checkbox_change,
      dropdown_menu_click:tableEvent.dropdown_menu_click,
      dblclick_cell:tableEvent.dblclick_cell,
      click_cell:tableEvent.click_cell
    }
  },
  init: function(tableOptions){
    VTable.register.editor('input-editor', new InputEditor());
    tableEvent.tableOptions=tableOptions;
  },
  click_cell:async function ({row}){

    const radioCol=tableEvent.tableOptions.table.getTableIndexByField('check');
    tableEvent.tableOptions.table.setCellRadioState(radioCol,row);
  },
  showDetail: async function() {
    const rowIndex=tableEvent.tableOptions.table.getRadioState('check');
    if(rowIndex===undefined){
      return ;
    }
    const record=tableEvent.tableOptions.table.getRecordByCell(0,rowIndex);
    dialog.window(moneyDetail,{param:record},{title:tableEvent.getDetailTitle(record),width:'80%',height:'80%'})
  },
  getDetailTitle:({supplierName, partNum, partRev, qtySum, moneySum, moneyAddSum})=>{
    return supplierName + "\t" + partNum + " " + partRev + "\t" + "总数：" + qtySum + "\t总金额：" + moneySum.toFixed(2) + "\t已付：" + moneyAddSum;
  },
  saveData: async function (record,row,field) {
    const post = {
      supplier_id: record.suppliersId,
      job_id: record.jobId,
      plant_id: record.plantsId,
      supplier_code: record.supplierCode,
      supplier_name: record.supplierName,
      job_num: record.partNum,
      job_rev: record.partRev,
      money_min: record.moneySumMin,
      is_free: record.isFreed?1:0,
      remark: record.remark
    };
    const res=await api.post(apiUrl.outwork.money.save, post);
    if(res){
      // 更新筛选数据
      for (const item of tableEvent.tableOptions.data) {
        if (item['_key'] === record['_key']) {
          item[field] = record[field];
          break; // 找到后退出循环
        }
      }
      searchRef.value.dataFilter()
    }
    return res;
  },
  checkbox_change:function ({field,checked,originData,row}){
    if(field==='isFreed'){
      let record={...originData,isFreed:checked};
      tableEvent.tableOptions.table.updateRecords(record,row);
      tableEvent.saveData(record,row,field)
    }
  },
  cell_change:async function({rawValue,changedValue,col,row}){
    if(rawValue===changedValue){
      return ;
    }
    const record=tableEvent.tableOptions.table.getRecordByCell(col, row); //根据单元格获取行数据
    const field = tableEvent.tableOptions.table.getHeaderField(col, row); //获取列名
    let fieldConfig = tableConfig.field?.[field] || {};
    let change={[field]:changedValue}; //改变的值
    if(!fieldConfig?.isEdit){
      return ;
    }
    if(record?.supplierCode===undefined){
      //没有数据的行
      tableEvent.tableOptions.table.changeCellValue(col, row,rawValue);//恢复到原始值
      return ;
    }
    if(fieldConfig?.type==='number' && !isNumber(changedValue) && changedValue!==''){
      tableEvent.tableOptions.table.changeCellValue(col, row,rawValue);//恢复到原始值
      dialog.error('请输入数字');
      return ;
    }
    if(field==='moneySumMin'){ //更新isFree
      change.isFree= changedValue && changedValue<=record.moneySum;
    }
    const res=await tableEvent.saveData({...record,...change},row,field)
    if (!res){
      tableEvent.tableOptions.table.changeCellValue(col, row,rawValue);
      return ;
    }else if (change.isFree!==undefined && change.isFree!==record.isFree){
      const colNum=tableEvent.tableOptions.table.getTableIndexByField('isFree');
      tableEvent.tableOptions.table.changeCellValue(colNum, row,change.isFree?'是':'');
    }
    tableEvent.tableOptions.table.renderWithRecreateCells();
  },
  dblclick_cell:(e)=>{
    if(['moneySumMin','remark'].includes(e.field)) return ;
    dialog.window(moneyDetail,{param:e.originData},{title:tableEvent.getDetailTitle(e.originData),width:'80%',height:'80%'})
  },
  dropdown_menu_click: async function ({menuKey}){
    console.log('dropdown_menu_click',menuKey);
    switch (menuKey){
      case 'showDetail':{
        await tableEvent.showDetail();
        break;
      }
      case 'refresh':{
        tableEvent.tableOptions.table.setRecords([]);
        tableEvent.tableOptions.getData()
        break;
      }
      case 'clearCell':{
        // 清空单元格
        const selectedCells = tableEvent.tableOptions.table.getSelectedCellInfos();
        selectedCells.forEach(cells=>{
          cells.forEach(cell=>{
            let fieldConfig = tableConfig.field?.[cell.field] || {};
            if(cell.dataValue!=='' && fieldConfig?.isEdit){
              tableEvent.tableOptions.table.changeCellValue(cell.col,cell.row,'');
            }
          })
        })
        break;
      }
      case 'copy':{
        const selectedCells = tableEvent.tableOptions.table.getSelectedCellInfos();
        let selectValue=[];
        selectedCells.forEach(cells => {
          cells.forEach(cell => {
            selectValue.push(cell.dataValue);
          })
        })
        if(selectValue.length<1){
          return ;
        }
        try {
          await navigator.clipboard.writeText(selectValue.join('\n'));
        } catch (e) {
          dialog.error('复制失败' + e.msg);
        }
        break;
      }
      case 'paste': {
        const copyData = await navigator.clipboard.readText();
        const copyTable = copyData.split(/\r\n|\r|\n/g).map(item => item.split('\t'));
        console.log('copyTable', copyTable);
        if (copyTable.length < 1) {
          return;
        }
        const selectedCells = tableEvent.tableOptions.table.getSelectedCellInfos();
        selectedCells.forEach((cells, i) => {
          cells.forEach((cell, j) => {
            let newValue = '';
            let fieldConfig = tableConfig.field?.[cell.field] || {};
            if (copyTable.length === 1 && copyTable[0].length === 1) {
              newValue = copyTable[0][0] || '';
            } else {
              newValue = copyTable?.[i]?.[j] || ''
            }
            if (fieldConfig?.isEdit && cell.dataValue !== newValue) {
              tableEvent.tableOptions.table.changeCellValue(cell.col, cell.row, newValue);
            }
          })
        })
        break;
      }
    }
  },
}


const report = ref()
const menu = {
  showDetail: {title:'显示详情',click:()=>tableEvent.showDetail()},
  pageExport: {options:{disabled:false}},
  advancedExport:{options:{disabled:true}},
  moreSettings: {title:"表格设置",options:{disabled:false}},
}

const search = [
  {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '工厂'}},
  {type: 'select', load: 'supplier', field: 'supplier', options: {placeholder: '供应商'}},
  {type: 'input', field: 'job', options: {placeholder: '型号'}},
]

const tableConfig = {
  url: apiUrl.outwork.money.list,
  columnSplit:'',
  showCheck: true,
  useEncryptionFields:false,
  columns:[
    {title: '工厂', width: 140, field: 'plantName'},
    {title: '供应商', width: 140, field: 'supplierNick'},
    // {title: '供应商代码', width: 150, field: 'supplierCode'},
    // {title:'类型',width: 140, field: 'type'},
    {title: '型号', width: 160, field: 'partNum'},
    {title: '版本', width: 100, field: 'partRev'},
    {title: '计价数量', width: 140, field: 'qtyReceivedNumSum', style: {textAlign: 'right'},sortOrder:'desc'},
    {
      title: '计价金额（元）', width: 140, field: 'moneySum',
      fieldFormat: ({moneySum}) => moneySum ? parseNumber(moneySum).toFixed(2) : '', style: {textAlign: 'right'},
    },
    {
      title: '退费标准(元)', width: 180, field: 'moneySumMin', style: {textAlign: 'right'}, editor: 'input-editor',
    },
    {
      title: '是否达标', width: 140, field: 'isFree',
      fieldOptions: {true: "是", false: "", 'TRUE': "是", "FALSE": "否"},
      fieldFormat: (({isFree}) => isFree ? '是' : ''),
    },
    {
      title: '已付（元）', width: 140, field: 'moneyAddSum', style: {textAlign: 'right'},
      cellType: 'text',
    },
    {
      title: '已退', width: 100, field: 'isFreed', fieldOptions: {true: "是", false: ""}, cellType: 'checkbox',
    },
    {title: '备注', minWidth: 200, field: 'remark', editor: 'input-editor',sort: (a, b, order) => core.data.sort(a, b, order === 'asc'),},
  ],
  menu: {
    contextMenuItems: [
      {text: '明细', menuKey: 'showDetail'},
      {text: '刷新', menuKey: 'refresh'},
      {text: '清空', menuKey: 'clearCell'},
      {text: '复制', menuKey: 'copy'},
      {text: '粘贴', menuKey: 'paste'},
    ],
  },
  bottomFrozenRowCount: 1,
  field:{
    supplierName:{lang:'chinese'},
    qtySum:{type:'number'},
    moneySum:{type:'number'},
    moneySumMin:{type:'number',isEdit:true},
    remark:{type:'text',isEdit:true},
    moneyAddSum:{type:'number'},
  },
}


</script>
<style scoped>
.content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .header {
    background-color: #f3f3f3;
    flex-shrink: 0;

    > .menu {
      border-bottom: 1px solid #e1e4e8;
    }
  }

  > .body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    flex: 1;
    flex-shrink: 0;

    .table {
      width: 100%;
      height: 100%;
      position: relative;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
      }
    }
  }
}
</style>