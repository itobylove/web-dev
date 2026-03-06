<template>
  <div ref="box" class="box" :style="refObj.boxStyle">
    <div class="header" v-if="obj.menuConfig!==false||obj.searchConfig!==false">
      <MenuComponent v-if="obj.menuConfig!==false" ref="menu" v-bind="obj.menuConfig"/>
      <SearchComponent v-if="obj.searchConfig!==false" ref="search" v-bind="obj.searchConfig"/>
    </div>
    <div class="body">
      <div class="table">
        <div ref="table"></div>
      </div>
      <div v-if="footer!==false" class="footer">{{ footer }}</div>
    </div>
    <i class="size left" v-if="props.changeSizeLeft" @mousedown.stop="obj.mousedown('left',$event)" @mouseup.stop="obj.mouseup()"></i>
    <i class="size top" v-if="props.changeSizeTop" @mousedown.stop="obj.mousedown('top',$event)" @mouseup.stop="obj.mouseup()"></i>
    <i class="size right" v-if="props.changeSizeRight" @mousedown.stop="obj.mousedown('right',$event)" @mouseup.stop="obj.mouseup()"></i>
    <i class="size bottom" v-if="props.changeSizeBottom" @mousedown.stop="obj.mousedown('bottom',$event)" @mouseup.stop="obj.mouseup()"></i>
    <i class="size lefttop" v-if="props.changeSizeLeftTop" @mousedown.stop="obj.mousedown('lefttop',$event)" @mouseup.stop="obj.mouseup()"></i>
    <i class="size righttop" v-if="props.changeSizeRightTop" @mousedown.stop="obj.mousedown('righttop',$event)" @mouseup.stop="obj.mouseup()"></i>
    <i class="size rightbottom" v-if="props.changeSizeRightBottom" @mousedown.stop="obj.mousedown('rightbottom',$event)" @mouseup.stop="obj.mouseup()"></i>
    <i class="size leftbottom" v-if="props.changeSizeLeftBottom" @mousedown.stop="obj.mousedown('leftbottom',$event)" @mouseup.stop="obj.mouseup()"></i>
    <DialogComponent v-if="refObj.detailShow" v-bind="obj.detail.dialogConfig">
      <div class="detail" :style="obj.detail.style">
        <dl v-for="item in obj.detail.data">
          <dt :style="obj.detail.width">{{ item.title }}</dt>
          <dd>{{ item.value }}</dd>
        </dl>
      </div>
    </DialogComponent>
  </div>
</template>
<script setup>
import {onMounted, defineAsyncComponent, reactive, ref, onBeforeUnmount} from 'vue';
import _ from 'lodash';
import {ListTable} from '@visactor/vtable';
import * as tableFn from '@/core/script/tableFn';
import * as api from '@/core/script/api';
import apiUrl from '@/core/config/url';
import dialog from '@/core/script/dialog';
import siyi from '@/core/script/siyi';
import DialogComponent from '@/core/component/dialog.vue';
import MenuComponent from '@/core/component/menu.vue';
import * as core from "@/core/script/core.js";

const SearchComponent = defineAsyncComponent(() => siyi.pc ? import('@/core/component/search.vue') : import('@/core/component/search_mobile.vue'));

const props = defineProps({
  menuConfig: {type: [Object, Boolean], default: undefined},//菜单配置
  searchConfig: {type: [Object, Boolean], default: undefined},//搜索配置
  tableConfig: {type: Object, default: {}},//报表配置
  vTableConfig: {type: Object, default: undefined},//字节表格配置
  hideDetailField: {type: Array, default: []},//隐藏详细为空的字段 :hideEmpty 隐藏空 hideZero 隐藏0
  detailBlacklistField: {type: Array, default: undefined},//详细黑名单字段
  detailWhitelistField: {type: Array, default: undefined},//详细白名单字段
  footer: {type: [Boolean, String], default: undefined},//隐藏表尾
  query: {type: Object, default: {}},//自定义query参数
  where: {type: Object, default: {}},//自定义where参数
  changeSizeLeft: {type: Boolean, default: false},//左拖拽宽度默认关闭
  changeSizeTop: {type: Boolean, default: false},//上拖拽宽度默认关闭
  changeSizeRight: {type: Boolean, default: false},//右拖拽宽度默认关闭
  changeSizeBottom: {type: Boolean, default: false},//下拖拽宽度默认关闭
  changeSizeLeftTop: {type: Boolean, default: false},//左上拖拽宽度默认关闭
  changeSizeRightTop: {type: Boolean, default: false},//右上拖拽宽度默认关闭
  changeSizeRightBottom: {type: Boolean, default: false},//右下拖拽宽度默认关闭
  changeSizeLeftBottom: {type: Boolean, default: false},//左下拖拽宽度默认关闭
});


