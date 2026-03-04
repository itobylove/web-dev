<template>
  <div ref="box" :class="['mainPage','page-'+table.tableConfig.id]">
    <TableComponent  ref="report" v-bind="table" v-if="vData.isInit"/>
    <dialogComponent ref="editBoxRef" v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBoxFn.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBoxFn.submit" v-bind="editBox.form">
        <t-col span="11" >
          <t-form-item label="成本包" name="package_id">
            <t-input :value="vData.item.type_text +' > '+ vData.item.name" type="text" readonly />
          </t-form-item>
          <t-form-item label="工艺" name="process_id" >
            <t-select v-model="editBox.data.process_id" :options="editBox.process_list" @change="editBoxFn.change($event,'process_id')"
                      @inputChange="editBoxFn.processInputChange"  filterable minCollapsedNum="3" :multiple="Array.isArray(editBox.data.process_id)" />
          </t-form-item>
          <t-form-item label="车间" name="workshop_id" v-if="editBox.data?.id">
            <t-select v-model="editBox.data.workshop_id" :options="editBox.selectOptions.workshop_id" @change="editBoxFn.change($event,'workshop_id')"  filterable  reserveKeyword minCollapsedNum="3" />
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-input  v-model="editBox.data.remark" type="text" placeholder="备注"/>
          </t-form-item>
          <t-form-item label="排序" name="sort">
            <t-input  v-model="editBox.data.sort" type="number" min="0" placeholder="从小到大"/>
          </t-form-item>
          <t-form-item label="状态" name="status" >
            <t-select v-model="editBox.data.status" :options="editBox.selectOptions.status"/>
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
import {reactive, ref, watch} from "vue"
import { AutoFillPlugin } from '@visactor/vtable-plugins';
import TableComponent from '@/core/component/table_v2.vue'
import dialogComponent from '@/core/component/dialog.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel, list2Group} from "@/utils/vars.js";

const props = defineProps({
  item:{type:Object,default:{}},
});

//页面数据
const vData=reactive({
  isInit:false,
  plant_id:null,
  item:{id:null,plant_id:null},
  selectOptions: {status:[],process_id:[],workshop_id:[]},
})

