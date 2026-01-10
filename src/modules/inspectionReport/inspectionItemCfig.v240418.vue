<template>
  <!-- 配置检测库 -->
  <div class="con" style="float: left; width: 50%;">
    <vxe-toolbar ref="toolbarRef" perfect>
      <template #buttons>
        <div style="display: flex; align-items: center;margin-top: 10px;">
          <t-input style="width: 200px;" v-model="name" placeholder="检验项目" @enter="search()" />
          <t-button @click="search()">搜索</t-button>
        </div>
        <div style="display: flex; align-items: center; width: 100%;">
          <vxe-form :data="formData">
            <vxe-form-item title="检验项目" field="name" :item-render="{}">
              <template #default="{ data }">
                <t-input style="width: 150px;" v-model="formData.name" placeholder="检验项目" />
              </template>
            </vxe-form-item>
            <vxe-form-item title="检验方法" field="fun" :item-render="{}">
              <template #default="{ data }">
                <t-input style="width: 200px;" v-model="formData.fun" placeholder="检验方法" />
              </template>
            </vxe-form-item>
            <vxe-form-item title="规格是否来自MI" field="isMi" :item-render="{}">
              <template #default="{ data }">
                <vxe-radio-group v-model="formData.isMi" :strict="false" @change="changeEvent(formData.isMi)">
                  <vxe-radio label="1" content=""></vxe-radio>
                </vxe-radio-group>
              </template>
            </vxe-form-item>
            <vxe-form-item title="项目规格" field="specification" :item-render="{}">
              <template #default="{ data }">
                <t-input style="width: 150px;" v-model="formData.specification" :disabled="formData.isMi == 1"
                  placeholder="项目规格" />
              </template>
            </vxe-form-item>
            <vxe-form-item title="默认实际值" field="defaulte" :item-render="{}">
              <template #default="{ data }">
                <t-input style="width: 150px;" v-model="formData.defaulte" placeholder="默认实际值" />
              </template>
            </vxe-form-item>
            <vxe-form-item title="检录人" field="keyboarderId" :item-render="{}">
              <template #default="{ data }">
                <vxe-select v-model="formData.keyboarderId" placeholder="检验录入人"
                  @change="changeOption(formData.keyboarderId)">
                  <vxe-option v-for="num in users" :key="num" :value="num.recId" :label="num.employeeName"></vxe-option>
                </vxe-select>
              </template>
            </vxe-form-item>
            <vxe-form-item>
              <template #default>
                <vxe-button type="submit" status="primary" :disabled="isButtonDisabled" content="保存"
                  @click="add()"></vxe-button>
              </template>
            </vxe-form-item>
          </vxe-form>
        </div>
      </template>
    </vxe-toolbar>
    <!-- 检测库列表 -->
    <vxe-table ref="xTable" v-bind="gridOptions" v-on="gridEvents1" style="margin-top: 10px;">
      <vxe-column width="80px" title="操作">
        <template #default="{ row }">
          <vxe-button @click="editRow(row)">编辑</vxe-button>
        </template>
      </vxe-column>
      <vxe-column field="name" width="100px" title="检验项目" sortable />
      <vxe-column field="fun" width="250px" title="检验方法" sortable />
      <vxe-column field="specification" width="200px" title="规格" sortable />
      <vxe-column field="defaulte" width="100px" title="默认值" sortable />
      <vxe-column field="keyboarder" width="100px" title="检录人" sortable />
      <template #empty>
        <span><img src="../../../assets/img/nodata.gif">
          <p>{{ tishi }}</p>
        </span>
      </template>
    </vxe-table>
  </div>

  <!-- 编辑检测项目库 -->
  <vxe-modal v-model="updateWindow" size="mini" width="400" :position="{ top: '10%' }" :loading="updateWindowLoading"
    @close="updateWindowClose()" escClosable>
    <template #title>
      <t-button variant="text" size="small" @click="add()">
        <template #icon>
          <t-icon name="save" />
        </template>
        保存
      </t-button>
    </template>
    <template #default>
      <t-form>
        <t-form-item label="检验项目" name="name" initial-data="TDesign">
          <t-input style="width: 200px;" v-model="formData.name" placeholder="检验项目" />
        </t-form-item>
        <t-form-item label="检验方法" name="tel" initial-data="123456">
          <t-input style="width: 200px;" v-model="formData.fun" placeholder="检验方法" />
        </t-form-item>
        <t-form-item label="检录人" name="tel" initial-data="123456">
          <vxe-select v-model="formData.keyboarderId" placeholder="检验录入人" @change="changeOption(formData.keyboarderId)">
            <vxe-option v-for="num in users" :key="num" :value="num.recId" :label="num.employeeName"></vxe-option>
          </vxe-select>
        </t-form-item>
        <t-form-item label="是否来自Mi" name="tel" initial-data="123456">
          <vxe-radio-group v-model="formData.isMi" :strict="false" @change="changeEvent(formData.isMi)">
            <vxe-radio label="1" content=""></vxe-radio>
          </vxe-radio-group>
        </t-form-item>
        <t-form-item label="项目规格" name="tel" initial-data="123456">
          <t-input style="width: 200px;" v-model="formData.specification" :disabled="formData.isMi == 1"
            placeholder="项目规格" />
        </t-form-item>
        <t-form-item label="默认实际值" name="tel" initial-data="123456">
          <t-input style="width: 200px;" v-model="formData.defaulte" placeholder="默认实际值" />
        </t-form-item>
      </t-form>
    </template>
  </vxe-modal>



  <!--出货检验报告模板列表  -->
  <div class="con" style="float: left; width: 50%; text-align: center;" v-if="!val2">
    <h1 style=" margin-top: 20px;">出货检验报告模板</h1>
    <vxe-toolbar ref="toolbarRef" perfect style=" height: 60px;">
      <template #buttons>
        <div style="display: flex; align-items: center;">
          <t-input style="width: 200px;" v-model="moudleName" placeholder="模板名称" @enter="search3()" />
          <t-button @click="search3()">搜索</t-button>
          <t-button @click="val2 = true">添加模板</t-button>
        </div>
      </template>
    </vxe-toolbar>
    <vxe-table ref="xTable1" border stripe height="850" :column-config="{ resizable: true }" v-on="gridEvents2"
      :row-config="{ isHover: true }" :checkbox-config="{ labelField: 'id', highlight: true, range: true }"
      :data="tableData4" style="margin-top: 10px;">
      <vxe-column type="seq" title="序号" width="60"></vxe-column>
      <vxe-column field="moudleName" title="模板名称"></vxe-column>
      <vxe-column field="clientName" title="客户名称"></vxe-column>
      <vxe-column field="createDate" title="创建时间"></vxe-column>
      <vxe-column field="note" title="备注"></vxe-column>
    </vxe-table>
  </div>
  <!-- 配置出货检验报告模板  -->
  <div class="con" style="float: left; width: 50%; text-align: center;" v-if="val2">
    <h1 style=" margin-top: 20px;">出货检验报告模板:{{ checkData.moudleName }}</h1>
    <div style="margin-top: 20px; margin-bottom: 20px;">
      <vxe-button @click="removeSelectRowEvent">删除选中</vxe-button>
      <vxe-button @click="val1 = true">保存</vxe-button>
      <vxe-button @click="close()">关闭</vxe-button>
      <vxe-table ref="xTable1" border stripe height="850" :column-config="{ resizable: true }"
        :row-config="{ isHover: true }" :checkbox-config="{ labelField: 'id', highlight: true, range: true }"
        :data="tableData3" style="margin-top: 10px;">
        <vxe-column type="seq" title="序号" width="60"></vxe-column>
        <vxe-column type="checkbox" title="ID" width="80"></vxe-column>
        <vxe-column field="name" title="检验项目"></vxe-column>
        <vxe-column field="fun" title="检验方法"></vxe-column>
        <vxe-column field="specification" title="规格"></vxe-column>
        <vxe-column field="defaulte" title="默认值"></vxe-column>
        <vxe-column field="keyboarder" title="录入人" show-overflow></vxe-column>
      </vxe-table>
    </div>

    <!-- 功能未设计，用于设置表演 -->
    <div>
      <vxe-checkbox v-model="checkData.LTLiaoHao" size="max" content="LT料号" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.CustomerName" size="max" content="客户名称" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.dc" size="max" content="周期" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.coustonerPn" size="max" content="客户料号" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.shippingQty" size="max" content="出货数量" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.sample" size="max" content="抽样数" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.partNum" size="max" content="生产编号" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.CustProductName" size="max" content="客户品名" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.deliveredQyt" size="max" content="交货数量" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
      <vxe-checkbox v-model="checkData.delivereDate" size="max" content="交货日期" :checked-value="1"
        :unchecked-value="0"></vxe-checkbox>
    </div>
  </div>


  <!-- 检测项参数列表 -->
  <vxe-modal v-model="showGC" title="选择MI参数" width="1000" :position="{ top: 200, left: 200 }">
    <template #default>
      <div style="display: flex; align-items: center;">
        <t-input style="width: 200px;" v-model="paname" placeholder="参数名称" @enter="search2()" />
        <t-button @click="search2()">搜索</t-button>
      </div>
      <vxe-table show-overflow height="300" :data="tableData2" v-on="gridEvents">
        <vxe-column field="plname" width="100px" title="工厂" sortable />
        <vxe-column field="scode" width="100px" title="工序代码" sortable />
        <vxe-column field="sname" width="150px" title="工序名称" sortable />
        <vxe-column field="prcode" width="150px" title="工艺代码" sortable />
        <vxe-column field="prname" width="150px" title="工艺名称" sortable />
        <vxe-column field="pacode" width="150px" title="参数代码" sortable />
        <vxe-column field="paname" width="150px" title="参数名称" sortable show-overflow />
      </vxe-table>
    </template>
  </vxe-modal>

  <!-- 弹出保存模板 -->
  <vxe-modal v-model="val1">
    <template #default>
      <div style="margin-top: 2%;display: flex; align-items: center;">请输入公司：
        <vxe-pulldown ref="pulldownRef" destroy-on-close>
          <template #default>
            <vxe-input v-model="searchName" placeholder="请输入客户代码或名称" @focus="focusEvent"
              @keyup="keyupEvent"></vxe-input>
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
      </div>
      <div style="margin-top: 2%;display: flex; align-items: center;">请输入名称：<t-input style="width: 300px;"
          v-model="checkData.moudleName" placeholder="模板名称" /></div>
      <div style="margin-top: 2%;display: flex; align-items: center;">
        备注：<vxe-textarea v-model="checkData.note" :autosize="{ minRows: 3, maxRows: 10 }" /></div>
      <div style="text-align: center; margin-top: 10px;">
        <t-button @click="saveEvent()">提交</t-button>
      </div>
    </template>
  </vxe-modal>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { http } from '../../../utils/fn.js'
