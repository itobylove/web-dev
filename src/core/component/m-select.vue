<template>
  <div :class="['m-select', props.class]">
    <!-- 输入框占位 -->
    <t-input
        readonly
        :value="selectedLabel"
        :placeholder="placeholder" borderless
        @click="readonly?null:(visible = true)" align="right"
        v-bind="inputOpt"
    />

    <!-- 弹出层 -->
    <t-popup v-model="visible" placement="bottom" v-bind="popupOpt">
      <!-- 可选搜索框 -->
      <div v-if="filterable" class="filter" style="padding:8px;">
        <t-input
            v-model="searchText" align="center"
            placeholder="搜索"
            clearable
            @clear="onSearchClear" borderless
            v-bind="filterOpt"
        />
      </div>

      <!-- 选择器 -->
      <t-picker
          :columns="filteredColumns"
          v-model="innerValue"
          @confirm="onConfirm"
          @cancel="onCancel"
          @change="onChange"
          v-bind="pickOpt"
      />
    </t-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineExpose } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  readonly: { type: Boolean, default: false },
  options: { type: Array, default: () => [{ label: '请选择', value: '' }] },
  placeholder: { type: String, default: '请选择' },
  filterable: { type: Boolean, default: false },
  class: { type: String, default: '' },
  inputOpt: { type: Object, default: () => ({}) },
  popupOpt: { type: Object, default: () => ({}) },
  filterOpt: { type: Object, default: () => ({}) },
  pickOpt: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel'])

const visible = ref(false)
const searchText = ref('')

// 本地 options
const localOptions = ref(JSON.parse(JSON.stringify(props.options)))

// 内部值统一为数组，保证多列/单列兼容
const innerValue = ref([])

// 初始化 innerValue
const setInnerValue = (value) => {
  if (Array.isArray(value)) {
    innerValue.value = value.length ? value : getDefaultValue()
  } else if ((typeof value==='string' && value !== '') || (typeof value==='number' && !isNaN(value)) ) {
    innerValue.value = [value]
  } else {
    innerValue.value = getDefaultValue()
  }
}

// 获取默认值
/*const getDefaultValue = () => {
  if (!localOptions.value || !localOptions.value.length) return ['']
  if (Array.isArray(localOptions.value[0])) {
    return localOptions.value.map(col => (col[0]?.value ?? ''))
  } else {
    return [localOptions.value[0]?.value ?? '']
  }
}*/
const getDefaultValue = () => []

// 初始化
setInnerValue(props.modelValue)

// 监听 modelValue
watch(
    () => props.modelValue,
    val => {
      setInnerValue(val)
    },
    { immediate: true }
)

// 监听 options 变化
watch(
    () => props.options,
    val => {
      localOptions.value = JSON.parse(JSON.stringify(val))
      searchText.value = ''
      // 更新 innerValue
      if (Array.isArray(localOptions.value[0])) {
        innerValue.value = innerValue.value.map((v, i) => {
          const col = localOptions.value[i] || []
          return col.find(opt => opt.value === v) ? v : ''
        })
      } else {
        innerValue.value = localOptions.value.find(opt => opt.value === innerValue.value[0])
            ? innerValue.value
            : ['']
      }
    },
    { deep: true }
)

// 转换 options 为 picker 需要的列数据
const columns = computed(() => {
  if (!localOptions.value || localOptions.value.length === 0) return [[{ label: '请选择', value: '' }]]
  if (Array.isArray(localOptions.value[0])) {
    return localOptions.value.map(col => col.map(opt => ({ label: opt.label, value: opt.value })))
  }
  return [localOptions.value.map(opt => ({ label: opt.label, value: opt.value }))]
})

// 搜索过滤列
const filteredColumns = computed(() => {
  if (!props.filterable || !searchText.value) return columns.value
  return columns.value.map(col => col.filter(opt => opt.label.includes(searchText.value)))
})

// 输入框显示
const selectedLabel = computed(() => {
  if (!innerValue.value || !innerValue.value.length) return ''
  return innerValue.value
  .map((v, i) => {
    const col = Array.isArray(localOptions.value[0]) ? localOptions.value[i] : localOptions.value
    if (!col) return ''
    const found = col.find(opt => opt.value === v)
    return found ? found.label : ''
  })
  .filter(Boolean)
  .join(' ')
})

// 滚动选择触发
const onChange = val => {
  const isMulti = columns.value.length > 1
  const valueToEmit = isMulti ? val : val[0]
  emit('change', valueToEmit)
}

// 点击确定
const onConfirm = val => {
  innerValue.value = val
  const isMulti = columns.value.length > 1
  const valueToEmit = isMulti ? val : val[0]
  emit('update:modelValue', valueToEmit)
  emit('confirm', valueToEmit)
  visible.value = false
  searchText.value = ''
}

// 点击取消
const onCancel = () => {
  visible.value = false
  searchText.value = ''
  emit('cancel')
}

// 搜索框清空
const onSearchClear = () => (searchText.value = '')

// 外部更新 options
const updateOptions = newOptions => {
  localOptions.value = newOptions
  searchText.value = ''
  // 更新 innerValue
  if (Array.isArray(localOptions.value[0])) {
    innerValue.value = innerValue.value.map((v, i) => {
      const col = localOptions.value[i] || []
      return col.find(opt => opt.value === v) ? v : col[0]?.value ?? ''
    })
  } else {
    innerValue.value = localOptions.value.find(opt => opt.value === innerValue.value[0])
        ? innerValue.value
        : [localOptions.value[0]?.value ?? '']
  }
}

defineExpose({ updateOptions })
</script>

<style scoped>
.m-select {
  width: 100%;
  line-height: 32px;
  ::v-deep(input){
    line-height: 32px;
  }
  .filter {
    border-bottom: 1px solid #eee;
  }
}

</style>
