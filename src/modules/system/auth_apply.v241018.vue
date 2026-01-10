<template>
  <div class="siyi-auth-apply-list" title="权限申请单处理">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind()" @click="listBtn.action.click"   />

        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />


        <span style="margin:0 10px 0 20px ">筛选：</span>


        <vxe-select v-model="vData.params.type" placeholder="类型" size="small" clearable style="width: 120px"
                    @change="searchList('init')" :options="vData.listLabel.type">
        </vxe-select>

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.status">
        </vxe-select>


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
import {getCurrentPage, http, url as apiUrl} from "@/core/script/api.js"
import noData from '@/core/assets/img/nodata.gif'
import {getQuery} from "@/core/script/nav"
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import {getOptionsLabel} from "@/utils/vars.js";
import userAuth from './user_auth.v241221.vue'
import userList from '@/modules/system/user.v250809.vue'
import dialog from "@/core/script/dialog.js";


// 接口URL
const _apiUrl = apiUrl.system.authApply;

//列配置
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '用户ID', width: 100, field: 'uid', sortable: true,visible:false},
  {title: '身份', width: 150, field: 'identity_info', sortable: true},
  {title: '姓名', width: 100, field: 'nickname', sortable: true},
  {title: '账号', width: 100, field: 'username', sortable: true},
  {title: '类型', width: 100, field: '_text.type', sortable: true},
  {title: '描述', minWidth: 100, field: 'description'},
  {title: '内容', minWidth: 100, field: 'description',formatter:({row})=>row.item.name+' '+(row.item?.data?.name || '')},
  {title: '数据', minWidth: 300, field: 'item',formatter:({row})=>JSON.stringify(row.item),visible:false},
  {title: '状态', width: 80, field: '_text.status', sortable: true},
  {title: '审核人', width: 140, field: '_text.audit_uid', sortable: true},
  {title: '审核时间', width: 142, field: '_text.audit_time', sortable: true},
  {title: '创建人', width: 140, field: '_text.created_uid', sortable: true},
  {title: '创建时间', width: 142, field: '_text.created_at', sortable: true},
  {title: '更新人', width: 140, field: '_text.updated_uid', sortable: true,visible:false},
  {title: '更新时间', width: 140, field: '_text.updated_at', sortable: true,visible:false},
  {title: 'ID', width: 60, field: 'id', sortable: true},
];

//默认数据
const defaultData={
  typeList:[],
  params:{
    search: '',//搜索关键字
    type:'',//类型
    status:0,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
  },
};

//页面数据
const vData = reactive({
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
    id: 'siyi-auth-apply-list',
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
    cellDblclick:({row,column})=>{
      console.log('field',column.field);
      if(column.field==='description'){
        // 查询拥有此权限的用户
        dialog.window(userList,{query:{auth_item:row.item.name,auth_title:row.description},scene:'auth'},{
          title:"权限查询："+row.description+(row.description.indexOf(row.name)>-1?'':("("+row.item.name+")"))
          ,width:'80%',height:'80%'})
      }else{
        // 查询此用户的所有权限
        dialog.window(userAuth,{uid:row.uid},{title:row.identity_info+" "+row.nickname+" - 权限管理",width:'80%',height:'80%'})
      }
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
    bind:()=>{
      return {
        className:'list-action',
        size:"small",
        options:[
          {name:'audit_1',mode:'text',content:"通过",icon:'vxe-icon-check'},
          {name:'audit_2',mode:'text',content:"拒绝",icon:'vxe-icon-close'},
          {name:'audit_3',mode:'text',content:"撤销",icon:'vxe-icon-undo'}
        ]
      }
    },
    click:({name},row)=>{
      switch (name){
        case 'audit_1':{
          let id=listBtn.getSelectedRows(true);
          id && formEvent.audit({id,status:1});
          break;
        }
        case 'audit_2':{
          let id=listBtn.getSelectedRows(true);
          id && formEvent.audit({id,status:2});
          break;
        }
        case 'audit_3':{
          let id=listBtn.getSelectedRows(true);
          id && formEvent.audit({id,status:3});
          break;
        }
        default : {

        }
      }
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
  audit:async (param)=>{
    const actionText=['','通过','拒绝','撤销'];
    dialog.confirm('确认'+actionText[param.status]+'？',async ()=>{
      const res= await http.get(_apiUrl.audit,{params:param});
      if (res.data.code !== 20000) {
        dialog.error(res.data.message);
        return;
      }
      await searchList()
    })
  },
  set: async (id, value,key='status') => {
    if(id===undefined){
      return ;
    }
    dialog.confirm('确认操作？', async ()=>{
      let res = await http.post(_apiUrl.set, {id: id, [key]: value});
      if (res.data.code !== 20000) {
        dialog.error(res.data.message);
        return;
      }
      await searchList()
    })
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
  vData.params={...vData.params,...param, currentPage:getCurrentPage(type,vData.params,vData.list.length)};
  type==='reset' && (vData.params={...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let res = await http.get(_apiUrl.list, {params:vData.params});
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
  let {type}= getQuery();
  console.log('onMounted type',type);
  vData.params.type=defaultData.typeList.includes(type)?type:defaultData.typeList[0];
  searchList()
})

// 页面显示时
onActivated(() => {
  let {type}= getQuery();
  console.log('onActivated type',type);
  if(type!==vData.params.type){
    vData.params.type=defaultData.typeList.includes(type)?type:defaultData.typeList[0];
    searchList();
  }
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})


</script>

<style scoped>
.siyi-auth-apply-list {
  width: 100%;
  height: 100%;
  position: absolute;

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .list-action{
    margin-right: 40px;
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

}
</style>