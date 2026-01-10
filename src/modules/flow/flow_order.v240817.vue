<template>
  <div class="siyi-order-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind" @click="listBtn.action.click"  />

        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />

<!--        <vxe-select v-bind="listBtn.item.bind()" v-on="listBtn.item.on" />-->

        <span style="margin:0 10px 0 20px ">筛选：</span>
        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small"  style="width: 100px"
                    @change="searchList('init')" :options="plantList">
        </vxe-select>

<!--        <vxe-select v-model="vData.params.type" placeholder="类型" size="small" clearable style="width: 120px"-->
<!--                    @change="searchList('init')" :options="vData.listLabel.type">-->
<!--        </vxe-select>-->

        <vxe-select v-model="vData.params.item_id" placeholder="项目" size="small" clearable style="width: 180px"
                    @change="searchList('init')" :options="vData.listLabel.item_id">
        </vxe-select>

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.status">
        </vxe-select>

        <vxe-input type="search" v-model="vData.params.customer_code" placeholder="客户代码" @clear="searchList"
                   @search-click="searchList" @change="searchList" clearable
                   style="width: 100px" />

        <vxe-input type="search" v-model="vData.params.partNum" placeholder="料号" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 100px" />

        <vxe-input type="search" v-model="vData.params.search" placeholder="搜索"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 160px" />

        <vxe-number-input type="integer" v-model="vData.params.pageSize" @change="searchList" placeholder="每页数量" min="1" style="width:80px" />

        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>

      </template>
      <template #empty><span><img :src="noData"><p>{{ vData.msg }}</p></span></template>
    </vxe-grid>

    <!-- 修改弹窗 -->
    <vxe-modal  v-model="editModal.data.isShow" v-bind="editModal.bind" v-on="editModal.on">
      <template #title>
        <vxe-button :content="editModal.data.editBtnName"  @click="editModal.save" :icon="'vxe-icon-'+editModal.data.editBtnIcon" style="margin-right: 40px"/>
        <vxe-button-group v-bind="editModal.data.btn.bind()" @click="editModal.data.btn.click"/>
      </template>
      <template #default>



        <vxe-form title-width="80" title-align="right"  >
          <vxe-form-item  title="客户代码" span="24">
            <template #default>
              <p>{{editForm.data.customer_code}}</p>
            </template>
          </vxe-form-item>

          <vxe-form-item  title="本厂型号" span="24">
            <template #default>
              <p>{{editForm.data.relation?.['partNum']}} {{editForm.data.relation?.['partRev']}}</p>
            </template>
          </vxe-form-item>

          <vxe-form-item  title="客户型号" span="24">
            <template #default>
              <p>{{editForm.data.relation?.['partName']}}</p>
            </template>
          </vxe-form-item>





<!--          <vxe-form-item  title="客户料号" span="24">-->
<!--            <template #default>-->
<!--              <p>{{editForm.data.relation?.['custMatCode']}}</p>-->
<!--            </template>-->
<!--          </vxe-form-item>-->

