<template>
  <div class="not-found" >
    <div class="vertical-menu">
      <div class="menu-search-wrap">

        <vxe-input
            v-model="searchText"
            type="search"
            placeholder="搜索"
            style="width:100%;"
            @input="doSearch"
            @keyup.enter="doSearch"
        >
        </vxe-input>
      </div>
      <MenuItem
          :list="filteredMenuData"
          :original-list="menuData"
          :search-keyword="keyword"
          :expand-keys="mergedExpandKeys"
          :level="0"
          @labelClickItem="diaFun.onLabelClickItem"
          :active-menu-id="activeMenuId"
      />
      <div>
        <vxe-button size="medium" content="添加" class="addChildButton" @click="diaFun.addChild" ></vxe-button>
      </div>
    </div>
    <div class="certical-item" >
      <div v-if="isUeditor === 1" >
        <div class="edit-content" >
          <div class="path-input-group">
            <label class="path-label">路径</label>
            <div class="path-input-wrapper">
              <div>
                <div style="width: 300px; float: left;">
                  <t-tree-select
                      v-model="_form.parent_id"
                      :treeProps="{ expandAll: true ,expandLevel:2}"
                      filterable
                      :data="treeSelectData"
                      placeholder="请选择"
                      class="path-label"
                  />
                </div>
                <div style="width: 300px; float: left;">
                  <input
                      v-if="path_two"
                      type="text"
                      class="menu-path"
                      placeholder="输入路径"
                      style="width: 300px;margin-left:7px;"
                      v-model="_form.path_two"
                  />
                </div>
              </div>
            </div>
            <div style="clear: both;"></div>
          </div>

          <div class="path-input-group">
            <label class="path-label">标题</label>
            <div class="path-input-wrapper">
              <input
                  type="text"
                  class="menu-path"
                  placeholder="输入路径"
                  v-model="_form.title"
              />
            </div>
          </div>

          <Ueditor @updateContent="_form.details = $event " :content="_form.details" />

          <div class="clickSubmit-btn">
            <button type="reset" class="menu-btn clickSubmit submit-btn0" @click="diaFun.regain" >返回</button>
            <button type="reset" class="menu-btn clickSubmit" @click="diaFun.submit" style="margin-left:7px;" >保存</button>
          </div>
        </div>

      </div>


      <div ref="scrollContainer"  v-if="isUeditor === 2" class="academy-content baseList-container"  >
        <div class="content ">
          <div>
            <div style="float: left;">
              <button type="reset" class="menu-btn clickSubmit menu-btn-edit" @click="diaFun.edit" >编辑</button>
              <button type="reset" class="menu-btn clickSubmit menu-btn-delete" @click="diaFun.delete" style="" >删除</button>
            </div>
            <div style="float: right;">
              <button class="clickSubmit" style="width:80px;" @click="diaFun.prevousContext" v-if="prevId>0" >上一篇</button>
              <button class="clickSubmit" style="width: 80px;margin-left:15px;" @click="diaFun.NextContext" v-if="nextId>0" >下一篇</button>
            </div>
          </div>
          <div style="clear: both;"></div>
          <div >
            <div class="details-title">
              <h1>{{ DetailTitle }}</h1>
            </div>

            <div v-if="DetailContent && DetailContent.trim()" >
              <div v-html="DetailContent"  > </div>
              <div class="details-user-list">
                <div class="title">阅读人员：</div>
                <ul>
                  <li v-for="item in DetailUserList" >
                    <img :src="item.avatar" :title="item.nickname" />
                  </li>
                </ul>
                <div style="clear: both;"></div>
              </div>
            </div>

            <div v-else style="text-align: center;color:rgba(0, 0, 0, 0.6);margin-top:35px;font-size: 14px;" >
              <div><i class="ri-archive-2-fill" style="font-size: 65px;color:rgba(0, 0, 0, 0.6);"></i></div>
              <div>暂无数据</div>

            </div>
          </div>

