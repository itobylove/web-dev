<template>
  <div class="job-weight" v-loading="isLoading" >
    <video class="siyi-video" ref="video" :src="videoBg" muted playsinline autoplay loop></video>
    <div class="box row1">
      <div class="box box-type">
        <span >{{dataOption['type'][vData.type]}}:</span>
      </div>
      <div class="box box-weight">
        <span><span @dblclick="saveData">{{ weightValue }}</span><span  @dbkclick="changeUnit"> {{weightUnit}}</span></span>
      </div>
      <div class="box box-show scroll-hide">
        <div class="job-form">
            <t-select name="plantId" :options="plantList" v-model="vData.plantId" />

          <t-input ref="jobInputRef" v-model="jobSelector.lastInputValue"   placeholder="请输入型号" v-show="!jobSelector.visible"
                   @click="jobInputClick"
          />

<!--
          <t-select ref="jobSelectorRef" autofocus  name="jobId" size="large" v-model="jobId"  v-show="jobSelector.visible"
                    :options="jobSelector.options" :placeholder="jobInput" :loading="jobSelector.loading" :popupVisible="jobSelector.popupVisible"
                    :popup-props="{overlayInnerStyle: (trigger) => ({ width: `${trigger.offsetWidth}px` }),}"
                    @change="jobSelectChange" @blur="jobSelectBlur" @click="()=>{ jobSelector.visible=false; jobInputRef.focus(); }"/>-->

          <t-select ref="jobSelectorRef" v-model="jobInput" v-show="jobSelector.visible"  v-bind="jobSelector"
                    :default-input-value="jobSelector.lastInputValue" :placeholder="jobSelector.lastInputValue || '请输入型号'"
                    @search="jobInputChange" @change="jobSelectChange"
          />

        </div>
        <table>
          <colgroup>
            <col style="width:150px">
            <col style="width:auto">
            <col style="width:150px">
            <col style="width:auto">
          </colgroup>
          <tr :title="jobInfo?.info?.id">
            <td>型号版本：</td>
            <t-tooltip :content="jobInfo?.info?.approveStatus" default-visible>
            <td class="jobSn" @dblclick="async ()=>await openMi(jobInfo?.data?.recId)">{{ jobInfo?.data?.partNum }}
              {{ jobInfo?.data?.partRev }}
            </td>
            </t-tooltip>
            <td>客户代码：</td>
            <td >{{ jobInfo?.extra?.customerCode }}</td>
          </tr>

          <tr >
            <td>拼版方式：</td>
            <td>{{ jobInfo?.info?.mixedInfo }}</td>
            <td v-if="vData.isPNL">PNLA尺寸：</td>
            <td v-else>SET尺寸：</td>
            <td v-if="vData.isPNL">{{ jobInfo?.info?.PNLA_SIZE }}</td>
            <td v-else>{{ jobInfo?.info?.SET_SIZE }}</td>
          </tr>

          <tr v-if="vData.isPNL">
            <td>PNL重量：</td>
            <td>{{ jobInfo?.info?.pnlWeight }}</td>
            <td>最近更新：</td>
            <td>{{ jobInfo?.data?.userName }} {{ jobInfo?.info?.operatingTime }}</td>
          </tr>
          <tr v-else>
            <td>SET重量：</td>
            <td>{{ jobInfo?.info?.arrayWeight }}</td>
            <td>最近更新：</td>
            <td>{{ jobInfo?.data?.userName }} {{ jobInfo?.info?.operatingTime }}</td>
          </tr>

        </table>
      </div>
    </div>
    <div class="box row2">
      <div class="box box-search">
        <t-input ref="searchRef"  type="text" autocomplete="off"  placeholder="请输入型号/客户型号/客户物料号"  size="large"
           v-model="searchInput"    @enter="refreshJobList(searchInput)"  />
        <t-button content="搜索" size="large" @click="()=>refreshJobList(searchInput)"/>
      </div>
      <div class="box box-list">
        <table>
          <colgroup>
            <col style="width:80px" title="序号">
            <col style="width:260px" title="型号">
            <col style="width:100px" title="客户代码">
<!--            <col style="width:100px">-->
<!--            <col style="width:60px">-->
            <col v-show="clientWidth>1440" style="width:auto" title="客户型号">
            <col v-show="clientWidth>1920" style="width:15%" title="客户物料号">
<!--            <col style="width:100px" title="状态">-->
<!--            <col style="width:160px" title="拼版方式">-->
<!--            <col v-show="vData.isPNL" style="width:260px" title="PNLA尺寸">-->
            <col v-show="vData.isPNL" style="width:160px" title="PNL重量">
