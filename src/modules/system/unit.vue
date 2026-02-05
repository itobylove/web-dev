<template>
  <div>
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-row><t-col :span="11" >
          <t-form-item label="ERP单位" name="erp_unit_id">
            <t-select filterable v-model="dialogConfig.data.erp_unit_id" :options="vData.selectOptions.erp_unit_id" clearable @change="dialogConfig.change('erp_unit_id',$event)" />
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
import {onMounted, reactive, ref} from 'vue';
import apiUrl from "@/core/config/url2.js";
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api.js';
import * as tableFn from "@/core/script/tableFn.js";
import DialogComponent from "@/core/component/dialog.vue";
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel} from "@/utils/vars.js";
import * as select from "@/core/config/select.js";

const props = defineProps({
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  selectOptions: {status:[],erp_unit_id:[]},
  ...props.query
})

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      import: {sort: 500, title: '从ERP导入', icon: 'ri-import-line', click: () => fn.importFromErp()},
      add: {sort: 650, title: '新增单位' , icon: 'ri-add-line', click: () => fn.addUnit()},
      edit: {sort: 651, title: '修改单位', icon: 'ri-edit-line', click: () => fn.editUnit()},
      del: {sort: 652, title: '删除单位', icon: 'ri-delete-bin-2-line', click: () => fn.delUnit()},
    },
  },
  searchConfig: {
    search: [
      {type: 'input', field: 'code', options: {placeholder: '编码'}},
      {type: 'input', field: 'name', options: {placeholder: '名称'}},
      {type: 'select', field: 'status', options: {multiple:false,placeholder: '状态',style:{width:'160px'}, options: vData.selectOptions.status}},
    ],
  },
  tableConfig: {
    url: apiUrl.sys.unit.list,
    showCheck: true,
    disablePage: false,
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        await fn.editUnit([originData]);
      },
    }
  }
}

const fn = {
  addUnit: () => {
    dialogConfig.data = {status:1};
    dialogConfig.bind.title = '新增单位';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
  },
  editUnit: (rows ) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (checkedRows?.length > 1) return dialog.warning('只能编辑一条数据');
    dialogConfig.bind.title = '修改单位';
    dialogConfig.type = 'edit';
    Object.assign(dialogConfig.data, JSON.parse(JSON.stringify(checkedRows[0])))
    dialogConfig.isShow = true
  },
  delUnit: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.sys.unit.del, { ids: checkedRows.map(item => item.id) }).then(
      res => {
        if (res) {
          dialog.success('删除成功');
          mainReport.value.reportConfig.getData();
        }
      }
    );
  },
  importFromErp: async () =>{
    const esxiList=mainReport.value.reportConfig.table.options.records.map(item => item?.erp_unit_id).filter(item => item);
    const options = (await select.getOptions('unit','',{showMore:1}))?.map(item=> {return {...item,enable:parseInt(item.enable),value:parseInt(item.value)}}).filter(item => item?.enable && !esxiList.includes(item.value));
    const ids = await dialog.selectAsync([{value:'',label:'全选',checkAll:true},...options],'','请选择要导入的数据', {width:'800px',height:'200px'},{
      multiple: true,placeholder: '请输入名称过滤',clearable:true,minCollapsedNum:10,
    })
    if (!ids) return;
    const loading2 = dialog.loading(undefined, '导入中...');
    const res = await api.post(apiUrl.sys.unit.import, {erp:ids});
    loading2 && loading2.close();
    if (!res?.count) return;
    dialog.success('导入成功'+res.count+'个');
    await mainReport.value.reportConfig.getData();
  }
}
const dialogConfig = reactive({
  isShow:false,
  data: {},
  rules:{
    code: [{required: true, message: '请输入单位编码', trigger: 'change'},],
    name: [{required: true, message: '请输入单位名称', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '50%',
    height: '80%',
    maxHeight:'800px',
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },
  change: async (key,value) => {
    if (key === 'erp_unit_id') {
      const option = vData.selectOptions.erp_unit_id.find(item => item.value === value);
      dialogConfig.data.name =  option?.label || '';
      dialogConfig.data.code = option?.data?.code || '';
      dialogConfig.data.sort = option?.data?.sort || '';
    }
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(apiUrl.sys.unit[dialogConfig.type], dialogConfig.data);
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
  api.get(apiUrl.sys.unit.config).then(res => {
    vData.selectOptions = getOptionsLabel(res?.option);
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const statusSearch = mainReportConfig.searchConfig.search.find(item => item.field === 'status');
    if (statusSearch) statusSearch.options.options = vData.selectOptions.status;
    mainReportShow.value = true;
  });
});

</script>


