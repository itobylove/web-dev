<template>
  <div :class="['mainPage','page-'+mainReportConfig.tableConfig.tableId]">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-col span="11" >
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
        </t-col>
      </t-form>
    </dialogComponent>
    <t-tabs v-if="mainReportShow" :default-value="1" class="page-tabs" @change="handleTabChange">
      <t-tab-panel :value="1" label="参数" >
        <parameterPage :template="vData.template"  />
      </t-tab-panel>
      <t-tab-panel :value="2" label="设备" >
        <equipmentPage :template="vData.template" />
      </t-tab-panel>
    </t-tabs>
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
import siyi from "@/core/script/siyi.js";
import parameterPage from "@/modules/mes/report_template_parameter.vue";
import equipmentPage from "@/modules/mes/report_template_equipment.vue";

const props = defineProps({
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  selectOptions: {status:[],type:[]},
  ...props.query,
  template:{},
})

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache', 'submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      add: {sort: 650, title: '新增模板' , icon: 'ri-add-line', click: () => fn.addTemplate()},
      edit: {sort: 651, title: '修改模板', icon: 'ri-edit-line', click: () => fn.editTemplate()},
      del: {sort: 652, title: '删除模板', icon: 'ri-delete-bin-2-line', click: () => fn.delTemplate()},
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
    url: apiUrl.mes.report_template.list,
    showCheck: true,
    disablePage: false,
    events: {
      click_cell: ({originData}) => {//双击单元格
        if (originData?.index === undefined) return;//索引为undefined的行不处理
        vData.template=originData;
      }
    },
  }
}

const fn = {
  addTemplate: () => {
    dialogConfig.data = {status:1};
    dialogConfig.bind.title = '新增模板';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
  },
  editTemplate: () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (checkedRows?.length > 1) return dialog.warning('只能编辑一条数据');
    dialogConfig.bind.title = '修改模板';
    dialogConfig.type = 'edit';
    Object.assign(dialogConfig.data, JSON.parse(JSON.stringify(checkedRows[0])))
    dialogConfig.isShow = true
  },
  delTemplate: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.mes.report_template.del, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  }
}
const dialogConfig = reactive({
  isShow:false,
  data: {},
  rules:{
    code: [{required: true, message: '请输入模板编码', trigger: 'change'},],
    name: [{required: true, message: '请输入模板名称', trigger: 'change'},],
    type: [{required: true, message: '请选择模板类型', trigger: 'change'},],
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
    const res = await api.post(apiUrl.mes.report_template[dialogConfig.type], dialogConfig.data);
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
const handleTabChange = (value) => {
  if (!vData.template?.id) return;
  vData.template = { ...vData.template, tab: value };
}
onMounted( () => {
  siyi.navHide = true; // 隐藏导航栏
  api.get(apiUrl.mes.report_template.config).then(res => {
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

.page-tabs{
  flex: 0 1 100%;
  display: flex;
  flex-direction: column;
}

.page-tabs :deep(.t-tabs__content) {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.page-tabs :deep(.t-tab-panel) {
  flex: 1;
}

</style>

