<template>
  <div ref="box" class="publicReportBox">
    <div class="header">
      <Menu :table="tableOptions" :search="searchRef" :menu="menus"/>
      <Search ref="searchRef" :table="tableOptions" :search="vData.searchForm" :filter/>
    </div>
    <div class="body">
      <div class="table">
        <div ref="tableRef"></div>
      </div>
      <div class="message">{{ vData.msg}}</div>
    </div>
  </div>

</template>


<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import * as api from "@/core/script/api.js"
import _ from "lodash";
import * as VTable from '@visactor/vtable';
import {ListTable} from '@visactor/vtable';
import {isNumber, parseNumber} from "@/utils/vars.js";
import Menu from "@/core/component/menu.vue";
import Search from "@/core/component/search.vue";
import * as listTableFn from "@/core/script/tableFn.js";
import {InputEditor} from "@visactor/vtable-editors";
import * as core from "@/core/script/core.js";
import apiUrl from "@/core/config/url.js";
import moneyDetail from './money_detail.v241217.vue'
import dialog from "@/core/script/dialog.js";


//页面数据
const vData = reactive({
  list:[],
  msg:'',
  statusTheme:['default','success'],
  searchForm: [
    {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '工厂'}},
    {type: 'select', load: 'supplier', field: 'supplier', options: {placeholder: '供应商'}},
    {type: 'input', field: 'job', options: {placeholder: '型号'}},
  ]
});



const searchRef = ref()
const filter = ref({fieldOptions: {options: []}})


