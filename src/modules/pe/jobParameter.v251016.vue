<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";

const report = ref()

//页面数据
const vData=reactive({
  plant_id:1,
  processList:[],
  process_ids:[],
  filter:['only_process'],
  routeParameters: [],
  mfgPartParameters:[],
  selectOptions: {type:[],status:[],sp:[],inside:[],feature:[],approveStatus:[],process:[],routeParameters:[],jobParameters:[],jobValue:[],mfgPartParameters:[]},
})

const table = reactive({
  isInit: false,
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
});

const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
    vData.selectOptions.process= vData.processList.filter(process => process.plantIds.length===0 || process.plantIds.includes(value));
    vData.selectOptions.mfgPartParameters=vData.mfgPartParameters.filter(item => item.plantId==value);
    if (report.value){
      report.value.search.updateSearchItem('process',{options:vData.selectOptions.process}); //更新工序下拉框
      report.value.search.updateSearchItem('process',null,'value'); //清空工序值
    }
  },
  processChange: async (value) => {
    vData.process_ids = value;
    let routeParameters=[];
    vData.process_ids.map(process_id => {
      routeParameters=[...routeParameters,...vData.routeParameters?.[process_id] || []]
    })
    vData.selectOptions.routeParameters= routeParameters;
    if ( report.value){
      report.value.search.updateSearchItem('routeParameter',{options:routeParameters}); //更新工艺参数下拉框
      report.value.search.updateSearchItem('routeParameter',null,'value'); //清空工艺参数值
    }
  },
};



const getSearchForm = () => {
  return [
    {type: 'select', field: 'plantId',style: {width: '100px'}, options: {multiple:false,placeholder: '工厂',clearable:false},onChange:tableEvent.plantChange,value: vData.plant_id,load:'factory'},
    {type: 'select', field: 'customerId',style:{width:'160px'}, options: {placeholder: '客户代码'},load: 'customer'},
    {type: 'input', field: 'search',  options: {placeholder: '型号搜索(慢)'}, style: {width: '160px'}},
    {type: 'select', field: 'process',style: {width: '260px'}, options: {placeholder: '工艺',options: vData.selectOptions.process},onChange:tableEvent.processChange,value: vData.process_ids},
    {type: 'select', field: 'routeParameter',style: {width: '320px'},options: {placeholder: '工艺参数',empty:'请选择工艺',options: vData.selectOptions.routeParameters}},
    {type: 'select', field: 'jobParameter',style: {width: '240px'},options: {placeholder: '市场参数',options: vData.selectOptions.jobParameters}},
    {type: 'select', field: 'mfgPartParameter',style: {width: '240px'},options: {placeholder: '工程参数',options: vData.selectOptions.mfgPartParameters}},
    {type: 'select', field: 'jobValue',style: {width: '240px'},options: {placeholder: '型号属性',options: vData.selectOptions.jobValue}},
    {type: 'select', field: 'filter', options: {placeholder: '过滤',style:{width:'240px'},options: vData.selectOptions.filter},value: vData.filter},
    {type: 'select', field: 'inside', options: {multiple:false,placeholder: '部件类型',style:{width:'120px'},options: vData.selectOptions.inside}},
    {type: 'select', field: 'type', options: {placeholder: '批量类型',style:{width:'120px'},options: vData.selectOptions.type}},
    // {type: 'select', field: 'sp', options: {placeholder: '批量',style:{width:'120px'}, options: vData.selectOptions.sp}},
    {type: 'input', field: 'layer', options: {type:"number",maxlength:2,placeholder: '层数(第8-9位)'}},
    {type: 'select', field: 'feature', options: {placeholder: '特征(第10位)',style:{width:'140px'}, options: vData.selectOptions.feature}},
    {type: 'select', field: 'status', options: {placeholder: '建档状态',style:{width:'160px'}, options: vData.selectOptions.status}},
    {type: 'select', field: 'approveStatus', options: {placeholder: '审批状态', style:{width:'180px'},options: vData.selectOptions.approveStatus}},
  ]
}
const getMenus = () => {
  return {
  };
}


// 页面初始化
const initTable = async () => {
  const apiData = await api.get(api.url.pe.jobParameter.init);
  vData.selectOptions = getOptionsLabel(apiData?.option);
  vData.selectOptions.jobParameters= apiData.jobParameters;
  vData.mfgPartParameters= apiData.mfgPartParameters;
  vData.processList= (await api.get(api.url.common.selector, {type: 'process',showMore:true})).map(process => {return {...process,plantIds:
        process.plantIds?.split(',').map(plantId => parseInt(plantId)) || []
  }});
  await tableEvent.plantChange(siyi.user.plantId);
  vData.routeParameters= apiData.routeParameters;
  table.tableConfig = {...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
  table.menu = getMenus();
  table.search = getSearchForm();
  table.isInit = true;
}

const getReportConfig = () => {
  return {
    menuConfig: {
      menu:table.menu,
      defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    },
    searchConfig: {
      search:table.search,
    },
    tableConfig: {
      url: api.url.pe.jobParameter.list,
      showCheck: false,
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
        heightMode:'autoHeight',
      },
      ...table.tableConfig
    },
  }
};


onMounted(() => {
  initTable();
});



</script>

