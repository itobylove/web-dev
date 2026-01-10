<template>
  <div class="siyi-riskConfig">
    <vxe-grid ref="grid" v-bind="gridOptions" @cellDblclick="cellDblclick">
      <template #toolbar_buttons>
        <div class="'siyi-leftHide'">
          <t-button variant="text" size="small" @click="addClick">
            <template #icon>
              <t-icon name="add"/>
            </template>
            添加
          </t-button>
          <t-button variant="text" size="small" @click="searchList('prev')">
            <template #icon>
              <t-icon name="chevron-up"/>
            </template>
            上一页
          </t-button>
          <t-button variant="text" size="small" @click="searchList('next')">
            <template #icon>
              <t-icon name="chevron-down"/>
            </template>
            下一页
          </t-button>
          <vxe-select v-model="params.status" @change="searchList()" placeholder="状态"  style="width: 80px;margin:0 5px">
            <vxe-option value="" label="所有状态"></vxe-option>
            <vxe-option :value="1" label="有效"></vxe-option>
            <vxe-option :value="0" label="关闭"></vxe-option>
          </vxe-select>
          <vxe-input
              type="search"
              v-model="params.custCode"
              placeholder="客户代码"
              maxlength="4"
              @click="grid.clearSelected()"
              @search-click="searchList"
              @keydown="searchList"
              clearable
              style="width: 100px;margin:0 5px"></vxe-input>
          <vxe-input
              type="search"
              v-model="params.partNum"
              placeholder="生产型号"
              maxlength="17"
              @click="grid.clearSelected()"
              @search-click="searchList"
              @keydown="searchList"
              clearable
              style="width: 170px;margin-right: 5px"></vxe-input>
          <vxe-input
              type="search"
              v-model="params.partRev"
              placeholder="版本"
              maxlength="2"
              @click="grid.clearSelected()"
              @search-click="searchList"
              @keydown="searchList"
              clearable
              style="width: 80px;margin-right: 5px"></vxe-input>
          <vxe-input
              type="search"
              v-model="params.userName"
              placeholder="更新人"
              maxlength="100"
              @click="grid.clearSelected()"
              @search-click="searchList"
              @keydown="searchList"
              clearable
              style="width: 100px;margin-right: 5px"></vxe-input>
          <vxe-input
              type="search"
              v-model="params.riskComment"
              placeholder="风险内容"
              maxlength="100"
              @click="grid.clearSelected()"
              @search-click="searchList"
              @keydown="searchList"
              clearable
              style="width: 250px;margin-right: 5px"></vxe-input>



        </div>
      </template>
      <template #makeOrder_default="{row}">
        <t-switch v-model="row.makeOrder" @change="updateStatus(row)" v-bind="switchOptions" :disabled="row.status!=1"/>
      </template>
      <template #make_default="{row}">
        <t-switch v-model="row.make" @change="updateStatus(row)" v-bind="switchOptions" :disabled="row.status!=1"/>
      </template>
      <template #shipment_default="{row}">
        <t-switch v-model="row.shipment" @change="updateStatus(row)" v-bind="switchOptions" :disabled="row.status!=1"/>
      </template>
      <template #empty>
        <span>
          <img :src="noData">
          <p>{{ tishi }}</p>
        </span>
      </template>
    </vxe-grid>

    <vxe-modal
        v-model="addWindow"
        size="mini"
        width="600"
        :position="{ top: '10%' }"
        :loading="addWindowLoading"
        escClosable>
      <template #title>
        <t-button variant="text" size="small" @click="saveAddData">
          <template #icon>
            <t-icon name="save"/>
          </template>
          保存
        </t-button>
      </template>
      <template #default>
        <vxe-form :data="addData" title-width="60" title-align="right">
          <vxe-form-item field="riskComment" span="24">
            <template #default="data">
              <vxe-textarea
                  placeholder="请输入风险内容"
                  v-model="data.data.riskComment"
                  :autosize="{ minRows: 4, maxRows: 6 }"/>
            </template>
          </vxe-form-item>
          <vxe-form-item title="下单" span="8">
            <template #default="data">
              <t-switch v-model="data.data.makeOrder" v-bind="switchOptions"/>
            </template>
          </vxe-form-item>
          <vxe-form-item title="投产" span="8">
            <template #default="data">
              <t-switch v-model="data.data.make" v-bind="switchOptions"/>
            </template>
          </vxe-form-item>
          <vxe-form-item title="出货" span="8">
            <template #default="data">
              <t-switch v-model="data.data.shipment" v-bind="switchOptions"/>
            </template>
          </vxe-form-item>
          <vxe-form-item span="24">
            <template #default="data">
              <t-transfer
                  search
                  v-model="data.data.jobId"
                  :data="transferList "
                  :onSearch="transferSearch"
                  :operation="['移除', '加入']">
                <template #title="props">
                  <div>{{ props.type === 'target' ? '目标' : '来源' }}</div>
                </template>
              </t-transfer>
            </template>
          </vxe-form-item>
        </vxe-form>
      </template>
    </vxe-modal>

    <vxe-modal
        v-model="updateWindow"
        size="mini"
        width="600"
        :position="{ top: '10%' }"
        @close="updateWindowClose"
        :loading="updateWindowLoading"
        escClosable>
      <template #title>
        <t-button variant="text" size="small" @click="saveUpdateData">
          <template #icon>
            <t-icon name="save"/>
          </template>
          保存
        </t-button>
      </template>
      <template #default>
        <vxe-form :data="updateData" title-width="60" title-align="right">
          <vxe-form-item title="客户代码" span="6">
            <template #default="{ data }">
              <vxe-input v-model="data.custCode" disabled/>
            </template>
          </vxe-form-item>
          <vxe-form-item title="生产型号" span="12">
            <template #default="{ data }">
              <vxe-input v-model="data.partNum" disabled/>
            </template>
          </vxe-form-item>
          <vxe-form-item title="版本" span="6">
            <template #default="{ data }">
              <vxe-input v-model="data.partRev" disabled/>
            </template>
          </vxe-form-item>
          <vxe-form-item field="riskComment" span="24">
            <template #default="{ data }">
              <vxe-textarea
                  placeholder="请输入风险内容"
                  v-model="data.riskComment"
                  :autosize="{ minRows: 4, maxRows: 6 }"/>
            </template>
          </vxe-form-item>
        </vxe-form>
      </template>
    </vxe-modal>

  </div>
