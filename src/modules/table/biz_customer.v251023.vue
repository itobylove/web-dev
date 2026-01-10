<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
    <dialogComponent v-if="detail.isShow" v-bind="detail.attr"  @afterClose="detail.isShow=false">
      <t-form ref="formRef"  :data="detail.data" :readonly="detail.isReadOnly" :rules="detail.rules" @submit="detail.save" style="margin:30px 50px 20px 20px" :disabled="detail.readOnly"  :labelWidth="120"  >
        <t-form-item label="客户名称" name="name">
          <t-input v-model="detail.data.name" placeholder="客户名称"/>
        </t-form-item>
<!--        <t-form-item label="客户电话" name="mobile">
          <t-input v-model="detail.data.mobile" placeholder="客户电话"/>
        </t-form-item>-->
        <t-form-item label="客户地址" name="address">
          <t-input v-model="detail.data.address" placeholder="客户地址"/>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="detail.data.remark" placeholder="备注"/>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="detail.data.status" :options="vData.selectOptions.status"/>
        </t-form-item>
        <t-form-item label="查看人" name="follow_uids" v-show="detail.data.status>0">
          <t-select v-model="detail.data.follow_uids" multiple :options="vData.selectOptions.users" filterable
                    placeholder="请选择查看人" />
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" :disabled="detail.isReadOnly" type="button" @click="formRef.submit()">提交</t-button>
        </t-form-item>
      </t-form>
    </dialogComponent>
    <dialogComponent v-if="log.isShow" v-bind="log.attr"  @afterClose="log.isShow=false">
      <t-base-table row-key="index" :data="log.list" :columns="log.columns" />
    </dialogComponent>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";
import dialogComponent from '@/core/component/dialog.vue'

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";
import apiUrl from "@/core/config/url.js";
import siyi from "@/core/script/siyi.js";
import dayjs from "dayjs";

const report = ref()

//页面数据
const vData=reactive({
  user_id:siyi.user.id,
  selectOptions: {status:[],users:[]},
  default_uids:[],
})

const table = reactive({
  isInit: false,
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
});

const tableEvent = {
  add: async () => {
    detail.data={
      follow_uids:[...vData.default_uids],
      status:1,
      isReadOnly:false,
    };
    detail.isShow = true;
    detail.attr.title = '添加客户';
  },
  edit: async (rows) => {
    detail.data=rows?.[0];
    if (!detail.data) return;
    detail.isShow = true;
    detail.attr.title = '修改 - ' + detail.data.name;
    detail.isReadOnly= detail.data?.readOnly || false;
  },
  set: async (rows,post,title) => {
    if(!Array.isArray(rows)) return ;
    const ids=rows.filter(item => item?.id).map(row=>row.id);
    if (title && !await dialog.confirmAsync('确定要'+title + ids.length + '条数据吗？',title+'确认')) {
      return;
    }
    const loading = dialog.loading(report.value);
    const result = await api.post(apiUrl.table.biz_customer.set, {...post, id: ids});
    loading.close();
    if (!result) return ;
    dialog.success('操作成功');
    await report.value.reportConfig.getData();
  },
};

const formRef=ref();
const detail=reactive({
  attr: {
    title: "修改",
    height: "70%",
    width: "70%",
    maxWidth: "800",
    left: "center",
    top: "center",
  },
  isReadOnly: false,
  isShow: false,
  data:{follow_uids:[]},
  rules:{
    name: [
      {required: true, message: '请输入客户名称', trigger: 'blur'},
    ],
  },
  save: async ({validateResult,firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading= dialog.loading(formRef.value);
    const result = await api.post(apiUrl.table.biz_customer.save, detail.data);
    loading.close();
    if (!result?.id) return ;
    detail.isShow=false;
    await report.value.reportConfig.getData();
  },
})

const log = reactive({
  attr: {
    title: "跟单记录",
    height: "70%",
    width: "70%",
    maxWidth: "960",
    left: "center",
    top: "center",
  },
  isShow: false,
  list: [],
  columns:[
    { colKey: 'serial-number', title: '序号', width: '100px' },
    { colKey: 'content', title: '内容' },
    { colKey: 'created_uid_text', title: '操作人', width: '100px' },
    { colKey: 'created_at_text', title: '操作时间', width: '200px' },
  ],
  open: async (rows) => {
    const row = rows?.[0] || {};
    const data = await api.get(apiUrl.table.biz_customer.logs, {customer_id: row.id});
    if (!data?.list) return;
    log.attr.title = `跟单记录 - ${row.name}`;
    log.list = data?.list || [];
    log.isShow = true;
  },
  addLog: async (rows) => {
    const row = rows?.[0] || {};
    const content= await dialog.inputAsync('', '添加跟单日志',{width:'500px'});
    if (!content) return;
    const res= await api.post(apiUrl.table.biz_customer.update, {customer_id: row.id, content});
    if (!res) return;
    dialog.success('操作成功');
  },
})


const getSearchForm = () => {
  return [
    {type: 'radio',filter:true,filterValueType:'value',value:1,field: 'status',options: {multiple:false, placeholder: '状态',style:{width:'320px'}, options: [{value:'',label:'全部'},...vData.selectOptions.status]}},
    {type: 'input',filter:true, field: 'name',  options: {placeholder: '客户名称'}, style: {width: '360px'}},
  ]
}
const getMenus = () => {
  return {
    add: {sort: 118, title: '添加客户', icon: 'ri-add-line', click: tableEvent.add},
    addLog: {sort: 118, title: '添加跟单日志', icon: 'ri-add-line', listAction: log.addLog},
    log: {sort: 118, title: '查看跟单日志', icon: 'ri-history-line', listAction: log.open},
    edit: {sort: 120, title: '修改', icon: 'ri-edit-line', listAction: tableEvent.edit},
    del: {sort: 160, title: '删除', icon: 'ri-delete-bin-line', listAction: (rows)=>tableEvent.set(rows,{status:-1},'删除')},
  };
}


// 页面初始化
const initTable = async () => {
  const apiData = await api.get(api.url.table.biz_customer.init);
  vData.selectOptions = getOptionsLabel(apiData?.option);
  vData.default_uids=apiData?.default_uids || [];
  table.tableConfig = {...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
  table.menu = getMenus();
  table.search = getSearchForm();
  table.isInit = true;
}

const getReportConfig = () => {
  return {
    menuConfig: {
      menu:table.menu,
      defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    },
    searchConfig: {
      search:table.search,
    },
    tableConfig: {
      url: api.url.table.biz_customer.list,
      showCheck: true,
      // checkField:'check',
      disablePage: true,
      useEncryptionFields: false,
      columnSplit: '',
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
        heightMode:'autoHeight',
      },
      events:{
        dblclick_cell:({originData})=>tableEvent.edit([originData]),
      },
      ...table.tableConfig
    },

  }
};



onMounted(() => {
  initTable();
});



</script>