<!--            <col v-show="!vData.isPNL" style="width:260px" title="SET尺寸">-->
            <col v-show="!vData.isPNL && vData.showPcs" style="width:100px" title="SET/PCS">
            <col v-show="!vData.isPNL" style="width:160px" title="SET重量">
            <col v-show="!vData.isPNL && vData.showPcs" style="width:100px" title="PCS重量">
            <col style="width:120px" title="更新人">
            <col style="width:200px" title="更新时间">
          </colgroup>
          <thead>
          <tr>
            <th>序号</th>
            <th>型号</th>
            <th>客户代码</th>
<!--            <th>流水号</th>-->
<!--            <th>类型</th>-->
            <th v-show="clientWidth>1440">客户型号</th>
            <th v-show="clientWidth>1920">客户物料号</th>
<!--            <th>状态</th>-->
<!--            <th title="PNL/SET/PCS">拼版方式</th>-->
<!--            <th v-show="vData.isPNL">PNLA尺寸</th>-->
            <th v-show="vData.isPNL">PNL重量（{{weightUnit}}）</th>
<!--            <th v-show="!vData.isPNL">SET尺寸</th>-->
            <th v-show="!vData.isPNL && vData.showPcs">SET/PCS</th>
            <th v-show="!vData.isPNL">SET重量（{{weightUnit}}）</th>
            <th v-show="!vData.isPNL && vData.showPcs">PCS重量</th>
            <th>更新人</th>
            <th>更新时间</th>
          </tr>
          </thead>
        </table>
        <div class="tbody-scroll scroll-hide">
          <table>
            <colgroup>
              <col style="width:80px">
              <col style="width:260px">
              <col style="width:100px">
<!--              <col style="width:100px">-->
<!--              <col style="width:60px">-->
              <col v-show="clientWidth>1440" style="width:auto;">
              <col v-show="clientWidth>1920" style="width:15%;">
<!--              <col style="width:100px">-->
<!--              <col style="width:160px">-->
<!--              <col v-show="vData.isPNL" style="width:260px">-->
              <col v-show="vData.isPNL" style="width:160px">
<!--              <col v-show="!vData.isPNL" style="width:260px">-->
              <col v-show="!vData.isPNL && vData.showPcs" style="width:100px">
              <col v-show="!vData.isPNL" style="width:160px">
              <col v-show="!vData.isPNL && vData.showPcs" style="width:100px">
              <col style="width:120px">
              <col style="width:200px">
            </colgroup>
            <tbody>
            <tr v-for="(item,index) in jobList" @dblclick="()=>listIntoInput(item.data.recId)" :title="item?.info?.id">
              <td>{{ index + 1 }}</td>
              <td class="jobSn">{{ item?.data?.partNum }} {{ item?.data?.partRev }}</td>
              <td>{{ item?.extra?.customerCode }}</td>
<!--              <td>{{parseNumber(item?.extra?.sn) }}</td>-->
<!--              <td>{{ item?.extra?.M }}</td>-->
              <td v-show="clientWidth>1440" :title="item?.data?.partName">{{ item?.data?.partName }}</td>
              <td v-show="clientWidth>1920"  :title="item?.data?.custMatCode">{{ item?.data?.custMatCode }}</td>
<!--              <td>{{ item?.info?.approveStatus }}</td>-->
<!--              <td :title="item?.info?.mixedInfo">{{item?.info?.mixedInfoShort}}</td>-->

<!--              <td v-show="vData.isPNL">{{ item?.info?.PNLA_SIZE }}</td>-->
              <td v-show="vData.isPNL" :title="(item.data?.fieldChineseName || '') +' ' + (item.data?.newValue || '')">{{ item?.info?.pnlLogValue || item?.info?.pnlWeight }}</td>
