<template>
  <div>
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-row><t-col :span="11" >
          <t-form-item label="上级分类" name="parentId">
            <t-select v-model="dialogConfig.data.pid" :options="vData.selectOptions.pid"/>
          </t-form-item>
          <t-form-item label="编码" name="code">
            <t-input v-model="dialogConfig.data.code" />
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="dialogConfig.data.name" />
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select v-model="dialogConfig.data.type" :options="vData.selectOptions.type"/>
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


const props = defineProps({
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  selectOptions: {status:[],type:[],pid:[]},
  ...props.query
})

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      add: {sort: 650, title: '新增分类' , icon: 'ri-add-line', click: () => fn.addCategory()},
      edit: {sort: 651, title: '修改分类', icon: 'ri-edit-line', click: () => fn.editCategory()},
      del: {sort: 652, title: '删除分类', icon: 'ri-delete-bin-2-line', click: () => fn.delCategory()},
    },
  },
  searchConfig: {
    search: [
      {type: 'input', field: 'code', options: {placeholder: '编码'}},
      {type: 'input', field: 'name', options: {placeholder: '名称'}},
      {type: 'select', field: 'type', options: {multiple:false,placeholder: '类型',style:{width:'160px'}, options: vData.selectOptions.type}},
      {type: 'select', field: 'status', options: {multiple:false,placeholder: '状态',style:{width:'160px'}, options: vData.selectOptions.status}},
    ],
  },
  tableConfig: {
    url: apiUrl.sys.category.list,
    showCheck: true,
    disablePage: false,
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        await fn.editCategory([originData]);
      },
    }
  }
}

const fn = {
  addCategory: () => {
    dialogConfig.data = {status:1};
    dialogConfig.bind.title = '新增分类';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
  },
  editCategory: (rows ) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (checkedRows?.length > 1) return dialog.warning('只能编辑一条数据');
    dialogConfig.bind.title = '修改分类';
    dialogConfig.type = 'edit';
    Object.assign(dialogConfig.data, JSON.parse(JSON.stringify(checkedRows[0])))
    dialogConfig.isShow = true
  },
  delCategory: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.sys.category.del, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  },

}
const dialogConfig = reactive({
  isShow:false,
  data: {},
  rules:{
    code: [{required: true, message: '请输入分类编码', trigger: 'change'},],
    name: [{required: true, message: '请输入分类名称', trigger: 'change'},],
    type: [{required: true, message: '请选择类型', trigger: 'change'},],
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

  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(apiUrl.sys.category[dialogConfig.type], dialogConfig.data);
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
  api.get(apiUrl.sys.category.config).then(res => {
    vData.selectOptions = getOptionsLabel(res?.option);
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const searchFields = ['status', 'type','pid'];
    searchFields.forEach(field => {
      const searchItem = mainReportConfig.searchConfig.search.find(item => item.field === field);
      if (searchItem) searchItem.options.options = vData.selectOptions[field] || [];
    });
    mainReportShow.value = true;
  });
});

</script>


