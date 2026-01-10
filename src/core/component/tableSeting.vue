<template>
  <div class="content">
    <div class="header">
      <Menu v-bind="menuConfig"/>
    </div>
    <div class="body">
      <t-tabs v-model="tabsDom" v-bind="tabsConfig">
        <t-tab-panel class="tableSeting" value="fieldSeting" :destroyOnHide="false" label="表格设置">
          <t-space :size="4" class="row1">
            <t-input-adornment prepend="每页条数">
              <t-input-number v-model="pageNum" theme="column" :min="0" :disabled="props.table.disablePage"/>
            </t-input-adornment>
            <t-input-adornment prepend="左侧冻结列">
              <t-input-number v-model="frozenColCount" theme="column" :min="0"/>
            </t-input-adornment>
            <t-input-adornment prepend="右侧冻结列">
              <t-input-number v-model="rightFrozenColCount" theme="column" :min="0"/>
            </t-input-adornment>
          </t-space>
          <div class="table">
            <div ref="fieldTable"></div>
          </div>
        </t-tab-panel>
        <t-tab-panel class="menuSeting" value="menuSeting" :destroyOnHide="false" label="菜单设置">
          <div class="table">
            <div ref="menuTable">菜单设置功能开发中，感谢您的关注...</div>
          </div>
        </t-tab-panel>
        <t-tab-panel class="searchSeting" value="searchSeting" :destroyOnHide="false" label="搜索设置">
          <div class="table">
            <div ref="searchTable">搜索设置功能开发中，感谢您的关注...</div>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue';
import {ListTable} from '@visactor/vtable';
import _ from 'lodash';
import * as tableFn from '@/core/script/tableFn.js';
import VtableOptions from '@/core/script/tableOptions.js';
import dialog from '@/core/script/dialog.js';
import Menu from '@/core/component/menu.vue';


const props = defineProps({
  table: {type: Object},
  menu: {type: Object},
  search: {type: Object},
  dialog: {type: Object},
});


const menuConfig = {
  table: props.table,
  defaultMenuShowList: [],
  menu: {
    saveSettings: {title: '保存', icon: 'ri-save-line', click: () => save()},
    resetSettings: {title: '重置', icon: 'ri-reset-right-line', click: () => reset()},
  },
};


//  标签
const tabsDom = ref('fieldSeting');
const tabsConfig = {
  theme: 'card',
  swipeable: false,//禁止滑动 移动端的配置项
  defaultValue: 'fieldSeting',
  onChange(newValue) {
    tabsDom.value = newValue
    switch (newValue) {
      case 'menuSeting':
        // approveOptions.getData()
        break
      case 'searchSeting':
        // search.getData()
        break
    }
  }
};


const pageNum = ref(props.table.disablePage ? 9999999 : props.table.pageNum);  //  每页条数
const frozenColCount = ref(props.table.options.frozenColCount);    //  左侧冻结列
const rightFrozenColCount = ref(props.table.options.rightFrozenColCount); //  右侧冻结列

const defaultField = {showSort: false, cellType: 'checkbox', headerStyle: {textAlign: 'center'}, style: {textAlign: 'center'}};
// 字段设置
const fieldTable = ref();
const fieldTableConfig = _.merge({}, tableFn.defaultConfig(), {
  id: props.table.id + '_fieldSeting',  //id
  name: props.table.name + '-字段设置',     //报表名称
  options: _.merge({}, VtableOptions, {
    dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: {
      dragOrder: true,
    },
  }),
  columns: [
    {field: 'title', title: '列名', showSort: false, width: 220},
    {field: 'hide', title: '显示列', width: 70, ...defaultField},
    {field: 'encryption', title: '不加密', width: 70, ...defaultField},
    {field: 'max', title: '最大值', width: 70, ...defaultField},
    {field: 'min', title: '最小值', width: 70, ...defaultField},
    {field: 'avg', title: '平均值', width: 70, ...defaultField},
    {field: 'sum', title: '求和', width: 70, ...defaultField},
    {field: 'count', title: '普通统计', width: 80, ...defaultField},
    {field: 'onlycount', title: '去重统计', width: 80, ...defaultField},
    {field: 'none', title: '不聚合', width: 70, ...defaultField},
  ],
  getData() {
    fieldTableConfig.data = [];
    props.table.options.columns.forEach(col => {
      if (col.cellType !== 'checkbox' && col.disabledSeting === false) {
        fieldTableConfig.data.push({
          field: col.field,
          title: col.title,
          hide: !col.hide,
          encryption: {
            checked: col.encryption === undefined || col.encryption,
            disable: col.encryption === undefined,
          },
          max: col.aggregationType === 'MAX',
          min: col.aggregationType === 'MIN',
          avg: col.aggregationType === 'AVG',
          sum: col.aggregationType === 'SUM',
          count: col.aggregationType === 'COUNT',
          onlycount: col.aggregationType === 'ONLYCOUNT',
          none: col.aggregationType === 'NONE',
        })
      }
    })
    tableFn.createTable(fieldTableConfig);
    tableFn.update(fieldTableConfig, false);
  }
});


