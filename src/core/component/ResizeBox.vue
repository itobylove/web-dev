<template>
  <div class="resize-box" :style="boxStyle">
    <slot />

    <div
        v-if="!disabled"
        class="resize-bar"
        :class="barClass"
        :style="barStyle"
        @pointerdown="startDrag"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
  type CSSProperties
} from 'vue'

/* =========================================================
   类型定义
========================================================= */

/**
 * 拖动模式
 * - horizontal : 左右拖动（控制宽度）
 * - vertical   : 上下拖动（控制高度）
 */
type Mode = 'horizontal' | 'vertical'

/**
 * 拖动条方向
 * - horizontal 模式下: left | right
 * - vertical   模式下: top  | bottom
 */
type Direction = 'left' | 'right' | 'top' | 'bottom'

/**
 * ResizeBox 组件参数
 */
interface Props {

  /**
   * 当前尺寸（单位：px）
   * - horizontal 模式：宽度
   * - vertical   模式：高度
   *
   * 支持 v-model:size 双向绑定
   */
  size?: number

  /**
   * 最小尺寸限制（单位：px）
   * 默认：120
   */
  min?: number

  /**
   * 最大尺寸限制（单位：px）
   * 默认：Infinity（不限制）
   */
  max?: number

  /**
   * 拖动模式
   * 默认：horizontal
   */
  mode?: Mode

  /**
   * 拖动条所在方向
   *
   * - horizontal 模式：
   *    - right（默认）
   *    - left
   *
   * - vertical 模式：
   *    - bottom（默认）
   *    - top
   *
   * 不传时会根据 mode 自动推导默认值
   */
  direction?: Direction | null

  /**
   * 拖动条厚度（单位：px）
   * 默认：4
   */
  barWidth?: number

  /**
   * 本地缓存 key
   *
   * 传入后会自动缓存尺寸到 localStorage
   * 实际存储 key 为：`${storageKey}_resize`
   */
  storageKey?: string | null

  /**
   * 是否禁用拖动
   * 默认：false
   */
  disabled?: boolean

  /**
   * 是否实时触发 update:size
   *
   * - true  : 拖动过程中实时更新（默认）
   * - false : 仅在拖动结束时更新
   */
  live?: boolean

  /**
   * 自定义拖动条 class
   * 可用于自定义样式
   */
  barClass?: string
}

/* =========================================================
   Props
========================================================= */

const props = withDefaults(defineProps<Props>(), {
  size: 300,
  min: 120,
  max: Infinity,
  mode: 'horizontal',
  direction: null,
  barWidth: 4,
  storageKey: null,
  disabled: false,
  live: true,
  barClass: ''
})

/* =========================================================
   Emits
========================================================= */

const emit = defineEmits<{
  (e: 'update:size', value: number): void
  (e: 'change', value: number): void
}>()

/* =========================================================
   内部状态
========================================================= */

const size = ref<number>(props.size)

/* =========================================================
   工具函数
========================================================= */

/** 尺寸限制 */
const clamp = (v: number): number =>
    Math.min(Math.max(v, props.min), props.max)

/* =========================================================
   方向计算
========================================================= */

const realDirection = computed<Direction>(() =>
    props.direction ??
    (props.mode === 'horizontal' ? 'right' : 'bottom')
)

/* =========================================================
   storage key
========================================================= */

const storageKey = computed<string | null>(() =>
    props.storageKey ? `${props.storageKey}_resize` : null
)

/* =========================================================
   初始化读取缓存
========================================================= */

onMounted(() => {
  if (!storageKey.value) return

  const cache = localStorage.getItem(storageKey.value)
  if (!cache) return

  const val = Number(cache)
  if (!Number.isNaN(val)) {
    size.value = clamp(val)
  }
})

/* =========================================================
   同步外部 size
========================================================= */

watch(
    () => props.size,
    v => {
      if (v !== size.value) {
        size.value = clamp(v)
      }
    }
)

/* =========================================================
   样式计算
========================================================= */

const boxStyle = computed<CSSProperties>(() =>
    props.mode === 'horizontal'
        ? { width: `${size.value}px` }
        : { height: `${size.value}px` }
)

const barStyle = computed<CSSProperties>(() => {

  if (props.mode === 'horizontal') {
    return {
      width: `${props.barWidth}px`,
      top: 0,
      bottom: 0,
      cursor: 'col-resize',
      [realDirection.value === 'right' ? 'right' : 'left']: 0
    }
  }

  return {
    height: `${props.barWidth}px`,
    left: 0,
    right: 0,
    cursor: 'row-resize',
    [realDirection.value === 'bottom' ? 'bottom' : 'top']: 0
  }
})

/* =========================================================
   拖动逻辑
========================================================= */

let moveHandler: ((e: PointerEvent) => void) | null = null
let upHandler: (() => void) | null = null

const cleanup = () => {
  document.body.classList.remove('resize-no-select')

  if (moveHandler) {
    document.removeEventListener('pointermove', moveHandler)
    moveHandler = null
  }

  if (upHandler) {
    document.removeEventListener('pointerup', upHandler)
    upHandler = null
  }
}

const startDrag = (e: PointerEvent) => {

  if (props.disabled) return

  e.preventDefault()
  e.currentTarget?.setPointerCapture?.(e.pointerId)

  const startX = e.clientX
  const startY = e.clientY
  const startSize = size.value

  document.body.classList.add('resize-no-select')

  moveHandler = (ev: PointerEvent) => {

    const delta =
        props.mode === 'horizontal'
            ? ev.clientX - startX
            : ev.clientY - startY

    const adjusted =
        (props.mode === 'horizontal' && realDirection.value === 'left') ||
        (props.mode === 'vertical' && realDirection.value === 'top')
            ? -delta
            : delta

    const newSize = clamp(startSize + adjusted)

    if (newSize === size.value) return

    size.value = newSize

    if (props.live) {
      emit('update:size', newSize)
    }
  }

  upHandler = () => {

    cleanup()

    if (!props.live) {
      emit('update:size', size.value)
    }

    emit('change', size.value)

    if (storageKey.value) {
      localStorage.setItem(storageKey.value, String(size.value))
    }
  }

  document.addEventListener('pointermove', moveHandler)
  document.addEventListener('pointerup', upHandler)
}

onBeforeUnmount(cleanup)

</script>

<style scoped>
.resize-box {
  position: relative;
  overflow: hidden;
}

.resize-no-select {
  user-select: none !important;
}

.resize-bar {
  position: absolute;
  background: transparent;
  transition: background .15s;
  z-index: 10;
}

.resize-bar::after {
  content: '';
  position: absolute;
  inset: -3px;
}

.resize-bar:hover {
  background: rgba(64, 158, 255, 0.4);
}
</style>