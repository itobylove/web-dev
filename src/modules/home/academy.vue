<template>
  <div class="not-found" :style="selectStyle" >
    <div class="vertical-menu " id="sliderLeft">
      <div class="menu-search-wrap">
        <div style="width: 100%;">
          <t-input
              placeholder="搜索"
              v-model="searchText"
              @compositionend="diaFun.voSearch"
              @input="diaFun.voSearch"
              autofocus
          >
            <template #suffixIcon >
              <i class="ri-search-line" @click="diaFun.voSearch" style="cursor: pointer;"></i>
            </template>
          </t-input>
        </div>
        <div>
            <i class="ri-file-add-line" @click="diaFun.addChild" ></i>
        </div>
      </div>
      <div class="menu-content scrollbar-hidden">
        <t-tree
            :data="itemsTree"
            :activable="true"
            :activeMultiple="true"
            :line="true"
            :actived="activedList"
            expand-all
            @click="diaFun.onLabelClickItem"
            :filter="searchFilter"
        />

      </div>
      <div
          class="moveBtn"
          @mousedown="move"
          @mouseover="moveBtnMou"
          @mouseout="moveBtnSeout"
          :style="{opacity: moveBtnMouValue ? 1 : 0 }"
      ></div>

    </div>

    <div class="certical-item" ref="fullscreenRef" >
      <div class="edit-content" v-if="isUeditor === 1" >
        <t-form ref="form">
          <t-form-item label="上级"  name="account">
            <t-tree-select
                v-model="_form.parent_id"
                :treeProps="{ expandAll: true ,expandLevel:2}"
                filterable
                :data="treeSelectData"
                placeholder="请选择"
                class="path-label"
            />
          </t-form-item>
          <t-form-item label="标题"  name="account">
            <t-input
                type="text"
                placeholder="请输入标题"
                v-model="_form.title"
            />
          </t-form-item>

          <t-form-item label="内容"  name="details">
            <Ueditor @updateContent="_form.details = $event " :content="_form.details" />
          </t-form-item>

          <t-form-item label="访问权限" name="permission">
            <t-select
                v-model="_form.permission"
                :options="permission"
                :minCollapsedNum="10"
                placeholder="请选择授权人员"
                multiple
                clearable
                filterable
            />
          </t-form-item>

          <t-form-item label="编辑权限" name="permission">
            <t-select
                v-model="_form.edit"
                :options="permission"
                :minCollapsedNum="10"
                placeholder="请选择授权人员"
                multiple
                clearable
                filterable
            />
          </t-form-item>

          <t-form-item style="margin-left: 100px">
            <t-space size="10px">
              <t-button type="reset" class="clickSubmit submit-btn0" @click="diaFun.regain" >返回</t-button>
              <t-button type="reset" class="clickSubmit" @click="diaFun.submit" style="margin-left:7px;" >保存</t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </div>

      <div ref="contentRef"  v-if="isUeditor === 2" class="academy-content baseList-container"  >
        <div class="content"  >
          <div class="content_top">
            <div style="float: left;">
              <button
                  type="reset"
                  class="menu-btn clickSubmit menu-btn-edit"
                  @click="diaFun.edit"
                  v-if="item.created_uid === item.auth_uid || item.is_admin || item.is_edit_permission "
              >编辑</button>
              <button
                  type="reset"
                  class="menu-btn clickSubmit menu-btn-delete"
                  @click="diaFun.delete"
                  v-if="item.created_uid === item.auth_uid || item.is_admin "
              >删除</button>
            </div>
            <div style="float: right;">
              <button v-if="prevId > 0" class="clickSubmit" style="width:80px;" @click="diaFun.prevousContext"  >上一篇</button>
              <button v-if="nextId > 0" class="clickSubmit" style="width: 80px;margin-left:15px;" @click="diaFun.NextContext"  >下一篇</button>
            </div>
          </div>
          <div style="clear: both;"></div>
          <div>

            <div class="content_details_top" >
                <div class="details-title">
                  <h1>{{ item.title }}</h1>
                </div>

                <div class="content_left_time">
                  {{ item.created_time_text }} 作者： {{ item.created_uid_text }}
                  <div class="change-font-size right">
                    <div class="small_font_size right" v-if="IsExit" @click="toggleFullscreen" >
                      <i class="ri-fullscreen-fill"></i>
                      放大
                    </div>
                    <div class="small_font_size right" v-if="IsExitLine" @click="toggleFullscreen" >
                      <i class="ri-fullscreen-exit-line"></i>
                      缩小
                    </div>
                  </div>
                </div>
              </div>
            <div v-if="item.details && item.details.trim()" class="content_detail" >
              <div class="details-content scrollbar-hidden" >
                <div v-html="item.details" ></div>
                <div class="details-user-list">
                  <div class="title">阅读人员：</div>
                  <div class="user-content">
                    <ul>
                      <li v-for="iem in item.user_list" >
                        <img :src="iem.avatar ?? '/img/user.jpeg'" :title="iem.nickname" />
                      </li>
                    </ul>
                  </div>

                  <div style="clear: both;height:30px;"></div>
                </div>
                <t-back-top
                    container=".details-content"
                    :visible-height="0"
                    style="position: fixed"
                    :offset="['280px', '80px']"
                    visibleHeight="100"
                ></t-back-top>
              </div>


            </div>
            <div v-else style="width: 90%;margin:0 auto;" >
              <div>
                <t-table
                  v-if="item.table_list.length > 0"
                  resizable
                  row-key="id"
                  :data="item.table_list"
                  :columns="item.table_columns"
                  @row-click="diaFun.tableClick"
                  lazyLoad
                  >
                </t-table>
              </div>
            </div>
          </div>


        </div>

      </div>

    </div>

    <div class="certical-anchor scrollbar-hidden" id="sliderReight" >
      <div
          class="moveBtnRight"
          @mousedown="moveRight"
          @mouseover="moveBtnRightMou"
          @mouseout="moveBtnRightSeout"
          :style="{opacity: moveBtnMouRightValue ? 1 : 0 }"
      ></div>
      <div class="anchor-nav" v-if="anchorList.length > 0" >

        <t-tree
            :data="anchorList"
            @click="scrollToAnchor"
            expand-all
            :transition="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, nextTick, computed, watch, reactive, onMounted} from 'vue'
