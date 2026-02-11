<template>
  <div ref="box" class="process">
    <TableComponent class="table" ref="process" v-if="refObj.processShow" v-bind="obj.processConfig"/>
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel value="assets" v-bind="obj.panelConfig" label="资产">
        <TableComponent ref="assets" v-if="refObj.assetsShow" v-bind="obj.assetsConfig"/>
      </t-tab-panel>
      <t-tab-panel value="user" v-bind="obj.panelConfig" label="人员">未来扩展，待开发</t-tab-panel>
    </t-tabs>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import apiUrl from '@/core/config/url2';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';

const box = ref();
const process = ref();
const assets = ref();

const refObj = reactive({
  processShow: false,
  assetsShow: false,
  tab: 'assets',
});

const obj = {
  tabsConfig: {
    theme: 'card',
    defaultValue: 'assets',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  processConfig: {
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {sort: 152, title: '添加', icon: 'ri-add-line', listAction: ''},
        delete: {sort: 153, title: '删除', icon: 'ri-add-line', listAction: ''}
      },
    },
    searchConfig: {
      search: [{
        type: 'select', field: 'plant_id', style: {width: '100px'}, value: siyi.user.plantId, load: 'factory',
        options: {multiple: false, clearable: false},
        onChange: val => process.value.reportConfig.getData({where: {plant_id: val}}),
      }],
    },
    tableConfig: {
      url: apiUrl.sys.process.list, showCheck: 'multiple', disablePage: true,
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== process.value.reportConfig.prveSelectRow.index) {
            assets.value.reportConfig.getData({exec: null, process_id: args.originData.id});
          }
        }
      },
    },
  },
  assetsConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {sort: 152, title: '添加', icon: 'ri-add-line', listAction: ''},
        delete: {sort: 153, title: '删除', icon: 'ri-add-line', listAction: ''}
      },
    },
    tableConfig: {url: apiUrl.sys.process.assetsList, showCheck: 'multiple', disablePage: true},
  },
}
onMounted(() => {
  api.get(apiUrl.sys.process.config).then(res => {
    obj.processConfig.tableConfig = {...obj.processConfig.tableConfig, ...res.table};
    obj.processConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.processShow = true;
  });
  api.get(apiUrl.sys.process.assetsConfig).then(res => {
    obj.assetsConfig.tableConfig = {...obj.assetsConfig.tableConfig, ...res.table};
    obj.assetsConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.assetsShow = true;
  });
});
</script>
<style scoped>
.process {
  display: flex;
  flex-direction: column;

  > .table {
    height: 400px;
    flex-shrink: 0;
  }

  .t-tabs {
    flex: 1;
    flex-shrink: 0;
    border-radius: 5px;
    border: 1px solid #ccc;
    margin: 0 2px 2px 2px;
  }
}
</style>