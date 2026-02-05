<template>
  <div class="layout">
    <div class="layout-body">
      <TableComponent ref="tableView" v-bind="mainConfig"></TableComponent>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import TableComponent from '@/core/component/table_v2.vue';
import * as tableFn from "@/core/script/tableFn.js";
import dialog from "@/core/script/dialog.js";
import apiUrl from "@/core/config/url2.js";
import * as api from "@/core/script/api.js"

const tableView = ref({});
const props = defineProps({
  id: 0,
  plant_id: 0,
  url: '',
  title: '',
  type: '',
  dialog: {type: Object, default: {}},
  getAttach: {type: Function, default: () => true},
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
      save: {
        sort: 650, title: '保存', icon: 'ri-save-line', click: async () => {
          const load = dialog.loading(undefined, '数据保存中，请稍等···');
          const res = await api.post( // 数据原型: data:{code: 20000, message: "成功", data: true}   这里实际的res = data.data
              url[props.type].adds,  // url
              {id: props.id, users: tableFn.getCheckedRecords(tableView.value.reportConfig, 'id')}, // 参数
          );
          load.close();
          if (res) {
            dialog.success('保存成功!');
            props.dialog.close();
            props.getAttach(res.list);
          }
        }
      }
    }
  },
  searchConfig: false,
  query: {id: props.id},
  tableConfig: {
    url: props.url,
    showCheck: true,
    disablePage: true,
    options: {rowSeriesNumber: false},
    columns: tableFn.createColumns(["check#复选框#H","id#ID#F","username#用户编码","nickname#用户名称","status_text#状态#F","sort#排序#HF"]
    ),
    events: {
      dblclick: ()=>{
        // console.log(123);
      },
      click_cell: (e) => {
        // console.log(e);
      }
    }
  }
});
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