import Ueditor from "./ueditor.vue"
import apiUrl from "@/core/config/url2.js";
import * as api from '@/core/script/api.js';
import dialog from '@/core/script/dialog.js'

const isNoSelect = ref(true)
const selectStyle = computed(() => ({
  userSelect: isNoSelect.value ? 'none' : 'text',
  WebkitUserSelect: isNoSelect.value ? 'none' : 'text', // 兼容webkit内核
  MozUserSelect: isNoSelect.value ? 'none' : 'text' // 兼容火狐
}))

const _form = reactive({
  path: "",
  title: "",
  details: "",
  path_two: "",
  id: "",
  parent_id: 0,
  permission:[],
  edit:[]
})

const contentRef = ref(null)
const item = reactive({
  id: 0,
  title: '',
  details: '',
  created_time_text: '',
  created_uid_text: '',
  table_list: [],
  table_columns:[
    { colKey: 'title', title: '标题', width: '300',
      ellipsis: {
        theme: 'light',
        placement: 'bottom',
      }
    },
    { colKey: 'created_uid_text', title: '作者', width: '100' },
    { colKey: 'created_time_text', title: '时间', width: '100' }
  ],
  user_list: [],
  created_uid: '',
  auth_uid: '',
  is_admin: false,
  is_edit_permission: false
})

const fullscreenRef = ref(null)
const treeSelectData = ref();
const SelectOptions = [{value:0, label:'顶级'}];

const searchText = ref('')
const searchFilter = ref(null)
const isUeditor = ref(0)
const anchorList = ref([]);
const targetTags = ['h1', 'h2', 'h3'];


const path_two = ref(true);
const prevId = ref(0);
const nextId = ref(0);
const itemsTree = ref()
const permission = ref()
const activedList = ref([])