import { VXETable } from 'vxe-table'
import dialog from "@/core/script/dialog.js";
const xTable1 = ref()
const name = ref('')
const prname = ref('')
const paname = ref('')
const moudleName = ref('')
const tableData = ref([])
const tableData1 = ref([])
const tableData2 = ref([])
const tableData3 = ref([])
const tableData4 = ref([])
const showGC = ref(false)
const users = ref([])
const tishi = ref('请搜索报表')
const isButtonDisabled = ref(false)
const val1 = ref(false)
const val2 = ref(false)
const searchName = ref('')
const list = ref([])
const mockData = ref([])
const pulldownRef = ref()


const api = {
  addTemplate: 'v1/inspection-report/add-template',
  add:'/v1/inspection-report/add',
  customerList:'v1/inspection-report/customer-list'
}


//添加报表
const formData = reactive({
  id: '',
  name: '',
  isMi: '0',
  fun: '',
  specification: ''
  , processId: ''
  , parametersId: ''
  , keyboarderId: ''
  , keyboarder: ''
  , defaulte: ''
})

//添加复选框，模板字段
const checkData = reactive({
  id: '',
  moudleName: '',
  ltem: '',
  LTLiaoHao: 1,
  CustomerName: 1,
  dc: 1,
  coustonerPn: 1,
  shippingQty: 1,
  sample: 1,
  partNum: '',
  CustProductName: '',
  deliveredQyt: '',
  delivereDate: '',
  note: ''
})



