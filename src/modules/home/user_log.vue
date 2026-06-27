<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig"/>
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">


    </t-tabs>
  </div>
</template>

<script setup >
import {onMounted, reactive, ref} from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import * as core from "@/core/script/core.js";

const body = ref();
const mainTable = ref();


const refObj = reactive({
  mainTableShow: false,

  tab: 'userLogTable',
});

const obj = {
  tabsConfig: {
    theme: 'card',
    defaultValue: 'userTable',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  mainTableConfig: {
    menuConfig: {
      defaultMenuShowList: ['search', 'clearWhere', 'pageExport'],
    },
    searchConfig: {
      search: [
        {
          type: 'select',
          field: 'company',
          style: {width: '100px'},
          value: siyi.user.plantId,
          load: 'factory',
          options: {multiple: false, clearable: false},
          onChange: val => mainTable.value.reportConfig.getData({
            where: {company: val, page: 1 }
          }),
        },
        {
          type: 'rangeTime',
          field: 'date',
          value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
          options: {placeholder: '事件'}
        },{
          type: 'input',
          field:'username',
          options: {placeholder: '操作人员'}
        }
      ],
    },
    tableConfig: {
      url: apiUrl.home.userLog.list,
      showCheck: 'radio',
      disablePage: true,
      events: {
      },
    },
  },

}


onMounted(() => {
  console.log(siyi.user.plantId)
  // 表头信息
  api.get(apiUrl.home.userLog.mainConfig).then(res => {
    obj.mainTableConfig.tableConfig = {...obj.mainTableConfig.tableConfig, ...res.table}; // 表配置
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns); // 列配置
    refObj.mainTableShow = true;
  });


});
</script>


<style scoped>

</style>