// 自动滑动到顶部
const resetSlider = () => {
  if (contentRef.value  ) {
    contentRef.value.scrollTop = 0;
  }
};


// 开始拖拽
const move = async (e) => {
  // await nextTick();
  var init = e.clientX
  var parent = document.getElementById('sliderLeft')
  var initWidth = parent.offsetWidth;
  document.onmousemove = (e) => {
    var end = e.clientX
    var newWidth = end - init + initWidth;

    if(newWidth <= 400 && newWidth >= 200) {
      parent.style.width = newWidth + "px"
    }
    isNoSelect.value = true
  };

  document.onmouseup = () => {
    document.onmousemove = document.onmouseup = null
    isNoSelect.value = false
  }
}

// right 右边的滑动块
const moveRight = async (e) => {
  // await nextTick();
  var init = e.clientX
  var parent = document.getElementById('sliderReight')
  var initWidth = parent.offsetWidth;
  document.onmousemove = (e) => {
    var end = e.clientX
    var newWidth = init - end + initWidth;
    if(newWidth <= 400 && newWidth >= 200 ){
      parent.style.width = newWidth + "px"
      const sliderLeft = document.querySelector('.moveBtnRight');
      sliderLeft.style.right = newWidth + 'px' ;
      isNoSelect.value = true
    }
  };
  document.onmouseup = () => {
    isNoSelect.value = false
    document.onmousemove = document.onmouseup = null
  }

}

const isFullscreen = ref(false);
const isFullscreenUnsupported = ref(false);

// 切换全屏/退出全屏
const IsExit = ref(true);     // 初始缩小状态为 true
const IsExitLine = ref(false);

// 监听全屏状态变化（同步参数）
const handleFullscreenChange = () => {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  isFullscreen.value = !!fullscreenElement;
  // 同步更新参数值
  updateStatusParams(isFullscreen.value);
};

// 更新参数的核心方法
const updateStatusParams = (isFullScreenStatus) => {

  if (isFullScreenStatus) {
    // 放大（全屏）状态
    IsExit.value = false;
    IsExitLine.value = true;
  } else {
    // 缩小（退出全屏）状态
    IsExit.value = true;
    IsExitLine.value = false;
  }
};

// 切换全屏/缩小
const toggleFullscreen = async () => {
  if (!fullscreenRef.value) return;

  // 原生全屏逻辑
  if (!isFullscreenUnsupported.value) {
    try {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

      if (fullscreenElement) {
        // 退出全屏（缩小）
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        updateStatusParams(false);
      } else {
        // 进入全屏（放大）
        if (fullscreenRef.value.requestFullscreen) {
          await fullscreenRef.value.requestFullscreen();
        } else if (fullscreenRef.value.webkitRequestFullscreen) {
          await fullscreenRef.value.webkitRequestFullscreen();
        }
        updateStatusParams(true);
      }
    } catch (err) {
      console.warn('原生全屏失败，降级为模拟全屏：', err);
      isFullscreenUnsupported.value = true;
      isFullscreen.value = !isFullscreen.value;
      updateStatusParams(isFullscreen.value);
    }
  } else {
    isFullscreen.value = !isFullscreen.value;
    updateStatusParams(isFullscreen.value);
    fullscreenRef.value.classList.toggle('mock-fullscreen');
  }
};

