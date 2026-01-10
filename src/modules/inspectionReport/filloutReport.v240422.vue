<template>
  <div class="con" style="float: left; width: 50%">
    <vxe-grid ref="grid" v-bind="gridOptions" @cellDblclick="cellDblclick"
      :row-config="{ isCurrent: true, isHover: true }">
      <template #toolbar_buttons>
        <t-button variant="text" size="small" @click="searchList('prev')">
          <template #icon>
            <t-icon name="chevron-up" />
          </template>
          上一页
        </t-button>
        <t-button variant="text" size="small" @click="searchList('next')">
          <template #icon>
            <t-icon name="chevron-down" />
          </template>
          下一页
        </t-button>
        <vxe-input type="search" v-model="params.woNumber" placeholder="工单号" maxlength="4" @click="grid.clearSelected()"
          @search-click="searchList" @keydown="searchList" clearable style="width: 100px;margin:0 5px"></vxe-input>
        <vxe-input type="search" v-model="params.partNum" placeholder="生产型号" maxlength="17"
          @click="grid.clearSelected()" @search-click="searchList" @keydown="searchList" clearable
          style="width: 170px;margin-right: 5px"></vxe-input>
      </template>
      <template #empty>
        <span>
          <img :src="noData" />
          <p>{{ tishi }}</p>
        </span>
      </template>
    </vxe-grid>
  </div>

  <h1 style="margin-top: 20px; text-align: center" v-if="show">产品检验报告</h1>
  <h1 style="margin-top: 20px; text-align: center" v-if="!show">
    双击左侧报告行录入检测值
  </h1>

  <div class="con" style=" margin-top: 10px" v-if="show">
    <t-button variant="text" size="small" @click="download()">
      <template #icon>
        <t-icon name="download" />
      </template>
      导出
    </t-button>
    <t-button variant="text" size="small" @click="searchList('prev')">
      <template #icon>
        <t-icon name="chevron-up" />
      </template>
      上一项
    </t-button>
    <t-button variant="text" size="small" @click="searchList('next')">
      <template #icon>
        <t-icon name="chevron-down" />
      </template>
      下一项
    </t-button>
    <t-button variant="text" size="small" @click="save()">
      <template #icon>
        <t-icon name="hard-disk-storage" />
      </template>
      保存
    </t-button>
    <t-button variant="text" size="small" @click="addClick()">
      <template #icon>
        <t-icon name="add" />
      </template>
      提交
    </t-button>
    <vxe-table border show-overflow :data="tableDataList[0] ? tableDataList[0].data : []"
      :column-config="{ resizable: true }" :edit-config="{ trigger: 'click', mode: 'cell', showUpdateStatus: true }">
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column field="checkoutName" title="检测项目" :edit-render="{}">
      </vxe-column>
      <vxe-column field="inspectionMethod" title="检验方法" :edit-render="{}">
      </vxe-column>
      <vxe-column field="specification" title="规格" :edit-render="{}">
      </vxe-column>
      <vxe-column field="actual" title="实际值" :edit-render="{ autofocus: '.vxe-input--inner' }">
        <template #edit="{ row }">
          <vxe-input v-model="row.actual" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="judgement" title="判断" :edit-render="{}">
        <template #default="{ row }">
          <span>{{ formatSex(row.judgement) }}</span>
        </template>
        <template #edit="{ row }">
          <vxe-select v-model="row.judgement" transfer>
            <vxe-option v-for="item in sexList1" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
          </vxe-select>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { http } from "../../../utils/fn.js";
import noData from '@/core/assets/img/nodata.gif'
import dialog from "@/core/script/dialog.js";


