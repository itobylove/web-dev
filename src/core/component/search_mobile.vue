<template>
  <div class="localFilter">
    <input v-model="searchObj.localFilter.value" :placeholder="searchObj.localFilter.valueOptions.placeholder" @input="searchObj.localFilter.valueChange"/>
    <i :class="['ri-arrow-down-s-fill',{'yes':showSelectField}]" @click="showSelectField=true"></i>
    <i class="ri-menu-search-line" @click="showSearch=true"></i>
  </div>
  <t-popup v-model="showSelectField" placement="bottom">
    <t-picker title="选择字段" :columns="searchObj.localFilter.fieldOptions.options" @confirm="selectOk" @cancel="showSelectField=false"/>
  </t-popup>
  <t-popup v-model="showSearch" placement="bottom" style="width:100%;height:100%;">
    <div class="searchBox">
      <div class="header">
        <button class="no" @click="showSearch=false">取消</button>
        <div class="title">高级搜索</div>
        <button class="ok" @click="getData">确定</button>
      </div>
      <div class="content">
        <template v-for="item in searchObj.searchList">
          <div class="input" v-if="item.type==='input'">
            <input :placeholder="item.options.placeholder" v-model="item.value" @input="item.change"/>
          </div>
          <div class="select" v-else-if="item.type==='select'">
            <div class="label select" v-if="item.selectLabe.length>0">
              <dl>
                <dd v-for="sl in item.selectLabe" @click="clickLabel(item,sl)">{{ sl.label }}</dd>
              </dl>
            </div>
            <input :placeholder="item.options.placeholder" v-model="item.input" @input="inputSelect(item)"/>
            <div class="label unselect" v-if="item.options.options.length>0">
              <dl>
                <dd v-for="opts in item.options.options" :class="(item.options.multiple?item.value.includes(opts.value):item.value===opts.value)?'yes':''" @click="clickLabel(item,opts)">{{ opts.label }}</dd>
              </dl>
            </div>
          </div>
          <div class="time" v-else-if="['time','date','month'].includes(item.type)">
            <dl>
              <dt>{{ item.options.placeholder }}</dt>
              <dd @click="selectTime(item)">{{ item.value ? item.value : '选择时间' }}</dd>
            </dl>
          </div>
          <div class="rangeTime" v-else-if="['rangeTime','rangeDate','rangeMonth'].includes(item.type)">
            <dl>
              <dt>开始{{ item.options.placeholder }}</dt>
              <dd @click="selectTime(item,0)">{{ item.value[0] ? item.value[0] : '选择时间' }}</dd>
            </dl>
            <dl>
              <dt>结束{{ item.options.placeholder }}</dt>
              <dd @click="selectTime(item,1)">{{ item.value[1] ? item.value[1] : '选择时间' }}</dd>
            </dl>
          </div>
          <div class="radio" v-else-if="item.type==='radio'">
            <span>{{ item.options.placeholder }}</span>
            <t-radio-group v-model="item.value" v-bind="item.options" @change="item.change"/>
          </div>
          <div class="switch" v-else-if="item.type==='switch'">
            <span>{{ item.options.placeholder }}</span>
            <t-switch v-model="item.value" v-bind="item.options" borderless @change="item.change"/>
          </div>
        </template>
      </div>
    </div>
  </t-popup>
  <t-popup v-model="showTime" placement="bottom" @close="showSearch=true" @open="showSearch=false">
    <t-date-time-picker :title="titleTime" mode="second" @confirm="confirmTime" @cancel="showTime=false;showSearch=true"/>
  </t-popup>
</template>
<script setup>
import {reactive, ref, watch} from 'vue'
import * as core from '@/core/script/core.js'
import siyi from '@/core/script/siyi.js'
import * as searchFn from "@/core/script/searchFn.js";

const showSelectField = ref(false)//显示字段选择
const showSearch = ref(false) //显示搜索

const selectOk = (value, context) => {
  searchObj.localFilter.fieldChange(value, context)
  showSelectField.value = false
}

const getData = () => {
  searchFn.clearLocalFilter(props, searchObj)
  if (searchObj.searchList.filter(item => item.filter === false).length > 0) {
    props.table.page = 1
    props.table.getData()
  }
  showSearch.value = false
}

//下拉框输入时
const inputSelect = item => getSelect(item)
const getSelect = core.debounce(item => {
  if (item.remote) {
    item.search(item.input)
  } else {
    item.options.options = item.options.optionsDefault.filter(opts => {
      const regex = new RegExp(item.input, 'i')  // i表示忽略大小写
      return item.input === '' || regex.test(opts.label)
    })
  }
}, 500)

//处理选择标签
const clickLabel = (item, opts) => {
  if (item.options.multiple) {
    if (!Array.isArray(item.value)) item.value = []
    if (item.value.includes(opts.value)) {
      item.value = item.value.filter(val => val !== opts.value)
    } else {
      item.value.push(opts.value)
      item.value = [...new Set(item.value)]//去重
    }
  } else {
    item.value = item.value === opts.value ? '' : opts.value
  }
  //处理显示
  if (item.selectLabe.filter(sl => sl.value === opts.value).length) {
    item.selectLabe = item.selectLabe.filter(sl => sl.value !== opts.value)
  } else {
    item.selectLabe.push(opts)
    item.selectLabe = [...new Map(item.selectLabe.map(sl => [sl.value, sl])).values()] //对象去重
  }
  item.change()
}


