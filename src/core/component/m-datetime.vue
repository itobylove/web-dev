<template>
  <div :class="['m-datetime', props.class]">
    <!-- 输入框 -->
    <t-input
        readonly
        :value="formattedValue"
        :placeholder="props.placeholder"
        @click="visible = true"
        v-bind="props.inputOpt"
    />

    <!-- 弹出层 -->
    <t-popup v-model="visible" placement="bottom" v-bind="props.popupOpt">
      <t-date-time-picker
          v-model="innerValue"
          :mode="props.mode"
          :title="props.placeholder"
          :format="props.format"
          :start="props.start"
          :end="props.end"
          :steps="props.steps"
          :default-picker-value="props.defaultPickerValue"
          @change="onChange"
          @confirm="onConfirm"
          @cancel="onCancel"
          v-bind="props.pickOpt"
      />
    </t-popup>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: { type: [String, Number, Date], default: '' },
  placeholder: { type: String, default: '请选择时间' },
  mode: { type: [String, Array], default: 'minute' },
  format: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
  steps: { type: Object, default: () => ({ hour: 1, minute: 10 }) },
  defaultPickerValue: { type: [String, Date], default: '' },
  class: { type: String, default: '' },
  inputOpt: { type: Object, default: () => ({}) },
  popupOpt: { type: Object, default: () => ({}) },
  pickOpt: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel'])

const visible = ref(false)

// 内部值统一为 Date 对象
const innerValue = ref(props.modelValue ? new Date(props.modelValue) : new Date())

// 监听外部 modelValue 变化
watch(
    () => props.modelValue,
    (val) => {
      innerValue.value = val ? new Date(val) : new Date()
    }
)

// 格式化显示值
const formattedValue = computed(() => {
  if (!innerValue.value) return ''
  return dayjs(innerValue.value).format(props.format)
})

// 滚动选择触发
const onChange = (val) => {
  innerValue.value = val
  emit('change', val)
}

// 点击确定
const onConfirm = (val) => {
  innerValue.value = val
  emit('update:modelValue', val)
  emit('confirm', val)
  visible.value = false
}

// 点击取消
const onCancel = () => {
  visible.value = false
  emit('cancel')
}
</script>

<style  scoped>
.m-datetime{
  width: 100%;
  ::v-deep(input){
    line-height: 32px;
  }
}


</style>
