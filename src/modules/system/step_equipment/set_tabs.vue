<template>
  <div class="layout" v-if="info.tableShow">
    <t-tabs :default-value="1" v-model="info.tabsVal" @change="console.log('切换选卡')">
      <t-tab-panel v-for="(item,index) in tableData.data" :value="(index + 1)" :label="item.title">
        <div class="tabs-item">
          <TableTemplate ref="tableView" v-bind="item.mainPortConf"/>
        </div>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script setup>
import {ref, reactive, watch, onMounted} from "vue";
import apiUrl from "@/core/config/url2.js";
import * as api from "@/core/script/api.js";
import TableTemplate from '@/core/component/table_v2.vue';
import * as tableFn from "@/core/script/tableFn.js";
import dialogFn from "@/core/script/dialog.js";
import attachUserAdd from "@/modules/system/step_equipment/attach/attach_user_add.vue"; // 操作员添加模板
import attachAttrEdit from "@/modules/system/step_equipment/attach/attach_attr_edit.vue";// 属性编辑模板

// 被点击项索引:　props.data.index
// (工序、工艺、工段、设备)ID: props.data.id
// (工序、工艺、工段、设备)名称: props.data.name
// 工厂ID: props.data.plant_id
const props = defineProps({
  type: {type: String, default: "step"},
  data: {type: Object, default: {}},
  step: {type: Object, default: {}},
  process: {type: Object, default: {}},
  station: {type: Object, default: {}},
  equipment: {type: Object, default: {}},
})
const info = ref({
  id: props.data.id,
  plant_id: props.data.plant_id,
  tabsVal: 1,
  tableShow: false,
  template: {
    attach_user_add: attachUserAdd, // 操作员添加模板
    attach_attr_edit: attachAttrEdit, // 属性编辑模板
  },
  urls: {
    attach_user: { // 操作员相关url
      equipment: { // 设备操作员
        list: apiUrl.sys.equipment.user.user,
        edits: apiUrl.sys.equipment.user.edits,
        dels: apiUrl.sys.equipment.user.dels,
      }
    },
    attach_attr: { // 属性相关url
      step: { // 工序属性
        info: '',
        edits: ''
      },
      process: { // 工艺属性
        info: '',
        edits: ''
      },
      station: { // 工段属性
        info: '',
        edits: ''
      },
      equipment: { // 设备属性
        info: apiUrl.sys.equipment.attr,
        edits: ''
      }
    },
    attach_param: { // 参数相关url  工序
      process: { // 工艺参数
        info: '',
        adds: '',
        edits: '',
        dels: ''
      },
      station: { // 工段参数
        info: '',
        adds: '',
        edits: '',
        dels: ''
      }
    },
    type: {
      step: apiUrl.sys.step.attach,
      process: apiUrl.sys.process.attach,
      station: apiUrl.sys.station.attach,
      equipment: apiUrl.sys.equipment.attach
    }
  },
  menu: [],
});
const tableView = ref({});
const tableData = reactive({
      data: {type: Array, default: []}
    }
);
const fn = {
  getTabsKey: () => { // 取当前对应数组的key
    return info.value.tabsVal - 1;
  },
  getModel: () => { // 取当前对应的数据名称
    return tableData.data[fn.getTabsKey()].model;
  },
  getTemplate: (type = 'add') => { // 取对应的模板对象
    let name = fn.getModel().concat('_', type);
    return info.value.template[name];
  },
  getTitle: () => {
    return tableData.data[fn.getTabsKey()].title;
  },
  getUrl: (action = 'list') => {
    return info.value.urls[fn.getModel()][props.type][action];
  },
  getTableView: () => {
    return tableView.value?.[0]?.reportConfig ? tableView.value[0].reportConfig : tableView.value.reportConfig;
  },
  checkMenu: (name = 'edit') => { // 检查是否包含指定名称的按钮
    return info.value.menu[fn.getTabsKey()].includes(name); // true | false
  },
  getUrlModel: () => {
    return info.value.urls.type[props.type];
  },
  getConfig: () => {
    return props[props.type];
  },
  setConfig: (columns = [], data = [], menuBtn = []) => {
    return {
      menuConfig: {
        defaultMenuShowList: [],
        menu: {
          add: {
            sort: 650, title: '添加', icon: 'ri-add-line', hide: !menuBtn.includes('add'), click: () => {
              fn.menuAddBtn();
            }
          },
          edit: {
            sort: 651, title: '编辑', icon: 'ri-edit-line', hide: !menuBtn.includes('edit'), click: () => {
              let checkData = tableFn.getCheckedRecords(fn.getTableView());  // 获取的是数据ID,不是设备ID或用户ID
              if (!checkData.length) {
                dialogFn.warning("请勾选需要修改的【 " + fn.getTitle() + " 】");
                return;
              }
              fn.menuEditBtn(checkData);
              // fn.menuEditBtn();
            }
          },
          del: {
            sort: 652, title: '删除', icon: 'ri-delete-bin-2-line', hide: !menuBtn.includes('del'), click: () => {
              let checkData = tableFn.getCheckedRecords(fn.getTableView(), 'id').map((item) => item.id);  // 获取的是数据ID,不是设备ID或用户ID
              if (!checkData.length) {
                dialogFn.warning("请勾选需要删除的【 " + fn.getTitle() + " 】");
                return;
              }
              fn.menuDelBtn(checkData)
            }
          }
        }
      },
      searchConfig: false,
      tableConfig: {
        showCheck: true,
        disablePage: true,
        options: {rowSeriesNumber: false},
        columns: tableFn.createColumns(columns),
        get: () => {
          return data;
        },
        events: {
          dblclick_cell: async ({originData, field}) => { // 双击代表需要修改数据
            if (!menuBtn.includes('edit') || originData === undefined) return; // 如果菜单没有编辑按钮 或者 双击的是表头,则直接返回,不执行
            fn.eventsDblclickCell(originData, field);
          },
          click_cell: async ({originData, field}) => {
            fn.eventsClickCell(originData, field);
          },
          switch_state_change: (e) => { // 开关
            if (!e?.originData?.id) return;
            fn.eventSwitch(e.originData.id, e.checked);
          }
        }
      }
    }
  },
  menuAddBtn: () => { // 表格菜单添加按钮
    if (info.value.id === undefined) {
      dialogFn.warning("请选择需要操作的数据");
      return;
    }
    dialogFn.window(
        fn.getTemplate('add'),
        {
          id: info.value.id,
          plant_id: info.value.plant_id,
          url: fn.getUrl('list'),
          title: fn.getTitle(),
          type: fn.getModel(),
          getAttach: (e) => {
            // e.forEach(item => { // 有问题
            //   item['check'] = {'check':true,'disable':false};
            //   tableFn.addRow(fn.getTableView(), item); // 是在表前面新增
            //   console.log(item)
            // })
            fn.init(); // 重新请求,刷新数据
            // fn.getTableView().getData();
          }
        },
        {
          width: '700px',
          height: '500px',
          title: fn.getTitle() + " - 添加"
        }
    );
  },
  menuEditBtn: (originData = []) => { // 表格菜单修改按钮
    // console.log('type:' + props.type, ' > model:' + fn.getModel(), ' > Key:' + fn.getTabsKey());
    // console.log(originData);
    const dialog = dialogFn.window(fn.getTemplate('edit'),
        {
          type: props.type,
          model: fn.getModel(),
          data: originData[0],
          // data: props.data,
          config: fn.getConfig(),
          urls: {
            step: apiUrl.sys.step.edit,
            process: apiUrl.sys.process.edit,
            station: apiUrl.sys.station.save,
            equipment: apiUrl.sys.equipment.edit,
          },
          editsAttach: (resData) => {
            tableFn.updateRow(fn.getTableView(), resData);
            dialog.close();
          }
        },
        {
          width: '500px',
          height: 'auto',
          title: fn.getTitle() + " - 编辑"
        }
    );
  },
  menuDelBtn: async (ids) => { // 表格菜单删除按钮
    if (await dialogFn.confirmAsync("删除后不可恢复，请确认？", fn.getTitle() + " - 删除")) {
      let load = dialogFn.loading(undefined, '删除中，请稍候...');
      let res = await api.post(fn.getUrl('dels'), {ids: ids, plant_id: info.value.plant_id});
      load.close();
      if (res) {
        dialogFn.success("【 " + fn.getTitle() + " 】删除成功！");
        fn.init();
      }
    }
  },
  eventsDblclickCell: (originData, field) => { // 表格单元格双击事件
    if (originData?.id === undefined || !fn.checkMenu('edit')) return; // 如果没有得到ID,代表点的空行,不执行,或者返回的菜单没有指定的值
    fn.menuEditBtn([originData]);  // 当前双击的数据
  },
  eventsClickCell: (originData, field) => { // 表格单元格单击事件
    // console.log('单元格单击');
  },
  eventSwitch: async (id, status) => {
    api.get(fn.getUrl('edits'), {id, status}).then(res => {
      if (!res) {
        dialogFn.error('设备失败，请重试！');
      }
    });
  },
  init: () => {
    info.value.tableShow = false;
    api.get(fn.getUrlModel(), {id: props.data.id, plant_id: props.data.plant_id}).then((res) => {
      let data = [];
      res.list.forEach((item) => {
        data.push({
          title: item.title,
          model: item.model,
          mainPortConf: fn.setConfig(item.columns, item.list, item.menu)
        });
        info.value.menu.push(item.menu);
      })
      console.log('发送请求');
      tableData.data = data;
      info.value.tabsVal = 1;
      info.value.id = props.data.id;
      info.value.plant_id = props.data.plant_id;
      info.value.tableShow = true;
    });
  }
}
watch(() => [props.data], async (data, odata) => { //第一次加载页面时,不会触发
  console.log('数据变动');
  if (JSON.stringify(data) === JSON.stringify(odata)) return; // 如果新数据和旧数据一致,不执行
  let load = dialogFn.loading();
  fn.init();
  load.close();
});
onMounted(() => {
  // console.log(props);
  let load = dialogFn.loading();
  fn.init();
  load.close();
});
</script>
<style scoped>
.layout {
  .tabs-item {
    height: calc(40vh - 48px);
  }
}
</style>