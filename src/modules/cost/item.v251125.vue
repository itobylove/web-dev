<template>
  <div ref="box" :class="['mainPage','page-'+table.tableConfig.id]">
    <TableComponent class="page-list"  v-if="table.isInit"  ref="report" v-bind="getReportConfig()"/>
    <div class="page-detail" v-if="table.isInit" >
      <AvgPrice :item="vData.item" :select-options="vData.selectOptions" v-if="vData.item" v-show="vData.item.type!=='bom'"  />
      <div class="item-editor" v-if="vData.item" v-show="vData.item.type==='bom'">
          <t-textarea v-model="vData.item.description" :autosize="{ minRows: 10 }" placeholder="请输入计算公式 " />
          <t-button class="item-editor-btn" theme="primary" @click="tableEvent.save()">保存</t-button>
      </div>
    </div>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBoxFn.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBoxFn.submit" v-bind="editBox.form">
        <t-col span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="editBox.data.plant_id"  :options="plantList"/>
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select v-model="editBox.data.type" :options="vData.selectOptions.type"/>
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="editBox.data.name" />
          </t-form-item>
          <t-form-item label="分组" name="category">
            <t-input v-model="editBox.data.category" />
          </t-form-item>
          <t-form-item label="排序" name="sort" >
            <t-input-number v-model="editBox.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"  placeholder="数字小靠前" />
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
import AvgPrice from "@/modules/cost/avg_price.vue";

import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";
import bomPage from "./bom.v251125.vue";
import ParameterRules from "../system/parameter_rules.vue";
import {plantList} from "@/utils/erp.js";
import MenuComponent from "@/core/component/menu.vue";
import dayjs from "dayjs";


const report = ref()

const dData = {
  start_month: dayjs().subtract(7, 'month').startOf('month').format('YYYY-MM-DD'),
  end_month: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
};

//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  item:null,
  configCheckAll:false,
  selectOptions: {status:[],config_type:[],item_id:[],unit_id:[],bom_id:[],process_id:[],step_id:[],material_id:[],parameter_id:[]},
})

// 成本项配置
const item_config=ref({
  item_bom:[],process_bom:[],boom_material:[],avg_price:[]
});

const table = reactive({
  isInit: false,
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
});

const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
    table.isInit && await report.value.reportConfig.getData();
  },
  checkAll: async (checked) => {
    item_config.value.avg_price=item_config.value.avg_price.map(item => ({...item, checked: checked}))
  },
  showEdit: async (rows) => {
    const row = rows?.[0] || {};
    editBox.isShow=true;
    editBox.data={
      plant_id:vData.plant_id,
      status:1,
      ...row
    }
    editBox.bind.title = (editBox.data?.id ? '修改' : '添加') + '成本项';
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.item.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
  showBom: async () => {
    dialog.window(bomPage, {query:{plant_id:vData.plant_id}},{width: '80%',height: '80%',title:"bom管理"})
  },
  showParameter: async () => {
    dialog.window(ParameterRules, {query:{plant_id:vData.plant_id}},{width: '80%',height: '80%',title:"参数管理"})
  },
  save: async () => {
    const res = await api.post(api.url2.cost.item.save, vData.item);
    if (!res) return;
    dialog.success('保存成功');
  },
};

// 页面初始化

const initTable = async () => {
  const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = await api.get(api.url2.cost.item.init);
  loading && loading.close();
  vData.selectOptions = getOptionsLabel(apiData?.option);
  vData.selectOptions.unit_id= vData.selectOptions.unit_id.map(item => ({...item,label:" 元 / "+item.label}));
  await tableEvent.plantChange(siyi.user.plantId);
  table.tableConfig = {...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
  table.isInit = true;
}

const getReportConfig = () => {
  return {
    menuConfig: {
      menu:{
        search: {sort: 10},
        add: {title: '添加', click: () => tableEvent.showEdit(), icon: 'ri-add-line', sort: 40},
        edit: {title: '修改', listAction: tableEvent.showEdit, icon: 'ri-edit-line', sort: 50},
        del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-delete-bin-line', sort: 60},
        // process: {title: 'BOM设置', click: () => tableEvent.showBom(), icon: 'ri-menu-line', sort: 80},
        // parameter: {title: '参数设置', click: () => tableEvent.showParameter(), icon: 'ri-menu-line', sort: 80},
        moreSettings:{sort: 90,title:'表格设置'},
      },
      defaultMenuShowList:['search','moreSettings','pageExport'],
    },
    searchConfig: {
      search:[
        {type: 'select', field: 'plant_id',style: {width: '100px'},
          options: {multiple:false,clearable:false,placeholder: '工厂'},onChange:tableEvent.plantChange,value: vData.plant_id,load:'factory'},
      ],
    },
    tableConfig: {
      url: api.url2.cost.item.list,
      showCheck: 'radio',
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
        heightMode:'autoHeight',
      },
      ...table.tableConfig,
      afterLoaded:()=>{
        report.value.reportConfig.table.selectRow(1);
        const firstRow = report.value.reportConfig.table.options.records?.[0] || {};
        vData.item = {...firstRow};
      },
      events:{
        click_cell:  ({originData,field}) => {
          if (!field) return ;
          vData.item = originData;
          // tableEvent.getConfig(originData)
        }
      },
    },
  }
};

const editBox=reactive({
  isShow:false,
  data:{
    plant_id:vData.plant_id,
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    name: [{required: true, message: '请输入名称', trigger: 'change'},],
    type: [{required: true, message: '请选择类型', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '600px',
    height: '500px',
    title: "添加"
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },

})
const editBoxFn={
  show: () => {
    editBox.isShow=true;
  },
  save: () => {

  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.item.save, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await report.value.reportConfig.getData();
      editBoxFn.close();
    }
  },
  close: () => {
    editBox.data={};
    editBox.isShow=false;
  },
  on:{
    afterClose: () => {
      editBoxFn.close();
    }
  }
}


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
  .page-list{
    width:550px;
  }
  .page-detail{
    flex:1;
    .header {
      flex-shrink: 0;
      border: 1px solid #c9d0da;
      border-bottom: 0 none;
      border-radius: 5px 5px 0 0;
      background-color: #f3f4f7;
      display: flex;
      flex-direction: column;
    }
    .item-editor{
      margin: 2px;
      .item-editor-btn{
        margin-top: 3px;
      }
    }
    .siyi-table {

      :deep(.t-input) {
        border: none;
      }
      :deep(input){
        text-align: center;
      }
      table{
        table-layout: fixed;
        width: 100%;
      }
      th, td {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    :deep(.t-empty){
      padding: 20px;
    }
  }
}
</style>