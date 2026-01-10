<template>
  <div class="siyi-testStand">
    <video class="siyi-video" ref="video" :src="videoBg" muted playsinline autoplay loop></video>
    <div>
      <div :class="['siyi-row1']" style="display: flex;align-items: center">
        <input v-model="test.keyWord" ref="searchInput" type="text" v-bind="test.searchOptions" style="flex:1;margin-right: 10px;margin-left: 10px" @input="test.search()"/>
        <select v-bind="test.selectOption" v-model="test.selectOption.value" v-on="test.selectEvents">
          <option :value="item.value" v-for="item in test.selectOption.option">{{ item.label }}</option>
        </select>
        <div v-on="test.buttonEvents" style="display:flex;margin-left: 5px;margin-right: 15px">添加</div>
      </div>
      <table border="0" cellpadding="0" cellspacing="0" class="table" ref="testTable">
        <caption>
          <div style="height: 20px;width: 99.8%">
            <div style="font-size: 50px;font-weight: bold">测试架寿命管控</div>
            <div style="float:right;margin-right: 20px;">
            <span style="font-size:24px;color: red">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" style="width: 45px;height: 45px" viewBox="-9 -19 40 40" stroke-width="1.2" stroke="currentColor" class="size-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"/>
              </svg>寿命危险:{{ risk }}个
            </span>


              <span style="font-size:24px;color: #E6A23C">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" style="width: 45px;height: 45px" viewBox="-9 -19 40 40" stroke-width="1.2" stroke="currentColor" class="size-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"/>
              </svg>寿命警告:{{ warn }}个
            </span>

              <span style="font-size:24px;color: #2BA471">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" style="width: 45px;height: 45px" viewBox="-9 -19 40 40" stroke-width="1.2" stroke="currentColor" class="size-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"/>
              </svg>寿命正常:{{ normal }}个
            </span>
            </div>

          </div>
        </caption>
        <thead>
        <tr>
          <th style="width: 5%">状态</th>
          <th style="width: 27%">测试架名称</th>
          <th style="width: 5%">版本</th>
          <th style="width: 31%">当前寿命/总寿命</th>
          <th style="width: 32%">工艺</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row,i) in VData" @dblclick="test.dblclick(row)">
          <td style="width: 5%;text-align: center" :style="row.current_num <= 10000 ? {color:'red'} : row.current_num > 10000 && row.current_num <= 20000 ? {color:'#E6A23C'} : {color:'#2BA471'}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-2 -3 28 28" stroke-width="1.2" stroke="currentColor" class="size-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"/>
            </svg>
          </td>
          <td style="width: 27%">{{ row.partNum }}</td>
          <td style="width: 5%">{{ row.partRev }}</td>
          <td style="width: 31%;padding: 0 2px">
            <t-progress theme="plump" size="large" :stroke-width="40" :label="row.text" track-color="white" :color="row.current_num <= 10000 ? 'red' : row.current_num > 10000 && row.current_num <= 20000 ? '#F59504' : '#2BA471'" :percentage="row.percentage"/>
          </td>
          <td style="width: 32%">{{ row.process }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!--新增修改-->
    <vxe-modal v-model="addWindow" v-bind="add.addOption">
      <template #title>
        <t-button variant="text" size="small" v-on="add.saveEvents">
          <template #icon>
            <t-icon name="setting"/>
          </template>
          {{ add.title }}
        </t-button>
        <t-button v-if="add.close" variant="text" size="small" v-on="add.closeEvents">
          <template #icon>
            <t-icon name="extension-off"/>
          </template>
          关闭
        </t-button>
      </template>
      <template #default>
        <div class="siyi-testStand-add">
          <div class="select-add">
            <span class="select-span">生产编号</span>
            <t-select v-model="add.jobOptions1.value" v-bind="add.jobOptions1" v-on="add.jobEvents1"/>
          </div>
          <div class="select-add">
            <span class="select-span">生产编号</span>
            <t-select v-model="add.jobOptions2.value" v-bind="add.jobOptions2" v-on="add.jobEvents2"/>
          </div>
          <t-input-adornment prepend="总寿命">
            <t-input-number v-model="add.total.total_num" v-bind="add.total" v-on="add.totalEvents"/>
          </t-input-adornment>
          <t-input-adornment v-if="add.current.hide" prepend="当前寿命">
            <t-input-number v-model="add.current.current_num" v-bind="add.current"/>
          </t-input-adornment>
          <t-input-adornment v-if="add.continue.hide" prepend="延续寿命">
            <t-input-number v-model="add.continue.continue_num" v-bind="add.continue"/>
          </t-input-adornment>
          <t-textarea v-if="add.description.hide" v-model="add.description.value" v-bind="add.description"/>
        </div>
      </template>
    </vxe-modal>
  </div>
</template>
<script setup>
import {onMounted, onActivated, onDeactivated, ref} from 'vue'
import $ from 'jquery'
import * as core from '../../core/script/core'
import {isLogin} from '../../core/script/user'
import {http} from "../../core/script/api.js";
import siyi from "../../core/script/siyi.js";
import dialog from "@/core/script/dialog.js";


const video = ref()
const videoBg = '/video/packingStandardBg.mp4'


const api = {
  index: '/v1/test-stand/index',
  save: '/v1/test-stand/save',
  getJob: '/v1/test-stand/job',
  produce: '/v1/test-stand/produce',
}
//原始数据
let Data = ref([])
let VData = ref([])

let risk = ref(0)
let warn = ref(0)
let normal = ref(0)

const searchInput = ref()
const testTable = ref()
const test = {
  searchOptions: {
    clearable: true,
    placeholder: '生产型号/工艺'
  },
  keyWord: '',
  selectOption: {
    value: 1,
    style: {width: '130px', height: '25px', color: 'red', backgroundColor: 'rgba(245,247,250,0.3)', display: 'inline-block', marginRight: '10px', borderRadius: '3px'},
    option: [
      {label: '湖北龙腾', value: 1},
      {label: '深圳龙腾', value: 4},
      {label: '珠海龙昌', value: 6},
    ],
  },
  selectEvents: {
    change(e) {
      clearInterval(T2.value)
      test.getData(1)
      T2.value = setInterval(() => {      // 页面测试架实时更新工艺
        test.getData(2)
      }, 120000)

    }
  },
  getData(type = 1) {
    let loading
    if (type === 1) loading =  dialog.loading(testTable.value)
    if (type === 2) test.keyWord = ''
    http.get(api.index, {
      params: {
        'keyWord': test.keyWord,
        'plantId': test.selectOption.value,
      }
    }).then(res => {
      if (res.data.code === 20000) {
        risk.value = 0
        warn.value = 0
        normal.value = 0
        Data.value = []
        VData.value = []
        for (const row in res.data.data) {
          const d = res.data.data[row]
          let _row = {}
          const percentage = d.current_num && d.total_num ? parseInt((d.current_num / d.total_num * 100).toString()) : 0;
          const text = !d.current_num ? '0/0' : d.current_num + '/' + d.total_num;
          _row['id'] = d.id
          _row['partNum'] = d.partNum
          _row['partRev'] = d.partRev
          _row['recId'] = d.recId
          _row['type'] = d.type
          _row['current_num'] = d.current_num
          _row['continue_num'] = d.continue_num
          _row['total_num'] = d.total_num
          _row['process'] = d.process
          _row['description'] = d.description
          _row['share'] = d.share ? d.share : []
          _row['text'] = text
          _row['percentage'] = percentage
          if (d.current_num <= 10000) {
            risk.value++
          } else if (d.current_num > 10000 && d.current_num <= 20000) {
            warn.value++
          } else {
            normal.value++
          }
          Data.value.push(_row)
        }
        VData.value = Data.value
        test.keyWord = ''
        //渲染视图
      } else {
        if (type !== 2) dialog.error(res.data.message)
      }
      if (type === 1) {
        loading.close()
        searchInput.value.focus()
      }
    })

  },
  buttonEvents: {                // 新增
    click() {
      test.init(1)
      add.value.addOption.height = '228'
      addWindow.value = true
    }
  },
  dblclick(row) {              // 双击
    test.init(2, row)
    add.value.addOption.height = '238'
    addWindow.value = true
  },
  async init(type = 1, row = {}) {
    add.value.jobOptions1.value = type === 1 ? [] : row.partNum + row.partRev
    add.value.jobOptions1.options = []
    add.value.jobOptions2.options = []
    if (type === 1) {
      add.value.jobOptions2.value = []
    } else {
      if (row.share !== undefined && row.share.length > 0) {
        add.value.jobOptions2.value = []
        row.share.forEach(item => {
          add.value.jobOptions2.options.push({
            label: item.num_rev,
            value: item.id
          })
          add.value.jobOptions2.value.push(item.id)
        })
      }
    }
    add.value.id = type !== 1 ? row.id : ''
    add.value.recId = type !== 1 ? row.recId : ''
    add.value.jobOptions1.disabled = type === 1 ? false : true
    add.value.jobOptions2.disabled = false
    add.value.total.total_num = type === 1 ? 100000 : row.total_num
    add.value.total.disabled = false
    add.value.current.current_num = type === 1 ? '' : row.current_num
    add.value.current.hide = type === 1 ? false : true

    add.value.continue.hide = type === 2 ? true : false

    if (add.value.continue.hide && row.total_num > 0) {         // 寿命延续输入框启用
      if (row.current_num <= 10000) add.value.continue.disabled = false
      if (row.continue_num) {
        add.value.continue.continue_num = row.continue_num
        add.value.continue.disabled = true
      }
    }

    add.value.description.hide = type === 2 ? false : true
    add.value.description.value = row.description
    add.value.close = type === 1 ? false : true
    add.value.title = type === 1 ? '新增' : '更新'
  },
  search() {
    clearInterval(T2.value)
    if (test.keyWord.length === 0) {
      VData.value = Data.value
      T2.value = setInterval(() => {      // 页面测试架实时更新工艺
        test.getData(2)
      }, 120000)
    } else {
      VData.value = core.data.search({data: Data.value, keyword: test.keyWord, columns: [{type: 'string', field: 'partNum'}, {type: 'string', field: 'process'}]})
    }
  }
}

//新增、修改窗口
const addWindow = ref(false)
const add = ref({
  id: '',
  recId: '',
  title: '',
  addOption: {
    size: 'mini',
    width: '390',
    height: '300',
    escClosable: true,
    position: {top: '20%'},
    loading: false,
    destroyOnClose: true,
  },
  jobOptions1: {
    value: [],
    multiple: false,
    filterable: true,
    clearable: true,
    placeholder: '请输入搜索',
    options: [],
    loading: false,
    reserveKeyword: true,
    style: {width: '300px', display: 'inline-block'},
  },
  jobOptions2: {
    value: [],
    selectedOptions: [],
    multiple: true,
    filterable: true,
    clearable: true,
    minCollapsedNum: 1,
    placeholder: '请输入搜索(共享寿命)',
    options: [],
    loading: false,
    reserveKeyword: true,
    style: {width: '300px', display: 'inline-block'},
  },
  jobEvents1: {
    enter(e) {
      add.value.getJob(e.inputValue, 1)
    },
    clear() {
      add.value.jobOptions1.options = []
    }
  },
  jobEvents2: {
    enter(e) {
      add.value.getJob(e.inputValue, 2)
    },
    clear() {
      add.value.jobOptions2.options = []
      add.value.jobOptions2.selectedOptions = []
    },
    change(v, e) {
      e.selectedOptions.forEach(item => {
        if (add.value.jobOptions2.selectedOptions.findIndex(obj => obj === item.label) === -1) {
          add.value.jobOptions2.selectedOptions.push(item.label)
        }
      })
    }
  },
  async getJob(keyword, type = 1) {
    type === 1 ? add.value.jobOptions1.loading = true : add.value.jobOptions2.loading = true
    const res = await http.get(api.getJob, {
      params: {
        'keyWord': keyword,
        'plantId': test.selectOption.value,
        'type': type,
      }
    })
    if (res.data.code === 20000) {
      for (const row in res.data.data) {
        if (type === 1) {
          add.value.jobOptions1.options.push({
            label: res.data.data[row].partNum + res.data.data[row].partRev,
            value: res.data.data[row].partNum + res.data.data[row].partRev + '_' + res.data.data[row].recId
          })
        } else {
          add.value.jobOptions2.options.push({
            label: res.data.data[row].partNum + res.data.data[row].partRev,
            value: res.data.data[row].id
          })
        }
      }
    } else {
      dialog.error(res.data.message)
    }
    type === 1 ? add.value.jobOptions1.loading = false : add.value.jobOptions2.loading = false
  },
  current: {
    current_num: '',
    disabled: true,
    hide: false,
    theme: 'column',
    style: {width: '300px'},
    min: '1000',
  },
  continue: {
    continue_num: '',
    disabled: true,
    hide: false,
    theme: 'column',
    step: '1000',
    style: {width: '300px'},
    min: '0',
  },
  total: {
    total_num: '',
    theme: 'column',
    min: '10000',
    step: '10000',
    style: {width: '314px'},
    hide: true,
    disabled: false,
  },
  totalEvents: {
    blur(value) {
      if (add.value.id === '') add.value.current.current_num = value
    },
    enter(value) {
      if (add.value.id === '') add.value.current.current_num = value
    }
  },
  description: {
    hide: true,
    value: '',
    placeholder: '请输入描述',
    defaultValue: '',
    style: {height: '70px', width: '300px'}
  },
  saveEvents: {
    click() {
      add.value.save()
      addWindow.value = false
    }
  },
  close: false,
  closeEvents: {
    click() {
      add.value.save(2)
      addWindow.value = false
    }
  },
  async save(type = 1) {
    if (add.value.jobOptions1.value === undefined) {
      dialog.error('生产编号不能为空！')
      return false
    }
    if (add.value.total.total_num === '') {
      dialog.error('总寿命不能为空！')
      return false
    }

    const partNum = add.value.jobOptions1.value.substring(0, 17)
    const partRev = add.value.jobOptions1.value.substring(17, 19)
    const job_rec_id = add.value.jobOptions1.value.substring(20)

    if (add.value.jobOptions2.selectedOptions.findIndex(obj => obj === partNum + partRev) > -1) {
      dialog.error('不能选择相同生产编号的测试架共享寿命！')
      return false
    }

    let share = []
    if (add.value.jobOptions2.value.length > 0) {
      add.value.jobOptions2.value.forEach(item => {
        share.push(item)
      })
    }

    const res = await http.post(api.save, {
      'id': add.value.id,
      'partNum': partNum,
      'partRev': partRev,
      'job_rec_id': job_rec_id ? job_rec_id : add.value.recId,
      'type': type,
      'plantId': test.selectOption.value,
      'share': share,
      'total_num': add.value.total.total_num,
      'current_num': add.value.current.current_num,
      'continue_num': add.value.continue.continue_num,
      'description': add.value.description.value,
    }).then((res) => {
      if (res.data.code === 20000) {
        dialog.info(res.data.message)
        test.getData()
      } else {
        dialog.error(res.data.message)
      }
    })

  }
})

//防止退出
const T1 = ref()
const T2 = ref()
const T3 = ref()
const noLoginOut = () => {
  T1.value = setInterval(() => {
    isLogin()
  }, 300000)

  T2.value = setInterval(() => {      // 页面测试架实时更新工艺
    test.getData(2)
  }, 120000)

  T3.value = setInterval(() => {      // 寿命减产出
    http.get(api.produce)
  }, 300000)
}

// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  siyi.navHide = true
  video.value.play().catch(error => console.warn('Playback was interrupted:', error));
  $(document).off('keydown.packingStandard').on('keydown.packingStandard', function (e) {
    if (e.keyCode === 13 && e.target.className.length === 0) searchInput.value.focus()
  })
  noLoginOut()
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  siyi.navHide = false
  $(document).off('keydown.packingStandard')
  clearInterval(T1.value)
  clearInterval(T2.value)
  clearInterval(T3.value)
})


