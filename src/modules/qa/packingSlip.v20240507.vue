<template>
    <div class="siyi-packing-slip">

        <vxe-grid ref="grid"  v-bind="gridOptions" @cellDblclick="cellDblclick">

            <!-- 列表筛选条件 -->
            <template #toolbar_buttons >

                <t-button  variant="text" size="small" @click="batchClick" v-show="vData.params.configStatus===1 && vData.params.status === 0">
                  <i class="ri-mail-send-line"></i>
                    发送报告
                </t-button>


              <t-select v-model="vData.params.plant_id" label="接单工厂：" placeholder="不限"   auto-width  clearable
                        @change="searchList('init')" :options="plantList">
              </t-select>

              <t-select v-model="vData.params.plant_id2" label="出库工厂：" placeholder="不限"   auto-width
                        @change="searchList('init')" :options="userPlantList">
              </t-select>

              <t-select v-model="vData.params.configStatus" placeholder="配置状态"  style="width: 100px"
                          @change="searchList('init')"    v-show="vData.params.configStatus!==undefined">
                  <t-option :value="1" label="已配置"></t-option>
                  <t-option :value="2" label="未配置"></t-option>
                  <t-option value="" label="全部"></t-option>
              </t-select>

              <t-select v-model="vData.params.status" placeholder="处理状态"  clearable  style="width: 100px"
                  @change="searchList('init')" v-show="vData.params.configStatus === 1">
                  <t-option :value="0" label="未处理"></t-option>
                  <t-option :value="1" label="已处理"></t-option>
              </t-select>



              <t-date-range-picker v-model="vData.params.time_range" enable-time-picker allow-input clearable style="width: 320px;"
              format="YYYY-MM-DD HH:mm" :presets="presets"  @confirm="searchList('init')" title="出库时间" />

              <t-input v-model="vData.params.search"  :clearable="true"  style="width: 160px;" placeholder="出库单号/装箱单号/销售订单号/客户订单号/生产编号/客户型号" />

              <t-input v-model="vData.params.customer_code"   style="width: 80px;" placeholder="客户代码" type="text"  :controls="false"  clearable>
              </t-input>

              <t-input v-model="vData.params.partNum"   style="width: 200px;" placeholder="料号" type="text"  :controls="false"  clearable>
              </t-input>

              <vxe-button mode="text"  icon="vxe-icon-search" @click="searchList('search')" title="搜索"></vxe-button>

<!--              <vxe-number-input type="integer" v-model="vData.params.pageSize" @change="searchList" placeholder="每页数量" min="1" style="width:80px" />-->

              <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
              <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
              <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
              <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>


            </template>

            <template #empty>
                <span>
                    <img :src="noData">
                    <p>{{ msg }}</p>
                </span>
            </template>

        </vxe-grid>


        <vxe-modal v-model="editWindow" size="mini" width="1080" className="editWindow" :position="{ top: '10%' }" @close="updateWindowClose"
            :loading="editWindowLoading"  resize :height="modalHeight" @show="modalShowEvent">
            <template #title>
                <t-button variant="text" size="small" @click="saveClick" v-show="editData.status !== 1 || editData.send_type!==1">
                  <i class="ri-edit-line"></i>
                    {{ editBtnName }}
                </t-button>

                <t-button variant="text" size="small" @click="previewClick"
                    v-show="editData.send_type === 1 && editData.id !== undefined && isReadonly.value === false">
                    <i class="ri-mail-send-line"></i>
                    发送(预览)
                </t-button>

            </template>
            <template #default>
                <vxe-form :data="editData" title-width="80" title-align="right">

                    <vxe-form-item field="remark" span="24" v-if="editData.remark && editData.remark.length>0">
                        <template #default="{ data }">
                            <t-alert theme="error" >{{ data.remark }}</t-alert>
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="slip_ids" title="SLIP_ID" span="24">
                        <template #default="{ data }">
                            <vxe-input clearable v-model="data.slip_ids" disabled />
                        </template>
                    </vxe-form-item>

                  <vxe-form-item field="job_ids" title="JOB_ID" span="24">
                    <template #default="{ data }">
                      <vxe-input clearable v-model="data.job_ids" disabled placeholder="(全部)"/>
                    </template>
                  </vxe-form-item>

                    <vxe-form-item field="customer_info" title="客户" span="24">
                        <template #default="{ data }">
                            <vxe-input clearable v-model="data.customer_info" disabled />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item title="出货单" span="24" :visible="typeof editData.packingList !== undefined">
                        <template #default="{ data }">
                            <vxe-table :data="editData.packingList">
                                <vxe-column type="seq" width="60"></vxe-column>
                                <vxe-column field="custContractNumber" title="客户订单号" width="125"></vxe-column>
                                <vxe-column field="partName" title="客户型号" minWidth="180"></vxe-column>
                                <vxe-column field="custMatCode" title="客户物料" width="150"></vxe-column>
                                <vxe-column field="partNum2" title="工程型号" width="160"></vxe-column>
                                <vxe-column field="qtyQuality" title="数量" width="80"></vxe-column>
                                <vxe-column field="cycleNumber" title="周期" width="60"></vxe-column>
                            </vxe-table>
                            <t-link hover="color" :href="editData.reportUrl" target="_blank" :visible="typeof editData.reportUrl!==undefined">
                                查看出货单PDF
                            </t-link>
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="qty_pcs" title="总数" span="24" :visible="typeof editData.qty_pcs !== undefined">
                        <template #default="{ data }">
                            <vxe-input clearable v-model="data.qty_pcs" disabled />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="send_type" title="发送方式" span="24">
                        <template #default="{ data }">
                            <vxe-radio-group v-model="data.send_type" :disabled="editData.status === 1 || isReadonly">
                                <vxe-radio :label="1">邮件</vxe-radio>
                                <vxe-radio :label="2">其他</vxe-radio>
                            </vxe-radio-group>
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="mail_main" title="收件邮箱" span="24" :visible="editData.send_type === 1">
                        <template #default="{ data }">