<!--          <button @click="diaFun.smoothBackToTop" class="back-btn">回到顶部</button>-->
          <t-back-top
              container=".baseList-container"
              :visible-height="0"
              style="position: fixed"
              :offset="['280px', '80px']"
              visibleHeight="100"
          ></t-back-top>
        </div>

      </div>

    </div>

    <div v-if="isUeditor === 2" class="certical-anchor"  >
      <div class="anchor-nav" v-if="anchorList.length > 0" >
        <ul>
          <li
            v-for="(item, index) in anchorList"
            :key="index"
            :class="`anchor-item ${item.tag}`"
            >
            <a @click="scrollToAnchor(item.id)" href="javascript:;">
              {{ item.text }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, nextTick, computed, watch, reactive, onMounted} from 'vue'
import MenuItem from './MenuItem.vue'

import Ueditor from "./ueditor.vue"
import apiUrl from "@/core/config/url2.js";
import * as api from '@/core/script/api.js';
import dialog from '@/core/script/dialog.js'

const menuData = ref([])
const _form = reactive({
  path: "",
  title: "",
  details: "",
  path_two: "",
  id: "",
  parent_id: 0
})
const activeMenuId = ref(''); // 当前选中的菜单ID 高亮

const DetailUserList = ref({})
const scrollContainer = ref(null)
const localExpandedKeys = ref(new Set()); // 本地展开状态
const treeSelectData = ref();
const SelectOptions = [{value:0, label:'顶级'}];

const keyword = ref('')
const searchText = ref('')
const isUeditor = ref(0)
const anchorList = ref([]);
const targetTags = ['h1', 'h2', 'h3'];

const DetailContent = ref('')
const DetailTitle = ref()
const DetailId = ref()
const path_two = ref(true);
const prevId = ref(0);
const nextId = ref(0);
const manualExpandKeys = ref(new Set());






