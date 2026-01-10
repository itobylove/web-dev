<template>
  <div class="dept-position">
    <TableComponent v-if="table.isInit" ref="reportRef" v-bind="getReportConfig()"/>
    <userList ref="userListRef" scene="position"  :query="table.user_query" />
    <dialogComponent ref="deptRef" v-if="deptData.isShow" v-bind="dept.bind">
      <t-form class="deptForm" :data="deptData" :rules="dept.rules" :label-width="60" style="padding: 20px;" @submit="dept.submit" >
        <t-form-item label="工厂" name="plant_id">
          <t-select v-model="deptData.plant_id" :options="plantList"/>
        </t-form-item>
        <t-form-item label="父级" name="pid">
          <t-tree-select  v-model="deptData.pid" @change="dept.pidChange"  :data="vData.dept_tree"  clearable  filterable/>
        </t-form-item>
        <t-form-item label="名称" name="name">
          <t-input v-model="deptData.name" />
        </t-form-item>
<!--        <t-form-item label="别名" name="nickname">
          <t-input v-model="deptData.nickname" />
        </t-form-item>-->
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="deptData.status" :options="vData.select_options.status" />
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" type="submit">保存</t-button>
        </t-form-item>
      </t-form>
    </dialogComponent>

    <dialogComponent ref="posiRef" v-if="posiData.isShow" v-bind="posi.bind">
      <t-form class="posiForm" :data="posiData" :rules="posi.rules" :label-width="60" style="padding: 20px;" @submit="posi.submit" >
        <t-form-item label="部门" name="pid">
          <t-tree-select  v-model="posiData.dept_id"  :data="vData.dept_tree"  clearable  filterable/>
        </t-form-item>
        <t-form-item label="编码" name="code">
          <t-input v-model="posiData.code" />
        </t-form-item>
        <t-form-item label="名称" name="name">
          <t-input v-model="posiData.name" />
        </t-form-item>
        <!--        <t-form-item label="别名" name="nickname">
                  <t-input v-model="posiData.nickname" />
                </t-form-item>-->
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="posiData.status" :options="vData.select_options.status" />
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" type="submit">保存</t-button>
        </t-form-item>
      </t-form>
    </dialogComponent>

    <dialogComponent ref="userSelectorRef" v-if="userSelector.isShow" v-bind="userSelector.bind">
      <u-selector  ref="userSelectorListRef" @selected="userSelector.selected" />
    </dialogComponent>

  </div>
</template>
<script setup>
import TableComponent from "@/core/component/table.vue";
import {onMounted, reactive, ref} from "vue";
import * as api from "@/core/script/api.js";
import {getOptionsLabel, listToTree} from "@/utils/vars.js";
import {plantList} from "@/utils/erp.js";
import * as listTableFn from "@/core/script/tableFn.js";
import dialogComponent from '@/core/component/dialog.vue'
import dialog from "@/core/script/dialog.js";
import userList from '@/modules/system/user.v250809.vue';
import uSelector from '@/core/component/userSelector.vue';


const reportRef= ref();
const userListRef=ref();

const vData= reactive({
  dept_tree:[],
  select_options: {dept_id:[],plant_id:[],status:[],position_id:[]},
  title: '部门-岗位管理',
});


// 部门编辑
const deptRef=ref();
const deptData=ref({
  id:null,
  name:'',
  nickname:'',
  pid:null,
  level:0,
  status:1,
  isShow:false,
});
const dept= {
  bind:{
    title: '部门管理',className:"deptBox", type: 'window', width: '600px', height: '600px',
    onAfterClose: () => deptData.value.isShow = false
  },
  rules:{
    name: [{required: true, message: '必填', type: 'error'}],
    pid_id: [{required: true, message: '必填', type: 'warning'}],
    plant_id: [{required: true, message: '必填', type: 'warning'}],
  },
  pidChange:(value,{node:{data}})=>{
    if (data){
      deptData.value.level=data.level+1;
      deptData.value.path=data.path+(data.path?',':'')+value;
    }
  },
  submit:async ({validateResult, firstError})=>{
    if (validateResult !== true) {
      dialog.warning('请检查输入项:'+firstError);
      return false;
    }
    const loading=  dialog.loading(".deptForm",'数据保存中...');
    const res= await api.post(api.url.system.dept.save,deptData.value);
    loading.close();
    if (!res) return;
    deptData.value.isShow=false;
    vData.select_options.dept_id = await api.departmentSelector(null,{cacheTime:0});
    vData.dept_tree = listToTree([...vData.select_options.dept_id]);
    await reportRef.value.reportOptions.getData();
  },
};

