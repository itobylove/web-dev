<template>
  <div class="job_test_bench" v-loading="isLoading">
  <vbg  />
    <div class="box row1">
<!--        <div class="title"><p>测试架看板</p></div>-->
<!--        <job-selector v-if="jobOptions.length" :list="jobOptions"  @update:job="jobChange" ref="jobRef" :style="{'width':'100%','grid-template-columns':'120px auto 480px'}" />-->
      <div class="job-selector">
        <t-select  v-model="listFilter.plantId"  :options="plantList" @change="getList()" ></t-select>
          <t-radio-group v-model="listFilter.isAsset" variant="primary-filled" @change="showList()">
            <t-radio-button value="">资产：</t-radio-button>
            <t-radio-button value="1">已录入</t-radio-button>
            <t-radio-button value="0">未录入</t-radio-button>
          </t-radio-group>
        <t-radio-group v-model="listFilter.status" variant="primary-filled" @change="showList()">
          <t-radio-button value="">状态：</t-radio-button>
          <t-radio-button value="正常">正常(>80%)</t-radio-button>
          <t-radio-button value="注意">注意(>60%)</t-radio-button>
          <t-radio-button value="警告">警告(<60%)</t-radio-button>
        </t-radio-group>
        <t-input   v-model="listFilter.jobInput" @change="showList()"  :placeholder=" '请输入型号'" />
      </div>

    </div>
    <div class="box row2">
      <div class="box box-list">

        <table class="table-header">
          <colgroup>
            <col style="width:80px">
            <col style="width:220px">
            <col style="width:80px">
            <col style="width:auto">
            <col style="width:160px">
            <col style="width:180px">
            <col style="width:100px">
            <col style="width:100px">
            <col style="width:120px">
            <col style="width:100px">
            <col style="width:100px">
            <col style="width:120px">
  <!--          <col style="width:120px">-->
            <col style="width:200px">
          </colgroup>
          <thead>
          <tr>
            <th>序号</th>
            <th>型号</th>
            <th>版本</th>
            <th >工单号</th>
            <th @click="sortList('pcsNum')">PCS数量</th>
            <th @click="sortList('processName')">当前工序</th>
            <th @click="sortList('leftProcessNum')">剩余步数</th>
            <th @click="sortList('status')">工单状态</th>
            <th @click="sortList('job_test_bench_status')">测试架状态</th>
            <th @click="sortList(p=>p.percent)">剩余寿命</th>
            <th @click="sortList('job_test_bench_total_num')">剩余次数</th>
            <th @click="sortList('job_test_bench_total_num')">总次数</th>
  <!--          <th>当前工序</th>-->
            <th>更新时间</th>
          </tr>
          </thead>
        </table>

        <div class="scroll-auto scroll-hide">
          <table class="table-body">
            <colgroup>
              <col style="width:80px">
              <col style="width:220px">
              <col style="width:80px">
              <col style="width:auto">
              <col style="width:160px">
              <col style="width:180px">
              <col style="width:100px">
              <col style="width:100px">
              <col style="width:120px">
              <col style="width:100px">
              <col style="width:100px">
              <col style="width:120px">
              <!--          <col style="width:120px">-->
              <col style="width:200px">
            </colgroup>
            <tbody>
            <tr v-for="(item,index) in tableListShow" :key="index" @dblclick="editRow(item)">
              <td >{{index+1}}</td>
              <td > {{item.partNum}}</td>
              <td > {{item.partRev}}</td>
              <td > {{item.woNumber}}</td>
              <td > {{item.pcs}}</td>
              <td > {{item.processName}}</td>
              <td > {{item.leftProcessNum}}</td>
              <td > {{item.status_text}}</td>
              <td ><i :class="vData.statusIcon[item.job_test_bench_status]"></i>{{item.job_test_bench_status}}</td>
              <!--          <td ><t-progress theme="plump" color="#56c08d" track-color="#d54941" :percentage="item.percent" /></td>-->
              <td ><t-progress v-if="item.percent" theme="plump" :color="item.color" :percentage="item.percent" /> <span v-else>{{item.percent}}</span></td>
              <td ><span v-if="item.job_test_bench_left_num">{{item.job_test_bench_left_num}}</span></td>
              <td ><span v-if="item.job_test_bench_total_num">{{item.job_test_bench_total_num}}</span></td>
              <!--          <td >{{item.job_test_bench_process}}</td>-->
              <td >{{item.job_test_bench_utime}}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <table class="table-footer">
          <tr>
            <td colspan="12">{{msg}}</td>
          </tr>
      </table>
    </div>
    </div>
  </div>

</template>
<script setup>
import {onActivated, onDeactivated, ref, shallowRef} from "vue";
import * as api from "@/core/script/api.js";
import Vbg from "@/core/component/vbg.vue";
import {parseJobSn, plantList} from "@/utils/erp.js";
import {getPercent, getRangeColor} from "@/utils/vars.js";
import editPage from './edit.v250401.vue'
import _ from "lodash";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";

const listFilter= ref({
  plantId:1,
  isAsset:'',
  jobInput:'',
  status:'',
});

const msg=ref('');
const isLoading=ref(false);

const vData={
  tableList:[],
  dataOption:{attr_list:[], cate_id:null,},
  statusIcon:{
    "正常":"ri-arrow-right-s-fill color-success",
    "注意":"ri-alarm-warning-line color-warning",
    "警告":"ri-alert-line color-danger"
  }
};

