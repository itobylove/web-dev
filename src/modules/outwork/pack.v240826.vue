<template>
  <div class="siyi-pack-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button  icon="vxe-icon-eye-fill" content="查看明细"  @click="listBtn.action.click({name:'detail'})"/>
        <vxe-button-group v-bind="listBtn.action.bind()" @click="listBtn.action.click"   />
        <vxe-button icon="vxe-icon-cloud-upload" content="导出送货单"  @click="gridRef.openExport()"/>
        <vxe-button icon="vxe-icon-cloud-upload" content="导出明细"  style="margin: 0" @click="listBtn.action.click({name:'exportAll'})"/>

        <span style="margin:0 10px 0 20px ">筛选：</span>

        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small"  clearable style="width: 100px"
                    @change="searchList('init')" :options="userPlantList">
        </vxe-select>

        <vxe-select v-show="!vData.isSupplier" v-model="vData.params.sup_id" placeholder="供应商" size="small" clearable filterable remote style="width: 100px"
                    :remoteMethod="async ({searchValue})=>{vData.supplierList=await api.supplierSelector(searchValue)}"  :options="vData.supplierList"
                    @change="searchList"
        />

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 120px"
                    @change="searchList('init')" :options="vData.label.list.status">
        </vxe-select>

        <t-date-range-picker v-model="vData.params.time_range" enable-time-picker allow-input clearable style="width: 320px;"
         format="YYYY-MM-DD HH:mm" :presets="presets" :disableDate="{before:'2000-01-01',after:'2030-01-01'}"   @change="searchList('init')"  @confirm="searchList('init')" title="出库时间" />


        <vxe-input type="search" v-model="vData.params.search" placeholder="型号/客户订单号/出货单号/快递单号/备注"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 200px;" />

        <vxe-select v-model="vData.params.pageSize" placeholder="每页数量" size="small" style="width: 60px"   @change="searchList('init')" >
          <vxe-option :value="50" label="50" />
          <vxe-option :value="100" label="100" />
          <vxe-option :value="99999999" label="不限" />
        </vxe-select>

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
        <span style="margin-left: 10px;margin-right: 30px;">{{editModal.data.title}}</span>
        <vxe-button v-show="editModal.data.saveBtn.isShow" v-bind="editModal.data.saveBtn.bind" @click="editModal.data.saveBtn.click"/>
        <vxe-button-group v-bind="listBtn.action.bind()" @click="listBtn.action.click"  v-show="editModal.data.action==='detail'"  />
        <vxe-button v-show="editModal.data.action!=='edit'" icon="vxe-icon-cloud-upload" content="导出明细"  @click="detailTableRef.openExport()"/>
      </template>
      <template #default>

        <vxe-table ref="editTableRef" v-bind="editTable.bind" v-on="editTable.on" :data="editTable.list" v-if="editModal.data.action==='edit'">
            <vxe-column type="seq" field="seq" width="70" />
            <vxe-column field="order.packNo" title="送货单号" width="200" />
            <vxe-column field="order.partNumRev" title="型号" minWidth="300" />
            <vxe-column field="order.status" title="状态" width="140" :formatter="({row})=>{
              return  vData.option['list']['status']?.[row['order']['status'] ] || ''
            }"/>
            <vxe-column field="expressType" title="快递类型" width="150"  :edit-render="{ name: 'select',options:vData.shipping }"/>
            <vxe-column field="expressSn" title="快递单号" width="150"
                        :edit-render="{ name: 'input', attrs: { type: 'text'} }" />
            <vxe-column field="remark" title="备注" width="150"   :edit-render="{ name: 'input', attrs: { type: 'text'} }"/>
        </vxe-table>
        <vxe-grid ref="detailTableRef" v-bind="detailTable.bind"  :data="detailTable.list" v-else>
        </vxe-grid>

      </template>
    </vxe-modal>

    <vxe-modal  v-model="printBox.data.isShow" v-bind="printBox.bind" v-on="printBox.on">
      <template #title>
        <span style="margin-right: 20px">{{printBox.data.title}}</span>
        <vxe-button v-for="btn in printBox.data.btn" v-bind="btn.bind" @click="btn.click"/>
      </template>

      <template #default>
        <iframe id="printIframe"  :srcdoc="printBox.data.html" style="border: 0;width:21cm;height: 95%;"></iframe>
      </template>

    </vxe-modal>
  </div>


