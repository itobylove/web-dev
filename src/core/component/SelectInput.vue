<template>
  <t-select-input
      v-model:inputValue="inputValue"
      :value="modelValue"
      :placeholder="placeholder"
      allow-input
      multiple
      clearable
      @tag-change="onTagChange"
  >
    <template #panel>
      <t-checkbox-group
          v-if="innerOptions.length"
          :value="checkedValues"
          :options="innerOptions"
          class="panel-options"
          @change="onCheckedChange"
      />
      <div v-else class="empty">{{ panel }}</div>
    </template>
  </t-select-input>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择或者输入'},
  panel: { type: String, default: '暂无默认，请手动输入' },
})

const emit = defineEmits(['update:modelValue'])

/** 内部 options（允许创建） */
const innerOptions = ref([])

watch(
    () => props.options,
    (v) => {
      innerOptions.value = [...v]
    },
    { immediate: true, deep: true },
)

const inputValue = ref('')

const checkedValues = computed(() =>
    props.modelValue.map(v => v.value),
)

const onCheckedChange = (vals, { current }) => {
  const map = new Map(props.modelValue.map(v => [v.value, v]))

  if (vals.includes(current)) {
    const opt = innerOptions.value.find(o => o.value === current)
    opt && map.set(current, opt)
  } else {
    map.delete(current)
  }

  emit('update:modelValue', [...map.values()])
}

const onTagChange = (_, { trigger }) => {
  if (trigger === 'enter' && inputValue.value) {
    const val = inputValue.value.trim()
    if (!val) return

    if (!innerOptions.value.some(o => o.value === val)) {
      innerOptions.value.push({ label: val, value: val })
    }

    if (!props.modelValue.some(v => v.value === val)) {
      emit('update:modelValue', [
        ...props.modelValue,
        { label: val, value: val },
      ])
    }

    inputValue.value = ''
  }

  if (trigger === 'clear') emit('update:modelValue', [])
}
</script>

<style scoped>
.panel-options {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.empty {
  padding: 6px;
  color: #999;
}
</style>
