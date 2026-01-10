<template>
  <div class="siyi-order-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button  icon="vxe-icon-eye-fill" content="查看"  @click="listBtn.action.click({name:'detail'})"/>
        <vxe-button-group v-bind="listBtn.action.bind()" @click="listBtn.action.click"   />
        <vxe-button  icon="vxe-icon-cloud-upload" content="导出本页"  @click="gridRef.openExport()"/>

<!--        <span style="margin:0 0 0 20px">筛选：</span>-->

        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small"  clearable style="width: 100px"
                    @change="searchList('init')" :options="userPlantList">
        </vxe-select>

        <vxe-select v-show="!vData.isSupplier" v-model="vData.params.sup_id" placeholder="供应商" size="small" clearable filterable remote style="width: 140px"
                    :remoteMethod="async ({searchValue})=>{vData.supplierList=await api.supplierSelector(searchValue)}"  :options="vData.supplierList"
          @change="searchList"
        />

<!--        <vxe-select v-model="vData.params.type" placeholder="采购类型" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.label.list.type">
        </vxe-select>-->

        <vxe-select v-model="vData.params.status" placeholder="订单状态" size="small" clearable style="width: 110px"
                    @change="searchList('init')" :options="vData.label.list2.status">
        </vxe-select>
        <vxe-select v-model="vData.params.check_status" placeholder="价格确认" size="small" clearable style="width: 130px"
                    @change="searchList('init')">
          <vxe-option :value="1" label="供应商：待确认价格" />
          <vxe-option :value="2" label="供应商：已确认价格" />
          <vxe-option :value="3" label="采购方：已确认价格" />
        </vxe-select>

        <t-date-range-picker v-model="vData.params.time_range" enable-time-picker allow-input clearable style="width: 320px;"
          format="YYYY-MM-DD HH:mm" :presets="date.list().month" @change="searchList('init')"  @confirm="searchList('init')" title="采购时间" />


        <vxe-input type="search" v-model="vData.params.search" placeholder="搜索"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 145px;" />

        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>

      </template>
      <template #empty><span><img :src="noData"><p>{{ vData.msg }}</p></span></template>
    </vxe-grid>


    <!-- 详情弹窗 -->
    <vxe-modal  v-model="detailModal.data.isShow" v-bind="detailModal.bind" v-on="detailModal.on">
      <template #title>
        <span style="margin-left:10px;margin-right:30px">{{detailModal.data.title}}</span>
        <vxe-button v-for="btn in detailModal.data.btn" v-bind="btn.bind" @click="btn.click"/>
        <vxe-button-group v-bind="listBtn.action.bind()" @click="listBtn.action.click" v-show="detailTable.data.type==='detail'"  />
      </template>
      <template #default>
          <div class="detail-list" style="height: 40%;overflow-y: scroll">
            <vxe-table ref="detailTableRef" v-bind="detailTable.bind" v-on="detailTable.on" :data="detailTable.list">
              <vxe-column type="seq" width="70" />
              <vxe-column field="order.partNum" title="型号" width="150" />
              <vxe-column field="order.partRev" title="版本" width="60"/>
<!--              <vxe-column field="order.innerLayer" title="子层" width="60" :formatter="({cellValue})=>cellValue?'是':'否'"/>-->
              <vxe-column field="order.wo_type" title="订单类型" width="120" :formatter="({row})=>{
              return row['order']['wo_type'] || vData.option['list']['type']?.[row['order']['type']] || '';
            }" />

              <vxe-column field="order.status" title="订单状态" width="140" :formatter="({row})=>{
              return  vData.option['list2']['status']?.[row['order']['status'] ] || '待确认'
            }"/>
              <vxe-column field="order.check_status" title="价格确认" width="140" :formatter="({row})=>{
              return  vData.option['list2']['check_status']?.[row['order']['check_status'] ] || ''
            }"/>

              <vxe-column field="unitName" title="单位" width="60" />
              <vxe-column field="order.qty_order" title="外发数量" width="100" />

              <vxe-column field="order.qty_checked" title="已确认数量" width="80"  :visible="!['supplier_check'].includes(detailTable.data.type)"/>
              <vxe-column field="price_tips" title="预估价格" width="80"  :visible="['detail','supplier_check2','employee_check'].includes(detailTable.data.type)"/>
              <vxe-column field="order.price_checked" title="已确认单价" width="80"  :visible="['detail','supplier_check2','employee_check'].includes(detailTable.data.type)"/>

              <vxe-column field="qty" title="数量" width="120" :visible="['supplier_check','supplier_out','employee_in'].includes(detailTable.data.type)"
                          :edit-render="{ name: 'input', attrs: {readonly:detailTable.data.type==='supplier_check', type: 'number',controls:false,min:1,step:1} }" />
