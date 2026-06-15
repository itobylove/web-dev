<template>
  <ul class="menu-list">
    <li v-for="item in list" :key="item.id" class="menu-item">
      <div class="menu-row">
        <div class="menu-label" :data-title="item.label">
          <span class="menu-label-text" @click.stop="onLabelClick(item)">
            {{ item.label }}
          </span>
          <span
              v-if="item.children && item.children.length"
              class="arrow"
              :class="{ open: shouldExpand(item) }"
              @click.stop="toggle(item.id)"
          >
            ▶
          </span>
        </div>
        <div class="menu-actions">
          <button @click.stop="$emit('add-child', item)">+子1</button>
          <button @click.stop="$emit('add-sibling', item)">+同</button>
          <button @click.stop="$emit('delete', item)">×</button>
        </div>
      </div>
      <MenuItem
          v-if="shouldExpand(item) && item.children"
          :list="item.children"
          :search-mode="searchMode"
          :search-keyword="searchKeyword"
          :collapse-all="collapseAll"
          @add-child="$emit('add-child', $event)"
          @add-sibling="$emit('add-sibling', $event)"
          @delete="$emit('delete', $event)"
      />
    </li>
  </ul>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  list: { type: Array, required: true },
  searchMode: { type: Boolean, default: false },
  searchKeyword: { type: String, default: '' },
  collapseAll: { type: Boolean, default: false }
})

const emit = defineEmits(['add-child', 'add-sibling', 'delete'])

const manuallyExpanded = ref(new Set())

// 监听 collapseAll 变化，清空手动展开状态
watch(() => props.collapseAll, (newVal) => {
  if (newVal) {
    manuallyExpanded.value.clear()
  }
})

// 判断是否应该展开某个菜单项
const shouldExpand = computed(() => (item) => {
  // 如果要求收缩所有，则不展开任何项
  if (props.collapseAll) {
    return false
  }

  // 手动展开的优先级最高
  if (manuallyExpanded.value.has(item.id)) {
    return true
  }

  // 搜索模式下，如果当前项或其子项包含搜索关键词，则展开
  if (props.searchMode && props.searchKeyword) {
    const lowerKeyword = props.searchKeyword.toLowerCase()

    // 检查当前项是否匹配
    if (item.label.toLowerCase().includes(lowerKeyword)) {
      return true
    }

    // 检查子项是否匹配（递归检查）
    const hasMatchingChildren = (children) => {
      if (!children || !children.length) return false

      for (const child of children) {
        if (child.label.toLowerCase().includes(lowerKeyword)) {
          return true
        }
        if (hasMatchingChildren(child.children)) {
          return true
        }
      }
      return false
    }

    return hasMatchingChildren(item.children)
  }

  // 默认不展开
  return false
})

const toggle = (key) => {
  if (manuallyExpanded.value.has(key)) {
    manuallyExpanded.value.delete(key)
  } else {
    manuallyExpanded.value.add(key)
  }
}

const onLabelClick = (item) => {
  alert(`你点击了：${item.label}`)
}
</script>

<style scoped>
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 5px;
}

.menu-item {
  margin: 2px 0;
}

.menu-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
}

.menu-row:hover {
  background: #f5f5f5;
}

.menu-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  min-width: 0;
  position: relative;
}

.menu-label-text {
  flex: 1;
  display: block;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  font-size: 12px;
  transition: transform 0.2s;
  margin-left: 6px;
}

.arrow.open {
  transform: rotate(90deg);
}

.menu-actions {
  display: flex;
  gap: 4px;
}

.menu-actions button {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}
</style>