const diaFun  = reactive( {
  submit: async () => {
    const res = await api.post(apiUrl.home.academy.save, _form)
    console.log(' 提交结果 res', res);

    if(res.list.id > 0 ){
      diaFun.menuList();
      isUeditor.value = 2
      DetailTitle.value = _form.title
      DetailContent.value = _form.details
      DetailId.value = res.list.id

      processHtml();
    }
  },
  regain: async() => {
    // 返回
    console.log('regain - 返回')
    isUeditor.value = 0
  },

  delete: async () => {
    dialog.confirm('确定要删除吗？', async () => {
      const res = await api.post(apiUrl.home.academy.del, {id: DetailId.value})
      diaFun.menuList()

    })

  },
  menuList: async () => {
    const loading = dialog.loading('');
    const res = await api.post(apiUrl.home.academy.menuList)
    loading.close();
    menuData.value = res.menu
  },
  edit: async () => {
    path_two.value = false
    const res = await api.post(apiUrl.home.academy.detail, {id: DetailId.value})
    const menuListSelect = await api.get(apiUrl.home.academy.menuList, {})
    treeSelectData.value = [...SelectOptions, ...menuListSelect.menu_list]
    // console.log(treeSelectOptions.options)
    isUeditor.value = 1
    _form.title = res.list.title
    _form.details = res.list.details
    _form.path_two = ''
    _form.id = res.list.id
    _form.parent_id = res.list.parent_id


  },
  details: async (id) => {

    const res = await api.post(apiUrl.home.academy.userListVisit, {id: id});
    DetailUserList.value = res.list;


  },
  // 添加按钮
  addChild: async (item) => {
    if (!item.children) item.children = []
    const res = await api.get(apiUrl.home.academy.menuList, {})
    treeSelectData.value = [...SelectOptions, ...res.menu_list]


    path_two.value = true;
    _form.title = ''
    _form.details = ''
    _form.path_two = ''
    _form.parent_id = item.id
    console.log('addChild', res)
    isUeditor.value = 1
  },
  // 平滑回到顶部
  smoothBackToTop: async () => {
    await nextTick() // 确保DOM渲染完成
    const container = scrollContainer.value
    if (!container) {
      console.warn('滚动容器未找到')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const scrollToTop = () => {
      const currentTop = container.scrollTop
      if (currentTop > 0) {
        // 分步滚动，模拟smooth效果（兼容不支持behavior的场景）
        requestAnimationFrame(() => {
          container.scrollTop = currentTop - Math.max(1, currentTop / 10)
          scrollToTop()
        })
      }
    }
    scrollToTop()
  },
  // 接收菜单点击事件数据 查看详情
  onLabelClickItem : async (value) => {
    isUeditor.value = 2

    const res = await api.post(apiUrl.home.academy.detail, {id: value.id})
    activeMenuId.value = String(value.id); //  记录当前选中的菜单ID

    DetailContent.value = res.list.details
    DetailTitle.value = res.list.title
    DetailId.value = res.list.id
    const _prev = getPrevNextId(DetailId.value)
    processHtml()
    diaFun.details(DetailId.value)
    diaFun.smoothBackToTop()
  },
  // 点击上一篇
  prevousContext : async () => {
    DetailId.value = prevId.value;
    isUeditor.value = 2
    const res = await api.post(apiUrl.home.academy.detail, {id: DetailId.value})
    DetailContent.value = res.list.details
    DetailTitle.value = res.list.title
    activeMenuId.value = ''
    activeMenuId.value = String(DetailId.value); // 选中高亮
    getPrevNextId(DetailId.value)
    expandAllParentNodes(DetailId.value);
    processHtml()
  },
    // 点击下一篇
  NextContext : async () => {
    DetailId.value = nextId.value;
    isUeditor.value = 2
    const res = await api.post(apiUrl.home.academy.detail, {id: DetailId.value})
    DetailContent.value = res.list.details
    DetailTitle.value = res.list.title
    activeMenuId.value = String(DetailId.value); // 选中高亮
    getPrevNextId(DetailId.value)
    expandAllParentNodes(DetailId.value);
    processHtml()
  }

})



onMounted(() => {
  diaFun.menuList();
  processHtml();


})


// 显示锚点
const processHtml = () => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DetailContent.value;
  anchorList.value = [];
  const tagCounter = {};
  targetTags.forEach(tag => tagCounter[tag] = 0);
  const allTargetElements = tempDiv.querySelectorAll(targetTags.join(','));
  allTargetElements.forEach(el => {
    const tag = el.tagName.toLowerCase();
    tagCounter[tag]++;
    const uniqueId = `${tag}-${tagCounter[tag]}-${el.textContent.trim()}`;
    el.setAttribute('id', uniqueId);
    const elText = el.textContent.trim() || `${tag}标题${tagCounter[tag]}`;
    anchorList.value.push({
      tag: tag,
      id: uniqueId,
      text: elText
    });
  });
  DetailContent.value = tempDiv.innerHTML;
};
/**
 * 锚点跳转：平滑滚动到目标元素
 */
