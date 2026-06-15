<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig"/>
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">

<!--      <t-tab-panel value="userTable" v-bind="obj.panelConfig" label="用户">-->
<!--        <TableComponent ref="userTable" v-if="refObj.userTableShow" v-bind="obj.userTableConfig"/>-->
<!--      </t-tab-panel>-->
<!--      -->
<!--      <t-tab-panel value="assetsTable" v-bind="obj.panelConfig" label="资产">-->
<!--        <TableComponent ref="assetsTable" v-if="refObj.assetsTableShow" v-bind="obj.assetsTableConfig"/>-->
<!--      </t-tab-panel>-->
<!--      -->
<!--      <t-tab-panel value="propertyTable" v-bind="obj.panelConfig" label="属性">后续开发中</t-tab-panel>-->

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
import addAsset from "@/modules/system/addAsset.vue";
import * as core from "@/core/script/core.js";

const body = ref();
const mainTable = ref();
const userTable = ref();
const assetsTable = ref();

const refObj = reactive({
  mainTableShow: false,
  // userTableShow: false,
  // assetsTableShow: false,
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
      // defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      // menu: {
      //   create: {},
      //   delete: {},
      //   update: {},
      // },
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
        // click_cell: args => {
        //   if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
            // userTable.value.reportConfig.getData({exec: null, id: args.originData.id, type: args.originData.type});
            // assetsTable.value.reportConfig.getData({exec: null, id: args.originData.id, type: args.originData.type});
          // }
        // }
      },
    },
  },
  // userTableConfig: {
  //   searchConfig: false,
  //   menuConfig: {
  //     defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
  //     menu: {
  //       create: {},
  //       delete: {}
  //     },
  //   },
  //   tableConfig: {url: apiUrl.home.asset1.userList, showCheck: 'multiple', disablePage: true},
  // },
  // assetsTableConfig: {
  //   searchConfig: false,
  //   menuConfig: {
  //     defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
  //     menu: {
  //       create: {},
  //       delete: {}
  //     },
  //   },
  //   tableConfig: {url: apiUrl.home.asset1.assetsList, showCheck: 'multiple', disablePage: true},
  // },
}


onMounted(() => {

  console.log('113', siyi.user.plantId)

  // 表头信息
  api.get(apiUrl.home.userLog.mainConfig).then(res => {
    obj.mainTableConfig.tableConfig = {...obj.mainTableConfig.tableConfig, ...res.table}; // 表配置
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns); // 列配置
    refObj.mainTableShow = true;
  });

  // api.get(apiUrl.home.asset1.userConfig).then(res => {
  //   obj.userTableConfig.tableConfig = {...obj.userTableConfig.tableConfig, ...res.table};
  //   obj.userTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
  //   refObj.userTableShow = true;
  // });

  // api.get(apiUrl.home.asset1.assetsConfig).then(res => {
  //   obj.assetsTableConfig.tableConfig = {...obj.assetsTableConfig.tableConfig, ...res.table};
  //   obj.assetsTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
  //   refObj.assetsTableShow = true;
  // });

});
</script>


<style scoped>

</style>