const diaFun  = reactive( {
  submit: async () => {
    if(_form.title === ''){
      dialog.warning('标题必填，请填写')
      return false;
    }
    const res = await api.post(apiUrl.home.academy.save, _form)
    if(res.list.id > 0 ){
      diaFun.menuList();
      isUeditor.value = 2
      // item.title = _form.title
      // item.details = _form.details
      // item.id = res.list.id
      // _form.permission = [];

      activedList.value = [res.list.id]
      processHtml();
      diaFun.details_value(res.list.id)
    }
  },
  regain: async() => {
    isUeditor.value = 0
  },

  delete: async () => {
    dialog.confirm('确定要删除吗？', async () => {
      const res = await api.post(apiUrl.home.academy.del, {id: item.id}, null, true)
      if(res.data.code === 20000){
        diaFun.menuList()
        activedList.value = [];
        isUeditor.value = 0
      }
    })

  },
  menuList: async () => {
    const loading = dialog.loading('');
    const res = await api.post(apiUrl.home.academy.menuList)
    if (res){
      loading.close();
      itemsTree.value  = res.menu_list
    }
  },
  edit: async () => {
    item.details = ''
    processHtml()
    path_two.value = false
    const res = await api.post(apiUrl.home.academy.detail, {id: item.id})
    const menuListSelect = await api.get(apiUrl.home.academy.menuList, {})
    treeSelectData.value = [...SelectOptions, ...menuListSelect.menu_list]
    isUeditor.value = 1
    _form.title = res.list.title
    _form.details = res.list.details
    _form.path_two = ''
    _form.id = res.list.id
    _form.parent_id = res.list.parent_id
    _form.permission = res.list.permission?.uid
    _form.edit = res.list.permission?.edit
    const resUser = await  api.post(apiUrl.home.academy.userPermission, {})
    permission.value = [...[{ label: '全选', checkAll: true }], ...resUser.list]
  },


  // 添加按钮
  addChild: async () => {
    item.details = '';
    processHtml()
    const res = await api.get(apiUrl.home.academy.menuList, {})
    treeSelectData.value = [...SelectOptions, ...res.menu_list]
    path_two.value = true;
    _form.title = ''
    _form.details = ''
    _form.path_two = ''
    _form.parent_id = activedList.value[0]?? 0
    _form.permission = [];
    _form.id = 0
    _form.edit = []
    isUeditor.value = 1
    const resUser = await  api.post(apiUrl.home.academy.userPermission, {})
    permission.value = [...[{ label: '全选', checkAll: true }], ...resUser.list]
  },

  // 接收菜单点击事件数据 查看详情
  onLabelClickItem : async (value, e) => {
    diaFun.details_value(value.node.value)
  },
  // 点击上一篇
  prevousContext : async () => {
    diaFun.details_value(prevId.value)
  },
    // 点击下一篇
  NextContext : async () => {
    diaFun.details_value(nextId.value)
  },
  // 文章列表点击
  tableClick: async ({ row, index }) => {
    diaFun.details_value(row.id);
  },
  details_value: async ( id ) => {
    const res = await api.post(apiUrl.home.academy.detail, {id: id})
    if(res){
      resetSlider()

      activedList.value = [id];
      isUeditor.value = 2
      Object.assign(item, res.list)
      getPrevNextId(item.id)
      processHtml()
      const resUser = await api.post(apiUrl.home.academy.userListVisit, {id: id});
      item.user_list = []
      if(resUser){
        item.user_list = resUser.list;
      }

    }

  },
  voSearch: (state ) => {
    console.log('voSearch', searchText.value)
    if (searchText.value) {
      searchFilter.value = (node) => {
        return node.data.label.toLowerCase().includes(searchText.value.toLowerCase())
      }
    } else {
      searchFilter.value = null
    }

  }
})


onMounted(() => {
  diaFun.menuList();
  processHtml();

  // 检测全屏 API 兼容性
  const isSupported = !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
  );
  isFullscreenUnsupported.value = !isSupported;

})

// 调整页面宽度 滑动块 移入移出显示效果
const moveBtnMouValue = ref(false)
const moveBtnMouRightValue = ref(false);
const moveBtnMou = () => {
  moveBtnMouValue.value = true
}

const moveBtnSeout = () => {
  moveBtnMouValue.value = false
}

const moveBtnRightMou = () => {
  moveBtnMouRightValue.value = true
}

const moveBtnRightSeout = () => {
  moveBtnMouRightValue.value = false
}




