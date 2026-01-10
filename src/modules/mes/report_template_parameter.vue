<template>
  <div class="mainPage">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfigP.isShow" v-bind="dialogConfigP.bind"  v-on="dialogConfigP.on"  >
      <t-form :data="dialogConfigP.data" :rules="dialogConfigP.rules" @submit="dialogConfigP.submit" v-bind="dialogConfigP.form">
        <t-col span="11" >
          <t-form-item label="模板" name="template_id" >
            <t-select v-model="dialogConfigP.data.template_id" :options="vData.selectOptions.template_id" />
          </t-form-item>
          <t-form-item label="参数" name="parameter_id" >
            <t-select filterable v-model="dialogConfigP.data.parameter_id" :options="vData.selectOptions.parameter_id"/>
          </t-form-item>
          <t-form-item label="erp参数" name="erp_parameter_id" >
            <t-select filterable v-model="dialogConfigP.data.erp_parameter_id" :options="vData.selectOptions.erp_parameter_id" clearable  @clear="fn.clearField('erp_parameter_id')" />
          </t-form-item>
          <t-form-item label="录入个数" name="number" >
            <t-input-number v-model="dialogConfigP.data.number" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"   />
          </t-form-item>
          <t-form-item label="上公差" name="uptolerance" >
            <t-input-number v-model="dialogConfigP.data.uptolerance" theme="column" style="width: 100%" type="float" min="0" step="0.1" max="9999"   />
          </t-form-item>
          <t-form-item label="上公差单位" name="uptoleranceunit_id" >
            <t-select v-model="dialogConfigP.data.uptoleranceunit_id" :options="vData.selectOptions.uptoleranceunit_id" clearable  @clear="fn.clearField('uptoleranceunit_id')" />
          </t-form-item>
          <t-form-item label="下公差" name="downtolerance" >
            <t-input-number v-model="dialogConfigP.data.downtolerance" theme="column" style="width: 100%" type="float" min="0" step="0.1" max="9999"   />
          </t-form-item>
          <t-form-item label="下公差单位" name="downtoleranceunit_id" >
            <t-select v-model="dialogConfigP.data.downtoleranceunit_id" :options="vData.selectOptions.downtoleranceunit_id" clearable  @clear="fn.clearField('downtoleranceunit_id')" />
          </t-form-item>
          <t-form-item label="类型" name="qc_type" >
            <t-select v-model="dialogConfigP.data.qc_type" :options="vData.selectOptions.qc_type"/>
          </t-form-item>
          <t-form-item label="ERP数据映射" name="erpdatamap_key" >
            <t-input v-model="dialogConfigP.data.erpdatamap_key" />
          </t-form-item>
          <t-form-item label="配置项" name="input_options" >
            <t-textarea v-model="dialogConfigP.data.input_options" :autosize="true" />
          </t-form-item>
          <t-form-item label="计算取值项" name="default_value" >
            <t-input v-model="dialogConfigP.data.default_value" />
          </t-form-item>
          <t-form-item label="标准值" name="standard_value" >
            <t-input v-model="dialogConfigP.data.standard_value" />
          </t-form-item>
          <t-form-item label="条件" name="where" >
            <t-input v-model="dialogConfigP.data.where" />
          </t-form-item>
          <t-form-item label="排序" name="sort" >
            <t-input-number v-model="dialogConfigP.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"  placeholder="数字小靠前" />
          </t-form-item>
          <t-form-item label="状态" name="status" >
            <t-select v-model="dialogConfigP.data.status" :options="vData.selectOptions.status"/>
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-input v-model="dialogConfigP.data.remark" />
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" type="submit">保存</t-button>
          </t-form-item>
        </t-col>
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
import siyi from "@/core/script/siyi.js";

const props = defineProps({
  template: { type: Object, default: () => ({}), required: false },
});

//页面数据
const vData=reactive({
  template_id:null,
  template_name:null,
  selectOptions: {status:[],qc_type:[],template_id:[],parameter_id:[],erp_parameter_id:[],uptoleranceunit_id:[],downtoleranceunit_id:[]},
})
const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['search','clearCache','prevPage','nextPage', 'submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      add: {sort: 650, title: '新增模板参数' , icon: 'ri-add-line', click: () => fn.addTemplateParameter()},
      edit: {sort: 651, title: '修改模板参数', icon: 'ri-edit-line', click: () => fn.editTemplateParameter()},
      del: {sort: 652, title: '删除模板参数', icon: 'ri-delete-bin-2-line', click: () => fn.delTemplateParameter()},
    },
  },
  searchConfig:[],
  tableConfig: {
    url: apiUrl.mes.report_template.parameterList,
    showCheck: true,
    disablePage: true,
    useEncryptionFields: false,
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        await fn.editTemplateParameter([originData]);
      },
    }
  }
}

const fn = {
  addTemplateParameter: () => {
    if (!vData.template_id) {
      return dialog.warning('请选择模板');
    }
    dialogConfigP.data = {status:1,template_id:vData.template_id};
    dialogConfigP.bind.title = '新增模板参数';
    dialogConfigP.type = 'addParameter';
    dialogConfigP.isShow = true;
  },
  editTemplateParameter: async (rows) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length !== 1) return dialog.warning('请勾选一条数据修改');
    const row = checkedRows[0];
    dialogConfigP.bind.title = '修改模板参数';
    dialogConfigP.type = 'editParameter';
    dialogConfigP.data = {...row};
    dialogConfigP.isShow = true
  },
  delTemplateParameter: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.mes.report_template.delParameter, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  },

  clearField:(field) => {
    dialogConfigP.data[field] = null;
  }
}



const dialogConfigP = reactive({
  isShow:false,
  data: {},
  rules:{
    template_id: [{required: true, message: '请选择模板', trigger: 'change'},],
    parameter_id: [{required: true, message: '请选择参数', trigger: 'change'},],
    qc_type: [{required: true, message: '请选择类型', trigger: 'change'},],
    number: [{required: true, message: '请输入数字', trigger: 'change'}, {type: 'number', min: 1, message: '数字必须>=1', trigger: 'change'}],
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
    const res = await api.post(apiUrl.mes.report_template[dialogConfigP.type], dialogConfigP.data);
    loading && loading.close();
    if (res) {
      dialog.success('保存成功');
      dialogConfigP.close();
      await mainReport.value.reportConfig.getData({where:{template_id:vData.template_id}});
    }
  },
  close: () => {
    dialogConfigP.isShow=false;
  },
  on:{
    afterClose: () => {
      dialogConfigP.close();
    }
  }

})

onMounted( () => {
  siyi.navHide = true; // 隐藏导航栏
  api.get(apiUrl.mes.report_template.parameterConfig).then(res => {
    vData.selectOptions = getOptionsLabel(res?.option);
    mainReportConfig.where = {template_id:props.template?.id};
    vData.template_id = props.template?.id;
    vData.template_name = props.template?.name;
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    mainReportShow.value = true;
  });
});
watch(() => [props.template], async () => {
  vData.template_id = props.template.id;
  vData.template_name = props.template.name;
  if(mainReport.value?.reportConfig) mainReport.value.reportConfig.getData({where:{template_id:vData.template_id}});
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