</template>

<script setup>
import {reactive, ref} from 'vue'
import noData from '@/core/assets/img/nodata.gif'
import {http} from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";


const api = {
  add: '/v1/erp2-risk-config/add',
  list: '/v1/erp2-risk-config/list',
  getJob: '/v1/erp2-risk-config/get-job',
}


const grid = ref()
const tishi = ref('请搜索风险警告！')
const params = reactive({
  custCode: '',//客户代码
  partNum: '',//生产型号
  partRev: '',//版本
  userName: '',//更新人
  riskComment: '',//风险内容
  currentPage: 1,//当前页
  pageSize: 100,//每页多少条
  status:1,//状态
})

const switchOptions = {
  label: ['开', '关'],
}

//表格配置
const gridOptions = reactive({
  id: 'riskConfig', //ID
  size: 'mini', //大小
  height: 'auto', //高度
  border: true, //边框
  stripe: true, //斑马线条纹
  align: 'center', //对齐
  showOverflow: true, //当内容过长时显示为省略号
  showHeaderOverflow: true, //当表头内容过长时显示为省略号
  headerRowStyle: {fontFamily: 'Microsoft YaHei', color: '#000'},
  rowStyle: {fontFamily: 'Microsoft YaHei', color: '#000'},
  rowClassName:({row})=>'status_'+row?.status,
  // showFooter: showFooter,
  // footerMethod: () => footerData,
  columnConfig: {
    // isHover: true,
    resizable: true,
    useKey: true,
  },
  customConfig: {
    storage: {
      visible: true,
      resizable: true,
      fixed: true,
    }
  },
  rowConfig: {
    useKey: true,
    isHover: true,
    // height: 30
  },
  sortConfig: {
    trigger: 'cell',
  },
  scrollY: {
    enabled: true,//横向虚拟滚动配置（不支持展开行）
  },
  scrollX: {
    enabled: true,//纵向虚拟滚动配置（不支持展开行）
  },
  mouseConfig: {
    selected: true, //鼠标选中单元格
  },
  keyboardConfig: {
    isArrow: true, //启用键盘事件
    isEnter: true, //回车键
    isTab: true, //TAB键
    enterToTab: true, //回车键转TAB键
  },
  toolbarConfig: {
    slots: {
      buttons: 'toolbar_buttons'
    },
    zoom: true,
    custom: true,
  },
  seqConfig: {
    seqMethod: ({rowIndex}) => params.pageSize * (params.currentPage - 1) + rowIndex + 1
  },
  columns: [
    {title: '序号', width: 46, type: 'seq', sortable: true},
    {title: '客户代码', width: 87, field: 'custCode', sortable: true},
    {title: '生产型号', width: 155, field: 'partNum', sortable: true},
    {title: '版本', width: 50, field: 'partRev'},
    {title: '风险内容', minWidth: 600, field: 'riskComment', align: 'left', sortable: true},
    {title: '下单', width: 58, field: 'makeOrder', slots: {default: 'makeOrder_default'}},
    {title: '投产', width: 58, field: 'make', slots: {default: 'make_default'}},
    {title: '出货', width: 58, field: 'shipment', slots: {default: 'shipment_default'}},
    {title: '状态', width: 87, field: 'status', formatter:({row})=>{
        return ['关闭','有效']?.[row.status] || row.status
      }, sortable: true},
    {title: '更新人', minWidth: 75, field: 'employeeName',formatter:({row})=>{
      return row?.employeeName?.length?row?.employeeName: row?.userName
      }, sortable: true},
    {title: '更新时间', minWidth: 132, field: 'createTime', sortable: true},

    {title: '用户ID', width: 87, field: 'userId', sortable: true,visible:false},
    {title: '型号ID', width: 87, field: 'jobId', sortable: true},
    {title: '风险ID', width: 87, field: 'id', sortable: true},
    {title: '风险PID', width: 87, field: 'pid', sortable: true,visible:false},
  ]
})