</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import siyi from '@/core/script/siyi.js'
import * as core from "@/core/script/core"
import * as api from "@/core/script/api"
import noData from '@/core/assets/img/nodata.gif'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import {getAllOptionLabel, getOptionLabel} from "@/utils/vars.js";
import {getUserPlantList} from "@/utils/erp.js";
import dataMap from "@/config/map.js";
import {presets} from "@/utils/tdesign.js";
import dialog from "@/core/script/dialog.js";
import {USER_TYPE} from "@/core/config/const.js";
const userPlantList = getUserPlantList('outwork-'); //用户的工厂
const userInfo = siyi.user
const _apiUrl=api.url.outwork;

//列配置
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '工厂', width: 100, field: 'plant_name', sortable: true},
  {title: '供应商(简称)', width: 120, field: 'sup_name', sortable: true},
  {title: '供应商(代码)', width: 120, field: 'sup_code', sortable: true},
  {title: '出货单号', width: 150, field: 'packNo', sortable: true},
  {title: '型号', minWidth: 200, field: 'partNumRev', sortable: true},
  {title: '运输方式', width: 150, field: 'expressType', sortable: true,formatter:({cellValue})=>dataMap.shipping?.[cellValue] || ''},
  {title: '运输单号', width: 150, field: 'expressSn', sortable: true},
  {title: '备注', width: 100, field: 'remark', sortable: true},
  {title: '订单状态', width: 160, field: 'status', sortable: true,formatter:({row})=>{
      return vData.option['list']['status']?.[row['status']] || '';
    }},
  {title: '创建日期', width: 150, field: 'createAt', sortable: true,formatter:core.date.formatterYMDHms},
  {title: '出库日期', width: 150, field: 'sendAt', sortable: true,formatter:core.date.formatterYMDHms},
  {title: '入库日期', width: 150, field: 'receivedAt', sortable: true,formatter:core.date.formatterYMDHms},
];

const columns2=[
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '送货单号', width: 100, field: 'packNo', sortable: true},
  {title: '订单号', width: 100, field: 'sn_order', sortable: true},
  {title: '型号', width: 200, field: 'partNumRev', sortable: true},
  {title: '类型', width: 120, field: 'wo_type', sortable: true},
  {title: '产出', width: 60, field: 'qty', sortable: true},
  {title: '未加工', width: 60, field: 'qty_backout', sortable: true},
  {title: '总价', width: 60, field: 'money', sortable: true,formatter:({row})=>typeof row.price_checked==='number'?row.qty*row.price_checked:'*'},
  {title: '单价', width: 60, field: 'price_checked', sortable: true},
  {title: '单位', width: 60, field: 'unitName', sortable: true},
  {title: '状态', width: 120, field: 'status', sortable: true,formatter:({row})=>vData.option['list']['status']?.[row['status'] ] || ''},
  {title: '快递类型', width: 90, field: 'expressType', sortable: true,formatter:({cellValue})=>dataMap.shipping[cellValue] || ''},
  {title: '快递单号', width: 90, field: 'expressSn', sortable: true},
  {title: '出库时间', width: 122, field: 'sendAt', sortable: true,formatter:core.date.formatterYMDHm},
  {title: '入库时间', width: 122, field: 'receivedAt', sortable: true,formatter:core.date.formatterYMDHm},
];

