<template>
  <div ref="box" :class="['mainPage','page-'+mainReportConfig.tableConfig.tableId]">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig" style="flex: 7;"/>
    <t-tabs v-if="showChild && mainReportShow"  :default-value="1" class="page-tabs" size="medium">
      <t-tab-panel :value="1" label="工段" >
        <EquipmentStationPage :equipment="vData.equipment"  />
      </t-tab-panel>
    </t-tabs>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-row>
        <t-col :span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="dialogConfig.data.plant_id"  :options="plantList" @change="dialogConfig.change('plant_id',$event)" />
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select filterable v-model="dialogConfig.data.type" :options="vData.selectOptions.type"/>
          </t-form-item>
          <t-form-item label="父级" name="pid" v-if="dialogConfig.data.type===1">
            <t-select filterable v-model="dialogConfig.data.pid" :options="dialogConfig.selectOptions.pid"/>
          </t-form-item>
          <t-form-item label="ERP设备" name="erp_equipment_id" v-if="dialogConfig.data.type===0 && dialogConfig.data.plant_id===6">
            <t-select filterable v-model="dialogConfig.data.erp_equipment_id" :options="vData.selectOptions.erp_equipment_id" clearable @clear="fn.clearField('erp_equipment_id')" @change="fn.handleErpEquipmentChange" />
          </t-form-item>
          <t-form-item label="工段" name="station_ids">
            <t-select filterable multiple v-model="dialogConfig.data.station_ids" :options="dialogConfig.selectOptions.station_ids" />
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="dialogConfig.data.name" />
          </t-form-item>
          <t-form-item label="分组" name="pid" v-if="dialogConfig.data.type!==1">
            <t-select filterable v-model="dialogConfig.data.pid" :options="dialogConfig.selectOptions.pid"/>
          </t-form-item>
          <t-form-item label="编码" name="code">
            <t-input v-model="dialogConfig.data.code" />
          </t-form-item>
          <t-form-item label="型号" name="model" v-if="dialogConfig.data.type===0">
            <t-input v-model="dialogConfig.data.model" />
          </t-form-item>
          <t-form-item label="供应商" name="supplier_id" v-if="dialogConfig.data.type===0">
            <t-select filterable v-model="dialogConfig.data.supplier_id" :options="vData.selectOptions.supplier_id"/>
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
        </t-row>
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
import {plantList} from "@/utils/erp.js";
import siyi from "@/core/script/siyi.js";
import EquipmentStationPage from "@/modules/system/step_equipment/bak/equipment_station.vue";
import {updateRow} from "@/core/script/tableFn.js";

const props = defineProps({
  query:{type:Object,default:{}},
  where:{type:Object,default:{}},
  showChild: {type:Boolean,default:false},
  tableConfig: {type: Object, default: {}},
});
const emit = defineEmits(['clickCell'])


//页面数据
const vData=reactive({
  type:0,
  pageConfig:{},
  equipment:{},
  plant_id: siyi.user.plantId,
  selectOptions: {status:[],supplier_id:[],station_ids:[],erp_equipment_id:[],pid:[]},
  ...props.query
})

