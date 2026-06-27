<template>
  <div ref="chartRef" class="line-chart" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '400px' },
  title: { type: String, default: '' },
  legend: { type: Array, default: () => [] },
  xAxis: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  iSTooltip: { type: Boolean, default: false }
})

const chartRef = ref(null)
let myChart = null

// 减少上下空白
const grid = {
  left: 10,
  right: 10,
  top: '10%',
  bottom: '4%',
  containLabel: true
}

const initChart = () => {
  myChart = echarts.init(chartRef.value)
  renderChart()
  window.addEventListener('resize', handleResize)
}

const renderChart = () => {
  const hasData = props.xAxis.length && props.series.length

  const option = {
    // ========== 标题 全白 ==========
    title: {
      text: props.title,
      left: 'center',
      top: '2%',
      textStyle: {
        fontSize: 16,
        color: '#fff' // 白色
      }
    },

    // ========== 提示框 全白 ==========
    tooltip: {
      show: props.iSTooltip,
      trigger: 'axis',
      // textStyle: { color: '#fff' }
    },

    // ========== 图例 全白 ==========
    legend: {
      data: props.legend,
      top: '2%',
      textStyle: {
        fontSize: 12,
        // color: '#fff' // 白色
      }
    },

    grid,

    // ========== X轴 全白 ==========
    xAxis: {
      type: 'category',
      data: hasData ? props.xAxis : ['暂无数据'],
      boundaryGap: false,
      // axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#fff' }, // 白色
      axisTick: { show: false }
    },

    // ========== Y轴 全白 ==========
    yAxis: {
      type: 'value',
      // axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#fff' }, // 白色
      // splitLine: { lineStyle: { color: '#333' } }
    },

    series: hasData
        ? props.series.map(item => ({
          type: 'line',
          smooth: true,
          ...item
        }))
        : [{ name: '暂无数据', type: 'line', data: [] }]
  }

  myChart.setOption(option, true)
}

const handleResize = () => myChart && myChart.resize()

watch(
    [() => props.title, () => props.legend, () => props.xAxis, () => props.series],
    () => renderChart(),
    { deep: true }
)

onMounted(initChart)
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.dispose()
})
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
}
</style>