<!--          <vxe-form-item  title="客户合同号" span="24">-->
<!--            <template #default>-->
<!--              <p>{{editForm.data.relation?.['custContractNumber']}}</p>-->
<!--            </template>-->
<!--          </vxe-form-item>-->

          <vxe-form-item  title="销售订单号" span="24">
            <template #default>
              <p>{{editForm.data.relation?.['soNumber']}}</p>
            </template>
          </vxe-form-item>

          <vxe-form-item  title="订单备注" span="24">
            <template #default>
              <p>{{editForm.data.relation?.['note']}}</p>
            </template>
          </vxe-form-item>

          <vxe-form-item  title="出单时间" span="24">
            <template #default>
              <p>{{editForm.data.relation?.['EnterDate']}}</p>
            </template>
          </vxe-form-item>
          <vxe-form-item  title="订单类型" span="24">
            <template #default>
              <vxe-tag status="primary" :content="editForm.data.relation?.['businessName']" />
              <vxe-tag status="primary" :content="editForm.data.relation?.['ot_name']" />
              <vxe-tag status="primary" :content="editForm.data.relation?.['diySaleTypeName']" />
              <vxe-tag status="primary" :content="'状态：'+editForm.data.relation?.['_text']?.['status']" />
            </template>
          </vxe-form-item>


          <vxe-form-item  title="完成时间" span="24" v-if="editForm.data?.finish_uid">
            <template #default>
              <p>{{editForm.data['_text']?.['finish_uid']}} {{editForm.data['_text']?.['finish_at']}}</p>
            </template>
          </vxe-form-item>


        </vxe-form>
        <div style="padding: 10px">
          <vxe-table :data="editForm.data.moList" header-align="center" min-height="0" align="center" v-show="editForm.data?.moList.length>0">
            <vxe-column width="50"  type="seq"/>
            <vxe-column  width="100" field="_text.type" title="类型" />
            <vxe-column width="160" field="partNum2" title="型号" />
            <vxe-column width="60" field="partRev2" title="版本" />
            <vxe-column  width="120" field="moNumber" title="制造单号" />
            <vxe-column  width="120" field="qtyPcs" title="计划数" />
            <vxe-column width="150" field="createDateStr" title="投产时间" />
            <vxe-column  width="100" field="_text.status" title="状态" />
          </vxe-table>
        </div>

        <div style="padding: 10px">
          <vxe-table :data="editForm.data.woList" header-align="center" min-height="0" align="center" v-show="editForm.data?.woList.length>0">
            <vxe-column width="50"  type="seq"/>
            <vxe-column  width="120" field="moNumber" title="制造单号" />
            <vxe-column width="166" field="partNum3" title="型号" :formatter="({row})=>row.partNum3+'\t'+row.partRev3" />
            <vxe-column  width="200" field="woNumber" title="工单号" />
            <vxe-column  width="100"  field="stepName" title="工序" />
            <vxe-column  width="80" field="pcs" title="结存(PCS)" />
            <vxe-column  width="80" field="_text.woStatus" title="状态" />
            <vxe-column width="150"  field="wo_waitTime" title="接收时间" />
            <vxe-column width="85" field="wo_waitTime2" title="停留时间"  :formatter="({cellValue})=>cellValue && dayjs(cellValue).fromNow()"/>
          </vxe-table>
        </div>


        <vxe-form ref="editFormRef"  v-bind="editForm.bind" v-on="editForm.on" :data="editForm.data">

          <vxe-form-item field="remark" title="备注" span="24" >
            <template #default="{ data }">
              <vxe-input clearable placeholder="备注" v-model="data.remark" :readonly="editModal.data.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="status" title="状态" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.status" :disabled="editModal.data.isReadonly" :options="vData.listLabel.status" />
            </template>
          </vxe-form-item>

        <vxe-form-item span="24" align="center">
          <template #default="{ data }">
              <vxe-button v-show="data.status!==key" size="medium" v-for="(label,key)  in vData.listOption.status" :status="vData.statusTheme?.key"
                          :content="label"
                          @click="()=>{editModal.data.isReadonly=false;data.status=key;editForm.save()}"
              ></vxe-button>
          </template>
        </vxe-form-item>

        </vxe-form>


      </template>
    </vxe-modal>


  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import * as core from "@/core/script/core.js"
import {getCurrentPage, http, url as apiUrl} from "@/core/script/api.js"
import {getQuery} from "@/core/script/nav.js"
import noData from '@/core/assets/img/nodata.gif'
import {getPlant, getUserPlantList, plantList} from '@/utils/erp.js'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable.js'
import _ from "lodash";
import {VxeUI} from "vxe-pc-ui";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import updateLocale from "dayjs/plugin/updateLocale"
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: '刚刚',
    m: "1 分钟",
    mm: "%d 分钟",
    h: "1 小时",
    hh: "%d 小时",
    d: "1 天",
    dd: "%d 天",
    M: "1 个月",
    MM: "%d 个月",
    y: "a 年",
    yy: "%d 年"
  }
})

const userPlantList = getUserPlantList('wo-'); //用户的工厂


// 接口URL
const _apiUrl = apiUrl.flow.order;

