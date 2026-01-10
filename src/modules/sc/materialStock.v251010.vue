<template>
  <div class="job_test_bench" v-loading="vData.isLoading && vData.showLoading">
  <vbg  />
    <div class="box row1">
      <div class="filter-box">
        <t-select size="large" v-if="vData.warehouse.length<1" v-model="filters.plantId"  :options="plantList"  style="width: 200px"  @change="plantChange" ></t-select>
        <t-select size="large" v-if="vData.warehouse.length!==1"  label="仓库：" :minCollapsedNum="1" filterable multiple v-model="filters.warehouse" style="width: 360px"  :options="warehouseList" @change="showList()" ></t-select>
        <t-radio-group size="large" v-if="tableList.length" v-model="filters.status" variant="primary-filled" @change="debounceShowList">
          <t-radio-button :value="status" v-for="(count,status) in vData.statusList">{{vData.fieldOptions['status']?.[status]}} : {{count}}</t-radio-button>
        </t-radio-group>
        <span class="title" v-if="vData.title"> {{vData.title}}</span>
        <t-input size="large" style="width: 400px" clearable  v-model="filters.keyword" @change="()=>{filters.status='0'; debounceShowList()}"  placeholder="请输入物料代码、物料名称、物料规格" />
      </div>

    </div>
    <div class="box row2">
      <div class="box box-list">

        <table class="table-header">
          <colgroup>
            <col  style="width:60px">
            <!--              <col style="width:120px" title="工厂">-->
            <col v-if="vData.showWarehouse" style="width:120px" title="仓库">
            <!--              <col style="width:120px" title="分类编号">-->
            <!--              <col style="width:120px" title="分类名称">-->
            <col style="width:140px" title="物料编码">
            <col style="width:300px" title="物料名称">
            <col title="标准规格">
            <col style="width:120px"  title="库存数量">
            <!--              <col style="width:120px" title="单位"> -->
            <!--              <col style="width:120px" title="储区"> -->
            <col style="width:140px" title="制造日期">
            <col style="width:100px" title="保质期">
            <col style="width:90px" title="预警天数">
            <col style="width:140px" title="过期时间">
            <col style="width:90px" title="剩余天数">
            <col style="width:80px" title="状态">
          </colgroup>
          <thead>
          <tr>
            <th>序号</th>
<!--            <th @click="sortList('工厂')">工厂</th>-->
            <th v-if="vData.showWarehouse" @click="sortList('仓库')">仓库</th>
<!--            <th @click="sortList('分类编号')">分类编号</th>-->
<!--            <th @click="sortList('分类名称')">分类名称</th>-->
            <th @click="sortList('物料编码')">物料编码</th>
            <th @click="sortList('物料名称')">物料名称</th>
            <th @click="sortList('物料规格')">物料规格</th>
            <th @click="sortList('库存数量')">库存数量</th>
<!--            <th @click="sortList('单位')">单位</th>-->
<!--            <th @click="sortList('储区')">储区</th>-->
<!--            <th @click="sortList('库位')">库位</th>-->
            <th @click="sortList('制造日期')">制造日期</th>
            <th @click="sortList('保质期')">保质期(天)</th>
            <th @click="sortList('预警天数')">预警天数</th>
            <th @click="sortList('过期时间')">过期时间</th>
            <th @click="sortList('剩余天数')">剩余天数</th>
            <th @click="sortList('状态')">状态</th>
          </tr>
          </thead>
        </table>

        <div class="scroll-auto scroll-hide">
          <table class="table-body">
            <colgroup>
              <col  style="width:60px">
              <!--              <col style="width:120px" title="工厂">-->
              <col v-if="vData.showWarehouse" style="width:120px" title="仓库">
              <!--              <col style="width:120px" title="分类编号">-->
              <!--              <col style="width:120px" title="分类名称">-->
              <col style="width:140px" title="物料编码">
              <col style="width:300px" title="物料名称">
              <col title="标准规格">
              <col style="width:120px"  title="库存数量">
              <!--              <col style="width:120px" title="单位"> -->
              <!--              <col style="width:120px" title="储区"> -->
              <col style="width:140px" title="制造日期">
              <col style="width:100px" title="保质期">
              <col style="width:90px" title="预警天数">
              <col style="width:140px" title="过期时间">
              <col style="width:90px" title="剩余天数">
              <col style="width:80px" title="状态">
            </colgroup>
            <tbody>
            <tr v-for="(item,index) in tableListShow" :key="index" >
              <td >{{index+1}}</td>