//默认数据
const defaultData={
  typeList:[],
  params:{
    search: '',//搜索关键字
    type:'',//类型
    status:undefined,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
    plant_id:userPlantList?.[0]?.['value'] || '', //工厂ID,
    sup_id:userInfo.type===USER_TYPE.supplier?userInfo.erp_recid:'',//代理商ID
    time_range:presets['最近1个月'], //默认时间
  },
  modal_bind:{
    className:'editModal',
    size: "mini",
    width: '75%',
    height:'75%',
    minHeight: 800,
    maxWidth: 1440,
    position: 'center',
    loading: false,
    resize: 'resize',
  },
  modal_data:{
    formName: '',
    action: '',
    title:'',
    isReadonly: true,
    isShow: false,
    saveBtn: {bind: {content: "提交", icon: "vxe-icon-save",size:"mini"},isShow:false, click: () => {},},
    btn: {bind:{style:"margin-left:20px"}, click: () => {}},
  },
};

//页面数据
const vData = reactive({
  isSupplier:userInfo.type===USER_TYPE.supplier, // 是否是供应商
  params:{...defaultData.params},
  msg:'',
  supplierList:[],
  list:[],
  shipping:[],
  option:{list:{},log:{}},
  label:{list:[],log:{}},
});


//列表
const gridRef = ref()
const grid=reactive({
  bind:_.merge({},gridOptionsDefault, {
      id: 'siyi-pack-list',
      columns: columns,
      seqConfig: {
        seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
      },
      exportConfig: {},
    }),
  on:{
    cellClick:async ({row,columnIndex})=>{
      columnIndex>1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick:({row})=>{
      listBtn.action.click({name:'detail'},row)
    },
    zoom:({type})=>core.fullscreenSwitch(type==='max'),
  }
})

//列表批量操作
const listBtn=reactive({
  action:{
    bind:()=>{
      const options=vData.isSupplier?[{name:'supplier_out_cancel',content:'撤销出库',icon:'vxe-icon-delete'},]:[
        {name:'employee_in',content:'入库',icon:'vxe-icon-download',},
        {name:'employee_in_cancel',content:'撤销入库',icon:'vxe-icon-delete'},
      ];
      return {
        className:'list-action',
        size:"small",
        options:[
          ...options,
          {name:'edit',content:'填写运单号',icon:'vxe-icon-send'},
          {name:'print',content:'打印',icon:'vxe-icon-print'},
        ]
      }
    },
    click: async ({name}, row=null) => {
      const rows = row?[row]:listBtn.getSelectedRows();
      if (!rows?.length) return;
      switch (name) {
        case 'print':
          await printEvent.open(rows);
          break;
        case 'edit':
          await editTableEvent.open(name, rows);
          break;
        case 'exportAll':
          await detailTableEvent.exportAll(rows);
          break;
        default : {
          await detailTableEvent.open(name, rows);
        }
      }
    }
  },
  getSelectedRow: (getId = false,field='id') => {
    const res = listBtn.getSelectedRows(getId,field);
    if (res && res?.length !== 1) {
      dialog.error('请勾选一个需要操作的数据')
      return;
    }
    return res?.[0];
  },
  getSelectedRows: (getIds=false,field='id')=>{
    const selectedRows = gridRef.value.getCheckboxRecords();
    if (selectedRows===undefined || selectedRows.length === 0) {
      dialog.error('请勾选要操作的数据！')
      return
    }
    return getIds?selectedRows.map((item) => item[field]):selectedRows;
  }
})



const editModal = reactive({
  $el:{},
  bind: {...defaultData.modal_bind},
  data: {...defaultData.modal_data},
  on: {
    show: (e) => {
      editModal.$el=e.$modal.getBox();
      const modalTop = e.$modal.getPosition().top; //获取当前modal的top值
      let modalWidth=e.$modal.getBox().clientWidth;//获取当前modal的宽度
      if(typeof editModal.bind.maxWidth==='number' && modalWidth>editModal.bind.maxWidth) modalWidth=editModal.bind.width=editModal.bind.maxWidth;//最大宽度
      const leftMenuWidth=document.querySelector('.siyi .left')?.clientWidth || 60;//左侧菜单的宽度
      const windowHeight=document.documentElement.clientHeight || document.body.clientHeight;
      const windowWidth=document.documentElement.clientWidth || document.body.clientWidth;
      editModal.bind.height = (windowHeight - modalTop * 2) + 'px';//自动高度
      editModal.bind.position={left:(windowWidth-leftMenuWidth - modalWidth)/2+leftMenuWidth};//自动居中
    },
    hide: (e) => {
      editModal.bind = {...defaultData.modal_bind};
      editModal.data = {...defaultData.modal_data};
    }
  },
});



const editTableRef = ref();
const editTableEvent={
  open:(action,rows)=>{
    editTable.list = rows.map(row=>{
      return {order:row,expressType:row.expressType,expressSn:row.expressSn,remark:row.remark}
    });
    editModal.data.action=action;
    editModal.on.close=editTableEvent.close;
    editModal.data.isShow=true;
    editModal.data.saveBtn.click=editTableEvent.save;
    editModal.data.saveBtn.isShow=true;
    editModal.data.saveBtn.bind.content='保存';
    editModal.data.saveBtn.bind.icon='vxe-icon-save';
  },
  close:()=>{
    editModal.data.isShow=false;
    editModal.data.saveBtn.isShow=false;
    editTable.list = [];//重置数据
    editTable.data = {};//重置数据
  },
  save:async ()=>{
    if(await editTableEvent.validate()){
      return;
    }
    const loading =   dialog.loading(document.querySelector('.vxe-modal--box'))
    const data=await api.post(_apiUrl.pack.save,{list:editTable.list});
    loading.close();
    if(data===undefined) return ;
      dialog.success('操作成功！');
    await searchList();
    editTableEvent.close();
  },
  validate:async ()=>{
    return await editTableRef.value.validate(editTable.list);
  },
};
const editTable = reactive({
  defaultData: {},
  list:[],
  data: {},
  bind: {
    align: "center",
    editConfig: {mode: "row",trigger:"click",showStatus: true},
    editRules:{
      expressType:[{ required: true, type: 'text',message: '必须填写' }],
      expressSn:[{ required: true, type: 'text',message: '必须填写' }],
    },
  },
  on: {
    change: () => editTableEvent.validate,
    submit: editTableEvent.save,
  }
});



const detailTableRef = ref();
const detailTableEvent={
  open:async (action,rows)=>{
    const loading =   dialog.loading(document.querySelector('.vxe-modal--box'))
    const data=await api.get(_apiUrl.pack.detail,{recId:rows.map((row)=>row.recId)});
    loading.close();
    if(data===undefined) return ;
    detailTable.list = data.list;
    if(detailTable.list?.length>0){
      detailTable.bind.footerData[0] = detailTable.list.reduce((acc,item)=>{
        acc.qty+=item.qty;
        acc.qty_free+=item.qty_free;
        acc.qty_backout+=item.qty_backout;
        acc.money+=(typeof item.price_checked==='number'?item.qty*item.price_checked:0);
        return acc;
      },{qty:0,qty_free:0,qty_backout:0,money:0});
    }

    editModal.data.title=vData.option.log?.type?.[action] || '详情';
    editModal.data.action=action;
    editModal.on.close=detailTableEvent.close;
    editModal.data.isShow=true;
    if(['employee_in','supplier_out_cancel','employee_in_cancel'].includes(action)){
      editModal.data.saveBtn.click=detailTableEvent.save;
      editModal.data.saveBtn.isShow=true;
      editModal.data.saveBtn.bind.content='提交';
      editModal.data.saveBtn.bind.icon='vxe-icon-save';
    }
  },
  close:()=>{
    editModal.data.isShow=false;
    editModal.data.saveBtn.isShow=false;
    detailTable.list = [];//重置数据
  },
  save:async ()=>{
    if(await detailTableEvent.validate()){
      return;
    }
    const actionType=editModal.data.action;
    const actionTitle=vData.option.log.type?.[actionType] || '执行此操作';
    if(['supplier_out_cancel','employee_in_cancel'].includes(actionType) && !await dialog.confirmAsync('确认要'+actionTitle+'？')){
      return false;
    }
    const loading =   dialog.loading(document.querySelector('.vxe-modal--box'))
    const post_list=detailTable.list.map((item)=>{return {...item,data:item.packId+'-'+item.recId}});
    const data=await api.post(_apiUrl.order.save,{list:post_list,type:actionType});
    loading.close();
    if(data===undefined) return ;
      dialog.success('操作成功！');
    await searchList();
    detailTableEvent.close();
  },
  export:()=>{
    detailTableRef.value.openExport();
  },
  exportAll:async (rows)=>{
    console.log('rows',rows);
    const loading =   dialog.loading(gridRef.value.$el);
    const {list}=await api.get(_apiUrl.pack.detail,{recId:rows.map((row)=>row.recId)});
    loading.close();
    if(list===undefined) return ;
    core.files.exportExcel({
      data: list.map((item,i)=>({...item,seq:i+1})),
      columns: columns2,
      fileName: userInfo.name + '.出货明细',
    })
  },
  cancel:(rows,type)=>{
    grid.bind.loading=true;
    const packNo=rows.map(item=>item.packNo);
    const loading =   dialog.loading(document.querySelector('.vxe-modal--box'))
    const data = api.post(_apiUrl.pack.cancel,{type,packNo})
    loading.close();
    grid.bind.loading=false;
    console.log('data',data);
  },
  validate:async ()=>{
    return await detailTableRef.value.validate(detailTable.list);
  },
};

const detailTable = reactive({
  list:[],
  bind: {
    columns:columns2,
    align: "center",
    exportConfig:{},
    editConfig: {mode: "row",trigger:"click",showStatus: true},
    editRules:{},
    showFooter:true,
    footerData:[
      {seq:'合计',qty: 0,qty_free:0,qty_backout:0,money:0}
    ],
  }
});

//打印
const printEvent={
  open:async (rows)=>{
    const packNo= rows.map((item)=>item?.packNo);
    const loading =   dialog.loading(document.querySelector('.vxe-modal--box'))
    const data=await api.post(_apiUrl.pack.print,{paper:'A4-L',packNo});
    loading.close();
    printBox.data.html=data?.html || '';
    printBox.data.isShow=true;
  },
  print:async (e)=>{
    const iframe=document.getElementById('printIframe');
    iframe.focus();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  },
};
const printBox=reactive({
  data:{
    isShow:false,
    title:'',
    btn:[
      {bind: {content: "打印", icon: "vxe-icon-print",},isShow:true, click:printEvent.print,},
    ],
    html:'',
  },
  bind:{
    width: '21.5cm',
    height: '75%',
    position:{
      top:'center',
      left:'center',
    }
  },
  on:{
  },
});




const searchListDelay=_.debounce((e)=>{
  searchList('search',{search:e?.value});
},500)

//搜索
const searchList = async (type = 'init',param={}) => {
  vData.params={...vData.params,...param, currentPage:api.getCurrentPage(type,vData.params,vData.list.length)};
  type==='reset' && (vData.params={...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let data = await api.get(_apiUrl.pack.list, vData.params);
  vData.msg = '没有搜索到数据！'
  if(data===undefined) return ;
  vData.list = _.cloneDeep(data.list);
  vData.option={...vData.option,...data?.option};
  vData.label=getAllOptionLabel(vData.option);
}



// 首次挂载
onMounted(() => {
  vData.shipping=getOptionLabel(dataMap.shipping);
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
.siyi-pack-list {
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

  .avatar{
    width: 30px;
    border-radius: 50%;
  }

}
</style>