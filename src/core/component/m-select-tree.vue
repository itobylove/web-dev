<template>
  <div :class="['m-select', props.class]">
    <!-- 输入框 -->
    <t-input
        readonly
        :value="selectedLabel"
        :placeholder="placeholder"
        borderless
        @click="readonly ? null : (visible = true)"
        align="right"
        v-bind="inputOpt"
    />

    <!-- 弹出层 -->
    <t-popup v-model="visible" placement="bottom" v-bind="popupOpt">
      <!-- 搜索框，仅非 tree 模式可用 -->
      <div v-if="filterable && (!props.tree || !props.tree.length)" class="filter" style="padding:8px;">
        <t-input
            v-model="searchText"
            placeholder="搜索"
            align="center"
            clearable
            @clear="onSearchClear"
            borderless
            v-bind="filterOpt"
        />
      </div>

      <!-- Picker -->
      <t-picker
          :columns="columns"
          v-model="innerValue"
          :title="props.title"
          @confirm="onConfirm"
          @cancel="onCancel"
          @change="onColumnChange"
          @pick="onColumnChange"
          v-bind="pickOpt"
      />
    </t-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineExpose } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  valueMode: { type: String, default: 'leaf', validator: val => ['all', 'leaf'].includes(val) },
  tree: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
  placeholder: { type: String, default: '请选择' },
  filterable: { type: Boolean, default: false },
  class: { type: String, default: '' },
  inputOpt: { type: Object, default: () => ({}) },
  popupOpt: { type: Object, default: () => ({}) },
  filterOpt: { type: Object, default: () => ({}) },
  pickOpt: { type: Object, default: () => ({}) },
  split: { type: String, default: ' > ' },
  title: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel'])

const visible = ref(false)
const searchText = ref('')
const innerValue = ref([])
let initialValue = [] // 打开 picker 时保存的快照

// ---------- 工具：递归查找叶子节点 value 对应完整路径 ----------
const findPathByLeaf = (tree, leafValue) => {
  for (const node of tree) {
    if (node.value === leafValue) return [node.value]
    if (node.children) {
      const sub = findPathByLeaf(node.children, leafValue)
      if (sub) return [node.value, ...sub]
    }
  }
  return null
}

// ---------- 初始化 innerValue ----------
const setInnerValue = (val) => {
  if (!props.tree || !props.tree.length) return
  if (!val) {
    // 空值 → 第一个叶子节点
    let node = props.tree[0]
    const path = [node.value]
    while (node.children && node.children.length) {
      node = node.children[0]
      path.push(node.value)
    }
    innerValue.value = path
  } else {
    // modelValue 是叶子节点的值
    const path = findPathByLeaf(props.tree, val)
    innerValue.value = path || []
  }
}

setInnerValue(props.modelValue)
watch(() => props.modelValue, val => setInnerValue(val), { immediate: true })

// ---------- 打开 picker 保存初始值 ----------
watch(visible, val => {
  if (val) initialValue = [...innerValue.value]
})

// ---------- picker columns ----------
const columns = computed(() => {
  const cols = []
  let current = props.tree || []
  for (let i = 0; i <= innerValue.value.length; i++) {
    if (!current || current.length === 0) break
    cols.push(current.map(n => ({ label: n.label, value: n.value, __raw: n })))
    const next = current.find(n => n.value === innerValue.value[i])
    current = next?.children || []
  }
  return cols
})

// ---------- 显示文本（始终完整路径） ----------
const selectedLabel = computed(() => {
  if (!innerValue.value.length || !props.tree.length) return ''

  const labels = []
  let current = props.tree

  for (const val of innerValue.value) {
    const node = current.find(n => n.value === val)
    if (!node) break
    labels.push(node.label)
    current = node.children || []
  }

  return labels.join(props.split)
})

// ---------- 列改变 ----------
const onColumnChange = (val, context) => {
  if (!context) return
  const { column } = context
  innerValue.value = innerValue.value.slice(0, column)
  innerValue.value[column] = val[column]

  // 自动填充后续列到叶子节点
  let current = props.tree || []
  for (let i = 0; i <= column; i++) {
    const node = current.find(n => n.value === innerValue.value[i])
    current = node?.children || []
  }
  if (current && current.length > 0) innerValue.value.push(current[0].value)
}

// ---------- 点击确认 ----------
const onConfirm = () => {
  if (!innerValue.value.length) return

  let current = props.tree || []
  let node = null
  for (const v of innerValue.value) {
    node = current.find(n => n.value === v)
    if (!node) break
    current = node.children || []
  }

  const valueToEmit = props.valueMode === 'leaf' ? node?.value : [...innerValue.value]
  emit('update:modelValue', valueToEmit)
  emit('confirm', valueToEmit)
  visible.value = false
  searchText.value = ''
}

// ---------- 点击取消 ----------
const onCancel = () => {
  innerValue.value = [...initialValue] // 回滚
  visible.value = false
  searchText.value = ''
  emit('cancel')
}

// ---------- 搜索清空 ----------
const onSearchClear = () => (searchText.value = '')

defineExpose({})
</script>

<style scoped>
.m-select {
  width: 100%;
  line-height: 32px;
  ::v-deep(input) {
    line-height: 32px;
  }
  .filter {
    border-bottom: 1px solid #eee;
  }
}
</style>
