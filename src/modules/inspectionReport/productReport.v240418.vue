<template>
  <!-- 生成主检测报告 -->
  <div class="con">
    <vxe-toolbar ref="toolbarRef" perfect style="height: 60px">
      <template #buttons>
        <div style="display: flex; align-items: center; margin-top: 10px">
          <t-input style="width: 200px" v-model="searchPartNumber" placeholder="生产编号" @enter="search()" />
          <t-button @click="search()">搜索</t-button>
        </div>
        <div style="display: flex; align-items: center">
          <vxe-pulldown ref="pulldownRef" destroy-on-close>
            <template #default>
              <vxe-input v-model="searchName" placeholder="生产编号" @focus="focusEvent" @keyup="keyupEvent"></vxe-input>
              <vxe-input v-model="productReportData.period" placeholder="周期"></vxe-input>
            </template>
            <template #dropdown>
              <vxe-list height="200" class="my-dropdown2" :data="list" auto-resize>
                <template #default="{ items }">
                  <div class="list-item2" v-for="item in items" :key="item.value" @click="selectEvent(item)">
                    <span>{{ item.label }}</span>
                  </div>
                </template>
              </vxe-list>
            </template>
          </vxe-pulldown>
          <vxe-select v-model="productReportData.keyboarderId" placeholder="检验人" style="width: 100px"
            @change="changeOption(productReportData.keyboarderId)">
            <vxe-option v-for="num in users" :key="num" :value="num.recId" :label="num.employeeName"></vxe-option>
          </vxe-select>
          <vxe-select v-model="productReportData.approvedId" placeholder="批准人" style="width: 100px"
            @change="changeOption1(productReportData.approvedId)">
            <vxe-option v-for="num in users" :key="num" :value="num.recId" :label="num.employeeName"></vxe-option>
          </vxe-select>
          <t-button @click="create()">生成产品报告</t-button>
        </div>
      </template>
    </vxe-toolbar>
    <vxe-table ref="xTable" style="margin-top: 10px; height: 100%" v-bind="gridOptions"
      :row-config="{ isCurrent: true, isHover: true }" v-on="gridEvents">
      <vxe-column width="80px" title="操作">
        <template #default="{ row }">
          <vxe-button @click="editRow(row)">编辑</vxe-button>
        </template>
      </vxe-column>
      <vxe-column field="partNum" width="200px" title="LT料号" sortable />
      <vxe-column field="period" width="100px" title="周期" sortable />
      <vxe-column field="clientName" width="200px" title="客户名称" sortable />
      <vxe-column field="custMatCode" width="200px" title="客户料号" sortable />
      <vxe-column field="keyboarder" width="100px" title="检验人" sortable />
      <vxe-column field="approved" width="100px" title="批准人" sortable />
      <template #empty>
        <span><img src="../../../assets/img/nodata.gif" /> </span>
      </template>
    </vxe-table>
  </div>



<!-- 配置主报告内部的报告项目明细 -->
  <div class="con" v-if="status != 1">
    <h1 style="margin-top: 20px; text-align: center" v-if="show">产品检验报告</h1>
    <h1 style="margin-top: 20px; text-align: center" v-if="!show">
      双击左侧报告行查看报告项目
    </h1>
    <div style="text-align: center; margin-top: 10px" v-if="show">
      <t-button @click="release()">生成报告明细</t-button>
    </div>
    <div style="display: flex; flex-wrap: wrap; align-items: flex-start; padding: 10px" v-if="show">
      <div v-for="(item, index) in items" :key="index" class="repdiv">
        <vxe-select v-model="items[index].val5" style="width: 200px; margin-bottom: 10px" placeholder="报告类型"
          :options="opts5" @change="changeOptionIndex(index)"></vxe-select>
        <vxe-select v-model="items[index].changId" style="width: 200px; margin-bottom: 10px" placeholder="报告模板"
          :options="items[index].opts5"></vxe-select>
        <div style="margin-left: 10px">
          <t-button style="margin-bottom: 10px" @click="preview(index)">预览</t-button>
          <t-button style="margin-bottom: 10px" @click="save(index)">保存</t-button>
          <t-button style="margin-bottom: 10px" @click="deleteview(index)">删除</t-button>
        </div>
        <div>
          {{ items[index].type }}
        </div>
      </div>
      <div class="repdiv" @click="createReport()" v-if="status != 1">添加报告</div>
    </div>
  </div>


<!-- 当状态为已经生成时直接展示报告 -->
  <div class="con" v-if="status == 1">
    <h1 style="margin-top: 20px; text-align: center" v-if="show">产品检验报告填写</h1>
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
    <t-button variant="text" size="small" @click="saveCheckoutList()">
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

