<template>
    <div class="tree-page">
      <t-space break-line class="tree-header">
        <Menu :menu="menus"  :default-menu-show-list="[]"/>
        <t-input size="small" v-model="listFilterData.text" @change="onInputChange" style="width:305px" placeholder="筛选名称" clearable/>
        <t-select size="small" v-model="listFilterData.type" @change="onFilterType" v-if="dataOption.type" placeholder="筛选类型" clearable>
          <t-option v-for="(value,key) in dataOption.type" :value="key" :label="value" />
        </t-select>
        <t-select size="small" v-model="listFilterData.status" @change="onFilterStatus" v-if="dataOption.status" placeholder="筛选状态" clearable>
          <t-option v-for="(value,key) in dataOption.status" :value="key" :label="value" />
        </t-select>
      </t-space>

      <div style="flex: 1;overflow-y: auto;padding: 5px">
        <t-tree
            ref="treeRef"
            v-model="valueSelected"
            v-bind="treeOption"
            :data="treeData"
            :label="(h,node)=>formatLabel(node)"
            :filter="listFilterFn"
            @expand="onExpand"
            @change="onChange"
            @active="onActive"
            @drag-over="onDragOver"
        >
          <template #operations="{ node }">
            <t-space :size="10">
              <t-switch v-if="typeof node.data?.type==='number'" :customValue="[1,0]" size="small" variant="base" v-model="node.data.type" @change="onToggleType($event,node)"/>
              {{ dataOption.type?.[node.data.type] }}
              <t-switch v-if="typeof node.data?.status==='number'" :customValue="[1,0]" size="small" variant="base" v-model="node.data.status" @change="onToggleStatus($event,node)"/>
              {{ dataOption.status?.[node.data.status] }}
              <t-button size="small" variant="base" theme="success" @click="editLabel(node)">修改名称</t-button>
              <t-button size="small" variant="base" theme="default" @click="appendTo(node)">添加子节点</t-button>
              <t-button size="small" variant="base" theme="danger" @click="deleteNode(node)">删除</t-button>
            </t-space>
          </template>
        </t-tree>
      </div>
    </div>
</template>
<script setup>
import {onMounted, reactive, ref} from "vue"
/*import { Button as TButton,
  Select as TSelect,
  Input as TInput,Tree as TTree,Switch as TSwitch,
  Space as TSpace,
} from 'tdesign-vue-next';*/
import * as api from '../../core/script/api.js'
import {listToTree, treeToList} from "@/utils/vars.js";
import {getUUID} from "@/core/script/core.js";
import Menu from "@/core/component/menu.vue";
import {createUrl} from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
const props = defineProps({
  title: String,
  query: Object,
  apiUrl: {type: Object, default: {}},
  menus: {type: Object, default: {}}, // 菜单配置
  dataOption: {
    type: Object, default: () => {
    }
  },
})

const winOptions = {
  onBeforeClose: async () => {
    if (isChanged.value) {
      const confirmRes = await dialog.confirmAsync('数据有变动，是否保存修改？','关闭提示',  {okval: "保存", noval: "不保存", otherval: "继续编辑",});
      if (confirmRes === true) {
        return await saveList();
      }
      return confirmRes === false
    }
    return true;
  },
}


const apiUrl = ref({list: '', saveList: '', save: '', set: '', ...props.apiUrl});
const dataOption = ref({type: {}, status: {0: '停用', 1: '启用'}, ...props.dataOption});
const dataList = ref([]);
const treeData = ref();
const isChanged = ref(0);


// 树形结构
const treeRef = ref();
const treeOption = reactive({
  expandOnClickNode: false,
  valueMode: 'onlyLeaf',
  expandParent: true,
  hover: true,
  expandAll: true,
  activable: true,
  checkable: true,
  draggable: true,
  line: true,
});
const valueSelected = ref([]);
const maxId = ref(0);

//过滤数据
const listFilterFn = ref(null);
const listFilterData = reactive({text: '', type: null, status: null});
const listFilterHide = ref([]);


onMounted(async () => {
  console.log('tree props', props);
  await loadList(true);
})


//加载数据
const loadList = async (getNew = true) => {
  const loading = dialog.loading(treeRef.value.$el, '数据加载中，请稍等！');
  if (getNew || !dataList.value) {
    if (isChanged.value && await dialog.confirmAsync('数据有变动，是否保存修改？','保存提示')) {
      return await saveList();
    }
    const {list, option, count} = await api.get(apiUrl.value.list, props.query);
    dataList.value = list.map((item, index) => setNodeData(item, index));
    dataOption.value = option;
    maxId.value = count;
    isChanged.value = 0;
  }
  treeData.value = listToTree(dataList.value);
  loading.close();
}

