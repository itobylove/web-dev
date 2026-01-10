<template>
  <div ref="box" v-if="vData.tableInit" :class="['mainPage','page-'+table.tableConfig.tableId]">
    <TableComponent  ref="tableRef" v-bind="table" style="flex: 7;"/>
    <t-tabs v-if="showChild" :default-value="1" class="page-tabs" size="medium">
      <t-tab-panel :value="1" label="工艺" >
        <StationProcessPage :station="vData.station"  />
      </t-tab-panel>
    </t-tabs>
    <dialogComponent v-if="form.isShow" v-bind="form.bind"  v-on="form.on"  >
      <t-form :data="form.data" :rules="form.rules" @submit="form.submit" v-bind="form.form">
        <t-row><t-col :span="11" >
          <t-form-item label="工厂" name="plant_id">
            <t-select v-model="form.data.plant_id"  :options="plantList" @change="form.change('plant_id', $event)"/>
          </t-form-item>
          <t-form-item label="工艺" name="process_ids">
            <t-select v-model="form.data.process_ids"  :options="form.selectOptions.process_ids" multiple filterable  @change="form.change('process_ids', $event)"/>
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="form.data.name" />
          </t-form-item>
          <t-form-item label="代码" name="code">
            <t-input v-model="form.data.code" />
          </t-form-item>
          <t-form-item label="排序" name="sort" >
            <t-input-number v-model="form.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"  placeholder="数字小靠前" />
          </t-form-item>
          <t-form-item label="状态" name="status" >
            <t-select v-model="form.data.status" :options="vData.selectOptions.status"/>
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" type="submit">提交</t-button>
          </t-form-item>
        </t-col></t-row>
      </t-form>
    </dialogComponent>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref, shallowRef, watch} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import dialogComponent from '@/core/component/dialog.vue'
import * as listTableFn from "@/core/script/tableFn.js";
import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import {plantList} from "@/utils/erp.js";
import dialog from "@/core/script/dialog.js";
import StationProcessPage from './bak/station_process.vue'
import {updateRow} from "@/core/script/tableFn.js";

const props = defineProps({
  query:{type:Object,default:{}},
  where:{type:Object,default:{}},
  showChild:{type:Boolean,default:false},
  tableConfig: {type: Object, default: {}},
});

const emit = defineEmits(['clickCell'])

//页面数据
const vData = reactive({
  plant_id: siyi.user.plantId,
  selectOptions: {status: [], process_ids: []},
  tableInit: false,
  station: {},
  ...props.query
})

const tableRef = ref()
const table = shallowRef();

const form=reactive({
  isShow:false,
  selectOptions: {process_ids:[]},
  data:{
    plant_id:vData.plant_id,
  },
  rules:{
    plant_id: [{required: true, message: '请选择工厂', trigger: 'change'},],
    // process_ids: [{required: true, message: '请选择工艺', trigger: 'change'},],
    name: [{required: true, message: '请输入名称', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '50%',
    height: '90%',
    title: "添加"
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },
  change: async (key,value) => {
    if(key === 'plant_id'){
      form.selectOptions.process_ids = vData.selectOptions.process_ids.filter(item => item.data.plant_id === value);
    }
  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.sys.station.save, form.data);
    loading && loading.close();
    if (res?.id){
      dialog.success('保存成功');
      const {list}= await api.get(api.url2.sys.station.list,{where:{id:res.id}})
      updateRow(tableRef.value.reportConfig, [list[0]],'id',false); // 更新单行
      form.close();
    }
  },
  close: () => {
    form.data={};
    form.isShow=false;
  },
  on:{
    afterClose: () => {
      form.close();
    }
  }
})


const tableEvent = {
  import: async () => {
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
      taskAll.push(api.post(api.url2.sys.station.save,{
        plant_id: vData.plant_id, name
      }));
    })
   const okList= (await Promise.all(taskAll)).filter(item => item);
    loading && loading.close();
    if (okList.length) {
      dialog.success('保存成功');
      await tableRef.value.reportConfig.getData();
    }else{
      dialog.warning('保存失败');
    }
  },
  showEdit: async (rows) => {
    const row = rows?.[0] || {};
    form.isShow=true;
    form.data={
      plant_id:vData.plant_id,
      status:1,
      ...row,
      process_ids:row?.process_ids || [],
    }
    form.bind.title=row?.id?'修改':'添加';
    await form.change('plant_id',form.data.plant_id);
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.sys.station.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await tableRef.value.reportConfig.getData();
    }
  },
};


// 页面初始化
const initTable = async () => {
  const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = vData.apiData = await api.get(api.url2.sys.station.init);
  loading && loading.close();
  vData.selectOptions = getOptionsLabel(apiData?.option);
  table.value = {
    menuConfig: {
      menu:{
        search: {sort: 10},
        add: {title: '添加', click: () => tableEvent.showEdit(), icon: 'ri-add-line', sort: 40},
        import: {title: '批量添加', click: () => tableEvent.import(), icon: 'ri-import-line', sort: 40},
        edit: {title: '修改', listAction: tableEvent.showEdit, icon: 'ri-edit-line', sort: 50},
        del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-del-line', sort: 60},
        moreSettings:{sort: 90,title:'表格设置'},
      },
      defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    },
    searchConfig: {
      search:[
        {type: 'select', field: 'plant_id',style: {width: '100px'}, options: {multiple:false,placeholder: '工厂'},value: vData.plant_id,load:'factory',
          onChange: (val) => {vData.plant_id = val;}},
        {type: 'select', field: 'status', options: {placeholder: '状态',style:{width:'160px'}, options: vData.selectOptions.status}},
      ],
    },
    where:{...props.where},
    tableConfig: {
      url: api.url2.sys.station.list,
      showCheck: true,
      disablePage: true,
      ...apiData.table,
      columns:listTableFn.createColumns(apiData.columns, apiData?.table?.columnSplit || '#'),
      events:{
        dblclick_cell: async ({originData,field}) => {
          if (!field) return ;
          await tableEvent.showEdit([originData]);
        },
        click_cell: async ({originData,field}) => {
          if (!field) return ;
          vData.station=originData;
          emit('clickCell', {type: 'step', data: originData});
        },
      },
      ...props.tableConfig
    },
  }
  vData.tableInit = true;
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