<!--              <td v-show="!vData.isPNL">{{ item?.info?.SET_SIZE }}</td>-->
              <td v-show="!vData.isPNL && vData.showPcs">{{ item?.data?.pcsOfArray }}</td>
              <td v-show="!vData.isPNL" :title="(item.data?.fieldChineseName || '')+' ' + (item.data?.newValue || '')">{{ item?.info?.setLogValue || item?.info?.arrayWeight }}</td>
              <td v-show="!vData.isPNL && vData.showPcs">{{ item?.info?.unitWeight }}</td>
              <td>{{ item?.data?.userName }} </td>
              <td>{{ item?.info?.operatingTime }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue";
import * as api from "@/core/script/api.js";
import * as core from "@/core/script/core.js";
import {plantList} from '@/utils/erp.js';
import {parseNumber} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";
import siyi from "@/core/script/siyi.js";
import {getQuery} from "@/core/script/nav.js";


const clientWidth=ref(window.innerWidth);
const videoBg = '/video/packingStandardBg.mp4'


const dataOption={
  approveStatus: {
    'Pending': '制作中',
    'Submit': '已提交',
    'Waiting': '审批中',
    'Approved': '审批通过',
    'Rejected': '拒绝',
  },
  type:{
    'SET':"SET",
    'PNL':"PNL",
  }
}

// 重量误差范围(克)
const weightRange=5;

const vData = reactive({
  type: 'set',
  plantId: core.getDefaultPlantId(),
  isPNL:null,
  showPcs:false,
  lastWeight:0, // 上一次重量
})

const isLoading =ref(true);

const weightValue = ref(0);
const weightUnit = ref('克');

const jobId = ref(null);
const jobInfo = ref({});


const jobInputRef= ref(null);
const jobInput = ref('');

const jobSelectorRef= ref(null);

const jobSelector=reactive({
  size:"large",
  empty:"请输入至少4位型号",
  filterable:true,
  autofocus:false,
  visible:true,
  loading: false,
  options: [],
  lastInputValue:'',
  popupProps:{
    overlayInnerClassName:'jobSelectorPops',
    overlayInnerStyle: (trigger) => ({ width: `${trigger.offsetWidth}px`}),
  }
})

/**
 * 设置job
 * @param item
 */
const setJobInfo=(item={})=>{
  if (item?.value){
    jobId.value = item.value;
    jobInfo.value = item;
    jobSelector.options=[item]
    jobInput.value= item.data.partNum+item.data.partRev;
  }else{
    jobId.value=0;
    jobInfo.value={};
    jobSelector.options=[];
    jobInput.value='';
  }
}

const jobInputClick=(e)=>{
  console.log('jobInputClick',e);
  setJobInfo();
  jobSelector.autofocus=true;
  jobSelector.visible=true;
  setTimeout(()=>{
    jobSelectorRef.value.$el.querySelector('input').focus();
  },100)
}

//监听输入框输入，执行搜索
const jobInputChange = async (value) => {
  console.log('jobInputChange',value);
  setJobInfo();
  jobInput.value=value;
  jobSelector.lastInputValue=value;
  if (value.length < 4) {
    console.log('value.length',value.length)
    return ;
  }
  jobSelector.visible=true;
  jobSelector.loading= true;
  jobSelector.options =  await getJobList(value,'weight-find');
  jobSelector.loading= false;
  if (jobSelector.options.length===1){
    jobSelectChange(jobSelector.options[0].value);// 直接选择唯一选项
  }
}

//监听选中
const jobSelectChange = (value) => {
  const item = jobSelector.options.find(item => item.value === value);
  if (!item.value) return ;
  setJobInfo(item);
  saveData().then();
  jobSelector.visible=false;
}


//单位改变
const changeUnit = async () => {
  const nextValue = weightUnit.value === '克' ? '千克' : '克';
  if (!await dialog.confirmAsync(`是否切换单位${nextValue}?`)) {
    return;
  }
  weightUnit.value = nextValue;
}

const changeType=async (type,refresh=true) => {
  vData.type = type || (vData.type.toUpperCase() === 'SET' ? 'PNL' : 'SET');
  vData.isPNL= vData.type === 'PNL';
  refresh && await refreshJobList(searchInput.value);
}


// 输入缓存
let inputBuffer = '';
let firstInputStr='';
let lastInputTime=0;
// 监听重量输入
const weightInput = (e) => {
  if (e.key !== 'Enter' && !/[\d.]/.test(e.key)) {
    return; // 非数字/小数点或回车键，直接返回
  }
  if (e.target !== document.body){
    return ; //  非body，返回
  }
  if (e.key === 'Enter') {
    if (inputBuffer===''){
      return ;
    }
    weightValue.value = parseNumber(inputBuffer);
    inputBuffer = ''; // 清空缓存
    if (Math.abs(weightValue.value-vData.lastWeight)<=weightRange){
      return; // 误差小于设定值，忽略
    }
    vData.lastWeight= weightValue.value;
    // setJobInfo();dialog.success('请选择型号');
    saveData().then();
  } else{
    if (firstInputStr==='' && inputBuffer==='') {
      // 第一次输入，暂存，待下次处理
      firstInputStr=e.key;
      lastInputTime= Date.now();
      return ;
    }else{
      if(lastInputTime>0 && Date.now()-lastInputTime>50){
        // 距离上次操作 >50ms，清除缓存，重新开始
        firstInputStr='';
        inputBuffer='';
        lastInputTime=0;
        return ;
      }
    }
    if (firstInputStr){
      inputBuffer=firstInputStr;
      firstInputStr='';
    }
    inputBuffer +=e.key;
  }
}


// 格式化数字，最多保留 length 位小数（默认 4 位）
const formatNumber = (input, length = 4) => {
  const num = Number(input);
  if (Number.isNaN(num)) return 0;
  // 用 toFixed 先统一精度，再去掉多余 0
  return parseFloat(num.toFixed(length));
};

// 计算函数
const calculatePanelInfo = (data) => {
  const approveStatus= dataOption['approveStatus']?.[data?.approveStatus] || '';
  const pnlWeightG= formatNumber(data?.pnlHeavy); // PNL重量 (G)
  const arrayWeightKG= formatNumber(data?.arrayWeight); // PNL重量 (KG)
  const unitWeightKG= formatNumber(data?.unitWeight); // SET 重量 (KG)
  const kgTog= weightUnit.value==='克'?1000:1;
  return {
    id: (data?.recId?'ID: ':'')+data?.recId,
    approveStatus,
    mixedInfo:data?.mixedInfo,
    PNLA_SIZE:data?.PNLA_SIZE,
    SET_SIZE:data?.SET_SIZE,
    mixedInfoShort:data?.mixedInfo.replace('SHEET','').replace('PNL','').replace('SET','').replace('PCS','').replaceAll('=','/').replaceAll(' ',''),
    pnlWeight:pnlWeightG || '',
    arrayWeight:arrayWeightKG?formatNumber(arrayWeightKG*kgTog):'',
    unitWeight:unitWeightKG?formatNumber(unitWeightKG*kgTog):'',
    pnlLogValue:data.pnlLogValue?formatNumber(data.pnlLogValue*kgTog):'',
    setLogValue:data.setLogValue?formatNumber(data.setLogValue*kgTog):'',
    operatingTime:core.date.datetimeFormat(data.operatingTime),
  }
}

//获取数据
const getJobList = async (keyword = '',scene='weight-list', count = null) => {
  const list = await api.get(api.url.erp.job.getWeight, {keyword, count, plantId: vData.plantId,scene,type:vData.type});
  return list.map((item) => {
    item.info = calculatePanelInfo(item.data)
    item.label= item.label+` ( ${item.extra?.M} : ${item.extra?.customerCode} - ${item.extra.sn} - ${item.data?.partRev} )`;
    item.type=vData.type;
    return item;
  })
}


const searchInput = ref('');
const jobList = ref([
  /*{
    recId: 1,
    partNum: 'A01',
    jobVersion: '1.0',
    jobCustomerCode: 'A01',
    jobLayerCount: 1,
    jobPnlArea: 1,
    jobSetArea: 1,
    jobPcsArea: 1,
    jobSetWeight: 1,
    jobPcsWeight: 1,
  }*/
]);

//刷新列表数据
const refreshJobList = async (search) => {
  isLoading.value = true;
  jobList.value = await getJobList(search);
  isLoading.value = false;
}

//从table选中，填入输入框
const listIntoInput= async (recId)=>{
  if (recId?.length<1){
    return ;
  }
  const item = jobList.value.find(item => item.data.recId === recId);
  if (typeof item==='undefined') return ;
  setJobInfo(item);
  saveData().then();
}





//保存数据
const saveData=async()=>{
  const post={unit: weightUnit.value,recId:jobId.value, weight: weightValue.value,type:vData.type};
  if (!post.weight){
    dialog.warning('请放入'+vData.type+'后称重！');
    weightValue.value=0;
    return ;
  }
  if (!post.recId){
      dialog.warning('请选择型号！');
    return ;
  }
  const confirmRes = await dialog.confirmAsync(jobInfo.value.data.partNum + jobInfo.value.data.partRev + " \r\n"+vData.type+"重量：" + post.weight + ' ' + post.unit,'重量确认',  {
    okval: "保存", noval: "重新称重", otherval: "重选型号"
  });
  if (confirmRes===false){
    weightValue.value = 0;
    return;
  }
  if (confirmRes===null){
    setJobInfo();
    return;
  }
  // 非常规重量，弹出确认框
  const weightG = post.unit === '克' ? post.weight : post.weight * 1000;
  const showConfirm = vData.isPNL ? (weightG > 2000 || weightG < 10) : (weightG > 1000 || weightG < 5);
  if (showConfirm && !await dialog.confirmAsync('重量 ' + post.weight + ' ' + post.unit + '，是否继续？')) {
    weightValue.value = 0;
    return;
  }
  isLoading.value = true;
  const res= await api.post(api.url.erp.job.saveWeight, post)
  isLoading.value = false;
  if (res){
    dialog.success('保存成功');
    weightValue.value = 0;
    setJobInfo();
    jobSelector.lastInputValue='';
    // 刷新数据
    await refreshJobList(searchInput.value);
  }
}

//查看MI
const openMi = async (id) => {
  id = parseNumber(id);
  if (id < 1) return;
  isLoading.value = true;
  await api.getErpPdf('mi', {id});
  isLoading.value = false;
}


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(async () => {
  siyi.navHide = true
  await refreshJobList();
  window.addEventListener('keydown', weightInput);
})


// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  siyi.navHide = false
  window.removeEventListener('keydown', weightInput);
})