//更新节点数据
const updateList = (node, data = {}) => {
  const index = dataList.value.findIndex(item => item.value === node.value);
  if (!index) return false
  dataList.value[index] = {...dataList.value[index], ...data};
  treeData.value = listToTree(dataList.value);
  treeRef.value.refresh();
}


//设置节点数据(用于解析后端数据)
const setNodeData = (item, index) => {
  return {
    id: item.id,
    pid: item?.pid,
    value: index,
    label: item.name,
    type: item.type,
    status: item.status
  }
}
//获取节点数据(用于提交数据到后端)
const getNodeData = (node, _default = {}) => {
  const parentIdList = treeRef.value.getParents(node.value).map(item => item?.data?.id);
  const id = node?.id || node.data?.id;
  return {
    id,
    pid: node?.pid || node.data?.pid || parentIdList?.[0],
    parent:treeRef.value.getParents(node.value).map(item=>item.label).reverse().join(' > '),
    // path: parentIdList.reverse().join(',')+(parentIdList.length>0 && id ?',':'')+(id?id:''),
    path: parentIdList.reverse().join(','),
    sort: node.value,
    name: node.label,
    type: node?.type || node.data?.type,
    status: node?.status || node.data?.status,
    code: node?.code || node.data?.code || getUUID(),
    ..._default,
  }
}
//获取格式化的节点名称
const formatLabel = (node) => {
  const pathNodes = node.getPath();
  let label = pathNodes.map((itemNode) => itemNode.getIndex() + 1).join('.');
  const idStr = node.data?.id ? `(ID:${node.data?.id})` : '';
  return `${label} : ${node.label} ${idStr}`;
};
// 全选
const selectAll = () => {
  const allItemList = treeRef.value.getItems().filter(node => listFilterHide.value.length === 0 || !listFilterHide.value.includes(node.value));
  if (valueSelected.value.length > 0) {
    if (valueSelected.value.length === allItemList.length) {
      valueSelected.value = [];// 如果全部选中，则取消全选
      return;
    }
    valueSelected.value = allItemList.filter(node => !node.checked).map(node => node.value);// 如果有选中，则反选
    return;
  }
  //都没有选中：排除
  valueSelected.value = allItemList.map(node => node.value);
}

// 保存列表
const saveList = async () => {
  const loading = dialog.loading(treeRef.value.$el, '数据保存中，请稍等！');
  const treeNodes = treeRef.value.getTreeData();
  const allNodes = treeToList(treeNodes);
  // const allNodes = treeRef.value.getItems();
  const allNodesData = allNodes.map((node, index) => getNodeData(node, {sort: index}))
  const url = createUrl(apiUrl.value.saveList,props.query);
  const result = await api.post(url, allNodesData);
  loading.close();
  if (!result) {
    return false;
  }
  isChanged.value = 0;
  await loadList(true);
}

const updateAll = async (post, actionName = '') => {
  // 获取所有选中节点
  if (valueSelected.value.length < 1) {
      dialog.error('请勾选要操作的数据');
    return;
  }
  if (actionName && !await dialog.confirmAsync('确认' + actionName + valueSelected.value.length + '条吗？',actionName + '确认')) {
    return;
  }
  const loading = dialog.loading(treeRef.value.$el, '数据保存中，请稍等！');
  const ids = valueSelected.value.map(value => {
    const node = treeRef.value.getItem(value);
    return node.data?.id;
  })
  const result = await api.post(apiUrl.value.set, {id: ids, ...post});
  result && await loadList(true);
  loading.close();
  if (result && post?.status===-1){
    valueSelected.value=[]; // 删除成功后取消选中
  }
}


// 批量删除
const deleteAll = async () => {
  return await updateAll({status: -1}, '删除')
}
// 批量修改状态
const editAllStatus = async (status) => {
  return await updateAll({status});
}

// 批量修改类型
const editAllType = async (type = 1) => {
  return await updateAll({type});
}

//修改节点名
const editLabel = async (node) => {
  const label = await dialog.inputAsync(`${node.label}`,"请输入分类名称：")
  if (!label) return;
  const id = node.data?.id || 0;
  const loading = dialog.loading(treeRef.value.$el, '数据保存中，请稍等！');
  const result = await api.post(apiUrl.value.set, {id, name: label});
  result && updateList(node, {label});
  loading.close();
}


// 切换类型后，记录修改状态
const onToggleType = async (value, node) => {
  const id = node.data?.id || 0;
  const nexType = value ? 1 : 0;
  const loading = dialog.loading(treeRef.value.$el, '数据保存中，请稍等！');
  await api.post(apiUrl.value.set, {id, type: nexType});
  loading.close();
};
const onToggleStatus = async (value, node) => {
  const id = node.data?.id || 0;
  const nexStatus = value ? 1 : 0;
  const loading = dialog.loading(treeRef.value.$el, '数据保存中，请稍等！');
  await api.post(apiUrl.value.set, {id, status: nexStatus});
  loading.close();
};