const scrollToAnchor = (id) => {
  const target = document.getElementById(id);
  if (target) {
    console.log('scrollToAnchor', id)
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};


/**
 * 递归查找菜单中匹配关键词的节点，并收集需要展开的所有父级节点ID
 * 用于搜索时自动展开包含匹配结果的菜单层级，方便用户定位目标节点
 *
 * @param {Array} nodes - 当前遍历的菜单节点数组（树形结构）
 * @param {string} kw - 搜索关键词（会被转为小写）
 * @param {Array} [parentIds=[]] - 当前节点的所有祖先节点ID数组（递归时传递，用于记录父级链）
 * @returns {Object} 返回包含两个集合的对象：
 *  - expandKeys {Set}：需要展开的所有父级节点ID集合（用于控制菜单展开状态）
 *  - matchedIds {Set}：所有匹配到关键词的节点ID集合（用于高亮匹配项）
 */
const findMatchedParentKeys = (nodes, kw, parentIds = []) => {
  const expandKeys = new Set()
  const matchedIds = new Set()
  const lowerKw = kw.toLowerCase()

  nodes.forEach(node => {
    const currentParentIds = [...parentIds, node.id]
    const labelMatch = node.label?.toLowerCase().includes(lowerKw)

    if (labelMatch) {

      parentIds.forEach(id => expandKeys.add(id))
      matchedIds.add(node.id)
    } else if (node.children && node.children.length) {

      const childResult = findMatchedParentKeys(node.children, kw, currentParentIds)
      if (childResult.matchedIds.size > 0) {
        childResult.expandKeys.forEach(id => expandKeys.add(id))
        expandKeys.add(node.id)
        childResult.matchedIds.forEach(id => matchedIds.add(id))
      }
    }
  })
  return { expandKeys, matchedIds }
}


  /**
   * 计算属性：根据搜索关键词，生成需要自动展开的菜单节点ID集合
   * 当用户输入搜索词时，自动计算出要展开的父级节点，保证匹配结果可见
   *
   * @returns {Set} 搜索场景下需要展开的菜单节点ID集合（无关键词时返回空集合）
   */
const searchExpandKeys = computed(() => {
    const kw = keyword.value.trim()
    if (!kw) return new Set()
    const result = findMatchedParentKeys(menuData.value, kw)
    return result.expandKeys
  })

  /**
   * 递归遍历树形菜单节点，为每个节点标记匹配状态（自身/子节点是否匹配搜索关键词）
   * @param {Array} nodes - 当前遍历的菜单节点数组（树形结构，每个节点包含id/label/children等字段）
   * @param {string} kw - 搜索关键词（空字符串时表示无搜索，全部节点标记为匹配）
   * @returns {Array} 标记了匹配状态的菜单节点数组，每个节点追加以下字段：
   *  - isMatched: Boolean - 当前节点是否匹配（自身label匹配 或 有子节点匹配 则为true）
   *  - hasMatchedChild: Boolean - 当前节点是否有子节点匹配关键词
   *  - children: Array - 递归处理后的子节点数组（保持树形结构）
   */
const markMatchedNodes = (nodes, kw) => {
    if (!kw) {
      return nodes.map(node => ({
        ...node,
        isMatched: true,
        children: node.children ? markMatchedNodes(node.children, kw) : []
      }))
    }

    const lowerKw = kw.toLowerCase()
    return nodes.map(node => {
      const labelMatch = node.label?.toLowerCase().includes(lowerKw)
      const children = node.children ? markMatchedNodes(node.children, lowerKw) : []
      const hasMatchedChild = children.some(child => child.isMatched || child.hasMatchedChild)
      const isMatched = labelMatch || hasMatchedChild

      return {
        ...node,
        isMatched,
        hasMatchedChild,
        children: children
      }
    })
}


/**
 * 计算属性：根据搜索关键词过滤菜单数据，仅显示匹配的节点
 * 特性：响应式 - 当keyword/menuData变化时自动重新计算
 * @returns {Array} 过滤后的菜单节点数组（仅包含isMatched为true的节点）
 */
const filteredMenuData = computed(() => {
  const kw = keyword.value.trim()
  const markedNodes = markMatchedNodes(menuData.value, kw)
  return markedNodes.filter(node => node.isMatched)
})


const doSearch = () => {
  keyword.value = searchText.value.trim()
}

watch(() => keyword.value, (newVal) => {
  if (!newVal) {
    searchText.value = ''
  }
})


/**
 * 根据ID获取所有父级标题 + 当前节点标题，斜杠拼接
 * @param {number} targetId - 要查找的节点ID
 * @param {Array} tree - 树形数据（默认用menuData）
 * @returns {string} 完整路径（如：一级菜单2/二级菜单1/三级菜单1/四级菜单1/五级菜单1）
 */
const getFullPathById = (targetId, tree = menuData.value) => {
  // 存储父级标签的数组
  const parentLabels = [];
  // 存储目标节点的标签
  let currentLabel = '';
  // 存储找到的目标节点
  let targetNode = null;

  // 第一步：递归查找目标节点
  const findTargetNode = (nodeList) => {
    for (const node of nodeList) {
      if (node.id === targetId) {
        targetNode = node;
        currentLabel = node.label;
        return true;
      }
      if (node.children && node.children.length) {
        if (findTargetNode(node.children)) {
          return true;
        }
      }
    }
    return false;
  };

  // 第二步：递归查找父节点并收集标签
  const findParentNode = (nodeList, parent_id) => {
    for (const node of nodeList) {
      if (node.id === parent_id) {
        parentLabels.push(node.label);
        if (node.parent_id !== 0) {
          findParentNode(tree, node.parent_id);
        }
        return true;
      }
      if (node.children && node.children.length) {
        if (findParentNode(node.children, parent_id)) {
          return true;
        }
      }
    }
    return false;
  };


  const hasFound = findTargetNode(tree);
  if (!hasFound) {
    return '';
  }

  if (targetNode.parent_id !== 0) {
    findParentNode(tree, targetNode.parent_id);
  }

  const fullPath = [...parentLabels.reverse(), currentLabel].join('/');
  return fullPath;
};


// 将树形结构扁平化为一维数组
const flattenTree = (nodes, result=[]) => {
  for (const node of nodes) {
    result.push(node)
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, result)
    }
  }
  return result
}