// 显示锚点
const processHtml = () => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = item.details

  const tagCounter = {};
  targetTags.forEach(tag => tagCounter[tag] = 0);
  const allTargetElements = tempDiv.querySelectorAll(targetTags.join(','));
  var anchorListB = []
  allTargetElements.forEach(el => {
    const tag = el.tagName.toLowerCase();
    tagCounter[tag]++;
    const uniqueId = `${tag}-${tagCounter[tag]}-${el.textContent.trim()}`;
    el.setAttribute('id', uniqueId);
    const elText = el.textContent.trim() || `${tag}标题${tagCounter[tag]}`;
    anchorListB.push({
      tag: tag,
      value: uniqueId,
      label: elText
    });
  });
  anchorList.value = nestItems(anchorListB)
  item.details = tempDiv.innerHTML;
};

/**
 * 将扁平数组根据 tag 层级转换为嵌套树形结构
 * @param {Array} items - 输入的扁平数组，每个元素需包含 tag 属性（如 h1, h2...）
 * @returns {Array} 嵌套后的树形结构数组，每个元素包含 children 字段
 */
const nestItems = (items) => {
  const result = [];
  const stack = [];
  for (const item of items) {
    const newItem = { ...item, children: [] };
    const level = parseInt(item.tag.slice(1));
    while (stack.length > 0 && parseInt(stack[stack.length - 1].tag.slice(1)) >= level) {
      stack.pop();
    }
    if (stack.length === 0) {
      result.push(newItem);
    } else {
      stack[stack.length - 1].children.push(newItem);
    }
    stack.push(newItem);
  }
  return result;
}

/**
 * 锚点跳转：平滑滚动到目标元素
 */
