<template>
  <div ref="box" class="steps">
    <TableComponent class="table" ref="steps" v-if="refObj.stepsShow" v-bind="obj.stepsConfig"/>
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel value="process" v-bind="obj.panelConfig" label="工艺">
        <TableComponent ref="process" v-if="refObj.processShow" v-bind="obj.processConfig"/>
      </t-tab-panel>
      <t-tab-panel value="assets" v-bind="obj.panelConfig" label="资产">未来扩展，待开发</t-tab-panel>
      <t-tab-panel value="user" v-bind="obj.panelConfig" label="过数员">未来扩展，待开发</t-tab-panel>
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
const steps = ref();
const process = ref();

const refObj = reactive({
  stepsShow: false,
  processShow: false,
  tab: 'process',
});

const obj = {
  tabsConfig: {
    theme: 'card',
    defaultValue: 'process',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  stepsConfig: {
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
        onChange: val => steps.value.reportConfig.getData({where: {plant_id: val}}),
      }],
    },
    tableConfig: {
      url: apiUrl.sys.steps.list, showCheck: 'radio', disablePage: true,
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== steps.value.reportConfig.prveSelectRow.index) {
            process.value.reportConfig.getData({exec: null, step_id: args.originData.id});
          }
        }
      },
    },
  },
  processConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {sort: 152, title: '添加', icon: 'ri-add-line', listAction: ''},
        delete: {sort: 153, title: '删除', icon: 'ri-add-line', listAction: ''}
      },
    },
    tableConfig: {url: apiUrl.sys.steps.processList, showCheck: 'multiple', disablePage: true},
  },
}
onMounted(() => {
  api.get(apiUrl.sys.steps.config).then(res => {
    obj.stepsConfig.tableConfig = {...obj.stepsConfig.tableConfig, ...res.table};
    obj.stepsConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.stepsShow = true;
  });
  api.get(apiUrl.sys.steps.processConfig).then(res => {
    obj.processConfig.tableConfig = {...obj.processConfig.tableConfig, ...res.table};
    obj.processConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.processShow = true;
  });
});
</script>
<style scoped>
.steps {
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