<!--                            <vxe-input clearable placeholder="只能填1个" v-model="data.mail_main"-->
<!--                                :readonly="editData.status === 1 || isReadonly" />-->
                          <t-tag-input excess-tags-display-type="break-line" clearable placeholder="多个按回车"
                                       v-model="mailMainList" :readonly="isReadonly" @change="mailMainChange" @blur="mailMainChange" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="mail_copy" title="抄送邮箱" span="24" :visible="editData.send_type === 1">
                        <template #default="{ data }">
                            <t-tag-input excess-tags-display-type="break-line" clearable placeholder="多个按回车"
                                v-model="mailCopyList" :readonly="isReadonly" @change="mailCopyChange" @blur="mailCopyChange" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="mail_title" title="邮件标题" span="24" :visible="editData.send_type === 1">
                        <template #default="{ data }">
                            <vxe-input clearable v-model="data.mail_title" :readonly="editData.status === 1 || isReadonly" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="mail_body" title="邮件内容" span="24" :visible="editData.send_type === 1">
                        <template #default="{ data }">
                            <vxe-textarea placeholder="邮件正文内容" v-model="data.mail_body"
                                :autosize="{ minRows: 4, maxRows: 6 }" showWordCount
                                :readonly="editData.status === 1 || isReadonly" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item title="附件" span="24" :visible="editData.send_type === 1">
                        <template #default="{ data }">
                            <t-upload :files="data.mail_files" :action="_apiUrl.upload" :headers="uploadHeaders"
                                      placeholder="支持批量上传文件，文件格式不限，最多只能上传 10 份文件" theme="file-flow" multiple
                                      @one-file-success="onOneFileSuccess" :before-upload="beforeUpload"
                                      :disabled="editData.status === 1 || isReadonly"></t-upload>
                        </template>
                    </vxe-form-item>


                    <vxe-form-item field="remark" title="备注" span="24" :visible="editData.send_type !== 1">
                        <template #default="{ data }">
                            <vxe-textarea placeholder="仅自己可见，不添加到邮件内容" v-model="data.remark"
                                :autosize="{ minRows: 4, maxRows: 6 }" showWordCount
                                :disabled="editData.status === 1 || isReadonly" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="status" title="状态" span="24" :visible="typeof editData.id !== undefined || editData.send_type !== 1">
                        <template #default="{ data }">
                            <vxe-radio-group v-model="data.status" :disabled="editData.send_type === 1 || isReadonly">
                                <vxe-radio :label="0">未处理</vxe-radio>
                                <vxe-radio :label="1">已处理</vxe-radio>
                            </vxe-radio-group>
                        </template>
                    </vxe-form-item>

                    <vxe-form-item title="处理时间" span="24" :visible="editData.send_at !== undefined && editData.send_at!=null">
                        <template #default="{ data }">
                            <vxe-input clearable v-model="data.send_at_text" disabled />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item title="处理人" span="24" :visible="editData.send_uid !== undefined && editData.send_uid!=null">
                        <template #default="{ data }">
                            <vxe-input clearable v-model="data.send_user" disabled />
                        </template>
                    </vxe-form-item>


                </vxe-form>
            </template>
        </vxe-modal>


        <!-- 预览弹窗 -->
        <vxe-modal className="modal" v-model="previewWindow" size="mini" width="960" :position="{ top: '10%' }"
            @close="previewWindowClose" :loading="previewWindowLoading" escClosable :height="modalHeight" @show="modalShowEvent">
            <template #title>
                <t-button variant="text" size="small" @click="sendClick">
                    <template #icon>
                      <SendIcon />
                    </template>
                    发送
                </t-button>
            </template>
            <template #default>
                <iframe :srcdoc="previewData.content"></iframe>
                <t-button theme="success" size="large" @click="sendClick">
                  <SendIcon />发送邮件</t-button>
            </template>
        </vxe-modal>

    </div>