<!--              <vxe-column field="qty_free" title="赠品数量"  width="120" :visible="['supplier_out','employee_in'].includes(detailTable.data.type)"
                          :edit-render="{ name: 'input', attrs: { type: 'number',controls:false,min:0,step:1} }" />-->
              <vxe-column field="qty_backout" title="未加工数量"  width="120" :visible="['supplier_out','employee_in'].includes(detailTable.data.type)"
                          :edit-render="{ name: 'input', attrs: { type: 'number',controls:false,min:0,step:1,digits:4} }" />
              <vxe-column field="price" title="单价(元)"  width="100" :visible="['supplier_check2'].includes(detailTable.data.type)"
                          :edit-render="{ name: 'input', attrs: { type: 'number',controls:false,min:0.01,step:0.01} }" />

              <vxe-column field="remark" title="备注"  min-width="80" :edit-render="{ name: 'input' }" />

              <vxe-column field="order.qty_output" title="已出库(产出)" width="100" :visible="['','supplier_out','employee_in'].includes(detailTable.data.type)"/>
              <vxe-column field="order.qty_backout" title="已出库(未加工)" width="120" :visible="['','supplier_out','employee_in'].includes(detailTable.data.type)"/>
<!--              <vxe-column field="order.qty_free_output" title="已出库(赠品)" width="100" :visible="vData.isSupplier && ['','supplier_out','employee_in'].includes(detailTable.data.type)"/>-->

              <vxe-column field="order.qty_sending" title="运输中(产出)" width="100" :visible="['','supplier_out','employee_in'].includes(detailTable.data.type)"/>
              <vxe-column field="order.qty_backout_sending" title="运输中(未加工)" width="120" :visible="['','supplier_out','employee_in'].includes(detailTable.data.type)"/>
<!--              <vxe-column field="order.qty_free_sending" title="运输中（赠品）" width="100" :visible="['','supplier_out','employee_in'].includes(detailTable.data.type)"/>-->

              <vxe-column field="order.qty_received" title="已入库(产出)" width="100" :visible="!vData.isSupplier && ['','employee_in'].includes(detailTable.data.type)"/>
              <vxe-column field="order.qty_backout_received" title="已入库（未加工）" width="120" :visible="!vData.isSupplier && ['','employee_in'].includes(detailTable.data.type)"/>
<!--              <vxe-column field="order.qty_received" title="已入库（赠品）" width="100" :visible="!vData.isSupplier && ['','employee_in'].includes(detailTable.data.type)"/>-->


          </vxe-table>
          </div>

          <vxe-tabs class="detail2-list" style="height: 60%;overflow-y: scroll" @change="detailEvent2.getDetail">

            <vxe-tab-pane title="操作记录" name="log">
              <vxe-grid v-bind="detailTable2.bind" v-on="detailTable2.on" :data="detailTable2.data.list">
                <template #toolbar_buttons></template>
              </vxe-grid>
            </vxe-tab-pane>

            <vxe-tab-pane title="MI参数" name="detail">

              <t-list :split="true" size="small">
                <p class="mi-title">基本信息</p>
                <t-list-item class="mi-list">
                  <div class="mi-list-detail"><span>【型号】：{{ detailTable2.data.order.partNum }}{{ detailTable2.data.order.partRev }}</span>
                    <div v-for="(value,key) in detailTable2.data.miInfo.base" ><span>【{{key}}】:</span> <span v-html="value"></span></div>
                  </div>
                </t-list-item>
                <p class="mi-title">工序参数</p>
                <t-list-item class="mi-list">
                  <div class="mi-list-item"><span>部件</span></div>
                  <div class="mi-list-item"><span>工序</span></div>
                  <div class="mi-list-item"><span>参数</span></div>
                </t-list-item>
                <t-list-item v-for="pros in detailTable2.data.miInfo.process" class="mi-list">
                  <div class="mi-list-item"> <span >{{pros.mfgPartName}}</span></div>
                  <div class="mi-list-item"> <span >({{pros.seq}}) {{pros.processName}}</span></div>
                  <div class="mi-list-detail"> <span v-for="param in pros.params" v-html="param"></span></div>
                </t-list-item>
              </t-list>

              <div v-for="drill in detailTable2.data.miInfo.drill">
                <p class="mi-title">钻带：{{drill['钻带名']}}</p>
                <vxe-table  :data="drill.data">
                  <vxe-column field="刀序" title="刀序"></vxe-column>
                  <vxe-column field="孔径" title="孔径"></vxe-column>
                  <vxe-column field="槽长" title="槽长"></vxe-column>
                  <vxe-column field="SET孔数" title="SET孔数"></vxe-column>
                  <vxe-column field="成品孔径" title="成品孔径"></vxe-column>
                  <vxe-column field="公差" title="公差"></vxe-column>
                  <vxe-column field="PNLA孔数" title="PNLA孔数"></vxe-column>
                  <vxe-column field="PNLB孔数" title="PNLB孔数"></vxe-column>
                  <vxe-column field="备注" title="备注"></vxe-column>
                </vxe-table>
              </div>

              <div class="mi-images">
                <t-image-viewer  v-for="(item,index) in detailTable2.data.miInfo.images" :key="item.name"   :closeOnOverlay="true"
                     :visible="vData.image===item.url" :default-index="index" :images="vData.images"  @close="()=>vData.image=''">
                  <template #trigger>
                    <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                      <img alt="test" :src="item.url" class="tdesign-demo-image-viewer__ui-image--img" />
                      <div class="tdesign-demo-image-viewer__ui-image--hover"   @click="()=>vData.image=item.url" >
                        <span>{{item.name}}</span>
                      </div>
                    </div>
                  </template>
                </t-image-viewer>
              </div>


            </vxe-tab-pane>

            <vxe-tab-pane title="工程文件" name="file">
              <t-tooltip :content="fileModal.data.title" >
                <t-tree expandAll v-model="fileModal.data.checked"  v-bind="fileModal.bind" :data="fileModal.data.tree"/>
              </t-tooltip>
            </vxe-tab-pane>
            <vxe-tab-pane title="订单明细" name="price"  v-show="['detail','supplier_check2','employee_check'].includes(detailTable.data.type)">
              <t-list :split="true" size="small">
                <p class="mi-title">订单信息</p>
                <t-list-item class="order-price">
                  <div class="mi-list-detail">
                    <div v-for="(value,key) in detailTable2.data.price.order" ><span>【{{detailTable2.data.price.fields[key]}}】:</span> <span v-html="value"></span></div>
                  </div>
                </t-list-item>
                <p class="mi-title">价格信息</p>
                <t-list-item class="order-price">
                  <div class="mi-list-detail" v-show="detailTable2.data.price.price">
                    <div v-for="(value,key) in detailTable2.data.price.price" ><span>【{{detailTable2.data.price.fields[key]}}】:</span> <span v-html="value"></span></div>
                  </div>
                </t-list-item>
              </t-list>
            </vxe-tab-pane>

          </vxe-tabs>
      </template>
    </vxe-modal>


    <!-- 文件弹窗 -->
    <vxe-modal ref="fileModalRef"  v-model="fileModal.data.isShow" v-bind="fileModal.bind" v-on="fileModal.on">
      <template #title>
        <span style="margin-right: 20px">{{fileModal.data.title}}</span>
        <vxe-button v-for="btn in fileModal.data.btn" v-bind="btn.bind" @click="btn.click"/>
      </template>
      <template #default>
        <t-tree expandAll v-model="fileModal.data.checked"  v-bind="fileModal.bind" :data="fileModal.data.tree"/>
      </template>
    </vxe-modal>


    <!-- 打印弹窗 -->
    <vxe-modal  v-model="printModal.data.isShow" v-bind="printModal.bind" v-on="printModal.on">
      <template #title>
        <span style="margin-right: 20px">{{printModal.data.title}}</span>
        <vxe-button v-for="btn in printModal.data.btn" v-bind="btn.bind" @click="btn.click"/>
      </template>
      <template #default>
        <iframe id="printIframe"  :srcdoc="printModal.data.html" style="border: 0;width:21cm;height: 95%;"></iframe>
      </template>
    </vxe-modal>





  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import siyi from '@/core/script/siyi.js'
