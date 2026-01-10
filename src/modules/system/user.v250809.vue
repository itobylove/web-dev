<template>
  <div class="user-list">
    <TableComponent v-if="table.isInit" ref="reportRef" v-bind="getReportConfig()"/>
    <dialogComponent v-if="editBox.isShow" v-bind="editBox.bind"  v-on="editBox.on"  >
      <t-form :data="editBox.data" :rules="editBox.rules" @submit="editBox.submit" v-bind="editBox.form">
        <t-row>
          <t-col :span="11" >
            <t-form-item label="类型" name="type">
              <t-select v-model="editBox.data.type" :options="vData.select_options.type" empty="请先选择类型"/>
            </t-form-item>
            <t-form-item label="用户名" name="username">
              <t-input v-model="editBox.data.username" />
            </t-form-item>
            <t-form-item label="昵称" name="nickname">
              <t-input v-model="editBox.data.nickname" />
            </t-form-item>
            <t-form-item label="身份" name="dept_name">
              <t-input v-model="editBox.data.dept_name" placeholder="例如：湖北经管" />
            </t-form-item>
            <t-form-item label="密码" name="password">
              <t-input v-model="editBox.data.password" />
            </t-form-item>
            <t-form-item label="手机号" name="mobile">
              <t-input v-model="editBox.data.mobile" />
            </t-form-item>
            <t-form-item label="备注" name="remark">
              <t-input v-model="editBox.data.remark" />
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" type="submit">提交</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </dialogComponent>
  </div>
</template>
<script setup>
import TableComponent from "@/core/component/table.vue";
import {onMounted, reactive, ref, watch} from "vue";
import dialogComponent from '@/core/component/dialog.vue'
import * as api from "@/core/script/api.js";
import {getOptionsLabel, listToTree} from "@/utils/vars.js";
import * as listTableFn from "@/core/script/tableFn.js";
import dialog from "@/core/script/dialog.js";
import userDept from "@/modules/system/user_dept_v250811.vue";
import userAuth from "@/modules/system/user_auth.v241221.vue";
import apiUrl from "@/core/config/url.js";
import {plantList} from "@/utils/erp.js";

const props = defineProps({
  scene:{type: String, default: 'base'},
  query: {type: Object, default: {type: 1, dept_id: null, position_id: null,auth_item: null, auth_title: ''}},
  menu: {type: Object, default: {}},
  search: {type: Object, default: undefined},
  reportConfig: {type: Object, default: {}},
})

const reportRef= ref();
const vData= {
  select_options: {
    dept_id:[],
    position_id:[],
  },
  dept_tree: [],
  tableConfig:{columns: [],userConfig: {}},
  title: '用户管理',
};


const editBox=reactive({
  isShow:false,
  selectOptions:{},
  data:{},
  rules:{
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'},
        {pattern: /^[a-zA-Z0-9_-]{4,16}$/, message: '用户名只能由字母、数字、下划线、减号组成，长度4-16个字符', trigger: 'blur'},
    ],
    nickname: [{required: true, message: '请输入昵称', trigger: 'blur'},],
    dept_name: [{required: true, message: '请输入身份信息', trigger: 'blur'},],
    password: [{required: true, message: '请输入密码', trigger: 'blur'},],
    mobile: [{pattern: /^1[3456789]\d{8}$/, message: '请输入正确的手机号', trigger: 'blur'}],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{width: '500px', height: '500px', title: "添加"},
  form:{style: {padding: '20px 10px',},
  },
  change: async (key,value) => {

  },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url.system.user.add, editBox.data);
    loading && loading.close();
    if (res){
      dialog.success('注册成功');
      await reportRef.value.reportOptions.getData();
      editBox.close();
    }
  },
  open: (data) => {
    editBox.isShow=true;
    editBox.data = {type:1,status:1,effective_tiem:3600,...data};
  },
  close: () => {
    editBox.data={};
    editBox.isShow=false;
  },
  on:{
    afterClose: () => {
      editBox.close();
    }
  }
})


