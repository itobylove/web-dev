<template>
  <div class="siyi-bill-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind()" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listAction.action.bind()" @click="listAction.action.click"  />

        <vxe-select v-bind="listAction.status.bind" v-on="listAction.status.on"/>


        <span style="margin:0 10px 0 50px ">筛选：</span>
        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small" clearable style="width: 100px"
                    @change="getList('init')" :options="plantList">
        </vxe-select>

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="getList('init')" :options="vData.caseLabel.status">
        </vxe-select>

        <!-- <t-button variant="text" size="small" @click="list('prev')">
                    <template #icon> <ChevronUpIcon /> </template> 上一页
              </t-button>
              <t-button variant="text" size="small" @click="list('next')">
                  <template #icon> <ChevronDownIcon /> </template> 下一页
              </t-button>
         -->

        <vxe-input type="search" v-model="vData.params.customer_code" placeholder="客户代码" @clear="getList"
                   @search-click="getList" @keydown="getListDelay" clearable
                   style="width: 120px;margin:0 5px"/>

        <vxe-input type="search" v-model="vData.params.search" placeholder="生产型号" @clear="getList"
                   @search-click="getList" @keydown="getListDelay" clearable
                   style="width: 140px;margin:0 5px"/>

        <vxe-input type="search" v-model="vData.params.case_sn" placeholder="客诉单号" @clear="getList"
                   @search-click="getList" @keydown="getListDelay" clearable
                   style="width: 140px;margin:0 5px"/>


        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="getList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="getList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="getList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="getList('next')" title="下一页"></vxe-button>

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

        <vxe-form ref="editFormRef" v-bind="editForm.bind" :disabled="editModal.data.isReadonly" v-on="editForm.on" :data="editForm.data">
          <vxe-form-item field="plant_id" title="工厂" span="3">
            <template #default="{ data }">
              <vxe-select v-model="data.plant_id" :options="userPlantList" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="customer_code" title="客户代码" span="5">
            <template #default="{ data }">
              <vxe-input clearable v-model="data.customer_code" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="process_type" title="费用类型" span="4" >
            <template #default="{ data }">
              <vxe-select v-model="data.process_type" :options="vData.caseLabel.process_type" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="job_sn" title="本厂型号" span="12">
            <template #default="{ data }">
              <vxe-select v-model="data.job_sn" placeholder="请输入本厂型号" clearable filterable remote multiple
                          :remoteMethod="formEvent.jobSelector"
                          @change="formEvent.jobChange"
              >
                <vxe-option v-for="(option) in  vData.job_option_list" :label="option.label" :value="option.label"/>
              </vxe-select>
            </template>
          </vxe-form-item>
        </vxe-form>

          <vxe-table ref="editTableRef" v-if="editModal.data.formName==='bill'" v-bind="editTable.bind()" v-on="editTable.on">
          <vxe-column type="checkbox" width="60"></vxe-column>
          <vxe-column field="sort" type="seq" width="60"></vxe-column>
          <vxe-column field="item" title="项目" width="200" :edit-render="{}">
            <template #edit="{ row }">
              <vxe-select v-model="row.item" :options="vData.billLabel?.item"></vxe-select>
            </template>
            <template #default="{ row }">
              <span>{{ vData.billOption.item[row.item] }}</span>
            </template>

            <template #valid="{content}" >
              <span class="error_valid">{{ content }}</span>
            </template>

          </vxe-column>

          <vxe-column field="money" title="金额（元）" width="120" :edit-render="{}">
            <template #edit="{ row }">
              <vxe-number-input v-model="row.money" type="float"></vxe-number-input>
            </template>
          </vxe-column>

          <vxe-column field="title" title="说明" min-width="180" :edit-render="{}">
            <template #edit="{ row }">
              <vxe-input v-model="row.title"></vxe-input>
            </template>
          </vxe-column>

          <vxe-column field="payer" title="付款人" width="100" :edit-render="{}">
            <template #edit="{ row }">
              <vxe-select v-model="row.payer" placeholder="付款人" clearable filterable remote
                          :remoteMethod="tableEvent.userSelector"
                          @focus="tableEvent.userSelector"
                          @change="tableEvent.userChange($event,'payer_uid',row)"
              >
                <vxe-option v-for="(option) in  vData.user_option_list" :label="option.label" :value="option.label"/>
              </vxe-select>
            </template>
          </vxe-column>

          <vxe-column field="consumer" title="消费人" width="150" :edit-render="{}" v-if="false">
            <template #edit="{ row }">
              <vxe-select v-model="row.consumer" placeholder="请选择" clearable filterable remote multiple
                          :remoteMethod="tableEvent.userSelector"
                          @focus="tableEvent.userSelector"
                          @change="tableEvent.usersChange($event,'consumer_uids',row)"
              >
                <vxe-option v-for="(option) in  vData.user_option_list" :label="option.label" :value="option.label"/>
              </vxe-select>
            </template>
          </vxe-column>

          <vxe-column field="pay_at" title="日期" width="120" :edit-render="{}">
            <template #edit="{ row }">
              <vxe-input v-model="row.pay_at" type="date"></vxe-input>
            </template>
          </vxe-column>

          <vxe-column field="remark" title="备注" :edit-render="{}">
            <template #edit="{ row }">
              <vxe-input v-model="row.remark"></vxe-input>
            </template>
          </vxe-column>

          <template #empty>
          </template>

        </vxe-table>
      </template>
    </vxe-modal>
  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import siyi from '@/core/script/siyi.js'
