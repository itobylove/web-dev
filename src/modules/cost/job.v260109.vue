<template>
  <div ref="box" class="mainPage" v-if="vData.tableInit">
    <TableComponent class="jobList" ref="tableRef" v-bind="table"/>
    <div class="contentPage">
      <div class="tab-menus">
        <t-button v-for="(label, i) in ['MI','BOM','拼版','钻带','叠构']" :key="i" theme="default"
                  :variant="vData.tabIndex === i ? 'base' : 'outline'" @click="vData.tabIndex = i"
        >{{ label }}</t-button>
      </div>
      <div class="tab-content" >
        <MiPage v-if="vData.tabIndex===0" :job="vData.job"/>
        <BomPage v-if="vData.tabIndex===1" :job="vData.job"/>
        <MixPage v-if="vData.tabIndex===2" :job="vData.job"/>
        <DrillPage v-if="vData.tabIndex===3" :job="vData.job"/>
        <StackupPage v-if="vData.tabIndex===4" :job="vData.job"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";
import * as selector from "@/core/config/select.js";

import MiPage from './job/mi.v260109.vue';
import BomPage from './job/table.v260109.vue';
import MixPage from './job/table.v260109.vue';
import DrillPage from './job/table.v260109.vue';
import StackupPage from './job/table.v260109.vue';

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
  delete: async () => {
    const selectRows = listTableFn.getSelectedRecords(tableRef.value.reportConfig)
    if (!selectRows?.length) {
      dialog.error('请选择要删除的数据');
      return;
    }
    const selectRowTitle=  selectRows[0].part_num + ' ' + selectRows[0].part_rev + (selectRows.length>1?(' 等（'+selectRows.length+'个）型号'):'');
    const confirm = await dialog.confirmAsync('确定要删除' +selectRowTitle + '吗？');
    if (!confirm) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.job.job.delete, {ids: selectRows.map(item=>item.id)});
    loading && loading.close();
    if (!res) return;
    dialog.success('删除成功');
    tableRef.value.reportConfig.getData();
  },
  import: async () => {
    const ids = await dialog.selectAsync([],'','请选择要导入的数据', {width:'800px',height:'200px'},{
      multiple: true,placeholder: '请输入型号筛选',clearable:true,minCollapsedNum:10,
      onSearch:async (val, obj)=>{
        const apiResult= (await selector.getOptions('job',val,{showMore:1})).map(item=> {return {...item,plantId:parseInt(item.plantId),value:parseInt(item.value)}});
        obj.select.options = [{value:'',label:'全选',checkAll:true},...apiResult.filter(item=> item.plantId === vData.plant_id)];
      },
    })
    if (!ids) return;
    const loading = dialog.loading(undefined, '导入中...');
    const res = await api.post(api.url2.job.job.import, {ids});
    loading && loading.close();
    if (!res) return ;
    dialog.success('导入成功');
    tableRef.value.reportConfig.getData();
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
      const optionField = table.searchConfig.search[searchIndex]?.['field'];
      if (optionField){
        table.searchConfig.search[searchIndex].options.options = [...table.selectOptions[optionField]];
      }
    }
    table.tableConfig = {
      ...table.tableConfig, ...apiData.table,
      columns: listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')
    };
    vData.tableInit = true;
  }
}

const tableRef=ref();
const table = {
  selectOptions: {status: []},
  menuConfig: {
    menu: {
      search: {sort: 10},
      add: {title: '导入', click: () => tableEvent.import(), icon: 'ri-add-line', sort: 40},
      del: {title: '删除', click: () => tableEvent.delete(), icon: 'ri-add-line', sort: 40},
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
    ]
  },
  tableConfig: {
    url: api.url2.job.job.list,
    showCheck: false,
    useEncryptionFields: false,
    options: {
      select: {outsideClickDeselect: false,}, // 点击外部区域是否取消选中
    },
    events:{
      click_cell: async ({originData,field}) => {
        if (!field) return ;
        vData.job= originData;
      },
      dblclick_cell: async ({originData,field}) => {
        if (!field) return ;
        vData.job= originData;
      },
    },
    afterLoaded:  (reportConfig) => {
      const firstRow = reportConfig.options.records[0];
      firstRow?.id && reportConfig.table.selectRow(1);
      table.tableConfig.events.click_cell({originData:firstRow,field:'id'})
    },
  },
}

// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(async () => {
  siyi.navHide = true
})


// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  siyi.navHide = false
})


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
    width: 500px
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