</template>

<script setup>
import {reactive, ref, onActivated,onDeactivated, onMounted} from "vue"
import dialog from "@/core/script/dialog.js";
import * as core from "@/core/script/core.js"
import noData from '@/core/assets/img/nodata.gif'
import {to as navTo,getQuery} from "@/core/script/nav.js"
import {plantList, getUserPlantList} from '@/utils/erp.js'
import {gridOptions as gridOptionsDefault} from "@/config/vxeTable.js";
import {getCurrentPage, getHttpDefaultHeaders, http,url as apiUrl} from "@/core/script/api.js";
// import {EditIcon, SendIcon} from "tdesign-icons-vue-next";
import {presets} from "@/utils/tdesign.js";


//用户的公司
const userPlantList=getUserPlantList('erp-packing-slip-');
const _apiUrl =apiUrl.packingSlip.order;

// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  const query=getQuery();
  onShowFromNav(query);
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
})

onMounted(() => {
  searchList()
})


const defaultData={
  params:{
    plant_id:'',//接单工厂
    plant_id2:userPlantList[0]?userPlantList[0]['value'] : '',//生成工厂
    partNum:'',//料号
    search: '',//搜索关键词
    customer_code:'',
    time_range: presets['最近3天'], //默认时间
    configStatus: 1, //是否配置
    status: 0,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
  }
};

const vData=reactive({
  params:{...defaultData.params},
});


const grid = ref()
const msg = ref('请搜索出货单！')
// 列表项
const columns = [
    { title: '', width: 46, type: 'checkbox', sortable: true },
    { title: '序号', width: 46, type: 'seq', sortable: true },

    { title: '客户代码', width: 88, field: 'customerCode', sortable: true},
    { title: '生产编号', width: 150, field: 'partNum', sortable: true },
    { title: '版本', width: 60, field: 'partRev', visible: false },

    { title: '数量', width: 80, field: 'qtyofPCSAssigned', sortable: true },

    { title: '客户型号', width: 185, field: 'partName', sortable: true },
    { title: '客户物料编码', width: 120, field: 'custMatCode', visible: false },
    { title: '客户订单号', width: 160, field: 'custContractNumber'},
    { title: '客户名', width: 90, field: 'customerName', sortable: true },
    { title: '业务类型', width: 100, field: 'plantBizName', sortable: true,formatter:function ({cellValue}) {
        return cellValue.replaceAll('-->','->').replace("客户->",'').replace("(直销)",'').replaceAll('龙腾','').replace('龙昌','');
      }},
    { title: '出货工厂', width: 132, field: 'plantName',visible: false },
    { title: '出库人', width: 125, field: 'employeeName', sortable: true },
    { title: '外协', width: 80, field: 'spyNickName', sortable: true,visible: false},
    { title: '邮件状态', width: 90, field: 'report_status_text', sortable: true},
    { title: '发送时间', width: 135, field: 'report_send_time', sortable: true, formatter: core.date.formatterYMDHm},

    { title: '装运日期', width: 135, field: 'shippedDate',  formatter:core.date.formatterYMDHm},
    // { title: '出库时间', minWidth: 132, field: 'confirmedDate', visible: false,sortable: true, formatter: formatterDate.v240504 },
    { title: '出库单号', width: 120, field: 'shipingNotes_Numer', sortable: true },

    { title: '送货单号', width: 120, field: 'packingSlip_Numer', sortable: true },
    { title: '销售单号', width: 140, field: 'soNumber', sortable: true },


    { title: '出库状态', width: 87, field: 'shipFlg_text', sortable: true, visible: false },



    // { title: '类型', width: 87, field: 'type_text', visible: false },
    // { title: '箱数', width: 87, field: 'cust_Confirmed', visible: false },
    // { title: '工厂ID', width: 132, field: 'plantId', visible: false },

    { title: '客户ID', width: 132, field: 'customerId', visible: false },

    // { title: '客户地址', width: 87, field: 'shippingAddress', visible: false },
    // { title: '联系人', width: 87, field: 'contact', visible: false },
    // { title: '联系电话', width: 87, field: 'contactPhone', visible: false },
    // { title: '联系邮箱', width: 87, field: 'contactMail', visible: false },

    // { title: '备品数量', width: 132, field: 'qtyFreeAssigned', visible: false },

    // { title: '装运方式', width: 120, field: 'shippingMethodName', visible: false },
    { title: '备注', width: 132, field: 'note', visible: false },

    // { title: '更新时间', minWidth: 132, field: 'createTime', visible: false, formatter: formatterDate.v240504 },

    // { title: 'pki_id', width: 60, field: 'pki_id', visible: false },
    { title: 'report_id', width: 60, field: 'report_id', visible: false },
    // { title: 'packingItemId', width: 60, field: 'packingItemId', visible: false },
    { title: 'contractItemId', width: 120, field: 'contractItemId', visible: false },

    { title: 'ItemID', width: 80, field: 'packingSlipItemId', sortable: true,visible: false },
    { title: 'JOB', width: 80, field: 'jobId', sortable: true ,visible: false},
    { title: 'ID', width: 80, field: 'recId', sortable: true,visible: false },
];
//表格配置
const gridOptions = reactive({
    ...gridOptionsDefault,
    id: 'packingSlip', //ID
    seqConfig: {
        seqMethod: ({ rowIndex }) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
    },
    columns: columns,
    data:[],
})