const add = () => {
  http.post(api.add, { formData: formData }).then((res) => {
    if (res.data.code == 20000) {
      dialog.success('添加成功');
      formData.id = '',
        formData.name = '',
        formData.isMi = 0,
        formData.fun = '',
        formData.specification = ''
      formData.processId = ''
      formData.parametersId = ''
      formData.keyboarderId = ''
      formData.keyboarder = ''
      formData.defaulte = ''
      updateWindow.value = false
      search();
    }
    if (res.data.code == 40029) {
      dialog.error('添加失败')
    }
  })
}
//编辑
const updateWindow = ref(false)
const updateWindowLoading = ref(false)
const editRow = (RowVO) => {
  http.get('v1/inspection-report/list', {
    params: {
      name: name.value,
      id: RowVO.id
    }
  }).then((res) => {
    formData.id = RowVO.id
    formData.name = res.data.data[0].name
    formData.isMi = res.data.data[0].isMi
    formData.fun = res.data.data[0].fun
    formData.specification = res.data.data[0].specification
    formData.processId = res.data.data[0].processId
    formData.parametersId = res.data.data[0].parametersId
    formData.keyboarderId = res.data.data[0].keyboarderId
    formData.keyboarder = res.data.data[0].keyboarder
    formData.defaulte = res.data.data[0].defaulte
  })

  updateWindowLoading.value = true
  updateWindow.value = true
  updateWindowLoading.value = false
}
const updateWindowClose = () => {
  formData.name = '',
    formData.isMi = '0',
    formData.fun = '',
    formData.specification = ''
  formData.processId = ''
  formData.parametersId = ''
  formData.keyboarderId = ''
  formData.keyboarder = ''
  formData.defaulte = ''
}



