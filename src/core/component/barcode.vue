<template>
  <img ref="barcode" src="" />
</template>

<script setup>
import {onMounted, watch, ref, nextTick, onActivated} from 'vue'
import JsBarcode from 'jsbarcode'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  format: {
    type: String,
    default: 'CODE128'
  },
  width: {
    type: Number,
    default: 1 // 调整条码宽度
  },
  height: {
    type: Number,
    default: 20 // 调整条码高度
  },
  displayValue: {
    type: Boolean,
    default: true // 默认显示文字
  },
  margin: {
    type: Number,
    default: 2 // 移除边距
  },
  textMargin: {
    type: Number,
    default: 0 // 文字边距
  },
  fontSize: {
    type: Number,
    default: 10 // 调整字体大小
  },
  scale: {
    type: Number,
    default: 1 // 默认不缩放
  }
});

const barcode = ref();

// 渲染条形码的函数
const renderBarcode = () => {
  const barcodeOptions = {
    format: props.format,
    width: props.width * props.scale,  // 根据 scale 缩放 width
    height: props.height * props.scale, // 根据 scale 缩放 height
    fontSize: props.fontSize * props.scale, // 根据 scale 缩放字体大小
    displayValue: props.displayValue,
    margin: props.margin,
    textMargin: props.textMargin,
  };
  if (barcode.value) {
    JsBarcode(barcode.value, props.value, barcodeOptions);
  }
};

// 在组件挂载时渲染条形码
onMounted(() => {
  renderBarcode();
});

// 监听 props 变化时重新渲染条形码
watch(() => props.scale, renderBarcode, { immediate: true });
</script>