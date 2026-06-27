<template>
  <div ref="chartRef" class="chart" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '400px' },
  // 12个月数据
  monthData: { type: Array, default: () => [] },
  // 工序名称
  seriesData: { type: Array, default: () => [] },
  // 标题
  title: { type: String, default: '年度工序产能统计' }
})

const chartRef = ref(null)
let myChart = null

const initChart = () => {
  myChart = echarts.init(chartRef.value)
  render()
  window.addEventListener('resize', () => myChart?.resize())
}

const render = () => {
  const option = {
    // title: {
    //   text: props.title,
    //   textStyle: { color: '#fff', fontSize: 16 },
    //   left: 'center',
    //   top: 5
    // },
    tooltip: {
      trigger: 'axis',
      // textStyle: { color: '#fff' }
    },
    // legend: {
    //   data: props.seriesData.map(item => item.name),
    //   textStyle: { color: '#fff' },
    //   top: 30
    // },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.monthData,
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: '#555' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
      splitLine: { lineStyle: { color: '#333' } }
    },
    series: props.seriesData.map(item => ({
      name: item.name,
      type: 'line',
      smooth: true,
      data: item.data,
      itemStyle: { color: item.color },
      lineStyle: { width: 2 }
    }))
  }
  myChart.setOption(option, true)
}

watch(
    [() => props.monthData, () => props.seriesData],
    () => render(),
    { deep: true }
)

onMounted(initChart)
onUnmounted(() => {
  myChart?.dispose()
  window.removeEventListener('resize', () => myChart?.resize())
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>