<template>
  <div ref="box" :class="['mainPage','page-'+table.tableConfig.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBox.on" :title="editBox.title" >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBox.submit" v-bind="editBox.form">
        <t-row> <t-col :span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="editBox.data.plant_id"  :options="plantList"/>
          </t-form-item>

          <t-form-item label="参数" name="parameter_id">
            <t-select v-model="editBox.data.parameter_id" placeholder="要设置规则的参数（需先在参数库新建）"  filterable :options="list2Group(vData.selectOptions.parameter_id)" @change="editBox.change('parameter_id', $event)"/>
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select v-model="editBox.data.type" :options="vData.selectOptions.type" @change="editBox.change('type', $event)"/>
          </t-form-item>
          <t-form-item label="ERP属性" name="erp_attr_name"  v-if="vData.attr_types.includes(editBox.data.type)">
            <t-select v-model="editBox.data.erp_attr_name" :options="editBox.selectOptions.erp_attr_name" filterable @change="editBox.change('erp_attr_name', $event)"/>
          </t-form-item>
          <t-form-item label="ERP工艺" name="erp_process_id"  v-if="editBox.data.type==='erpRouteParams'">
            <t-select v-model="editBox.data.erp_process_id" :options="editBox.selectOptions.erp_process_id" filterable @change="editBox.change('erp_process_id', $event)"/>
          </t-form-item>
          <t-form-item label="规则" name="rules" v-if="!vData.attr_types.includes(editBox.data.type) && !vData.parameter_types.includes(editBox.data.type) ">
            <t-input v-model="editBox.data.rules" />
          </t-form-item>
          <t-form-item label="ERP参数" name="erp_parameter_id"  v-if="vData.parameter_types.includes(editBox.data.type)">
            <t-select v-model="editBox.data.erp_parameter_id" :options="editBox.selectOptions.erp_parameter_id" filterable @change="editBox.change('erp_parameter_id', $event)"/>
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="editBox.data.name" />
          </t-form-item>
          <t-form-item label="编码" name="code">
            <t-input v-model="editBox.data.code" />
          </t-form-item>
          <t-form-item label="分组" name="tag_list">
            <select-input-multiple v-model="editBox.data.tag_list"  :options="vData.selectOptions.tag_list" />
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-input v-model="editBox.data.remark" />
          </t-form-item>
          <t-form-item label="图片" name="description">
            <upload-file v-model="editBox.data.images" acceptType="image" theme="image-flow"/>
          </t-form-item>
          <t-form-item label="详情" name="description">
            <t-textarea  v-model="editBox.data.description" />
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
        </t-col></t-row>
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
import {getOptionsLabel, list2Group} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import {plantList} from "@/utils/erp.js";
import dialog from "@/core/script/dialog.js";
import SelectInputMultiple from "@/core/component/SelectInputMultiple.vue";
import uploadFile from "@/core/component/upload.vue";

const props = defineProps({
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  selectOptions: {status:[],parameter_id:[],tag_list:[],type:[],erpJobAttr:[],erpJobMfgPartAttr:[],erpParams:[],erp_parameter_id:[],erp_attr_name:[],erp_process_id:[]},
  parameter_types:[],
  attr_types:[],
  ...props.query
})


const report = ref()