// 传去 id 获取上一个页 下一页 id
const getPrevNextId = (currentId) => {
  const flatList = flattenTree(menuData.value)
  const currentIndex = flatList.findIndex(item => item.id === currentId)
  if(currentIndex === -1) {
    return { prevId: null, nextId: null }
  }

  const prevIds = currentIndex > 0 ? flatList[currentIndex - 1].id : null
  const nextIds = currentIndex < flatList.length - 1 ? flatList[currentIndex + 1].id : null

  prevId.value = prevIds
  nextId.value = nextIds

  return { prevIds, nextIds }
}

/**
 * 传入节点ID，递归查找并展开该节点的所有父级节点
 * @param {Number|String} targetId - 目标节点ID（支持数字/字符串）
 * @param {Object} options - 可选配置（适配不同数据结构）
 * @param {String} options.idKey - ID字段名，默认'id'
 * @param {String} options.childrenKey - 子节点字段名，默认'children'
 * @returns {Set} 最终展开的父级ID集合
 */
const expandAllParentNodes = (targetId, options = {}) => {
  const { idKey = 'id', childrenKey = 'children' } = options;
  if (!targetId || !menuData.value.length) {
    return new Set();
  }
  const targetIdStr = String(targetId);
  const findParentIdsRecursive = (nodeList, currentTargetId, parentIds = []) => {
    for (const node of nodeList) {
      if (String(node[idKey]) === currentTargetId) {
        return parentIds;
      }


      if (node[childrenKey] && node[childrenKey].length > 0) {
        const result = findParentIdsRecursive(
            node[childrenKey],
            currentTargetId,
            [...parentIds, node[idKey]]
        );
        if (result) return result;
      }
    }
    return null;
  };

  const parentIds = findParentIdsRecursive(menuData.value, targetIdStr) || [];

  if (parentIds.length === 0) {
    return false;
  }

  // 更新展开状态（原有逻辑保留）
  const newExpandedKeys = new Set(localExpandedKeys.value);
  parentIds.forEach(parentId => {
    const closedKey = `__closed__${parentId}`;
    if (newExpandedKeys.has(closedKey)) newExpandedKeys.delete(closedKey);
    newExpandedKeys.add(parentId);
  });
  localExpandedKeys.value = new Set(newExpandedKeys);
  manualExpandKeys.value = parentIds;
  return new Set(parentIds);
};

// 计算属性，将搜索与 手动触发关联
const mergedExpandKeys = computed(() => {
  const merged = new Set();
  // 先加搜索驱动的展开ID
  searchExpandKeys.value.forEach(key => merged.add(key));
  // 再加手动触发的展开ID（上下篇/其他操作）
  manualExpandKeys.value.forEach(key => merged.add(key));
  return merged;
});


</script>

