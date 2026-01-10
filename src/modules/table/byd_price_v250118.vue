<template>
  <div ref="box" class="publicReportBox">
    <div class="header">
      <Menu :table="tableOptions" :search="searchRef" :menu="menus"/>
      <Search ref="searchRef" :table="tableOptions" :search="vData.searchForm()" :filter/>
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
import _ from "lodash";
import * as VTable from '@visactor/vtable';
import {DateInputEditor, InputEditor, ListEditor} from "@visactor/vtable-editors";
import Menu from "../../core/component/menu.vue";
import Search from "../../core/component/search.vue";
import * as listTableFn from "../../core/script/tableFn.js";
import * as api from "../../core/script/api.js"
import {isEmpty, isNumber} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";


//页面数据
const vData = reactive({
  list:[],
  msg:'',
  statusTheme:['default','success'],
  searchForm: () => {
    return [
      {type: 'input', field: 'custMatCode',filter:true, options: {placeholder: '物料编码'}},
      {type: 'input', field: 'partNumRev',filter:true, options: {placeholder: '本厂编号'}},
    ]
  },
});

const menus={
  // detail: {title:'显示详情',click:()=>tableEvent.detail()},
  pageExport: {options:{disabled:false}},
  advancedExport:{options:{disabled:true}},
  moreSettings: {title:"表格设置",options:{disabled:false}},
}


const searchRef = ref()
const filter = ref({fieldOptions: {options: []}})

/*
const tableHeaderStr='客户代码|事业部|寻源单号|招标具体项目|大竞争+事业部内竞争|客户料号|客户物料号码|我司型号|层数|板厚|铜厚|表面处理|板材|成本|长|宽|拼板数|标的数量|标的平米数|投标未税平米价|投标未税单价|标的总金额|中标情况|中标份额|中标总金额|友商中标价格|投标截止时间|价格有效终止日期|打样时间|打样编号|交样时间|是否批量|批量数量|批量面积|批量金额|项目启动时间|OTS发布时间|OTS截止时间|OTS状态|PPAP发布时间|PPAP截止时间|PPAP状态';
const tableHeaderFields = tableHeaderStr.split('|').filter(item=>item.trim()!=='').map(item=>{
  return {'field':item.trim(),'title':item.trim(),'width':'auto',editor:"input-editor"};
});
console.log(tableHeaderFields);
const list=[
    { field: 'customCode', title: '客户代码', width: 'auto', editor: 'input-editor' },
]
const sql=`create table if not exists table_byd_price (
\tid int primary key auto_increment,
\t${list.map(item=>`${item.field} varchar(255) comment '${item.title}'`).join(',\n\t')}
)`;
console.log(sql);
*/

