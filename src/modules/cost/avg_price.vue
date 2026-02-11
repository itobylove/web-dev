<template>
  <div ref="box" :class="['mainPage','page-'+table.tableConfig.id]">
    <TableComponent  ref="report" v-bind="table" v-if="vData.item"/>
    <dialogComponent ref="editBoxRef" v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBoxFn.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBoxFn.submit" v-bind="editBox.form">
        <t-col span="11" >
          <t-form-item label="成本项" name="item_id">
            <t-input :value="vData.item.type_text +' > '+ (vData.item.category || '') +(vData.item.category?' > ':'')+ vData.item.name" type="text" readonly />
          </t-form-item>
          <t-form-item label="级别" name="avg_level">
            <t-select v-model="editBox.data.avg_level" :options="vData.selectOptions.avg_level" @change="editBoxFn.change($event,'avg_level')" />
          </t-form-item>
          <t-form-item label="工序" name="step_id" v-if="editBox.data.avg_level===dData.AVG_LEVEL_STEP">
            <t-select v-model="editBox.data.step_id" :options="vData.selectOptions.step_id"  clearable filterable multiple reserveKeyword minCollapsedNum="3" />
          </t-form-item>
          <t-form-item label="工艺" name="process_id" v-if="editBox.data.avg_level===dData.AVG_LEVEL_PROCESS">
            <t-select v-model="editBox.data.process_id" :options="editBox.process_list"   @inputChange="editBoxFn.processInputChange" clearable filterable multiple reserveKeyword minCollapsedNum="3" />
          </t-form-item>
          <t-form-item label="设备组" name="asset_group_id" v-if="editBox.data.avg_level===dData.AVG_LEVEL_ASSET_GROUP">
            <t-select v-model="editBox.data.asset_group_id" :options="vData.selectOptions.asset_group_id" @change="editBoxFn.change($event,'asset_group_id')" clearable filterable  reserveKeyword minCollapsedNum="3" />
          </t-form-item>
          <t-form-item label="工艺" name="step_process_id" v-if="editBox.data.avg_level===dData.AVG_LEVEL_ASSET_GROUP && editBox.data.asset_group_id">
              <t-select v-model="editBox.data.step_process_id" :options="editBox.step_process_list" readonly  placeholder="请选择设备组"  multiple reserveKeyword  />
          </t-form-item>
          <t-form-item label="费率" name="avg_price" >
            <t-input  v-model="editBox.data.avg_price" theme="column" style="width: 100%" type="number" min="0"  max="9999" class="avg_price" placeholder="只填费率" >
              <template #suffix>
                <t-select v-model="editBox.data.avg_unit" :options="vData.selectOptions.unit_id" style="width: 120px;text-align: center"  />
              </template>
            </t-input>
          </t-form-item>
          <t-form-item label="区间" name="start_time">
            <t-date-picker  v-model="editBox.data.start_time" style="width: 50%"   placeholder="开始时间" valueType="YYYY-MM-DD" :defaultValue="dData.start_month"
                            clearable allow-input />
            <t-date-picker  v-model="editBox.data.end_time" style="width: 50%"   placeholder="结束时间" valueType="YYYY-MM-DD"
                            :defaultValue="dData.end_month"   clearable allow-input  />
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-input  v-model="editBox.data.remark" type="text" placeholder="备注（选填,可以填金额和面积）"/>
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
import {onMounted, reactive, ref, watch, watchEffect} from "vue"
import { AutoFillPlugin } from '@visactor/vtable-plugins';
import TableComponent from '@/core/component/table_v2.vue'
import dialogComponent from '@/core/component/dialog.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import dialog from "@/core/script/dialog.js";
import dayjs from "dayjs";
import {list2Group} from "@/utils/vars.js";
import {getPlant} from "@/utils/erp.js";
import * as core from "@/core/script/core.js";
import apiUrl2 from "@/core/config/url2.js";

const props = defineProps({
  item:{type:Object,default:{}},
  selectOptions:{type:Object,default:{}}
});


const dData = {
  AVG_LEVEL_PLANT: 0,
  AVG_LEVEL_STEP: 1,
  AVG_LEVEL_PROCESS: 2,
  AVG_LEVEL_ASSET_GROUP: 3,
  start_month: dayjs().subtract(7, 'month').startOf('month').format('YYYY-MM-DD'),
  end_month: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
};

