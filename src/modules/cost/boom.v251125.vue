<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBox.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBox.submit" v-bind="editBox.form">
        <t-col span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="editBox.data.plant_id"  :options="plantList"/>
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="editBox.data.name" autofocus/>
          </t-form-item>
          <t-form-item label="代码" name="code">
            <t-input v-model="editBox.data.code" />
          </t-form-item>
          <t-form-item label="ERP类型" name="erp_type">
            <t-select v-model="editBox.data.erp_type" :options="vData.selectOptions.erp_type"/>
          </t-form-item>
          <t-form-item label="排序" name="sort" >
            <t-input-number v-model="editBox.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"  placeholder="数字小靠前" />
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
import {plantList} from "@/utils/erp.js";
import dialog from "@/core/script/dialog.js";

const props = defineProps({
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  selectOptions: {status:[],type:[],erp_type:[]},
  ...props.query
})


const report = ref()

const editBox=reactive({
  isShow:false,
  data:{
    plant_id:vData.plant_id,
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    name: [{required: true, message: '请输入名称', trigger: 'change'},],
    // code: [{required: true, message: '请选择代码', trigger: 'change'},],
    // erp_type: [{required: true, message: '请选择类型', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '50%',
    height: '80%',
    title: "添加"
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.boom.save, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await report.value.reportConfig.getData();
      editBox.close();
    }
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
    editBox.isShow=true;
    editBox.data={
      plant_id:vData.plant_id,
      status:1,
      ...row
    }
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.boom.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
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
    moreSettings:{sort: 90,title:'表格设置'},
  };
}


// 页面初始化
const initTable = async () => {
  const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = await api.get(api.url2.cost.boom.init);
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
      url: api.url2.cost.boom.list,
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

<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
</style>