import {date, fullscreenSwitch} from "@/core/script/core"
import * as api from "@/core/script/api"
import noData from '@/core/assets/img/nodata.gif'

import {gridOptions as gridOptionsDefault} from '@/config/vxeTable'
import _ from "lodash";
import {getAllOptionLabel} from "@/utils/vars.js";
import {downloadAndCompress, pathFormat} from "@/utils/file.js";
import {getUserPlantList} from "@/utils/erp.js";
import {presets} from "@/utils/tdesign.js";
import dialog from "@/core/script/dialog.js";
import {USER_TYPE} from "@/core/config/const.js";

const userPlantList = getUserPlantList('outwork-'); //用户的工厂
const _apiUrl=api.url.outwork;
const userInfo = siyi.user
//主列表字段
const columns=[
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '工厂', width: 80, field: 'plant_name', sortable: true},
  {title: '供应商(简称)', width: 120, field: 'sup_name', sortable: true},
  {title: '供应商(代码)', width: 120, field: 'sup_code', sortable: true,visible: false},
  {title: '型号', width: 160, field: 'partNum', sortable: true},
  {title: '版本', width: 70, field: 'partRev', sortable: true},
  {title: '订单状态', width: 160, field: 'status', sortable: true,formatter:({row})=>{
    return vData.option['list2']['status']?.[row['status']] || '供应商：待确认数量';
   }},
  {title: '价格确认', width: 160, field: 'check_status', sortable: true,formatter:({row})=>{
      return vData.option['list2']['check_status']?.[row['check_status']] || '';
    }},
  {title: '采购单号', width: 120, field: 'sn_order', sortable: true},
  // {title: '订单类型', minWidth: 150, field: 'wo_type', sortable: true,formatter:({row,cellValue})=>{
  //     return cellValue || vData.option['list']['type']?.[row['order']['type']] || '';
  //   }},
  {title: '订单类型', minWidth: 100, field: 'type',sortable: true,visible:false,formatter:({row})=>{
      return (vData.option['list']['type']?.[row['type']] || '') ;
  }},
  {title: '子层外协', minWidth: 100, field: 'innerLayer', sortable: true,visible:false,formatter:({cellValue})=>cellValue?'是':''},
  {title: '工艺类型', minWidth: 100, field: 'wo_type', sortable: true,visible:false},
  {title: '开始工艺', minWidth: 100, field: 'process_name', sortable: true,visible:false},
  {title: '结束工艺', minWidth: 100, field: 'process_name2', sortable: true,visible:false},

  {title: '外发日期', width: 120, field: 'date_order', sortable: true,formatter:date.formatterYMD},

  {title: '外发数量', width: 100, field: 'qty_order_str', sortable: true,formatter:({row})=>{
    return row['qty_order']+" "+row['unitName'];
  }},
  {title: '外发数量', width: 100, field: 'qty_order', sortable: true,visible:false},
  {title: '外发单位', width: 100, field: 'unitName', sortable: true,visible:false},

  {title: '已确认数量', width: 100, field: 'qty_checked', sortable: true,visible:false},
  {title: '已确认单价', width: 100, field: 'price_checked', sortable: true,visible:false},

  {title: '已出库(产出)', width: 120, field: 'qty_output', sortable: true},
  {title: '已出库(未加工)', width: 140, field: 'qty_backout', sortable: true},
  // {title: '已出库赠品', width: 100, field: 'qty_free_output', sortable: true,visible:false},

  {title: '运输中(产出)', width: 120, field: 'qty_sending', sortable: true},
  {title: '运输中(未加工)', width: 140, field: 'qty_backout_sending', sortable: true},
  // {title: '运输中赠品', width: 100, field: 'qty_free_sending', sortable: true,visible:false},

  {title: '已入库(产出)', width: 120, field: 'qty_received', sortable: true},
  {title: '已入库(未加工)', width: 140, field: 'qty_backout_received', sortable: true},
  // {title: '已入库赠品', width: 100, field: 'qty_free_received', sortable: true,visible:false},

];
//详情表格
const columns2=[];
//日志字段
const columns3=[
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '工厂', width: 100, field: 'plant_name', sortable: true,visible:false},
  {title: '供应商(简称)', width: 120, field: 'sup_name', sortable: true,visible:false},
  {title: '供应商(代码)', width: 120, field: 'sup_code', sortable: true,visible:false},
  {title: '型号', width: 150, field: 'partNum', sortable: true},
  {title: '版本', width: 70, field: 'partRev', sortable: true},
  {title: '外协单号', width: 120, field: 'sn_order', sortable: true},
  {title: '外协工艺', width: 150, field: 'wo_type', sortable: true,visible:false},
  {title: '开始工艺', width: 100, field: 'process_name', sortable: true,visible: false},
  {title: '结束工艺', width: 100, field: 'process_name2', sortable: true,visible: false},
  {title: '操作类型', width: 120, field: 'type', sortable: true,formatter:({row})=>{
      return vData.option.log['type']?.[row['type']] || '';
    }},
  {title: '内容', minWidth: 200, field: 'description', sortable: true},
  {title: '备注', minWidth: 80, field: 'remark', sortable: true},
  {title: '操作人', width: 100, field: '_text.createUid', sortable: true},
  {title: '流水号', width: 140, field: 'serialNo', sortable: true},
  {title: '日期', width: 150, field: 'createAt', sortable: true,formatter:date.formatterYMDHms},
];

