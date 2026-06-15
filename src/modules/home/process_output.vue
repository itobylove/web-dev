<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";

import editTodo from '@/modules/home/edit_todo.vue'
import down from '@/modules/home/down_todo.vue'
import {getQuery} from "@/core/script/nav.js";
import dayjs from "dayjs";

const mainTable = ref();

const refObj = reactive({
  mainTableShow: false,
});

const vData = reactive({
  selectOption:{statistical:[]},
})




const obj = {
  options: [],
  plantId: siyi.user.plantId,
  panelConfig: { destroyOnHide: false },
  mainTableConfig: {
    // footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'clearWhere', 'moreSettings', 'pageExport'],
      menu: {},
    },
    searchConfig: {
      search: [
        {type: 'rangeTime', options: {placeholder: '时间范围'}, value: [dayjs().format('YYYY-MM-DD 08:00:00'), dayjs().add(1, 'day').format('YYYY-MM-DD 08:00:00')], save: false },
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.process_output.list ,
      get: async (url, object) =>{
        const res = await api.post(url, {
          start_time: object.where[1]
          , end_time: object.where[2]
        });
        console.log(object)

        // refObj.mainTableShow = false;
        // obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig};
        // obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        // refObj.mainTableShow = true;


        mainTable.value.reportConfig.columns = res.columns;

        console.log(res.columns)
        return res.list;
      },
      showCheck: false , // 是否显示复选框
      checkField: 'check',
      disablePage: true,
      options: {
        frozenColCount: 3, // 冻结列
        maxCharactersNumber: 10000, // 设置单元格显示的最大字符数
        enableLineBreak: true, // 自动解析换行符
        defaultRowHeight: 'auto', // 行高
        autoWrapText: true,
        defaultHeaderRowHeight: 30,
      },
      events: {
        click_cell: args => {
          const record = mainTable.value?.reportConfig.table?.getCellOriginRecord(args.col, args.row)
        },
        dblclick_cell: args => { },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          if (changedValue===rawValue){
            return ;
          }
        },
      },
      colAfterCallback: (col) => {
        return col;
      },
    },
  },
}


onMounted(() => {
  // const loading = dialog.loading()
  // api.get(apiUrl.home.process_output.init).then(res => {
  //   vData.selectOption = res?.option;
  //   vData.uid = res?.option?.uid;
  //
  //   const serchFileds = ['statistical'];
  //   serchFileds.forEach(field => {
  //     const serchItem = obj.mainTableConfig.searchConfig.search.find(item => item.field === field);
  //     if (serchItem) serchItem.options.options = vData.selectOption[field] || [];
  //   })
  //   obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
  //   obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
  //   obj.options = res.option;
  //
  //   loading.close();
  // });

  refObj.mainTableShow = true;

});
</script>


<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;

  >.mainTable {
    height: 100%;
    flex-shrink: 0;
  }

  .t-tabs {
    flex: 1;
    flex-shrink: 0;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .t-tabs-panel {
    padding: 3px;
  }
}
</style>