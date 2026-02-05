<template>
  <div class="mainPage">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-row><t-col :span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="dialogConfig.data.plant_id"  :options="plantList" @change="dialogConfig.change('plant_id',$event)" />
          </t-form-item>
          <t-form-item label="ERP工序" name="erp_step_id">
            <t-select filterable v-model="dialogConfig.data.erp_step_id" :options="dialogConfig.selectOptions.erp_step_id" clearable @change="dialogConfig.change('erp_step_id',$event)" />
          </t-form-item>
          <t-form-item label="编码" name="code">
            <t-input v-model="dialogConfig.data.code" />
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="dialogConfig.data.name" />
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
import {onMounted, reactive, ref, watch} from 'vue';
import apiUrl from "@/core/config/url2.js";
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api.js';
import * as tableFn from "@/core/script/tableFn.js";
import DialogComponent from "@/core/component/dialog.vue";
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel} from "@/utils/vars.js";
import {plantList} from "@/utils/erp.js";
import siyi from "@/core/script/siyi.js";
import * as select from "@/core/config/select.js";

const props = defineProps({
  query:{type:Object,default:{}},
  tableConfig: {type: Object, default: {}},
  menuConfig: {type: Object, default: {}},
  config:{type:Object,default:{}}
});

const emit = defineEmits(['clickCell','afterLoaded'])

//页面数据vData.selectOptions.erp_step_id
const vData=reactive({
  plant_id: siyi.user.plantId,
  selectOptions: {status:[],erp_step_id:[]},
  ...props.query
})

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      import: {sort: 500, title: '从ERP导入', icon: 'ri-import-line', click: () => fn.importFromErp()},
      add: {sort: 650, title: '添加' , icon: 'ri-add-line', click: () => fn.addStep()},
      // edit: {sort: 651, title: '修改', icon: 'ri-edit-line', click: () => fn.editStep()},
      del: {sort: 652, title: '删除', icon: 'ri-delete-bin-2-line', click: () => fn.delStep()},
      list: {title: '管理', click: ()=>fn.showList, icon: 'ri-list-check', sort: 700},
    },
    ...props.menuConfig
  },
  searchConfig: {
    search: [
      {type: 'select', field: 'plant_id',style: {width: '100px'},value: vData.plant_id, options: {multiple:false,placeholder: '工厂'},load:'factory'
        ,onChange: (val) => {vData.plant_id = val;mainReport.value.reportConfig.getData()}},
      {type: 'input', field: 'code', options: {placeholder: '编码'}},
      {type: 'input', field: 'name', options: {placeholder: '名称'}},
    ],
  },
  tableConfig: {
    url: apiUrl.sys.step.list,
    showCheck: true,
    disablePage: true,
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        await fn.editStep([originData]);
      },
      click_cell: async ({originData,field}) => {
        if (!field) return ;
        emit('clickCell', {type: 'step', data: originData});
      }
    },
    ...props.tableConfig,
    afterLoaded:()=>{
      emit('afterLoaded',mainReport.value.reportConfig)
    },
  }
}

const fn = {
  addStep: () => {
    dialogConfig.data = {status:1,plant_id:vData.plant_id};
    dialogConfig.bind.title = '新增工序';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
    dialogConfig.change('plant_id',vData.plant_id);
  },
  editStep: (rows) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (checkedRows?.length > 1) return dialog.warning('只能编辑一条数据');
    dialogConfig.bind.title = '修改工序';
    dialogConfig.type = 'edit';
    Object.assign(dialogConfig.data, JSON.parse(JSON.stringify(checkedRows[0])))
    dialogConfig.isShow = true
  },
  delStep: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.sys.step.del, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  },
  importFromErp: async () =>{
    const loading = dialog.loading(undefined, '请选择...');
    const ids = await dialog.selectAsync([],'','请选择要导入的数据', {width:'800px',height:'200px'},{
      multiple: true,placeholder: '请输入名称过滤',clearable:true,minCollapsedNum:10,
      onSearch:async (val, obj)=>{
        const apiResult= (await select.getOptions('step',val,{showMore:1})).map(item=> {return {...item,plantsId:parseInt(item.plantsId),value:parseInt(item.value)}});
        obj.select.options = [{value:'',label:'全选',checkAll:true},...apiResult.filter(item=> item.plantsId === vData.plant_id)];
      },
    })
    loading.close();
    if (!ids) return;
    const loading2 = dialog.loading(undefined, '导入中...');
    const res = await api.post(apiUrl.sys.step.import, {erp:ids});
    loading2 && loading2.close();
    if (!res?.count) return;
    dialog.success('导入成功'+res.count+'个');
    await mainReport.value.reportConfig.getData();
  }
}
const dialogConfig = reactive({
  isShow:false,
  selectOptions:{erp_step_id:[]},
  data: {},
  rules:{
    code: [{required: true, message: '请输入工序编码', trigger: 'change'},],
    name: [{required: true, message: '请输入工序名称', trigger: 'change'},],
    erp_step_id: [{required: true, message: '请选择ERP工序', trigger: 'change'},],
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
  change: async (key,value) => {
    if (key === 'erp_step_id') {
      const option = dialogConfig.selectOptions.erp_step_id.find(item => item.value === value) || {label: '', value: ''};
      dialogConfig.data.name =  option.label;
      dialogConfig.data.code = option?.data?.code || '';
      dialogConfig.data.sort = option?.data?.sort || '';
    }else if(key === 'plant_id'){
      dialogConfig.selectOptions.erp_step_id = vData.selectOptions.erp_step_id.filter(item => item.data.plantsId === value);
      dialogConfig.data.erp_step_id='';
      dialogConfig.data.name='';
      dialogConfig.data.code='';
      dialogConfig.data.sort='';
    }
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(apiUrl.sys.step[dialogConfig.type], dialogConfig.data);
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
  vData.selectOptions = getOptionsLabel(props.config?.option);
  mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...props.config.table};
  mainReportConfig.tableConfig.columns = tableFn.createColumns(props.config.columns);
  const statusSearch = mainReportConfig.searchConfig.search.find(item => item.field === 'status');
  if (statusSearch) statusSearch.options.options = vData.selectOptions.status;
  mainReportShow.value = true;

  // api.get(apiUrl.sys.step.config).then(res => {
  //   vData.selectOptions = getOptionsLabel(res?.option);
  //   mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
  //   mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
  //   const statusSearch = mainReportConfig.searchConfig.search.find(item => item.field === 'status');
  //   if (statusSearch) statusSearch.options.options = vData.selectOptions.status;
  //   mainReportShow.value = true;
  // });
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

