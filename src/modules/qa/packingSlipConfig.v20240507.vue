<template>
    <div class="siyi-packing-slip-config">

        <vxe-grid ref="grid" v-bind="gridOptions" @cellDblclick="cellDblclick">

            <!-- 列表筛选条件 -->
            <template #toolbar_buttons  >
                <t-button variant="text" size="small" @click="addClick()" >
                    <template #icon>
                      <AddIcon />
                    </template>
                    添加
                </t-button>


                <t-popconfirm content="确认启用吗?" theme="danger"  @confirm="onStatusEdit(1)">
                    <t-button variant="text" size="small">
                        <template #icon>
                          <PlayCircleIcon />
                        </template>
                        启用
                    </t-button>
                </t-popconfirm>

                <t-popconfirm content="确认停用吗?" theme="danger"  @confirm="onStatusEdit(0)">
                    <t-button variant="text" size="small">
                        <template #icon>
                          <StopCircleIcon />
                        </template>
                        停用
                    </t-button>
                </t-popconfirm>


                <t-popconfirm content="确认删除吗?" theme="danger"  @confirm="onStatusEdit(-1)">
                    <t-button variant="text" size="small">
                        <template #icon>
                          <DeleteIcon />
                        </template>
                        删除
                    </t-button>
                </t-popconfirm>



                <t-button variant="text" size="small" @click="searchList('init')">
                    <template #icon>
                      <RefreshIcon />
                    </template>
                    刷新
                </t-button>

                <vxe-select v-model="params.plant_id" placeholder="工厂" size="small" clearable class-name="search-select"
                    @change="searchList('init')" :options="userPlantList" />

                <vxe-select v-model="params.status" placeholder="状态" size="small" clearable class-name="search-select"
                    @change="searchList('init')">
                    <vxe-option :value="1" label="启用"></vxe-option>
                    <vxe-option :value="0" label="停用"></vxe-option>
                    <vxe-option :value="-1" label="已删除"></vxe-option>
                </vxe-select>

                <!-- <t-button variant="text" size="small" @click="searchList('prev')">
                    <template #icon>
                        <ChevronUpIcon />
                    </template>
                    上一页
                </t-button>
                <t-button variant="text" size="small" @click="searchList('next')">
                    <template #icon>
                        <ChevronDownIcon />
                    </template>
                    下一页
                </t-button> -->

              <vxe-input type="search" v-model="params.customer_code" placeholder="客户代码" @click="grid.clearSelected()"
                         @search-click="searchList" @keydown="searchList" clearable
                         style="width: 200px;margin:0 5px"></vxe-input>

                <vxe-input type="search" v-model="params.search" placeholder="邮箱/备注" @click="grid.clearSelected()"
                    @search-click="searchList" @keydown="searchList" clearable
                    style="width: 500px;margin:0 5px"></vxe-input>

            </template>


            <template #empty>
                <span>
                    <img :src="noData">
                    <p>{{ msg }}</p>
                </span>
            </template>

        </vxe-grid>


        <!-- 修改弹窗 -->
        <vxe-modal v-model="editWindow" size="mini" width="600" :position="{ top: '10%' }" @close="updateWindowClose"
            :loading="editWindowLoading" resize :height="modalHeight" @show="modalShowEvent">
            <template #title>
                <t-button variant="text" size="small" @click="saveClick">
                    <template #icon>
                      <EditIcon v-if="isReadonly"/> <SaveIcon v-else/>
                    </template>
                    {{ editBtnName }}
                </t-button>
            </template>
            <template #default>
                <vxe-form :data="editData" title-width="80" title-align="right">

                    <vxe-form-item field="plant_id" title="工厂" span="24" >
                        <template #default="{ data }">
                            <vxe-radio-group v-model="data.plant_id" :disabled="isReadonly" :options="userPlantList">
                            </vxe-radio-group>
                        </template>
                    </vxe-form-item>

                    <vxe-form-item title="客户" span="24">
                        <vxe-pulldown ref="customerRef" class="customerSelect">
                            <template #default>
                                <vxe-input v-model="editData.customer_title" placeholder="客户"
                                    @focus="customerFocusEvent" @keyup="customerKeyupEvent" :readonly="isReadonly"
                                    :disabled="editData.id != undefined"></vxe-input>
                            </template>
                            <template #dropdown>
                                <vxe-list height="200" :data="customerList" auto-resize>
                                    <template #default="{ items }">
                                        <div class="customerOption" v-for="item in items" :key="item.customerCode"
                                            @click="customerSelectEvent(item)">
                                            <span>{{ item.customerName }} ({{ item.customerCode }})</span>
                                        </div>
                                    </template>
                                </vxe-list>
                            </template>
                            <template #footer>
                                <div class="my-footdown4">
                                    <t-button variant="text" size="small" @click="getCustomerList('last')">
                                        <template #icon>
                                          <ChevronUpIcon />
                                        </template>
                                        上一页
                                    </t-button>
                                    <t-button variant="text" size="small" @click="getCustomerList('next')">
                                        <template #icon>
                                          <ChevronDownIcon />
                                        </template>
                                        下一页
                                    </t-button>
                                </div>
                            </template>
                        </vxe-pulldown>
                    </vxe-form-item>

                    <vxe-form-item field="send_type" title="发送方式" span="24">
                        <template #default="{ data }">
                            <vxe-radio-group v-model="data.send_type" :disabled="isReadonly">
                                <vxe-radio :label="1">邮件</vxe-radio>
                                <vxe-radio :label="2">其他</vxe-radio>
                            </vxe-radio-group>
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="mail_main" title="收件邮箱" span="24" :visible="editData.send_type == 1">
                        <template #default="{ data }">