const AVG_FIELDS={
  [dData.AVG_LEVEL_PLANT]: 'plant_id',
  [dData.AVG_LEVEL_STEP]: 'step_id',
  [dData.AVG_LEVEL_PROCESS]: 'process_id',
  [dData.AVG_LEVEL_ASSET_GROUP]: 'asset_group_id',
};

//页面数据
const vData=reactive({
  plant_id:null,
  item:{id:null,plant_id:null},
  selectTree:{process_id:[]},
  selectOptions: {status:[],type:[],step_id:[],process_id:[],avg_level:[],asset_group_id:[],unit_id:[]},
})


const report = ref()
const tableEvent = {
  set: async (id, key, value) => {
    return await api.post(api.url2.cost.config.set, {id, key, value});
  },
  status: async (rows, value) => {
    const title = value ? '启用' : '禁用';
    const ids = rows.map((row) => row.id)
    if (!(await dialog.confirmAsync('确定要' + title + ' ' + ids.length + '条数据吗？'))) {
      return;
    }
    const res=  await api.post(api.url2.cost.config.set, {ids, key: 'status', value});
    if (res){
      dialog.success('操作成功');
      await report.value.reportConfig.getData();
    }
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.config.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
  getAvgTitle: (item) => {
    const option=vData.selectOptions?.[AVG_FIELDS[item.avg_level]]?.find(v=>v.value===item[AVG_FIELDS[item.avg_level]]);
    let title =option?.label;
    if (item.avg_level===dData.AVG_LEVEL_ASSET_GROUP){
      title = "【" + vData.selectOptions.process_id.find(v => v.value === item.process_id && v.data.step_id=== item.step_id)?.label + "】" + title;
    }else if (item.avg_level===dData.AVG_LEVEL_PROCESS){
      title = option.data.name;
    }else if (item.avg_level===dData.AVG_LEVEL_PLANT){
      title = item.plant_id_text;
    }
    return title;
  },
};


const table = {
  menuConfig: {
    menu:{
      search: {sort: 10},
      add: {title: '添加', click: () => editBoxFn.add(), icon: 'ri-add-line', sort: 40},
      enable: {title: '启用', listAction: (rows)=>tableEvent.status(rows,1), icon: 'ri-play-line', sort: 60},
      disable: {title: '停用', listAction: (rows)=>tableEvent.status(rows,0), icon: 'ri-stop-large-line', sort: 60},
      del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-delete-bin-line', sort: 60},
    },
    defaultMenuShowList:['search','moreSettings'],
  },
  tableConfig:{
    id:'cost_config_avg_price',
    get: async () => {
      const list =  await api.post(api.url2.cost.config.list, {item_id: vData.item.id,type:'avg_price'},'list');
      return list?.map(item => ({...item,
        avg_title:tableEvent.getAvgTitle(item),
        avg_unit_name: vData.selectOptions.unit_id.find(v=>v.value===item.avg_unit)?.label || '',
      }))
    },
    columns:listTableFn.createColumns(['avg_level_text#级别','avg_title#名称',
      {title: '费率', field: 'avg_price', editor: 'inputEditor' },'avg_unit_name#单位',
      {title: '开始时间', field: 'start_time_text', editor: 'dateEditor' },
      {title: '结束时间', field: 'end_time_text', editor: 'dateEditor' },
      {title: '备注', field: 'remark', editor: 'inputEditor' },
      'status_text#状态','id#ID'],'#'),
    userConfig:{encryption:[],table:{}},
    showCheck: true,
    checkField: 'check',
    disablePage: true,
    useEncryptionFields: false,
    useUserTableConfig: false,
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
    events:{
      change_cell_value: async ({row, col, changedValue, currentValue,rawValue}) => {
        if (changedValue===rawValue){
          return ;
        }
        const fieldAlias={'start_time_text':'start_time', 'end_time_text':'end_time'};
        const vTable=report.value.reportConfig.table; // 表格实例
        const field = vTable.getHeaderField(col, row); //获取列名
        const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
        if (!record?.id) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          editBoxFn.add({[field]: changedValue});
          return;
        }
        const dataFiled = fieldAlias?.[field] || field;
        const res = await tableEvent.set(record.id, dataFiled, changedValue);
        if (!res) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
        }
      },
      dblclick_cell: async ({originData,field}) => {
        if (['avg_unit_name','avg_unit'].includes(field)  && originData?.id){
          const avg_unit  = await dialog.selectAsync(vData.selectOptions['unit_id'], originData['avg_unit'], '请选择单位');
          if (!avg_unit) return;
          const res = await tableEvent.set(originData.id,'avg_unit', avg_unit);
          if (res) {
            const avg_unit_name = vData.selectOptions.unit_id.find(v=>v.value===avg_unit)?.label || '';
            const newRow = {...originData,avg_unit_name};
            await listTableFn.updateRow(report.value.reportConfig,newRow);
          }
        }
      },
    },
  },
};

