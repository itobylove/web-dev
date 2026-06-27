<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="reportRef" v-bind="reportConfig"/>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBoxFn.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBoxFn.submit" v-bind="editBox.form">
        <t-col :span="11" >
          <t-form-item label="类型" name="type">
            <t-select v-model="editBox.data.type" disabled  :options="vData.selectOptions.type"/>
          </t-form-item>
          <t-form-item label="名称" name="name" v-if="!editBox.data?.id ">
            <t-input v-model="editBox.data.name" placeholder="请输入名称" />
          </t-form-item>
          <template v-for="(attrField,attrKey) in vData.attrFields">
            <t-form-item :label="attrField" :name="attrKey" v-if="!editBox.data?.id ">
              <t-input v-model="editBox.data[attrKey]" />
            </t-form-item>
          </template>

          <t-form-item label="生效时间" name="start_time">
            <t-date-picker v-model="editBox.data.start_time" type="date" style="width: 100%" />
          </t-form-item>
          <t-form-item label="价格" name="price">
            <t-input-number v-model="editBox.data.price" :min="0" step="0.01" theme="normal" style="width: 100%" suffix="元"/>
          </t-form-item>
          <t-form-item >
            <t-button theme="primary" type="submit">提交</t-button>
          </t-form-item>
        </t-col>
      </t-form>
    </dialogComponent>

    <dialogComponent v-if="editBox2.isShow" v-bind="editBox2.bind"  v-on="editBox2Fn.on"  >
      <t-form :data="editBox2.data" :rules="editBox2.rules" @submit="editBox2Fn.submit" v-bind="editBox2.form">
        <t-col :span="11" >
          <t-form-item label="调价方式" name="action">
            <t-select v-model="editBox2.data.action"  :options="editBox2.action_options"/>
          </t-form-item>
          <t-form-item label="依据时间" name="time" v-if="['ratio','fixedAmount'].includes(editBox2.data.action)">
            <t-select v-model="editBox2.data.time"  :options="vData.selectOptions.priceFields"/>
          </t-form-item>
          <t-form-item label="涨价率" name="value" v-if="editBox2.data.action==='ratio'" help="负数为降价" :success-border="editBox2.data.value<0">
            <t-input-number v-model="editBox2.data.value"  step="0.01" theme="normal" style="width: 100%" suffix="%" />
          </t-form-item>
          <t-form-item label=涨价金额 name="value" v-if="editBox2.data.action==='fixedAmount'"  help="负数为降价" :success-border="editBox2.data.value<0" >
            <t-input-number v-model="editBox2.data.value"  step="0.01" theme="normal" style="width: 100%" suffix="元"  />
          </t-form-item>
          <t-form-item label="目标价" name="value" v-if="editBox2.data.action==='targetPrice'"  >
            <t-input-number v-model="editBox2.data.value" :min="0" step="0.01" theme="normal" style="width: 100%" suffix="元"  />
          </t-form-item>
          <t-form-item label="生效时间" name="start_time">
            <t-date-picker v-model="editBox2.data.start_time" type="date" style="width: 100%" />
          </t-form-item>
          <t-form-item >
            <t-button theme="primary" type="submit">提交</t-button>
          </t-form-item>
        </t-col>
      </t-form>
    </dialogComponent>


  </div>

</template>

<script setup>
import {computed, onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import dialogComponent from '@/core/component/dialog.vue'
import * as _ from 'lodash';
import * as core from '@/core/script/core.js'

import * as api from "@/core/script/api.js"
import dialog from "@/core/script/dialog.js";
import {AutoFillPlugin} from "@visactor/vtable-plugins";
import {getOptionLabel,getOptionsLabel} from "@/utils/vars.js";

const vData=reactive({
  type:'Core',
  selectOptions:{type:{},priceFields:[]},
  priceFields:{},
  attrFields:{},
});

const reportRef = ref()

const table = reactive({
  isInit: false,
  tableId:'siyi_cost_material_price',
  tableConfig:{userConfig: {}},
  readonlyFields:['id','type'],
});

const tableEvent = {
  typeChange: async () => {
    await reportRef.value.reportConfig.getData();
  },
  add: async (row) => {
    editBoxFn.show(row,'添加');
  },
  edit: async (rows) => {
    if (!Array.isArray(rows) || rows.length!==1 || !rows[0]?.id){
      dialog.error('请选中一条数据!');
      return ;
    }
    editBoxFn.show(rows[0],'更新价格 (ID:'+rows[0].id+')');
  },
  setPrice: async (rows) => {
    editBox2Fn.show(rows);
  },
  set: async (id,field,value,version) => {
    const isUpdatePrice = Object.keys(vData.priceFields).includes(field);
    const post = isUpdatePrice?{id,version,start_time:field,price:value}:{id,version,[field]:value,type:vData.type};
    return await api.post(api.url2.cost.material_price.save, post);
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.material_price.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await reportRef.value.reportConfig.getData();
    }
  },
};


