<template>
  <t-select-input
      v-model:inputValue="inputValue"
      :value="modelValue"
      allow-input
      clearable
      :placeholder="placeholder"
      v-model:popupVisible="popupVisible"
      @keydown.enter.prevent="onEnter"
      @click="popupVisible = true"
  >
    <template #panel>
      <ul v-if="innerOptions.length" class="list">
        <li
            v-for="item in innerOptions"
            :key="item.value"
            @click="selectSingle(item)"
        >
          {{ item.label }}
        </li>
      </ul>
      <div v-else class="empty">{{ panel }}</div>
    </template>
  </t-select-input>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择或输入' },
  panel: { type: String, default: '暂无数据，可回车创建' },
})

const emit = defineEmits(['update:modelValue'])

const popupVisible = ref(false)

const innerOptions = ref([])
watch(
    () => props.options,
    v => (innerOptions.value = [...v]),
    { immediate: true }
)

const inputValue = ref('')
watch(
    () => props.modelValue,
    v => {
      inputValue.value = v?.label ?? ''
    },
    { immediate: true }
)

const selectSingle = (opt) => {
  emit('update:modelValue',  opt.label)
  inputValue.value = opt.label
  popupVisible.value = false
}


const onEnter = () => {
  const val = inputValue.value.trim()
  if (!val) return

  let opt = innerOptions.value.find(o => o.value === val)
  if (!opt) {
    opt = { label: val, value: val }
    innerOptions.value.push(opt)
  }

  emit('update:modelValue',  opt.label)
  inputValue.value = opt.label
  popupVisible.value = false
}
</script>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.list li {
  padding: 6px 8px;
  cursor: pointer;
}
.list li:hover {
  background: #f5f5f5;
}
.empty {
  padding: 6px;
  color: #999;
}
</style>