const table = reactive({
  isInit: false,
  query:{type:1,dept_id: null, position_id: null,status:null,auth_item:null,...props.query},
});
const tableEvent = {
  init: async function () {
    const apiData = await api.get(api.url.system.user.init);
    vData.select_options = getOptionsLabel(apiData?.option);
    vData.select_options.user = await api.localUserSelector();
    vData.select_options.position_id = await api.positionSelector();
    vData.select_options.dept_id = await api.departmentSelector();
    vData.dept_tree = listToTree([...vData.select_options.dept_id]);
    vData.tableConfig = {
      ...apiData.table, columns: listTableFn.createColumns(apiData.columns, vData.tableConfig?.columnSplit || '#')
    };
    table.isInit = true;
  },
  password: async (rows) => {
    const row = rows[0];
    if (!await dialog.confirmAsync('确定要重置 ' + row.nickname + ' 的密码吗？', '请确认')) {
      return;
    }
    const res= await api.post(api.url.system.user.password, {uid:row['id']});
    if (!res) return;
    dialog.success("重置成功!");
  },
  assignment: async (rows) => {
    const row = rows[0];
    dialog.window(userDept,{uid:row.id},{title:row.nickname+" - 用户岗位设置",width:'80%',height:'80%',onAfterClose:() => {
        reportRef.value.reportOptions.getData();
    }})
  },
  userAuth: async (rows) => {
    const row = rows[0];
    dialog.window(userAuth,{uid:row.id},{title:row.identity_info+" "+row.nickname+" - 权限管理",height:'80%',width:'80%'})
  },
  copyAuth: async (rows) => {
    const from_uid = rows.map(row => row.id);
    const to_user = await dialog.selectAsync(vData.select_options.user, '', '请选择接收人', {getResult: (obj) => obj.options.find(item => item.value === obj.value)});
    if (!to_user.value) return;
    const form_username= rows.map(row => row.nickname).join('、');
    if (!await dialog.confirmAsync("确定要复制【" + form_username + "】的权限给【" + to_user.label + "】吗？", "请确认")) {
      return;
    }
    const res = await api.post(api.url.system.auth.copy, {from_uid, to_uid: to_user.value});
    res && dialog.success("操作成功");
  },
  copyAssignment: async (rows) => {
    const from_uid = rows.map(row => row.id);
    const to_user = await dialog.selectAsync(vData.select_options.user, '', '请选择接收人', {getResult: (obj) => obj.options.find(item => item.value === obj.value)});
    if (!to_user.value) return;
    const form_username= rows.map(row => row.nickname).join('、');
    if (!await dialog.confirmAsync("确定要复制【" + form_username + "】的岗位给【" + to_user.label + "】吗？", "请确认")) {
      return;
    }
    const res = await api.post(api.url.system.position.copy, {from_uid, to_uid: to_user.value});
    res && dialog.success("操作成功");
  },
  receiveAuth:async (rows) => {
    const to_uid = rows.map(row=>row.id);
    const from_uid = await dialog.selectAsync(vData.select_options.user, '', '请选择权限来源');
    if (!from_uid) return;
    const result = await api.post(api.url.system.auth.copy, {from_uid, to_uid});
    result && dialog.success('操作成功!');
  },
  positionSave:async (user_id,action)=>{
    const post = {
      dept_id:table.query.dept_id,
      position_id:table.query.position_id,
      user_id,
      action,
    }
    if (!post.dept_id) {
      post.dept_id = await dialog.selectAsync(vData.select_options.dept_id, '', '请选择部门');
      if (!post.dept_id) return;
    }
    if (!post.position_id) {
      const positionList= vData.select_options.position_id.filter(item=>item.dept_id===post.dept_id || !item.dept_id);
      post.position_id = await dialog.selectAsync(positionList, '', '请选择岗位');
      if (!post.position_id) return;
    }
    const dept= vData.select_options['dept_id'].find(item=>item.value===post.dept_id);
    const position= vData.select_options['position_id'].find(item=>item.value===post.position_id);
    const actionTitle= action==='add'?'添加':'移除';
    const text ="确定要给 "+post.user_id.length+" 位用户 < "+actionTitle+" >  【"+dept.name+"】-【"+position.name+"】岗位吗？";
    if (actionTitle && !await dialog.confirmAsync(text)){
      return ;
    }
    const result= await api.post(api.url.system.user.position,post);
    result && dialog.success('操作成功!');
  },
  addAssignment: async (rows) => {
    return await tableEvent.positionSave(rows.map(row=>row.id),'add');
  },
  removeAssignment: async (rows) => {
    return await tableEvent.positionSave(rows.map(row=>row.id),'del');
  },
  removeAuth: async (rows) => {
    const uid = rows.map(row=>row.id);
    const name = props.query.auth_item;
    if (!name) return;
    if (!await dialog.confirmAsync('确定要取消 '+uid.length+' 个用户的【'+props.query.auth_title+'】权限吗？', '请确认')){
      return ;
    }
    const result = await api.post(apiUrl.system.auth.delete, {uid, name});
    result && dialog.success('操作成功!');
  },
  logout: async (rows) => {
    const uid = rows.map(row => row.id);
    if (!await dialog.confirmAsync('确定要让' + uid.length + '个用户重新登录吗?', '请确认')) {
      return;
    }
    const result = await api.post(apiUrl.system.user.logout, {uid});
    result && dialog.success('操作成功!');
  },
  command: async (rows) => {
    const uid = rows.map(row => row.id);
    const command= await dialog.selectAsync(vData.select_options.command, '', '请选择操作')
    if (!command) return;
    const result = await api.post(apiUrl.system.user.command, {uid,command});
    result && dialog.success('操作成功!');
  },
};

