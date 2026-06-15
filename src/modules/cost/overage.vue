<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBox.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBox.submit" v-bind="editBox.form">
        <t-col span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="editBox.data.plant_id"  :options="plantList"/>
          </t-form-item>
          <t-form-item label="加工路线" name="package_id">
            <t-select v-model="editBox.data.package_id"  filterable :options="vData.selectOptions.package_id"/>
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select v-model="editBox.data.type"  filterable :options="vData.selectOptions.type"/>
          </t-form-item>
          <t-form-item label="层数最小值" name="layer_min" >
            <t-input-number v-model="editBox.data.layer_min" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"   />
          </t-form-item>
          <t-form-item label="层数最大值" name="layer_max" >
            <t-input-number v-model="editBox.data.layer_max" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"   />
          </t-form-item>
          <t-form-item label="面积最小值" name="area_min" >
            <t-input-number v-model="editBox.data.area_min" theme="column" style="width: 100%"  min="0" step="0.1" max="9999"   />
          </t-form-item>
          <t-form-item label="面积最大值" name="area_max" >
            <t-input-number v-model="editBox.data.area_max" theme="column" style="width: 100%"  min="0" step="0.1" max="9999"   />
          </t-form-item>
          <t-form-item label="PNL最小值" name="pnl_min" >
            <t-input-number v-model="editBox.data.pnl_min" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"   />
          </t-form-item>
          <t-form-item label="PNL最大值" name="pnl_max" >
            <t-input-number v-model="editBox.data.pnl_max" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"   />
          </t-form-item>
          <t-form-item label="预投率" name="overage_rate" >
            <t-input-number v-model="editBox.data.overage_rate" suffix="%" theme="column" style="width: 100%"  min="0" step="0.1" max="9999"   />
          </t-form-item>
          <t-form-item label="预投PNL" name="overage_pnl" >
            <t-input-number v-model="editBox.data.overage_pnl"  suffix="pnl" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"   />
          </t-form-item>
          <t-form-item label="额外PNL" name="pnl_add" >
            <t-input-number v-model="editBox.data.pnl_add"  suffix="pnl" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"   />
          </t-form-item>
          <t-form-item label="状态" name="status" >
            <t-select v-model="editBox.data.status" :options="vData.selectOptions.status"/>
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" type="submit">提交</t-button>
          </t-form-item>
        </t-col>
      </t-form>
    </dialogComponent>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import dialogComponent from '@/core/component/dialog.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import {plantList} from "@/utils/erp.js";
import dialog from "@/core/script/dialog.js";



//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  selectOptions: {status:[],type:[],package_id:[]},
})


// 无需代理的数据
const dData={
  inputNumberFields:['title','layer_min','layer_max','area_min','area_max','pnl_min','pnl_max','pnl_add','overage_rate','overage_pnl'],
}

const report = ref()

const editBox=reactive({
  isShow:false,
  data:{
    plant_id:vData.plant_id,
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    package_id: [{required: true, message: '请选择加工路线', trigger: 'change'},],
    type: [{required: true, message: '请选择类型', trigger: 'change'},],
    layer_min: [{required: true, message: '请输入层数(最小值)', trigger: 'change'},],
    layer_max: [{required: true, message: '请输入层数(最大值)', trigger: 'change'},],
    area_min: [{required: true, message: '请输入面积(最小值)', trigger: 'change'},],
    area_max: [{required: true, message: '请输入面积(最大值)', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '50%',
    height: '80%',
    title: "添加"
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.overage.save, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await report.value.reportConfig.getData();
      editBox.close();
    }
  },
  close: () => {
    editBox.data={};
    editBox.isShow=false;
  },
  on:{
    afterClose: () => {
      editBox.close();
    }
  }
})


const table = reactive({
  isInit: false,
  tableId:'',
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
});

const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
  },
  showEdit: async (rows) => {
    const row = rows?.[0] || {};
    editBox.isShow=true;
    editBox.data={
      plant_id:vData.plant_id,
      status:1,
      ...row
    }
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.overage.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
};


const getSearchForm = () => {
  return [
    {type: 'select', field: 'plant_id',style: {width: '100px'}, options: {multiple:false,placeholder: '工厂'},onChange:tableEvent.plantChange,value: vData.plant_id,load:'factory'},
    {type: 'select', field: 'status', options: {multiple:false,clearable:true,placeholder: '状态',style:{width:'160px'}, options: vData.selectOptions.status}},
  ]
}
const getMenus = () => {
  return {
    search: {sort: 10},
    add: {title: '添加', click: () => tableEvent.showEdit(), icon: 'ri-add-line', sort: 40},
    edit: {title: '修改', listAction: tableEvent.showEdit, icon: 'ri-edit-line', sort: 50},
    del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-del-line', sort: 60},
    moreSettings:{sort: 90,title:'表格设置'},
  };
}


// 页面初始化
const initTable = async () => {
  const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = await api.get(api.url2.cost.overage.init);
  loading && loading.close();
  vData.selectOptions = getOptionsLabel(apiData?.option);
  await tableEvent.plantChange(siyi.user.plantId);
  table.tableConfig = {...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
  table.menu = getMenus();
  table.search = getSearchForm();
  table.isInit = true;
}

const getReportConfig = () => {
  return {
    detailConfig:{colNum:2,colWidth:'350px'},
    menuConfig: {
      menu:table.menu,
      defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    },
    searchConfig: {
      search:table.search,
    },
    tableConfig: {
      url: api.url2.cost.overage.list,
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        editCellTrigger:'doubleclick', // 单元格双击触发编辑
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
      },
      ...table.tableConfig,
      colAfterCallback: (col) => {
        if (dData.inputNumberFields.includes(col.field)) {
          col.editor = 'inputEditor';
        }
        return col;
      },
      events:{
        change_cell_value: async ({row, col, changedValue, currentValue,rawValue}) => {
          if (changedValue===rawValue){
            return ;
          }
          const vTable=report.value.reportConfig.table; // 表格实例
          const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
          const field = vTable.getHeaderField(col, row); //获取列名
          if (!record?.id) {
            vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
            return;
          }
          if (!dData.inputNumberFields.includes(field)){
            dialog.warning('请输入数字!');
            vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
            return ;
          }
          if (typeof changedValue !== 'number' || Number(changedValue) < 0) {
            dialog.warning('请输入数字!');
            vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
            return;
          }
          const res = await api.post(api.url2.cost.overage.set, {id:record.id, [field]:changedValue});
          if (!res) {
            vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          }
        },
      }
    },
  }
};


onMounted(() => {
  initTable();
});

</script>

<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
</style>
