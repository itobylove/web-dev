<template>
  <div ref="box" class="box">
    <div class="header" v-if="props.enableHeader">
      <MenuComponent v-if="props.enableHeader&&menuConfig!==false" ref="menuRef" v-bind="menuConfig" :search="searchRef"/>
      <SearchComponent v-if="props.enableHeader&&searchConfig!==false" ref="searchRef" v-bind="searchConfig"/>
    </div>
    <div class="body">
      <div class="table">
        <div ref="report"></div>
      </div>
      <div v-if="footer!==false" class="footer">{{ footer }}</div>
    </div>
    <DialogComponent v-if="detail.show" v-bind="detail.dialogConfig">
      <div class="detail" :style="detail.style">
        <dl v-for="item in detail.data">
          <dt :style="detail.width">{{ item.title }}</dt>
          <dd>{{ item.value }}</dd>
        </dl>
      </div>
    </DialogComponent>
  </div>
</template>
<script setup>
import {onMounted, defineAsyncComponent, reactive, ref} from 'vue';
import _ from 'lodash';
import {ListTable} from '@visactor/vtable';
import * as tableFn from '@/core/script/tableFn';
import * as api from '@/core/script/api';
import apiUrl from '@/core/config/url';
import dialog from '@/core/script/dialog';
import siyi from '@/core/script/siyi';
import DialogComponent from '@/core/component/dialog.vue';
import MenuComponent from '@/core/component/menu.vue';
const SearchComponent = defineAsyncComponent(() => siyi.pc ? import('@/core/component/search.vue') : import('@/core/component/search_mobile.vue'));


const props = defineProps({
  enableHeader: {type: Boolean, default: true},//标题栏 true显示，false隐藏
  menuConfig: {type: [Object, Boolean], default: undefined},//菜单配置
  searchConfig: {type: [Object, Boolean], default: undefined},//搜索配置
  tableConfig: {type: Object, default: {}},//报表配置
  vTableConfig: {type: Object, default: undefined},//字节表格配置
  hideDetailField: {type: Array, default: []},//隐藏详细为空的字段 :hideEmpty 隐藏空 hideZero 隐藏0
  footer: {type: [Boolean, String], default: undefined},//隐藏表尾
  query: {type: Object, default: {}},//自定义query参数
  where: {type: Object, default: {}},//自定义where参数
});


const menuRef = ref();
const menuConfig = props.menuConfig === undefined ? siyi.nav?.query?.menu ? {menu: siyi.nav.query.menu} : {} : props.menuConfig;
const searchRef = ref();
const searchConfig = props.searchConfig === undefined ? siyi.nav?.query?.search ? {search: siyi.nav.query.search} : {} : props.searchConfig;


const box = ref();//容器
const footer = ref();//表尾
const report = ref();//表格
const reportConfig = _.merge({}, tableFn.defaultConfig(props.vTableConfig), {
  url: apiUrl.publicReport,//通用报表接口
  disablePage: true,//禁用分页
  getQuery: query => {
    return {
      exec: reportConfig.id,
      where: {...(searchConfig !== false ? searchRef.value.get() : {}), ...props.where},
      ...props.query,
      ...query
    }; //合并自定义参数
  },
  events: {
    dblclick_cell: ({originData}) => {//双击单元格
      if (originData?.index === undefined) return;//索引为undefined的行不处理
      detail.data = tableFn.detail(reportConfig, originData);
      if (detail.type.includes('hideEmpty')) detail.data = detail.data.filter(item => item.value.trim() !== '');
      if (detail.type.includes('hideZero')) detail.data = detail.data.filter(item => item.value * 1 !== 0);
      detail.show = true;
    }
  },
  getData: async (query = {}, loading = true) => {
    //第一步记录加载计时
    const startTime = Date.now();
    loading = loading ? dialog.loading(box.value) : null;
    //第二步合并用户的表格基本配置：如分页，冻结列
    const userConfig = reportConfig.useUserTableConfig ? await tableFn.mergeConfig(reportConfig) : {columns: []};
    //第三步获取数据
    const get = typeof reportConfig.get === 'function' ? reportConfig.get : api.get;
    reportConfig.data = await get(reportConfig.url, reportConfig.getQuery(query));
    //第四步创建表格
    tableFn.createTable(reportConfig, reportConfig.rowBeforCallback, reportConfig.colAfterCallback);
    //第五步合并用户自定的列配置信息
    await tableFn.mergeColumn(reportConfig, userConfig.columns);
    //第六步更新表格
    tableFn.update(reportConfig, reportConfig.emptyRow);
    if (props.searchConfig !== false) {
      searchRef.value.loadFilter();//第七步 生成快速过滤列
      searchRef.value.dataFilter();//第八步，过滤本地数据
    }
    //最后完成
    footer.value = props.footer === undefined ? tableFn.footerMessage(reportConfig, startTime) : props.footer;
    reportConfig.afterLoaded && await reportConfig.afterLoaded(reportConfig);//加载完成,回调
    loading && loading.close();
  }
}, siyi.nav.query?.tableConfig || {}, props.tableConfig);


if (menuConfig) menuConfig.table = reportConfig;
if (searchConfig) searchConfig.table = reportConfig;


//详情页
const detail = reactive({
  show: false,
  width: `width:${siyi.pc ? '160px' : '120px'}`,
  style: `grid-template-columns:${siyi.pc ? 'repeat(3,1fr)' : 'repeat(1,1fr)'}`,
  data: [],
  dialogConfig: {
    title: '详细数据', top: 'center', type: 'window', width: '80%', height: '90%',
    changeSize: siyi.pc, forceEnlarge:siyi.mobile,onAfterClose: () => detail.show = false
  },
  type: siyi.nav.query?.tableConfig?.hideDetailField || props.hideDetailField,
});


onMounted(() => {
  reportConfig.dom = report.value;
  reportConfig.box = box.value;
  reportConfig.table = new ListTable(report.value, reportConfig.options);
  // reportConfig.autoLoad && reportConfig.getData() 如果使用了搜索组件，内部会自动触发加载数，这里先取消，
  reportConfig.onLoaded && reportConfig.onLoaded(reportConfig);//加载表格配置后回调
});

defineExpose({reportConfig, search: searchRef, menu: menuRef});//暴露给父组件
</script>
<style scoped>
.box {
  width: 100%;
  height: 100%;
  padding: 2px;
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