<template>
  <div ref="boxRef" class="mainBox">
    <TableComponent ref="mainTable" v-if="refObj.mainShow" v-bind="obj.mainConfig"/>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import apiUrl from '@/core/config/url2';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import editPage from "@/modules/cost/quote_edit.vue";


const boxRef = ref();
const mainTable = ref();

const refObj = reactive({
  mainShow: false,
});

const obj = {
  mainConfig: {
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          sort: 152, title: '添加', icon: 'ri-add-line', click: () => {
            const _window = dialog.window(editPage, {
              close: async () => _window.close(),
            }, {
              title: '快速报价',
              width: '80%',
              height: '80%',
              forceEnlarge: true,
              onAfterClose: async () => {
              },
            });
          }
        },
      },
    },
    searchConfig: {
      search: [{
        type: 'select', field: 'plant_id', style: {width: '100px'}, value: siyi.user.plantId, load: 'factory',
        options: {multiple: false, clearable: false},
        onChange: val => mainTable.value.reportConfig.getData({where: {plant_id: val}}),
      }],
    },
    tableConfig: {
      url: apiUrl.sys.steps.list, showCheck: 'radio', disablePage: true,
    },
  },
}
onMounted(() => {
  api.get(apiUrl.sys.steps.config).then(res => {
    obj.mainConfig.tableConfig = {...obj.mainConfig.tableConfig, ...res.table};
    obj.mainConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.mainShow = true;
  });
});
</script>