<!--                            <t-input clearable placeholder="只能填1个" v-model="data.mail_main" :readonly="isReadonly" @blur="mailMainBlur" />-->
                          <t-tag-input excess-tags-display-type="break-line" clearable placeholder="多个按回车"
                                       v-model="mailMainList" :readonly="isReadonly" @change="mailMainChange" @blur="mailMainChange" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="mail_copy" title="抄送邮箱" span="24" :visible="editData.send_type == 1">
                        <template #default="{ data }">
                            <t-tag-input excess-tags-display-type="break-line" clearable placeholder="多个按回车"
                                v-model="mailCopyList" :readonly="isReadonly" @change="mailCopyChange" @blur="mailCopyChange" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="mail_title" title="邮件标题" span="24" :visible="editData.send_type == 1">
                        <template #default="{ data }">
                            <vxe-input clearable v-model="editData.mail_title"
                                :className="lastInputField == 'mail_title' ? 'varLastInput' : ''" :readonly="isReadonly"
                                @focus="varInputFocus('mail_title')" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item title="变量替换">
                        <t-space class="varLabList" :size="8" break-line>
                            <t-tag @click="varClick" variant="light" :theme="varBtnDisabled ? 'primary' : 'success'"
                                size="small" :disabled="varBtnDisabled" v-for="varLab in varLabList">{{ varLab }}</t-tag>
                        </t-space>
                    </vxe-form-item>

                    <vxe-form-item field="mail_body" title="邮件内容" span="24" :visible="editData.send_type == 1">
                        <template #default="{ data }">
                            <vxe-textarea v-model="editData.mail_body" placeholder="邮件正文" 
                                :className="lastInputField == 'mail_body' ? 'varLastInput' : ''"
                                :autosize="{ minRows: 4, maxRows: 6 }" showWordCount :readonly="isReadonly"
                                @focus="varInputFocus('mail_body')" />
                        </template>
                    </vxe-form-item>


                    <vxe-form-item field="remark" title="备注" span="24">
                        <template #default="{ data }">
                            <vxe-textarea  v-model="editData.remark" placeholder="仅自己可见，不添加到邮件内容"
                                :className="lastInputField == 'remark' ? 'varLastInput' : ''"
                                :autosize="{ minRows: 4, maxRows: 6 }" showWordCount :readonly="isReadonly"
                                @focus="varInputFocus('remark')" />
                        </template>
                    </vxe-form-item>

                    <vxe-form-item field="status" title="状态" span="24">
                        <template #default="{ data }">
                            <vxe-radio-group v-model="data.status" :disabled="isReadonly">
                                <vxe-radio :label="1">启用</vxe-radio>
                                <vxe-radio :label="0">停用</vxe-radio>
                            </vxe-radio-group>
                        </template>
                    </vxe-form-item>

                </vxe-form>
            </template>
        </vxe-modal>



    </div>
</template>