const scrollToAnchor = (v) => {
  nextTick(() => {
    const targetEl = document.getElementById(v.node.value);
    const scrollContainer = contentRef.value?.querySelector('.details-content');

    if (targetEl && scrollContainer) {
      // 精准计算目标元素在容器内的偏移
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const scrollTop = targetRect.top - containerRect.top + scrollContainer.scrollTop;

      scrollContainer.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  });
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
  const flatList = flattenTree(itemsTree.value)
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

// 放大字体（对应 bigger_font_size 方法）
const biggerFontSize = () => {
  if (!contentRef.value) return;
  const pEl = contentRef.value.querySelector('p');
  if (!pEl) return;
  const currentFontSize = window.getComputedStyle(pEl).fontSize;
  let currentFontSizeInt = parseInt(currentFontSize.split('px')[0]);
  let videocurrentFontSizeInt = null;
  const videoEl = contentRef.value.querySelector('p.linkAndSource');
  if (videoEl) {
    const videoFontSize = window.getComputedStyle(videoEl).fontSize;
    videocurrentFontSizeInt = parseInt(videoFontSize.split('px')[0]);
  }

  if (currentFontSizeInt < 30) {
    const allP = contentRef.value.querySelectorAll('p');
    allP.forEach(el => {
      el.style.fontSize = (currentFontSizeInt + 2) + 'px';
    });


    const picTextEl = contentRef.value.querySelector('.pictext');
    if (picTextEl) {
      const picSize = window.getComputedStyle(picTextEl).fontSize;
      const picSizeInt = parseInt(picSize.split('px')[0]);
      picTextEl.style.fontSize = (picSizeInt + 2) + 'px';
    }

    if (videoEl && videocurrentFontSizeInt !== null) {
      videoEl.style.fontSize = (videocurrentFontSizeInt + 2) + 'px';
    }
  }
};

// 缩小字体（对应 small_font_size 方法）
const smallFontSize = () => {
  if (!contentRef.value) return;

  const pEl = contentRef.value.querySelector('p');
  if (!pEl) return;
  const currentFontSize = window.getComputedStyle(pEl).fontSize;
  let currentFontSizeInt = parseInt(currentFontSize.split('px')[0]);

  let videocurrentFontSizeInt = null;
  const videoEl = contentRef.value.querySelector('p.linkAndSource');
  if (videoEl) {
    const videoFontSize = window.getComputedStyle(videoEl).fontSize;
    videocurrentFontSizeInt = parseInt(videoFontSize.split('px')[0]);
  }

  if (currentFontSizeInt >= 14) {
    const allP = contentRef.value.querySelectorAll('p');
    allP.forEach(el => {
      el.style.fontSize = (currentFontSizeInt - 2) + 'px';
    });

    const picTextEl = contentRef.value.querySelector('.pictext');
    if (picTextEl) {
      const picSize = window.getComputedStyle(picTextEl).fontSize;
      const picSizeInt = parseInt(picSize.split('px')[0]);
      picTextEl.style.fontSize = (picSizeInt - 2) + 'px';
    }

    if (videoEl && videocurrentFontSizeInt !== null) {
      videoEl.style.fontSize = (videocurrentFontSizeInt - 2) + 'px';
    }
  }
};




</script>

<style scoped>
.not-found {
  display: flex;
  height: 100vh;
  font-size:1rem;
}
.vertical-menu {
  width: 260px;
  background: #fff;
  border: 1px solid #eee;
  height: 100vh;
  position: relative;

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
  padding: 12px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
}
.menu-content{
  padding: 0 12px;
  box-sizing: border-box;
  overflow-x: visible !important;
  overflow-y: auto !important;
  position: relative;
  height: calc(100vh - 106px );
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
  padding-top: 12px;
  background: #fff;
  border: 1px solid #eee;
  height: calc(100vh - 10px );

  box-sizing: border-box;
  z-index: 0;
  user-select: none;
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

.menu-btn-delete{
  margin-left:7px;
  color: #000;
  background-color:#fff;
  border:1px solid #e0e0e0;
}

.menu-btn{
  background-color: #fff;
}
.academy-content{
  max-width:1200px;
  margin: 0 auto;
  background-color: #fff;
  height: calc(100vh - 65px);
  overflow-y: auto;
  position: relative;
  border-radius: 5px;
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
  border-radius: 5px;
}
.details-user-list{
  margin: 20px 15px;
}
.details-user-list ul li{
  float: left;
  list-style: none;
  margin: 0 5px;
}

.details-user-list ul li img{
  width: 40px;
  height: 40px;
  border-radius: 50px;
  border:1px solid #e0e0e0;
}
.anchor-nav{
  overflow-x: visible !important;
  overflow-y: auto !important;
  height: calc(100vh - 55px);

}
.details-title{
  text-align:center;
  margin:20px auto;
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
  border-bottom: 1px solid #F2F2F2;
}


.moveBtn{
  height:100vh;
  width:2px;
  position: absolute;
  top: 0;
  right: 0;
  cursor: col-resize;
  background-color: #cfd5de;
  z-index: 99;
  opacity: 0;
}

.moveBtnRight{
  height:100vh;
  width: 2px;
  position: absolute;
  top: 0;
  left:0;
  cursor: col-resize;
  background-color: #c1c1bb;
  z-index: 99;
  opacity: 0;
}

.content_left_time{
  padding:0 20px 15px;
  border-bottom: 1px solid #F2F2F2;
  color: #b7b7b7;
  font-size: 14px;
  line-height: 40px;
  width: 90%;
  margin: 0 auto;
}
.bigger_font_size, .small_font_size{
  margin-right: 20px;
  font-size: 12px;
  cursor: pointer;
}
.left{
  float: left;
  display: initial;
}
.small_font_size{
  margin-right: 20px;
}
.right {
  float: right;
  display: initial;
}
.details-content{
  max-height: calc(100vh - 310px);
  overflow-y: auto;
  overflow-x: hidden;
}
.user-content{
  margin-top: 20px;
}
.content_details_top{
  background-color: #fff;
  display: block;
}
.content_details_top_pf{
  position: fixed;
  border-top: 7px solid #35a1fd;
  top: 40px;
  z-index: 9999;
}
.content{

  .content_top {
    width: 93%;
    margin: 0 auto;
    margin-top: 25px;
  }

  .content_detail{
    width: 92%;
    margin: 0 auto;
    margin-top: 20px;
  }
}
.ri-file-add-line{
  font-size: 30px;
  color: rgb(207, 213, 222);
  cursor: pointer;
}
.ri-file-add-line:hover{
  color: #35a1fd;
}
</style>