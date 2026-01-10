<template>
  <div class="siyi-report-list">
    <div id="table" ref="tableRef"  style="width: 100%;height:100%;"></div>
    <vxe-modal  v-model="detailModal.data.isShow" v-bind="detailModal.bind" v-on="detailModal.on">
      <template #title>
        {{detailModal.data.title}}
      </template>
      <template #default>
        <vxe-grid v-bind="modalTable.bind()"><template #toolbar_buttons ></template></vxe-grid>
        <vxe-grid v-bind="modalTable2.bind()"><template #toolbar_buttons ></template></vxe-grid>
      </template>
    </vxe-modal>
  </div>
</template>
<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref, shallowReactive, shallowRef} from "vue"
import * as core from "@/core/script/core.js"
import {getCurrentPage, http} from "@/core/script/api.js"
import {getQuery} from "@/core/script/nav.js"
import {getUserPlantList} from '@/utils/erp.js'
import VtableOptions from "@/core/script/tableOptions.js"
import _ from "lodash";
import * as VTable from '@visactor/vtable';
import {InputEditor} from "@visactor/vtable-editors";
import {gridOptions as gridOptionsDefault} from "@/config/vxeTable.js";
import {getOptionsLabel, isEmpty, isNumber, parseNumber} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

// 接口URL
const api = {
  list: '/v1/report/{type}/list',
  detail: '/v1/report/{type}/detail',
  save: '/v1/report/{type}/save',
};

//默认数据
const defaultData={
  typeList:['po-item'],
  params:{
    plant_id: [], //工厂ID
    type:'po-item',
    search: '',//搜索关键字
    customer_code: '',//客户代码
    partNum: '',//料号
    status: 0,//状态
    currentPage: 1,//当前页
    pageSize: 100,//每页多少条
    statusAction: undefined,
  }
};

//页面数据
const vData = reactive({
  params:{...defaultData.params},
  list:[],
  msg:'',
  listLabel: {},
  listOption: {},
  itemLabel: {},
  statusTheme:['default','success'],
});

//弹出层
const detailModal = reactive({
  data: {
    tableName:'',
    action: 'view',
    isReadonly: true,
    isShow: false,
    title: '查看',
  },
  bind: {
    className:'detailModal',
    size: "mini",
    width: 760,
    height:'80%',
    position: "center",
    loading: false,
    resize: 'resize',
    escClosable:true,
  },
  on: {
    show: (e) => {
      let modalHeight = e.$modal.getBox().clientHeight;
      if(modalHeight>=window.innerHeight){
        modalHeight=window.innerHeight;
        detailModal.bind.height=modalHeight;
      }
      detailModal.bind.position={};
      detailModal.bind.position.top=(window.innerHeight-modalHeight)/2;
      detailModal.bind.position.left=document.querySelector('.siyi .left')?.clientWidth+150;
      detailModal.bind.width=window.innerWidth-detailModal.bind.position.left-200;
    }
  },
  getTable: (tableName) => {
    return modalTable
  },
  open:async (action,params={},tableName='table')=>{
    console.log('open');
    detailModal.data={...detailModal.data,action,tableName};
    detailModal.getTable(tableName)?.onShow(params);
    const loading=dialog.loading(tableRef.value,'加载中。。。',);
    await detailModal.getTable(tableName)[action](params);
    loading.close()
    detailModal.data.isShow=true;
  },
  close:(callback)=>{
    detailModal.data.isShow=false;
    detailModal.getTable()?.onClose();
    callback && callback();
  },
  view: async (params) => {
    if (params === undefined) {
      return;
    }
    const loading = dialog.loading(document.getElementsByClassName('detailModal')?.[0],'正在加载数据，请稍等！');
    let apiUrl=api.detail.replace('{type}',vData.params.type);
    let res = await http.get(apiUrl, {params})
    loading.close();
    if (res.data.code !== 20000) {
      dialog.error(res.data.message)
      return;
    }
    detailModal.data.isReadonly = true;
    return res.data.data;
  },
});

