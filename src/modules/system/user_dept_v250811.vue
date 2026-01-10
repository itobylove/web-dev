<template>
    <div class="deptBox" title="指定用户的岗位列表">
      <div class="header">
        <t-button theme="primary"  @click="authEvent.save"> <i class="ri-save-line"></i>保存</t-button>
        <t-switch v-model="deptBox.tree.onlyChecked" size="large" class="my-switch" @change="deptBox.tree.on.filter">
          <template #label="slotProps">{{ slotProps.value ? '已开通' : '全部' }}</template>
        </t-switch>
        <t-select v-model="deptBox.tree.plant_id" style="width: 360px;"  placeholder="工厂" :options="plantList" multiple  @change="deptBox.tree.on.filter"/>
        <t-input v-model="deptBox.tree.filterVal" style="width: 300px;" @change="deptBox.tree.on.filter" clearable/>
      </div>
      <div class="body">
        <t-tree v-model="deptBox.tree.checked" v-bind="deptBox.tree.bind" :data="deptBox.tree.data"/>
      </div>
    </div>
</template>
<script setup>
import {onMounted, reactive} from 'vue'
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import {plantList} from "@/utils/erp.js";
import {listToTree} from "@/utils/vars.js";

const props = defineProps({
  uid:  {type: String, default: ''}
})

const authEvent = {
  open: async (row) => {
    deptBox.tree.bind.loading = true;
    //获取用户权限
    const {checked,list} = await api.get(api.url.system.user.assignment, {uid: row.uid});
    if (list?.length < 1) return ;
    const tree = listToTree(list);
    deptBox.list= [...list];
    deptBox.tree.data = [...tree];
    deptBox.tree.checked = [...checked];
    deptBox.data.list  = [...list];
    deptBox.data.row = row;
    deptBox.tree.bind.loading = false;
    deptBox.tree.on.filter();
  },
  save: async () => {
    const checked = deptBox.tree.checked;
    const checkedList = deptBox.data.list.filter(item => checked.includes(item.id));
    const res = await api.post(api.url.system.user.assignment, {list: checkedList, uid: deptBox.data.row.uid});
    res && dialog.success("操作成功");
  },

};


const deptBox = reactive({
  data: {
    list:[],
    row: {},
  },
  menus: {
    save: {
      title: '保存', icon: 'ri-save-line', click: () => {
      }
    },
  },
  tree: {
    plant_id:[],
    filterVal: '',
    onlyChecked: true,
    checked: [],
    data: [
      {
        name: "加载中...",
        id: "0",
        children: [],
        disabled: true,
        loading: true, // 初始状态为未加载
      },
    ],
    bind: {
      async: true,
      filter: null,
      allowFoldNodeOnFilter: true,
      titleWidth: 120,
      titleAlign: "right",
      valueMode: 'onlyLeaf',
      checkable: true,
      line: true,
      hover: true,
      expandLevel:2,
      keys: {label: "name", value: "id", children: "children"},
    },
    on: {
      filter: () => {
        const plant_id_list = deptBox.tree.plant_id;
        const keyword = deptBox.tree.filterVal;
        const checkedScope = deptBox.tree.onlyChecked ? [true] : [true, false, null, undefined];
        deptBox.tree.bind.filter = (node) => {
          const text = node.data?.name + node.data?.nickname
          const plant_id= node.data.plant_id;
          const checked = node?.checked || null;
          return (keyword.length<1 || text.indexOf(keyword) >= 0)
              && (!plant_id || plant_id_list.length===0 || plant_id_list.includes(plant_id))
              && checkedScope.includes(checked) ;
        };
      }
    }
  },
});


onMounted(() => {
  authEvent.open({uid:props.uid});
})
</script>


<style scoped>
.deptBox {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;

  > .header {
    width: 100%;
    border: 1px solid #ddd;
    border-bottom: 0 none;
    border-radius: 5px 5px 0 0;
    display: flex;
    flex-direction: row;
    line-height: 32px;
    gap: 0 15px;
    .my-switch{
      margin-top: 5px;
      margin-right: 30px;
    }
  }

  > .body {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  }
}
</style>