<template>
  <div class="job-selector" :style="props.style">
    <t-select  v-model="plantId" v-bind="props.plantPops" :options="plantList"  @change="plantSelectChange"></t-select>
    <div></div>
   <t-input   v-model="jobShow" v-bind="inputPops" :placeholder=" '请输入型号'" v-show="!selectPops.visible" @click="jobShowClick"/>
    <t-select  ref="jobSelectRef" v-model="jobId"  v-bind="selectPops" v-show="selectPops.visible"
              @search="jobInputChange" @change="jobSelectChange" @popup-visible-change="(value)=>selectPops.visible=value"
    />
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from "vue";
import _ from 'lodash';
import {plantList} from '@/utils/erp.js';
import * as api from "@/core/script/api.js";

const props= defineProps({
  style:{type: Object, default: {}},
  query:{type: Object, default: {}},
  list:{type: Array, default: []},
  jobId: {type: Number, default: ''},
  jobInfo: {type: Object, default: {}},
  plantId: {type: Number, default: NaN},
  plantPops: {type: Object, default: {size:"large",align:"center"}},
  inputPops: {type: Object, default: {size:"large",align:"center",placeholder:'请输入型号'}},
  selectPops: {type: Object, default: {}},
  jobFields: {type: String, default: 'unitWeight,arrayWeight,custMatCode,PARTLENGTH,PARTWID,pcsOfArray'},
  jobLabelFn: {type: Function, default: (item,index) => {
      return (index+1)+' : '+item.label + ` ( ${item.extra?.M} : ${item.extra?.customerCode} - ${item.extra.sn} - ${item.data?.partRev} )`;
  }},
  jobShowFn: {type: Function, default: (item,index) => {
      return item.data.partNum+''+item.data.partRev;
    }},
  debug: {type: Boolean, default: true},
})
const emit = defineEmits(['update:jobInput','update:job', 'update:plantId'])

const plantId = ref(props.plantId);
const jobId = ref(props.jobId);
const jobInfo = ref(props.jobInfo);

const jobShow = ref('');
const jobInput= ref('');

const jobSelectRef = ref();

const selectPops = reactive(_.merge({
  size: "large",
  empty: "请输入至少4位型号",placeholder:'请输入型号',
  align:"center",
  allowInput: true,
  filterable: true,
  clearable: true,
  autofocus: false,
  visible: true,
  loading: false,
  inputProps:  {
    align:"center",
    clearable: true,
    autofocus: false,
  },
  options: [],
  popupProps: {
    overlayInnerClassName: 'jobSelectorPops',
    overlayInnerStyle: (trigger) => ({width: `${trigger.offsetWidth}px`}),
  }
},props.selectPops))

// 监听工厂选择
const plantSelectChange= (value) => {
  props.debug && console.log('plantSelectChange',value);
  plantId.value = value;
  emit('update:plantId', value);
}


//输入框点击事件
const jobShowClick = async (e) => {
  props.debug && console.log('jobShowClick',e);
  jobInput.value='';
  selectPops.inputValue=jobInput.value;
  selectPops.visible = true;
  selectPops.popupVisible=true;
  // jobSelectRef.value.$el.querySelector('.t-input__wrap').click();
  // jobSelectRef.value.$el.querySelector('input').focus();
  await jobInputChange(jobInput.value);
}

//监听输入框输入，执行搜索
const jobInputChange = async (value) => {
  props.debug && console.log('jobInputChange', value);
  emit('update:jobInput', value);
  jobInput.value= value;
  selectPops.loading = true;
  selectPops.options = await getJobSelectOptions(value);
  selectPops.loading = false;
}

//监听job选中
const jobSelectChange = (value) => {
  props.debug && console.log('jobSelectChange', value)
  const item = selectPops.options.find(item => item.value === value);
  jobChange(item);
  selectPops.visible = false;
}

//执行job改变
const jobChange = (item = {}) => {
  props.debug && console.log('jobChange', item)
  if (item?.value) {
    jobId.value = item.value;
    jobInfo.value = item;
    jobShow.value=props.jobShowFn(item);
  } else {
    jobId.value = 0;
    jobInfo.value = {};
    jobShow.value='';
    selectPops.options = [];
  }
  emit('update:job', jobInfo.value);
}

//获取job候选数据
const getJobSelectOptions = async (keyword = '', count = null) => {
  let list;
  if (props.list.length>0){
     list=[...props.list];
  }else{
     list = await api.get(api.url.common.jobSelector, {keyword, field:props.jobFields, count, plantId: plantId.value, ...props.query});
  }
  return [...list].map((item,index) => {return {...item, label:props.jobLabelFn(item,index)}}).filter(item=> item.label.includes(keyword))
}

//暴露数据
const getData = () => {
  return {
    plantId: plantId.value,
    jobInput: jobInput.value,
    jobShow: jobShow.value,
    jobId: jobId.value,
    jobInfo: jobInfo.value,
    jobList:selectPops.options,
  }
}

onMounted(() => {
    props.debug && console.log('jobSelector mounted', props);
    plantId.value<1 || plantSelectChange(props.plantId || plantList[0].value) //  初始化工厂
})


defineExpose({ getData })
</script>

<style>
.jobSelectorPops{
  background-color: #fff;
  .t-select__empty{
    height: var(--td-comp-size-xl);
    line-height: var(--td-comp-size-xl);
  }
}
</style>

<style scoped>
.job-selector {
  font-size: 20px;
  width: 100%;
  height: 100%;
  place-items: center;
  display: grid;
  grid-template-columns: 120px 0 480px;
  position: relative;
  .t-input__inner{
    //font-size: 14px;
    //line-height: 28px;
  }
}
</style>
<style lang="less" scoped>
.tdesign-demo__select-input-ul-single {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tdesign-demo__select-input-ul-single > li {
  display: block;
  border-radius: 3px;
  line-height: 22px;
  cursor: pointer;
  padding: 3px 8px;
  color: var(--td-text-color-primary);
  transition: background-color 0.2s linear;
  white-space: nowrap;
  word-wrap: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tdesign-demo__select-input-ul-single > li:hover {
  background-color: var(--td-bg-color-container-hover);
}


.tdesign-demo__select-empty-custom {
  text-align: center;
  color: var(--td-text-color-disabled);
  line-height: 32px;
}
.displaySpan {
  line-height: 24px;
}
</style>