const reportConfig = computed(() => ({
  menuConfig: {
    menu:{
      create:()=>tableEvent.add(),
      update:{listAction:tableEvent.edit,title:'更新价格'},
      delete:{listAction:tableEvent.delete},
      setPrice:{listAction:tableEvent.setPrice,title:'批量调价',icon:'ri-price-tag-line',sort: 300},
    },
    defaultMenuShowList:['search','create','update','delete','moreSettings','pageExport','clearWhere'],
  },
  searchConfig: {
    search:[
      {type: 'select', field: 'type', style: {width: '100px'},onChange:tableEvent.typeChange,value:vData.type, options: {
        multiple: false,clearable: false, placeholder: '类型',options: vData.selectOptions.type}
      },
    ],
  },
  detailConfig:{colNum:3,colWidth:'250px'},
  tableConfig: {
    columnSplit:'#',
    url: api.url2.cost.material_price.list,
    showCheck: true,
    disablePage: true,
    useEncryptionFields: false,
    options: {
      editCellTrigger:'doubleclick', // 单元格双击触发编辑
      select: {
        outsideClickDeselect: false,//点击外部区域是否取消选中。
      },
      excelOptions: {
        fillHandle: true // 启用填充炳功能
      },
      plugins: [new AutoFillPlugin()]
    },
    ...table.tableConfig,
    get:async (url,query)=>{
      const res =await  api.get(url,query);
      vData.priceFields={...res.priceFields};
      vData.attrFields={...res.attrFields};
      vData.selectOptions.priceFields=getOptionLabel(res.priceFields);
      return res;
    },
    events:{
      change_cell_value: async ({row, col, changedValue, currentValue,rawValue}) => {
        if (changedValue===rawValue){
          return ;
        }
        const vTable=reportRef.value.reportConfig.table; // 表格实例
        const field = vTable.getHeaderField(col, row); //获取列名
        const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
        if (!record?.id && changedValue) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          await tableEvent.add({[field]: changedValue});
          return;
        }
        const res = await tableEvent.set(record.id, field, changedValue,record.version);
        if (!res) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
        }
      },
    },
    colAfterCallback: (col) => {
      if (!table.readonlyFields.includes(col.field)) {
        col.editor = 'inputEditor';
      }
      return col;
    },
  },
}))


const editBox=reactive({
  isShow:false,
  data:{
    type:vData.type,
    name: '',
    start_time: '',
    price: '',
  },
  rules:{
    type: [{required: true, message: '请选择类型', trigger: 'change'},],
    start_time: [{required: true, message: '请输入时间', trigger: 'change'},],
    price: [{required: true, message: '请输入价格', trigger: 'change'},],
  },
  bind:{
    width: '500px',
    title: "添加"
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },

})
const editBoxFn={
  show: (data,title) => {
    const newData = _.omit(data, Object.keys(vData.priceFields)); // 删掉价格字段
    editBox.data = {...editBox.data, ...(newData || {}), type:newData?.type || vData.type};
    editBox.bind.title = title || '添加';
    editBox.isShow = true;
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.cost.material_price.save);
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await reportRef.value.reportConfig.getData();
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

const editBox2=reactive({
  isShow:false,
  rows:[],
  action_options: [
    {label: '按比例调整', value: 'ratio'},
    {label: '按固定金额调整', value: 'fixedAmount'},
    {label: '调整至目标价格', value: 'targetPrice'}
  ],
  data:{
    time:'',
    action:'',
    value: '',
    start_time: '',
  },
  rules:{
    time: [{required: true, trigger: 'change'},],
    action: [{required: true, trigger: 'change'},],
    value: [{required: true,  trigger: 'change'},],
    start_time: [{required: true,  trigger: 'change'},],
  },
  bind:{
    width: '500px',
    title: "添加"
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },

})
const editBox2Fn={
  show: (rows) => {
    editBox2.rows = [...rows];
    editBox2.data = {action:'ratio',start_time:core.date.Ymd()};
    editBox2.bind.title = '批量调价';
    editBox2.isShow = true;
  },
  execPrice: (row) => {
    const { action, value, time } = editBox2.data;
    // 目标价直接返回
    if (action === 'targetPrice') {
      return value;
    }
    const basePrice = Number(row?.[time]);
    if (!Number.isFinite(basePrice)) {
      dialog.warning(`${row.name} (ID: ${row.id}) 在 ${vData.priceFields?.[time]} 没有价格!`);
      return;
    }
    switch (action) {
      case 'ratio':
        return basePrice * (1 + value / 100);
      case 'fixedAmount':
        return basePrice + value;
      default:
        return;
    }
  },
  submit: async ({ validateResult, firstError }) => {
    if (validateResult !== true) {
      return dialog.warning(firstError);
    }
    const postList = [];
    for (const row of editBox2.rows) {
      const targetPrice = editBox2Fn.execPrice(row);
      if (!Number.isFinite(targetPrice)) {
        return;
      }
      postList.push({
        id: row.id,
        price: targetPrice,
        start_time: editBox2.data.start_time,
        version: row.version,
      });
    }
    console.log('postList', postList);
    const loading = dialog.loading(undefined, '保存中...');
    let ok = 0;
    try {
      const results = await Promise.allSettled(
          postList.map(post =>
              api.post(api.url2.cost.material_price.save, post)
          )
      );
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          ok++;
        } else {
          dialog.error(`保存失败(ID: ${postList[index].id})`);
        }
      });
    } finally {
      loading?.close();
    }
    if (ok > 0) {
      dialog.success(`成功保存 ${ok} 条`);
      await reportRef.value.reportConfig.getData();
      editBox2Fn.close();
    }
  },
  close: () => {
    editBox2.data={};
    editBox2.isShow=false;
  },
  on:{
    afterClose: () => {
      editBox2Fn.close();
    }
  }
}



onMounted(() => {
  api.get(api.url2.cost.material_price.init).then(res => {
    table.tableConfig = {...table.tableConfig, ...res.table};
    vData.selectOptions = getOptionsLabel(res?.option);
    table.isInit = true;
  });

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