// 修改
// 编辑时的数据
let editData = reactive({});

const editBtnName = ref('修改')
const editBtnIcon = ref('edit')

const editWindow = ref(false) //编辑窗口是否显示
const editWindowLoading = ref(false) //编辑窗口loading
const isReadonly = ref(true) // 是否允许编辑

const modalHeight=ref('');
// 重新计算modal的高度
const modalShowEvent=(e)=>{
    const modalTop=e.$modal.getPosition().top;
    modalHeight.value=((window.innerHeight-modalTop*2))+'px';
}

//邮件抄送变化
const mailMainList = ref([])
const mailCopyList = ref()
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

//邮件收件人变化
const mailMainChange = (val, context) => {
  const eventType= context?.e?.type || '';
  const inputValue= context?.item || context?.inputValue || val;
  if(typeof inputValue!='string'){
    return false;
  }
  let ok=inputValue.length>0 && emailRegex.test(inputValue);
  ok || dialog.warning('邮件地址格式不正确');
  if(eventType==='blur'){
    ok && mailMainList.value.push(inputValue);
  }else{
    ok || mailMainList.value.pop();
  }
  editData.mail_main = mailMainList.value.join(" ");
}

//邮件抄送变化
const mailCopyChange = (val, context) => {
  const eventType= context?.e?.type || '';
  const inputValue= context?.item || context?.inputValue || val;
  if(typeof inputValue!='string'){
    return false;
  }
  let ok=inputValue.length>0 && emailRegex.test(inputValue);
  ok || dialog.warning('邮件地址格式不正确');
  if(eventType==='blur'){
    ok && mailCopyList.value.push(inputValue);
  }else{
    ok || mailCopyList.value.pop();
  }
  editData.mail_copy = mailCopyList.value.join(" ");
}

// 批量操作
const batchClick = () => {
    let selectedRow = grid.value.getCheckboxRecords();
    if (selectedRow.length === 0) {
        dialog.warning("请选择数据");
        return;
    }
    let rowData = {};
    let customerIsDiff = selectedRow.some(row => {
        if (rowData.customer_id === undefined) {
            rowData = {
                plant_id: row?.plantId,
                plant_name: row?.plantName,
                customer_id: row?.customerId,
                customer_name: row?.customerName,
                customer_code: row?.customerCode,
                customer_info: row?.customerName + "(" + row?.customerCode + ")",
                send_type: 1,
                status: 0,
                mail_files: [],
                mail_main: '',
                mail_copy: '',
                // rowList: [],
                custContractNumberList: [],
                packingList: [],
                slip_id_list:[],
                job_id_list:[],
                qty_pcs:0,
            };
        }
        if (row.customerId !== rowData.customer_id) {
            return rowData.customer_name;
        }
        if (row.plantId !== rowData.plant_id) {
          return rowData.plant_name;
        }
        rowData.slip_id_list.push(row.recId);
        rowData.job_id_list.push(row.jobId);
        rowData.custContractNumberList.push(row.custContractNumber);
    })
    if (customerIsDiff) {
        dialog.warning("请选择同一个客户和生产工厂的数据");
        return false;
    }
    rowData.slip_ids=rowData.slip_id_list.join(",");
    rowData.job_ids=rowData.job_id_list.join(",");
    getReportDetail({
      customer_id: rowData.customer_id,
      slip_ids: rowData.slip_ids,
      job_ids:rowData.job_ids,
      plant_id:rowData.plant_id,
      slip_query:{custContractNumberList:rowData.custContractNumberList},
    },rowData);
}

