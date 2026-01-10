<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBox.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBox.submit" v-bind="editBox.form">
        <t-col span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="editBox.data.plant_id"  :options="plantList"/>
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select v-model="editBox.data.type" :options="vData.selectOptions.type" empty="请先选择类型"/>
          </t-form-item>
          <t-form-item label="成本类型" name="item_type">
            <t-select v-model="editBox.data.item_type" :options="vData.selectOptions.item_type" @change="editBox.change('item_type',$event)"/>
          </t-form-item>
          <t-form-item label="成本项" name="item_id">
            <t-select v-model="editBox.data.item_id" :options="editBox.selectOptions.item_id" empty="请先选择成本类型"/>
          </t-form-item>
          <t-form-item label="物料" name="boom_id" v-if="['boom','process_dynamic','process_static'].includes(editBox.data.item_type)">
            <t-select v-model="editBox.data.boom_id" :options="vData.selectOptions.boom_id"/>
          </t-form-item>
          <t-form-item label="工序" name="step_id" v-if="['boom','process_dynamic','process_static'].includes(editBox.data.item_type)">
            <t-select v-model="editBox.data.step_id" :options="vData.selectOptions.step_id"/>
          </t-form-item>
          <t-form-item label="工艺" name="process_id" v-if="['boom','process_dynamic','process_static'].includes(editBox.data.item_type)">
            <t-select v-model="editBox.data.process_id" :options="vData.selectOptions.process_id"/>
          </t-form-item>
          <t-form-item label="状态" name="status" >
            <t-select v-model="editBox.data.status" :options="vData.selectOptions.status"/>
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" type="submit">提交</t-button>
          </t-form-item>
        </t-col>
      </t-form>
    </dialogComponent>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import dialogComponent from '@/core/component/dialog.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";
import itemPage from "./item.v251125.vue";
import boomPage from "./boom.v251125.vue";
import ParameterRules from "../system/parameter_rules.vue";
import {plantList} from "@/utils/erp.js";

const report = ref()

//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  selectOptions: {status:[],item_type:[],item_id:[],boom_id:[],process_id:[],step_id:[]},
})


const editBox=reactive({
  isShow:false,
  selectOptions:{},
  data:{
    plant_id:vData.plant_id,
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    item_id: [{required: true, message: '请选择成本项', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{width: '60%', height: '80%', title: "添加"},
  form:{style: {padding: '20px 10px',},
  },
  change: async (key,value) => {
    if (key==='item_type'){
      editBox.selectOptions.item_id = vData.selectOptions.item_id.filter((item) => item.data.type === value);
      editBox.data.item_id=null;
    }
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.config.save, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await report.value.reportConfig.getData();
      editBox.close();
    }
  },
  open: (data) => {
    editBox.isShow=true;
    editBox.data = {...data};
    editBox.selectOptions.item_id = []; // 重置item_id
  },
  close: () => {
    editBox.data={};
    editBox.isShow=false;
  },
  on:{
    afterClose: () => {
      editBox.close();
    }
  }
})


const table = reactive({
  isInit: false,
  tableId:'',
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
});



const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
  },
  showEdit: async (rows) => {
    const row = rows?.[0] || {};
    editBox.open({
      plant_id:vData.plant_id,
      status:1,
      ...row
    })
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.config.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
  showItem: async () => {
    dialog.window(itemPage, {query:{plant_id:vData.plant_id}},{width: '80%',height: '80%',title:"成本项管理"})
  },
  showBoom: async () => {
    dialog.window(boomPage, {query:{plant_id:vData.plant_id}},{width: '80%',height: '80%',title:"boom管理"})
  },
  showParameter: async () => {
    dialog.window(ParameterRules, {query:{plant_id:vData.plant_id}},{width: '80%',height: '80%',title:"参数管理"})
  },
};



const getSearchForm = () => {
  return [
    {type: 'select', field: 'plantId',style: {width: '100px'}, options: {multiple:false,placeholder: '工厂'},onChange:tableEvent.plantChange,value: vData.plant_id,load:'factory'},
    {type: 'select', field: 'status', options: {placeholder: '状态',style:{width:'160px'}, options: vData.selectOptions.status}},
  ]
}
const getMenus = () => {
  return {
    search: {sort: 10},
    add: {title: '添加', click: () => tableEvent.showEdit(), icon: 'ri-add-line', sort: 40},
    edit: {title: '修改', listAction: tableEvent.showEdit, icon: 'ri-edit-line', sort: 50},
    del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-del-line', sort: 60},
    item: {title: '成本项设置', click: () => tableEvent.showItem(), icon: 'ri-settings-line', sort: 70},
    process: {title: 'BOOM设置', click: () => tableEvent.showBoom(), icon: 'ri-menu-line', sort: 80},
    parameter: {title: '参数设置', click: () => tableEvent.showParameter(), icon: 'ri-menu-line', sort: 80},
    moreSettings:{sort: 90,title:'表格设置'},
  };
}


// 页面初始化
const initTable = async () => {
  const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = await api.get(api.url2.cost.config.init);
  loading && loading.close();
  vData.selectOptions = getOptionsLabel(apiData?.option);
  await tableEvent.plantChange(siyi.user.plantId);
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
      url: api.url2.cost.config.list,
      showCheck: true,
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