//默认数据
const defaultData={
  typeList:[],
  params:{
    search: '',//搜索关键字
    type:'',//类型
    check_status:null,//状态
    status:null,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    sup_id:null,//代理商ID
    time_range:presets['最近7天'], //默认时间
  }
};

//页面数据
const vData = reactive({
  params:{...defaultData.params},
  msg:'',
  supplierList:[],
  list:[],
  option:{list:{},list2:{},log:{}},
  label:{list:[],list2:[],log:[]},
  isSupplier:userInfo.type===USER_TYPE.supplier,
  image:'',
  images:[],
});


//主表格
const gridRef = ref()
const grid=reactive({
  bind: _.merge({}, gridOptionsDefault, {
        id: 'siyi-order-list',
        columns: columns,
        seqConfig: {
          seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
        },
        exportConfig: {},
        toolbarConfig: {export: false}
      }
  ),
  on:{
    cellClick:async ({row,columnIndex})=>{
      columnIndex>1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick:({row})=>{
      listBtn.action.click({name:'detail'},row)
      gridRef.value.setCheckboxRow([row],true);
    },
    zoom:({type})=>fullscreenSwitch(type==='max'),
  }
})

//列表批量操作
const listBtn=reactive({
  action:{
    bind:()=>{
      const _status=typeof vData.params.status==='number'?vData.params.status:-1; //订单状态
      const _checkStatus=typeof vData.params.check_status==='number' ?vData.params.check_status:-1; //确认状态
      const options=[
        {name:'export_bill',content:'下载对账单',icon:'vxe-icon-cloud-upload',disabled:_status===0},
      ];
      return {
        className:'list-action',
        size:"mini",
        options:vData.isSupplier?[
          {name:'supplier_check',content:'确认数量',icon:'vxe-icon-check',disabled:_status>1},
          {name:'supplier_check2',content:'确认价格',icon:'vxe-icon-rmb',disabled:_status===0 ||_checkStatus>2},
          {name:'supplier_out',content:'订单出库',icon:'vxe-icon-upload',disabled:_status<1 && _status!==-1},
          {name:'export_mi',content:'下载MI',icon:'vxe-icon-cloud-upload',disabled:_status===0},
          {name:'file',content:'工程文件',icon:'vxe-icon-cloud-upload',disabled:_status===0},
            ...options
        ]:[
          {name:'employee_check',content:'确认价格',icon:'vxe-icon-success-circle',disabled:_status===0 || _checkStatus===0 || _checkStatus===1 },
          {name:'file',content:'工程文件',icon:'vxe-icon-cloud-upload'},
          {name:'export_mi',content:'下载MI',icon:'vxe-icon-cloud-upload'},
          {name:'erp_mi',content:'MI',icon:'vxe-icon-print'},
          {name:'erp_osp',content:'采购单',icon:'vxe-icon-print'},
          ...options
        ],
      }
    },
    click: async ({name}) => {
      const rows = listBtn.getSelectedRows();
      if(!rows?.length) return ;
      switch (name) {
        case 'file':
          if(rows.length>20) return dialog.warning('一次性最多可以获取20条');
          await fileEvent.open(rows);
          break;
        case 'print':
          await printEvent.open(rows);
          break;
        case 'detail':
          await detailEvent.getDetail(rows);
          break;
        case 'export_mi':
          await detailEvent.exportMi(rows);
          break;
        case 'export_bill':
          await detailEvent.exportBill(rows);
          break
        case 'erp_mi':
          const container =document.querySelector('.vxe-modal--box');
          const loading= dialog.loading(container.offsetTop?container:gridRef.value.$el,'获取数据中...');
          rows.filter((value, index, self) =>
              index === self.findIndex((t) => (t.jobId === value.jobId))
          ).map(async (row)=>{
            await api.getErpPdf('mi',{id:row.jobId});
            loading.close();
          })
          break;
        case 'erp_osp':
          const modalBox =document.querySelector('.vxe-modal--box');
          const loading2= dialog.loading(modalBox.offsetTop?modalBox:gridRef.value.$el,'获取数据中...',);
          rows.filter((value, index, self) =>
              index === self.findIndex((t) => (t.sn_order === value.sn_order))
          ).map(async (row)=>{
            await api.getErpPdf('osp',{sn:row.sn_order});
            loading2.close();
          })
          break;
        default:
          await detailEvent.edit(rows,name);
      }
    }
  },
  getSelectedRow: (idField = null) => {
    const res = listBtn.getSelectedRows(idField);
    if (res && res?.length !== 1) {
      dialog.warning('请勾选一个需要操作的数据')
      return;
    }
    return res?.[0];
  },
  getSelectedRows: (idField=null)=>{
    const selectedRows = gridRef.value.getCheckboxRecords();
    if (selectedRows===undefined || selectedRows.length === 0) {
      dialog.warning('请勾选要操作的数据！')
      return
    }
    return idField?selectedRows.map((item) => item[idField]):selectedRows;
  }
})




//详情弹窗
const detailModal = reactive({
  $el:{},
  bind: {
    size: "mini",
    width: '85%',
    height:'85%',
    minHeight: 800,
    maxWidth: 1400,
    position: 'center',
    loading: false,
    resize: 'resize',
  },
  data: {
    isShow:false,
    title: '',
    btn: [],
  },
  on: {
    show: (e) => {
      detailModal.$el=e.$modal.getBox();
      const modalTop = e.$modal.getPosition().top; //获取当前modal的top值
      let modalWidth=e.$modal.getBox().clientWidth;//获取当前modal的宽度
      if(typeof detailModal.bind.maxWidth==='number' && modalWidth>detailModal.bind.maxWidth){
        modalWidth=detailModal.bind.width=detailModal.bind.maxWidth;//最大宽度
      }
      const leftMenuWidth=document.querySelector('.siyi .left')?.clientWidth || 60;//左侧菜单的宽度
      const windowHeight=document.documentElement.clientHeight || document.body.clientHeight;
      const windowWidth=document.documentElement.clientWidth || document.body.clientWidth;
      detailModal.bind.height = (windowHeight - modalTop * 2) + 'px';//自动高度
      detailModal.bind.position={left:(windowWidth-leftMenuWidth - modalWidth)/2+leftMenuWidth};//自动居中
    },
    close:(e)=>{
      detailModal.data.isShow=false;
      detailTable.list = [];//重置数据
      detailTable.data = {};//重置数据
    },
    hide: (e) => {
    }
  },
});

//详情列表
const detailTableRef = ref();
const detailEvent={
  getDetail:async (rows) => {
    detailTable.list = rows.map(row => {
      return {order: row, ...row, ...detailTable.data, poItemId: row.poItemId,unitName:row.unitName};
    });
    detailTable.data.type='detail';
    detailModal.data.isShow = true;
    detailModal.data.title = '查看';
    detailModal.data.btn = [];
    detailTable.bind.editConfig.enabled = false;
    setTimeout(async ()=>await detailEvent.getDetail2(rows[0]))
  },
  getDetail2:async (row)=>{
    detailTable2.data.row=row;
    await detailEvent2.getDetail();
  },
  exportBill:async (rows)=>{
    const container =document.querySelector('.vxe-modal--box');
    const loading= dialog.loading(container.offsetTop?container:gridRef.value.$el,'获取数据中...');
    const poItemId=rows.map(item=>item.poItemId);
    const data=await api.post(_apiUrl.order.bill,{poItemId});
    if(!data?.files?.length) {
      loading.close();
      return ;
    }
    loading.update({content:"开始下载..."});
    const zipName=(data.files.length<5?data.files.map(item=>item.name).join('_'):"账单批量下载")+"("+data.files.length+'个)'+date.time()+'.zip';
    downloadAndCompress(data.files,zipName,{
      download:(item,index,amount)=>{
        const percent=Math.ceil((index/amount)*100);
        loading.update({content:`[${percent}%] 正在下载 <${item.name}>，请勿关闭页面 ~ `});
      },
      downloadAll: ({zipName}) => {
        loading.update({content:'正在打包文件'+zipName+'，请勿关闭页面 ~ '});
      }, finish: () => {
        loading.close();
      }
    },{saveTree:0});
  },
  exportMi:async (rows)=>{
    const container =document.querySelector('.vxe-modal--box');
    const loading= dialog.loading(container.offsetTop?container:gridRef.value.$el,'获取数据中...');
    const poItemId=rows.map(item=>item.poItemId);
    const data=await api.post(_apiUrl.order.mi,{poItemId});
    if(!data?.files?.length) {
      loading.close();
      return ;
    }
    loading.update({content:"开始下载..."});
    const zipName=(data.files.length<5?data.files.map(item=>item.name).join('_'):"MI批量下载")+"("+data.files.length+'个)'+date.time()+'.zip';
    downloadAndCompress(data.files,zipName,{
      download:(item,index,amount)=>{
        const percent=Math.ceil((index/amount)*100);
        loading.update({content:`[${percent}%] 正在下载 <${item.name}>，请勿关闭页面 ~ `});
      },
      downloadAll: ({zipName}) => {
        loading.update({content:'正在打包文件'+zipName+'，请勿关闭页面 ~ '});
      }, finish: () => {
        loading.close();
      }
    },{saveTree:1});

  },
  edit:(rows,type)=>{
    detailTable.list = rows.map(row=>{
      row['qty_order']=row['qty_order'];
      const qtyData={
        supplier_check:{qty:row['qty_order'],qty_free:0,qty_backout:0},//供应商确认时，取订单数量
        supplier_out:{
          qty:row['qty_checked']-row['qty_output']-row['qty_backout'],
          qty_free:row['qty_free_checked']-row['qty_free_output']-row['qty_backout'],
          qty_backout:0
        },//供应商出库，取确认数量-已出库数量
        employee_in:{qty:row['qty_sending'],qty_free:row['qty_free_sending'],qty_backout:row['qty_backout_sending']},//工厂入库，取装运数量
      };
      return {order:row,...detailTable.defaultData,...detailTable.data,
        unitId:row.unitId_order,
        unitName:row.unitName,
        poItemId:row.poItemId,
        qty:qtyData[type]?.qty || 0,
        qty_free:qtyData[type]?.qty_free || 0,
        qty_backout:qtyData[type]?.qty_backout || 0,
        price:row?.['price_checked'] || 0,
        type,
      };
    });
    detailModal.data.btn=[
      {
        bind: {content: '提交', icon: "vxe-icon-save",},
        click: detailEvent.save
      }
    ];
    detailModal.data.title = vData.option.log['type']?.[type];
    detailTable.data.type=type;
    detailModal.data.isShow=true;
    detailTable.bind.editConfig.enabled=true;
    setTimeout(async ()=>await detailEvent.getDetail2(rows[0]))
  },
  save:async ()=>{
    if(await detailEvent.validate()){
      return;
    }
    const loading =  dialog.loading(document.querySelector('.vxe-modal--box'))
    const data=await api.post(_apiUrl.order.save,{list:detailTable.list,type:detailTable.data.type});
    loading.close();
    if(data===undefined) return ;
      dialog.success('操作成功！');
    if(detailTable.data.type==='supplier_out'){
      //装运成功，打印送货单
      await printEvent.open(detailTable.list.map(item=>{return {serialNo:data.serialNo}}));
    }
    await searchList();
    detailModal.on.close();
  },
  validate:async ()=>{
    return await detailTableRef.value.validate(detailTable.list);
  },
}
const detailTable = reactive({
  defaultData: {qty:"",qty_free:"",qty_backout:'',price:"", remark:'',type:"",unitId_order:0,unitName:''},
  list:[],
  data: {qty:"",qty_free:"",qty_backout:'',price:"", remark:'',type:"",unitId_order:0,unitName:''},
  bind: {
    align: "center",
    editConfig: {mode: "row", trigger: "click", showStatus: true},
    editRules: {
      qty: [{required: true, type: 'number', min: 1, message: '必须填写,且≥1'}],
      qty_free: [{required: false, type: 'number', min: 0, message: '必须填写,且≥0'}],
      qty_backout: [{required: false, type: 'number', min: 0, message: '必须填写,且≥0'}],
      price: [{required: true, type: 'number', min: 0.01, message: '必须填写,且≥0.01'}],
    },
    radioConfig: {highlight: true,}
  },
  on: {
    change: () => detailEvent.validate,
    submit: detailEvent.save,
    cellClick:(e)=>{
      detailTableRef.value.setRadioRow(e.row);
      detailEvent.getDetail2(e.row);
    }
  }
});


//详情
const detailEvent2={
  getDetail:async (e)=>{
    const type = e?.name || detailTable2.data.type || 'log';
    const poItemId=detailTable2.data.row.poItemId;
    if(type===detailTable2.data.type && poItemId===detailTable2.data.poItemId){
      // 无变化
      return ;
    }
    if(type==='file'){
      return await fileEvent.open([detailTable2.data.row]);
    }
    const urlList={'log':_apiUrl.log.list,'price':_apiUrl.order.price,'detail': _apiUrl.order.detail};
    const param = {poItemId};
    const loading =   dialog.loading(document.querySelector('.detail2-list'))
    const data = await api.get(urlList?.[type] || urlList.detail, param);
    loading.close();
    detailTable2.bind.columns = type === 'log' ? columns3 : columns2;
    if (type==='price'){
      const orderIndex=detailTable.list.findIndex(item=>item.poItemId===poItemId);
      const orderPriceReal4=_.round(data?.price?.price?.orderPriceReal || 0,4);
      detailTable.list[orderIndex]['price_tips']=orderPriceReal4;
      if (detailTable.list[orderIndex]['price']===0){
        detailTable.list[orderIndex]['price']=orderPriceReal4;
      }
    }
    detailTable2.data = {...detailTable2.data, ...data,type,poItemId};
    vData.images=detailTable2.data.miInfo.images.map(item=>item.url);
  }
};
const detailTable2=reactive({
  data:{list:[],poItemId:null,type:'',row:{},processList:[],order:{},miInfo:{base:{},process:[],drill:[],images:[]},price:{}},
  bind:{
    ...gridOptionsDefault,
    autoResize:false,
    toolbarConfig:{
      enabled:false
    },
    id: 'siyi-detail-list2',
    columns: columns2
  },
  on:{

  },
});


const fileEvent={
  open:async (rows)=>{
    const container =document.querySelector('.vxe-modal--box');
    const loading= dialog.loading(container.offsetTop?container:gridRef.value.$el,'正在获取文件列表，请勿关闭页面 ~ ');
    let files=[];
    let zipName='';
    let jobNames=[];
    for (let i = 0; i < rows.length; i++) {
      const row=rows[i];
      if(vData.isSupplier && row['qty_checked']<1){
        dialog.warning('确认数量后才可以下载！');
        loading.close();
        return ;
      }
      const jobName=row?.['partNumRev'] || (row['partNum'] + "_" + row['partRev']);
      jobNames.push(jobName);
      rows.length===1 && (zipName=jobName);//如果只下载一个型号,则直接以jobName命名
      const _files=await fileEvent.getFiles({poi_id: row.poItemId},jobName===zipName?'':jobName);
      if(!Array.isArray(_files)){
        loading.close();
        return ;
      }
      files= [...files,..._files];
    }
    loading.close();
    if(files.length<1){
      dialog.warning('没有可下载的文件！');
      return ;
    }
    fileModal.data.list=_.orderBy(files,['isDir','dir','name'],['desc','asc','asc']);
    fileModal.data.tree=fileEvent.convertToTree(fileModal.data.list,'');
    fileModal.data.zipName=zipName;
    fileModal.data.title=jobNames.length>5?'批量下载':jobNames.join(',');
    fileModal.bind.height='80%';
    fileModal.data.isShow=true;
    fileModal.on.close=fileEvent.close;
  },
  getFiles:async (param,dirParent='')=>{
    const {files,logId} = await api.get(_apiUrl.order.file,param) || {};
    if (!Array.isArray(files)) return ;
    return files.map((file,index)=>{return {
      ...file,
      index,
      logId:logId,
      dir:pathFormat(dirParent+'/'+file.dir),
      path:pathFormat(dirParent+'/'+file.dir+'/'+file.name),
    }})
  },
  convertToTree(files) {
    // 辅助函数：确保目录在树中存在
    function ensureDir(dirPath, parent) {
      return dirPath.split("/").reduce((currentDir, part) => {
        let dir = currentDir.children.find(child =>
            child.isDir && child.name === part
        );

        if (!dir) {
          dir = {
            isDir: true,
            name: part,
            children: []
          };
          currentDir.children.push(dir);
        }

        return dir;
      }, parent);
    }

    // 初始化树的根节点
    const root = { isDir: true, name: "root", children: [] };

    // 遍历文件并构建树结构
    files.forEach(file => {
      // 获取父目录路径并添加文件
      const parentDir = ensureDir(file.dir, root);
      parentDir.children.push({
        ...file,
        isDir: false
      });
    });

    // 直接返回根节点的子节点
    return root.children;
  },

  record: async (files) => {
    let logs = {};
    files.forEach((file) => {
      logs[file.logId] = logs?.[file.logId] || [];
      logs[file.logId].push(file.dir+'/'+file.name);
    })
    return await api.post(_apiUrl.order.file, logs);
  },
  download:()=>{
    const list=[...fileModal.data.list];
    const files=list.filter(item=>fileModal.data.checked.includes(item.path) && item.isDir===0);
    const zipName=fileModal.data.zipName;
    if(files.length===0){
      dialog.warning('请选择文件！');
      return ;
    }
    const loading= dialog.loading(fileModal.$el,'开始下载...');
    downloadAndCompress(files,zipName,{
      download:(item,index,amount)=>{
        const percent=Math.ceil((index/amount)*100);
        loading.update(`[${percent}%] 正在下载 <${item.name}>，请勿关闭页面 ~ `);
      },
      downloadAll: ({zipName}) => {
        loading.update({content:'正在打包文件'+zipName+'，请勿关闭页面 ~ '});
      }, finish: () => {
        fileEvent.record(files);
        loading.close();
      }
    });
  },
  close:()=>{
    fileModal.data.isShow=false;
  },
};

const fileModalRef=ref();
//文件弹窗
const fileModal =  reactive({
  $el:{},
  data: {
    isShow: false,
    list: [], tree: [], checked: [], zipName: '',
    btn: [{bind: {content: "下载", icon: "vxe-icon-cloud-upload",}, click: fileEvent.download},]
  },
  bind:{
    size: "mini",
    width: '85%',
    height:'85%',
    minHeight: 800,
    maxWidth: 1440,
    position: 'center',
    loading: false,
    resize: 'resize',
    titleWidth: 120,
    titleAlign: "right",
    valueMode:'all',
    checkable:true,
    line:true,
    hover:true,
    keys:{label:"name",value:"path",children:"children"},
  },
  on: {
    show: (e) => {
      fileModal.$el=e.$modal.getBox();
      const modalTop = e.$modal.getPosition().top; //获取当前modal的top值
      let modalWidth=e.$modal.getBox().clientWidth;//获取当前modal的宽度
      if(typeof fileModal.bind.maxWidth==='number' && modalWidth>fileModal.bind.maxWidth){
        modalWidth=fileModal.bind.width=fileModal.bind.maxWidth;//最大宽度
      }
      const leftMenuWidth=document.querySelector('.siyi .left')?.clientWidth || 60;//左侧菜单的宽度
      const windowHeight=document.documentElement.clientHeight || document.body.clientHeight;
      const windowWidth=document.documentElement.clientWidth || document.body.clientWidth;
      fileModal.bind.height = (windowHeight - modalTop * 2) + 'px';//自动高度
      fileModal.bind.position={left:(windowWidth-leftMenuWidth - modalWidth)/2+leftMenuWidth};//自动居中
    }
  }
});





//打印
const printEvent={
  open:async (rows)=>{
    printModal.data.isShow=true;
    const loading = dialog.loading(document.querySelector('.vxe-modal--box'))
    const data=await api.post(_apiUrl.pack.print,{paper:'A4-L',packNo:rows.map((item)=>item?.packNo || item?.serialNo)});
    loading.close();
    printModal.data.html=data?.html || '';
  },
  print:async (e)=>{
    const iframe=document.getElementById('printIframe');
    iframe.focus();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  },
};
const printModal=reactive({
  data:{
    isShow:false,
    title:'',
    btn:[
      {bind: {content: "打印", icon: "vxe-icon-print",},click:printEvent.print,},
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



//主列表搜索
const searchListDelay=_.debounce((e)=>{
  searchList('search',{search:e?.value});
},500)
const searchList = async (type = 'init',param={}) => {
  vData.params={...vData.params,...param, currentPage:api.getCurrentPage(type,vData.params,vData.list.length)};
  type==='reset' && (vData.params={...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let data = await api.get(_apiUrl.order.list, vData.params);
  vData.msg = '未找到订单或订单未审核，请联系计划员确认！'
  if(data===undefined) return ;
  vData.list = [...data.list]
  vData.option={...data?.option};
  vData.label=getAllOptionLabel(vData.option);
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
.siyi-order-list {
  width: 100%;
  height: 100%;
  position: absolute;

  .vxe-toolbar{
    height: unset;
  }

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .list-action {
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

  .avatar {
    width: 30px;
    border-radius: 50%;
  }

  .detail2-list {
    .mi-title {
      line-height: 20px;
      margin-top: 20px;
      background-color: #eee;
      padding: 5px;
      font-size: 14px;
    }

    .mi-list,.order-price {
      .t-list-item-main {
        justify-content: start;
      }
      .mi-list-item {
        width: 160px;
      }
      .mi-list-detail {
        display: flex;
        flex-wrap: wrap;
        gap: 0 25px;
        width: inherit;
        justify-content:start;
      }
    }
    .order-price{
      .mi-list-detail{
        gap: 0 50px;
        line-height: 30px;
      }
    }

    .mi-images{
      display: flex;
      flex-direction: row;
      justify-content: center;
    }

  }
}
</style>