//岗位编辑
const posiRef=ref();
const posiData=ref({
  id:null,
  code:'',
  name:'',
  nickname:'',
  dept_id:null,
  status:1,
  isShow:false,
});
const posi= {
  bind:{
    title: '岗位管理',className:"posiBox", type: 'window', width: '600px', height: '600px',
    onAfterClose: () => posiData.value.isShow = false
  },
  rules:{
    code: [
        {required: true, message: '必填', type: 'error'},
        {pattern: /^[A-Za-z][A-Za-z0-9_-]{2,}$/, message: '只能包含字母、数字、中划线或下划线，且以字母开头', type: 'error'},
    ],
    name: [{required: true, message: '必填', type: 'error'}],
  },
  submit:async ({validateResult, firstError})=>{
    if (validateResult !== true) {
      dialog.warning('请检查输入项:'+firstError);
      return false;
    }
    const loading=  dialog.loading(".posiForm",'数据保存中...');
    const res= await api.post(api.url.system.position.save,posiData.value);
    loading.close();
    if (!res) return;
    posiData.value.isShow=false;
    vData.select_options.position_id = await api.positionSelector(null,{cacheTime:0});
    await reportRef.value.reportOptions.getData();
  },
};

//用户列表
const userSelectorRef = ref();
const userSelector = reactive({
  row:{},
  isShow: false,
  bind: {
    title: '添加用户', className: "userListBox", type: 'window', width: '80%', height: '600px',
    onAfterClose: () => userSelector.isShow = false
  },
  selected: async (rows) => {
    const post = {
      dept_id:userSelector.row.dept_id,
      dept_name:userSelector.row.dept.name,
      position_id:userSelector.row.position_id,
      position_name:userSelector.row.position.name,
      user_id:rows.map(item=>item.id),
      action:'add',
    }
    const text ="确定要把 "+post.user_id.length+" 位用户 添加 到 【"+post.dept_name+"】的【"+post.position_name+"】吗？";
    if (!await dialog.confirmAsync(text)){
      return ;
    }
    const res= await api.post(api.url.system.user.position,post);
    if (!res) return ;
    dialog.success('操作成功！');
  }
});