<!--              <td >{{item['工厂']}}</td>-->
              <td v-if="vData.showWarehouse">{{item['仓库']}}</td>
<!--              <td >{{item['分类编号']}}</td>-->
<!--              <td >{{item['分类名称']}}</td>-->
              <td >{{item['物料编码']}}</td>
              <td >{{item['物料名称']}}</td>
              <td >{{item['标准规格']}}</td>
              <td >{{formatNumber(item['库存数量'])}}{{item['单位']}}</td>
<!--              <td >{{item['单位']}}</td>-->
<!--              <td >{{item['储区']}}</td>-->
              <td >{{item['制造日期']}}</td>
              <td >{{item['保质期']}}</td>
              <td >{{item['预警天数']}}</td>
              <td >{{item['过期时间']}}</td>
              <td >{{item['剩余天数']}}</td>
              <td ><t-tag :theme="vData.statusTheme?.[item['状态']]" size="large">{{item['状态_text']}}</t-tag></td>
            </tr>
            </tbody>
          </table>
        </div>

        <table class="table-footer">
          <tr>
            <td :colspan="vData.showWarehouse?12:11">{{vData.msg}}
              <div class="clock" v-show="!vData.isLoading">
                <span @click="vData.refreshTime=null"  v-if="vData.refreshTime" ><i class="ri-refresh-line rotate" ></i>{{vData.refreshTime}}秒后刷新</span>
                <span @click="vData.refreshTime=vData.refreshTimeDefault;" v-else><i class="ri-play-line" ></i>自动刷新</span>
             </div>
            </td>
          </tr>
      </table>
    </div>
    </div>
  </div>

</template>
<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref, shallowRef, watch} from "vue";
import * as api from "@/core/script/api.js";
import Vbg from "@/core/component/vbg.vue";
import {plantList} from "@/utils/erp.js";
import _, {debounce} from "lodash";
import siyi from "@/core/script/siyi.js";

const filters= ref({
  plantId:siyi.user.plantId,
  warehouse:[],
  keyword:'',
  status:'0',
});

const vData=reactive({
  warehouse:[],
  plantId:null,
  msg:'',
  title:'',
  isLoading:false,
  showLoading:true,
  showWarehouse:true,
  filterKey:siyi.nav.id+'_filters',
  fieldOptions:{},
  statusTheme:{},
  statusList:{},
  timer:null,
  refreshTime:null,
  refreshTimeDefault:60,
});

const warehouseAll=shallowRef([]); // 仓库列表（全部）
const warehouseList=shallowRef([]); // 仓库列表（本厂）
const tableList=shallowRef([]);// 表格数据 （只对整体做响应式）
const tableListShow=shallowRef([]);// 表格数据 （只对整体做响应式）

// 格式化数字，最多保留 length 位小数（默认 4 位）
const formatNumber = (input, length = 4) => {
  const num = Number(input);
  if (Number.isNaN(num)) return 0;
  // 用 toFixed 先统一精度，再去掉多余 0
  return parseFloat(num.toFixed(length));
};

const plantChange=async(plantId)=>{
  warehouseList.value= warehouseAll.value.filter(item => item.plantsId === plantId || item.plantsId === plantId+'');
  if (vData.plantId && vData.plantId!==plantId){
    filters.value.warehouse=[];
  }
  vData.plantId=plantId;
  await getList();

}


//保存数据
const getList=async()=>{
  if (vData.isLoading) return;
  vData.msg='数据加载中...';
  vData.refreshTime=null;
  vData.isLoading=true;
  const {list,option,param}=await api.get(api.url.sc.warehouse.materialStock,{plantId:vData.plantId,warehouse:vData.warehouse});
  vData.fieldOptions=option;
  tableList.value =list;
  vData.isLoading=false;
  vData.refreshTimeDefault=param?.refreshTime || 60;
  vData.statusTheme=param?.statusTheme || {};
  showList();
}




