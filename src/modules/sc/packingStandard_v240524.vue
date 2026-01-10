<template>
  <div class="siyi-packingStandard">
    <video class="siyi-video" ref="video" :src="videoBg" muted playsinline autoplay loop></video>
    <div>
      <div class="siyi-row1">
        <input ref="searchInput" value="0974" type="text" @keyup.enter="getData" placeholder="客户代码或生产型号"/>
        <div @click="addData">添加</div>
      </div>
      <div class="siyi-row2">
        <span>{{ VData[0]?.code }} 包装要求</span>
        <div v-for="row in VData" @dblclick="updateData(row)" v-show="row.status">
          <div><span>{{ row.name }}</span></div>
          <div><span>{{ row.value }}</span></div>
          <div><span>{{ row.remark }}</span></div>
        </div>
      </div>
    </div>
    <vxe-modal
        v-model="addWin"
        size="mini"
        width="400"
        :position="{top: '20%'}"
        :loading="addWinLoading"
        escClosable>
      <template #title>
        <t-button variant="text" size="small" @click="saveData(1)">
          <template #icon>
            <i class="ri-save-line"/>
          </template>
          保存
        </t-button>
        <t-button :disabled="deleteButtonDisabled" variant="text" size="small" @click="saveData(0)">
          <template #icon>
            <t-icon name="delete"/>
          </template>
          删除
        </t-button>
      </template>
      <template #default>
        <div class="siyi-addWin">
          <t-select v-model="editData.type" :disabled="typeDisabled" :options="editDataType"/>
          <t-input v-model="editData.code" :disabled="codeDisabled" @blur="selectCodeGetData"/>
          <t-input-adornment prepend="项目">
            <t-input v-model="editData.name"/>
          </t-input-adornment>
          <t-input-adornment prepend="标准">
            <t-input v-model="editData.value"/>
          </t-input-adornment>
          <t-input-adornment prepend="备注">
            <t-input v-model="editData.remark"/>
          </t-input-adornment>
        </div>
      </template>
    </vxe-modal>
  </div>
</template>
<script setup>
import {onMounted, onActivated, onDeactivated, ref} from 'vue'
import $ from 'jquery'
import {isLogin} from '@/core/script/user'
import {http} from '@/core/script/api'
import dialog from "@/core/script/dialog.js";
import siyi from '@/core/script/siyi.js'


const video = ref()
const videoBg = '/video/packingStandardBg.mp4'


const api = {
  index: '/v1/packing-standard/index',
  save: '/v1/packing-standard/save',
  getCode: '/v1/packing-standard/get-code',
}

//获取数据
const VData = ref([])
const searchInput = ref()
const getData = () => {
  if (!searchInput.value.value.length) return
  http.get(api.index, {
    params: {keyWord: searchInput.value.value}
  }).then(res => {
    if (res.data.code === 20000) {
      VData.value = res.data.data
    } else {
      VData.value = [
        {
          id: "0",
          linkid: "0",
          type: "1",
          code: '',
          name: "暂无",
          value: "暂无",
          remark: "暂无",
          status: "1"
        }
      ]
      console.log(VData.value)
      dialog.error(res.data.message)
    }
  })
  searchInput.value.value = ''
  searchInput.value.focus()
}


//窗口
const addWin = ref(false)
//窗口加载
const addWinLoading = ref(false)
//类型选择状态
const typeDisabled = ref(false)
//代码状态
const codeDisabled = ref(false)
//删除按钮状态
const deleteButtonDisabled = ref(false)
//编辑中的数据
const editData = ref({})
//类型
const editDataType = [
  {label: '客户代码', value: '1'},
  {label: '生产型号', value: '2'},
]


///
const selectCodeGetData = () => {
  if (editData.value.code === '') return
  addWinLoading.value = true
  http.get(api.getCode, {
    params: {
      type: editData.value.type,
      code: editData.value.code,
    }
  }).then((res) => {
    addWinLoading.value = false
    if (res.data.data === false) {
      editData.value.linkid = 0
      editData.value.code = ''
      dialog.warning('没有搜索到数据，请重新输入')
    } else if (res.data.code === 20000) {
      Object.assign(editData.value, res.data.data)
    } else {
      dialog.success(res.data.message)
    }
  })
}


//添加数据
const addData = () => {
  //默认值
  editData.value = {
    linkid: 0,
    type: '1',
    code: '',
    name: '',
    value: '',
    remark: '',
    status: 1,
  }
  typeDisabled.value = false
  codeDisabled.value = false
  deleteButtonDisabled.value = true //删除按钮不给用
  addWin.value = true //打开窗口
}


//更新数据
const updateData = row => {
  row.type = String(row.type)
  editData.value = row
  typeDisabled.value = true
  codeDisabled.value = true
  deleteButtonDisabled.value = false
  addWin.value = true
}


//保存数据
const saveData = status => {
  if (!editData.value.linkid) {
    dialog.warning('请填写完整数据！')
    return
  }
  editData.value.status = status
  addWinLoading.value = true
  http.post(api.save, editData.value).then((res) => {
    addWinLoading.value = false
    if (res.data.code === 20000) addWin.value = false
    dialog.success(res.data.message)
  })
}

//防止退出
const T = ref()
const noLoginOut = () => {
  T.value = setInterval(() => {
    isLogin()
  }, 300000)
}


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  siyi.navHide = true
  video.value.play().catch(error => console.warn('Playback was interrupted:', error));
  $(document).off('keydown.packingStandard').on('keydown.packingStandard', function (e) {
    if (e.keyCode === 13) searchInput.value.focus()
  })
  noLoginOut()
})


// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  siyi.navHide = false
  $(document).off('keydown.packingStandard')
  clearInterval(T.value)
})


onMounted(() => {
  getData()
})

</script>
<style scoped>
.siyi-packingStandard {
  user-select: none;

  > video {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    object-fit: cover;
  }

  > div {
    width: 100%;
    height: 100%;
    position: absolute;
    display: grid;
    grid-template-rows:  32px auto;
    color: #FFF;

    > .siyi-row1 {
      display: grid;
      grid-template-columns: auto 60px;
      line-height: 32px;
      background: #13151d;

      > input {
        background: transparent;
        outline: none;
        border: 0;
        color: #FFF;
        font-size: 18px;
      }

      > div {
        text-align: center;
        font-size: 18px;
        cursor: pointer;
      }
    }


    > .siyi-row2 {
      text-align: center;
      font-size: 60px;
      font-weight: bold;
      overflow: auto;

      > div {
        width: 100%;
        padding: 0 1px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;

        > div {
          padding: 20px 0;
          border: 1px dashed #3ca4ff;
          background: rgba(0, 0, 0, .2);
          display: grid;
          place-items: center;
        }
      }
    }
  }

  & .siyi-addWin {
    display: grid;
    grid-template-rows: 32px;
    grid-gap: 10px;
  }
}
</style>