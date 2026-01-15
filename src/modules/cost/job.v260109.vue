<template>
  <div ref="box" class="mainPage" v-if="vData.tableInit">
    <TableComponent class="jobList" ref="table" v-bind="table"/>
    <div class="contentPage">
      <div class="tab-menus">
        <t-button theme="default" @click="vData.tabIndex=0">按钮</t-button>
        <t-button theme="default" @click="vData.tabIndex=1">按钮</t-button>
        <t-button theme="default" @click="vData.tabIndex=2">按钮</t-button>
        <t-button theme="default" @click="vData.tabIndex=3">按钮</t-button>
      </div>
      <div class="tab-content" v-if="vData.job">
        <MiPage v-show="vData.tabIndex===0" :job="vData.job"/>
        <BomPage v-show="vData.tabIndex===1" :job="vData.job"/>
        <MixPage v-show="vData.tabIndex===2" :job="vData.job"/>
        <DrillPage v-show="vData.tabIndex===3" :job="vData.job"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";

import MiPage from './job/mi.v260109.vue';
import BomPage from './job/table.v260109.vue';
import MixPage from './job/table.v260109.vue';
import DrillPage from './job/table.v260109.vue';

//页面数据
const vData = reactive({
  plant_id: siyi.user.plantId,
  tableInit: false,
  job: null,
  tabIndex:0,
})

const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
  },
  init: async () => {
    const loading = dialog.loading(undefined, '页面加载中...');
    const apiData = await api.get(api.url2.job.job.init);
    loading && loading.close();
    table.selectOptions = getOptionsLabel(apiData?.option);
    await tableEvent.plantChange(siyi.user.plantId);
    const searchOptionFields = {status: 'status'};
    for (const field in searchOptionFields) {
      const searchIndex = table.searchConfig.search.findIndex(item => item.field === field);
      const optionField = table.searchConfig.search[searchIndex]['field'];
      table.searchConfig.search[searchIndex].options.options = [...table.selectOptions[optionField]];
    }
    table.tableConfig = {
      ...table.tableConfig, ...apiData.table,
      columns: listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')
    };
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
    defaultMenuShowList: ['search', 'moreSettings', 'clearWhere'],
  },
  searchConfig: {
    search: [
      {
        type: 'select', field: 'plantId', style: {width: '100px'}, options: {multiple: false, placeholder: '工厂'},
        onChange: tableEvent.plantChange, value: vData.plant_id, load: 'factory'
      },
      {type: 'select', field: 'status', options: {placeholder: '状态', style: {width: '160px'}}},
    ]
  },
  tableConfig: {
    url: api.url2.job.job.list,
    showCheck: false,
    useEncryptionFields: false,
    events:{
      click_cell: async ({originData,field}) => {
        if (!field) return ;
        vData.job= originData;
        console.log('click_cell',originData)
      },
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        vData.job= originData;
        console.log('dblclick_cell',originData)
      },
    },
  },
}

// 页面初始化

onMounted(() => {
  tableEvent.init();
});

</script>

<style scoped>
.mainPage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  .jobList {
    width: 300px
  }

  .contentPage {
    flex: 1;
    display: flex;
    flex-direction: column;

    .tab-menus {
      display: flex;
      flex-wrap: wrap;

      .t-button {
        margin: 2px;
      }
    }

    .tab-content {
      flex: 1;
    }
  }
}
</style>
