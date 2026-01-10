<template>
  <div class="siyi-wo-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind" @click="listBtn.action.click"   />

        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />

        <vxe-select v-bind="listBtn.step.bind" v-on="listBtn.step.on" />

        <span style="margin:0 10px 0 20px ">筛选：</span>
        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="plantList">
        </vxe-select>

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.caseLabel.status">
        </vxe-select>



        <vxe-input type="search" v-model="vData.params.customer_code" placeholder="客户代码" @clear="searchList"
                   @search-click="searchList" @keydown="searchListDelay" clearable
                   style="width: 90px;margin:0 5px" />

        <vxe-input type="search" v-model="vData.params.search" placeholder="本厂型号" @clear="searchList"
                   @search-click="searchList" @keydown="searchListDelay" clearable
                   style="width: 120px;margin:0 5px" />


        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>

      </template>

      <template #empty><span><img :src="noData"><p>{{ vData.msg }}</p></span></template>
    </vxe-grid>

    <!-- 修改弹窗 -->
    <vxe-modal v-model="editModal.data.isShow" v-bind="editModal.bind" v-on="editModal.on">
      <template #title>
        <vxe-button status="success" :content="editModal.data.editBtnName"  @click="editModal.save" :icon="'vxe-icon-'+editModal.data.editBtnIcon" style="margin-right: 40px"/>
        <vxe-button-group v-bind="editModal.data.btn.bind()" @click="editModal.data.btn.click"/>
      </template>
      <template #default>

        <vxe-form ref="editFormRef" v-bind="editForm.bind" v-on="editForm.on" :data="editForm.data">
          <vxe-form-item field="plant_id" title="接诉工厂" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.plant_id" :disabled="editModal.data.isReadonly" :options="userPlantList">
              </vxe-radio-group>
            </template>
          </vxe-form-item>

          <vxe-form-item field="plant_id2" title="制造工厂" span="24" v-show="editForm.data.job_sn?.length">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.plant_id2" :disabled="editModal.data.isReadonly" :options="plantList">
              </vxe-radio-group>
            </template>
          </vxe-form-item>

          <vxe-form-item field="customer_code" title="客户代码" span="24">
            <template #default="{ data }">
              <vxe-input clearable v-model="data.customer_code" :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="job_sn" title="本厂型号" span="24">
            <template #default="{ data }">
              <vxe-select v-model="data.job_sn" placeholder="请输入本厂型号" clearable filterable remote multiple
                          :remoteMethod="formEvent.jobSelector"
                          @change="formEvent.jobChange"
                          :disabled="editModal.data.isReadonly"
              >
                <vxe-option v-for="(option) in  vData.job_option_list" :label="option.label" :value="option.label"/>
              </vxe-select>
            </template>
          </vxe-form-item>

          <vxe-form-item field="job_date" title="周期" span="24" >
            <template #default="{ data }">
              <vxe-input clearable placeholder="出货周期" v-model="data.job_date"
                         :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="delivery_sn" title="送货单号" span="24">
            <template #default="{ data }">
              <vxe-input clearable placeholder="ERP送货单号" v-model="data.delivery_sn"
                         :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="erp_case_sn" title="ERP客诉号" span="24">
            <template #default="{ data }">
              <vxe-input clearable v-model="data.erp_case_sn" :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="sale_sn" title="销售单号" span="24">
            <template #default="{ data }">
              <vxe-input clearable placeholder="ERP销售单号" v-model="data.sale_sn"
                         :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="type" title="问题类型" span="24" v-if="vData.caseLabel.type.length>1">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.type" :disabled="editModal.data.isReadonly" :options="vData.caseLabel.type" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="title" title="问题描述" span="24">
            <template #default="{ data }">
              <vxe-input clearable placeholder="简单介绍一下" v-model="data.title"
                         :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item title="客诉详情" field="detail" span="24"
                         :item-render="{ name: 'VxeTextarea', props: { autosize:{ minRows: 3, maxRows: 10 },readonly:editModal.data.isReadonly} }">
          </vxe-form-item>

          <vxe-form-item title="图片" field="files" span="24" v-if="false">
            <template #default="{ data }">
              <vxe-upload v-model="data.files" mode="image" multiple :upload-method="uploader" :disabled="editModal.data.isReadonly" />
            </template>
          </vxe-form-item>


          <vxe-form-item field="feedback_user" title="客户联系人" span="24">
            <template #default="{ data }">
              <vxe-input clearable v-model="data.feedback_user" :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>


          <vxe-form-item field="receive_user" title="客服专员" span="24">
            <template #default="{ data }">
              <vxe-select v-model="data.receive_user" placeholder="请选择" clearable filterable remote
                          :remoteMethod="formEvent.userSelector"
                          @focus="formEvent.userSelector"
                          @change="formEvent.userChange($event,'receive_uid',editForm)"
                          :disabled="editModal.data.isReadonly"
              >
                <vxe-option v-for="(option) in  vData.user_option_list" :label="option.label" :value="option.label"/>
              </vxe-select>
            </template>
          </vxe-form-item>

          <vxe-form-item title="客诉时间" field="feedback_at" span="24"
                         :item-render="{ name: 'VxeInput', props: { type: 'date',readonly:editModal.data.isReadonly} }">
          </vxe-form-item>

          <vxe-form-item field="remark" title="备注" span="24" >
            <template #default="{ data }">
              <vxe-input clearable v-model="data.remark" :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="status" title="状态" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.status" :disabled="editModal.data.isReadonly" :options="vData.caseLabel.status" />
            </template>
          </vxe-form-item>


          <vxe-form-item field="process_type" title="售后方式" span="24" className="new-row"  >
            <template #default="{ data }">
              <vxe-radio-group v-model="data.process_type" :disabled="editModal.data.isReadonly" :options="vData.caseLabel.process_type" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="process_users" title="售后专员" span="24"  >
            <template #default="{ data }">
              <vxe-select v-model="data.process_users" placeholder="请选择" clearable multiple filterable remote
                          :remoteMethod="formEvent.userSelector"
                          @focus="formEvent.userSelector"
                          @change="formEvent.usersChange($event,'process_uids',editForm)"
                          :disabled="editModal.data.isReadonly"
              >
                <vxe-option v-for="(option) in  vData.user_option_list" :label="option.label" :value="option.label"/>
              </vxe-select>
            </template>
          </vxe-form-item>

          <vxe-form-item field="process_step" title="处理进度" span="24" >
            <template #default="{ data }">
              <vxe-radio-group v-model="data.process_step" :disabled="editModal.data.isReadonly" :options="vData.caseLabel.process_step" />
            </template>
          </vxe-form-item>

          <vxe-form-item title="解决时间" field="finish_at" span="24" v-if="['finished','cancelled'].includes(editForm.data.process_step)"
                         :item-render="{ name: 'VxeInput', props: { type: 'date',readonly:editModal.data.isReadonly} }">
          </vxe-form-item>

          <vxe-form-item field="process_res" title="处理结果" span="24" v-if="['finished','cancelled'].includes(editForm.data.process_step)" >
            <template #default="{ data }">
              <vxe-input clearable v-model="data.process_res" :disabled="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>





        </vxe-form>
      </template>
    </vxe-modal>


  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import siyi from '@/core/script/siyi.js'