const modalTable = reactive({
  data: [],
  bind: ()=>{
    return {
      ...gridOptionsDefault,
      minHeight:'',
      maxHeight:'80%',
      id: 'model-detail',
      columns: [
        { type: 'seq',field:'seq',width: 70 },
        { field: 'plantName',title:'工厂',visible: false},
        { field: 'supplierName',title:'供应商',visible: false},
        { field: 'supplierCode',title:'供应商代码',visible: false },
        { field: 'supplierNameNick', title:'供应商简称',visible: false},
        { field: 'sn_order', title:'外协单号'},
        // { field: 'type', title:'外协类型',formatter:({row})=>row['type']==='SO'?'订单外协':row['sct_name']},
        { field: 'partNum',title:'型号',width: 140},
        { field: 'partRev',title:'版本',width: 80},
        // { field: 'pcspnl',title:'PCS/PNL',width: 80},
        { field: 'qty',title:'采购数量',visible: false},
        { field: 'qty_Reconciled',title:'产出数量',visible: false},
        { field: 'qtyFree_Reconciled',title:'赠品数量',visible: false},
        { field: 'qtyPcsReturned',title:'退回PCS',visible: false},
        { field: 'qtyPcsStocked',title:'入库PCS',visible: false},
        { field: 'qtyPcsScrapped',title:'报废PCS',visible: false},
        { field: 'qty_Invoiced',title:'对账数量',visible: false},
        { field: 'qtyReceivedNum',title:'计价数量'},
        { field: 'ut_name',title:'送货单位'},
        { field: 'priceInTax',title:'单价',formatter:({cellValue})=>cellValue*1},
        { field: 'moneyAll',title:'计价金额',formatter:({row})=>(parseNumber(row['qtyReceivedNum'])*parseNumber(row.priceInTax)).toFixed(5)},
        { field: 'itemNote',title:'备注'},
        { field: 'createTimeStr',title:'建单时间'},
        { field: 'date_orderStr',title:'采购时间',visible: false},
        { field: 'suppliersId',title:'供应商ID',visible: false},
        { field: 'jobId',title:'jobId',visible: false},
        { field: 'id',title:'ID',visible: false},
      ],
      showFooter:true,
      footerData:[
        {seq: '合计',
          qty: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qty), 0),
          qty_Reconciled: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qty_Reconciled), 0),
          qtyFree_Reconciled: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qtyFree_Reconciled), 0),
          qtyPcsReturned: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qtyPcsReturned), 0),
          qtyPcsStocked: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qtyPcsStocked), 0),
          qtyPcsScrapped: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qtyPcsScrapped), 0),
          qty_Invoiced: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qty_Invoiced), 0),
          qtyReceivedNum: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qtyReceivedNum), 0),
          moneyAll: modalTable.data.reduce((acc, obj) => acc + parseNumber(obj?.qtyReceivedNum) * parseNumber(obj?.priceInTax), 0).toFixed(2),
        },
      ],
      data: modalTable.data,
    }
  },
  onShow:({})=>{
    modalTable.data = [];
  },
  onClose:()=>{
    modalTable.data = [];//重置数据
  },
  view:async ({jobId,suppliersId,supplierName,partNum,partRev,qtySum,moneySum,moneyAddSum})=>{
    console.log('view');
    detailModal.data.title=supplierName+"\t"+partNum+" "+partRev+"\t"+"总数："+qtySum+"\t总金额："+moneySum.toFixed(2)+"\t已付："+moneyAddSum;
    const {list1,list2}=await detailModal.view({jobId,suppliersId});
    modalTable.data = list1;
    modalTable2.data = list2;
  }
});

const modalTable2 = reactive({
  data: [],
  bind: ()=>{
    return {
      ...gridOptionsDefault,
      minHeight:'',
      id: 'model-detail2',
      columns: [
        { type: 'seq',field:'seq', width: 70 },
        { field: 'sn_order',title:'外协单号'},
        { field: 'partNum',title:'型号'},
        { field: 'partRev',title:'版本'},
        { field: 'name',title:'费用项目'},
        { field: 'amount',title:'费用金额'},
        { field: 'createTimeStr',title:'建单时间'},
      ],
      showFooter:true,
      footerData:[
        {seq: '合计',
          amount: modalTable2.data.reduce((acc, obj) => acc + parseNumber(obj?.amount), 0),
        },
      ],
      data: modalTable2.data,
    }
  },
});