const menu = ref();
const search = ref();
const box = ref();//容器
const table = ref();//表格
const footer = ref(props.footer);


const refObj = reactive({
  boxStyle: {},
  detailShow: false,
});


const obj = {
  menuConfig: props.menuConfig === undefined ? siyi.nav?.query?.menu ? {menu: siyi.nav.query.menu} : {} : props.menuConfig,
  searchConfig: props.searchConfig === undefined ? siyi.nav?.query?.search ? {search: siyi.nav.query.search} : {} : props.searchConfig,
  reportConfig: _.merge({}, tableFn.defaultConfig(props.vTableConfig), {
    url: apiUrl.publicReport,//通用报表接口
    disablePage: true,//禁用分页
    getQuery: query => {
      return {
        exec: obj.reportConfig.id,
        where: {...(obj.searchConfig === false ? {} : (search.value?.get() || {})), ...props.where},
        ...props.query,
        ...query
      }; //合并自定义参数
    },
    events: {
      dblclick_cell: ({originData, field}) => {//双击单元格
        if (originData?.index === undefined) return;//索引为undefined的行不处理
        obj.detail.show(originData, field);
      }
    },
    getData: async (query = {}, loading = true) => {
      //第一步记录加载计时
      const startTime = Date.now();
      loading = loading ? dialog.loading(box.value) : null;
      //第二步合并用户的表格基本配置：如分页，冻结列
      const userConfig = obj.reportConfig.useUserTableConfig ? await tableFn.mergeConfig(obj.reportConfig) : {columns: []};
      //第三步获取数据
      const get = typeof obj.reportConfig.get === 'function' ? obj.reportConfig.get : api.get;
      obj.reportConfig.data = await get(obj.reportConfig.url, obj.reportConfig.getQuery(query));
      //第四步创建表格
      tableFn.createTable(obj.reportConfig);
      //第五步合并用户自定的列配置信息
      await tableFn.mergeColumn(obj.reportConfig, userConfig.columns);
      //第六步更新表格
      tableFn.update(obj.reportConfig, obj.reportConfig.emptyRow);
      if (obj.searchConfig !== false) {
        search.value.loadFilter();//第七步 生成快速过滤列
        search.value.dataFilter();//第八步，过滤本地数据
      }
      //最后完成
      footer.value = footer.value === undefined ? tableFn.footerMessage(obj.reportConfig, startTime) : props.footer;
      typeof obj.reportConfig.afterLoaded === 'function' && await obj.reportConfig.afterLoaded(obj.reportConfig);//加载完成,回调
      loading && loading.close();
    }
  }, siyi.nav.query?.tableConfig || {}, props.tableConfig),
  detail: {
    data: [],
    width: `width:${siyi.pc ? '160px' : '120px'}`,
    style: `grid-template-columns:${siyi.pc ? 'repeat(3,1fr)' : 'repeat(1,1fr)'}`,
    dialogConfig: {
      title: '详细数据', top: 'center', type: 'window', width: '80%', height: '90%',
      forceEnlarge: siyi.mobile,
      afterCloseCallback: () => refObj.detailShow = false
    },
    type: siyi.nav.query?.tableConfig?.hideDetailField || props.hideDetailField,
    show: (originData, field = null) => {
      if (Array.isArray(props.detailWhitelistField) && !props.detailWhitelistField.includes(field)) return;
      if (Array.isArray(props.detailBlacklistField) && props.detailBlacklistField.includes(field)) return;
      obj.detail.data = tableFn.detail(obj.reportConfig, originData);
      if (obj.detail.type.includes('hideEmpty')) obj.detail.data = obj.detail.data.filter(item => item.value.trim() !== '');
      if (obj.detail.type.includes('hideZero')) obj.detail.data = obj.detail.data.filter(item => item.value * 1 !== 0);
      refObj.detailShow = true;
    }
  },
  resize: {
    changeSize: '',//方向
    bcr: {},//容器的尺寸信息
    resizeHorizontal: props.resizeHorizontal,
    resizeVertical: props.resizeVertical,
  },
  init: () => {
    if (obj.menuConfig) {
      obj.menuConfig.table = obj.reportConfig;
      obj.menuConfig.search = search;
    }
    if (obj.searchConfig) {
      obj.searchConfig.table = obj.reportConfig;
    }
  },
  mousedown: (name, event) => {
    if (event.button === 0) {//左键
      obj.resize.bcr = core.getBoundingClientRect(box.value, event);
      obj.resize.changeSize = name;
      document.addEventListener('mousemove', obj.move); //添加监听
    }
  },
  mouseup: () => {
    document.removeEventListener('mousemove', obj.move); //移除监听
    obj.resize.bcr = {};
  },
  move: event => {
    refObj.boxStyle = core.changeDomSize[obj.resize.changeSize]({
      event,
      unit: true,
      bcr: obj.resize.bcr,
      offset: dialog.offset,
      minWidth: dialog.minWidth,
      minHeight: dialog.minHeight,
      maxWidth: dialog.maxWidth,
      maxHeight: dialog.maxHeight,
    })
  },
}