//删除节点
const deleteNode = async (node) => {
  const children = node.getChildren();
  if (children.length > 0) {
    dialog.error('请先删除子节点');
    return;
  }
  if (!await dialog.confirmAsync('确认删除' + node.label + '吗？','删除确认')) {
    return;
  }
  const id = node.data?.id || 0;
  const loading = dialog.loading(treeRef.value.$el, '数据保存中，请稍等！');
  const result = await api.post(apiUrl.value.set, {id, status: -1});
  result && treeRef.value.remove(node.value);
  loading.close();
};

// 保存新增
const saveInsert = async (value, _default = {}) => {
  const loading = dialog.loading(treeRef.value.$el, '数据保存中，请稍等！');
  const node = treeRef.value.getItem(value);
  const itemData = getNodeData(node, {..._default, status: 1, type: 1});
  const res = await api.post(apiUrl.value.save, itemData);
  loading.close();
  if (!res) {
    treeRef.value.remove(value);
    return;
  }
  await loadList(true);
}

//获取要插入的节点数据
const getInsertItemData = async (_default = {}) => {
  const nextId = maxId.value + 1;
  const label = await dialog.inputAsync(`分类${nextId}`,"请输入名称：");
  if (!label) return;
  return {value: nextId, label, ..._default};
};

//追加节点(在指定节点内部)
const appendTo = async (node) => {
  const item = await getInsertItemData();
  if (!item) return;
  treeRef.value.appendTo(node ? node.value : '', item);
  await saveInsert(item.value, {type: node?.data?.type || 1});
};

const onDragOver = (node, state) => {
  isChanged.value += 1;
  console.info('on drag over:', node, state);
};

const onChange = (vals, state) => {
  console.info('on change:', vals, state);
};
const onExpand = (vals, state) => {
  console.info('on expand:', vals, state);
};
const onActive = (vals, state) => {
  console.info('on active:', vals, state);
};

const onInputChange = (state) => {
  console.info('on input:', state);
  if (listFilterData.text) {
    listFilterFn.value = (node) => {
      const label = node?.data?.label || '';
      const isVisible = label.indexOf(listFilterData.text) >= 0;
      isVisible || listFilterHide.value.push(node.value) // 记录隐藏的节点
      return isVisible;
    };
  } else {
    listFilterHide.value = [];
    listFilterFn.value = null;
  }
};
const onFilterType = (value) => {
  const type = typeof value === 'number' ? value : null;
  listFilterFn.value = (node) => {
    return type === null || node?.data?.type === type;
  };
};
const onFilterStatus = (value) => {
  const status = typeof value === 'number' ? value : null;
  listFilterFn.value = (node) => {
    return status === null || node?.data?.status === status;
  };
};

const menus=ref({
    selectAll: {title: "多选", click: () => selectAll(), icon: 'ri-checkbox-line', sort: 10,},
    add: {title: "添加", click: () => appendTo(), icon: 'ri-add-line', sort: 20,},
    delete: {title: "删除", click: () => deleteAll(), icon: 'ri-delete-bin-line', sort: 30,},
    editStatus1: {title: "启用", click: () => editAllStatus(1), icon: 'ri-play-line', sort: 40,},
    editStatus0: {title: "停用", click: () => editAllStatus(0), icon: 'ri-stop-line', sort: 50,},
    editType1: {title: dataOption.value.type?.[1], click: () => editAllType(1), icon: 'ri-macbook-line', sort: 60,show:dataOption.value.type?.[1]!==undefined},
    editType0: {title: dataOption.value.type?.[0], click: () => editAllType(0), icon: 'ri-cloud-line', sort: 70,show:dataOption.value.type?.[1]!==undefined},
    saveList: {title: "保存", click: () => saveList(), icon: 'ri-save-line', sort: 80,},
    loadList: {title: "刷新", click: () => loadList(), icon: 'ri-refresh-line', sort: 90,},
    ...props.menus
});


const searchList=ref([
  {type: 'input', field: 'text',value:listFilterData.text, change: onInputChange, options: {placeholder: '名称'}, style: {width: 'width:305px'}},
]);
</script>
<style>
.tree-page{
  height:100%;gap:10px;padding:10px;display: flex;flex-flow: column;overflow:hidden
}
.tree-header{
  padding-bottom: 10px;
  gap: 10px 5px;border-bottom: 1px solid #ddd;justify-content:space-between;
  .t-input__wrap, .t-input__inner,.t-input, .t-select__wrap,.t-select-input{
    height: 100%;
  }
}
</style>