import * as core from "@/core/script/core"
import {getCurrentPage, http, jobSelector, uploader, url as apiUrl, userSelector} from "@/core/script/api.js"
import noData from '@/core/assets/img/nodata.gif'
import {to as navTo} from "@/core/script/nav"
import {getPlant, getUserPlantList, plantList} from '@/utils/erp.js'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import dayjs from "dayjs";
import {VxeUI} from "vxe-pc-ui";
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

const userPlantList = getUserPlantList('wo-'); //用户的工厂
const userInfo = siyi.user

// 接口URL
const _apiUrl = apiUrl.wo.case;

//列配置
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '接诉工厂', width: 100, field: 'plant_id', sortable: true, formatter: ({row}) => getPlant(row.plant_id)},
  {title: '制造工厂', width: 100, field: 'plant_id2', sortable: true, visible: false,formatter: ({row}) => getPlant(row.plant_id2)},
  {title: '客户', width: 200, field: 'customer_code', sortable: true},
  {title: '本厂型号', width: 400, field: 'job_sn', sortable: true},
  {title: '周期', width: 80, field: 'job_date', sortable: true, visible: false},
  {title: '送货单号', width: 150, field: 'delivery_sn', sortable: true, visible: false},
  {title: '销售单号', width: 150, field: 'sale_sn', sortable: true, visible: false},
  {title: 'ERP客诉单号', width: 150, field: 'erp_case_sn', sortable: true, visible: false},
  {title: '类型', width: 80, field: '_text.type', sortable: true,visible: false},
  {title: '问题', width: 200, field: 'title', sortable: true},
  {title: '备注', width: 120, field: 'remark', sortable: true},
  {title: '处理进度', width: 150, field: '_text.process_step', sortable: true},
  {title: '处理方式', width: 120, field: '_text.process_type', sortable: true},
  {title: '处理结果', width: 150, field: 'process_res', sortable: true},
  {title: '受理人', width: 120, field: '_text.process_uids_text', sortable: true},
  {title: '状态', width: 80, field: '_text.status', sortable: true},
  {title: '创建人', width: 80, field: '_text.created_uid', sortable: true},
  {title: '创建时间', minWidth: 140, field: 'created_at', sortable: true, visible: false, formatter: core.date.datetime},
  {title: '更新人', width: 80, field: '_text.updated_uid', sortable: true, visible: false},
  {title: '更新时间', minWidth: 140, field: 'updated_at', sortable: true, visible: false, formatter: core.date.datetime},
  {title: 'ID', width: 60, field: 'id', sortable: true, visible: true},
  // {title: '操作', width: 300,field:'action',showOverflow:false, slots: {default: 'actions'}, fixed: "right"},
];
//默认数据
const defaultData={
  params:{
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    search: '',//搜索关键字
    customer_code: '',//客户代码
    status: 0,//状态
    step: undefined,//步骤
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
  },
  modal_bind:{
    size: "mini",
    width: 760,
    position: {top: '10%'},
    loading: false,
    resize: 'resize',
    height: 0,
  },
  modal_data:{
    formName:'',
    action: '',
    isReadonly: true,
    isShow: false,
    editBtnName: '提交',
    editBtnIcon: 'edit',
    btn:{bind:()=>{},click:()=>{}},
  },
  form_data:{
    plant_id: 0,
    plant_id2: 0,
    type: 'default',
    feedback_at: dayjs().startOf('day').toDate(),
    customer_code: '',
    status: 0,
    job_date: '',
    receive_user: userInfo?.name,
    receive_uid: userInfo.uid,
    process_type: 'default',
    process_step: 'created',
    process_users: [userInfo?.name],
    process_uids: [userInfo.uid],
  },
  table_data: {form: [], case_id: 0},
  table_row:{
    item: '',
    payer_uid: userInfo.uid || 0,
    payer: userInfo?.name || '',
    consumer_uids: userInfo.uid || 0,
    consumer: userInfo?.name || '',
    pay_at: dayjs().startOf('day').format('YYYY-MM-DD').toString(),
  }
};

