<template>
  <t-upload
      v-bind="attrs"
      :files="modelValue"
      :action="action"
      :headers="headers"
      :multiple="multiple"
      :accept="finalAccept"
      :max="max"
      :theme="theme"
      :placeholder="placeholderText"
      :before-upload="handleBeforeUpload"
      @one-file-success="handleSuccess"
  />
</template>

<script setup>
import { ref, computed, useAttrs } from 'vue'
import dialog from '@/core/script/dialog'
import { getHttpDefaultHeaders, url } from '@/core/script/api'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  action: { type: String, default: url.common.uploader },
  maxSize: { type: Number, default: 5 }, // MB
  max: { type: Number, default: 10 },
  acceptType: { type: String, default: ''},
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: true },
  theme: { type: String, default: 'file-flow' },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const headers = ref({})

const ACCEPT_MAP = {
  image: '.jpg,.jpeg,.png,.gif,.webp',
  doc: '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf',
  zip: '.zip,.rar,.7z',
  audio: '.mp3,.wav',
  video: '.mp4,.avi,.mov'
}

const TYPE_LABEL = {
  image: '图片',
  doc: '文档',
  zip: '压缩文件',
  audio: '音频',
  video: '视频',
}

const placeholderText = computed(() => {
  if (props.placeholder) return props.placeholder
  const typeLabel = TYPE_LABEL[props.acceptType] || '文件'
  return `支持${props.multiple ? '批量上传' : '上传'}${typeLabel}，最多 ${props.max} 个文件 ,单文件大小不能超过 ${props.maxSize}MB`
})

const finalAccept = computed(() =>
    props.accept || ACCEPT_MAP[props.acceptType] || ''
)

const handleBeforeUpload = file => {
  if (file.size > props.maxSize * 1024 * 1024) {
    dialog.warning(`文件不能超过 ${props.maxSize}MB`)
    return false
  }
  headers.value = getHttpDefaultHeaders()
  return true
}

const handleSuccess = ({ response = {}, file = {} }) => {
  if (response.code !== 20000) {
    dialog.error(response.message)
    return
  }
  emit('update:modelValue', [
    ...props.modelValue,
    {
      name: file.name,
      size: file.size,
      url: response.data?.url || '',
      path: response.data?.path || '',
      host: response.data?.host || '',
      status: 'success'
    }
  ])
}
</script>