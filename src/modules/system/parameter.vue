<template>
  <div ref="box" :class="['mainPage','page-'+mainReportConfig.tableConfig.tableId]">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-row><t-col :span="11" >
          <t-form-item label="ERP参数" name="erp_parameter_id" >
            <t-select v-model="dialogConfig.data.erp_parameter_id" placeholder="请输入ERP参数的名称/编码搜索" filterable clearable :options="dialogConfig.selectOptions.erp_parameter_id"
                      @search="changeDebounce('erp_parameter_search', $event)" @change="dialogConfig.change('erp_parameter_id',$event)" />
          </t-form-item>
          <t-form-item label="参数名称" name="name">
            <t-input v-model="dialogConfig.data.name" />
          </t-form-item>
          <t-form-item label="参数编码" name="code">
            <t-input v-model="dialogConfig.data.code" />
          </t-form-item>
          <t-form-item label="参数分组" name="category">
            <t-input v-model="dialogConfig.data.category" />
          </t-form-item>
          <t-form-item label="页面组件" name="input_type">
            <t-select v-model="dialogConfig.data.input_type" :options="vData.selectOptions.input_type"/>
          </t-form-item>
          <t-form-item label="数据类型" name="value_type">
            <t-select v-model="dialogConfig.data.value_type" filterable clearable :options="vData.selectOptions.value_type"/>
          </t-form-item>
          <t-form-item label="默认值" name="default_value">
            <t-input v-model="dialogConfig.data.default_value" />
          </t-form-item>
          <t-form-item label="单位" name="unit_id">
            <t-select v-model="dialogConfig.data.unit_id" filterable clearable :options="vData.selectOptions.unit_id"/>
          </t-form-item>
          <t-form-item label="排序" name="sort" >
            <t-input-number v-model="dialogConfig.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"  placeholder="数字小靠前" />
          </t-form-item>
          <t-form-item label="状态" name="status" >
            <t-select v-model="dialogConfig.data.status" :options="vData.selectOptions.status"/>
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-input v-model="dialogConfig.data.remark" />
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" type="submit">保存</t-button>
          </t-form-item>
        </t-col></t-row>
      </t-form>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api.js';
import * as tableFn from "@/core/script/tableFn.js";
import DialogComponent from "@/core/component/dialog.vue";
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel} from "@/utils/vars.js";
import * as select from "@/core/config/select.js";
import _ from 'lodash';

const props = defineProps({
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  selectOptions: {status:[],value_type:[],input_type:[],unit_id:[]},
  ...props.query
})

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      import: {sort: 500, title: '从ERP导入', icon: 'ri-import-line', click: () => fn.importFromErp()},
      add: {sort: 650, title: '新增' , icon: 'ri-add-line', click: () => fn.addParameter()},
      edit: {sort: 651, title: '修改', icon: 'ri-edit-line', click: () => fn.editParameter()},
      editCate: {sort: 651, title: '设置分组', icon: 'ri-edit-line', listAction: (rows)=>fn.setAttr('category',rows)},
      editStatus: {sort: 651, title: '设置状态', icon: 'ri-edit-line', listAction: (rows)=>fn.setAttr('status',rows)},
      del: {sort: 652, title: '删除', icon: 'ri-delete-bin-2-line', click: () => fn.delParameter()},
    },
  },
  searchConfig: {
    search: [
      {type: 'input', field: 'code', options: {placeholder: '编码'}},
      {type: 'input', field: 'name', options: {placeholder: '名称'}},
      {type: 'input', field: 'category', options: {placeholder: '分组'}},
      {type: 'select', field: 'type', options: {multiple:false,placeholder: '输入类型', options: vData.selectOptions.type}},
      {type: 'select', field: 'status', options: {multiple:false,placeholder: '状态', options: vData.selectOptions.status}},
    ],
  },
  tableConfig: {
    url: api.url2.sys.parameter.list,
    showCheck: true,
    disablePage: true,
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        await fn.editParameter([originData]);
      },
    }
  }
}

