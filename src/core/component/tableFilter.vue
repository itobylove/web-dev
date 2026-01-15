<template>
  <div class="box">
    <dl :class="['tab',filterObj.tabType]">
      <dd class="value" @click="tabSwitch('value')">按值筛选</dd>
      <dd class="where" @click="tabSwitch('where')">按条件筛选</dd>
    </dl>
    <div class="boxValue" v-if="filterObj.tabType==='value'">
      <t-input clearable @change="search"/>
      <t-checkbox class="checkAll" :checked="checkAll" :indeterminate="indeterminate" @change="selectAll">全选</t-checkbox>
      <t-checkbox-group class="list" v-model="filterObj.valueList" :options="filterObj.optionsList" @change="selectList"/>
    </div>
    <dl class="boxWhere" v-if="filterObj.tabType==='where'">
      <dt>筛选类型</dt>
      <dd>
        <t-select class="type" v-model="filterObj.whereCategory" :options="categoryAll" clearable @change="selectCategory"/>
      </dd>
      <dt>筛选条件</dt>
      <dd>
        <t-select class="where" v-model="filterObj.whereOperator" :options="filterObj.operators" clearable @change="selectOperator"/>
      </dd>
      <template v-if="['text','number'].includes(filterObj.whereCategory)">
        <dt>筛选值</dt>
        <dd>
          <t-input class="value" v-if="filterObj.whereCategory==='text'" v-model="filterObj.whereValue" clearable @change="saveFilterWhere"/>
          <t-input-number class="value" v-if="filterObj.whereCategory==='number'" v-model="filterObj.whereValue1" theme="column" @change="saveFilterWhere"/>
          <t-input-number class="value" v-if="filterObj.whereCategory==='number'&&['between','notBetween'].includes(filterObj.whereOperator)" v-model="filterObj.whereValue2" theme="column" @change="saveFilterWhere"/>
        </dd>
      </template>
    </dl>
  </div>
</template>
<script setup>
import {computed, onMounted, reactive} from 'vue';
import * as core from '@/core/script/core';
// Props参数
const props = defineProps({
  table: {type: Object, default: {}},
  field: {type: String, default: ''},
  dialog: {type: Object},
});
// 操作符
const operatorAll = [
  {label: '等于', value: 'equals'},
  {label: '不等于', value: 'notEquals'},
  {label: '大于', value: 'greaterThan'},
  {label: '小于', value: 'lessThan'},
  {label: '大于等于', value: 'greaterThanOrEqual'},
  {label: '小于等于', value: 'lessThanOrEqual'},
  {label: '介于', value: 'between'},
  {label: '不介于', value: 'notBetween'},
  {label: '包含', value: 'contains'},
  {label: '不包含', value: 'notContains'},
  {label: '开头是', value: 'startsWith'},
  {label: '开头不是', value: 'notStartsWith'},
  {label: '结尾是', value: 'endsWith'},
  {label: '结尾不是', value: 'notEndsWith'},
  {label: '已选中', value: 'checked'},
  {label: '未选中', value: 'unChecked'},
  {label: '打开', value: 'open'},
  {label: '关闭', value: 'close'},
];
// 分类
const categoryAll = [
  {label: '文本', value: 'text', operators: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'notStartsWith', 'endsWith', 'notEndsWith']},
  {label: '数值', value: 'number', operators: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'between', 'notBetween']},
  {label: '复选框', value: 'checkbox', operators: ['checked', 'unChecked']},
  {label: '单选框', value: 'radio', operators: ['checked', 'unChecked']},
  {label: '开关', value: 'switch', operators: ['open', 'close']},
];
const optionsListAll = [];//原始选项列表
const filterObj = reactive({
  tabType: 'value',//选项卡类型
  valueList: [],//选项列表选中值
  optionsList: [],//当前选项列表

  operators: [],
  whereCategory: '',
  whereOperator: '',
  whereValue: '',// 条件
  whereValue1: '',// 条件
  whereValue2: '',// 条件
});
//全选标识
const checkAll = computed(() => filterObj.valueList.length === filterObj.optionsList.length);
//半选标识
const indeterminate = computed(() => filterObj.valueList.length > 0 && filterObj.valueList.length < filterObj.optionsList.length);


