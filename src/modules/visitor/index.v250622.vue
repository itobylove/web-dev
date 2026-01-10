<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
    <dialogComponent v-if="detail.isShow" className="detailBox" :title="detail.title"  type="window" :maxWidth="1440"  :width="siyi.pc?'80%':'100%'" :height="siyi.pc?'85%':'100%'" top="center" @afterClose="detail.isShow=false">
      <t-form ref="formRef" :class="siyi.pc?'form-pc':'form-mobile'" :data="detail.data" :disabled="detail.readOnly" :rules="detail.rules" :labelWidth="120" :colon="true" @submit="detailEvent.save">
        <t-row :gutter="siyi.pc?[0,30]:50">
          <t-divider style="margin:0 20px">邀请信息（开单人填写）</t-divider>
          <t-col :span="detail.style.span" >
            <t-form-item label="接待工厂" name="plant_id" >
              <t-radio-group v-if="siyi.pc"   v-model="detail.data.plant_id" @change="detailEvent.plantChange"  :options="vData.select_options.plant_id"/>
              <m-select v-else  v-model="detail.data.plant_id"  @change="detailEvent.plantChange"  :options="vData.select_options.plant_id"/>
            </t-form-item>
          </t-col>
          <t-col :span="detail.style.span"  :offset="detail.style.offset">
            <t-form-item label="接待部门" name="dept_id" >
              <t-tree-select v-if="siyi.pc"  v-model="detail.data.dept_id" :data="detail.dept_tree"  clearable :minCollapsedNum="9999"
                   @change="detailEvent.deptChange"
                  :filter="(searchText, node)=>node.data.label.indexOf(searchText)"  placeholder="请选择" />
              <m-select v-else v-model="detail.data.dept_id" :options="vData.select_options.dept_id" clearable filterable
                   @change="detailEvent.deptChange"
                  :filter="(searchText, node)=>node.data.label.indexOf(searchText)"  placeholder="请选择" />
            </t-form-item>
          </t-col>
          <t-col :span="detail.style.span" >
            <t-form-item label="来访目的" name="scene_id">
              <t-radio-group v-if="siyi.pc"  v-model="detail.data.scene_id" :options="detail.scene_list"/>
              <m-select v-else v-model="detail.data.scene_id"  :options="detail.scene_list"/>
            </t-form-item>
          </t-col>

          <t-col :span="detail.style.span" :offset="detail.style.offset">
            <t-form-item label="接待人" name="reception_user_code">
              <t-select v-if="siyi.pc" v-model="detail.data.reception_user_code" :options="vData.select_options.employee" filterable
                        placeholder="请选择接待人" @change="tableEvent.receptionChange"/>
              <m-select v-else v-model="detail.data.reception_user_code" :options="vData.select_options.employee" filterable
                        :placeholder="detail.data.reception_user_name" @change="tableEvent.receptionChange"/>
              <t-input style="width: 200px" v-model="detail.data.reception_user_phone" placeholder="接待人电话，开单人必填"/>
            </t-form-item>
          </t-col>


          <t-col :span="detail.style.span"  >
            <t-form-item label="来访事由" name="remark">
              <t-input v-model="detail.data.remark" placeholder="仅员工可见，开单人必填"/>
            </t-form-item>
          </t-col>

          <t-col :span="detail.style.span" :offset="detail.style.offset">
            <t-form-item label="同行人数" name="visitor_number" >
              <t-input-number v-if="siyi.pc" v-model="detail.data.visitor_number" style="width: 100%" :min="0" :step="1" placeholder="不包含自己，开单人必填，>=0"/>
              <t-stepper v-else v-model="detail.data.visitor_number"  :min="0" :step="1" placeholder="不包含自己，开单人必填，>=0"/>
            </t-form-item>
          </t-col>

          <t-col :span="detail.style.span" >
            <t-form-item label="来访时间" >
              <t-date-range-picker v-if="siyi.pc" v-model="detail.data.visit_time"  v-bind="datePicker"  placeholder="必填"/>
              <div  v-else >
                <m-datetime v-model="detail.data.start_time" placeholder="开始时间" />
                <m-datetime v-model="detail.data.end_time" placeholder="结束时间" />
              </div>
            </t-form-item>
          </t-col>

          <t-col :span="detail.style.span" :offset="detail.style.offset">
            <t-form-item label="最长来访天数" name="stay_day">
              <t-input-number v-if="siyi.pc" v-model="detail.data.stay_day" @change="stayDayChange" style="width: 100%" :min="1" :step="1" placeholder="不包含自己，必填，>=0"/>
              <t-stepper v-else v-model="detail.data.stay_day" @change="stayDayChange"  :min="1" :step="1" placeholder="不包含自己，必填，>=0"/>
            </t-form-item>
          </t-col>





          <hr>