const showList=()=>{
  vData.isLoading=true;
  const {warehouse,status,keyword}=filters.value;
  const kw = keyword.trim().toLowerCase();
// 先做 仓库 + 关键词 过滤
  let baseList = tableList.value.filter(item => {
    const whOK = !warehouse.length || warehouse.includes(item['仓库ID']);
    const kwOK = !kw.length ||
        item['物料编码'].toLowerCase().includes(kw) ||
        item['物料名称'].toLowerCase().includes(kw) ||
        item['标准规格'].toLowerCase().includes(kw);
    return whOK && kwOK;
  });

// 状态统计（不受 status 筛选影响）
  vData.statusList = { 0: baseList.length };
  for (const item of baseList) {
    vData.statusList[item['状态']] = (vData.statusList[item['状态']] || 0) + 1;
  }

// 最后再应用 status 过滤
  const list = baseList.filter(item => {
    return status==='0' || status==='全部' || !status || status === (item['状态']+''); // status 是字符串（对象的键名都是字符串）
  });

  vData.msg=Object.keys(vData.statusList).map(status => `${vData.fieldOptions['status'][status]}:${vData.statusList[status]}条`).join("； \t")+
      "\t更新时间： "+new Date().toLocaleString();
  tableListShow.value=list;
  vData.isLoading=false;
  vData.refreshTime=vData.refreshTimeDefault;
}

const debounceShowList = debounce(showList, 1000)


const sortBy = ref();
const direction = ref('asc'); // 默认升序
const sortList=(field)=>{
  // 如果点击的字段与当前字段相同，就切换方向
  vData.isLoading=true;
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
  vData.isLoading=false;
}


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onMounted(async () => {
  siyi.navHide = true
  const {warehouse,title} = {...siyi.nav.query};
  if(warehouse){
    vData.warehouse=filters.warehouse=warehouse;
    vData.showWarehouse=false;// 隐藏仓库
    vData.plantId=null;
    filters.value.plantId=null; //不限制工厂
  }
  vData.title=title || '';
  const warehouseAllTmp=await api.get(api.url.common.selector, {type: 'warehouse',showMore:true});
  warehouseAll.value=vData.warehouse?warehouseAllTmp.filter(item => !warehouse || warehouse.includes(item.recId)):warehouseAllTmp;
  if (warehouse && warehouse.length===1 && vData.title.length<1){
    vData.title=warehouseAllTmp.find(item => item.recId === warehouse[0])?.label+'物料库存看板';
  }

  const savedFilters = localStorage.getItem(vData.filterKey);
  if (savedFilters) {
    try {
      filters.value = JSON.parse(savedFilters);
    } catch {
      localStorage.removeItem(vData.filterKey);
    }
  }
  await plantChange(filters.value.plantId);
  vData.showLoading=false;
})


onActivated(()=>{
  siyi.navHide = true
  vData.timer=setInterval(async () => {
    if (typeof vData.refreshTime==='number' && vData.refreshTime<=0){
      console.log('timer',vData.refreshTime);
      await plantChange(filters.value.plantId);
    }else if(vData.refreshTime>0){
      vData.refreshTime--;
    }else{
      vData.refreshTime=null;
    }
  }, 1000)
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  siyi.navHide= false
  clearInterval(vData.timer)
})

// 监听数据变化，自动保存
watch(filters, (val) => {
  localStorage.setItem(vData.filterKey, JSON.stringify(val));
}, { deep: true });

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

    .filter-box {
      font-size: 20px;
      width: 100%;
      height: 100%;
      color: #fff;
      border-color: #fff;
      /*place-items: center;
      display: grid;
      grid-template-columns:200px auto auto 300px;*/
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row;

      .title{
        font-size: 50px;
        font-weight: bold;
      }
      .t-radio-button{
        padding: 5px 10px;
      }

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
      grid-template-rows:  60px auto 36px;
      overflow: hidden;
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
      .scroll-auto {
        overflow-y: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      table tr:hover,  table tr .active {
        color: #FFD700;
      }
      table tr,th,td {
        font-size: 20px;
        line-height: 30px;
        text-align: center;
        border: 1px solid #ccc;
        padding: 0;
        word-break: break-all;
      }
      .col-attr{
        font-size: 12px;
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

.clock{
  display: inline-block;
  margin-left: 50px;
}
.rotate {
  display: inline-block;
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>