onMounted(() => {
  test.getData()
  http.get(api.produce)
})

</script>
<style scoped>
.siyi-testStand {
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

    > .siyi-row1.siyi-leftHide {
      margin-left: 60px;
    }

  }

  .table tbody {
    display: block;
    height: 75vh;
    overflow-y: scroll;
  }

  .table thead, tbody tr {
    display: table;
    width: 99.8%;
    table-layout: fixed;
    box-sizing: border-box;
    height: 100px;
    font-size: 35px;
    font-weight: bold;
    text-align: center;
  }

  .t-button:hover {
    background-color: inherit;
    border-color: inherit;
  }

  .table thead {
    width: calc(99.8%);
    background-color: rgba(0, 0, 0, 0.3);
  }

  > table, th, td {
    border: 1px dashed #3ca4ff;
  }

  table tbody::-webkit-scrollbar {
    display: none;
  }

  .siyi-testStand-add {
    div {
      width: 100%;
      margin-bottom: 4px;

      > div {
        width: 50%;
        margin-bottom: 0px;
      }
    }
  }

  .select-add {
    font: var(--td-font-body-medium);
    color: var(--td-text-color-primary);
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
  }

  .select-span {
    display: inline-flex;
    background-color: #f3f4f7;
    height: 32px;
    align-items: center;
    box-sizing: border-box;
    white-space: nowrap;
    border-radius: 3px 0 0 3px;
    margin-right: -1px;
    padding: 0 var(--td-comp-paddingLR-s);
    border: 1px solid var(--td-border-level-2-color);
  }

}
</style>