<!--          <t-col :span=detai.style.span v-show="detail.data.id>0">
            <t-form-item label="来源" name="source_type" >
              <t-radio-group v-model="detail.data.source_type" :options="vData.select_options.source_type" readonly/>
            </t-form-item>
          </t-col>-->
          <t-divider style="margin:0 20px">访客信息（访客填写）</t-divider>

          <t-col :span="detail.style.span" >
            <t-form-item label="来访人姓名" name="contact_name">
              <t-input v-model="detail.data.contact_name" placeholder="2-8位中文校验，访客必填"/>
            </t-form-item>
          </t-col>
          <t-col :span="detail.style.span" :offset="detail.style.offset">
            <t-form-item label="来访人公司" name="contact_company">
              <t-input v-model="detail.data.contact_company" placeholder="来访的公司、部门等，访客必填"/>
            </t-form-item>
          </t-col>
          <t-col :span="detail.style.span" >
            <t-form-item label="来访人电话" name="contact_phone">
              <t-input v-model="detail.data.contact_phone" placeholder="11位手机号校验，访客必填"/>
            </t-form-item>
          </t-col>
          <t-col :span="detail.style.span" :offset="detail.style.offset">
            <t-form-item label="身份证号码" name="contact_idcard">
              <t-input v-model="detail.data.contact_idcard" placeholder="18位身份证号校验，访客必填"/>
            </t-form-item>
          </t-col>

          <t-col :span="detail.style.span" >
            <t-form-item label="访客备注" name="visitor_remark">
              <t-input v-model="detail.data.visitor_remark" placeholder="公开，访客可见，访客选填"/>
            </t-form-item>
          </t-col>