//列配置
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '工厂', width: 100, field: 'plant_id', sortable: true,filters:[],visible: false, formatter: ({row}) => getPlant(row.plant_id)},
  {title: '项目', width: 180, field: 'item_title',filters:[], sortable: true},
  {title: '项目备注', width: 180, field: 'item_remark',visible: false},

  {title: '客户', width: 100, field: 'customer_code', sortable: true,filters:[]},

  {title: '录入时间', width: 126, field: 'relation.EnterDate',sortable: true,sortBy: ({ row })=> {
      return  new Date(row.EnterDate).getTime();
  },formatter: core.date.datetime},
  { title: '订单类型', width: 120, field: 'relation.ot_name', sortable: true,filters:[]},
  { title: '销售类型', width: 120, field: 'relation.diySaleTypeName', sortable: true,filters:[]},
  { title: '业务类型', width: 120, field: 'relation.businessName', sortable: true,filters:[],visible: false,formatter: ({cellValue})=> {
      return cellValue.replaceAll('-->','->').replace("客户->",'').replace("(直销)",'').replaceAll('龙腾','').replace('龙昌','');
    }},
  { title: '订单状态', width: 120, field: 'relation._text.status', sortable: true,filters:[]},
  { title: '投产顺序', width: 120, field: 'relation.mo_count_index', sortable: true,filters:[]},
  { title: '累计投产', width: 120, field: 'relation.mo_count', sortable: true,filters:[]},
  { title: '订数', width: 80, field: 'relation.qty_Order', sortable: true},
  { title: '赠品', width: 80, field: 'relation.qty_Gift',sortable: true,visible: false},
  { title: '已交', width: 80, field: 'relation.qty_Shipped', sortable: true},
  {title: '型号', width: 160, field: 'relation.partNum', sortable: true,filters:[]},
  {title: '版本', width: 80, field: 'relation.partRev', sortable: true,filters:[]},
  {title: '工单状态', width: 150, field: 'relation.woStatus',sortable: true,formatter:({row})=>row.relation?.pcs?(row.relation?.stepName+":"+row.relation.pcs):''},
  {title: '制造单号', width: 200, field: 'relation.moNumber', sortable: true,visible: false},
  {title: '工单号', width: 200, field: 'relation.woNumber', sortable: true,visible: false},
  {title: '接收时间', width: 120, field: 'relation.wo_waitTime', sortable: true,visible: false,formatter:core.date.datetime},
  {title: '停留时间', width: 100, field: 'relation.wo_waitTime2', sortable: true,formatter:({cellValue})=>cellValue && dayjs(cellValue).fromNow(),sortBy:"relation.wo_waitTime"},
  {title: '客户型号', width: 180, field: 'relation.partName',sortable: true,visible: false},
  {title: '客户物料编码', width: 180, field: 'relation.custMatCode',sortable: true,visible: false},
  {title: '合同号', width: 120, field: 'relation.contractNumber',sortable: true,visible: false},
  {title: '客户合同号', width: 180, field: 'relation.custContractNumber',sortable: true},
  {title: '合同备注', width: 120, field: 'relation.contractNotes',sortable: true,visible: false},
  {title: '订单备注', width: 120, field: 'relation.note',sortable: true},
  {title: '客户交期', width: 120, field: 'relation.requestDate',sortable: true,visible: false,formatter: core.date.date},
  {title: '市场交期', width: 120, field: 'relation.planShippingDate',sortable: true,visible: false,formatter: core.date.date},
  {title: '计划交期', width: 120, field: 'relation.suggestionDate',sortable: true,visible: false,formatter: core.date.date},
  {title: '销售订单号', width: 120, field: 'relation.soNumber',sortable: true},

  {title: '备注', width: 120, field: 'remark',sortable: true,filters:[]},
  {title: '状态', width: 80, field: '_text.status', sortable: true,filters:[]},
  {title: '导入人', width: 80, field: '_text.created_uid', sortable: true,visible: false},
  {title: '导入时间', minWidth: 140, field: '_text.created_at', sortable: true},
  {title: '完成人', width: 80, field: '_text.finish_uid', sortable: true,visible: false},
  {title: '完成时间', minWidth: 140, field: '_text.finish_at', sortable: true},
  {title: '更新人', width: 80, field: '_text.updated_uid', sortable: true,visible: false},
  {title: '更新时间', minWidth: 140, field: '_text.updated_at', sortable: true,visible: false},
  {title: '类型', width: 160, field: '_text.type', sortable: true,filters:[],visible: false},
  {title: '关联ID', width: 120, field: 'relation_key', sortable: false,visible: false},
  {title: 'jobId', width: 80, field: 'job_id', sortable: true,visible: false},
  {title: 'item', width: 80, field: 'item_id', sortable: true,visible: false},
  {title: 'ID', width: 60, field: 'id', sortable: true},
];
//默认数据
const defaultData={
  typeList:['erpContractItem'],
  params:{
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    type:'erpContractItem',
    search: '',//搜索关键字
    customer_code: '',//客户代码
    partNum: '',//料号
    status: 0,//状态
    currentPage: 1,//当前页
    pageSize: 100,//每页多少条
  },
  modal_bind:{
    className:'editModal',
    size: "mini",
    width: 1080,
    height:900,
    position: 'center',
    loading: false,
    resize: 'resize',
    minHeight: 900,
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
  form_data:{relation:{},woList:[],moList:[]}
};

//页面数据
const vData = reactive({
  params:{...defaultData.params},
  listRaw:[],
  listFilter:{},
  list:[],
  msg:'',
  listLabel: {},
  listOption: {},
  itemLabel: {},
  statusTheme:['default','success'],
});


//列表
const gridRef = ref()
const grid=reactive({
  bind:{
    ...gridOptionsDefault,
    id: 'siyi-order-list',
    columns: columns,
    loading: false,
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
    headerCellClick:async (e)=>{
      let field= e.column.field;
      if(!e.triggerFilter || vData.listFilter?.[field]!==undefined){
        return ;
      }
      await grid.updateListFilter(field);
    }
  },
  updateListFilter:async (field)=>{
    vData.listFilter[field]=[];
    let {visibleData}=gridRef.value.getTableData()
    visibleData.map((rowData)=>{
      let cellLabel=gridRef.value.getCellLabel(gridRef.value.getRowById(rowData['_X_ROW_KEY']),field);
      vData.listFilter[field].includes(cellLabel) || vData.listFilter[field].push(cellLabel);
    });
    await gridRef.value.setFilter(field,vData.listFilter[field].map((item)=>{return {label:item,value:item}}));
    gridRef.value.closeFilter();
    gridRef.value.openFilter(field);
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
      }
    },
  },
  item:{
    bind:()=>{
      return {
        modelValue:vData.params.itemAcion,
        placeholder: '批量修改-项目',
        prefixIcon: 'vxe-icon-checkbox-checked',
        options:[...vData.listLabel.item_id || []],
        className:'search-select',
      }
    },
    on: {
      change:async ({value})=>{
        await formEvent.set(listBtn.getSelectedRows(true), value,'item_id');
      }
    },
  },
  action:{
    bind:{
      className:'list-action',
      size:"small",
      options:[
        // {name:'add',mode:'text',content:"添加",icon:'vxe-icon-add'},
        // {name:'view',mode:'text',content:"查看",icon: "vxe-icon-search-zoom-in"},
        // {name:'delete',mode:'text',content:"删除",icon:'vxe-icon-delete'},
      ]
    },
    click:({name},row)=>{
      switch (name){
        case 'add':{editModal.open('add');break;}
        case 'delete':{
          let ids=listBtn.getSelectedRows(true);
          ids && formEvent.delete(ids);
          break;
        }
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
      const modalTop = e.$modal.getPosition().top; //获取当前modal的top值
      const modalWidth=e.$modal.getBox().clientWidth;//获取当前modal的宽度
      const leftMenuWidth=document.querySelector('.siyi .left')?.clientWidth || 60;//左侧菜单的宽度
      editModal.bind.height = (window.innerHeight - modalTop * 2) + 'px';//自动高度
      editModal.bind.position={left:(window.innerWidth-leftMenuWidth - modalWidth)/2+leftMenuWidth};//自动居中
    }
  },
  getForm: () => {
    return editForm
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
    const loading= dialog.loading(document.getElementsByClassName('editModal')?.[0],'正在加载数据，请稍等！');
    let res = await http.get(_apiUrl.detail, {params: {id: id}})
    loading.close();
    if (res.data.code !== 20000) {
      dialog.error(res.data.message)
      return;
    }
    let detailData = res.data.data.data;
    editForm.data = {...defaultData.form_data, ...detailData};//合并数据
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
};

const editFormRef = ref();
const editForm = reactive({
  data: {...defaultData.form_data},
  bind: {
    titleWidth:80,
    titleAlign:"right",
    rules: {
      plant_id: [{required: true, message: '请选择工厂'}],
    }
  },
  validate:async ()=>{
    return await editFormRef.value.validate(editForm.data);
  },
  on: {
    change: ()=>editForm.validate,
    submit: formEvent.save,
  },
  onShow:({})=>{
    editForm.data = {...defaultData.form_data};
  },
  onClose:()=>{
    editForm.data = {...defaultData.form_data};//重置数据
  },
  ...formEvent,
});

const searchListDelay=_.debounce((e)=>{
  searchList('search',{search:e?.value});
},500)

//搜索
const searchList = async (type = 'init',param={}) => {
  vData.params={...vData.params,...param, currentPage:getCurrentPage(type,vData.params)};
  type==='reset' && (vData.params={...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let res = await http.get(_apiUrl.list, {params:vData.params});
  vData.msg = '没有搜索到数据！'
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  vData.listRaw=res.data.data.list;
  vData.list = _.cloneDeep(vData.listRaw);
  vData.listOption = res.data.data?.option?.list;
  vData.listLabel =  getOptionsLabel(vData.listOption);
  vData.itemLabel = getOptionsLabel(res.data.data?.option?.item)
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

<style>
.siyi-order-list {
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
  }
  .vxe-form--item-content p{
    border: 1px solid #eee;
    border-radius: var(--vxe-ui-base-border-radius);
    padding: 0.5em;
  }
  .vxe-table--body-wrapper .body--wrapper{
    min-height: 0;
  }

}
</style>