obj.init();


onMounted(() => {
  obj.reportConfig.dom = table.value;
  obj.reportConfig.box = box.value;
  obj.reportConfig.table = new ListTable(table.value, obj.reportConfig.options);
  obj.searchConfig === false && obj.reportConfig.getData(); //如果使用了搜索组件，内部会自动触发加载数，这里先取消
  typeof obj.reportConfig.onLoaded === 'function' && obj.reportConfig.onLoaded(obj.reportConfig);//加载表格配置后回调
  document.addEventListener('mouseup', obj.mouseup); //鼠标抬起时
});


onBeforeUnmount(() => {
  document.removeEventListener('mouseup', obj.mouseup);//鼠标抬起时
});

defineExpose({reportConfig: obj.reportConfig, search, menu, detail: obj.detail});//暴露给父组件
</script>
<style scoped>
.box {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  overflow: hidden;


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

  > .size {
    user-select: none;
    position: absolute;
    z-index: 1;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }


  > .size.left {
    width: 5px;
    height: 100%;
    top: 0;
    left: 0;
    cursor: ew-resize;
  }

  > .size.top {
    width: 100%;
    height: 5px;
    top: 0;
    left: 0;
    cursor: ns-resize;
  }

  > .size.right {
    width: 5px;
    height: 100%;
    top: 0;
    right: 0;
    cursor: ew-resize;
  }

  > .size.bottom {
    width: 100%;
    height: 5px;
    left: 0;
    bottom: 0;
    cursor: ns-resize;
  }

  > .size.lefttop {
    width: 10px;
    height: 10px;
    top: 0;
    left: 0;
    z-index: 2;
    cursor: nwse-resize;
  }

  > .size.righttop {
    width: 10px;
    height: 10px;
    top: 0;
    right: 0;
    z-index: 2;
    cursor: nesw-resize;
  }

  > .size.rightbottom {
    width: 10px;
    height: 10px;
    right: 0;
    bottom: 0;
    z-index: 2;
    cursor: nwse-resize;
  }

  > .size.leftbottom {
    width: 10px;
    height: 10px;
    left: 0;
    bottom: 0;
    z-index: 2;
    cursor: nesw-resize;
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