// 保存模板的方法
const saveEvent = () => {
  if (tableData3.value.length == 0) {
    dialog.warning("你还未添加检测项目，请添加后提交！")
  } else {
    checkData.ltem = ''
    tableData3.value.forEach(item => {
      const i = tableData3.value.findIndex(it => it.id === item.id)
      if (i != tableData3.value.length - 1) {
        checkData.ltem += item.id + ','
      } else {
        checkData.ltem += item.id
      }
    })
  }
  if (checkData.moudleName == '') {
    dialog.warning("出货检验报告模板名称不能为空！！")
  } else {
    http.post(api.addTemplate, { checkData: checkData }).then((res) => {
      if (res.data.code == 20000) {
        dialog.success('保存成功');
        val1.value = false
      }
      if (res.data.code == 40029) {
        dialog.error('保存失败')
      }
    })
  }
}



//初始化保存数据获取客户列表
const save=()=>{
  val1.value  = true
  http.get(api.customerList).then((res)=>{
    mockData.value = res.data.data
    list.value = data.data 
  })
}
// 大数据搜索下拉框，选择客户
const focusEvent = () => {
  const $pulldown = pulldownRef.value
  if ($pulldown) {
    $pulldown.showPanel()
  }
}
const keyupEvent = () => {
  list.value = searchName.value ? mockData.value.filter((item) => item.label.indexOf(searchName.value) > -1) : mockData.value
}
const selectEvent = (item) => {
  const $pulldown = pulldownRef.value
  if ($pulldown) {
    searchName.value = item.label
    $pulldown.hidePanel().then(() => {
      list.value = mockData.value
    })
  }
}








const changeEvent = (params) => {
  if (params == '1') {
    showGC.value = true;
  } else {
    formData.isMi = "0"
  }
}
const changeOption = (num) => {
  if (changeOption != '') {
    formData.keyboarder = users.value[users.value.findIndex(item => item.recId === num)].employeeName
  }
}

const removeSelectRowEvent = () => {
  const $table = xTable1.value
  if ($table) {
    $table.getCheckboxRecords().forEach(element => {
      const i = tableData3.value.findIndex(item => item.id === element.id)
      if (i != -1) {
        tableData3.value.splice(i, 1);
      }
    });

    $table.removeCheckboxRow()

  }
}


const gridOptions = reactive({
  id: 'riskConfig',//ID
  size: 'mini',//大小
  height: 'auto',//高度
  // class: 'sortable-column-demo',
  border: true,//边框
  stripe: true,//斑马线条纹
  align: 'center', //对齐
  showOverflow: true,//当内容过长时显示为省略号
  showHeaderOverflow: true,//当表头内容过长时显示为省略号
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
    }
  },
  rowConfig: {
    useKey: true,
    isHover: true,
  },
  sortConfig: {
    trigger: 'cell',
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
    selected: true
  },
  keyboardConfig: {
    isArrow: true,
    isEnter: true,
    isTab: true,
    enterToTab: true,
  },
  exportConfig: {
    filename: 'files name',
    sheetName: 'files name',
    mode: 'current',
    modes: ['current', 'selected'],
    original: true,
    isMerge: true,
    isAllExpand: true
  },
})