//穿梭框搜索
let t;
const transferList = ref([])
const transferSearch = (partNum) => {
  if (partNum.query.length < 4) return
  transferList.value = []
  clearTimeout(t);
  t = setTimeout(() => {
    http.get(api.getJob, {
      params: {partNum: partNum.query}
    }).then((res) => {
      if (res.data.code === 20000) {
        transferList.value = res.data.data
      } else {
        dialog.error(res.data.message)
      }
    })
  }, 200)
}


//添加窗口
const addWindow = ref(false)
const addWindowLoading = ref(false)
//添加与修改风险警告的数据
const addData = reactive({})
const addClick = () => {
  addWindowLoading.value = true
  Object.assign(addData, {
    riskComment: '',
    makeOrder: true,
    make: true,
    shipment: true,
    jobId: [],
  })
  transferList.value = []
  addWindowLoading.value = false
  addWindow.value = true
}

const saveAddData = () => {
  if (addData.riskComment === '') return dialog.warning('请输入风险内容')
  if (addData.jobId.length <= 0) return dialog.warning('请选择要添加的风险的型号')
  addWindowLoading.value = true
  http.post(api.add, {
    row: addData
  }).then((res) => {
    addWindowLoading.value = false
    addWindow.value = false
    if (res.data.code === 20000) {
      searchList()
      dialog.info(res.data.message)
    } else {
      dialog.warning(res.data.message)
    }
  })
}


//修改风险警告
let riskComment = ''
const updateData = ref()
//窗口
const updateWindow = ref(false)
const updateWindowLoading = ref(false)
const cellDblclick = ({row, column}) => {
  if (column.field !== 'riskComment' || row.status !='1') return
  updateWindowLoading.value = true
  riskComment = row.riskComment
  updateData.value = row
  updateWindow.value = true
  updateWindowLoading.value = false
}
const updateWindowClose = (event) => {
  updateData.value.riskComment = riskComment
}
const saveUpdateData = () => {
  if (updateData.value.riskComment === '') return dialog.warning('请输入风险内容')
  updateWindowLoading.value = true
  http.post(api.add, {
    row: updateData.value
  }).then((res) => {
    updateWindow.value = false
    updateWindowLoading.value = false
    if (res.data.code === 20000) {
      updateData.value.id = res.data.data.id
      dialog.info(res.data.message)
    } else {
      dialog.warning(res.data.message)
    }
  })
}


const updateStatus = async (row) => {
  if (!await dialog.confirmAsync('确认操作？')){
    searchList()
    return ;
  }
  http.post(api.add, {row}).then((res) => {
    if (res.data.code === 20000) {
      row.id = res.data.data.id
      dialog.info(res.data.message)
    } else {
      dialog.warning(res.data.message)
    }
  })
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
    return
  }
  tishi.value = '正在搜索数据，请稍等！'
  gridOptions.data = []
  http.get(api.list, {params}).then((res) => {
    tishi.value = '没有搜索到数据！' + res.data.message
    if (res.data.code === 20000) {
      for (const key in res.data.data) {
        res.data.data[key].makeOrder = res.data.data[key].makeOrder > 0
        res.data.data[key].make = res.data.data[key].make > 0
        res.data.data[key].shipment = res.data.data[key].shipment > 0
      }
      gridOptions.data = res.data.data
    }
  })
}
searchList()
</script>
<style>

.siyi-riskConfig {
  & .siyi-leftHide {
    margin-left: 162px;
  }

  .status_0{
    background-color: #fff;
    color: #c5c5c5 !important;
  }

  .t-transfer {
    .t-transfer__list {
      width: 246px;
      height: 300px;
    }

    .t-transfer__operations {
      width: 65px;
    }
  }

  .vxe-table--render-default .vxe-body--column,
  .vxe-table--render-default .vxe-footer--column,
  .vxe-table--render-default .vxe-header--column {
    line-height: normal;
  }
}
</style>