// 首次挂载
onMounted(() => {
  let {type}= getQuery();
  if (type){
    changeType(type,false)
  }
})
</script>

<style>
.job-weight {
  .t-input, input, input::placeholder, input:hover, button {
    background: none;
    color: #fff;
    border: none;
  }

  .job-form .t-input {
    height: 60px;
    font-size: 30px;
  }

  .t-input__inner {
    text-align: center;
  }

}

.jobSelectorPops{
  background-color: #fff;
  .t-select-option span,.t-select-option{
    font-size: 22px;
    height: 42px;
    line-height: 42px;
    color: #12408c;
  }
  .t-select__empty{
    height: var(--td-comp-size-xl);
    line-height: var(--td-comp-size-xl);
  }
}
.scroll-hide {
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-hide::-webkit-scrollbar {
  display: none;
}

.long-text{
  overflow: hidden;             /* 超出隐藏 */
  display: -webkit-box;         /* 必须配合 -webkit-line-clamp */
  -webkit-line-clamp: 2;        /* 限制最多 2 行 */
  -webkit-box-orient: vertical; /* 垂直排列 */
  word-break: break-all;        /* 单词过长时换行 */
  text-decoration: none;
}


</style>

<style scoped>
.job-weight {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows:  30% auto;

  ::selection {
    background-color: rgba(255, 255, 255, 0.8);
    color: #007BFF; /* 选中文字变成蓝色 */
  }

  video {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    object-fit: cover;
  }

  .box {
    border: 1px solid #3ca4ff;
    color: #fff;
  }

  .row1 {
    display: grid;
    grid-template-columns: 1fr 2fr 4fr;

    .box-type{
      display: grid;
      place-items: center;
      font-size: 120px;
      font-weight: bold;
      color: #fff;
      border-right: none;
    }

    .box-weight {
      display: grid;
      place-items: center;
      font-size: 120px;
      font-weight: bold;
      color: #fff;
      border-left: none;
    }

    .box-show {
      display: grid;
      grid-template-rows: 20% auto;
      overflow: scroll;

      .job-form {
        width: 100%;
        height: 100%;
        place-items: center;
        display: grid;
        grid-template-columns: 200px 1fr;
        position: relative;



        .job-select {
          position: absolute;
          top: 100%; /* 紧贴 .box 底部 */
          left: 0;
          width: 100%; /* 和 .box 一样宽 */
          padding: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 10;
          height: 500px;
          overflow-y: scroll;
          background-color: #f8f8f9;

          .t-list-item {
            font-size: 20px;
          }
        }

      }

      table {
        width: 100%;
        height: 100%;
        padding: 5px;
        font-size: 20px;
      }
      th, td {
        padding: 0 10px;
        word-break: break-all
      }
    }
  }

  .row2 {
    display: grid;
    grid-template-rows:  40px auto;
    grid-template-columns: 1fr;
    overflow: hidden;

    .box-search {
      display: grid;
      grid-template-columns: 1fr 80px;
    }

    .box-list {
      display: grid;
      grid-template-rows:  68px auto;
      overflow: auto;

      table, tr, th {
        font-size: 20px;
        line-height: 32px;
        text-align: center;
      }

      .tbody-scroll {
        overflow-y: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      table tr:hover,  table tr .active {
        color: #007BFF;
        background-color: rgba(255, 255, 255, 0.8);
      }

      th, td {
        border: 1px solid #ccc;
        padding: 0;
        word-break: break-all;

      }


    }

  }

}
</style>