const tableListShow=shallowRef([]);// 表格数据 （只对整体做响应式）
const jobOptions=shallowRef([]);  // 工单选项 （只对整体做响应式）


//保存数据
const getList=async()=>{
  isLoading.value=true;
  const {list,option}= await api.get(api.url.erp.job.testBench,{plantId:listFilter.value.plantId})
  vData.dataOption=option;
  list.forEach(item=>{
    item.job_test_bench_used_num=parseFloat(item.job_test_bench_used_num) || 0;
    item.job_test_bench_total_num=parseFloat(item.job_test_bench_total_num) || 0;
    // 剩余百分比= (1 - (已使用次数 / 总次数) * 100)
    item.job_test_bench_left_num=item.job_test_bench_total_num - item.job_test_bench_used_num;
    item.percent= item.job_test_bench_total_num?getPercent(item.job_test_bench_left_num, item.job_test_bench_total_num,2,0):undefined;
    item.color=getRangeColor(item.percent,'#56c08d','#d54941');
    item.job_test_bench_status='';
    if(typeof item.percent==='number'){
      item.job_test_bench_status=item.percent>80?'正常':(item.percent>60?'注意':'警告');
    }
  })
  isLoading.value=false;
  vData.tableList=list || [];
  jobOptions.value=list.map(item=>{
    return {
      label:item.partNum+item.partRev,
      value:item.recId,
      data:item,
      extra:parseJobSn(item.partNum+item.partRev),
    }
  })
  showList();
}

const showList=()=>{
  const {jobInput,isAsset,status}=listFilter.value;
  const list = vData.tableList.filter(item => {
    const includesKeyword=jobInput.length===0 || (item.partNum + item.partRev).includes(jobInput);
    const isAssetMatch=isAsset===''?true:(isAsset===(item?.asset_id?'1':'0'));
    const statusMatch=status===''?true:(status===item?.job_test_bench_status);
    return includesKeyword && isAssetMatch  && statusMatch;
  });
  const tongji={
    "已登记":list.filter(item=>item?.asset_id).length,
    "正常":list.filter(item=>item?.job_test_bench_status==='正常').length,
    "注意":list.filter(item=>item?.job_test_bench_status==='注意').length,
    "警告":list.filter(item=>item?.job_test_bench_status==='警告').length,
  }
  msg.value=`共${list.length}条数据；已登记:${tongji['已登记']} ；正常：${tongji['正常']}; 注意：${tongji['注意']}；警告：${tongji['警告']}`;
  tableListShow.value=Object.assign([],list);
  // console.log('Object.assign([],list)',Object.assign([],list));
}


const sortBy = ref();
const direction = ref('asc'); // 默认升序
const sortList=(field)=>{
  // 如果点击的字段与当前字段相同，就切换方向
  if ((typeof sortBy.value==='function' && typeof field==='function' && sortBy.value.toString() === field.toString()) || sortBy.value===field) {
    direction.value = direction.value === 'asc' ? 'desc' : 'asc';
    console.log('相同');
  } else {
    // 新字段，默认升序
    sortBy.value = field;
    direction.value = 'asc';
  }
  if (direction.value==='desc'){
    tableListShow.value=_.sortBy([...tableListShow.value], [sortBy.value]).reverse();
  }else{
    tableListShow.value=_.sortBy([...tableListShow.value], [sortBy.value]);
  }
}


const editRow = async (item) => {
  const query={
    asset:{
      plant_id:item?.plant_id || listFilter.value.plantId,
      id: item?.asset_id,
      name:  item?.asset_name || item?.partNumRev,
      cate_id: item?.cate_id || vData.dataOption.cate_id,
      remark: item?.asset_remark || '',
    },
    attr:[],
    hide_fields: ['code','area_full_name','manager_name','manager_remark','manager_at'],
  };
  const _window=dialog.window(editPage,
      {query, dataOption: {}, afterSave: () => _window.close()},
      {title:'测试架管理', width: '70%', maxWidth: 1440, height: '80%',maxHeight:960, onAfterClose: async () => await getList()}
  )
}




// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(async () => {
  siyi.navHide = true
  await getList();
})


// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  siyi.navHide= false
})

</script>


<style scoped>
.job_test_bench {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows:  100px auto;
  .box {
    color: #fff;
    ::selection {
      background-color: rgba(255, 255, 255, 0.8);
      color: #007BFF; /* 选中文字变成蓝色 */
    }
  }
  .row1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    text-align: center;
    flex-direction: column;
    .title{
      font-size: 50px;
      font-weight: bold;
      line-height: 120px;
      display: flex;
      align-items: center;
    }


    .job-selector {
      font-size: 20px;
      width: 100%;
      height: 100%;
      place-items: center;
      display: grid;
      grid-template-columns:200px auto auto 300px;
      color: #fff;
      border-color: #fff;
    }

  }

  .row2 {
    display: grid;
    grid-template-rows:  auto;
    grid-template-columns: 1fr;
    padding: 0 20px;
    overflow: hidden;
    .box-list {
      display: grid;
      grid-template-rows:  60px auto 30px;
      overflow: hidden;
      border-bottom: 1px solid #ccc;

      .scroll-auto {
        overflow-y: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      table tr:hover,  table tr .active {
        color: #007BFF;
      }
      table tr,th,td {
        font-size: 20px;
        line-height: 40px;
        text-align: center;
        border: 1px solid #ccc;
        padding: 0;
        word-break: break-all;
      }
      .table-footer{
        td{
          font-size: 20px;
          line-height: 30px;
        }
      }

    }

  }

}
</style>