const getMenus = () => {
  const menus = {
    'base':{
      add: {sort: 100, title: '添加用户', icon: 'ri-add-line', click:()=>editBox.open()},
      userAuth: {sort: 100, title: '用户权限', icon: 'ri-shield-check-line', listAction: tableEvent.userAuth},
      assignment: {sort: 100, title: '用户岗位', icon: 'ri-user-location-line', listAction: tableEvent.assignment},
      copyAuth: {sort: 110, title: '复制权限', icon: 'ri-file-copy-line', listAction: tableEvent.copyAuth},
      copyAssignment: {sort: 110, title: '复制岗位', icon: 'ri-file-copy-line', listAction: tableEvent.copyAssignment},
      // receiveAuth: {sort: 110, title: '接收权限', icon: 'ri-user-received-line', listAction: tableEvent.receiveAuth},
      password: {sort: 100, title: '重置密码', icon: 'ri-key-2-line', listAction: tableEvent.password},
      logout: {sort: 140, title: '退出登录', icon: 'ri-logout-box-line', listAction: tableEvent.logout},
      command: {sort: 150, title: '操作', icon: 'ri-remote-control-line', listAction: tableEvent.command},
    },
    'auth':{
      removeAuth: {sort: 130, title: '取消权限', icon: 'ri-close-circle-line', listAction: tableEvent.removeAuth},
      userAuth: {sort: 100, title: '用户权限', icon: 'ri-shield-check-line', listAction: tableEvent.userAuth},
    },
    'position':{
      addAssignment: {sort: 120, title: '添加岗位', icon: 'ri-add-circle-line', listAction: tableEvent.addAssignment},
      removeAssignment: {sort: 130, title: '取消岗位', icon: 'ri-indeterminate-circle-line', listAction: tableEvent.removeAssignment},
      assignment: {sort: 100, title: '用户岗位', icon: 'ri-user-location-line', listAction: tableEvent.assignment},
    }
  };
  return menus?.[props.scene] || menus['base'];
}


const getSearchForm = () => {
  return [
    {type: 'select', field: 'type', options: {placeholder: '类型',multiple:false, options: vData.select_options.type,clearable:false},value:table.query.type},
    {type: 'tree', field: 'dept_id', options: {placeholder: '部门',multiple:false,data:vData.dept_tree},onChange:tableEvent.deptChange,value:table.query.dept_id},
    {type: 'select', field: 'position_id', options: {placeholder: '岗位',multiple:false,options: vData.select_options.position_id},value:table.query.position_id},
    {type: 'select', field: 'status', options: {placeholder: '状态', options: vData.select_options.status,value:table.query.status}},
    {type: 'input', field: 'search', options: {placeholder: '搜索: 工号/姓名/手机号/ERP部门'}},
  ]
}

const getReportConfig =  () => {
  return {
    dataFetcher: async (url,query) => {
      return await api.get(api.url.system.user.list,{...query,auth_item:props.query.auth_item},'list');
    },
    defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    menu: {...getMenus(),...props.menu},
    search:props?.search || getSearchForm(),
    tableConfig: {
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        }
      },
      ...vData.tableConfig
    },
    ...props.reportConfig
  }
};

onMounted(async () => {
  await tableEvent.init();
})

// 监听父组件的query属性，重新查询
watch(() => props.query, (newVal) => {
  table.query = newVal;
  if (!reportRef.value) return;
  for (const key in newVal) {
    reportRef.value.search.updateSearchItem(key, newVal[key],'value');
  }
  reportRef.value.reportOptions.getData();
}, { deep: true })

defineExpose({table:reportRef})


</script>
<style scoped>
.user-list{
  width: 100%;
  height: 100%
}
</style>