const fn = {
  import: async (type=0) => {
    const text = await dialog.inputAsync('', '导入数据', {
      width: '600px',height: '300px',
      input:{
        inputType: 'textarea',
        placeholder: '请输入名称，多个请换行',
        autosize: {minRows: 8, maxRows: 8},
      }
    });
    if (!text) return ;
    const list = text.split('\n').map(name => name.trim()).filter(name => name);
    if (!list.length) return dialog.warning('请输入名称');
    const loading = dialog.loading(undefined, '保存中...');
    const taskAll = [];
    list.forEach( name => {
      taskAll.push(api.post(api.url2.sys.equipment.add,{
        plant_id: vData.plant_id, name,type
      }));
    })
    const okList= (await Promise.all(taskAll)).filter(item => item);
    loading && loading.close();
    if (okList.length) {
      dialog.success('保存成功');
      await mainReport.value.reportConfig.getData();
    }else{
      dialog.warning('保存失败');
    }
  },
  addEquipment: (type=0) => {
    dialogConfig.data = {status:1,plant_id:vData.plant_id,type};
    dialogConfig.bind.title = '新增'+(vData.pageConfig.option.type[type]);
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
    dialogConfig.change('plant_id',vData.plant_id);
  },
  editEquipment: async (rows) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length !== 1) return dialog.warning('请勾选一条数据修改');
    const row = checkedRows[0];
    dialogConfig.bind.title = '修改' + (vData.pageConfig.option.type[row.type]);
    dialogConfig.type = 'edit';
    dialogConfig.data = {...row};
    await dialogConfig.change('plant_id', row.plant_id);
    dialogConfig.selectOptions.pid = dialogConfig.selectOptions.pid.filter(item => item.value !== row['id']); // 父级不能包含自己
    dialogConfig.isShow = true
  },
  delEquipment: async (rows) => {
    const ids = rows.map(item => item?.id) || [];
    const result = await dialog.confirmAsync('确定要删除' + ids.length + '条数据吗？');
    if (!result) return;
    const res = await api.post(apiUrl.sys.equipment.del, {ids: ids});
    if (!res) return;
    dialog.success('删除成功');
    mainReport.value.reportConfig.getData();
  },
  clearField: (field) => {
    dialogConfig.data[field] = null;
  },
  handleErpEquipmentChange: (value) => {
    if (value) {
      const selectedOption = vData.selectOptions.erp_equipment_id.find(option => option.value === value);
      if (selectedOption) {
        const label = selectedOption.label;
        const match = label.match(/^(.+) \((.+)\)$/);
        if (match) {
          dialogConfig.data.name = match[1];
          dialogConfig.data.code = match[2];
        }
      }
    }
  },
}

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      add: {sort: 650, title: '添加设备' , icon: 'ri-add-line', click: () => fn.addEquipment(0)},
      import: {sort: 650, title: '批量添加设备' , icon: 'ri-add-line', click: () => fn.import(0)},
      addGroup: {sort: 650, title: '添加分组' , icon: 'ri-add-line', click: () => fn.addEquipment(1)},
      import2: {sort: 650, title: '批量添加分组' , icon: 'ri-add-line', click: () => fn.import(1)},
      edit: {sort: 651, title: '修改', icon: 'ri-edit-line', click: () => fn.editEquipment()},
      del: {sort: 652, title: '删除', icon: 'ri-delete-bin-2-line', listAction: fn.delEquipment},
    },
  },
  searchConfig: {
    search: [
      {type: 'select', field: 'plant_id',style: {width: '100px'},value: vData.plant_id, options: {multiple:false,placeholder: '工厂'},load:'factory'
        ,onChange: (val) => {vData.plant_id = val;mainReport.value.reportConfig.getData()}},
      {type: 'select', field: 'type', options: {multiple:false,placeholder: '类型', options: vData.selectOptions.type},
        value: vData.type,onChange:(val)=>{vData.type=val; mainReport.value.reportConfig.getData();}},
      {type: 'input', field: 'code', options: {placeholder: '编码'}},
      {type: 'input', field: 'name', options: {placeholder: '名称'}},
      {type: 'select', field: 'status', options: {multiple:false,placeholder: '状态', options: vData.selectOptions.status}},

    ],
  },
  where: {...props.where},
  tableConfig: {
    url: apiUrl.sys.equipment.list,
    showCheck: true,
    disablePage: true,
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        await fn.editEquipment([originData]);
      },
      click_cell: async ({originData,field}) => {
        if (!field) return ;
        vData.equipment=originData;
        emit('clickCell', {type: 'step', data: originData});
      },
    },
    ...props.tableConfig
  }
}


const dialogConfig = reactive({
  isShow:false,
  selectOptions:{pid:[]},
  data: {},
  rules:{
    type: [{required: true, message: '请选择类型', trigger: 'change'},],
    // code: [{required: true, message: '请输入设备编码', trigger: 'change'},],
    name: [{required: true, message: '请输入设备名称', trigger: 'change'},],
    station_ids: [{required: true, message: '请选择工段', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '50%',
    height: '90%',
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },
  change: async (key,value) => {
    if(key === 'plant_id') {
      dialogConfig.selectOptions.erp_equipment_id = vData.selectOptions.erp_equipment_id.filter(item => item.data.plantsId === value);
      dialogConfig.selectOptions.station_ids = vData.selectOptions.station_ids.filter(item => item.data.plant_id === value);
      dialogConfig.selectOptions.pid = vData.selectOptions.pid.filter(item => item.data.plant_id === value); // 只包含本公司
    }
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const {id} = await api.post(apiUrl.sys.equipment[dialogConfig.type], dialogConfig.data);
    loading && loading.close();
    if (id) {
      dialog.success('保存成功');
      dialogConfig.close();
      const {list}= await api.get(api.url2.sys.equipment.list,{where:{id}})
      updateRow(mainReport.value.reportConfig, [list[0]],'id',false); // 更新单行
    }
  },
  close: () => {
    dialogConfig.isShow=false;
  },
  on:{
    afterClose: () => {
      dialogConfig.close();
    }
  },
})

onMounted( () => {
  api.get(apiUrl.sys.equipment.config).then(res => {
    vData.pageConfig= {...res};
    vData.selectOptions = getOptionsLabel(res?.option);
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const searchFields = ['status', 'supplier_id', 'erp_equipment_id', 'station_ids','type'];
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
  flex: 3;
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


