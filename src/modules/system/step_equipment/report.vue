<template>
  <div ref="box" v-if="vData.tableInit" :class="['mainPage','page-'+table.tableConfig.tableId]">
    <TableComponent  ref="tableRef" v-bind="table" />
  </div>

</template>

<script setup>
import {onMounted, reactive, ref, shallowRef} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";
import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";
import {updateRow} from "@/core/script/tableFn.js";

const props = defineProps({
  query:{type:Object,default:{}},
});

const emit = defineEmits(['clickCell'])

//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  selectOptions: {status:[],process_ids:[]},
  tableInit:false,
  ...props.query
})

const tableRef = ref()
const table = shallowRef();

const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
  },
};


// 页面初始化
const initTable = async () => {
  // const loading = dialog.loading(undefined, '页面加载中...');
  const apiData = vData.apiData = await api.get(api.url2.sys.step.reportConfig);
  // loading && loading.close();
  vData.selectOptions = getOptionsLabel(apiData?.option);
  await tableEvent.plantChange(siyi.user.plantId);
  table.value = {
    menuConfig: {
      menu:{
        search: {sort: 10},
        moreSettings:{sort: 90,title:'表格设置'},
      },
      defaultMenuShowList:['search','moreSettings','pageExport'],
    },
    searchConfig: {
      search:[
        {type: 'select',field: 'plant_id',style: {width: '100px'}, options: {multiple:false,placeholder: '工厂'},
          onChange: async (val) => {vData.plant_id = val;await tableRef.value.reportConfig.getData();},value: vData.plant_id,load:'factory'},
      ],
    },
    tableConfig: {
      url: api.url2.sys.step.report,
      showCheck: false,
      disablePage: true,
      ...apiData.table,
      columns:listTableFn.createColumns(apiData.columns, apiData?.table?.columnSplit || '#'),
      events:{

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