const tableRef=ref();
//表格配置
const tableConfig = {
  options:{
    columns: [
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
    bottomFrozenRowCount: 1
  },
  field:{
    supplierName:{lang:'chinese'},
    qtySum:{type:'number'},
    moneySum:{type:'number'},
    moneySumMin:{type:'number',isEdit:true},
    remark:{type:'text',isEdit:true},
    moneyAddSum:{type:'number'},
  },
};
const tableOptions = _.merge({},listTableFn.defaultConfig(),{
  options:{...tableConfig.options},
  disablePage:true,
  dom: tableRef.value,
  url: apiUrl.outwork.money.list,
  async getData(init = false) {

    //第1步: 初始化
    const startTime = Date.now() //记录开始时间
    const loading = dialog.loading(tableRef.value)

    //第2步：加载配置 （只加载一次）
    if(init){
      //第2.0步： 去除多余的列
      tableOptions.options.columns=_.filter(tableOptions.options.columns, item => !_.isEmpty(item?.title));
      //第2.1步： 合并用户的表格基本配置：如分页，冻结列
      const userConfig = await listTableFn.mergeConfig(tableOptions)
      //第2.2步： 合并用户自定的列配置信息
      await listTableFn.mergeColumn(tableOptions, userConfig.columns)
      //第2.3步： 合并默认列配置
      tableOptions.options.columns = tableOptions.options.columns.map(column => ({
        ...column,
        showSort: true, // 显示排序图标，使用自定义排序
        sort: false,    // 禁用内置排序
      }));
      //第2.4步： 初始化本地过滤列
      filter.value.fieldOptions.options = [...tableOptions.options.columns].map(col => ({
        label: col.title,
        value: col.field,
      }));
      //第2.5步：初始化自定义事件
      tableEvent.init();

      //第2.6步：添加选择列
      tableOptions.options.columns.unshift({
        field: 'check',
        dragHeader: false,
        disableColumnResize: true,
        width: 50,
        cellType: 'radio',
        headerStyle: {textAlign: 'center'},
        style: {textAlign: 'center'},
      })

    }
    //第3步:获取数据
    const apiData=await api.get(tableOptions.url,{...searchRef.value.get(), ...tableOptions.search});
    tableOptions.options.records=tableOptions.data=apiData?.['list'] || [];

    //第4步：更新表格
    listTableFn.update(tableOptions)
    //第5步：本地过滤
    searchRef.value.dataFilter()
    //最后完成
    loading.close()
    vData.msg = listTableFn.footerMessage(tableOptions, startTime)
  }
})


//表格事件
const tableEvent= {
  init: function(){
    VTable.register.editor('input-editor', new InputEditor());
    tableOptions.table.on('change_cell_value', this.cell_change);
    tableOptions.table.on('checkbox_state_change', this.checkbox_change);
    tableOptions.table.on('dropdown_menu_click', this.dropdown_menu_click);
    tableOptions.table.on('dblclick_cell', this.dblclick_cell);
    tableOptions.table.on('click_cell', this.click_cell);
  },
  click_cell:async ({row})=>{
    const radioCol=tableOptions.table.getTableIndexByField('check');
    tableOptions.table.setCellRadioState(radioCol,row);
  },
  showDetail: async () => {
    const rowIndex=tableOptions.table.getRadioState('check');
    if(rowIndex===undefined){
      return ;
    }
    const record=tableOptions.table.getRecordByCell(0,rowIndex);
    dialog.window(moneyDetail,{param:record},{title:'详情',width:'80%',height:'80%'})
  },
  saveData: async (record,row,field) => {
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
      for (const item of tableOptions.data) {
        if (item['_key'] === record['_key']) {
          item[field] = record[field];
          break; // 找到后退出循环
        }
      }
      searchRef.value.dataFilter()
    }
    return res;
  },
  checkbox_change:({field,checked,originData,row})=>{
    if(field==='isFreed'){
      let record={...originData,isFreed:checked};
      tableOptions.table.updateRecords(record,row);
      tableEvent.saveData(record,row,field)
    }
  },
  cell_change:async ({rawValue,changedValue,col,row})=>{
    if(rawValue===changedValue){
      return ;
    }
    const record=tableOptions.table.getRecordByCell(col, row); //根据单元格获取行数据
    const field = tableOptions.table.getHeaderField(col, row); //获取列名
    let fieldConfig = tableConfig.field?.[field] || {};
    let change={[field]:changedValue}; //改变的值
    if(!fieldConfig?.isEdit){
      return ;
    }
    if(record?.supplierCode===undefined){
      //没有数据的行
      tableOptions.table.changeCellValue(col, row,rawValue);//恢复到原始值
      return ;
    }
    if(fieldConfig?.type==='number' && !isNumber(changedValue) && changedValue!==''){
      tableOptions.table.changeCellValue(col, row,rawValue);//恢复到原始值
      dialog.warning('请输入数字');
      return ;
    }
    if(field==='moneySumMin'){ //更新isFree
      change.isFree= changedValue && changedValue<=record.moneySum;
    }
    const res=await tableEvent.saveData({...record,...change},row,field)
    if (!res){
      tableOptions.table.changeCellValue(col, row,rawValue);
      return ;
    }else if (change.isFree!==undefined && change.isFree!==record.isFree){
      const colNum=tableOptions.table.getTableIndexByField('isFree');
      tableOptions.table.changeCellValue(colNum, row,change.isFree?'是':'');
    }
    tableOptions.table.renderWithRecreateCells();
  },
  dblclick_cell:(e)=>{
    if(['moneySumMin','remark'].includes(e.field)) return ;
    dialog.window(moneyDetail,{param:e.originData},{title:'详情',width:'80%',height:'80%'})
  },
  dropdown_menu_click: async ({menuKey})=>{
    console.log('dropdown_menu_click',menuKey);
    switch (menuKey){
      case 'showDetail':{
        await tableEvent.showDetail();
        break;
      }
      case 'refresh':{
        tableOptions.table.setRecords([]);
        tableOptions.getData()
        break;
      }
      case 'clearCell':{
        // 清空单元格
        const selectedCells = tableOptions.table.getSelectedCellInfos();
        selectedCells.forEach(cells=>{
          cells.forEach(cell=>{
            let fieldConfig = tableConfig.field?.[cell.field] || {};
            if(cell.dataValue!=='' && fieldConfig?.isEdit){
              tableOptions.table.changeCellValue(cell.col,cell.row,'');
            }
          })
        })
        break;
      }
      case 'copy':{
        const selectedCells = tableOptions.table.getSelectedCellInfos();
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
          dialog.warning('复制失败' + e.msg);
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
        const selectedCells = tableOptions.table.getSelectedCellInfos();
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
              tableOptions.table.changeCellValue(cell.col, cell.row, newValue);
            }
          })
        })
        break;
      }
    }
  },
}

const menus={
  showDetail: {title:'显示详情',click:()=>tableEvent.showDetail()},
  pageExport: {options:{disabled:false}},
  advancedExport:{options:{disabled:true}},
  moreSettings: {title:"表格设置",options:{disabled:false}},
}

// 首次挂载
onMounted(async () => {
  tableOptions.table = new ListTable(tableRef.value, tableOptions.options)
  // await tableOptions.getData(true)
})

// 页面显示时
onActivated(async () => {
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})

</script>

<style>
.publicReportBox {
  width: 100%;
  height: 100%;
  position: absolute;

  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;
  padding: 5px;

  > .header {
    width: 100%;
    border: 1px solid #ddd;
    border-bottom: 0 none;
    border-radius: 5px 5px 0 0;

    > .menuBox {
      border-bottom: 1px solid #ddd;
    }
  }

  > .body {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto 28px;

    > .table {
      width: 100%;
      height: 100%;
      position: relative;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
      }
    }

    > .message {
      width: 100%;
      height: 100%;
      line-height: 28px;
      padding: 0 5px;
      font-size: 12px;
      overflow: hidden;
      border: 1px solid #ddd;
      border-top: 0 none;
      border-radius: 0 0 5px 5px;
    }
  }

}
</style>