<script setup>
import {reactive, ref,onActivated,onDeactivated} from "vue"
import * as core from "@/core/script/core.js"
import noData from '@/core/assets/img/nodata.gif'
import {to as navTo,getQuery} from "@/core/script/nav.js"
import {gridOptions as gridOptionsDefault} from "@/config/vxeTable.js";
import {AddIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon, PlayCircleIcon, RefreshIcon, StopCircleIcon} from "tdesign-icons-vue-next";
import {getUserPlantList} from "@/utils/erp.js";
import {http,url as apiUrl} from "@/core/script/api";
import dialog from "@/core/script/dialog.js";

//用户的工厂
const userPlantList=getUserPlantList('erp-packing-slip-config-');
const _apiUrl=apiUrl.packingSlip.config;

// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  vData.query=getQuery();
  onShowFromNav(vData.query);
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
})








const vData=reactive({
  query:{},
});

// 搜索筛选条件
const params = reactive({
    plant_id:userPlantList?.[0]?.value || '', //工厂ID
    search: '',//客户代码
    showAll: '',//只显示已配置的客户
    status: undefined,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
})


const grid = ref()
const msg = ref('请搜索！')


// 列表项
const columns = [
    { title: '', width: 46, type: 'checkbox', sortable: true },
    { title: '序号', width: 46, type: 'seq', sortable: true },
    { title: '工厂', width: 80, field: 'plant_name', sortable: true },
    // { title: '客户ID', width: 132, field: 'customer_id', sortable: true },
    { title: '客户代码', width: 100, field: 'customer_code', sortable: true },
    { title: '客户名称', width: 100, field: 'customer_name', sortable: true },
    { title: '方式', width: 80, field: '_text.send_type', sortable: true },
    { title: '收件人', minWidth: 120, field: 'mail_main', sortable: true },
    { title: '抄送人', minWidth: 200, field: 'mail_copy', sortable: true },
    { title: '备注', minWidth: 120, field: 'remark', sortable: true },
    { title: '状态', width: 80, field: '_text.status', sortable: true },
    { title: '创建人', width: 80, field: '_text.create_uid', sortable: true },
    { title: '更新人', width: 80, field: '_text.update_uid', sortable: true,visible: false  },
    { title: '创建时间', width: 160, field: 'create_at', sortable: true, formatter: core.date.formatterYMDHms},
    { title: '更新时间', width: 160, field: 'update_at', sortable: true, formatter: core.date.formatterYMDHms,visible: false  },
    { title: 'ID', width: 60, field: 'id', sortable: true,visible: false  },
];

//表格配置
const gridOptions = reactive({
  ...gridOptionsDefault,
    id: 'packingSlipConfig',//ID
    seqConfig: {
        seqMethod: ({ rowIndex }) => params.pageSize * (params.currentPage - 1) + rowIndex + 1
    },
    columns: columns
})

const modalHeight=ref('');
// 重新计算modal的高度
const modalShowEvent=(e)=>{
    const modalTop=e.$modal.getPosition().top;
    modalHeight.value=((window.innerHeight-modalTop*2))+'px';
}

// 默认数据
const editDataDefault = {
    plant_id:userPlantList?.[0]?.value || '',
    send_type: 1,
    status: 1,
    customer_id: '',
    customer_name: '',
    customer_code: '',
    customer_title: '',
    mail_main: '',
    mail_copy: '',
    mail_title: '',
    mail_body: '',
    remark: '',
}
// 编辑时的数据
let editData = reactive({});

const editBtnName = ref('添加')
const editBtnIcon = ref('edit')

const editWindow = ref(false) //编辑窗口是否显示
const editWindowLoading = ref(false) //编辑窗口loading
const isReadonly = ref(true) // 是否允许编辑



// 新增
const addClick = () => {
    editData = Object.assign(reactive({}), editDataDefault,{plant_id:params.plant_id});//重置数据
    mailMainList.value = [];
    mailCopyList.value = [];
    editBtnName.value = "添加";
    editBtnIcon.value = "add";
    isReadonly.value = false;
    editWindow.value = true
    // console.log(editData);
}

//  修改
const cellDblclick = ({ row, column }) => {
    isReadonly.value = true;
    editBtnName.value = "修改";
    editBtnIcon.value = "edit";
    editData = Object.assign(reactive({}), editDataDefault, row);
    mailMainList.value = editData.mail_main.split(" ");
    mailCopyList.value = editData.mail_copy.split(" ");
    editData.customer_title = row.customer_name + "(" + row.customer_code + ")";
    editWindow.value = true
}