//页面数据
const vData = reactive({
  params:{...defaultData.params},
  list:[],
  msg:'',
  caseLabel: {},
  billOption: {},
  billLabel: {},
  job_option_list: [],
  user_option_list: [],
});


//列表
const gridRef = ref()
const grid=reactive({
  bind:{
    ...gridOptionsDefault,
    id: 'siyi-wo-list',
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
        listBtn.status.bind.options = [...vData.caseLabel.status || [],...[{label:'删除',value:-1}]];
      },
      change:async ({value})=>{
        await formEvent.set(listBtn.getSelectedRows(true), value,'status');
        await searchList('init');
      }
    },
  },
  step:{
    bind:{
      modelValue:vData.params.stepAction,
      placeholder: '批量修改-进度',
      prefixIcon: 'vxe-icon-checkbox-checked',
      options:[],
      className:'search-select',
    },
    on: {
      focus:()=>{
        listBtn.step.bind.options =vData.caseLabel.process_step;
      },
      change:async ({value})=>{
        await formEvent.set(listBtn.getSelectedRows(true), value,'process_step')
        await searchList('init');
      }
    },
  },
  action:{
    bind:{
      className:'list-action',
      size:"small",
      options:[
        {name:'add',mode:'text',content:"添加",icon:'vxe-icon-add',status: "success"},
        {name:'view',mode:'text',content:"查看",icon: "vxe-icon-search-zoom-in",status: "success"},
        // {name:'edit',mode:'text',content:"编辑",icon: "vxe-icon-edit",status: "warning",className:'mr10'},
        // {name:'bill_add',mode:'text',content:"编辑费用",icon:'vxe-icon-edit',status: "primary",className:'mr10'},
        {name:'bill_list',mode:'text',content:"费用",icon: "vxe-icon-search-zoom-in",status: "primary"},
      ]
    },
    click:({name},row)=>{
      switch (name){
        case 'add':{editModal.open('add');break;}
        case 'refresh':{searchList('init');break;}
        case 'reset':{vData.params={...defaultData.params};searchList('init');break;}
        case 'delete':{
          let ids=listBtn.getSelectedRows(true);
          ids && formEvent.delete(ids);
          break;
        }
        // case 'bill_add':{
        //   row=row===undefined?listBtn.getSelectedRow(false):row;
        //   row && editModal.open('edit',{case_id:row.id},'bill') ;
        //   break;
        // }
        // case 'bill_list':{
        //   row=row===undefined?listBtn.getSelectedRow(false):row;
        //   row && editModal.open('view',{case_id:row.id},'bill') ;
        //   break;
        // }
        default : {
          row=row===undefined?listBtn.getSelectedRow(false):row;
          row && editModal.open(name,row) ;
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


//弹出层
const editModal = reactive({
  bind: {...defaultData.modal_bind},
  on: {
    show: (e) => {
      const modalTop = e.$modal.getPosition().top;
      editModal.bind.height = ((window.innerHeight - modalTop * 2)) + 'px';//自动高度
    }
  },
  getForm: () => {
    return editModal.data?.formName==='bill'?editTable:editForm
  },
  open:(action,params={},formName='form')=>{
    editModal.data={...defaultData.modal_data,action,isShow:true,isReadonly:false,formName};
    editModal.getForm()?.onShow(params);
    editModal.getForm()[action](params);
  },
  save: async (e) => {
    await editModal.getForm()?.save(e);
  },
  close:(callback)=>{
    editModal.getForm()?.onClose();
    editModal.data={...defaultData.modal_data};
    editModal.bind={...defaultData.modal_bind};
    callback && callback();
  },
  data: {...defaultData.modal_data},
});

//表单事件
const formEvent = {
  view: async ({id}) => {
    if (id === undefined) {
      return;
    }
    let res = await http.get(_apiUrl.detail, {params: {id: id}})
    if (res.data.code !== 20000) {
      dialog.error(res.data.message)
      return;
    }
    let detailData = res.data.data.data;
    editForm.data = {...defaultData.form_data, ...detailData};//合并数据
    editForm.data.feedback_at = detailData['_text']['feedback_at'];
    editForm.data.finish_at = detailData['_text']['finish_at'];
    editForm.data.receive_user = detailData['_text']['receive_uid'];
    editForm.data.process_users = detailData['_text']['process_uids'];
    editModal.data.editBtnName = '修改(ID:' + detailData.id+")";
    editModal.data.isReadonly = true;
    return detailData;
  },
  add: () => {
    editModal.data.isReadonly = false;
    editForm.data.plant_id=vData.params.plant_id;
  },
  edit: async (row) => {
    await formEvent.view(row);
    editModal.data.isReadonly = false;
  },
  save: async (e) => {
    if (editModal.data.isReadonly) {
      editModal.data.isReadonly = false;
      editModal.data.editBtnName = "保存";
      editModal.data.editBtnIcon = "save";
      return
    }
    if (await editFormRef.value.validate() !== undefined) {
      return;
    }
    editModal.data.loading = true
    let url =_apiUrl.save + "?action=" + editModal.data?.action;
    let res = await http.post(url, editForm.data);
    editModal.data.loading = false
    if (res.data.code !== 20000) {
      dialog.error(res.data.message)
      return;
    }
    editModal.close(searchList);
    await searchList();
  },
  set: async (id, value,key='status') => {
    if(id===undefined){
      return ;
    }
    let confirm= await VxeUI.modal.confirm({content: '确认操作？',});
    if(confirm!=='confirm'){
      return ;
    }
    let res = await http.post(_apiUrl.set, {id: id, [key]: value});
    if (res.data.code !== 20000) {
      dialog.error(res.data.message);
      return;
    }
    await searchList()
  },
  delete: async (id) => {
    return await formEvent.set(id, -1,'status');
  },
  bill_add: ({id, sn, plant_id}) => {
    editModal.close();
    navTo('wo_bill_v240802', {
          action: 'add',
          case_sn: sn,
          plant_id: parseInt(plant_id),
        }
    );
  },
  bill_list: ({id,sn, plant_id}) => {
    editModal.close();
    navTo('wo_bill_v240802', {
          action:'list',
          case_sn: sn,
          plant_id: parseInt(plant_id),
        }
    );
  },
  jobChange: ({value}, e) => {
    let option = vData.job_option_list.find((item) =>  value.includes(item?.label));
    editForm.data['job_id']= vData.job_option_list.filter((item)=>value.includes(item?.label)).map((item)=>item.value);
    if (editForm.data['customer_code'].length < 1) editForm.data.customer_code = option?.extra?.['customerCode'] || '';
    if (editForm.data['plant_id2'] < 1) editForm.data.plant_id2 = option?.extra?.['plantId'] || '';
    setTimeout(() => {
      vData.job_option_list = []
    }, 1000);
  },
  userChange: ({value}, field,form) => {
    let option = vData.user_option_list.find((item) => item?.label === value);
    let uid = option?.value || 0;
    if(form.data===undefined){
      form[field]=uid;
    }else{
      form.data = {...form.data, [field]: uid}
    }
  },
  usersChange: ({value}, field,form) => {
    let uids = [];
    value.forEach((valueLI) => {
      let option = vData.user_option_list.find((item) => item?.label === valueLI);
      option?.value && uids.push(option?.value);
    })
    if(form.data===undefined){
      form[field]=uids;
    }else{
      form.data = {...form.data, [field]: uids}
    }
  },
  jobSelector: async ({searchValue}) => {
    vData.job_option_list = searchValue ? await jobSelector(searchValue) : [];
  },
  userSelector: async ({searchValue}) => {
    vData.user_option_list = await userSelector(searchValue);
  },
};

const editFormRef = ref();
const editForm = reactive({
  data: {...defaultData.form_data},
  bind: {
    titleWidth:80,
    titleAlign:"right",
    rules: {
      plant_id: [{required: true, message: '请选择工厂'}],
      type: [{required: true, message: '请选择类型'}],
      customer_code: [{required: true, message: '请填写客户代码'},{pattern:/^(\d{4}\s)*\d{4}$/,message:"必须是4位数字，多个用空格隔开"}],
    }
  },
  validate:async ()=>{
    return await editFormRef.value.validate();
  },
  on: {
    change: ()=>editForm.validate,
    submit: formEvent.save,
  },
  onShow:({})=>{
    editModal.bind.width=760
    editForm.data = {...defaultData.form_data};
  },
  onClose:()=>{
    editForm.data = {...defaultData.form_data};//重置数据
  },
  ...formEvent,
});

const searchListDelay=_.debounce((type = 'init',param={})=>{
  return searchList(type,param);
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
  vData.billOption = res.data.data?.option?.bill;
  vData.caseLabel =  getOptionsLabel(res.data.data?.option?.case);
  vData.billLabel = getOptionsLabel(res.data.data?.option?.bill)
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
.siyi-wo-list {
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
  .col--valid-error{
    padding: 20px 0px !important;
  }
  .new-row {
    margin-top: 20px;
    border-top: 1px solid #e8e8e8;
  }

}
</style>