<!-- 预览报告模板 -->
  <vxe-modal v-model="showYL" title="预览" width="1000" :position="{ top: 200, left: 800 }">
    <template #default>
      <div style="display: flex; align-items: center">
        <t-input style="width: 200px" v-model="samplingQty" placeholder="出货数量" @enter="search2()" />
        <t-input style="width: 200px" v-model="samplingQty" placeholder="抽样数量" @enter="search2()" />
      </div>
      <vxe-table show-overflow height="300" :data="tableData2" v-on="gridEvents">
        <vxe-column type="seq" title="序号" width="60"></vxe-column>
        <vxe-column field="name" title="检验项目"></vxe-column>
        <vxe-column field="fun" title="检验方法"></vxe-column>
        <vxe-column field="specification" title="规格"></vxe-column>
        <vxe-column field="default" title="默认值"></vxe-column>
        <vxe-column field="keyboarder" title="录入人" show-overflow></vxe-column>
      </vxe-table>
      <div style="text-align: center; margin-top: 10px"></div>
    </template>
  </vxe-modal>
</template>

<script setup>
import { reactive, ref } from "vue";
import { http } from "../../../utils/fn.js";
import dayjs from "dayjs";
import { VXETable } from "vxe-table";
import dialog from "@/core/script/dialog.js";

const val5 = ref([]);
const users = ref([]);
const tableData = ref([]);
const tableData2 = ref([]);
const date = ref(dayjs().format("YYYY-MM-01 00:00:00"));
const items = ref([]);
const searchPartNumber = ref("");
const searchName = ref("");
const searchName1 = ref("");
const samplingQty = ref("");
const list = ref([]);
const mockData = ref([]);
const wolist = ref([]);
const woData = ref([]);
const pulldownRef = ref();
const pulldownRef1 = ref();
let mainReportId = ref();
const status = ref();
const show = ref(false);
const showYL = ref(false);
const showBG = ref(false);
const tableDataList = ref([])
const productReportData = reactive({
  jobId: "",
  partNum: "",
  period: "",
  reportType: "",
  keyboarderId: "",
  keyboarder: "",
  approvedId: "",
  approved: "",
});
const opts5 = ref([
  { value: 1, label: "出货检验报告" },
  { value: 2, label: "孔径&尺寸测量报告" },
  { value: 3, label: "切片检查报告" },
  { value: 4, label: "可焊性测试报告" },
  { value: 5, label: "电测试报告" },
  { value: 6, label: "热应力测试报告" },
  { value: 7, label: "阻抗测试报告" },
  { value: 8, label: "离子污染测试报告" },
]);


const api = {
  create: "v1/product-report/add-report",
  preview: "v1/product-report/preview-report",
  save: "v1/product-report/save-report",
  release: "v1/product-report/release",
  reportList: 'v1/product-report/report-list',
  checkoutList: '/v1/fillout-report/checkout-list',
  saveCheckoutList: '/v1/fillout-report/save-checkout-list',
  downloadCheckout: '/v1/fillout-report/download-checkout'
}



//生成主报告
const create = () => {
  http
    .post(api.create, { productReportData: productReportData })
    .then((res) => {
      dialog.success("生成成功");
      search();
    });
};

//预览
const preview = (index) => {
  const report = {
    type: items.value[index].val5,
    templateId: items.value[index].changId,
    mainReportId: mainReportId.value,
    jobId: jobId,
  };
  http.post(api.preview, { report: report }).then((res) => {
    tableData2.value = res.data.data;
  });
  showYL.value = true;
};

//保存
const save = (index) => {
  const report = {
    type: items.value[index].val5,
    templateId: items.value[index].changId,
    mainReportId: mainReportId.value,
    jobId: jobId,
    samplingQty: samplingQty.value,
  };
  http.post(api.save, { report: report }).then((res) => {
    if (res.data.code > 20000) {
      dialog.warning('该类型报告已保存，请勿重复添加！')
    } else {
      dialog.success('保存成功!')
    }
  });
};

//发布填写
const release = async () => {
  // const type = await VXETable.modal.confirm("发布填写后不可变更模板，是否确认发布？");
  status.value = 1;
  const report = {
    woId: woId,
    mainReportId: mainReportId.value,
    status: 1,
  };
  http.post(api.release, { report: report }).then((res) => { });
  search();
};



//补充填写报告
var reportList = [];
var partNum = '';
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




//双击选择事件
var jobId = "";
const cellDBLClickEvent = ({ row, column }) => {
  status.value=row.status;
  if (row.status == 1) {
    tableDataList.value = [];
    show.value = true;
    http.get(api.reportList + "?mainReportId=" + row.id).then((res) => {
      reportList = res.data.data;
      mainReportId = row.id;
      partNum = row.partNum;
      selectReport();
    });
  }
  items.value = [];
  mainReportId.value = row.id;
  status.value = row.status;
  jobId = row.jobId;
  show.value = true;
  http.get("v1/product-report/report-list?mainReportId=" + row.id).then((res) => {
    if (res.data.data.length != 0) {
      searchName1.value = res.data.data[0].woId;
    }
    res.data.data.forEach((element) => {
      items.value.push({
        val5: element.reportType,
        opts5: [],
        changId: element.templateId,
        reportId: element.id,
        type:
          opts5.value[opts5.value.findIndex((item) => item.value == element.reportType)]
            .label,
      });
    });
  });
};
const gridEvents = {
  //双击单元格时
  cellDblclick: cellDBLClickEvent,
};