//列配置
const tableConfig = {
  option:{
    columns: [
      {title: '工厂', width: 120, field: 'plantName', "mergeCell": false},
      {title: '供应商', width: 120, field: 'supplierNick', "mergeCell": false,},
      // {title: '供应商代码', width: 150, field: 'supplierCode', "mergeCell": false,},
      // {title:'类型',width: 120, field: 'type'},
      {title: '型号', width: 160, field: 'partNum', "mergeCell": false,},
      {title: '版本', width: 100, field: 'partRev',},
      {
        title: '计价数量', width: 180, field: 'qtyReceivedNumSum', style: {textAlign: 'right'}, aggregation: {
          aggregationType: VTable.TYPES.AggregationType.SUM,
          formatFun(value) {
            return "合计:\t" + Math.round(value);
          }
        },
      },
      {
        title: '计价金额（元）', width: 180, field: 'moneySum',fieldFormat:({moneySum})=>moneySum?parseNumber(moneySum).toFixed(2):'', style: {textAlign: 'right'}, aggregation: {
          aggregationType: VTable.TYPES.AggregationType.SUM,
          formatFun(value) {
            return "合计:\t" + value?Math.round(value):'';
          }
        },
      },
      {title: '退费标准(元)', width: 180, field: 'moneySumMin', style: {textAlign: 'right'}, editor: 'input-editor'},
      {title: '是否达标', width: 140, field: 'isFree',fieldOptions:{true:"是",false:"",'TRUE':"是","FALSE":"否"}, fieldFormat: (({isFree,}) => isFree ? '是' : '')},
      {
        title: '已付（元）', width: 140, field: 'moneyAddSum', style: {textAlign: 'right'}, aggregation: {
          aggregationType: VTable.TYPES.AggregationType.SUM,
          formatFun(value) {
            return "合计:\t" + Math.round(value);
          }
        },
        cellType: 'text',
      },
      {title: '已退', width: 100, field: 'isFreed',fieldOptions:{true:"是",false:""},cellType: 'checkbox'},
      {title: '备注', minWidth: 200, field: 'remark', editor: 'input-editor'},
    ],
    menu: {
      contextMenuItems: [
        {text: '刷新', menuKey: 'refresh'},
        {text: '清空搜索条件', menuKey: 'clearFilter'},
        {text: '清空单元格', menuKey: 'clearCell'},
        {text: '复制', menuKey: 'copy'},
        {text: '粘贴', menuKey: 'paste'},
        {text: '导出', menuKey: 'export'},
      ],
    },
    rowSeriesNumber: {
      title: '#',
      width: 'auto',
      headerStyle: {
        fontSize: 12,
        color: '#6b6b6b',
        bgColor: '#f3f3f3',
        textAlign: 'center',
      },
      style: {
        textAlign: 'center',
      }
    },
  },
  field:{
    supplierName:{lang:'chinese'},
    qtySum:{type:'number'},
    moneySum:{type:'number'},
    moneySumMin:{type:'number',isEdit:true},
    remark:{type:'text',isEdit:true},
    moneyAddSum:{type:'number'},
  }
};

//默认配置
const tableDefault=shallowReactive({
  column:{style:{textAlign:'center'},headerStyle:{textAlign:'center'},sort: true,headerIcon: 'filter'},
  filter:{
    lastFiled:'',
    vNode:undefined,
    children:[],
    values:{},
    options:{},
  }
});

const tableRef=ref();
const tableInstance=shallowRef();
const tableData=shallowReactive({
  option:{},
  filter: {}
});

