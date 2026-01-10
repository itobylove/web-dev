<template>
  <div ref="box" :class="['mainPage','page-'+table.tableConfig.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

const report = ref()

//页面数据
const vData=reactive({
  selectOptions: {user:[],type:[],user_type:[],user_status:[]},
})

const table = reactive({
  isInit: false,
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
});
const tableEvent = {
  delete: async (rows) => {
    const post= rows.map(item => {return {type:item.type,key:item.key}});
    if (!await dialog.confirmAsync('确定要删除' + post.length + '条数据吗？','删除确认')) {
      return;
    }
    if (await api.post(api.url.system.cache.delete, post)) {
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
};



const getSearchForm = () => {
  return [
    {type: 'select', field: 'type', options: {placeholder: '缓存类型', options: vData.selectOptions.type}},
  ]
}
const getMenus = () => {
  return {
    del: {sort: 160, title: '删除', icon: 'ri-delete-bin-line', listAction: (rows)=>tableEvent.delete(rows)},
  };
}


// 页面初始化
const initTable = async () => {
  const apiData = await api.get(api.url.system.cache.init);
  vData.selectOptions = getOptionsLabel(apiData?.option);
  table.tableConfig = {...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
  table.menu = getMenus();
  table.search = getSearchForm();
  table.isInit = true;
}

const getReportConfig = () => {
  return {
    menuConfig: {
      menu:table.menu,
      defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    },
    searchConfig: {
      search:table.search,
    },
    tableConfig: {
      url: api.url.system.cache.list,
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
        heightMode:'autoHeight',
      },
      ...table.tableConfig
    },
  }
};


onMounted(() => {
  initTable();
});



</script>

