<template>
  <div class="layout">
    <div class="layout-body">

      <TableComponent ref="tableView" v-bind="mainConfig"></TableComponent>
    </div>
    <div class="layout-foot">

    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref, shallowRef, watch} from "vue";
import TableComponent from '@/core/component/table_v2.vue';
import * as tableFn from "@/core/script/tableFn.js";
import dialog from "@/core/script/dialog.js";
import apiUrl from "@/core/config/url2.js";
import * as api from "@/core/script/api.js"

const tableView = ref({});
const props = defineProps({
  id: 0,
  url: '',
  title: '',
  type: ''
});
const url = {
  attach_user: {
    adds: apiUrl.sys.equipment.user.adds,
  }
};
const mainConfig = reactive({
  menuConfig: {
    defaultMenuShowList: [],
    menu: {
      add: {sort: 650, title: '保存', icon: 'ri-save-line', click: () => table_submit()}
    }
  },
  searchConfig: false,
  // footer: false,
  query: {id: props.id},
  tableConfig: {
    url: props.url,
    showCheck: true,
    disablePage: true,
    options: {rowSeriesNumber: false},
    columns: tableFn.createColumns(["check#复选框#H", "id#ID#F", "nickname#操作员#F", "status_text#状态#F", "sort#排序#HF"]),
    afterLoaded: () => {
      console.log('表格后置操作');
    }
  }
});

const table_submit = () => {
  api.post(
      url[props.type].adds,
      {id: props.id, users: tableFn.getCheckedRecords(tableView.value.reportConfig, 'id')}
  ).then(response => {

  });
}
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .layout-body {
    flex: 1;
  }
}
</style>