//双击选择MI参数事件
const cellDBLClickEvent = ({ row, column }) => {
  formData.processId = row.prrecId;
  formData.parametersId = row.parecId;
  formData.specification = 'MI参数：' + row.paname
  showGC.value = false
}
//事件
const gridEvents = {
  //双击单元格时
  cellDblclick: cellDBLClickEvent,
}


//双击选择检测项目事件
const cellDBLClickEvent1 = ({ row, column }) => {
  if (tableData3.value.findIndex(item => item.id === row.id) != -1) {
    dialog.error('模板中已有检测项目，请勿重复添加！')
  } else if (val2.value) {
    tableData3.value.push(row)
  }
  console.log(tableData3.value);
}
const gridEvents1 = {
  //双击单元格时
  cellDblclick: cellDBLClickEvent1,
}


//双休修改检测报告模板
const cellDBLClickEvent2 = ({ row, column }) => {
  checkData.moudleName = row.moudleName;
  http.get('v1/inspection-report/list', {
    params: {
      ltem: row.ltem,
    }
  }).then((res) => {
    tableData3.value = res.data.data
  })
  // checkData.id= row.id,
  // checkData.moudleName= row.moudleName,
  // checkData.ltem= row.ltem,
  // checkData.LTLiaoHao= row.LTLiaoHao,
  // checkData.CustomerName= row.CustomerName,
  // checkData.dc= row.dc,
  // checkData.coustonerPn= row.coustonerPn,
  // checkData.shippingQty= row.shippingQty,
  // checkData.sample= row. sample,
  // checkData.partNum= row.partNum,
  // checkData.CustProductName=row. CustProductName,
  // checkData.deliveredQyt= row. deliveredQyt,
  // checkData.delivereDate= row. delivereDate,
  // checkData.note= row. note

  console.log(checkData);
  val2.value = true;
}
//事件
const gridEvents2 = {
  //双击单元格时
  cellDblclick: cellDBLClickEvent2,
}




const close = async () => {
  const type = await VXETable.modal.confirm('您确定要删关闭吗？关闭前请注意保存。')
  if (type == 'confirm') {
    val2.value = false
    tableData3.value = []
    checkData.moudleName = ''
  }
  search3();
}



const search = () => {
  http.get('v1/inspection-report/list', {
    params: {
      name: name.value,
    }
  }).then((res) => {
    if (res.data.code == 20000) {
      tishi.value = '没有过滤到数据！'
      tableData.value = res.data.data
    }
    if (res.data.code == 40029) {
      tableData.value = []
    }

    tishi.value = res.data.message
  })

  http.get('v1/inspection-report/list', {
    params: {
      user: 1,
    }
  }).then((res) => {
    users.value = res.data.data
  })
  // search2();
}
const search2 = () => {
  http.get('v1/inspection-report/listcanshu', {
    params: {
      prname: prname.value,
      paname: paname.value,
    }
  }).then((res) => {
    if (res.data.code == 20000) {
      tableData2.value = res.data.data
    }
    if (res.data.code == 40029) {
      tableData2.value = []
    }
  })
}
const search3 = () => {
  http.get('v1/inspection-report/list-moudle', {
    params: {
      moudleName: moudleName.value
    }
  }).then((res) => {
    if (res.data.code == 20000) {
      tableData4.value = res.data.data
      console.log(tableData4.value);
    }
    if (res.data.code == 40029) {
      tableData4.value = []
    }
  })
}
search();
search3();


const addData = () => {
  isButtonDisabled.value = true;
  http.post('/v1/cimforce-report/add', { formData: formData }).then((res) => {
    if (res.data.code == 20000) {
      dialog.success('添加成功');
      search();
      showAdd.value = false
    }
    if (res.data.code == 40029) {
      dialog.error('添加失败')
    }
  })
  isButtonDisabled.value = false;
}




</script>

<style scoped>
.con {
  width: 100%;
  height: calc(100% - 38px);
  position: relative;
}

.con .vxe-toolbar {
  height: 150px;
}

.t-input__wrap,
.t-button--variant-base {
  margin-right: 5px;
}
</style>