// 从其他页面进入，添加/查看
const onShowFromNav=((query)=>{
  if(query===undefined || Object.keys(query).length === 0 || query.customer_code===undefined || query.plant_id===undefined){
    return ;
  }
  params.plant_id=query.plant_id;
  params.customer_code=query.customer_code;
  searchList('init');
/*
  let apiParams={customer_code:query.customer_code,plant_id:query.plant_id}
  core.http.get(_apiUrl.list,{params:apiParams}).then((res) => {
    if (res.data.code === 20000) {
      let row= res.data.data.list[0];
      if(row===undefined){
        editData = Object.assign(reactive({}),editDataDefault,reactive(query));
        // console.log(editData);
        mailCopyList.value = [];
        editBtnName.value = "添加";
        editBtnIcon.value = "add";
        isReadonly.value = false;
      }else{
        editBtnName.value = "修改";
        editBtnIcon.value = "edit";
        editData = Object.assign(reactive({}), editDataDefault, row);
        mailCopyList.value = editData.mail_copy.split(" ");
        mailMainList.value = editData.mail_main.split(" ");
        isReadonly.value = true;
      }
      editData.customer_title = editData.customer_name + "(" + editData.customer_code + ")";
      editWindow.value = true
      // console.log(editData);
    }else{
      msg.value = '没有搜索到数据！'
      dialog.error(res.data.message)
    }
  })*/


})


// 返回到回去的页面
const backRefer=(param)=>{
  let query = vData.query;
  // 跳回原来的地方
  if(query!==undefined && query.customer_id==editData.customer_id){
    console.log({...{search:editData.customer_code,plant_id:query.plant_id},...param});
    navTo('packingSlip_v20240507',
        {...{search:editData.customer_code,configStatus:query.configStatus},...param});
    return false;
  }
  return true;
}

// 变量标签处理
const varLabList = ['#客户简称#', '#客户订单号#','#客户型号#','#客户物料#','#正品数量#','#周期#','#出货日期#','#当前日期#',];
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
const lastInputField = ref('') //当前输入框
const varBtnDisabled = ref(true) //变量按钮是否禁用
const varInputFocus = (filed) => {
    if (isReadonly.value) return;
    lastInputField.value = filed;
    varBtnDisabled.value = false;
}

// 变量标签点击
const varClick = (item) => {
    if (varBtnDisabled.value) return;
    // console.log(lastInputField.value, editData[lastInputField.value]);
    editData[lastInputField.value] += item.e.target.innerText;
    // console.log(editData.mail_title);
}

const mailMainList = ref([])
const mailCopyList = ref([])

//邮件收件人变化
const mailMainChange = (val, context) => {
  const eventType= context?.e?.type || '';
  const inputValue= context?.item || context?.inputValue || val;
  if(typeof inputValue!='string'){
    return false;
  }
  let ok=inputValue.length>0 && emailRegex.test(inputValue);
  ok || dialog.warning('邮件地址格式不正确',3000);
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
  ok || dialog.warning('邮件地址格式不正确',3000);
  if(eventType==='blur'){
    ok && mailCopyList.value.push(inputValue);
  }else{
    ok || mailCopyList.value.pop();
  }
  editData.mail_copy = mailCopyList.value.join(" ");
}



// 邮件地址失去焦点
const mailMainBlur=(val, context) => {
    if(val.length>0 && !emailRegex.test(val)){
        dialog.warning('邮件地址格式不正确',3000);
        $(context.e.target).select();
    }
}

// 提交
const saveClick = () => {
    if (isReadonly.value) {
        isReadonly.value = false;
        editBtnName.value = "保存";
        editBtnIcon.value = "save";
        return
    }
    if(editData.customer_id.length<1){
        dialog.warning('请选择客户！',3000);
        return ;
    }
    lastInputField.value = null;
    editWindowLoading.value = true
    http.post(_apiUrl.edit, editData).then((res) => {
        editWindowLoading.value = false
        editWindow.value = false
        if (res.data.code !== 20000) {
          dialog.error(res.data.message)
          return ;
        }
        dialog.success(res.data.message,1000)
        if(!backRefer({configStatus:1})){
          return
        }
        isReadonly.value = true;
        editData = Object.assign(reactive({}), editDataDefault);//重置数据
        searchList();
    })
}


