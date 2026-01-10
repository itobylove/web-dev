<template>
  <div class="menu">
    <button v-for="item in menuList" @click="item.click"><i :class="item.icon"></i>{{ item.title }}</button>
  </div>
</template>
<script setup>
import _ from 'lodash'
import {ref, watch} from 'vue'
import * as core from '@/core/script/core.js'
import * as tableFn from '@/core/script/tableFn.js'
import dialog from '@/core/script/dialog.js'
import siyi from '@/core/script/siyi.js'

//数组中为对象，一个对象为一个控件，options:腾讯所支持的属于，on:腾讯所支持事件，icon:图标，title:标题
const props = defineProps({
  menu: {type: Object, default: siyi.nav?.query?.menu || {}},//菜单
  defaultMenuShowList: {type: Array, default: undefined},//默认菜单白名单
  defaultMenuHideList: {type: Array, default: undefined},//默认菜单黑名单
  search: {type: Object, default: {}},//搜索组件
  table: {type: Object, default: {}},//表格组件
})

//菜单列表
const menuList = ref([])

//默认菜单
const defaults = {
  search: {
    sort: 100,
    title: '查询',
    icon: 'ri-search-line',
    click: () => {
      const time = props.search?.checkRangeTime?.()
      if (time > 0) {
        dialog.warning(`时间范围不能超过${time}天，请使用高级导出`)
      } else {
        props.search?.clearLocalFilter?.()
        props.table.page = 1
        props.table.getData()
      }
    }
  },
  prevPage: {
    sort: 200,
    title: '上一页',
    icon: 'ri-arrow-up-s-line',
    click() {
      props.table.page--
      if (props.table.page >= 1) props.table.getData()
      props.table.page = Math.max(props.table.page, 1)
    },
  },
  nextPage: {
    sort: 300,
    title: '下一页',
    icon: 'ri-arrow-down-s-line',
    click() {
      if (props.table.data.length === props.table.pageNum) {
        props.table.page++
        props.table.getData()
      }
    },
  },
  submitApprove: {
    sort: 400,
    title: '提交',
    icon: 'ri-share-box-line',
    click: () => dialog.info('此模块没有此功能'),
  },
  resetApprove: {
    sort: 500,
    title: '撤回',
    icon: 'ri-arrow-go-back-line',
    click: () => dialog.info('此模块没有此功能'),
  },
  approve: {
    sort: 600,
    title: '审批',
    icon: 'ri-quill-pen-ai-line',
    click: () => tableFn.approve({table: props.table, detail: tableFn.detail(props.table, props.table.selectRow)}),
  },
  moreSettings: {
    sort: 700,
    title: '设置',
    icon: 'ri-settings-3-line',
    click: () => tableFn.seting({table: props.table, search: props.search, menu: menuList.value}),
  },
  pageExport: {
    sort: 800,
    title: '导出本页',
    icon: 'ri-file-excel-2-line',
    click: () => core.files.exportExcel({
      data: props.table.options.records,
      columns: props.table.options.columns,
      fileName: siyi.user.nickname + '.' + props.table.name,
    }),
  },
  advancedExport: {
    sort: 900,
    title: '高级导出',
    icon: 'ri-file-excel-2-line',
    click: () => tableFn.exportData({table: props.table, search: props.search?.search.searchList}),
  },
  clearWhere: {
    sort: 1000,
    title: '清空条件',
    icon: 'ri-brush-3-line',
    click: () => {
      props.search?.clearWhere()
      props.search?.clearLocalFilter()
    },
  },
  clearCache: {
    sort: 1100,
    title: '清空缓存',
    icon: 'ri-history-line',
    click: async () => {
      const time = props.search?.checkRangeTime()
      if (time > 0) {
        dialog.warning(`时间范围不能超过${time}天，请使用高级导出`)
      } else {
        props.search?.clearLocalFilter()
        props.table.page = 1
        props.table.getData({clearCache: true})
      }
    },
  },
}

//列表选择事件回调
const listActionFn = callback => {
  const checkedRows = tableFn.getCheckedRecords(props.table) // 获取已选中数据
  if (checkedRows?.length < 1) return dialog.warning('请勾选数据')
  callback(checkedRows, props.table)
}

// 判断菜单是否显示
const menuFilter = (key) => {
  if (props.menu[key]?.['hide']) return false; // 禁用菜单
  if (props.menu[key]) return true// 如果传过来菜单，不进黑白名单限制
  if (Array.isArray(props.defaultMenuShowList) && !props.defaultMenuShowList.includes(key)) return false// 启用了白名单，且不包含该 key，则隐藏
  if (Array.isArray(props.defaultMenuHideList) && props.defaultMenuHideList.includes(key)) return false// 启用了黑名单，且包含该 key，则隐藏
  if (['prevPage', 'nextPage'].includes(key) && props.table?.disablePage) return false// 禁用了分页，且 key 是分页按钮，则隐藏
  return true
};

// 获取菜单
const menus = {}
const load = () => {
  // 1. 覆盖合并菜单
  const data = {...defaults}
  for (const key in props.menu) {
    data[key] = _.merge(
        {title: '', icon: '', sort: 9999, click: () => console.log('没有定义逻辑')},// 原始配置
        data?.[key] || {},  // 默认菜单
        props.menu[key],    // 自定义菜单
    )
  }
  //  2. 事件处理和过滤
  for (const key in data) {
    if (menuFilter(key)) {
      const item = data[key]
      menus[key] = {...item, key, click: item?.listAction ? () => listActionFn(item.listAction) : item.click}
    }
  }
  // 3. 排序展示
  menuList.value = Object.values(menus).sort((a, b) => a.sort - b.sort)
}
watch(() => props.menu, (newVal, oldVal) => load(), {immediate: true, deep: true}) // 如果希望在组件初始化时也执行一次

defineExpose({menu: menus})

</script>
<style scoped>
.menu {
  flex-shrink: 0;
  padding: 2px;
  overflow: auto hidden;
  white-space: nowrap;
  user-select: none;
  display: flex;

  &::-webkit-scrollbar {
    display: none;
  }

  > button {
    flex-shrink: 0;
    border: 0 none;
    outline: 0 none;
    font-size: 13px;
    line-height: 30px;
    padding: 0 10px;
    background-color: transparent;
    transition: all .2s ease-out;
    border-radius: 2px;
    cursor: pointer;

    &:hover {
      background-color: #dadce3;
    }
  }
}

.search + .menu {
  border-top: 1px solid #c9d0da;
}

.localFilter + .menu {
  border-top: 1px solid #c9d0da;
}
</style>