const table = reactive({
  isInit: false,
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
  type:1,
  plant_id:undefined,
  user_query:{},
});
const tableEvent = {
  init: async function () {
    const apiData = await api.get(api.url.system.dept_position.init);
    vData.select_options = getOptionsLabel(apiData?.option);
    vData.select_options.plant_id = plantList;
    vData.select_options.dept_id = await api.departmentSelector();
    vData.select_options.position_id = await api.positionSelector();
    vData.dept_tree = listToTree([...vData.select_options.dept_id]);
    tableEvent.plantChange(1, false);
    table.tableConfig = {
      ...apiData.table, columns: listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')
    };
    table.menu = getMenus();
    table.search = [];
    table.isInit = true;
  },
  plantChange: (value) => {
    table.plant_id=value;
  },
  addUser:()=>{
    const row = reportRef.value.reportOptions.table.getSelectedCellInfos()?.[0]?.[0]?.['originData'] || null;
    if (!row?.dept_id || !row?.position_id) return ;
    userSelector.bind.title=row.dept.name +' '+ row.position.name+ ' - 添加用户';
    userSelector.isShow=true;
    userSelector.row=row;
  },
  addDept: async () => {
    const row = reportRef.value.reportOptions.table.getSelectedCellInfos()?.[0]?.[0]?.['originData'] || null;
    const father = row?{...row,...row.dept}:{};
    deptData.value = {
      isShow: true,
      status: 1,
      pid: father?.id,
      level: (row.dept?.level || row.level) + 1,
      path: father?.path + (father?.path ? ',' : '') + father?.id,
      plant_id: father?.plant_id,
    }
  },
  editDept: async () => {
    const row = reportRef.value.reportOptions.table.getSelectedCellInfos()?.[0]?.[0]?.['originData'] || null;
    if (!row){
      return dialog.warning('请选择一个部门!');
    }
    const item = row?{...row,...row.dept}:{};
    deptData.value = {...item, isShow: true,}
  },
  addPosition: async () => {
    const row = reportRef.value.reportOptions.table.getSelectedCellInfos()?.[0]?.[0]?.['originData'] || null;
    const _dept = row?{...row,...row.dept}:{};
    posiData.value={
      dept_id: _dept?.id,
      status:1,
      isShow:true,
    };
  },
  editPosition: async () => {
    const row = reportRef.value.reportOptions.table.getSelectedCellInfos()?.[0]?.[0]?.['originData'] || null;
    if (!row?.position){
      return dialog.warning('请选择一个岗位!');
    }
    posiData.value={...row.position, isShow:true,};
  },
  delete:async ()=>{
    const row = reportRef.value.reportOptions.table.getSelectedCellInfos()?.[0]?.[0]?.['originData'] || null;
    if (!row) {
      return dialog.warning('请选择一条数据!');
    }
    const title = row.position_id ? ('岗位:'+row.position.name) : ('部门:'+row.name);
    if (!await dialog.confirmAsync('确定要删除'+title+'吗?')){
      return ;
    }
    const url = row?.position ? api.url.system.position.set : api.url.system.dept.set;
    const post= row?.position ?{id:row.position.id,status:-1}:{id:row.id,status:-1};
    const loading=  dialog.loading(reportRef.value.$el,'数据保存中...');
    const res= await api.post(url,post);
    loading.close();
    if (!res) return;
    await reportRef.value.reportOptions.getData();
  },
};

const getMenus = () => {
  return {
    addUser: {sort: 100, title: '添加用户', icon: 'ri-add-line', click: tableEvent.addUser},
    addDept: {sort: 110, title: '添加部门', icon: 'ri-building-line', click: tableEvent.addDept},
    editDept: {sort: 120, title: '修改部门', icon: 'ri-edit-line', click: tableEvent.editDept},
    addPosition: {sort: 130, title: '添加岗位', icon: 'ri-table-line', click: tableEvent.addPosition},
    editPosition: {sort: 140, title: '修改岗位', icon: 'ri-edit-line', click: tableEvent.editPosition},
    delete: {sort: 150, title: '删除', icon: 'ri-delete-bin-line', click: tableEvent.delete},
  };
}

const getReportConfig = () => {
  return {
    dataFetcher: async (url,query) => {
      const {list,param}=await api.get(api.url.system.dept_position.list,query);
      table.param=param;
      return list;
    },
    menu: table.menu,
    defaultMenuShowList:['search','pageExport'],
    search: table.search,
    filter: false,
    tableConfig: {
      showCheck: false,
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        }
      },
      ...table.tableConfig
    },
    clickCell:({originData})=>{
      table.user_query = {
        plant_id: originData.plant_id,
        dept_id: originData?.dept?.id ||  originData.id,
        position_id: originData?.position_id
      }
    },
  }
};

onMounted(async () => {
  await tableEvent.init();
})

</script>

<style scoped>
.dept-position{
  display: flex;
  flex-direction: row;
  & .tableBox{
    flex: 1;
    padding-right: 0;
  }
  .user-list{
    flex: 5;
  }
}

</style>