<style scoped>
.not-found {
  display: flex;
  height: 100vh;
  font-size:1rem;
}
.vertical-menu {
  width: 260px;
  padding: 12px;
  background: #fff;
  border: 1px solid #eee;
  height: 100%;
  box-sizing: border-box;
  scrollbar-width: thin;
  overflow-x: visible !important;
  overflow-y: auto !important;
  position: relative;
  z-index: 100;
}

.vertical-menu::-webkit-scrollbar {
  width: 6px;
}
.vertical-menu::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 3px;
}
.vertical-menu::-webkit-scrollbar-track {
  background-color: #fafafa;
}

.menu-search-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
}
.menu-search {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  outline: none;
  border-radius: 4px 0 0 4px;
  height: 36px;
}
.menu-search:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

.certical-item {
  flex: 1;
  margin-left: 7px;
  padding: 12px;
  border: 1px solid #eee;
  height: 100%;
  box-sizing: border-box;
  background-color: #eee;
}
.certical-item, .certical-anchor {
  position: relative;

}
.certical-anchor {
  width: 300px;
  margin-left: 7px;
  padding: 12px;
  background: #fff;
  border: 1px solid #eee;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  z-index: 0;
}
.vertical-menu {
  width: 260px;
  padding: 12px;
  background: #fff;
  border: 1px solid #eee;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.path-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 8px 0;
}
.path-label {
  flex: 0 0 auto;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}
.path-input-wrapper {
  flex: 1;
  width: 200px;
}
.menu-path {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
}
.menu-path:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}


.menu-path::placeholder {
  color: #c0c4cc;
}
.clickSubmit-btn{
  text-align: right;
  margin-top: 15px;
}
.clickSubmit{
  border: 1px solid #e0e0e0;
  width: 60px;
  height: 30px;
  background: #fff;
  color: #000;
  padding: 0 15px;
  word-spacing: 0;
  font-weight: 400;
  border-radius: 5px;
  cursor: pointer;
}
.submit-btn0{
  border: 1px solid rgb(222, 222, 222);
  background-color: #ffffff;
  color:rgb(51, 51, 51);
  cursor: pointer;
}

.anchor-nav {
  position: sticky;
  top: 20px;
  height: fit-content;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.anchor-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.anchor-item.h1 {
  font-weight: bold;
  font-size: 16px;
  padding-left: 0;
  color: #222;
}
.anchor-item.h2 {
  font-size: 14px;
  padding-left: 15px;
  color: #333;
}
.anchor-item.h3 {
  font-size: 13px;
  padding-left: 30px;
  color: #666;
}

.anchor-item a {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.anchor-item a:hover {
  color: #409eff;
}
.menu-btn-delete{
  margin-left:7px;
  color: #000;
  background-color:#fff;
  border:1px solid #e0e0e0;
}

.academy-content{
  width:1200px;
  margin: 0 auto;
  background-color: #fff;
  padding: 40px 32px;

  height: calc(100vh - 20px);
  overflow-y: auto;
  position: relative;
}

.academy-content :deep(p){
  font-size: 1rem;
  margin-bottom: .8rem;
  line-height: 2rem;
  overflow: hidden;
}

.academy-content :deep(img){
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: cover;
}

.edit-content{
  width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  padding: 40px 32px;
}
.details-user-list{
  margin: 40px 15px;
}
.details-user-list ul li{
  float: left;
  list-style: none;
  margin: 0 5px;
}

.details-user-list ul li img{
  width:50px;
  height: 50px;
  border-radius: 50px;
  border:1px solid #e0e0e0;
}
.anchor-nav ul li{
  line-height: 200%;
}
.details-title{
  text-align:center;
  margin:38px auto;
}
.details-title .pages-date{
  position: relative;
  height: 30px;
  border-bottom: 1px solid #dcdcdc;
  padding-top: 7px;
  text-align: left;

}
.details-user-list .title{
  font-size: 16px;
  color: #666666;
  padding-bottom: 10px;
}

.back-btn {
  position: fixed;
  bottom: 30px;
  margin-left: 820px;
  padding: 10px 20px;
  cursor: pointer;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  z-index: 99;
}
.addChildButton{
  width:100%;margin-top:40px;
}
</style>