<!--          <t-col :span="detail.style.span" :offset=detail.style.offset>
            <t-form-item label="可入厂次数" name="checkin_limit">
              <t-input-number v-if="siyi.pc" v-model="detail.data.checkin_limit" :min="1" :step="1"/>
            </t-form-item>
          </t-col>-->
          <t-col :span="12">
            <t-form-item>
                <t-button theme="primary" type="submit">{{detail.data.id?'保存':'开单'}}</t-button>
                <t-button theme="default" type="button" style="margin-left: 30px">取消</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
      <div class="stepBox">
        <t-steps :default-current="detail.step" readonly>
          <t-step-item title="邀请" >
            <template #content >
              <p>员工开单，发送链接给访客</p>
              <p v-show="detail.data?.created_at">{{detail.data?.created_uid_text}} {{detail.data?.created_at_text}}</p>
            </template>
          </t-step-item>
          <t-step-item title="填写" >
            <template #content >
              <p>访客（或员工）填写后提交</p>
              <p v-show="detail.data?.submit_at">{{detail.data?.submit_uid_text}} {{detail.data?.submit_at_text}}</p>
            </template>
          </t-step-item>

          <t-step-item title="审批" >
            <template #content >
              <p>部门主管/领导审批</p>
              <p v-show="detail.data?.approval_at">{{detail.data?.approval_at_text}}</p>
            </template>
          </t-step-item>
          <t-step-item title="核销" >
            <template #content >
              <p>门卫保安扫码核销</p>
              <p v-show="detail.data?.checkin_at">{{detail.data?.checkin_user_id_text}} {{detail.data?.checkin_at_text}}</p>
            </template>
          </t-step-item>
          <t-step-item title="结束">
            <template #content >
              <p>归档</p>
              <p v-show="detail.data?.finish_uid>1">{{detail.data?.finish_uid_text}} {{detail.data?.finish_at_text}}</p>
            </template>
          </t-step-item>
        </t-steps>
      </div>
    </dialogComponent>
    <dialogComponent v-if="detail.share.link" type="window" title="邀请链接" className="detailBox-share" :minHeight="300" width="95%" :maxWidth="800" left="center"  top="center"  @afterClose="detail.share.link=''">
      <div class="qrcode" v-if="detail.share.type==='qrcode'">
        <div class="qrcode-title">
          【{{detail.share.data.scene_name}}】 {{detail.share.data.contact_company}} {{detail.share.data.contact_name}} {{detail.share.data.stay_day_real}}天
        </div>
        <div class="qrcode-content">
          <img :src="detail.share.img" :alt="detail.share.title" style="width: 350px;height: 350px" />
          <div class="qrcode-tips">请使用手机扫码填写信息</div>
          <div class="qrcode-time" v-html="detail.share.time"></div>
          <div class="qrcode-link">{{detail.share.link}}</div>
        </div>
      </div>
      <div class="link" v-else>
        <div class="link-title"> 【{{detail.share.data.scene_name}}】 {{detail.share.data.contact_company}} {{detail.share.data.contact_name}} {{detail.share.data.stay_day_real || detail.share.data.stay_day}}天 </div>
        <t-input class="link-link" :value="detail.share.link"/>
        <div class="link-tips">请复制链接，分享给客户填写信息</div>
        <div class="link-btn">
          <t-button theme="primary" variant="outline" @click="detail.share.copy()">复制链接</t-button>
          <t-button theme="default" variant="outline" @click="openWindow(detail.share.link,'_blank')">打开链接</t-button>
        </div>
      </div>
    </dialogComponent>
    <dialogComponent v-if="log.isShow" v-bind="log.attr"  @afterClose="log.isShow=false">
      <t-base-table row-key="index" :data="log.list" :columns="log.columns"></t-base-table>
    </dialogComponent>

  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table.vue'
import * as listTableFn from "@/core/script/tableFn.js";
import dialogComponent from '@/core/component/dialog.vue'

import * as api from "@/core/script/api.js"
import apiUrl from "@/core/config/url.js";
import {copyText, getOptionsLabel, listToTree} from "@/utils/vars.js";
import {plantList} from "@/utils/erp.js";
import {getAroundDays, startOfToday, endOfToday, dateNow, friendlyDate, diffNaturalDays} from "@/utils/tdesign.js";
import siyi from "@/core/script/siyi.js";
import QRCode from 'qrcode'
import dialog, {openWindow} from "@/core/script/dialog.js";
import {APPROVAL_RESULT_PASS, APPROVAL_RESULT_REJECT, SOURCE_INVITE, STATUS_APPROVED, STATUS_APPROVING, STATUS_CHECKIN, STATUS_EDIT, STATUS_FINISH, STATUS_REJECT, STATUS_SUBMIT} from "./const.js";
import MSelect from "@/core/component/m-select.vue";
import MDatetime from "@/core/component/m-datetime.vue";
import dayjs from "dayjs";
import * as core from "@/core/script/core.js";

const report = ref()

