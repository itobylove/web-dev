<template>
  <div>
    <div class="menu-list">
      <div
        v-for="(item, index) in list"
        :key="item.id"
        class="menu-items"
        >
        <div class="menu-row"
          :style="{ '--level-indent': `${level * 16}px` }"
          :class="{ 'menu-item-active': String(item.id) === String(activeMenuId) }"
          >
          <div
            class="menu-labels menu-label-global"
            :data-title="item.label"
            @click.stop="onLabelClick(item)"
            >
            <span class="menu-labels-text" v-html="highlightKeyword(item.label)" > </span>
          </div>
          <span
              v-if="hasOriginalChildren(item)"
              class="arrow"
              :class="{ open: expandedKeys.has(item.id) }"
              @click.stop="toggle(item.id)"
          >
            ▶
          </span>
        </div>

        <!-- 子级：自动展开匹配节点的层级 -->
        <MenuItem
            v-if="expandedKeys.has(item.id) && hasOriginalChildren(item)"
            :list="item.children || []"
            :original-list="props.originalList"
            :search-keyword="searchKeyword"
            :expand-keys="props.expandKeys"
            :level="level + 1"
            :active-menu-id="activeMenuId"
            @add-child="$emit('add-child', $event)"
            @add-sibling="$emit('add-sibling', $event)"
            @delete="$emit('delete', $event)"
            @labelClickItem="$emit('labelClickItem', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'


const props = defineProps({
  list: { type: Array, required: true },
  originalList: { type: Array, required: true },
  searchKeyword: { type: String, default: '' },
  expandKeys: { type: Set, default: () => new Set() }, // 接收自动展开的节点ID
  level: { type: Number, default: 0 },
  activeMenuId: { type: [String, Number], default: '' } // 接收当前选中的菜单ID
})

const emit = defineEmits(['labelClickItem', 'add-child', 'add-sibling', 'delete'])

// 本地手动切换的展开记录
const localExpandedKeys = ref(new Set())

// 合并外部自动展开和本地手动展开的状态（核心修复：手动收缩覆盖自动展开）
const expandedKeys = computed({
  get() {
    const merged = new Set(props.expandKeys)
    // 遍历本地状态，手动收缩的节点从合并集合中删除
    Array.from(merged).forEach(key => {
      const keyStr = String(key)
      if (localExpandedKeys.value.has(`__closed__${keyStr}`)) {
        merged.delete(key)
      }
    })
    // 手动展开的节点添加到合并集合
    localExpandedKeys.value.forEach(key => {
      const keyStr = String(key)
      if (!keyStr.startsWith('__closed__')) {
        merged.add(key)
      }
    })
    return merged
  },
  set(newVal) {
    localExpandedKeys.value = newVal
  }
})

// ========== 基础工具函数 ==========
/**
 * 递归查找原始节点
 */
const findOriginalNode = (nodes, nodeId) => {
  for (const node of nodes) {
    if (node.id === nodeId) return node
    if (node.children && node.children.length) {
      const found = findOriginalNode(node.children, nodeId)
      if (found) return found
    }
  }
  return null
}

/**
 * 获取原始子节点
 */
const getOriginalChildren = (node) => {
  if (!node || !node.id || !props.originalList) return []
  const originalNode = findOriginalNode(props.originalList, node.id)
  return originalNode?.children || []
}

/**
 * 判断是否有原始子节点
 */
const hasOriginalChildren = (node) => {
  return getOriginalChildren(node).length > 0
}

/**
 * 恢复关键词高亮：修复正则转义+确保替换生效
 */
const highlightKeyword = (text) => {
  if (!props.searchKeyword || !text) return text
  // 修复：转义特殊字符，确保正则匹配准确
  const escapeKeyword = props.searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 不区分大小写匹配，包裹高亮标签
  const reg = new RegExp(`(${escapeKeyword})`, 'gi')
  return text.replace(reg, '<span class="highlight">$1</span>')
}

// ========== 交互逻辑 ==========
/**
 * 手动切换展开/折叠（核心修复：记录手动收缩状态）
 */
const toggle = (key) => {
  const closedKey = `__closed__${key}`
  if (localExpandedKeys.value.has(key)) {
    // 从展开状态切换为收缩：记录收缩标记，删除展开标记
    localExpandedKeys.value.delete(key)
    localExpandedKeys.value.add(closedKey)
  } else if (localExpandedKeys.value.has(closedKey)) {
    // 从手动收缩状态切换为展开：删除收缩标记，添加展开标记
    localExpandedKeys.value.delete(closedKey)
    localExpandedKeys.value.add(key)
  } else {
    // 初始状态（自动展开）切换为收缩：添加收缩标记
    if (props.expandKeys.has(key)) {
      localExpandedKeys.value.add(closedKey)
    } else {
      // 初始状态（未展开）切换为展开：添加展开标记
      localExpandedKeys.value.add(key)
    }
  }
}


const onLabelClick = (item) => {
  emit('labelClickItem', item)
}


// 搜索关键词变化时，重置本地展开记录（仅保留搜索驱动的展开）
watch(() => props.searchKeyword, () => {
  localExpandedKeys.value = new Set()
}, { immediate: true })

// 监听外部expandKeys变化：触发重新计算
watch(() => props.expandKeys, () => {}, { deep: true })
</script>

<style scoped>
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: visible !important;
}
.menu-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: calc(var(--level-indent) + 8px);
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  overflow: visible !important;
}
.menu-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  z-index: -1;
}

.menu-row:hover::before {
  background-color: #f5f5f5;
}

.menu-labels {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  position: relative;
  line-height: 30px;
}

.menu-labels-text {
  flex: 1;
  display: block;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

.arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
  margin-left: 4px;
  user-select: none;
  flex-shrink: 0;
  width: 12px;
  text-align: center;
  padding:7px 15px;
}
.arrow.open {
  transform: rotate(90deg);
}
.menu-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.menu-actions button {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}

.menu-actions button:hover {
  background-color: #e5e5e5;
}

:deep(.highlight) {
  color: #e60000 !important;
  font-weight: bold !important;
  padding: 0 2px !important;
  border-radius: 2px !important;
}

.menu-labels:hover::after {
  content: attr(data-title);
  position: absolute;
  left: var(--level-indent);
  top: 100%;
  margin-top: 4px;
  white-space: nowrap;
  padding: 6px 10px;
  background-color: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  box-sizing: border-box;
  display: block;
}
.menu-labels:hover::after {
  opacity: 1;
  transform: translateY(0);
}
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}
.menu-items {
  margin: 2px 0;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

.menu-item-active {
  background-color: #35a1fd;
  color: #fff;
}



</style>