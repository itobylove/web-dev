<template>
  <div ref="box" class="tableBox">
    <div class="header" v-if="props.header">
      <MenuComponent v-if="props.header&&menu!==false" ref="menuRef" v-bind="menuConfig" :menu :defaultMenuShowList="props.defaultMenuShowList" :defaultMenuHideList="props.defaultMenuHideList" :table="reportOptions" :search="searchRef"/>
      <SearchComponent v-if="props.header&&search!==false" ref="searchRef" v-bind="searchConfig" :search :table="reportOptions" :filter="props.filter" :filterCallBack="props.filterCallBack"/>
    </div>
    <div class="body">
      <div class="table">
        <div ref="report"></div>
      </div>
      <div v-if="footer!==false" class="footer">{{ footer }}</div>
    </div>
    <dialogComponent v-if="detail.show" v-bind="detail.dialog">
      <div class="detail" :style="`grid-template-columns:${siyi.pc?'repeat(3,1fr)':'repeat(1,1fr)'}`">
        <dl v-for="item in detail.data">
          <dt :style="`width:${siyi.pc?'160px':'120px'}`">{{ item.title }}</dt>
          <dd>{{ item.value }}</dd>
        </dl>
      </div>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, defineAsyncComponent, reactive, ref} from 'vue'
import _ from 'lodash'
import {ListTable} from '@visactor/vtable'
import * as tableFn from '@/core/script/tableFn.js'
import * as api from '@/core/script/api.js'
import apiUrl from '@/core/config/url.js'
import dialog from '@/core/script/dialog.js'
import siyi from '@/core/script/siyi.js'
import dialogComponent from '@/core/component/dialog.vue'
import MenuComponent from '@/core/component/menu.vue'

const SearchComponent = defineAsyncComponent(() => siyi.pc ? import('@/core/component/search.vue') : import('@/core/component/search_mobile.vue'))
const searchRef = ref()
const menuRef = ref()
const props = defineProps({
  header: {type: Boolean, default: true},//标题栏 true显示，false隐藏
  menu: {type: [Object, Boolean], default: undefined},//菜单 todo 要拿掉
  defaultMenuShowList: {type: Array, default: undefined},//默认菜单白名单 todo 要拿掉
  defaultMenuHideList: {type: Array, default: siyi.pc ? undefined : ['advancedExport', 'moreSettings', 'saveSettings', 'resetSettings']},//默认菜单黑名单 todo 要拿掉
  search: {type: [Array, Boolean], default: undefined},//搜索 todo 要拿掉
  filter: {type: [Object, Boolean], default: {}},//右侧本地过滤 false为禁用 todo 要拿掉
  filterCallBack: {type: Function, default: () => 0},  //过滤后的回调 todo 要拿掉

  menuConfig: {type: [Object, Boolean], default: undefined},//菜单配置
  searchConfig: {type: [Object, Boolean], default: undefined},//搜索配置
  tableConfig: {type: Object, default: {}},//报表配置
  userConfig: {type: Object, default: {}},//用户配置 todo 要拿掉

  vTableOptions: {type: Object, default: undefined},//字节表格配置
  hideDetailField: {type: Array, default: []},//隐藏详细为空的字段 :hideEmpty 隐藏空 hideZero 隐藏0
  footer: {type: [Boolean, String], default: undefined},//隐藏表尾
  query: {type: Object, default: {}},//自定义query参数
  where: {type: Object, default: {}},//自定义where参数

  rowBeforCallback: {type: Function, default: undefined},//创建表格时行回调 todo 要拿掉
  colAfterCallback: {type: Function, default: undefined},//创建表格时列回调 todo 要拿掉
  dblclickCell: {type: [Function, Boolean], default: undefined},//双击单元格回调 todo 要拿掉
  clickCell: {type: [Function, Boolean], default: undefined},//单击单元格回调 todo 要拿掉
  changeCellValue: {type: Function, default: undefined},//单元格值改变后回调 todo 要拿掉
  events: {type: Object, default: {}},//自定义表格事件 todo 要拿掉

  onLoaded: {type: Function, default: undefined},//表格初始化完成后的回调
  afterLoaded: {type: Function, default: undefined},//数据加载完成后的回调
  dataFetcher: {type: Function, default: undefined},//自定义获取数据接口
  emptyRow: {type: Boolean, default: true},//渲染空行
})
const menu = props.menu === undefined ? siyi.nav?.query?.menu || {} : props.menu //todo 要拿掉
const search = props.search === undefined ? siyi.nav?.query?.search || [] : props.search// todo 要拿掉

const menuConfig = props.menuConfig === undefined ? siyi.nav?.query?.menu ? {menu: siyi.nav.query.menu} : {} : props.menuConfig
const searchConfig = props.searchConfig === undefined ? siyi.nav?.query?.search ? {search: siyi.nav.query.search} : {} : props.searchConfig