import * as core from "@/core/script/core"
import {getCurrentPage, http, jobSelector, url as apiUrl, userSelector} from "@/core/script/api.js"
import noData from '@/core/assets/img/nodata.gif'
import {getQuery} from "@/core/script/nav"
import {getPlant, getUserPlantList, plantList} from '@/utils/erp.js'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import {VxeUI} from "vxe-pc-ui";
import dayjs from "dayjs";
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

const userInfo = siyi.user
const userPlantList=getUserPlantList('wo-');//用户的工厂

// 接口URL
const _apiUrl = apiUrl.wo.bill;

//列配置
const columns = [
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46,field: 'seq', type: 'seq', sortable: true},
  {title: '客诉号', width: 200,field: 'case_sn',  sortable: false,visible: false},
  {
    title: '接诉工厂', width: 100, field: 'plant_id', visible: false, sortable: true,
    formatter: ({row}) => getPlant(row.plant_id)
  },
  {
    title: '制造工厂', width: 100, field: 'plant_id2', visible: false, sortable: true,
    formatter: ({row}) => getPlant(row.plant_id2)
  },
  {title: '客户代码', minWidth: 120, field: 'customer_code', sortable: true},
  {title: '生产型号', minWidth: 400, field: 'job_sn', sortable: true},
  {title: '周期', width: 80, field: 'job_date', sortable: true,visible: false},
  {title: '事件', width: 80, field: '_text.case_type', sortable: true, visible: false},
  {title: '客诉', width: 200, field: 'case_title', sortable: true,visible: false},
  {title: '处理方式', width: 120, field: '_text.process_type', sortable: true},
  {title: '客诉状态', width: 120, field: '_text.case_status', sortable: true, visible: false},
  {title: '金额(元)', width: 120, field: 'money_total', sortable: true},
  {title: '状态', width: 120, field: '_text.status', sortable: true},
  {title: '创建人', width: 80, field: '_text.created_uid', sortable: true},
  {
    title: '创建时间', width: 140, field: 'created_at', sortable: true, formatter: core.date.date,
    visible: true
  },
  {title: '更新人', width: 80, field: '_text.updated_uid', sortable: true, visible: false},
  {title: '更新人', width: 80, field: '_text.updated_uid', sortable: true, visible: false},
  {
    title: '更新时间', minWidth: 140, field: 'updated_at', sortable: true, formatter: core.date.formatterYMDHms,
    visible: false
  },
  {title: 'ID', width: 60, field: 'id', sortable: true},
];


//默认数据
const defaultData = {
  params: {
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    case_sn:undefined,//工单SN
    search: '',//搜索关键字
    customer_code: '',//客户代码
    status: undefined,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
  },
  modal_bind: {
    size: "mini",
    width: 760,
    position: {top: '10%'},
    loading: false,
    resize: 'resize',
    height: 0,
  },
  modal_data: {
    formName:'',
    action: '',
    isReadonly: true,
    isShow: false,
    editBtnName: '提交',
    editBtnIcon: 'edit',
    btn:{bind:()=>{},click:()=>{}},
  },
  table_row:{
    sort:0,
    item: '',
    payer_uid: userInfo.uid || 0,
    payer: userInfo.name || '',
    // consumer_uids: userInfo?.id || 0,
    // consumer: userInfo?.name || '',
    pay_at: dayjs().startOf('day').format('YYYY-MM-DD').toString(),
  },
  table_data: {table: [],sn:'',moneySum:0},
  form_data:{
    plant_id: userPlantList?.[0]?.['value'] || '',
    // plant_id2: userPlantList?.[0]?.['value'] || '',
    customer_code: '',
    process_type: 'trip',
    job_sn: [],
    id:undefined
  },
};