const editBox=reactive({
  process_list:[],
  isShow:false,
  data:{
    plant_id:null,item_name:'',step_process_id:'',
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    item_id: [{required: true, message: '请选择成本项', trigger: 'change'},],
    avg_level: [{required: true, message: '请选择类型', trigger: 'change'},],
    step_id: [{required: true, message: '请选择工序', trigger: 'change'},],
    process_id: [{required: true, message: '请选择工艺', trigger: 'change'},],
    asset_group_id: [{required: true, message: '请选择设备组', trigger: 'change'},],
    avg_price: [{required: true, message: '请输入费率', trigger: 'change'},],
    avg_unit: [{required: true, message: '请选择单位', trigger: 'change'},],
    start_time: [{required: true, message: '请选择开始时间', trigger: 'change'},],
    end_time: [{required: true, message: '请选择结束时间', trigger: 'change'},],
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
      item_id:vData.item.id,
      avg_price:'',
      avg_unit:vData.selectOptions.unit_id[0].value,
      start_time:'2025-01-01',
      end_time:'2025-09-30',
      status:1,
      type:'avg_price',
      ...(insert || {})
    }
    editBox.isShow=true;
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.config.save, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await report.value.reportConfig.getData();
      editBoxRef.value.close();
    }
  },
  processInputChange: async (value) => {
    if (!value) {
      editBox.process_list=[...vData.selectTree.process_id];
      return ;
    }
    editBox.process_list=[{label:'全选',checkAll:true},...vData.selectOptions.process_id].filter(v=>v.label.includes(value) || v?.checkAll);
  },
  change: (value, field) => {
    if (field==='avg_level'){
      const avg_fields= Object.values(AVG_FIELDS); //所有的类型字段
      const avg_field = AVG_FIELDS[value]; // 当前类型对应的字段
      avg_fields.map((field)=>{
        editBox.rules[field].find(rule=>typeof rule?.required==='boolean').required=avg_field===field;
      })
    }else if(field==='asset_group_id'){
      editBox.step_process_list=[];
      editBox.data.step_process_id=[];
      const asset_group = vData.selectOptions.asset_group_id.find(v=>v.value===value);
      console.log('asset_group',asset_group);
      asset_group.data.step_ids.forEach(step_id=>{
        asset_group.data.step_process[step_id].forEach(process_id=>{
          const processLabel = vData.selectOptions.process_id.find(v=>v.value===process_id && v.data.step_id===step_id)
          console.log('processLabel',processLabel);
          const step_process_id = step_id+'_'+process_id;
          editBox.step_process_list.push({...processLabel,value:step_process_id});
          editBox.data.step_process_id.push(step_process_id)
        })
      })
      editBox.rules.process_id.find(rule=>typeof rule?.required==='boolean').required=true;
    }
   },
  on:{
    afterClose: () => {
      editBox.isShow=false;
      editBox.data={};
    }
  }
}


watch(() => [props.item, props.selectOptions], ([item, selectOptions]) => {
  vData.item = {...item}
  if (vData.plant_id!==item.plant_id || !vData.plant_id){
    vData.plant_id=item.plant_id;
    vData.selectOptions = {...selectOptions};
    vData.selectOptions.step_id= props.selectOptions.step_id.filter(v => v.data?.plant_id=== vData.item.plant_id);
    vData.selectOptions.process_id= props.selectOptions.process_id.filter(v => v.data?.plant_id=== vData.item.plant_id);
    vData.selectOptions.asset_group_id= props.selectOptions.asset_group_id.filter(v => v.data?.plant_id=== vData.item.plant_id);
    vData.selectTree.process_id=list2Group(vData.selectOptions.process_id,'step_name');
  }
  report.value && report.value.reportConfig.getData();
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
