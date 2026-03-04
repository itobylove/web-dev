<template>
  <div ref="box" :class="['mainPage','page-'+table.tableConfig.id]">
    <TableComponent class="page-list"  v-if="table.isInit"  ref="report" v-bind="getReportConfig()"/>
    <div class="page-detail" v-if="table.isInit" >
      <packageItem :item="vData.item"  v-if="vData.item?.id"  />
    </div>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBoxFn.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBoxFn.submit" v-bind="editBox.form">
        <t-col span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="editBox.data.plant_id"  :options="plantList"/>
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select v-model="editBox.data.type" :options="vData.selectOptions.type" @change="editBoxFn.change('type',$event)"/>
          </t-form-item>
          <t-form-item label="父级" name="pid" v-if="[dData.TYPE_SERVICE,dData.TYPE_EXTEND].includes(editBox.data.type)">
            <t-select v-model="editBox.data.pid" :options="vData.selectOptions.pid"/>
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="editBox.data.name" />
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
import packageItem from "@/modules/cost/package_item.vue";

import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel, listToTree} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";
import {plantList} from "@/utils/erp.js";

const report = ref()

const dData = {
  TYPE_BASE: 0, //基础必选包
  TYPE_SERVICE: 1, //业务必选包
  TYPE_EXTEND: 2, // 附加可选包
};

//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  item:null,
  selectOptions: {status:[],pid:[],type:[]},
})


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
  showEdit: async (rows) => {
    const row = rows?.[0] || {};
    editBox.isShow=true;
    editBox.data={
      plant_id:vData.plant_id,
      status:1,
      ...row
    }
    if (vData.item?.id && vData.item?.type===dData.TYPE_BASE){
      editBox.data.pid= vData.item.id;
    }
    editBox.bind.title = (editBox.data?.id ? '修改' : '添加') + '包';
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.package.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
};

// 页面初始化

const initTable = async () => {
  const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = await api.get(api.url2.cost.package.init);
  loading && loading.close();
  vData.selectOptions = getOptionsLabel(apiData?.option);
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
      url: api.url2.cost.package.list,
      showCheck: 'radio',
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        editCellTrigger:'doubleclick', // 单元格双击触发编辑
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
        heightMode:'autoHeight',
        hierarchyExpandLevel: 3, // 树默认展开3层
      },
      ...table.tableConfig,
      get:async (url,query)=>{
        const res =  await api.get(url,query);
        return listToTree(res?.list || [], {labelKey: 'name', valueKey: 'id'}); // 转换为树结构
      },
      afterLoaded:()=>{
        report.value.reportConfig.table.selectRow(1);
        const list = report.value.reportConfig.table.options.records;
        vData.selectOptions.pid= list.filter(item=>item.type===dData.TYPE_BASE).map(item=>{
          return {label:item.name,value:item.id};
        });
        const firstRow = list?.[0] || {};
        vData.item = {...firstRow};
      },
      events:{
        click_cell:  ({originData,field}) => {
          if (!field) return ;
          vData.item = originData;
        },
        change_cell_value: async ({row, col, changedValue, currentValue}) => {
          if (changedValue === currentValue) {
            return;
          }
          const vTable = report.value.reportConfig.table; // 表格实例
          const field = vTable.getHeaderField(col, row); //获取列名
          const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
          if (field === 'name' && record?.id) {
            const res = await api.post(api.url2.cost.package.save, {id: record.id, name: changedValue});
            res && dialog.success('保存成功');
          }
        },
      },
      colAfterCallback: (col) => {
        if (col.field === 'name') {
          col.tree = true; // 开启树结构
          col.editor = 'inputEditor';
        }
        return col;
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
  change:(field,value)=>{
    if (field==='type' && value===dData.TYPE_BASE){
      editBox.data.pid=null;
    }
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.package.save, editBox.data);
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
  }
}
</style>