const _apiUrl=api.url.table.byd_price;
const tableRef=ref();
//表格配置
const tableConfig = {
  options:{
    columns: [
      { field: 'custMatCode', title: '物料编码', width: 'auto',editor:"input-editor",style:{bgColor:'#FF9999'}},
      { field: 'partName', title: '物料描述', width: 'auto',editor:"input-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'rfqNo', title: 'RFQ03069037', width: 'auto',editor:"input-editor"},
      { field: 'oldBidNo', title: '原招标单号', width: 'auto',editor:"input-editor"},
      { field: 'bidType', title: '中标类别', width: 'auto',editor:"input-editor"},
      { field: 'bidPrice', title: '中标平米价', width: 'auto',editor:"number-editor"},
      { field: 'sourceQty', title: '寻源数量', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'sourceArea', title: '寻源面积（㎡）', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'price', title: '报价单价（未税）', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'amount', title: '寻源金额（未税）', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'validFrom', title: '有效期从', width: 'auto',editor:"date-editor"},
      { field: 'validTo', title: '有效期至', width: 'auto',editor:"date-editor"},
      { field: 'length', title: '长', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'width', title: '宽', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'punch', title: '拼', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'singleSize', title: '单只尺寸', width: 'auto',editor:"input-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'layer', title: '层数', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'thickness', title: '板厚', width: 'auto',editor:"number-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'copperThickness', title: '铜厚', width: 'auto',editor:"input-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'surfaceTreatment', title: '表面处理', width: 'auto',editor:"input-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'status', title: '状态', width: 'auto',editor:"list-editor-status",fieldOptions:['','已批量','已打样']},
      { field: 'partNumRev', title: '本厂编号', width: 'auto',editor:"input-editor",style:{bgColor:'#CCFFCC'}},
      { field: 'sampleTime', title: '交样时间', width: 'auto',editor:"date-editor"},
      // { field: 'ots', title: 'OTS', width: 'auto',editor:"input-editor"},
      { field: 'version', title: 'version', width: 'auto',hide:true},
      { field: 'id', title: 'ID', width: 'auto',hide:true},
    ],
    menu: {
      contextMenuItems: [
        {text: '更新', menuKey: 'update'},
        {text: '复制', menuKey: 'copy'},
        {text: '粘贴', menuKey: 'paste'},
        {text: '刷新', menuKey: 'refresh'},
        {text: '清空', menuKey: 'clearCell'},
      ],
    },
    keyboardOptions:{
      moveEditCellOnArrowKeys:true,
      selectAllOnCtrlA:{
        disableHeaderSelect:true, //快捷键全选时，是否禁止选中表头。
        disableRowSeriesNumberSelect:true,  //快捷键全选时，是否禁止选中行序列号。
      },
    },
    bottomFrozenRowCount: 1
  },
};
const tableOptions = _.merge({},listTableFn.defaultConfig(),{
  options:{...tableConfig.options},
  disablePage:true,
  dom: tableRef.value,
  url: _apiUrl.list,
  copyData:[],
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
    VTable.register.editor('number-editor', new InputEditor());
    VTable.register.editor('date-editor', new DateInputEditor());
    tableConfig.options.columns.filter(column=>column?.editor?.startsWith('list-editor')).forEach(column=>{
      VTable.register.editor(column.editor, new ListEditor({ values: column.fieldOptions }));
    })
    tableOptions.table.on('change_cell_value', this.cell_change);
    tableOptions.table.on('checkbox_state_change', this.checkbox_change);
    tableOptions.table.on('dropdown_menu_click', this.dropdown_menu_click);
    tableOptions.table.on('dblclick_cell', this.dblclick_cell);
    tableOptions.table.on('click_cell', this.click_cell);
  },
  detail: async () => {
    const rowIndex=tableOptions.table.getRadioState('check');
    if(rowIndex===undefined){
      return ;
    }
    const record=tableOptions.table.getRecordByCell(0,rowIndex);
    console.log('record',record);
  },
  //批量保存数据
  saveListData:async(records)=>{
    const loading = dialog.loading(tableRef.value)
    const post={list:records.map(({ row, ...rest }) => rest),isMulti:true};
    const result=await api.post(_apiUrl.save, post);
    loading.close();
    if (!result) return false;
    records.forEach(({row},i)=>{
      const res=result?.[i];
      tableOptions.data[row-1]={...tableOptions.data?.[row-1],...res};
      tableOptions.options.records[row-1]={...tableOptions.options.records?.[row-1],...res};
      searchRef.value.dataFilter();
    })
  },
  //保存单条数据
  saveData: async (record,row,field) => {
    // const loading = dialog.loading(tableRef.value)
    const version=tableOptions.data[row-1]?.version;
    const post = {[field]:record[field],id:record.id,version};
    const res=await api.post(_apiUrl.save, post);
    // loading.close();
    if(!res?.id){
      return false;
    }
    // 更新筛选数据
    tableOptions.data[row-1]={...tableOptions.data?.[row-1],...record,...res};
    tableOptions.options.records[row-1]={...tableOptions.options.records?.[row-1],...record,...res};
    searchRef.value.dataFilter();
    // tableOptions.table.renderWithRecreateCells();
    return res;
  },
  refresh:async ()=>{
    tableOptions.table.setRecords([]);
    await tableOptions.getData()
  },
  updateJobInfo:async (idList=[])=>{
    const loading = dialog.loading(tableRef.value)
    const selectedCells = tableOptions.table.getSelectedCellInfos();
    console.log('idList',idList,selectedCells)
    for (const cells of selectedCells) {
      for (const cell of cells) {
        const {col,row,field,dataValue,originData}=cell;
        if(!isEmpty(originData.custMatCode)){
          idList.push(originData.id);
        }
      }
    }
    await api.post(_apiUrl.data,{id:[...new Set(idList)]});
    loading.close();
    return true;
  },
  checkbox_change:({field,checked,originData,row})=>{
    let record={...originData,[field]:checked?1:0};
    tableEvent.saveData(record,row,field)
  },
  cell_change:async ({rawValue,changedValue,col,row})=>{
    if(rawValue===changedValue || (isEmpty(rawValue) && isEmpty(changedValue))){
      return ;
    }
    const record=tableOptions.table.getRecordByCell(col, row); //根据单元格获取行数据
    if(!record?.id && isEmpty(changedValue,[0]) || changedValue==='#N/A'){
      return ;
    }
    const field = tableOptions.table.getHeaderField(col, row); //获取列名
    const column= tableConfig.options.columns.find(column=>column.field===field);//列配置
    let change={[field]:changedValue}; //改变的值
    if(column?.editor==='number-editor' && !isNumber(changedValue)){
      tableOptions.table.changeCellValue(col, row,rawValue);//恢复到原始值
        dialog.error(column.title + '的输入类型应该为数字');
      tableOptions.table.selectCell(col, row);//选中单元格
      return ;
    }
    const res=await tableEvent.saveData({...record,...change},row,field)
    res || tableOptions.table.changeCellValue(col, row,rawValue);
  },
  click_cell:async ({row})=>{
    const radioCol=tableOptions.table.getTableIndexByField('check');
    tableOptions.table.setCellRadioState(radioCol,row);
  },
  dblclick_cell:(e)=>{
    console.log('dblclick_cell',e);
  },
  dropdown_menu_click: async args=>{
    console.log('dropdown_menu_click',args);
    switch (args.menuKey){
      case 'detail':{
        await tableEvent.detail();
        break;
      }
      case 'update':{
        const {id}= tableOptions.table.getRecordByCell(args.col,args.row)
        await tableEvent.updateJobInfo([id]) && await tableEvent.refresh();
        break;
      }
      case 'refresh':{
        await tableEvent.refresh();
        break;
      }
      case 'clearCell':{
        // 清空单元格
        const selectedCells = tableOptions.table.getSelectedCellInfos();
        const updateRows={};
        for (const cells of selectedCells) {
          for (const cell of cells) {
            console.log('cell',cell);
            const {col,row,field,dataValue,originData}=cell;
            if (isEmpty(dataValue,[0])) {
              continue;
            }
            const column= tableConfig.options.columns.find(column=>column.field===field);//列配置
            if(column?.editor){
              updateRows[row]={...updateRows[row],[field]:'',id:originData.id,version:originData.version,row};
            }
          }
        }
        updateRows && await tableEvent.saveListData(Object.values(updateRows));//清空值
        break;
      }
      case 'copy':{
        tableOptions.copyData =  tableOptions.table.getCopyValue();
        try {
          await navigator.clipboard.writeText(tableOptions.copyData);
        } catch (e) {
          dialog.warning('复制失败' + e.msg);
        }
        break;
      }
      case 'paste': {
        const copyData = await navigator.clipboard.readText() || tableOptions.copyData;
        const copyTable = copyData.split(/\r\n|\r|\n/g).map(item => item.split('\t'));
        console.table('copyTable', copyTable);
        if (copyTable.length < 1) {
          return;
        }
        const selectedCells = tableOptions.table.getSelectedCellInfos(); //要粘贴的位置
        const updateRows={};
        selectedCells.forEach((cells, i) => {
          cells.forEach(async ( {field,col,row,dataValue,originData}, j) => {
            let newValue = '';
            const column= tableConfig.options.columns.find(column=>column.field===field);//列配置
            if (copyTable.length === 1 && copyTable[0].length === 1) {
              newValue = copyTable[0][0] || ''; //复制的数据只有1个单元格，所有的行都使用粘贴
            } else {
              newValue = copyTable?.[i]?.[j] || '' //多行多列，取对应的
            }
            if (column?.editor && dataValue !== newValue) {
              updateRows[row]={...updateRows[row],[field]:newValue,id:originData.id,version:originData.version,row};
            }
          })
        })
        updateRows && await tableEvent.saveListData(Object.values(updateRows));//批量更新
        break;
      }
    }
  },
}



// 首次挂载
onMounted(async () => {
  tableOptions.table = new VTable.ListTable(tableRef.value, tableOptions.options)
  await tableOptions.getData(true)
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