<template>
  <div class="body">
    <div class="left">
      <div class="search">
        <t-input @change="obj.search" placeholder="请输入搜索内容" />
      </div>
      <div class="siyi-table">
        <table>
          <thead>
            <tr>
              <th>参数编码</th>
              <th>参数名称</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in refObj.parameterList">
              <tr @click="obj.clickItem(item)" :class="{ active: item.selected }">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <div class="right" ref="leftWrap">
      <div v-for="item in refObj.selectList">
        <div class="select-list">
          <div class="parameter-name">
            <span class="title">参数名称：</span>{{ item.name }}
          </div>
          <div class="parameter-value">
            <span class="title">参数值：</span>
            <template v-if="item.input_type === 'number'">
              <t-input-number v-model="item.parameter_value" style="width: 198px;" />
            </template>
            <template v-else-if="item.input_type === 'string'">
              <t-input v-model="item.parameter_value" style="width: 198px;" />
            </template>
            <template v-else-if="item.input_type === 'switch'">
              <t-switch v-model="item.parameter_value" :label="['是', '否']" />
            </template>
            <template v-else-if="item.input_type === 'date'">
              <t-date-picker v-model="item.parameter_value" />
            </template>
            <template v-else-if="item.input_type === 'radio'">
              <t-radio-group v-model="item.parameter_value">
                <t-radio value="1">是</t-radio>
                <t-radio value="0">否</t-radio>
              </t-radio-group>
            </template>
            <template v-else-if="item.input_type === 'select'">
              <t-select v-model="item.parameter_value" creatable :options="refObj.selectOptions" filterable
                @create="obj.createGroupOptions" />
            </template>
            <template v-else-if="item.input_type === 'time'">
              <t-time-picker v-model="item.parameter_value" />
            </template>
            <template v-else-if="item.input_type === 'textarea'">
              <t-textarea v-model="item.parameter_value" />
            </template>
          </div>
        </div>
      </div>
      <div class="btn" v-if="refObj.selectList.length > 0">
        <span @click="obj.reset" class="reset-btn">重置</span>
        <span @click="obj.addParameter" class="add-btn">添加</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, nextTick, ref } from 'vue';
import apiUrl from '@/core/config/url2';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import _ from "lodash";

const props = defineProps({
  query: {
    type: Object,
    default: {}
  },
  dialog: { type: Object },
  getAttach: { type: Function, default: () => { } },
});
const leftWrap = ref(null)
const refObj = reactive({
  parameterShow: false,
  parameterList: [],
  selectList: [],
  search: '',
  template: '',
  activeItem: null,
  value: [],
  selectOptions: [], //下拉框选项
});
const obj = {
  lists: [],
  //点击参数
  clickItem: (e) => {
    e.selected = !e.selected
    //往现存数组中添加元素，相同则移除它
    if (refObj.selectList.includes(e)) {
      // 如果元素存在，使用 filter 方法移除它
      refObj.selectList = refObj.selectList.filter(item => item !== e);
    } else {
      // 如果元素不存在，使用 push 方法添加它
      e.parameter_value = '';
      refObj.selectList.push(e);
      nextTick(() => {
        obj.scrollToBottom()
      })
    }

  },
  //添加参数
  addParameter: async () => {
    const res = await api.post(apiUrl.sys.asset.addParameter, { id: props.query.asset.id, items: refObj.selectList })
    if (typeof (res.ret) === 'boolean') {
      if (res.ret === true) {
        props.getAttach(true);
        dialog.success('添加成功');
      } else {
        dialog.error('添加失败');
      }
    } else if (typeof (res.ret) === 'number') {
      if (res.ret < 0) {
        dialog.error('参数错误，请确认后再操作');
      }
    } else {
      dialog.error('网络错误，请稍后再试');
    }
    props.dialog.close();
  },
  //重置
  reset: () => {
    refObj.parameterList.forEach(item => item.selected = false);   //清空选中状态
    refObj.selectList = [];
  },
  //搜索
  search: (e) => {
    clickCellDebounce(e);
  },
  //创建下拉框选项
  createGroupOptions: (value) => {
    refObj.selectOptions.push({
      value,
      label: value,
    });
  },
  scrollToBottom: () => {
    const wrap = leftWrap.value
    if (!wrap) return
    // 滚动条置底
    wrap.scrollTop = wrap.scrollHeight
  }
};
const clickCellDebounce = _.debounce((e) => {
  if (e.length === 0) {
    refObj.parameterList = obj.lists;
    return;
  }
  const ret = obj.lists.filter(item => item.name.includes(e) || item.code.includes(e));
  refObj.parameterList = ret;
}, 500);

onMounted(async () => {
  await api.get(apiUrl.sys.asset.addParameterList, { id: props.query.asset.id, type: props.query.asset.type, flag: true }).then(res => {
    refObj.parameterList = res.list;   //设置参数列表数据
    obj.lists = res.list;
  });
});
</script>

<style scoped>
.body {
  display: flex;
  height:764px;
  padding: 3px;

  .active {
    background: #35a1fd;
  }

  .left {
    .search {
      position: sticky;
      top: 0;
    }

    width: 40%;
    overflow: auto;
    scrollbar-width: none;
    -webkit-scrollbar-width: none;
    -ms-overflow-style: none;

    .siyi-table {
      tr {
        height: 35px;
      }
    }
  }

  .right {
    flex: 1;
    margin-left: 3px;
    padding: 3px 3px 20px 3px;
    border: 1px solid #ccc;
    overflow: auto;
    scrollbar-width: none;
    -webkit-scrollbar-width: none;
    -ms-overflow-style: none;

    .select-list {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      box-sizing: border-box;
      border-bottom: #ccc 1px solid;

      >div span {
        min-width: 81px;
      }

      .parameter-name {
        width: 36%;
        border-radius: 4px;
      }

      .parameter-value {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
      }

      .title {
        font-weight: bold;
        font-size: 16px;
      }
    }

    .btn {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      color: #fff;
      text-align: center;
      margin-top: 10px;
      font-size: 16px;

      .reset-btn {
        padding: 10px 0;
        background: #ccc;
        width: 200px;
        border-radius: 3px;
      }

      .add-btn {
        padding: 10px 0;
        background: #35a1fd;
        width: 200px;
        border-radius: 3px;
      }
    }
  }
}
</style>