const tableEvent= {
  init: function(){
    VTable.register.editor('input-editor', new InputEditor());
    tableInstance.value= new VTable.ListTable(tableRef.value,tableData.option);
    tableInstance.value.on('icon_click', this.filterIconClick);
    tableInstance.value.on('change_cell_value', this.cell_change);
    tableInstance.value.on('checkbox_state_change', this.checkbox_change);
    tableInstance.value.on('dropdown_menu_click', this.dropdown_menu_click);
    tableInstance.value.on('dblclick_cell', this.dblclick_cell);
  },
  reset:()=>{
    tableData.option={...VtableOptions,...tableConfig.option,records:[...vData.list]};
    tableData.option.columns=tableData.option.columns.map(column=>{return {...tableDefault.column,...column}});
    tableData.filter={...tableDefault.filter};
    if(tableInstance.value===undefined){
      tableEvent.init();
    }else{
      tableInstance.value.updateOption(tableData.option);
      tableInstance.value.renderWithRecreateCells();
    }
  },
  filterIconClick: function({col, row, name}) {
    if (!['filter','filtered'].includes(name)) {
      return ;
    }
    const fieldName = tableInstance.value.getHeaderField(col, row); //获取列名
    if (tableData.filter.lastFiled=== fieldName) {
      tableEvent.filterRemove();
      return ;
    }
    const headerPosition = tableInstance.value.getCellRelativeRect(col, row); // 获取单元格在表格可视范围内的位置（左上角）
    tableEvent.filterCreate(fieldName, headerPosition);
    tableData.filter.lastFiled= fieldName;
  },
  filterCreate:function(fieldName,headerPosition){
    console.log('filterCreate');
    let filterValue = tableData.filter.values?.[fieldName];
    let filterOptions = tableData.filter.options?.[fieldName] || [];
    let fieldConfig = tableConfig.field?.[fieldName] || {};
    fieldConfig.type = fieldConfig.type || 'text'; // text/number/boolean/date/datetime
    if(fieldConfig.type==='text'){
      tableData.filter.children.push(tableEvent.filterCreateText(fieldName,headerPosition,filterValue,fieldConfig));
      tableData.filter.children.push(tableEvent.filterCreateSelect(fieldName,headerPosition,filterValue,fieldConfig,filterOptions));
    }else if(fieldConfig.type==='number'){
      tableData.filter.children.push(tableEvent.filterCreateBetween(fieldName,headerPosition,filterValue,fieldConfig));
    }
    let div= document.createElement('div');
    div.setAttribute('id','table-filter');
    div.addEventListener('mouseleave',tableEvent.filterRemove)
    tableData.filter.children.map((target)=>{
      div.appendChild(target);
    })
    tableRef.value.appendChild(div);
  },
  filterCreateText:(fieldName,headerPosition,filterValue,{lang})=>{
    let input= document.createElement('input');
    input.setAttribute('data-filter', 'text');
    input.setAttribute('data-field', fieldName);
    input.setAttribute('type','text');
    input.setAttribute('name', 'search');
    input.setAttribute('value', filterValue?.search || '');
    input.setAttribute('autocomplete','off');
    input.style.position = 'absolute';
    input.style.top = headerPosition.top + headerPosition.height + 'px';
    input.style.left = headerPosition.left + 'px';
    input.style.width = headerPosition.width + 'px';
    input.style.height = headerPosition.height + 'px';
    input.addEventListener(lang==='chinese'?'compositionend':'keyup',tableEvent.filterChange);
    input.addEventListener('change',tableEvent.filterChange);
    return input;
  },
  filterCreateBetween:(fieldName,headerPosition,filterValue,{lang})=>{
    let input1= document.createElement('input');
    input1.setAttribute('data-filter', 'between');
    input1.setAttribute('data-field', fieldName);
    input1.setAttribute('name', 'start');
    input1.setAttribute('value', filterValue?.between_start || '');
    input1.setAttribute('type', 'number');
    input1.setAttribute('autocomplete','off');
    input1.style.position = 'absolute';
    input1.style.top = headerPosition.top + headerPosition.height + 'px';
    input1.style.left = headerPosition.left + 'px';
    input1.style.width = headerPosition.width/2 + 'px';
    input1.style.height = headerPosition.height + 'px';
    input1.addEventListener(lang==='chinese'?'compositionend':'keyup',tableEvent.filterChange);
    input1.addEventListener('change',tableEvent.filterChange);

    let input2= document.createElement('input');
    input2.setAttribute('data-filter', 'between');
    input2.setAttribute('data-field', fieldName);
    input2.setAttribute('name', 'end');
    input2.setAttribute('value', filterValue?.between_end || '');
    input2.setAttribute('type', 'number');
    input2.setAttribute('autocomplete','off');
    input2.style.position = 'absolute';
    input2.style.top = headerPosition.top + headerPosition.height + 'px';
    input2.style.left = headerPosition.left + headerPosition.width/2 + 'px';
    input2.style.width = headerPosition.width/2 + 'px';
    input2.style.height = headerPosition.height + 'px';
    input2.addEventListener(lang==='chinese'?'compositionend':'keyup',tableEvent.filterChange);
    input2.addEventListener('change',tableEvent.filterChange);
    let div= document.createElement('div');
    div.appendChild(input1);
    div.appendChild(input2);
    return div;
  },
  filterCreateSelect:(fieldName,headerPosition,filterValue,{lang},options)=>{
    if(options?.length===0){
      options=[...new Set(tableData.option.records.map((item) => {
        return typeof item?.[fieldName]==='boolean'?(item?.[fieldName]?'是':'否'):item?.[fieldName];
      }))];
      options=lang==='chinese'?options.sort((a, b) => a.localeCompare(b, 'zh')):options.sort();
      tableData.filter.options[fieldName]=options=["（不限）",...options];
    }
    let selectValue=filterValue?.select;
    let select =document.createElement('select');
    select.innerHTML = options.map(item => `<option value="${item}" ${item === selectValue ? 'selected' : ''}>${item}</option>`).join('');
    // select.setAttribute('multiple','multiple');
    select.setAttribute('name', 'select');
    select.setAttribute('data-filter', 'select');
    select.setAttribute('data-field', fieldName);
    select.style.position = 'absolute';
    select.style.padding = '4px';
    select.style.boxSizing = 'border-box';
    select.style.top = headerPosition.top + headerPosition.height*2 + 'px';
    select.style.left = headerPosition.left + 'px';
    select.style.width = headerPosition.width + 'px';
    select.style.height = headerPosition.height + 'px';
    select.addEventListener('change',tableEvent.filterChange);
    return select;
  },
  filterChange:(e)=>{
    let target=e?.target;
    let filter=target.getAttribute('data-filter');
    let field=target.getAttribute('data-field');
    let name = target.name;
    let value = target.value;
    let filterValue=tableData.filter.values?.[field]?.[filter] || {};
    if(filter==='between'){
      filterValue[name]=parseNumber(value);
    }else{
      filterValue=value;
    }
    tableData.filter.values[field] ={...(tableData.filter.values?.[field] || {}),[filter]:filterValue};
    if((filter==='select' && value==='（不限）')
        || (filter==='text' && value==='')
        || filter==='between' &&  isEmpty(tableData.filter.values[field][filter]?.['start']) && isEmpty(tableData.filter.values[field][filter]?.['end'])){
      delete tableData.filter.values[field];
    }
    let filterFields=[];//过滤的列
    tableData.option.records=[];
    for (const row of vData.list) {
      let isPass=true;
      for (const field in tableData.filter.values) {
        let cellValue=row[field]; //单元格的值
        let filterValues=tableData.filter.values[field]; //列的过滤条件
        for (const filterName in filterValues) {
          let filterValue=filterValues[filterName]; // 过滤条件的值
          switch (filterName) {
            case 'select':
              isPass= _.isArray(filterValue) ? filterValue.includes(cellValue) :
                  (["是","否"].includes(filterValue)?(cellValue===(filterValue === '是')):cellValue === filterValue)
              break;
            case 'text':
              isPass= cellValue.includes(filterValue);
              break;
            case 'between':
              let number=parseNumber(cellValue);
              isPass= number >= filterValue?.start && (isEmpty(filterValue?.end) || number <= filterValue?.end);
              break;
          }
          if(!isPass){
            filterFields.includes(field) || filterFields.push(field);
            break;
          }
        }
        if(!isPass) break;
      }
      isPass && tableData.option.records.push(row);
    }
    // 不足50，填充空格
    if(tableData.option.records.length<50){
      tableData.option.records=[...tableData.option.records,...Array(100-tableData.option.records.length).fill({})];
    }
    tableData.option.columns.forEach(col => {
      col.headerIcon=filterFields.includes(col.field)?'filtered':'filter';
    });
    tableInstance.value.updateOption(tableData.option);
  },
  filterRemove:function() {
    tableData.filter.lastFiled= null;
    tableData.filter.children=[];
    const filterDom=document.getElementById('table-filter');
    filterDom && tableRef.value.removeChild(filterDom);
  },
  filterClear:function (){
    let hasFiltered=false;
    tableData.option.columns.forEach(col => {
      col?.headerIcon === 'filtered' && (hasFiltered=true);
    });
    hasFiltered &&  tableEvent.reset();
  },
  setConfig: async (record, row) => {
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
    const apiUrl = api.save.replace('{type}', vData.params.type);
    const res = await http.post(apiUrl, post);
    if (res.data.code !== 20000) dialog.error(res.data?.message || '保存失败！');
    return res.data.code === 20000;
  },
  checkbox_change:({field,checked,originData,row})=>{
    if(field==='isFreed'){
      let record={...originData,isFreed:checked};
      tableInstance.value.updateRecords(record,row);
      tableEvent.setConfig(record,row)
    }
  },
  cell_change:async ({rawValue,changedValue,col,row})=>{
    if(rawValue===changedValue){
      return ;
    }
    const record=tableInstance.value.getRecordByCell(col, row); //根据单元格获取行数据
    const field = tableInstance.value.getHeaderField(col, row); //获取列名
    let fieldConfig = tableConfig.field?.[field] || {};
    let change={[field]:changedValue}; //改变的值
    if(!fieldConfig?.isEdit){
      return ;
    }
    if(fieldConfig?.type==='number' && !isNumber(changedValue) && changedValue!==''){
      tableInstance.value.changeCellValue(col, row,rawValue);//恢复到原始值
      dialog.error('请输入数字');
      return ;
    }
    if(field==='moneySumMin'){ //更新isFree
      change.isFree= changedValue && changedValue<=record.moneySum;
    }
    const res=await tableEvent.setConfig({...record,...change},row)
    if (!res){
      tableInstance.value.changeCellValue(col, row,rawValue);
    }else if (change.isFree!==undefined && change.isFree!==record.isFree){
      const colNum=tableInstance.value.getTableIndexByField('isFree');
      tableInstance.value.changeCellValue(colNum, row,change.isFree?'是':'');
    }
    tableInstance.value.renderWithRecreateCells();
  },
  dblclick_cell:(e)=>{
    if(['moneySumMin','remark'].includes(e.field)) return ;
    detailModal.open('view',e.originData,e.field==='moneyAddSum'?'poItemAdd':'poItem');
  },
  dropdown_menu_click: async ({menuKey})=>{
    console.log('dropdown_menu_click',menuKey);
    switch (menuKey){
      case 'refresh':{
        tableInstance.value.setRecords([]);
        await searchList();
        break;
      }
      case 'clearFilter':{
        tableEvent.filterClear();
        break;
      }
      case 'clearCell':{
        // 清空单元格
        const selectedCells = tableInstance.value.getSelectedCellInfos();
        selectedCells.forEach(cells=>{
          cells.forEach(cell=>{
            let fieldConfig = tableConfig.field?.[cell.field] || {};
            if(cell.dataValue!=='' && fieldConfig?.isEdit){
              tableInstance.value.changeCellValue(cell.col,cell.row,'');
            }
          })
        })
        break;
      }
      case 'copy':{
        const selectedCells = tableInstance.value.getSelectedCellInfos();
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
        const selectedCells = tableInstance.value.getSelectedCellInfos();
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
              tableInstance.value.changeCellValue(cell.col, cell.row, newValue);
            }
          })
        })
        break;
      }
      case 'export': {
        const records = [...tableInstance.value.records];
        // tableData.option.columns.map((field)=>{
        //   if(["isFree","isFreed"].includes(field.field)){
        //     records.map((record)=>{
        //       if(typeof field.options!=='undefined' && typeof field.options[record[field.field]]!=='undefined'){
        //         record[field.field]=field.options[record[field.field]];
        //       }
        //       return record;
        //     })
        //   }
        // })
        core.files.exportExcel({data: records, columns: tableData.option.columns, fileName: '外协计数报表'})
      }
    }
  },
}
//搜索
const searchList = async (type = 'init', param = {}) => {
  vData.params = {...vData.params, ...param, currentPage: getCurrentPage(type, vData.params, vData.list.length)};
  type === 'reset' && (vData.params = {...defaultData.params});
  vData.list = []
  const loading = dialog.loading(tableRef.value,'数据加载中，请稍等！');
  const apiUrl = api.list.replace('{type}', vData.params.type);
  let res = await http.get(apiUrl, {params: vData.params});
  loading.close();
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  vData.list = res.data.data.list;
  vData.listOption = res.data.data?.option?.list;
  vData.listLabel = getOptionsLabel(vData.listOption);
  vData.itemLabel = getOptionsLabel(res.data.data?.option?.item)
  tableEvent.reset();
}


// 首次挂载
onMounted(async () => {
  let {type} = getQuery();
  vData.params.type = defaultData.typeList.includes(type) ? type : defaultData.typeList[0];
  const userPlantList = getUserPlantList('report/' + vData.params.type + '/list-'); //用户的工厂
  vData.params.plant_id = userPlantList?.length ? userPlantList.map(item => item.value) : '';
  await searchList()
})

// 页面显示时
onActivated(() => {
  let {type} = getQuery();
  if (type !== vData.params.type) {
    vData.params.type = defaultData.typeList.includes(type) ? type : defaultData.typeList[0];
    searchList();
  }
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})

</script>

<style>
.siyi-report-list {
  width: 100%;
  height: 100%;
  position: absolute;

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .header {
    line-height: 35px;

    .list-action {
      margin-right: 20px;
    }

    .search-select {
      width: 140px;
    }
  }

  .vxe-modal--content .vxe-grid:first-child {
    .vxe-table--main-wrapper {
      min-height: 200px;
    }
  }

}
</style>