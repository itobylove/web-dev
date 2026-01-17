<template>
  <div ref="box" class="mainPage">
    <TableComponent :class="'page_'+table.tableConfig.id" v-if="vData.tableInit" ref="table" v-bind="table"/>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref, watch} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";

const props=defineProps({
  job: {type: Object},
})

//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  tableInit:false,
  job: props.job,
})

const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
  },
  init:async () => {
    const loading = dialog.loading(undefined, '页面加载中...');
    const apiData = await api.get(api.url2.cost.item.init);
    loading && loading.close();
    table.selectOptions = getOptionsLabel(apiData?.option);
    await tableEvent.plantChange(siyi.user.plantId);
    for (const field in {status: 'status'}) {
      const searchIndex = table.searchConfig.search.findIndex(item => item.field === field);
      const optionField = table.searchConfig.search[searchIndex]['field'];
      table.searchConfig.search[searchIndex].options.options = [...table.selectOptions[optionField]];
    }
    table.tableConfig = {...table.tableConfig,...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
    vData.tableInit = true;
  }
}


const table = {
  selectOptions: {status: []},
  menuConfig: {
    menu: {
      search: {sort: 10},
      // add: {title: '添加', click: () => tableEvent.showEdit(), icon: 'ri-add-line', sort: 40},
      moreSettings: {sort: 90, title: '表格设置'},
    },
    defaultMenuShowList: ['search', 'moreSettings', 'pageExport', 'clearWhere'],
  },
  searchConfig: {
    search: [
      {type: 'select', field: 'plantId', style: {width: '100px'}, options: {multiple: false, placeholder: '工厂'},
        onChange: tableEvent.plantChange, value: vData.plant_id, load: 'factory'},
      {type: 'select', field: 'status', options: {placeholder: '状态', style: {width: '160px'}}},
    ]
  },
  tableConfig: {
    id:'',
    url: api.url2.cost.item.list,
    showCheck: true,
    useEncryptionFields: false,
    options: {
      select: {
        outsideClickDeselect: false,//点击外部区域是否取消选中。
      },
      heightMode: 'autoHeight',
    }
  },
}

// 页面初始化

onMounted(() => {
  tableEvent.init();
});

watch(props.job, (newValue, oldValue) => {
  vData.job= newValue;
})


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
