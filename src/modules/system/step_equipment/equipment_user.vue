<template>
  <div class="mainPage">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-col span="11" >
          <t-form-item label="用户" name="user_id" >
            <t-select v-model="dialogConfig.data.user_id" :options="vData.selectOptions.user_id" filterable multiple  />
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

const props = defineProps({
  equipment: {type: Object, default: {}},
  tableConfig: {type: Object, default: {}},
  menuConfig: {type: Object, default: {}},
  query: {type: Object, default: {}},
});

const emit = defineEmits(['afterLoaded'])

//页面数据
const vData=reactive({
  equipment_id:props.equipment?.id,
  selectOptions: {status:[],equipment_id:[],user_id:[],},
  ...props.query,
})


const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuShowList:[],
    menu: {
      add: {sort: 650, title: '添加' , icon: 'ri-add-line', click: () => fn.addEquipmentUser()},
      del: {sort: 652, title: '删除', icon: 'ri-delete-bin-2-line', click: () => fn.delEquipmentUser()},
    },
    ...props.menuConfig,
  },
  searchConfig:false,
  tableConfig: {
    url: apiUrl.sys.equipment.user.list,
    showCheck: true,
    disablePage: true,
    useEncryptionFields: false,
    ...props.tableConfig,
    afterLoaded:()=>{
      emit('afterLoaded',mainReport.value.reportConfig)
    },
  }
}

const fn = {
  addEquipmentUser: () => {
    if (!vData.equipment_id) {
      return dialog.warning('请选择设备');
    }
    dialogConfig.data = {status:1,equipment_id:vData.equipment_id,};
    dialogConfig.bind.title = '新增设备用户';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
  },
  delEquipmentUser: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(apiUrl.sys.equipment.user.del, { ids: checkedRows.map(item => item.id) }).then(
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
  }
}

const dialogConfig = reactive({
  isShow:false,
  data: {},
  rules:{
    equipment_id: [{required: true, message: '请选择设备', trigger: 'change'},],
    user_id: [{required: true, message: '请选择用户', trigger: 'change'},],
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
    const res = await api.post(apiUrl.sys.equipment.user[dialogConfig.type], dialogConfig.data);
    loading && loading.close();
    if (res) {
      dialog.success('保存成功');
      dialogConfig.close();
      await mainReport.value.reportConfig.getData({where:{equipment_id:vData.equipment_id}});
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
  api.get(apiUrl.sys.equipment.user.config).then(res => {
    vData.selectOptions = getOptionsLabel(res?.option);
    mainReportConfig.where = {equipment_id: vData.equipment_id};
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    mainReportShow.value = true;
  });
});

watch(() => [props.equipment], async () => {
  vData.equipment_id = props.equipment?.id;
  mainReport.value.reportConfig.getData({where:{equipment_id:vData.equipment_id}});
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
