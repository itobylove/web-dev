<template>
  <div class="siyi-queue-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind" @click="listBtn.action.click"   />

<!--        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />-->


        <span style="margin:0 10px 0 20px ">筛选：</span>

        <vxe-select v-model="vData.params.attempt" placeholder="执行状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.attempt">
        </vxe-select>

        <t-date-range-picker v-model="vData.params.time_range" enable-time-picker allow-input clearable style="width: 360px;"
          :presets="presets" @change="searchList('init')"  @confirm="searchList('init')" title="执行时间" />


        <vxe-input type="search" v-model="vData.params.search" placeholder="搜索"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 200px" />

        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>

      </template>
      <template #empty><span><img :src="noData"><p>{{ vData.msg }}</p></span></template>
    </vxe-grid>

  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import * as core from "@/core/script/core"
import * as api from "@/core/script/api"
import noData from '@/core/assets/img/nodata.gif'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import {VxeUI} from "vxe-pc-ui";
import {getOptionsLabel} from "@/utils/vars.js";
import {presets} from "@/utils/tdesign.js";
import dialog from "@/core/script/dialog.js";


// 接口URL
const _apiUrl = api.url.system.queue;



//列配置
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '类型', width: 100, field: 'job.data.title', sortable: true},
  {title: '内容', minWidth: 100,align:"left", field: 'job.data.description', sortable: true},
  {title: '已执行', width: 80, field: '_text.attempt', sortable: true,},
  {title: '耗时(S)', width: 80, field: 'reserved_at',formatter:({row})=>row.reserved_at-row.pushed_at, sortable: true},
  {title: '执行时间', width: 144, field: '_text.reserved_at', sortable: true},
  {title: '创建时间', width: 144, field: '_text.pushed_at', sortable: true},
  {title: 'ID', width: 80, field: 'id', sortable: true},
];

//默认数据
const defaultData={
  typeList:[],
  params:{
    search: '',//搜索关键字
    attempt:undefined,//状态
    time_range:presets['今天'], //默认时间
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
  },
  modal_bind:{
    className:'editModal',
    size: "mini",
    width: '75%',
    height:'75%',
    minHeight: 800,
    maxWidth:1280,
    position: 'center',
    loading: false,
    resize: 'resize',
  },
};

//页面数据
const vData = reactive({
  params:{...defaultData.params},
  list:[],
  msg:'',
  auth_items:[],
  listOption: {},
  listLabel: {},
});


//列表
const gridRef = ref()
const grid=reactive({
  bind:{
    ...gridOptionsDefault,
    id: 'siyi-queue-list',
    columns: columns,
    seqConfig: {
      seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
    }
  },
  on:{
    cellClick:async ({row,columnIndex})=>{
      console.log(columnIndex);
      columnIndex>1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick:({row})=>{
      // listBtn.action.click({name:'auth'},row)
    },
    zoom:({type})=>core.fullscreenSwitch(type==='max'),
  }
})

//列表批量操作
const listBtn=reactive({
  status:{
    bind:{
      modelValue:vData.params.statusAction,
      size:"small",
      placeholder: '批量修改-状态',
      prefixIcon: 'vxe-icon-checkbox-checked',
      options:[],
      className:'search-select',
    },
    on: {
      focus:()=>{
        listBtn.status.bind.options = [...vData.listLabel.status || [],...[{label:'删除',value:-1}]];
      },
      change:async ({value})=>{
        await formEvent.set(listBtn.getSelectedRows(true), value,'status');
        await searchList('init');
      }
    },
  },
  action:{
    bind:{
      className:'list-action',
      size:"small",
      options:[
      ]
    },
    click: async ({name}) => {
      const row = listBtn.getSelectedRow();
    }
  },
  getSelectedRow: (getId = false) => {
    const res = listBtn.getSelectedRows(getId);
    if (res && res?.length !== 1) {
      dialog.warning('请勾选一个需要操作的数据')
      return;
    }
    return res?.[0];
  },
  getSelectedRows: (getIds=false)=>{
    const selectedRows = gridRef.value.getCheckboxRecords();
    if (selectedRows===undefined || selectedRows.length === 0) {
      dialog.warning('请勾选要操作的数据！')
      return
    }
    return getIds?selectedRows.map((item) => item.id):selectedRows;
  }
})


const formEvent = {
  set: async (id, value,key='status') => {
    if(id===undefined){
      return ;
    }
    let confirm= await VxeUI.modal.confirm({content: '确认操作？',});
    if(confirm!=='confirm'){
      return ;
    }
    let res = await api.post(_apiUrl.set, {id: id, [key]: value});
    res && await searchList()
  },
  delete: async (id) => {
    return await formEvent.set(id, -1,'status');
  },
}

const searchListDelay=_.debounce((e)=>{
  searchList('search',{search:e?.value});
},500)

//搜索
const searchList = async (type = 'init',param={}) => {
  vData.params={...vData.params,...param, currentPage:api.getCurrentPage(type,vData.params,vData.list.length)};
  type==='reset' && (vData.params={...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let res = await api.http.get(_apiUrl.list, {params:vData.params});
  vData.msg = '没有搜索到数据！'
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  vData.list = _.cloneDeep(res.data.data.list);
  vData.listOption = res.data.data?.option?.list;
  vData.listLabel = getOptionsLabel(vData.listOption);
}



// 首次挂载
onMounted(() => {
  searchList()
})

// 页面显示时
onActivated(() => {

})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})


</script>

<style>
.siyi-queue-list {
  width: 100%;
  height: 100%;
  position: absolute;

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .list-action{
    .vxe-button+.vxe-button.type--button{
      margin-left: 2px;
    }
    .mr10{
      margin-left: 10px;
    }
  }
  .search-select {
    width: 140px ;
  }

  .avatar{
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

}
</style>