//页面数据
const vData = reactive({
  params: {...defaultData.params},
  list: [],
  isLoading:false,
  msg: '',
  caseOption: {},
  caseLabel: {},
  billOption: {},
  billLabel: {},
  job_option_list: [],
  user_option_list: [],
});


//列表
const gridRef = ref()
const grid = reactive({
  bind: () => {
    let moneySum = vData.list.reduce((acc, obj) => acc + obj?.money, 0);
    return {
      ...gridOptionsDefault,
      id: 'siyi-bill-list',
      minHeight: vData.list.length > 0 ? 0 : '100%',
      columns: columns,
      seqConfig: {
        seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
      },
      showFooter: moneySum > 0,
      footerData: [
        {seq: '平均', money: vData.list.length > 0 ? (moneySum / vData.list.length).toFixed(2) : 0},
        {seq: '合计', money: moneySum},
      ]
    }
  },
  on: {
    cellClick: async ({row, columnIndex}) => {
      columnIndex > 1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick: ({row}) => {
      listAction.action.click({name: 'view'}, row)
    },
    zoom:({type})=>core.fullscreenSwitch(type==='max'),
  }
})

//列表批量操作
const listAction = reactive({
  status: {
    bind: {
      modelValue:vData.params.statusAction,
      size:"small",
      placeholder: '批量修改-状态',
      prefixIcon: 'vxe-icon-checkbox-checked',
      options: [],
      className: 'search-select',
    },
    on: {
      focus: () => {
        listAction.status.bind.options = [...vData.caseLabel.status || [], ...[{label: '删除', value: -1}]];
      },
      change: async ({value}) => {
        await tableEvent.set(listAction.getSelectedRows(true), value, 'status');
        await getList('init');
      }
    },
  },
  action: {
    bind: ()=>{
     return  {
       className: 'list-action',
       options: [
         {name: 'add', mode: 'text', content: "添加", icon: 'vxe-icon-add', status: "success"},
         {name: 'view', mode: 'text', content: "查看", icon: "vxe-icon-search-zoom-in", status: "success"},
       ]
     }
    },
    click: ({name}, row) => {
      switch (name) {
        case 'add': {
          editModal.open('add');
          break;
        }
        default : {
          row = row === undefined ? listAction.getSelectedRow(false) : row;
          row && editModal.open(name, row);
        }
      }
    }
  },
  getSelectedRow: (getId = false) => {
    const res = listAction.getSelectedRows(getId);
    if (res && res?.length !== 1) {
      dialog.warning('请勾选一个需要操作的数据')
      return;
    }
    return res?.[0];
  },
  getSelectedRows: (getIds = false) => {
    const selectedRows = gridRef.value.getCheckboxRecords();
    if (selectedRows === undefined || selectedRows.length === 0) {
      dialog.warning('请勾选要操作的数据！')
      return
    }
    return getIds ? selectedRows.map((item) => item.id) : selectedRows;
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
    return editTable
  },
  open:(action,params={},formName='bill')=>{
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


// 表单
const formEvent={
  jobChange: ({value}, e) => {
    // let option = vData.job_option_list.find((item) =>  value.includes(item?.label));
    setTimeout(() => {
      // vData.job_option_list = []
    }, 1000);
  },
  jobSelector: async ({searchValue}) => {
    vData.job_option_list = searchValue ? await jobSelector(searchValue,{join:"_"}) : [];
  },
};
const editFormRef=ref();
const editForm = reactive({
  data: {...defaultData.form_data},
  bind: {
    titleWidth:80,
    titleAlign:"right",
    rules: {
      plant_id: [{required: true, message: '请选择工厂'}],
      customer_code: [{required: true, message: '请填写客户代码'},{pattern:/^(\d{4}\s)*\d{4}$/,message:"必须是4位数字，多个用空格隔开"}],
    },
    style:{"margin-bottom":"20px"},
  },
  validate:async ()=>{
    return await editFormRef.value.validate();
  },
  on: {
    change: ()=>editForm.validate,
  }
});


//表格元素
const editTableRef = ref();
//表格事件
const tableEvent = {
  view: async (row) => {
    editModal.data.editBtnName = '修改';
    editForm.data= await tableEvent.getFormData(row);
    editTable.data.table=await tableEvent.getTableData(row);
    editModal.data.isReadonly=true;
  },
  add: async () => {
    if(vData.params.case_sn!==undefined){
       await tableEvent.view({case_sn: vData.params.case_sn})
    }
    setTimeout(editTable.addRow,0);
    editModal.data.isReadonly=false;
  },
  edit: async (row) => {
    await tableEvent.view(row);
    editModal.data.editBtnName = '保存';
    editModal.data.isReadonly = false;
  },
  getFormData:async (row)=>{
    if(row?.case_id){
      return {...defaultData.form_data,...row,id:row.case_id};
    }
    if(typeof row.customer_code==="undefined" && row?.case_sn){
      // 有工单ID时，获取工单数据
      const res= await http.get(_apiUrl.case,{params:{sn:row.case_sn}});
      const data=res?.data?.data?.data || {};
      return {...defaultData.form_data,...data};
    }
  },
  getTableData:async ({sn})=>{
    if (sn===undefined) {
      return [];
    }
    let res = await http.get(_apiUrl.detail, {params:{sn:sn}})
    if (res.data.code !== 20000) {
      dialog.error(res.data.message)
      return;
    }
    editTable.data.sn=sn;
    let form_list_data = res.data.data.data;
    if(form_list_data.length){
      form_list_data.forEach((item) => {
        item.payer = item['_text']['payer_uid'];
        // item.consumer = item['_text']['consumer_uids'];
        item.pay_at = core.date.dateFormat(item['_text']['pay_at']);
      })
    }
    return form_list_data;
  },
  save: async (e) => {
    if (editModal.data.isReadonly) {
      editModal.data.isReadonly = false;
      editModal.data.editBtnName = "保存";
      editModal.data.editBtnIcon = "save";
      return
    }
    let post = {
      form: editForm.data,
      sn: editTable.data.sn,
      table: editTable.data.table,
      insert:editTableRef.value.getInsertRecords(),
      update:editTableRef.value.getUpdateRecords(),
      deleteIds:editTableRef.value.getRemoveRecords().map((row)=>row.id),
    };
    //验证表单数据
    if (post.sn.length<1 &&  await editForm.validate()) {
      return;
    }
    //验证表格数据
    if (await editTable.validate(post.table) || await editTable.validate(post.insert) || await editTable.validate(post.update)) {
      return;
    }

    //过滤掉已删除的元素
    if(post.deleteIds){
      post.table=post.table.filter((item)=>!post.deleteIds.includes(item.id));
    }

    //更新序号
    post.table.map((item)=>item.sort=editTableRef.value.getRowSeq(editTableRef.value.getRowById(item._index)));
    post.insert.map((item)=>item.sort=editTableRef.value.getRowSeq(editTableRef.value.getRowById(item._index)));
    post.update.map((item)=>item.sort=editTableRef.value.getRowSeq(editTableRef.value.getRowById(item._index)));

    if (post.table.length < 1 && post.insert.length < 1) {
      return dialog.warning('请添加数据！');
    }

    let res = await http.post(_apiUrl.save + '?action=' + editModal.data.action, post);
    if (res.data.code !== 20000) {
      return dialog.error(res.data.message);
    }
    editModal.close(getList);
  },
  set: async (id, value,key='status') => {
    if(id===undefined){
      dialog.warning('请选择要操作的对象');
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
    await getList()
  },
  delete: async (id) => {
    return await tableEvent.set(id, -1,'status');
  },
  deleteRows:async ()=>{
    editTableRef.value.removeCheckboxRow();
    // let checkedRows=editTableRef.value.getCheckboxRecords();
  },
  addRow:async ()=>{
    const $table = editTableRef.value;
    let beforeRow=$table?.getCheckboxRecords(false)?.[0] || -1;
    let seq=beforeRow===-1?editTable.data.table.length+1:beforeRow.sort+1;
    let newRowData={...defaultData.table_row,sort:seq,sn:editForm.data.sn};
    const { row: newRow } = await $table.insertAt(newRowData,beforeRow);
    await $table.setEditCell(newRow, 'item');
  },
  userChange: ({value}, field, row) => {
    let option = vData.user_option_list.find((item) => item?.label === value);
    let uid = option?.value || 0;
    if (row.data === undefined) {
      row[field] = uid;
    } else {
      row.data = {...row.data, [field]: uid}
    }
  },
  usersChange: ({value}, field, row) => {
    let uids = [];
    if(value?.length<1){
      return
    }
    value.forEach((valueLI) => {
      let option = vData.user_option_list.find((item) => item?.label === valueLI);
      option?.value && uids.push(option?.value);
    })
    if (row.data === undefined) {
      row[field] = uids;
    } else {
      row.data = {...row.data, [field]: uids}
    }
  },
  userSelector: async ({searchValue}) => {
    vData.user_option_list = await userSelector(searchValue);
  }
};

//表格对象
const editTable = reactive({
  data: {...defaultData.table_data},
  bind: ()=>{
    editTable.data.moneySum = editTable.data.table.reduce((acc, obj) => acc + obj?.money, 0);
    return {
      data:editTable.data.table,
      disabled:editModal.data.isReadonly,
      minHeight: 0,
      border: true,
      keepSource:false,
      editConfig: {mode: 'row', trigger: 'click', enabled: !editModal.data.isReadonly,showStatus:true,showUpdateStatus:true,showInsertStatus:true},
      rowConfig:{keyField:'_index'},
      validConfig:{showMessage:false},
      editRules: {
        item: [{required: true, message: '类型必填', trigger: 'change'}],
        // title: [{required: true, message: '明细必填', trigger: 'change'}],
        money: [
          {required: true, message: '金额必填', trigger: 'change'},
          {type: 'number', min: 1, message: '金额必须>0', trigger: 'change'}
        ],
      },
      showFooter:true,
      footerData:[{sort: '合计', money: editTable.data.moneySum},]
    }
  },
  validate: async (rows=undefined) => {
    const {fullData}=editTableRef.value.getTableData();
    editTable.data.moneySum = fullData.reduce((acc, obj) => acc + obj?.money, 0);
    return await editTableRef.value.validate(rows);
  },
  on: {
    validError:(e)=>{
      console.log('submitInvalid',e);
      const cell= editTableRef.value.getCellElement(e.row,e.field);
      console.log('cell',cell);
      cell.focus();
      cell.classList.add('blink');
    },
    keyup: _.debounce((e) => editTable.validate(), 500),
    change: () => editTable.validate(),
    submit: () => editTable.save,
  },
  onShow: ({}) => {
    editForm.data={...defaultData.form_data};
    editTable.data={...defaultData.table_data};

    editModal.bind.width='75%';
    editModal.bind.position.left='300px';
    editModal.data.btn.bind=()=>{
      return editModal.data.isReadonly?{}:{
        options:[
          {name:'addRow',content:"添加行",icon:'vxe-icon-add',status: "info"},
          {name:'delRow',content:"删除行",icon:'vxe-icon-delete',status: "error"},
        ]
      }
    };
    editModal.data.btn.click=async ({name})=>{
      if(name==='addRow') await editTable.addRow();
      if(name==='delRow') await editTable.deleteRows();
    }
  },
  onClose: () => {
    editForm.data={...defaultData.form_data};
    editTable.data={...defaultData.table_data};
  },
  ...tableEvent
});







// 搜索（延迟）
const getListDelay = _.debounce((type = 'init', param = {}) => {
  return getList(type, param);
}, 500)

//搜索
const getList = async (type = 'init', param = {}) => {
  vData.params={...vData.params,...param, currentPage:getCurrentPage(type,vData.params,vData.list.length)};
  type==='reset' && (vData.params={...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let res = await http.get(_apiUrl.list, {params:{...vData.params,seq:0}});
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
  getList()
})

// 页面显示时
onActivated(() => {
  const query=getQuery();
  console.log('query',query);
  vData.params={...defaultData.params,...query};
  if(query.action!==undefined){
    if (query.action==='list') return getList('init');
    editModal.open(query.action,query);
  }
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})


</script>

<style>
.siyi-bill-list {

  ::-webkit-scrollbar{
    height: 2px;
  }

  width: 100%;
  height: 100%;
  position: absolute;

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .list-action {
    margin-right: 40px;

    .vxe-button + .vxe-button.type--button {
      margin-left: 2px;
    }

    .mr10 {
      margin-left: 10px;
    }
  }

  .search-select {
    width: 140px;
  }
  .vxe-table--body{
    .vxe-input,.vxe-number-input{
      border: none;
    }
    .col--valid-error{
      border: 1px solid red;
      z-index: 999;
    }

  }

  .hide{
    display: none;
  }

  .new-row {
    margin-top: 20px;
    border-top: 1px solid #e8e8e8;
  }



}
</style>