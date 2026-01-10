<template>
  <div class="search">
    <div class="searchList">
      <div v-for="item in searchObj.searchList" :class="item.type" :style="item.style">
        <t-input v-if="item.type==='input'" v-model="item.value" v-bind="item.options" @change="item.change" @enter="item.enter"/>
        <t-select v-else-if="item.type==='select'" v-model="item.value" v-bind="item.options" @change="item.change" @enter="item.enter" @search="item.search"/>
        <t-tree-select v-else-if="item.type==='tree'" v-model="item.value" v-bind="item.options" @change="item.change" @enter="item.enter" @search="item.search"/>
        <t-date-picker v-else-if="['time','date','month'].includes(item.type)" v-model="item.value" v-bind="item.options" @change="item.change" @enter="item.enter"/>
        <t-date-range-picker v-else-if="['rangeTime','rangeDate','rangeMonth'].includes(item.type)" v-model="item.value" v-bind="item.options" @change="item.change" @enter="item.enter"/>
        <t-switch v-else-if="item.type==='switch'" v-model="item.value" v-bind="item.options" @change="item.change"/>
        <t-radio-group v-else-if="item.type==='radio'" v-model="item.value" v-bind="item.options" @change="item.change"/>
      </div>
    </div>
    <div class="localFilter" v-if="typeof props.filter==='object'">
      <t-input-adornment>
        <template #prepend>
          <t-select v-model="searchObj.localFilter.field" :style="searchObj.localFilter.fieldStyle" v-bind="searchObj.localFilter.fieldOptions" @change="searchObj.localFilter.fieldChange()"/>
        </template>
        <t-input v-model="searchObj.localFilter.value" :style="searchObj.localFilter.valueStyle" v-bind="searchObj.localFilter.valueOptions" @change="searchObj.localFilter.valueChange()"/>
      </t-input-adornment>
    </div>
  </div>
</template>
<script setup>
import _ from "lodash";
import {reactive, watch} from 'vue'
import * as searchFn from '@/core/script/searchFn.js'
import siyi from '@/core/script/siyi.js'

const props = defineProps({
  search: {type: Array, default: siyi.nav?.query?.search || []},//搜索列表
  filter: {type: [Object, Boolean], default: {}}, //右侧本地过滤  false为禁用
  filterCallBack: {type: Function, default: () => 0},  //过滤后的回调
  table: {type: Object, default: undefined},//table 要接管的表格
})


const searchObj = reactive({
  localFilter: {},//本地过滤对象
  searchList: [],//搜索列表
})


watch(() => props.search, (newVal, oldVal) => searchFn.loadSearch(props, searchObj), {immediate: true, deep: true}) //自动执行+深度监听
watch(() => props.filter, (newVal, oldVal) => searchFn.loadFilter(props, searchObj), {immediate: true, deep: true}) //自动执行+深度监听

defineExpose({
  get: (type = 'remote') => searchFn.get(props, searchObj, type),
  clearWhere: () => searchFn.clearWhere(props, searchObj),
  clearLocalFilter: () => searchFn.clearLocalFilter(props, searchObj),
  checkRangeTime: () => searchFn.checkRangeTime(searchObj),
  dataFilter: () => searchFn.dataFilter(props, searchObj),
  loadFilter: (obj = {}) => {
    _.merge(searchObj, obj)
    searchFn.loadFilter(props, searchObj)
  },
  loadSearch: (obj = {}) => {
    _.merge(searchObj, obj)
    searchFn.loadSearch(props, searchObj)
  },
  updateSearchItem: (field, value, key) => searchFn.updateSearchItem(field, value, key, searchObj),
  search: searchObj,
})
</script>
<style scoped>
.search {
  flex-shrink: 0;
  padding: 2px 0;
  overflow: hidden;
  user-select: none;
  display: flex;
  gap: 10px;

  > .searchList {
    flex: 1;
    flex-shrink: 0;
    padding-left: 2px;
    overflow: auto hidden;
    display: flex;
    gap: 2px;

    &::-webkit-scrollbar {
      display: none;
    }

    > div {
      flex-shrink: 0;
      overflow: hidden;

      > div {
        width: 100%;
      }
    }

    > .input {
      width: 200px;
    }

    > .time {
      width: 205px;
    }

    > .rangeTime {
      width: 380px;
    }

    > .date {
      width: 130px;
    }

    > .rangeDate {
      width: 255px;
    }

    > .month {
      width: 105px;
    }

    > .rangeMonth {
      width: 205px;
    }

    > .switch {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  > .localFilter {
    flex-shrink: 0;
    width: 330px;
  }
}

.menu + .search {
  border-top: 1px solid #c9d0da;
}

.menu + .localFilter {
  border-top: 1px solid #c9d0da;
}
</style>