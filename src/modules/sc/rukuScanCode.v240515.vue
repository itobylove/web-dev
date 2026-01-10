<template>
  <div class="siyi-rukuScanCode">
    <div class="siyi-custCode">
      <t-input v-model="custCode" disabled label="客户代码" placeholder="没有输入客户代码"/>
    </div>
    <div class="siyi-table" ref="codeTable"></div>
    <t-popup v-model="showPopup" placement="top" style="padding: 30px">
      <t-input v-model="custCode" @blur="custCodeBlur" placeholder="请输入客户代码" clearable/>
    </t-popup>
    <t-dialog
        v-model:visible="showDialog"
        title="扫码内容确认"
        :content="scanChar"
        :cancel-btn="cancelBtn"
        :confirm-btn="confirmBtn"
        @confirm="onConfirm"
        @cancel="onCancel">
    </t-dialog>
  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, ref} from "vue"
import {ListTable} from "@visactor/vtable"
import _ from "lodash"
import VtableOptions from "../../core/script/tableOptions.js"
import * as core from "../../core/script/core"
import {Message, Toast} from "tdesign-mobile-vue"
import {http} from "../../core/script/api.js";


const api = {
  index: '/v1/ruku-scan-code/index',
  add: '/v1/ruku-scan-code/add',
}


//显示确认框
const showDialog = ref(false)
const showPopup = ref(false)


//扫描到的字符串
const scanChar = ref('')


const confirmBtn = {
  content: '确认',
  variant: 'text',
  size: 'large',
}


const cancelBtn = {
  content: '取消',
  variant: 'text',
  size: 'large',
};


//确认
const custCode = ref('')
const custCodeBlur = () => {
  if (custCode.value > 0 && custCode.value < 2500) {
    custCode.value = ('0000' + custCode.value).slice(-4)
  } else {
    Message.error({
      offset: [10, 20],
      content: '请输入0001-2500之间的客户代码！',
      closeBtn: true,
    })
    custCode.value = ''
  }
}


const onConfirm = () => {
  if (!custCode.value || !scanChar.value) {
    Message.error({
      offset: [10, 20],
      content: '客户代码或者扫码内容错误！',
      closeBtn: true,
    })
    return
  }
  http.post(api.add, {
    scanChar: scanChar.value,
    custCode: custCode.value
  }).then((res) => {
    if (res.data.code === 20000) {
      Toast({
        theme: 'success',
        direction: 'column',
        message: res.data.message,
      })
      codeTableOptions.records.unshift(res.data.data)
      codeTableObj.updateOption(codeTableOptions)
    } else {
      Toast({
        theme: 'error',
        direction: 'column',
        message: res.data.message,
      })
    }
  })
}


//取消
const onCancel = () => scanChar.value = ''


//表格对象
let codeTableObj
//表格
const codeTable = ref()
//表格配置
const codeTableOptions = _.merge({}, VtableOptions, {
  //自动行高
  heightMode: 'autoHeight',
  //自动换行
  autoWrapText: true,
  autoFillWidth: false,
  rowSeriesNumber: {
    title: '序号',
    width: 'auto',
    headerStyle: {
      fontSize: 12,
      color: '#6b6b6b',
      bgColor: '#f3f3f3',
    },
    style: {
      textAlign: 'center'
    }
  },
  records: [],
  columns: [
    {
      field: 'custCode',
      title: '客户代码',
      width: 'auto',
    },
    {
      field: 'code',
      title: '二维码数据',
      width: 300,
    },
    {
      field: 'employeeName',
      title: '用户名',
      width: 75,
    },
    {
      field: 'createTime',
      title: '扫码时间',
      width: 150,
    }
  ]
})
//获取后端数据
const getCodeTableData = () => {
  http.get(api.index).then((res) => {
    if (res.data.code === 20000) {
      codeTableOptions.records = _.merge([{}], res.data.data)
      codeTableObj.updateOption(codeTableOptions)
    }
  })
}


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  //注册一个扫码监听键盘事件
  core.scan(char => {
    //获取到扫码的字符串
    scanChar.value = char
    //显示弹框
    showDialog.value = true
  })
})


//生命周期钩子，加载完组件后执行
onMounted(() => {
  codeTableObj = new ListTable(codeTable.value, codeTableOptions)
  getCodeTableData()
})


</script>
<style scoped>
.siyi-rukuScanCode {
  width: 100%;
  height: 100%;
  position: absolute;

  > .siyi-custCode {
    width: 100%;
    height: 50px;
  }

  > .siyi-table {
    width: 100%;
    height: calc(100% - 50px);
  }

}
</style>