const fn = {
  addParameter: () => {
    dialogConfig.data = {status:1};
    dialogConfig.bind.title = '新增参数';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
  },
  editParameter: (rows) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (checkedRows?.length > 1) return dialog.warning('只能编辑一条数据');
    dialogConfig.bind.title = '修改参数';
    dialogConfig.type = 'edit';
    dialogConfig.data= {...checkedRows[0]};
    dialogConfig.selectOptions.erp_parameter_id = checkedRows[0]['erp_parameter_id']?[{
      label: checkedRows[0]['name'], value: checkedRows[0]['erp_parameter_id']
    }]:[];
    dialogConfig.isShow = true
  },
  delParameter: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(api.url2.sys.parameter.del, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  },
  importFromErp: async () =>{
    const ids = await dialog.selectAsync([],'','请选择要导入的数据', {width:'800px',height:'200px'},{
      multiple: true,placeholder: '请输入名称过滤',clearable:true,minCollapsedNum:10,
      onSearch: (val, obj) => select.getOptions('parameters',val,{showMore:1}).then(res =>
          obj.select.options = [{value:'',label:'全选',checkAll:true},...
              res.map(item=> {return {...item,value:parseInt(item.value)}}).filter(item=>item?.ifActive)
          ])
    })
    if (!ids) return;
    const loading2 = dialog.loading(undefined, '导入中...');
    const res = await api.post(api.url2.sys.parameter.import, {erp:ids});
    loading2 && loading2.close();
    if (!res?.count) return;
    dialog.success('导入成功'+res.count+'个');
    await mainReport.value.reportConfig.getData();
  },
  setAttr: async (attrName, rows) => {
    const post = {};
    if (attrName === 'category') {
      const defaultCategory = rows?.[0]?.['category'] || '';
      const categoryName = await dialog.inputAsync(defaultCategory, '请输入分组名称', {width: '300px'});
      if (typeof categoryName!=='string') return;
      post.category = categoryName;
    }else if (attrName === 'status') {
      const statusValue = await dialog.selectAsync(vData.selectOptions.status,'','请选择状态', {width:'300px',height:'200px'});
      if (typeof statusValue!=='number') return;
      post.status = statusValue;
    }
    const res = post === {} ? null : await api.post(api.url2.sys.parameter.set, {ids: rows.map(item => item.id), data:post});
    if (!res) return;
    dialog.success('修改成功');
    await mainReport.value.reportConfig.getData();
  },
}

const changeDebounce = _.debounce((key, val) => {
  dialogConfig.change(key, val);
}, 500);

const dialogConfig = reactive({
  isShow:false,
  data: {status:1},
  selectOptions:{erp_parameter_id:[]},
  rules:{
    // code: [{required: true, message: '请输入参数编码', trigger: 'change'},],
    name: [{required: true, message: '请输入参数名称', trigger: 'change'},],
    type: [{required: true, message: '请选择参数输入类型', trigger: 'change'},],
    input_type: [{required: true, message: '请选择输入类型', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '50%',
    height: 'auto',
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },
  change: async (field,value) => {
    if (field === 'erp_parameter_search') {
      const options= await select.getOptions('parameters',value,{showMore:1,toNumber:1});
      dialogConfig.selectOptions.erp_parameter_id = options.filter(item=>item?.ifActive);
    }else if (field === 'erp_parameter_id') {
      const paramList= await api.get(api.url2.sys.parameter.getErpParameters, {recId:value})
      if (paramList){
        dialogConfig.data= {...paramList[0],status:typeof dialogConfig.data.status === 'number'?dialogConfig.data.status:1};
      }
    }
   },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.sys.parameter[dialogConfig.type], dialogConfig.data);
    loading && loading.close();
    if (res) {
      dialog.success('保存成功');
      dialogConfig.close();
      await mainReport.value.reportConfig.getData();
    }
  },
  close: () => {
    dialogConfig.isShow=false;
  },
  on:{
    afterClose: () => {
      dialogConfig.close();
    }
  }

})

onMounted( () => {
  api.get(api.url2.sys.parameter.config).then(res => {
    vData.selectOptions = getOptionsLabel(res?.option);
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const searchFields = ['status', 'type'];
    searchFields.forEach(field => {
      const searchItem = mainReportConfig.searchConfig.search.find(item => item.field === field);
      if (searchItem) searchItem.options.options = vData.selectOptions[field] || [];
    });
    mainReportShow.value = true;
  });
});

</script>
<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}
</style>