const createReport = () => {
  if (items.value.length < 9) {
    items.value.push({ val5: "", opts5: [], changId: "" });
  } else {
    dialog.info("你最多可以添加9种报告");
  }
};
//删除报告
const deleteview = (index) => {
  http
    .get("v1/product-report/delete-view?reportId=" + items.value[index].reportId)
    .then((res) => { });
  items.value.splice(index, 1);
};

const focusEvent = () => {
  const $pulldown = pulldownRef.value;
  if ($pulldown) {
    $pulldown.showPanel();
  }
};
const keyupEvent = () => {
  list.value = searchName.value
    ? mockData.value.filter((item) => item.label.indexOf(searchName.value) > -1)
    : mockData.value;
};
const selectEvent = (item) => {
  const $pulldown = pulldownRef.value;
  if ($pulldown) {
    searchName.value = item.label;
    $pulldown.hidePanel().then(() => {
      list.value = mockData.value;
    });
  }
  productReportData.jobId = item.value;
  productReportData.partNum = item.label;
};

//导出
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

//目前只设计了单个报告保存提交
const saveCheckoutList = () => {
  console.log(tableDataList.value[0].data)
  http.post(api.saveCheckoutList, { tableDataList: tableDataList.value[0].data }).then((res) => {
    dialog.success('保存成功');
  });
}




// //工单号下拉选项
// const focusEvent1 = () => {
//   const $pulldown = pulldownRef1.value;
//   if ($pulldown) {
//     $pulldown.showPanel();
//   }
// };
// const keyupEvent1 = () => {
//   wolist.value = searchName1.value
//     ? woData.value.filter((item) => item.label.indexOf(searchName1.value) > -1)
//     : woData.value;
// };
// const selectEvent1 = (item) => {
//   const $pulldown = pulldownRef1.value;
//   if ($pulldown) {
//     searchName1.value = item.label;
//     $pulldown.hidePanel().then(() => {
//       wolist.value = woData.value;
//     });
//   }
//   woId = item.value;
// };

const changeOption = (num) => {
  if (changeOption != "") {
    productReportData.keyboarder =
      users.value[users.value.findIndex((item) => item.recId === num)].employeeName;
  }
};
const changeOption1 = (num) => {
  if (changeOption1 != "") {
    productReportData.approved =
      users.value[users.value.findIndex((item) => item.recId === num)].employeeName;
  }
};
const changeOptionIndex = (index) => {
  http
    .get("v1/product-report/modle-list", {
      params: {
        ltem: items.value[index].val5,
      },
    })
    .then((res) => {
      items.value[index].opts5 = res.data.data;
    });
};

http.get("v1/product-report/parlist", {}).then((res) => {
  mockData.value = res.data.data;
  list.value = res.data.data;
});
http
  .get("v1/inspection-report/list", {
    params: {
      user: 1,
    },
  })
  .then((res) => {
    users.value = res.data.data;
  });
const search = () => {
  http.get("v1/product-report/list").then((res) => {
    tableData.value = res.data.data;
  });
};

const gridOptions = reactive({
  id: "id", //ID
  size: "mini", //大小
  height: "auto", //高度
  // class: 'sortable-column-demo',
  border: true, //边框
  stripe: true, //斑马线条纹
  align: "center", //对齐
  showOverflow: true, //当内容过长时显示为省略号
  showHeaderOverflow: true, //当表头内容过长时显示为省略号
  data: tableData, //数据
  // showFooter: showFooter,
  // footerMethod: () => footerData,
  columnConfig: {
    isHover: true,
    resizable: true,
    useKey: true,
  },
  customConfig: {
    storage: {
      visible: true,
      // resizable: true,
      fixed: true,
    },
  },
  rowConfig: {
    useKey: true,
    isHover: true,
  },
  sortConfig: {
    trigger: "cell",
  },
  // checkboxConfig: {
  //     highlight: true,
  // },
  scrollY: {
    enabled: true,
  },
  scrollX: {
    enabled: true,
  },
  mouseConfig: {
    selected: true,
  },
  keyboardConfig: {
    isArrow: true,
    isEnter: true,
    isTab: true,
    enterToTab: true,
  },
  exportConfig: {
    filename: "files name",
    sheetName: "files name",
    mode: "current",
    modes: ["current", "selected"],
    original: true,
    isMerge: true,
    isAllExpand: true,
  },
});
search();
</script>

<style scoped>
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

.repdiv {
  flex: 0 0 calc(33.333% - 20px);
  height: 200px;
  margin-right: 10px;
  margin-bottom: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 10px;
  margin-right: 10px;
}




div>.t-progress-domo-margin:first-child {
  width: 200px;
  margin-top: 5px;
}

.t-progress-domo-margin {
  margin: 16px 0 4px;

}
</style>