// 单个操作
const cellDblclick = ({ row, column }) => {
    if(column.field==='customerName' || column.field==='customerCode'){
        return showClipConfig({...row,plantId:vData.params.plant_id2});
    }
    // console.log(row);
    let rowData = {
        plant_id: row?.plantId,
        plant_name: row?.plantName,
        customer_id: row.customerId,
        customer_name: row.customerName,
        customer_code: row.customerCode,
        customer_info: row.customerName + "(" + row.customerCode + ")",
        report_id:row.report_id,
        job_ids:row.jobId,
        custContractNumber:row.custContractNumber,
        send_type: 1,
        status: 0,
        mail_files: [],
        mail_main: '',
        mail_copy: '',
        // rowList: [],
        packingList: [],
        slip_ids:row.recId,
        qty_pcs:0,
    };
    getReportDetail({
      id:row.report_id,
      customer_id: rowData.customer_id,
      slip_ids: rowData.slip_ids,
      job_ids:rowData.job_ids,
      plant_id:rowData.plant_id,
      slip_query:{custContractNumberList:[rowData.custContractNumber]},
    },rowData);
}


// 获取报告详情
const getReportDetail = (post,rowData) => {
    editWindow.value = true
    editWindowLoading.value = true;
    http.post(_apiUrl.detail, post).then((res) => {
        editWindowLoading.value = false;
        if (res.data.code === 20000) {
            isReadonly.value = false;
            editData = reactive(Object.assign(rowData || {}, res.data.data.report));
            editData.packingList=res.data.data.slipData.list;
            editData.reportUrl=res.data.data.slipData.url || '';
            if(typeof editData.mail_files==='string'){
              editData.mail_files=JSON.parse(editData.mail_files);
            }
            mailMainList.value = editData.mail_main===''?[]:editData.mail_main.split(" ");
            mailCopyList.value = editData.mail_copy===''?[]:editData.mail_copy.split(" ");
            if (Array.isArray(mailCopyList.value)){
              mailCopyList.value=mailCopyList.value.filter(item => item);
            }
            // console.log(editData);
            if (editData.id === undefined || editData.status !== 1) {
                // 新增
                editBtnName.value = "保存";
                editBtnIcon.value = "save";
                isReadonly.value = false;
            } else {
                editBtnName.value = "修改";
                editBtnIcon.value = "edit";
                isReadonly.value = true;
            }
        } else {
            dialog.error(res.data.message)
        }
    })
}

// 打开客户配置
const showClipConfig=(row)=>{
    navTo('packingSlipConfig_v20240507',{
          plant_id:parseInt(row.plantId),
          customer_id:parseInt(row.customerId),
          customer_code:row.customerCode,
          customer_name:row.customerName,
          configStatus:vData.params.configStatus,
        }
    );
}
const onShowFromNav=(query)=>{
  if(query===undefined || Object.keys(query).length === 0){
    return ;
  }
  // console.log(query);
  if(query.search!==undefined ){
    vData.params.search=query.search;
  }
  if(query.plant_id!==undefined){
    vData.params.plant_id=query.plant_id;
  }
  if(query.plant_id2!==undefined){
    vData.params.plant_id2=query.plant_id2;
  }
  if(query.configStatus!==undefined){
    vData.params.configStatus=query.configStatus;
  }
  searchList('init');
}


// 文件上传的头
const uploadHeaders=ref({})

// 文件上传-前处理
const beforeUpload = (file) => {
  if (file.size > 5 * 1024 * 1024) {
    dialog.warning('上传的文件不能大于5M');
    return false;
  }
  uploadHeaders.value=getHttpDefaultHeaders();
  return true;
};