const grid = ref()
const show = ref(false)
const tishi = ref('请搜索。。。。');
const params = reactive({
  woNumber: '',//客户代码
  partNum: '',//生产型号
  riskComment: '',//风险内容
  currentPage: 1,//当前页
  pageSize: 100,//每页多少条
})
const tableDataList = ref([])
const sexList1 = ref([
  { label: 'ACC', value: '1' },
  { label: 'NA', value: '0' }
])
const api = {
  list: '/v1/fillout-report/list',
  checkoutList: '/v1/fillout-report/checkout-list',
  downloadCheckout: '/v1/fillout-report/download-checkout',
  saveCheckoutList: '/v1/fillout-report/save-checkout-list',
  reportList: 'v1/product-report/report-list'
}

//搜索
const searchList = (type = 'init') => {
  tishi.value = '正在搜索数据，请稍等！'
  gridOptions.data = []
  http.get(api.list, { params }).then((res) => {
    tishi.value = '没有搜索到数据！'
    if (res.data.code === 20000) {
      gridOptions.data = res.data.data
    }
  })
}


var reportList = [];
var mainReportId = '';
var partNum='';
const cellDblclick = ({ row, column }) => {
  tableDataList.value = [];
  show.value = true;
  http.get(api.reportList + "?mainReportId=" + row.id).then((res) => {
    reportList = res.data.data;
    mainReportId = row.id;
    partNum=row.partNum;
    selectReport();
  });
}


const selectReport = () => {
  reportList.forEach(item => {
    http.get(api.checkoutList, {
      params: {
        reportType: item.reportType,
        id: item.id
      }
    }).then((res) => {
      tableDataList.value.push(res.data);
    });
  });
}
const formatSex = (value) => {
  if (value == '1') {
    return 'ACC'
  }
  if (value == '0') {
    return 'NA'
  }
  return ''
}


//目前只设计了单个报告保存提交
const save = () => {
  console.log(tableDataList.value[0].data)
  http.post(api.saveCheckoutList, { tableDataList: tableDataList.value[0].data }).then((res) => {
    dialog.success('保存成功');
  });
}
//目前只设计了单个报告保存提交
const addClick = () => {
  let count=0;
  if(tableDataList.value[0].data!=''){
    tableDataList.value[0].data.forEach(item=>{
      if(item.actual=='')count++;
    })
  }
  if(count>0){
    dialog.error('存在未填写的实际值，请填写完毕后提交！！！')
  }else{
    http.post(api.saveCheckoutList, { tableDataList: tableDataList.value[0].data ,status:1}).then((res) => {
      dialog.success('提交成功');
    });
  }
}

const download = async () => {
  await http.get(api.downloadCheckout + '?mainReportId=' + mainReportId, { responseType: 'blob'}).then((res) => {
   const url = URL.createObjectURL(res.data);  
    const exportLink = document.createElement('a');  
    exportLink.setAttribute("download", "出货报告"+partNum+".xlsx"); // 注意文件扩展名应该是.xlsx而不是.xlsl  
    exportLink.href = url;  
    document.body.appendChild(exportLink);  
    exportLink.click();  
    URL.revokeObjectURL(url); // 释放创建的URL对象  
  });
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
    seqMethod: ({ rowIndex }) => params.pageSize * (params.currentPage - 1) + rowIndex + 1
  },
  columns: [
    { title: '序号', width: 46, type: 'seq', sortable: true },
    { title: '工单号', width: 140, field: 'woNumber', sortable: true },
    { title: '生产型号版本', width: 160, field: 'partNum', sortable: true },
    { title: '周期', width: 63, field: 'period' },
    { title: '客户名称', width: 140, field: 'clientName' },
    { title: '客户料号', width: 140, field: 'custMatCode' },
    { title: '录入状态', minWidth: 600, field: 'riskComment', align: 'left', sortable: true },
    { title: '更新人', minWidth: 75, field: 'employeeName', sortable: true }
  ]
})

searchList()

</script>


<style>
.con {
  width: 100%;
  height: calc(100% - 38px);
  position: relative;
  float: left;
  width: 50%;
  height: 100%;
  border-right: 2px solid blue;
}

.con .vxe-toolbar {
  height: 150px;
}

.t-input__wrap,
.t-button--variant-base {
  margin-right: 5px;
}
</style>