const footer = ref('')
const box = ref('')
const report = ref('')
const reportOptions = _.merge({}, tableFn.defaultConfig(props.vTableOptions), {
  url: apiUrl.publicReport,
  query: {},
  disablePage: true,
  userConfig: props.userConfig,
  getQuery: query => {
    return {
      exec: reportOptions.id,
      where: {...(search !== false ? searchRef.value.get() : {}), ...props.where},
      ...props.query,
      ...reportOptions.query,
      ...query
    } //合并自定义参数
  },
  getData: async (query = {}) => {
    //第一步记录加载计时
    const startTime = Date.now()
    const loading = dialog.loading(box.value)
    //第二步合并用户的表格基本配置：如分页，冻结列
    const userConfig = reportOptions.useUserTableConfig ? await tableFn.mergeConfig(reportOptions) : {columns: []}
    //第三步获取数据
    const dataFetcher = typeof props.dataFetcher === 'function' ? props.dataFetcher : api.get
    reportOptions.data = await dataFetcher(reportOptions.url, reportOptions.getQuery(query))
    //第四步创建表格
    tableFn.createTable(reportOptions, props.rowBeforCallback, props.colAfterCallback)
    //第五步合并用户自定的列配置信息
    await tableFn.mergeColumn(reportOptions, userConfig.columns)
    //第六步更新表格
    tableFn.update(reportOptions, props.emptyRow)
    if (search !== false) {
      //第七步 生成快速过滤列
      searchRef.value.loadFilter()
      //第八步，过滤本地数据
      searchRef.value.dataFilter()
    }
    //最后完成
    footer.value = props.footer === undefined ? tableFn.footerMessage(reportOptions, startTime) : props.footer
    props.afterLoaded && await props.afterLoaded(reportOptions)//加载完成,回调
    loading.close()
  }
}, siyi.nav.query?.tableConfig || {}, props.tableConfig)


//详情页
const detail = reactive({
  show: false,
  data: [],
  dialog: {title: '详细数据', top: 'center', type: 'window', width: '80%', height: '90%', changeSize: siyi.pc,forceEnlarge:siyi.mobile, onAfterClose: () => detail.show = false},
  type: siyi.nav.query?.tableConfig?.hideDetailField || props.hideDetailField,
})


//双击单元格显示详细
const dblclickCell = ({originData}) => {
  if (originData?.index === undefined) return
  detail.data = tableFn.detail(reportOptions, originData)
  if (detail.type.includes('hideEmpty')) detail.data = detail.data.filter(item => item.value.trim() !== '')
  if (detail.type.includes('hideZero')) detail.data = detail.data.filter(item => item.value !== '0')
  detail.show = true
}

//单击单元格
const clickCell = ({originData}) => {
  reportOptions.prveSelectRow = reportOptions.selectRow
  reportOptions.selectRow = originData
}


onMounted(() => {
  reportOptions.dom = report.value
  reportOptions.box = box.value
  reportOptions.table = new ListTable(report.value, reportOptions.options)
  // reportOptions.autoLoad && reportOptions.getData() 如果使用了搜索组件，内部会自动触发加载数，这里先取消，
  props.onLoaded && props.onLoaded(reportOptions);//加载表格配置后回调
  props.changeCellValue && reportOptions.table.on('change_cell_value', props.changeCellValue) //单元格值改变
  props.clickCell !== false && reportOptions.table.on('click_cell', props.clickCell || clickCell) //单击单元格
  props.dblclickCell !== false && reportOptions.table.on('dblclick_cell', props.dblclickCell || dblclickCell) //双击 - 显示详情
  for (const eventName in props.events) reportOptions.table.on(eventName, props.events[eventName])// 遍历自定义 events 事件
})

defineExpose({reportOptions, search: searchRef, menu: menuRef})
</script>
<style scoped>
.tableBox {
  width: 100%;
  height: 100%;
  padding: 5px;
  position: relative;
  display: flex;
  flex-direction: column;

  > .header {
    flex-shrink: 0;
    border: 1px solid #c9d0da;
    border-bottom: 0 none;
    border-radius: 5px 5px 0 0;
    background-color: #f3f4f7;
    display: flex;
    flex-direction: column;
  }

  > .body {
    flex: 1;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    > .table {
      flex: 1;
      flex-shrink: 0;
      position: relative;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
      }
    }

    > .footer {
      flex-shrink: 0;
      height: 28px;
      padding: 0 5px;
      font-size: 13px;
      overflow: auto hidden;
      white-space: nowrap;
      border: 1px solid #c9d0da;
      border-top: 0 none;
      border-radius: 0 0 5px 5px;
      display: flex;
      align-items: center;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}

.detail {
  display: grid;

  > dl {
    font-size: 16px;
    display: flex;

    > dt, > dd {
      flex-shrink: 0;
      line-height: 20px;
      word-break: break-word;
      border-bottom: 1px solid #c9d0da;
      border-right: 1px solid #c9d0da;
      display: flex;
      align-items: center;
      padding: 10px 5px;
    }

    > dt {
      min-width: 120px;
      background-color: #f3f4f7;
    }

    > dd {
      flex: 1;
    }
  }
}
</style>