// 多文件上传，一个文件一个请求场景，每个文件也会单独触发上传成功的事件
const onOneFileSuccess = (params) => {
    if (params.response.code !== 20000) {
        dialog.error(params.response.message)
        return ;
    }
    editData.mail_files.push({
        name: params.file.name,
        status: params.file.status,
        percent: params.file.percent,
        url: params.response.data.url,
        path: params.response.data.path,
        size: params.file.size,
    });
};



// 提交
const saveClick = () => {
    if (isReadonly.value) {
        isReadonly.value = false;
        editBtnName.value = "保存";
        editBtnIcon.value = "save";
        return
    }
    editWindowLoading.value = true
    http.post(_apiUrl.edit, editData).then((res) => {
        editWindowLoading.value = false
        if (res.data.code === 20000) {
            editData = Object.assign({}, editData, res.data.data);
            isReadonly.value = true;
            if(editData.send_type===1){
              previewClick()
            }else{
              editWindow.value=false;
              searchList('init')
            }
          dialog.success(res.data.message)
        }else{
          dialog.error(res.data.message)
        }

    })
}

// 修改窗口关闭
const updateWindowClose = () => {
    isReadonly.value = true
    if (editData.status === 1) {
        searchList('init')
    }
    editData = {};//重置数据
}

// 预览窗口关闭
const previewWindowClose = () => {
    isReadonly.value = true
    getReportDetail({ id: editData.id });
}


//预览回单
const previewWindow = ref(false)
const previewWindowLoading = ref(false)
const previewData = ref({})

const previewClick = (reportId) => {
    reportId = typeof reportId == 'number' ? reportId : editData.id;
    previewWindowLoading.value = true
    http.get(_apiUrl.preview + "?id=" + reportId).then((res) => {
        previewData.value = res.data.data;
        previewWindowLoading.value = false
        previewWindow.value = true
        // console.log(previewData);
    })
}

// 发送邮件
const sendClick = (reportId) => {
    reportId = typeof reportId == 'number' ? reportId : editData.id;
    previewWindowLoading.value = true
    http.post(_apiUrl.send, { id: reportId }).then((res) => {

        previewWindowLoading.value = false;
        previewWindow.value = false;
        if (res.data.code === 20000) {
           dialog.success(res.data.message);
            getReportDetail({ id: reportId });
            setTimeout(() => {
                editWindow.value=false;
                searchList('init')
            }, 1000);
        } else {
            dialog.error(res.data.message);
            isReadonly.value = false;
            editBtnName.value = "保存";
            editBtnIcon.value = "save";
        }
    })
}

//搜索
const searchList = (type = 'init',param={}) => {
  vData.params={...vData.params,...param, currentPage:getCurrentPage(type,vData.params,gridOptions.data.length)};
  type==='reset' && (vData.params={...defaultData.params});

    if(vData.params.plant_id===undefined && vData.params.plant_id2===undefined ){
      vData.params.configStatus=undefined;
      vData.params.status=undefined
    }else{
      if(vData.params.configStatus===undefined){
        vData.params.configStatus=defaultData.params.configStatus;
        vData.params.status=defaultData.params.status;
      }
    }
    msg.value = '正在搜索数据，请稍等！'
    gridOptions.data = []
    http.get(_apiUrl.list, { params:vData.params }).then((res) => {
        msg.value = '没有搜索到数据！'
        if (res.data.code === 20000) {
            gridOptions.data = res.data.data.list
        }else{
            dialog.error(res.data.message)
        }
    })
}



</script>
<style>
.siyi-packing-slip {
  .vxe-toolbar .vxe-buttons--wrapper{
    gap: 2px;
  }
  .t-select__wrap{
    width: unset;
  }
    width: 100%;
    height: 100%;
    position: absolute;
    & .siyi-leftHide {
      margin-left: 162px;
    }
    .search-select{
      width: 100px;
    }
    iframe {
        width: 100%;
        border: none;
        min-height: 500px;
        height: 95%;
    }

    .vxe-table--render-default .vxe-body--column,
    .vxe-table--render-default .vxe-footer--column,
    .vxe-table--render-default .vxe-header--column {
        line-height: normal;
    }

    .editWindow {
        .vxe-modal--header-title{
            line-height: 30px;
        }
        button,svg{
            font-size: 18px !important;
        }
        .vxe-modal--box .t-alert {
            .t-alert__description,.t-alert__icon svg{
                font-size: 20px !important;
            }
        }
    }
}
</style>