<template>
  <div class="mainPage">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfigE.isShow" v-bind="dialogConfigE.bind"  v-on="dialogConfigE.on"  >
      <t-form :data="dialogConfigE.data" :rules="dialogConfigE.rules" @submit="dialogConfigE.submit" v-bind="dialogConfigE.form">
        <t-col span="11" >
          <t-form-item label="模板" name="template_id" >
            <t-select v-model="dialogConfigE.data.template_id" :options="vData.selectOptions.template_id" disabled />
          </t-form-item>
          <t-form-item label="设备" name="equipment_id" >
            <t-select v-model="dialogConfigE.data.equipment_id" :options="vData.selectOptions.equipment_id"  :filterable="dialogConfigE.type === 'addEquipment'" :multiple="dialogConfigE.type === 'addEquipment'" :disabled="dialogConfigE.type == 'editEquipment'"  />
          </t-form-item>
          <t-form-item label="多工单上机" name="multiple" >
            <t-select filterable v-model="dialogConfigE.data.multiple" :options="vData.selectOptions.multiple"/>
          </t-form-item>
          <t-form-item label="状态" name="status" >
            <t-select v-model="dialogConfigE.data.status" :options="vData.selectOptions.status"/>
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-input v-model="dialogConfigE.data.remark" />
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
import { onMounted, reactive, ref, watch} from 'vue';
import apiUrl from "@/core/config/url2.js";
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api.js';
import * as tableFn from "@/core/script/tableFn.js";
import DialogComponent from "@/core/component/dialog.vue";
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";

const props = defineProps({
  template:{type:Object,default:null,required: false},
});

//页面数据
const vData=reactive({
  template_id:null,
  template_name:null,
  selectOptions: {status:[],equipment_id:[],template_id:[],multiple:[]},
})
const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['search', 'clearCache','prevPage','nextPage', 'submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      add: {sort: 650, title: '新增模板设备' , icon: 'ri-add-line', click: () => fn.addTemplateEquipment()},
      edit: {sort: 651, title: '修改模板设备', icon: 'ri-edit-line', click: () => fn.editTemplateEquipment()},
      del: {sort: 652, title: '删除模板设备', icon: 'ri-delete-bin-2-line', click: () => fn.delTemplateEquipment()},
    },
  },
  searchConfig:[],
  tableConfig: {
    url: apiUrl.mes.report_template.equipmentList,
    showCheck: true,
    disablePage: true,
    useEncryptionFields: false,
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        await fn.editTemplateEquipment([originData]);
      },
    }
  }
}

const fn = {
  addTemplateEquipment: () => {
    if (!vData.template_id) {
      return dialog.warning('请选择模板');
    }
    dialogConfigE.data = {status:1,template_id:vData.template_id,multiple:'NO'};
    dialogConfigE.bind.title = '新增模板设备';
    dialogConfigE.type = 'addEquipment';
    dialogConfigE.isShow = true;
  },
  editTemplateEquipment: async (rows) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length !== 1) return dialog.warning('请勾选一条数据修改');
    const row = checkedRows[0];
    dialogConfigE.bind.title = '修改模板设备';
    dialogConfigE.type = 'editEquipment';
    dialogConfigE.data = {...row};
    dialogConfigE.isShow = true
  },
  delTemplateEquipment: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.mes.report_template.delEquipment, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  },

  clearField:(field) => {
    dialogConfigE.data[field] = null;
  }
}

const dialogConfigE = reactive({
  isShow:false,
  data: {},
  rules:{
    template_id: [{required: true, message: '请选择模板', trigger: 'change'},],
    equipment_id: [{required: true, message: '请选择设备', trigger: 'change'},],
    multiple: [{required: true, message: '请选择是否多工单上机', trigger: 'change'},],
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
    const res = await api.post(apiUrl.mes.report_template[dialogConfigE.type], dialogConfigE.data);
    loading && loading.close();
    if (res) {
      dialog.success('保存成功');
      dialogConfigE.close();
      await mainReport.value.reportConfig.getData({where:{template_id:vData.template_id}});
    }
  },
  close: () => {
    dialogConfigE.isShow=false;
  },
  on:{
    afterClose: () => {
      dialogConfigE.close();
    }
  }

})

onMounted( () => {
  siyi.navHide = true; // 隐藏导航栏
  api.get(apiUrl.mes.report_template.equipmentConfig).then(res => {
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