//批量操作
const onStatusEdit=(nextStatus)=>{
    const checkedRows = grid.value.getCheckboxRecords();
    if (checkedRows.length === 0) {
        dialog.warning('请选择要操作的数据！',3000)
        return
    }
    const ids = checkedRows.map((item) => item.id)
    updateStatus(ids, nextStatus) 
}

// 修改状态
const updateStatus = (id, status) => {
    http.post(_apiUrl.edit, { id: id, status: status }).then((res) => {
        dialog.info(res.data.message,1000)
        searchList()
    })
}



// 修改窗口关闭
const updateWindowClose = (event) => {
    if(!backRefer()){
      return
    }
    isReadonly.value = true
    editData = Object.assign(reactive({}), editDataDefault);//重置数据
    mailCopyList.value = [];
    lastInputField.value = '';
    varBtnDisabled.value = true;
}



//搜索
const searchList = (type = 'init') => {
    if (type === 'prev' && params.currentPage > 1) {
        params.currentPage -= 1
    } else if (type === 'next' && gridOptions.data.length === params.pageSize) {
        params.currentPage += 1
    } else if (
        type === 'init' ||
        type?.$event?.type === 'click' ||
        type?.$event?.type === 'keydown' && type?.$event?.keyCode === 13
    ) {
        params.currentPage = 1
    } else {
        // return
    }
    msg.value = '正在搜索数据，请稍等！'
    gridOptions.data = []
    http.get(_apiUrl.list, { params }).then((res) => {
        msg.value = '没有搜索到数据！'
        if (res.data.code === 20000) {
            gridOptions.data = res.data.data.list
        }else{
            dialog.error(res.data.message)
        }
    })
}



// 客户下拉框
const customerRef = ref()
// 客户列表
const customerList = ref([])
// 客户列表查询参数
const customerParam = ref({
    search: '',
    currentPage: 1,
    pageSize: 10
})

// 从后台获取客户列表
const getCustomerList = (params) => {
    if (params === 'next') {
        customerParam.value.currentPage += 1;
        params = {};
    } else if (params === 'last') {
        customerParam.value.currentPage -= 1;
        params = {};
    }
    customerParam.value={...customerParam.value,...params};
    return new Promise(resolve => {
        editWindowLoading.value = true
        http.get(_apiUrl.customer + "?" + objectToUrlEncoded(customerParam.value)).then(res => {
            editWindowLoading.value = false
            customerList.value = res.data.data.list;
            customerParam.value={...customerParam.value,...params};
            editData.customer_id = 0;
            editData.customer_code = 0;
            editData.customer_name = 0;
            resolve();
        })
    })
}

//展开下拉事件
const customerFocusEvent = (input) => {
    const $pulldown = customerRef.value
    if ($pulldown) {
        getCustomerList({ search: input.value }).then(data => {
            $pulldown.showPanel()
        })
    }
}

// 搜索筛选
const customerKeyupEvent = (input) => {
    getCustomerList({ search: input.value }).then(data => {
        editWindowLoading.value = false
        editWindow.value = true
    })
}

//下拉选中
const customerSelectEvent = (item) => {
    const $pulldown = customerRef.value
    if ($pulldown) {
        editData.customer_title = item.customerName + "(" + item.customerCode + ")";
        editData.customer_id = item.customerId;
        editData.customer_code = item.customerCode;
        editData.customer_name = item.customerName;
        // console.log(editData);
        $pulldown.hidePanel().then(() => {

        })
    }
}


// 对象转URL参数
const objectToUrlEncoded = (obj) => {
    return Object.keys(obj).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])).join('&');
};

searchList()

</script>

<style>
.siyi-packing-slip-config {

    .siyi-leftHide {
        margin-left: 162px;
    }

    .search-select{
      width: 100px;
    }

    iframe {
        width: 100%;
        height: 100%;
        border: none;
        min-height: 500px;
    }

    .vxe-table--render-default .vxe-body--column,
    .vxe-table--render-default .vxe-footer--column,
    .vxe-table--render-default .vxe-header--column {
        line-height: normal;
    }

    .customerSelect,
    .customerOption {
        width: 100%;
    }

    .customerOption {
        line-height: 24px;
    }
    .varLabList .t-tag--success{
        cursor:pointer
    }
    .varLabList .t-tag--primary{
        color: gray;
    }
    .varLastInput input,
    .varLastInput textarea {
        border-color: #2ba471;
    }
}
</style>