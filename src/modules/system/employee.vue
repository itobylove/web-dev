<template>
  <div>
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-row><t-col :span="11" >
          <t-form-item label="erp雇员" name="erp_businessman_id">
            <t-select filterable v-model="dialogConfig.data.erp_businessman_id" :options="vData.selectOptions.erp_businessman_id" clearable @clear="fn.clearField('erp_businessman_id')"  @change="fn.handleErpBusinessmanChange" />
          </t-form-item>
          <t-form-item label="工号" name="code">
            <t-input v-model="dialogConfig.data.code" />
          </t-form-item>
          <t-form-item label="姓名" name="name">
            <t-input v-model="dialogConfig.data.name" />
          </t-form-item>
          <t-form-item label="排序" name="sort" >
            <t-input-number v-model="dialogConfig.data.sort" theme="column" style="width: 100%" type="integer" min="0" Employee="1" max="9999"  placeholder="数字小靠前" />
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

const props = defineProps({
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  selectOptions: {status:[],erp_businessman_id:[]},
  ...props.query
})

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      add: {sort: 650, title: '新增人员' , icon: 'ri-add-line', click: () => fn.addEmployee()},
      edit: {sort: 651, title: '修改人员', icon: 'ri-edit-line', click: () => fn.editEmployee()},
      del: {sort: 652, title: '删除人员', icon: 'ri-delete-bin-2-line', click: () => fn.delEmployee()},
    },
  },
  searchConfig: {
    search: [
      {type: 'input', field: 'code', options: {placeholder: '工号'}},
      {type: 'input', field: 'name', options: {placeholder: '姓名'}},
      {type: 'select', field: 'status', options: {multiple:false,placeholder: '状态',style:{width:'160px'}, options: vData.selectOptions.status}},
    ],
  },
  tableConfig: {
    url: apiUrl.sys.employee.list,
    showCheck: true,
    disablePage: false,
  }
}

const fn = {
  addEmployee: () => {
    dialogConfig.data = {status:1};
    dialogConfig.bind.title = '新增人员';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
  },
  editEmployee: () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (checkedRows?.length > 1) return dialog.warning('只能编辑一条数据');
    dialogConfig.bind.title = '修改人员';
    dialogConfig.type = 'edit';
    Object.assign(dialogConfig.data, JSON.parse(JSON.stringify(checkedRows[0])))
    dialogConfig.isShow = true
  },
  delEmployee: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.sys.employee.del, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  },
  clearField:(field) => {
    dialogConfig.data[field] = null;
  },
  handleErpBusinessmanChange: (value) => {
    if (value) {
      const selectedOption = vData.selectOptions.erp_businessman_id.find(option => option.value === value);
      if (selectedOption) {
        const label = selectedOption.label;
        const match = label.match(/^(.+) \((.+)\)$/);
        if (match) {
          // 提取姓名和工号
          dialogConfig.data.name = match[1];
          dialogConfig.data.code = match[2];
        }
      }
    }
  },
}
const dialogConfig = reactive({
  isShow:false,
  data: {},
  rules:{
    code: [{required: true, message: '请输入人员工号', trigger: 'change'},],
    name: [{required: true, message: '请输入人员姓名', trigger: 'change'},],
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
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(apiUrl.sys.employee[dialogConfig.type], dialogConfig.data);
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
  api.get(apiUrl.sys.employee.config).then(res => {
    vData.selectOptions = getOptionsLabel(res?.option);
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const statusSearch = mainReportConfig.searchConfig.search.find(item => item.field === 'status');
    if (statusSearch) statusSearch.options.options = vData.selectOptions.status;
    mainReportShow.value = true;
  });
});

</script>