const report = ref()
const tableEvent = {
  init:async ()=>{
    if (vData.isInit) return;
    const apiData = await api.get(api.url2.cost.packageItem.init);
    vData.selectOptions = getOptionsLabel(apiData?.option);
    table.tableConfig = {...table.tableConfig,...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
    vData.isInit=true;
  },
  show:async (item)=>{
    vData.item={...item};
    await tableEvent.init();
    tableEvent.plantChange(item.plant_id);
    report.value.reportConfig.getData();
  },
  plantChange: (value) => {
    if (vData.plant_id===value && value) return;
    vData.plant_id = value;
    editBox.selectOptions= {...vData.selectOptions};
    editBox.selectOptions.process_id= editBox.selectOptions.process_id.filter(v => v.data?.plant_id=== value);
    editBox.selectOptions.workshop_id= editBox.selectOptions.workshop_id.filter(v => v.data?.plant_id=== value);
    editBox.selectTree.process_id=list2Group(editBox.selectOptions.process_id,'step_name');
  },
  edit:(rows)=>{
    const row = Array.isArray(rows) ? rows[0] : rows;
    editBox.data={...row};
    tableEvent.plantChange(row.plant_id);
    editBoxFn.change(row.process_id,'process_id');
    editBoxFn.processInputChange();
    editBox.isShow=true;
  },
  set: async (id, key, value) => {
    return await api.post(api.url2.cost.packageItem.set, {id, [key]:value});
  },
  status: async (rows, value) => {
    const title = value ? '启用' : '禁用';
    const ids = rows.map((row) => row.id)
    if (!(await dialog.confirmAsync('确定要' + title + ' ' + ids.length + '条数据吗？'))) {
      return;
    }
    const res=  await api.post(api.url2.cost.packageItem.set, {ids, 'status':value});
    if (res){
      dialog.success('操作成功');
      await report.value.reportConfig.getData();
    }
  },
  delete: async (rows) => {
    const ids = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+ids.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.packageItem.delete, {ids});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
  setWorkshop: async (rows) => {
    const row = Array.isArray(rows) ? rows[0] : rows;
    // const step_ids = vData.selectOptions['process_id'].filter(v => v.value === row.process_id).map(v => v.data?.step_id);
    // const workshop_id_list= vData.selectOptions['workshop_id'].filter(v=>v.data.plant_id===row.plant_id && step_ids.includes(v.data.step_id));
    const workshop_id = await dialog.selectAsync(editBox.selectOptions.workshop_id, row['workshop_id'], '请选择车间', {width: '500px'});
    if (!workshop_id) return;
    if (!await tableEvent.set(row.id, 'workshop_id', workshop_id)) {
      return;
    }
    dialog.success('设置成功!');
    const workshop_id_text = vData.selectOptions.workshop_id.find(v=>v.value===workshop_id)?.label || '';
    const newRow = {...row,workshop_id_text};
    await listTableFn.updateRow(report.value.reportConfig,newRow);
  }
};


const table = {
  isInit: false,
  menuConfig: {
    menu:{
      search: {sort: 10},
      add: {title: '添加', click: () => editBoxFn.add(), icon: 'ri-add-line', sort: 40},
      edit: {title: '修改', listAction: tableEvent.edit, icon: 'ri-edit-line', sort: 40},
      enable: {title: '启用', listAction: (rows)=>tableEvent.status(rows,1), icon: 'ri-play-line', sort: 60},
      disable: {title: '停用', listAction: (rows)=>tableEvent.status(rows,0), icon: 'ri-stop-large-line', sort: 60},
      setWorkshop: {title: '选择车间', listAction: tableEvent.setWorkshop, icon: 'ri-delete-bin-line', sort: 60},
      del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-delete-bin-line', sort: 80},
    },
    defaultMenuShowList:['search','moreSettings'],
  },

  tableConfig:{
    url: api.url2.cost.packageItem.list,
    id:'cost_package_item',
    showCheck: true,
    checkField: 'check',
    disablePage: true,
    options: {
      editCellTrigger:'doubleclick', // 单元格双击触发编辑
      select: {
        outsideClickDeselect: false,//点击外部区域是否取消选中。
      },
      heightMode:'autoHeight',
      excelOptions: {
        fillHandle: true // 启用填充炳功能
      },
      plugins: [new AutoFillPlugin()]
    },
    getQuery: () => {
      return {package_id: vData.item.id,plant_id:vData.plant_id};
    },
    events:{
      change_cell_value: async ({row, col, changedValue, currentValue,rawValue}) => {
        if (changedValue===rawValue){
          return ;
        }
        const vTable=report.value.reportConfig.table; // 表格实例
        const field = vTable.getHeaderField(col, row); //获取列名
        if (field==='sort' && typeof changedValue!=='number'){
          dialog.warning('请输入正整数!');
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          return ;
        }
        const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
        if (!record?.id) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          editBoxFn.add({[field]: changedValue});
          return;
        }
        const res = await tableEvent.set(record.id, field, changedValue);
        if (!res) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
        }
      },
      dblclick_cell: async ({originData,field}) => {
        if (['workshop_id_text','workshop_id'].includes(field)  && originData?.id){
            await tableEvent.setWorkshop(originData);
        }
      },
    },
    colAfterCallback: (col) => {
      if (col.field === 'sort' || col.field === 'remark') {
        col.editor = 'inputEditor';
      }
      return col;
    },
  },
};

const editBox=reactive({
  process_list:[],
  selectTree:{process_id:[]},
  selectOptions:{...vData.selectOptions},
  isShow:false,
  data:{
    plant_id:null,item_name:'',
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    package_id: [{required: true, message: '请选择成本项', trigger: 'change'},],
    process_id: [{required: true, message: '请选择工艺', trigger: 'change'},],
    // workshop_id: [{required: true, message: '请选择车间', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{width: '800px', height: '550px', title: "添加"},
  form:{
    style: {
      padding: '20px 10px',
    },
  },

})

const editBoxRef=ref();
const editBoxFn={
  add: (insert) => {
    editBox.data={
      plant_id:vData.item.plant_id,
      package_id:vData.item.id,
      process_id:[], // 添加时可以批量
      status:1,
      ...(insert || {})
    }
    editBox.isShow=true;
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.packageItem.save, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await report.value.reportConfig.getData();
      editBoxRef.value.close();
    }
  },
  processInputChange:  (value) => {
    if (!value) {
      editBox.process_list=[...editBox.selectTree.process_id];
      return ;
    }
    editBox.process_list=[{label:'全选',checkAll:true,value:''},...editBox.selectOptions.process_id].filter(v=>v.label.includes(value) || v?.checkAll);
  },
  change: (value, field) => {
    if(field==='process_id'){
      // const step_ids = vData.selectOptions['process_id'].filter(v => v.value === value).map(v => v.data?.step_id);
      // editBox.selectOptions.workshop_id = vData.selectOptions['workshop_id'].filter(v=>v.data.plant_id===editBox.data.plant_id && step_ids.includes(v.data.step_id));
    }
   },
  on:{
    afterClose: () => {
      editBox.isShow=false;
      editBox.data={};
    }
  }
}

watch(() => [props.item], ([item]) => {
  tableEvent.show(item);
}, { immediate: true, deep: true });

</script>

<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
  :deep(.avg_price .t-input){
    padding-right:0;
  }

</style>
