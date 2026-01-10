<template>
  <div class="background" :style="backgroundStyle">
    <div v-if="props.showStar" class="stars" ref="starsRef" :style="starsStyle"></div>
    <slot />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

/**
 * 可配置的组件参数 props
 */
const props = defineProps({

  /**
   * 是否显示星星
   */
  showStar: {
    type: Boolean,
    default: false
  },

  /**
   * 背景旋转一圈所需的秒数（数值越小转得越快）
   */
  rotateSpeed: {
    type: Number,
    default: 720
  },

  /**
   * 星星的总数量（密集度）
   */
  starCount: {
    type: Number,
    default: 800
  },

  /**
   * 星星的基础距离（越大越远，3D感越强）
   */
  distanceBase: {
    type: Number,
    default: 800
  },

  /**
   * 星星距离的随机变化范围（用于增加远近深度感）
   */
  distanceVariation: {
    type: Number,
    default: 300
  },

  /**
   * 星星最小缩放比例（越小越“远”）
   */
  minScale: {
    type: Number,
    default: 0.2
  },

  /**
   * 星星最大缩放比例（越大越“近”）
   */
  maxScale: {
    type: Number,
    default: 1.2
  },

  /**
   * 背景渐变主色调（最多 3~6 个颜色最佳，越多越丰富）
   */
  colors: {
    type: Array,
    default: () => ['#0b0f2b', '#1b2947', '#243b74', '#3c5a9c']
  }
})

const starsRef = ref(null)

/**
 * 控制旋转动画的速度样式
 */
const starsStyle = computed(() => ({
  animationDuration: `${props.rotateSpeed}s`
}))

/**
 * 动态生成背景渐变色样式
 */
const backgroundStyle = computed(() => {
  const colorStops = props.colors.map((color, i) => `${color} ${10 + i * 20}%`).join(', ')
  return {
    background: `radial-gradient(220% 105% at top center, ${colorStops})`,
    backgroundAttachment: 'fixed'
  }
})

/**
 * 页面加载后生成星星节点
 */
onMounted(() => {
  if (!props.showStar) return;

  const container = starsRef.value
  const fragment = document.createDocumentFragment()

  for (let i = 0; i < props.starCount; i++) {
    const star = document.createElement('div')
    star.classList.add('star')

    const scale = props.minScale + Math.random() * (props.maxScale - props.minScale)
    const distance = props.distanceBase + Math.random() * props.distanceVariation
    const rotateY = Math.random() * 360
    const rotateX = Math.random() * -50

    star.style.transformOrigin = `0 0 ${distance}px`
    star.style.transform = `translate3d(0, 0, -${distance}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`

    fragment.appendChild(star)
  }

  container.appendChild(fragment)
})
</script>

<style>
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

@keyframes rotate {
  0% {
    transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(0);
  }
  100% {
    transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(-360deg);
  }
}

.stars {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: perspective(500px);
  transform-style: preserve-3d;
  perspective-origin: 50% 100%;
  animation-name: rotate;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.star {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 2px;
  background-color: #f7f7b6;
  backface-visibility: hidden;
}
</style>
