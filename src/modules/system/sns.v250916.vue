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
  select_options: {user:[],type:[],user_type:[],user_status:[]},
})



const table = reactive({
  isInit: false,
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
});
const tableEvent = {
  bind: async (rows) => {
    if (rows?.length !== 1) {
      return dialog.warning('请选择一条数据');
    }
    const id = rows?.[0]?.id;
    if (!id) return;
    const uid = await dialog.selectAsync(vData.select_options.user, rows?.[0]?.uid, '请选择要绑定的用户');
    if(uid===false) return;
    if (await api.post(api.url.system.sns.bind, {id,uid})) {
      dialog.success('绑定成功');
      await report.value.reportConfig.getData();
    }
  },
  delete: async (rows) => {
    const id = rows.filter(item => item?.id).map(item => item.id);
    if (!await dialog.confirmAsync('确定要删除' + id.length + '条数据吗？','删除确认')) {
      return;
    }
    if (await api.post(api.url.system.sns.set, {id, status: -1})) {
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
};



const getSearchForm = () => {
  return [
    {type: 'select', field: 'type', options: {placeholder: '登录类型', options: vData.select_options.type}},
    {type: 'select', field: 'user_type', options: {placeholder: '用户类型', options: vData.select_options.user_type}},
    {type: 'select', field: 'status', options: {placeholder: '用户状态', options: vData.select_options.user_status}},
    {type: 'input', field: 'search', options: {placeholder: '搜索: 微信昵称/用户名/姓名'},style:{width: '500px'}},
  ]
}
const getMenus = () => {
  return {
       bind: {sort: 110, title: '绑定', icon: 'ri-links-line', listAction: (rows)=>tableEvent.bind(rows)},
       del: {sort: 160, title: '删除', icon: 'ri-delete-bin-line', listAction: (rows)=>tableEvent.delete(rows)},
  };
}


// 页面初始化
const initTable = async () => {
  const apiData = await api.get(api.url.system.sns.init);
  vData.select_options = getOptionsLabel(apiData?.option);
  vData.select_options.user = await api.localUserSelector();
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
      url: api.url.system.sns.list,
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

