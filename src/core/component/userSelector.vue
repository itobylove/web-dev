<template>
  <div class="user-list">
    <TableComponent v-if="table.isInit" ref="reportRef" v-bind="getReportConfig()"/>
  </div>
</template>
<script setup>
import TableComponent from "@/core/component/table.vue";
import {onMounted, reactive, ref, watch} from "vue";
import * as api from "@/core/script/api.js";
import * as listTableFn from "@/core/script/tableFn.js";
import {getOptionsLabel} from "@/utils/vars.js";


const props = defineProps({
  query: {type: Object, default: {}},
  menu: {type: Object, default: {}},
  search: {type: Object, default: []},
  reportConfig: {type: Object, default: {}},
  tableConfig: {type: Object, default: {}},
  title: {type: String, default: '用户选择'},
})

const emits = defineEmits([
    'selected' // 选中
]);

const reportRef= ref();

const table = reactive({
  isInit: false,
  tableConfig:{...props.tableConfig},
  select_options:{status:{}},
  query:{type:1,status:1,dept_id: null, position_id: null,auth_item:null,orderBy:'u.id',...props.query},
});

const getReportConfig =  () => {
  return {
    dataFetcher: async (url,query) => {
      return await api.get(api.url.system.user.list,{...query,...table.query},'list');
    },
    defaultMenuShowList:['search','clearWhere'],
    menu: {
      select: {sort: 9999, title: '确定', icon: 'ri-check-line', listAction: (rows)=>emits('selected', rows)},
      ...props.menu
    },
    search:[
      ...props.search,
      {type: 'select', field: 'status', options: {placeholder: '状态', options: table.select_options.status,value:table.query.status}},
      {type: 'input', field: 'search', options: {placeholder: '搜索: 工号/姓名/手机号/ERP部门'},style:'width:500px'},
    ],
    tableConfig: {
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        }
      },
      ...table.tableConfig
    },
    ...props.reportConfig
  }
};

onMounted(async () => {
  const apiData = await api.get(api.url.system.user.init);
  table.select_options = getOptionsLabel(apiData?.option);
  table.tableConfig = {
    ...apiData.table,
    columns: listTableFn.createColumns(apiData.columns, apiData.table?.columnSplit || '#')
  };
  table.isInit = true;
})

// 监听父组件的query属性，重新查询
watch(() => props.query, (newVal) => {
  table.query = newVal;
  reportRef.value.reportOptions.getData();
}, { deep: true })

defineExpose({table:reportRef})


</script>
<style scoped>
.user-list{
  width: 100%;
  height: 100%
}
</style>