const editBox=reactive({
  isShow:false,
  title:'添加',
  selectOptions:{erp_parameter_id:[],erp_attr_name:[],erp_process_id:[],parameter_id:[]},
  data:{
    plant_id:vData.plant_id,
    code:'',
    name:'',
    type:'',
    erp_process_id:'',
    erp_parameter_id:'',
    erp_attr_name:'',
    tag_list:[],
    rules:'',
    description:'',
    sort:0,
    status:1
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    parameter_id: [{required: true, message: '请选择参数', trigger: 'change'},],
    erp_attr_name: [{required: true, message: '请选择ERP属性', trigger: 'change'},],
    erp_process_id: [{required: true, message: '请选择ERP工艺', trigger: 'change'},],
    erp_parameter_id: [{required: true, message: '请选择ERP参数', trigger: 'change'},],
    // code: [{required: true, message: '请输入编码', trigger: 'change'},],
    name: [{required: true, message: '请输入名称', trigger: 'change'},],
    type: [{required: true, message: '请选择类型', trigger: 'change'},],
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
    const res = await api.post(api.url2.sys.parameter_rules.save, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await report.value.reportConfig.getData();
      editBox.close();
    }
  },
  change: async (key,value) => {
    if (key === 'type') {
      editBox.data.name='';
      // editBox.data.code='';
      editBox.data.erp_attr_name = '';
      editBox.data.erp_process_id = '';
      editBox.data.erp_parameter_id = '';
      if (vData.parameter_types.includes(value) && vData.selectOptions?.[value]){
        editBox.selectOptions.erp_parameter_id = [...vData.selectOptions[value]];  // ERP参数类
      }else if(vData.attr_types.includes(value) && vData.selectOptions?.[value]){
        editBox.selectOptions.erp_attr_name = [...vData.selectOptions[value]]; // ERP属性类
      }else{
        // 其他
        editBox.selectOptions.erp_parameter_id = [];
        const typeOption = vData.selectOptions.type.find(item => item.value === value);
        const random = Math.floor(Math.random() * 10000);
        editBox.data.name = typeOption.label + random;
        // editBox.data.code = (editBox.data.type + '_' + random);
      }
      if(value==='erpRouteParams'){
        // 工艺参数，单独获取工艺
        editBox.selectOptions.erp_process_id = vData.selectOptions['erp_process_id'].filter(item => item.data.plantsId===editBox.data.plant_id);
      }
    } else if (key === 'erp_process_id') {
      editBox.selectOptions.erp_parameter_id=vData.selectOptions[editBox.data.type].filter(item => item.data.processId === value)
      editBox.data.name='';
      // editBox.data.code='';
    }else if (key === 'erp_parameter_id') {
      const {label: name, value: code} = editBox.selectOptions.erp_parameter_id.find(item => item.value === value) || {label: '', value: ''};
      editBox.data.name =  name;
      // editBox.data.code = (editBox.data.type + '_' + code);
    }else if(key==='erp_attr_name'){
      const {label: name, value: code} = editBox.selectOptions.erp_attr_name.find(item => item.value === value) || {label: '', value: ''};
      editBox.data.name=name;
      // editBox.data.code=(editBox.data.type + '_' + code);
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
    editBox.title=row?.id?'修改':'添加';
    editBox.data={
      plant_id:vData.plant_id,
      status:1,
      ...row
    }
    editBox.data.type && (await editBox.change('type',editBox.data.type));
    editBox.data.erp_process_id &&  (await editBox.change('erp_process_id',editBox.data.erp_process_id));
    editBox.data.erp_attr_name && (await editBox.change('erp_attr_name',editBox.data.erp_attr_name));

  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.sys.parameter_rules.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  }, setAttr: async (attrName, rows) => {
    const post = {};
    if (attrName === 'status') {
      const statusValue = await dialog.selectAsync(vData.selectOptions.status,'','请选择状态', {width:'300px',height:'200px'});
      if (typeof statusValue!=='number') return;
      post.status = statusValue;
    }
    const res = post === {} ? null : await api.post(api.url2.sys.parameter_rules.set, {ids: rows.map(item => item.id), data:post});
    if (!res) return;
    dialog.success('修改成功');
    await report.value.reportConfig.getData();
  }
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
    editStatus: {sort: 651, title: '设置状态', icon: 'ri-edit-line', listAction: (rows)=>tableEvent.setAttr('status',rows)},
    moreSettings:{sort: 90,title:'表格设置'},
  };
}


// 页面初始化
const initTable = async () => {
  const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = await api.get(api.url2.sys.parameter_rules.init);
  loading && loading.close();
  vData.parameter_types=apiData?.parameter_types || [];
  vData.attr_types=apiData?.attr_types || [];
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
      url: api.url2.sys.parameter_rules.list,
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      ...table.tableConfig,
      events:{
        dblclick_cell: async ({originData,field}) => {
          if (!field) return ;
          await tableEvent.showEdit([originData]);
        },
      },
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