//处理时间选择
const titleTime = ref('选择时间')
const showTime = ref(false)   //显示时间选择
const time = {item: {}, index: undefined}
const selectTime = (item, index) => {
  const title = ['开始', '结束']
  titleTime.value = (title[index] ?? '') + item.options.placeholder
  showTime.value = true
  showSearch.value = false
  time.item = item
  time.index = index
}
//确定选择
const confirmTime = value => {
  showTime.value = false
  showSearch.value = true
  if (time.index === undefined) {
    time.item.value = value
  } else {
    time.item.value[time.index] = value
  }
  time.item.change()
}


/***********************************************搜索组件开始***********************************************/
const props = defineProps({
  search: {type: Array, default: siyi.nav?.query?.search || []},//搜索列表
  filter: {type: [Object, Boolean], default: {}}, //右侧本地过滤  false为禁用
  filterCallBack: {type: Function, default: () => ''},  //过滤后的回调
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
  checkRangeTime: () => searchFn.checkRangeTime(searchObj),
  dataFilter: () => searchFn.dataFilter(props, searchObj),
  clearLocalFilter: () => searchFn.clearLocalFilter(props, searchObj),
  loadFilter: () => searchFn.loadFilter(props, searchObj),
  search: searchObj.searchList
})
</script>
<style scoped>
.localFilter {
  flex-shrink: 0;
  height: 50px;
  padding-left: 5px;
  position: relative;
  user-select: none;
  display: flex;
  align-items: center;

  > input {
    flex: 1;
    flex-shrink: 0;
    height: 40px;
    min-width: 0;
    font-size: 14px;
    border: 1px solid #eaeaea;
    background-color: #FFF;
    outline: none;
    border-radius: 5px;
    padding: 0 35px 0 5px;
  }

  > i.ri-menu-search-line {
    flex-shrink: 0;
    width: 30px;
    height: 100%;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  i.ri-arrow-down-s-fill {
    width: 35px;
    height: 35px;
    color: #000;
    font-size: 20px;
    position: absolute;
    right: 30px;
    top: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  i.ri-arrow-down-s-fill.yes {
    color: #006EFF
  }
}

.searchBox {
  width: 100%;
  height: 100%;
  background-color: #f3f4f7;
  user-select: none;
  display: flex;
  flex-direction: column;

  .header {
    flex-shrink: 0;
    height: 40px;
    display: flex;
    align-items: center;

    > .title {
      flex: 1;
      flex-shrink: 0;
      text-align: center;
      font-size: 16px;
    }

    > button {
      flex-shrink: 0;
      width: 60px;
      height: 100%;
      font-size: 16px;
      cursor: pointer;
      border: 0 none;
      background: transparent;
      outline: none;
    }

    > button.no {
      color: #6f6f6f
    }

    > button.ok {
      color: #006EFF;
    }
  }

  .content {
    flex: 1;
    flex-shrink: 0;
    margin: 10px;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &::-webkit-scrollbar {
      display: none;
    }

    > div {
      flex-shrink: 0;
      background-color: #fff;
      border-radius: 5px;
      padding: 10px;

      > input {
        width: 100%;
        height: 30px;
        line-height: 30px;
        font-size: 16px;
        border: 0 none;
        outline: none;
        background: transparent;
      }
    }


    > .select {
      > .label {
        padding: 10px 0 0 0;

        > dl {
          max-height: 200px;
          overflow: hidden auto;
          display: flex;
          gap: 3px;
          flex-wrap: wrap;
          align-items: center;

          &::-webkit-scrollbar {
            display: none;
          }

          > dd {
            cursor: pointer;
            padding: 6px;
            font-size: 16px;
            border-radius: 3px;
            background: #f1f1f1;

            &.yes {
              display: none;
            }
          }
        }
      }

      > .label.select {
        padding: 0 0 10px 0;

        > dl {
          max-height: unset;

          > dd {
            color: #006EFF;
          }
        }
      }
    }

    > .rangeTime, .time {
      padding: 5px 10px;

      > dl {
        width: 100%;
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        > dt {
          color: #757575;
        }
      }
    }

    > .rangeTime > dl:last-child {
      border-top: 1px dashed #d3d6dd;
    }

    > .radio {
      > span {
        width: 100%;
        height: 30px;
        line-height: 30px;
        font-size: 16px;
        color: #757575;
        float: left;
      }
    }

    > .switch {
      display: flex;
      align-items: center;
      justify-content: space-between;

      > span {
        height: 30px;
        line-height: 30px;
        font-size: 16px;
        color: #757575;
        float: left;
      }
    }
  }
}

.menu + .localFilter {
  border-top: 1px solid #c9d0da;
}
</style>