const log = reactive({
  attr: {
    title: "操作日志",
    height: "70%",
    width: "70%",
    maxWidth: "800",
    left: "center",
    top: "center",
  },
  isShow: false,
  list: [],
  columns:[
    { colKey: 'serial-number', title: '序号', width: '100' },
    { colKey: 'type_text', title: '类型', width: '100' },
    { colKey: 'created_uid_text', title: '操作人', width: '100' },
    { colKey: 'created_at_text', title: '操作时间', width: '100' },
  ],
  open: async (rows) => {
    const row = rows?.[0] || {};
    const data = await api.get(apiUrl.visitor.apply.log, {id: row.id})
    log.list = data?.list || [];
    log.isShow = true;
  },
})


//页面数据
const vData=reactive({
  tabType:1,
  scene_list:[],
  dept_tree:[],
  select_options: {status: [],checkin_type:[],employee:[],dept_id:[]},
  showLog:false,
})

const formRef=ref();
const detail=reactive( {
  scene_list:[],
  plant_list:[],
  dept_tree:[...vData.dept_tree],
  readOnly:false,
  style:{span:0,offset:0},
  isShow:false,
  title:"邀请",
  step:0,
  share:{type:'',time:"",link:'',img:'',data:{}},
  data:{plant_id:0,dept_id:0,start_time:'',end_time: '',visit_time:[]},
  rules:{
    plant_id: [{ required: true, message: '请选择工厂', trigger: 'change' },],
    dept_id: [{ required: true, message: '请选择部门', trigger: 'change' },],
    scene_id: [{ required: true, message: '请选择目的', trigger: 'change' },],
    remark: [{ required: true, message: '请输入来访的事由', trigger: 'blur' },],
    visitor_number:[
        { required: true, message: '请填写人数', trigger: 'change' },
        { type: 'number', min: 0, message: '人数必须>=0', trigger: 'change' }
    ],
    stay_day:[
      { required: true, message: '请填写来访天数限制', trigger: 'change' },
      { type: 'number', min: 1, message: '必须>0', trigger: 'change' }
    ],
    contact_name: [
        // { required: true, message: '请输入来访人姓名', trigger: 'blur' },
      { type: 'string', pattern: /^[\u4e00-\u9fa5]{2,8}$/, message: '请输入中文姓名', trigger: 'blur' }
    ],
    contact_phone: [
        // { required: true, message: '请输入来访人手机号', trigger: 'blur' },
        { type: 'string', pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    contact_idcard: [
        // { required: true, message: '请输入来访人身份证号', trigger: 'blur' },
        { type: 'string', idcard: true,  message: '请输入18位身份证号', trigger: 'blur' }
    ],
    reception_user_code:[
        { required: true, message: '请选择接待人', trigger: 'change' },
    ],
    checkin_limit:[
      { required: true, message: '请填写多核销次数', trigger: 'change' },
      { type: 'number', min: 0, message: '次数必须>=0', trigger: 'change' }
    ],
  },
})
const detailEvent={
  plantChange: (value) => {
    console.log('plantChange',typeof value,value);
    detail.data.plant_id=value;
    detail.scene_list=vData.scene_list.filter(item => item.plant_id===detail.data.plant_id && (detail.data?.id || item?.allow_invite));
    detail.plant_list= vData.select_options.dept_id.filter(item => item.plant_id===value);
    if (detail.data.dept_id && detail.plant_list.findIndex(item => item.value===detail.data.dept_id)===-1){
      detail.data.dept_id=null;
    }
    detail.dept_tree=listToTree(detail.plant_list);
    /*report.value.search.updateSearchItem('scene_id',{
      options: detail.scene_list,
    })*/
  },
  deptChange: (value) => {
    const dept= vData.select_options.dept_id.find(item => item.value===value);
    if (dept.level<2){
      detail.data.dept_id=null;
      return dialog.warning('请选择子部门!',500);
    }
    detail.data.dept_id=value;
    if (dept?.plant_id && dept?.plant_id !== detail.data.plant_id){
      detailEvent.plantChange(dept.plant_id);
    }
  },
  edit: (row) => {
    if (Array.isArray(row)) row=row[0];
    if (!row?.id) return detailEvent.add();
    detail.title='修改';
    detail.data = {...row,visit_time:[row.start_time,row.end_time],_raw: row};
    const stepBind=[[STATUS_EDIT],[STATUS_SUBMIT,STATUS_APPROVING,STATUS_REJECT],[STATUS_APPROVED],[STATUS_CHECKIN,STATUS_FINISH]]
    detail.step=1+(stepBind.findIndex(item => item.includes(row.status)) || 0);
    detail.readOnly=row.status!==STATUS_EDIT;
    detailEvent.plantChange(detail.data.plant_id);
    detail.isShow = true;
  },
  add:async ()=>{
    detail.title='新邀请';
    detail.isShow = true;
    detail.step=0;
    detail.readOnly=false;
    detail.data = {
      id:0,
      plant_id:table.plant_id,
      dept_id:table.dept_id,
      scene_id:null,
      source_type:1,
      contact_name:"",
      contact_phone:"",
      contact_idcard:"",
      visitor_number:0,
      stay_day:1,
      checkin_limit:0,
      status:STATUS_EDIT,
      start_time: dateNow.add(1, 'day').format('YYYY-MM-DD 08:00'),
      end_time: dateNow.add(1, 'day').format('YYYY-MM-DD 17:30'),
      reception_user_code:siyi.user.username,
      reception_user_name:siyi.user.nickname,
      reception_user_phone:siyi.user.mobile,
    };
    detail.data.visit_time=[detail.data.start_time,detail.data.end_time];
    detailEvent.plantChange(detail.data.plant_id);
  },
  save: async ({validateResult,firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    if (siyi.pc && detail.data.visit_time){
      [detail.data.start_time, detail.data.end_time] = detail.data.visit_time;
    }
    const loading= dialog.loading(formRef.value);
    const result = await api.post(apiUrl.visitor.apply.save, {...detail.data});
    loading.close();
    if (!result?.id) return ;
    detail.isShow=false;
    tableEvent.showShare(result);
    await report.value.reportOptions.getData();
  },
};

const stayDayChange=(value) => {
  detail.data.end_time=dayjs(detail.data.start_time).add(value-1, 'day').set('hour', 17).set('minute', 30).format('YYYY-MM-DD HH:mm')
};


const datePicker = ref({
  title:"来访时间",
  disableDate: {
    before: startOfToday.toDate(),
    after: endOfToday.add(1, 'month').toDate()
  },
  format: "YYYY-MM-DD HH:mm",
  presets: getAroundDays({start:0,end:11,format: ["YYYY-MM-DD 08:00", "YYYY-MM-DD 17:30"]}),
  enableTimePicker: false,
  allowInput: true,
  clearable: true,
  style:{width:'100%'}
});


const table = reactive({
  isInit: false,
  plant_id:core.getDefaultPlantId(),
  dept_id:core.getDefaultDeptId(),
  scene_list:[],
  menu: [],
  search: {},
  tableConfig:{columns: [],userConfig: {}},
  param:{},
});
const tableEvent = {
  plantChange: (value,updateSearch=true) => {
    if (value===table.plant_id && table.isInit) return ;
    table.plant_id=value;
    table.scene_list=vData.scene_list.filter(item => item.plant_id===table.plant_id && item?.allow_invite);
    if (table.isInit){
      report.value.search.updateSearchItem('plant_id',value,'value');
      updateSearch && report.value.search.updateSearchItem('scene_id',{
        options: table.scene_list,
      })
    }
  },
  deptChange: (value) => {
    const dept= vData.select_options.dept_id.find(item => item.value===value);
    table.dept_id=value;
    if (dept?.plant_id){
      tableEvent.plantChange(dept.plant_id);
    }
  },
  showShare: (row) => {
    if (typeof row!=='object') return ;
    if (Array.isArray(row)) row=row[0];
    detail.share={
      type:'',
      data:row,
      link:api.getPageUrl('/page/visitor', {sn:row?.source_data,device:0}),
      time:dateNow.format("YYYY-MM-DD HH:mm:ss").toString(),
      copy: async () => {
        const res = await copyText(detail.share.link);
        res ? dialog.success('复制成功') : dialog.warning('复制失败，请手动复制')
      }
    };
    QRCode.toDataURL(detail.share.link,{width:500}, function (err, img) {
      if (err) console.error(err);
      detail.share.img=img;
    })
  },
  receptionChange:(value)=>{
    const reception=vData.select_options.employee.find(item=>item.value===value);
    detail.data['reception_user_name']=reception.label;
    detail.data['reception_user_id']=reception?.user?.id || null;
    detail.data['reception_user_phone']=reception?.user?.mobile || '';
  },
  set: async (rows,post,title) => {
    if(!Array.isArray(rows)) return ;
    const ids=rows.filter(item => item?.id).map(row=>row.id);
    if (title && !await dialog.confirmAsync('确定要'+title + ids.length + '条数据吗？',title+'确认')) {
      return;
    }
    const loading = dialog.loading(report.value);
    const result = await api.post(apiUrl.visitor.apply.set, {...post, id: ids});
    loading.close();
    if (!result) return ;
    dialog.success('操作成功');
    await report.value.reportOptions.getData();
  },
};



const getSearchForm = () => {
  return [
    {type: 'radio', field: 'tabType', options: {options: [{label: '全部', value: 0},{label: '与我相关', value: 1},{label: '待我审批', value: 2}]},value:vData.tabType},
    {type: 'select', field: 'plant_id',style: {width: '100px'}, options: {placeholder: '工厂',multiple:false},onChange:tableEvent.plantChange,load: 'factory'},
    // {type: 'tree', field: 'dept_id', options: {placeholder: '部门',multiple:false,data:vData.dept_tree},onChange:tableEvent.deptChange,value:table.dept_id},
    // {type: 'select', field: 'scene_id',style: {width: '150px'}, options: {placeholder: '目的', options:table.scene_list}},
    {type: 'select', field: 'status', options: {placeholder: '状态', options: vData.select_options.status}},
    {type: 'input', field: 'keyword', options: {placeholder: '搜索: 接待人/访客姓名/访客手机号/访客公司/备注'},style:{width: '500px'}},
    {type: 'rangeTime', field: 'createTime', options: {title: '创建时间',placeholder:"创建时间"}},
    // {type: 'rangeTime', field: 'rangeTime', options: {...datePicker.value,format:'YYYY-MM-DD HH:mm:ss',disableDate:{},placeholder:"来访时间"}, value: [dateFormat(null,'YYYY-MM-DD 00:00:00'),'']},
  ]
}
const getMenus = () => {
  return {
    approve: {sort: 100, title: '审批',event:{afterApprove: ()=>alert('1')}},
    add: {sort: 110, title: '新邀请', icon: 'ri-folder-add-line', click: detailEvent.add},
    share: {sort: 115, title: '邀请链接', icon: 'ri-qr-code-line', listAction: tableEvent.showShare},
    log: {sort: 118, title: '操作记录', icon: 'ri-history-line', listAction: log.open},
    edit: {sort: 120, title: '修改', icon: 'ri-edit-line', listAction: detailEvent.edit},
    submitApprove: {sort: 125, listAction: (rows)=>tableEvent.set(rows,{type:'submit',status:STATUS_SUBMIT},'提交审批')},
    resetApprove: {sort: 130, listAction: (rows)=>tableEvent.set(rows,{type:'reset',status:STATUS_EDIT},'撤回审批')},
    // cancel: {sort: 150, title: '取消', icon: 'ri-close-circle-line', listAction: (rows)=>tableEvent.set(rows,{status:STATUS_FINISH,cancel_status:1},'取消')},
    del: {sort: 160, title: '删除', icon: 'ri-delete-bin-line', listAction: (rows)=>tableEvent.set(rows,{status:-1},'删除')},
    // finish: {sort: 120, title: '完结', icon: 'ri-stop-line', listAction: (rows)=>tableEvent.set(rows,{status:STATUS_FINISH},'完结')},
    // scene: {sort: 120, title: '目的管理', icon: 'ri-arrow-right-circle-line', click: console.log},
  };
}


// 页面初始化
const initTable = async () => {
  const apiData = await api.get(apiUrl.visitor.apply.init);
  vData.scene_list=apiData?.scene_list || [];
  vData.select_options = getOptionsLabel(apiData?.option);
  vData.select_options.plant_id= plantList;
  vData.select_options.employee= await api.employeeSelector('',{with:'user'});
  vData.select_options.dept_id= await api.departmentSelector();
  vData.dept_tree=listToTree([...vData.select_options.dept_id]);
  tableEvent.plantChange(1,false);

  table.tableConfig = {...apiData.table,columns:listTableFn.createColumns(apiData.columns, table.tableConfig?.columnSplit || '#')};
  table.menu = getMenus();
  table.search = getSearchForm();
  table.isInit = true;
}

const getReportConfig = () => {
  return {
    dataFetcher: async (url,query) => {
      const {list,param}=await api.get(apiUrl.visitor.apply.list,query);
      table.param=param;
      return list.map(item => {return {...item,
        start_time_str:friendlyDate(item.start_time),
        stay_day_real:item.start_time && item.end_time ?diffNaturalDays(item.start_time,item.end_time):item.stay_day,
      }});
    },
    menu: table.menu,
    search: table.search,
    defaultMenuHideList:['advancedExport','clearCache'],
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
      ...table.tableConfig
    },
    dblclickCell:({originData})=>detailEvent.edit(originData),
  }
};


onMounted(async () => {
  const tab = core.query.get('tab');
  vData.tabType = tab ? parseInt(tab) : 1;
  await initTable();
  detail.style.span= siyi.pc? 5 : 24;
  detail.style.offset= siyi.pc? 1 : 0;
})


</script>

<style>
.approvalBox .body{
  display: flex;
  justify-content: center;
  flex-flow: column;
  padding: 10px;
  .stepInfo{
    font-size: 18px;
    text-align: center;
  }
  .t-list-item-main{
    flex-direction: column;
  }
}
</style>
<style scoped>


.mainPage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  .publicReportBox {
    padding: 0;
  }
  .detailBox {
    .t-form{
      padding: 20px;
    }
    .stepBox{
      margin: 20px auto;
      width: 90%;
    }
  }
  &:has(.mobile){
   .stepBox{
      width: 95%;
    }
    .t-form{
      padding: 0 !important;
      .t-form__item{
        padding: 10px 0;
      }
    }
  }

  .detailBox-share {
    .link{
      padding: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .link-title{
        font-size: 2rem;
        line-height: 3rem;
      }
      .link-link{
        width: 400px;
        text-align: center;
        font-size: 1.8rem;
        padding: 20px 5px;
      }
      .link-tips{
        margin-top: 20px;
        font-size: 1.4rem;
        line-height: 4rem;
        color: #909399;
      }
      .link-btn{
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
    }
    .qrcode{
      padding: 50px 10px;
      text-align: center;
      font-size: 2rem;
      .qrcode-title{
        font-size: 1.8rem;
      }
      img {
        width: 30rem;
        height: 30rem;
      }
      .qrcode-tips{
        font-size: 1.8rem;
        line-height: 4rem;
        color: #000;
      }
      .qrcode-time{
        font-size: 1rem;
        line-height: 1.5rem;
        color: #c5c5c5;
      }
      .qrcode-link{
        margin-top: 50px;
        font-size: 1rem;
        color: #eee;
        //position: absolute;
        line-height: 1.5rem;
        //bottom: 5px;
        //width: 100%;
      }
    }

  }

}
</style>