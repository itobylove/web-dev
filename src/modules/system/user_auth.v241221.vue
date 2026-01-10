<template>
      <div class="winContent" title="用户权限列表">
        <div class="header">
          <t-space>
            <t-button theme="primary" @click="authEvent.save"> <i class="ri-save-line"></i>保存</t-button>
            <t-switch v-model="authBox.tree.onlyRole" size="large" class="my-switch" @change="authBox.tree.on.filter">
              <template #label="slotProps">{{ slotProps.value ? '仅角色' : '权限+角色' }}</template>
            </t-switch>
            <t-switch v-model="authBox.tree.onlyChecked" size="large" class="my-switch" @change="authBox.tree.on.filter">
              <template #label="slotProps">{{ slotProps.value ? '已开通' : '全部' }}</template>
            </t-switch>
            <t-input v-model="authBox.tree.filterVal" style="width: 200px;" @change="authBox.tree.on.filter" clearable/>
          </t-space>
        </div>
        <div class="body">
          <t-tree v-model="authBox.tree.checked" v-bind="authBox.tree.bind" :data="authBox.tree.data"/>
        </div>
      </div>
</template>
<script setup>
import {onMounted, reactive} from 'vue'
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";

const props = defineProps({
  uid:  {type: String, default: ''}
})

const vData = reactive({
  title: '用户权限', //窗口标题
  auth_items: [], //所有的权限
});

const authEvent = {
  open: async (row) => {
    authBox.tree.bind.loading = true;
    //获取用户权限
    authBox.data.data = await api.get(api.url.system.auth.list, {uid: row.uid});
    if (authBox.data.data === undefined) return;

    if (vData.auth_items.length < 1) {
      // 获取所有权限
      vData.auth_items = (await api.get(api.url.system.authItem.list))?.list || [];
    }
    authBox.tree.data = [...vData.auth_items];
    authBox.tree.checked = authBox.data.data.list.map(item => item.name);
    authBox.data.row = row;
    authBox.tree.bind.loading = false;
    authBox.tree.on.filter();
  },
  save: async () => {
    const list = authBox.tree.checked;
    const res = await api.post(api.url.system.auth.save, {name: list, uid: authBox.data.row.uid});
      dialog.success("操作成功");
  },

};


const authBox = reactive({
  data: {
    data: {list: []},
    row: {},
  },
  menus: {
    save: {
      title: '保存', icon: 'ri-save-line', click: () => {
      }
    },
    onlyRole: {
      title: 'onlyRole', icon: 'ri-save-line', click: () => {
      }
    },
    onlyChecked: {
      title: 'onlyChecked', icon: 'ri-save-line', click: () => {
      }
    },
  },
  tree: {
    filterVal: '',
    checked: [],
    onlyRole: null,
    onlyChecked: true,
    data: [
      {
        label: "加载中...",
        value: "node0",
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
      valueMode: 'parentFirst',
      checkable: true,
      line: true,
      hover: true,
      keys: {label: "label", value: "name", children: "children"},
    },
    on: {
      filter: () => {
        if (authBox.tree.filterVal || authBox.tree.onlyRole || authBox.tree.onlyChecked) {
          const typeScope = authBox.tree.onlyRole ? [1] : [1, 2, null];
          const checkedScope = authBox.tree.onlyChecked ? [true] : [true, false, null, undefined];
          authBox.tree.bind.filter = (node) => {
            const text = node.data?.name + node.data?.description
            const type = node.data?.type || '';
            const checked = node?.checked || null;
            return typeScope.includes(type) && checkedScope.includes(checked) && text.indexOf(authBox.tree.filterVal) >= 0;
          };
        } else {
          authBox.tree.bind.filter = null;
        }
      }
    }
  },
});


onMounted(() => {
  authEvent.open({uid:props.uid});
})
</script>
<style scoped>
.winContent {
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

    .t-space .t-space-item {
      line-height: 32px;
    }
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