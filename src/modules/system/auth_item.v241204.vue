<template>
  <div class="siyi-auth-item-list" title="权限节点">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind" @click="listBtn.action.click"   />

        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />


        <span style="margin:0 10px 0 20px ">筛选：</span>

        <vxe-select v-model="vData.params.isAuth" placeholder="类型" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.isAuth">
        </vxe-select>
        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.status">
        </vxe-select>


        <vxe-input type="search" v-model="vData.params.search" placeholder="搜索"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 200px" />

        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" :disabled="vData.params.currentPage == 1" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" :disabled="defaultData.isEnd" title="下一页"></vxe-button>

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
import userList from '@/modules/system/user.v250809.vue'
import dialog from "@/core/script/dialog.js";
import apiUrl2 from "@/core/config/url2.js";


// 接口URL
const _apiUrl = api.url.system.authItem;

const cellChange=async (e,e2) => {
  if(grid.bind?.loading){
    return ;
  }
  const id = e.row.id;
  const field = e.column.field;
  const value = e2.value;
  if(value?.length<1){
    dialog.error('不能为空');
    return ;
  }
  grid.bind.loading=true;
  await api.post(_apiUrl.set, {id, [field]:value});
  grid.bind.loading=false;
};
const typeFormatter=({cellValue,row})=>{
  const styleList={"权限":"auth","角色":"role"};
  const style=row['name'].indexOf('nav_')===0?'nav':styleList[cellValue];
  return `<span class='cell_${style}'>${cellValue}</span>`;
}

//列配置
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '类型', width: 140, field: 'type',type:"html",sortable: true,formatter:typeFormatter},
  {title: '名称',minWidth: 200, field: 'name', sortable: true, treeNode: true,editRender: { name: 'VxeInput',events: {change: cellChange}}},
  {title: '描述',minWidth: 160, field: 'description', sortable: true,editRender: { name: 'VxeInput',events: {change: cellChange}}},
  // {title: '名称(父级)',minWidth: 200, field: 'p_name'},
  // {title: '描述(父级)',minWidth: 160, field: 'p_desc'},
  // {title: '规则名',width: 160, field: 'rule_name',visible:false},
  // {title: '数据',width: 160, field: 'data',visible:false},
  {title: '人数',width: 160, field: 'total', sortable: true},
  {title: '创建时间', width: 160, field: 'created_time', sortable: true},
  {title: '更新时间', width: 160, field: 'updated_time', sortable: true},
  {title: 'id', width: 60, field: 'id', sortable: true},
];

//默认数据
const defaultData={
  typeList:[],
  params:{
    search: '',//搜索关键字
    isAuth:null,//类型
    status:1,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
    
  },
  isEnd:false, //是否最后一页
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
    id: 'siyi-auth-item-list',
    columns: columns,
    seqConfig: {
      seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
    },
    treeConfig: {
      rowField: 'name',
      childrenField: 'children',
      parentField:'p_name',
      showLine: true
    },
    editConfig: {
      trigger: 'click',
      mode: 'cell'
    },
    editRules:{
      description:[
        {required: true, message: '不能为空', trigger: 'change'}
      ]
    },
  },
  on:{
    cellClick:async ({row,columnIndex})=>{
      console.log(columnIndex);
      columnIndex>1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick:({row})=>{
      dialog.window(userList,{query:{auth_item:row.name,auth_title:row.description},scene:'auth'},{
        title:"权限查询："+row.description+(row.description.indexOf(row.name)>-1?'':("("+row.name+")"))
        ,width:'80%',height:'80%'})
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
        // {name:'add',content:'新增',icon:'vxe-icon-add'},
        // {name:'copy',content:'复制',icon:'vxe-icon-copy'},
        // {name:'import',content:'导入菜单',icon:'vxe-icon-add-sub'},
        {name:'importMenu',content:'导入菜单',icon:'vxe-icon-add-sub'},
      ]
    },
    click: async ({name}) => {
      if(name==='import'){
        grid.bind.loading=true;
        const res = await api.get(_apiUrl.import);
        res && dialog.info(res);
        await searchList();
        grid.bind.loading=false;
      }else if(name==='importMenu'){
        grid.bind.loading=true;
        await api.get(apiUrl2.sys.auth.getMenu).then((res) =>{
          grid.bind.loading=false;
          dialog.success(`成功导入${res.count}个新菜单`);
          searchList();
        });
        await searchList();
        grid.bind.loading=false;
      }
      // const row = listBtn.getSelectedRow();
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
    dialog.info(res.data.message);
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

<style scoped>
.siyi-auth-item-list {
  width: 100%;
  height: 100%;
  position: absolute;


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
    border-radius: 50%;
  }
  .cell_role{
    color: #67c23a;
  }
  .cell_auth{
    color: #409eff;
  }
  .cell_nav{
    color: #e6a23c;

  }
  .cell_nav::after{
    content: "(菜单)";
  }

}
</style>