// 菜单设置
/*const menuTable = ref()
const menuTableOptions = _.merge({}, tableFn.defaultConfig(), {
  id: props.table.id + '_menuSeting',  //id
  name: props.table.name + '-菜单设置',     //报表名称
  dom: menuTable.value,                             //报表挂载的DOM节点
  options: _.merge({}, VtableOptions, {
    dragHeaderMode: 'none', //移动表头位置
    columnResizeMode: 'none', //拖动列宽模式
    rowSeriesNumber: {
      dragOrder: true,
    },
  }),
  columns: [
    {field: 'icon', title: '图标', showSort: false, width: 150},
    {field: 'name', title: '菜单名', showSort: false, width: 220},
    {field: 'nickname', title: '别名', showSort: false, width: 220},
    {field: 'enname', title: '代码', showSort: false, width: 220},
    {field: 'hide', title: '隐藏', ...defaultField width: 70},
  ],
  getData() {
    menuTableOptions.data = []
    for (const menu1 in props.menu) {
      const m = props.menu[menu1]
      menuTableOptions.data.push({
        icon: m.icon,
        name: m.title,
        nickname: '',
        hide: false,
        enname: m.key,
      })
    }
    tableFn.createTable(menuTableOptions)
    tableFn.update(menuTableOptions, false)
  }
})*/


const save = async () => {
  const listType = ['MAX', 'MIN', 'AVG', 'SUM', 'COUNT', 'ONLYCOUNT', 'NONE'];
  const allValue = [
    fieldTableConfig.table.getCheckboxState('max'),
    fieldTableConfig.table.getCheckboxState('min'),
    fieldTableConfig.table.getCheckboxState('avg'),
    fieldTableConfig.table.getCheckboxState('sum'),
    fieldTableConfig.table.getCheckboxState('count'),
    fieldTableConfig.table.getCheckboxState('onlycount'),
    fieldTableConfig.table.getCheckboxState('none'),
  ]
  const hide = fieldTableConfig.table.getCheckboxState('hide');
  const encryption = fieldTableConfig.table.getCheckboxState('encryption');
  //设置表格配置
  props.table.pageNum = pageNum.value;
  props.table.options.frozenColCount = frozenColCount.value;
  props.table.options.rightFrozenColCount = rightFrozenColCount.value;
  props.table.options.bottomFrozenRowCount = 0;
  const newColumns = [];
  fieldTableConfig.options.records.forEach((row, index) => {
    props.table.options.columns.forEach(col => {
      if (row.field === col.field) {
        col.hide = !hide[index];
        col.encryption = col.encryption === undefined ? undefined : encryption[index];
        allValue.forEach((item, i) => {
          if (item[index]) col.aggregationType = listType[i];
        });
        tableFn.aggregation(props.table, col);
        newColumns.push(col);
      }
    });
  });


  props.table.options.columns.forEach(col => {
    if (col.cellType === 'checkbox') newColumns.unshift(col);
  });


  // if (props.table.userConfig.table) {
  //   props.table.userConfig.table.columns = [];
  //   newColumns.forEach(col => {
  //     if (col.cellType !== 'checkbox') {
  //       props.table.userConfig.table.columns.push(col.field + col.title + (col.hide ? '#H' : ''));
  //     }
  //   });
  // }


  props.table.options.columns = newColumns
  tableFn.update(props.table)
  props.table.search = props.search?.get('save') || {}
  await tableFn.saveConfig(props.table)
  dialog.info('保存设置成功')
  props.dialog.close()
}


const reset = () => {
  dialog.confirm('您确定要重置配置吗？', async () => {
    await tableFn.resetConfig(props.table);
    props.table.getData();
    props.dialog.close();
    dialog.success('重置成功，正在重新加载数据');
  });
}

onMounted(() => {
  fieldTableConfig.table = new ListTable(fieldTable.value, fieldTableConfig.options);
  fieldTableConfig.dom = fieldTable.value;
  fieldTableConfig.getData();

  //为了修复自带功能没有事件冒泡阻止功能
  let defaultEvent = true;
  fieldTableConfig.table.on('click_cell', ({row, col}) => {
    if (fieldTableConfig.table.getCellValue(col, row).disable) return;
    if (col > 3) {
      for (let i = 4; i <= 10; i++) fieldTableConfig.table.setCellCheckboxState(i, row, i === col);
    } else if (col > 1 && defaultEvent) {
      fieldTableConfig.table.setCellCheckboxState(col, row, !fieldTableConfig.table.getCellCheckboxState(col, row));
    }
    defaultEvent = true;
  })
  fieldTableConfig.table.on('checkbox_state_change', () => defaultEvent = false);
})
</script>
<style scoped>
.content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .header {
    background-color: #f3f4f7;
    flex-shrink: 0;

    > .menu {
      border-bottom: 1px solid #e1e4e8;
    }
  }

  > .body {
    overflow: hidden;
    flex: 1;
    flex-shrink: 0;

    > .t-tabs > .t-tabs__content > .tableSeting {
      padding: 5px;

      > .t-space {
        margin-bottom: 5px;
      }

      > .row1 {
        width: 100%;
      }

      .t-input-adornment {
        width: 100%;

        > .t-input-number {
          width: 100%;
        }
      }

      .table {
        height: calc(100% - 36px);
      }
    }


    > .t-tabs > .t-tabs__content > div .table {
      width: 100%;
      height: 100%;
      position: relative;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        font-weight: bold;
      }
    }
  }
}
</style>