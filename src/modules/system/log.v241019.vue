<template>
  <div class="siyi-log-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind" @click="listBtn.action.click"   />

        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on"  v-show="vData.params.type===0"/>


        <span style="margin:0 10px 0 20px ">筛选：</span>

        <vxe-input type="search" v-model="vData.params.uid" placeholder="uid"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay($event,'uid')" clearable v-show="vData.params.type===0"
                   style="width: 200px" />

        <vxe-select v-model="vData.params.search_type" placeholder="搜索类型" size="small" clearable style="width: 100px"
                    @change="searchList('init')"  v-show="vData.params.type===0" :options="vData.search_type">
        </vxe-select>

        <vxe-input type="search" v-model="vData.params.search" placeholder="搜索"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay($event,'search')" clearable
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
import {getCurrentPage, http, url} from "@/core/script/api.js"
import noData from '@/core/assets/img/nodata.gif'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import {VxeUI} from "vxe-pc-ui";
import {UAParser} from 'ua-parser-js';
import {getQuery} from "@/core/script/nav"
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";


// 接口URL
const apiUrl = url.system.log;

const UAFormatter=({row})=>{
  const ua=UAParser(row.userAgent);
  return ua.os.name?[ua.os.name+" "+ua.os.version +" "+ua.browser.name+" "+ua.browser.major].join("\t"):row.userAgent;
}

//列配置
const columns0=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '部门', width: 150, field: 'identity_info', sortable: true},
  {title: '用户', width: 100, field: 'nickname', sortable: true},
  {title: '工号', width: 100, field: 'username', sortable: true,visible:false},
  {title: 'UID', width: 100, field: 'uid', sortable: true},
  {title: '头像', width: 100, field: 'avatar', sortable: true,type:'html',formatter:({row})=>{
    return row.avatar?`<img class="avatar" src="${row.avatar}" />`:'';
    },visible:false},
  {title: '时间', width: 144, field: '_text.created_at', sortable: true},
  {title: '方法', width: 100, field: 'method', sortable: true,visible:false},
  {title: 'IP', width: 120, field: 'ip', sortable: true},
  {title: 'UA', width: 200, field: 'userAgent', sortable: true,formatter:UAFormatter},
  {title: '前端模块', width: 200, field: 'page', sortable: true},
  {title: 'API路径', width: 200, field: 'module', sortable: true},
  {title: '路径名', width: 150, field: 'module2', sortable: true,formatter:({row})=>{
    return vData.listOption.items?.[row.module2] || ''
  }},
  {title: '数据', minWidth: 200, field: 'data', sortable: true},
  {title: 'url', minWidth: 180, field: 'url', sortable: true,visible: false},
  {title: 'refer', minWidth: 180, field: 'refer', sortable: true,visible: false},
  {title: 'uuid', minWidth: 180, field: 'uuid', sortable: true,visible: false},
  {title: 'ID', width: 100, field: 'id', sortable: true},
];

const columns1=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '部门', width: 150, field: 'dept_name', sortable: true},
  {title: '姓名', width: 100, field: 'employeeName', sortable: true},
  {title: '登陆账号', width: 100, field: 'loginName', sortable: true},
  {title: '工号', width: 100, field: 'userCode', sortable: true},
  {title: 'UID', width: 100, field: 'userId', sortable: true},
  {title: 'IP', width: 120, field: 'loginIp', sortable: true},
  {title: '时间', width: 146, field: 'loginTime', sortable: true,formatter:core.date.formatterYMDHms},
  {title: 'MAC', width: 140, field: 'loginMac', sortable: true},
  {title: '动作', width: 140, field: 'remark', sortable: true},
  {title: 'id', width: 100, field: 'recId', sortable: true},
];


//默认数据
const defaultData={
  typeList:[
    {title:"操作日志",name:"action",columns:columns0},
    {title:"ERP登陆",name:"erp-login",columns:columns1}
  ],
  params:{
    search_type: 'a.page',//搜索类型
    search: '',//搜索关键字
    type:0,//类型
    status:undefined,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
  },
};

//页面数据
const vData = reactive({
  search_type:[
    {label:'前端模块',value:'a.page'},
    {label:'用户ID',value:'a.uid'},
    {label:'用户名',value:'u.username'},
    {label:'用户昵称',value:'u.nickname'},
    {label:'IP',value:'a.ip'},
    {label:'API路径',value:'a.module'},
    {label:'url',value:'a.url'},
    {label:'refer',value:'a.refer'},
    {label:'UA',value:'a.userAgent'},
    {label:'uuid',value:'a.uuid'},
    {label:'DATA',value:'a.data'},
  ],
  params:{...defaultData.params},
  list:[],
  msg:'',
  listOption: {},
  listLabel: {},
});


//列表
const gridRef = ref()
const grid=reactive({
  bind:{
    ...gridOptionsDefault,
    id: 'siyi-log-list',
    columns: [],
    seqConfig: {
      seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
    }
  },
  on:{
    cellClick:async ({row,columnIndex})=>{
      columnIndex>1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick:({row})=>{
      listBtn.action.click({name:'view'},row)
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
    click:({name},row)=>{
      switch (name){
        default : {

        }
      }
    }
  },
  getSelectedRow: (getId = false) => {
    const res = listBtn.getSelectedRows(getId);
    if (res && res?.length !== 1) {
      dialog.error('请勾选一个需要操作的数据')
      return;
    }
    return res?.[0];
  },
  getSelectedRows: (getIds=false)=>{
    const selectedRows = gridRef.value.getCheckboxRecords();
    if (selectedRows===undefined || selectedRows.length === 0) {
      dialog.error('请勾选要操作的数据！')
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
    let res = await http.post(apiUrl.set, {id: id, [key]: value});
    if (res.data.code !== 20000) {
      dialog.error(res.data.message);
      return;
    }
    await searchList()
  },
  delete: async (id) => {
    return await formEvent.set(id, -1,'status');
  },
}

const searchListDelay=_.debounce((e,field='search')=>{
  console.log(e?.value,field);
  searchList('search',{[field]:e?.value});
},500)

//搜索
const searchList = async (type = 'init',param={}) => {
  vData.params={...vData.params,...param, currentPage:getCurrentPage(type,vData.params,vData.list.length)};
  type==='reset' && (vData.params={...defaultData.params,type:vData.params.type});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  const url=apiUrl?.["list"+vData.params.type] || apiUrl.list0;
  grid.bind.columns=defaultData.typeList[vData.params.type]["columns"];
  let res = await http.get(url, {params:vData.params});
  vData.msg = '没有搜索到数据！'
  if (res.data.code !== 20000) {
    dialog.info(res.data.message);
    return;
  }
  vData.list = _.cloneDeep(res.data.data.list);
  vData.listOption = res.data.data?.option?.list;
  vData.listLabel = getOptionsLabel(vData.listOption);
}



// 首次挂载
onMounted(() => {
  let {type}= getQuery();
  vData.params.type=defaultData.typeList?.[type]?type:0;
  searchList()
})

// 页面显示时
onActivated(() => {
  let {type}= getQuery();
  if(type!==vData.params.type){
    vData.params.type=defaultData.typeList?.[type]?type:0;
    searchList();
  }
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})


</script>

<style>
.siyi-log-list {
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
  .new-row {
    margin-top: 20px;
    border-top: 1px solid #e8e8e8;
  }
  .avatar{
    width: 30px;
    border-radius: 50%;
  }

}
</style>