//选项卡切换
const tabSwitch = val => filterObj.tabType = val;
// 搜索筛选值
const search = val => {
  filterObj.optionsList = optionsListAll.filter(item => String(item.value).trim().toUpperCase().includes(val.trim().toUpperCase()));
  filterObj.valueList = filterObj.optionsList.map(item => item.value);
  saveFilterWhere();
}
// 全选
const selectAll = checked => {
  filterObj.valueList = checked ? filterObj.optionsList.map(row => row.value) : [];
  saveFilterWhere();
}
// 选择
const selectList = () => saveFilterWhere();
// 保存筛选条件
const saveFilterWhere = () => {
  const where = {operator: 'in', value: filterObj.valueList, tabType: filterObj.tabType, category: filterObj.whereCategory};
  if (filterObj.tabType === 'where') {
    let value = '';
    if (filterObj.whereCategory === 'text') {
      value = filterObj.whereValue;
    } else if (filterObj.whereCategory === 'number' && ['between', 'notBetween'].includes(filterObj.whereOperator)) {
      value = {min: filterObj.whereValue1, max: filterObj.whereValue2};
    } else {
      value = filterObj.whereValue1;
    }
    where.operator = filterObj.whereOperator;
    where.value = value;
  }
  props.table.filterWhere[props.field] = where;
}
// 设置操作符
const setOperators = val => {
  for (const row of categoryAll) {
    if (row.value === val) {
      filterObj.operators = operatorAll.filter(item => row.operators.includes(item.value));
    }
  }
}
// 过滤器分类
const selectCategory = val => {
  setOperators(val);
  filterObj.whereOperator = '';
  filterObj.whereValue = '';
  filterObj.whereValue1 = '';
  filterObj.whereValue2 = '';
  saveFilterWhere();
}
// 筛选操作符
const selectOperator = () => {
  filterObj.whereValue = '';
  filterObj.whereValue1 = '';
  filterObj.whereValue2 = '';
  saveFilterWhere();
}
/**
 * 生成下拉列表值的函数
 * @param data  数据
 * @param field 列名
 * @param where 条件
 * @returns {*[]}
 */
// 初始化
onMounted(() => {
  // 过滤数据
  const rows = core.data.filter(props.table.data, props.table.filterWhere, props.field);
  // 生成按值筛选列表
  const values = {};
  for (const row of rows) {
    const value = row[props.field] === null ? '' : row[props.field];
    if (values[value] === undefined) values[value] = 0;
    values[value] += 1;
  }
  for (const value in values) {
    optionsListAll.push({value: value, label: (value === '' ? '空' : value) + '(' + values[value] + ')'});
  }
  filterObj.optionsList = optionsListAll;


  // 初始化过滤器
  const fw = props.table.filterWhere[props.field];
  if (fw) {
    filterObj.tabType = fw.tabType;// 获取选项卡类型
    if (filterObj.tabType === 'value') {// 如果是按值筛选
      filterObj.valueList = fw.value;// 获取值列表
    } else if (filterObj.tabType === 'where') {
      setOperators(fw.category);
      filterObj.whereCategory = fw.category;// 读取分类
      filterObj.whereOperator = fw.operator;// 读取操作符
      if (filterObj.whereCategory === 'text') {// 如果是文本
        filterObj.whereValue = fw.value;// 读取值
      } else if (filterObj.whereCategory === 'number' && ['between', 'notBetween'].includes(filterObj.whereOperator)) {
        filterObj.whereValue1 = fw.value.min;
        filterObj.whereValue2 = fw.value.max;
      } else {
        filterObj.whereValue1 = fw.value;
      }
    }
  }
});
</script>
<style scoped>
.box {
  > .tab {
    width: 100%;
    height: 36px;
    display: flex;
    user-select: none;

    > dd {
      width: 50%;
      height: 36px;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #000;
      cursor: default;
    }

    &.value > dd.value,
    &.where > dd.where {
      border-bottom: 2px solid #35a1fd;
      color: #35a1fd;
      font-weight: bold;
    }
  }

  > .boxValue {
    width: 100%;
    padding: 8px;
    user-select: none;

    > .checkAll {
      width: 100%;
      height: 30px;
      margin: 10px 0 10px 0;
    }

    > .list {
      width: 100%;
      height: 200px;
      overflow: hidden auto;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      gap: 10px;
    }
  }

  > .boxWhere {
    width: 100%;
    height: 300px;
    padding: 8px;
    user-select: none;

    > dt {
      width: 100%;
      height: 30px;
      line-height: 30px;
    }

    > dd {
      width: 100%;
      height: 30px;
      line-height: 30px;
      margin-bottom: 30px;
      display: flex;
      gap: 5px;

      > div {
        flex: 1;
      }
    }
  }
}
</style>