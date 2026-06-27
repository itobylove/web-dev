<template>
  <div ref="chartRef" :style="{ width: '100%', height: props.height }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: { type: String, default: '' },
  xAxisData: { type: Array, default: () => [] },
  seriesData: { type: Array, default: () => [] },
  iSTooltip: { type: Boolean, default: false },
  height: { type: String, default: '450px' }
})

const chartRef = ref(null)
let chartInstance = null

// 判断是否是饼图
const isPie = () => {
  return props.seriesData.some(item => item.type === 'pie')
}

const getOption = () => {
  const pieMode = isPie()

  return {
    title: {
      text: props.title,
      left: 'center',
      textStyle: { fontSize: 16, color: '#fff' }
    },

    tooltip: {
      show: props.iSTooltip,
      // 饼图必须用 item，柱状图用 axis
      trigger: pieMode ? 'item' : 'axis',
      axisPointer: { type: 'shadow' }
    },

    legend: {
      data: pieMode ? props.seriesData[0].data.map(d=>d.name) : props.seriesData.map(item => item.name),
      textStyle: { color: '#fff' },
    },
    // 饼图不显示 x、y 轴
    xAxis: pieMode
        ? []
        : [
          {
            type: 'category',
            boundaryGap: false,
            axisTick: { show: false },
            data: props.xAxisData,
            axisLabel: { color: '#fff' }
          }
        ],

    yAxis: pieMode
        ? []
        : [
          {
            type: 'value',
            axisLabel: { color: '#fff' }
          }
        ],
    grid: pieMode
        ? {} // 饼图不要 grid
        : {
          left: 0,
          right: 0,
          top: 60,
          bottom: '70px',
          containLabel: true
        },

    series: props.seriesData.map(item => {
      if (item.type === 'pie') {
        return {
          name: item.name,
          type: 'pie',
          // radius: ['40%', '70%'], // 环形饼图，更好看
          // center: ['50%', '50%'],
          selectedMode: 'single',
          label: {
            show: true,
            formatter: '{b}',
            position: 'inner',
            color: '#fff',
            fontSize: 15,
          },
          // emphasis: {
          //   label: {
          //     show: true,
          //     fontSize: 20,
          //     fontWeight: 'bold',
          //     color: '#ff994d'
          //   }
          // },
          data: item.data
        }
      }

      // 柱状/折线
      return {
        name: item.name,
        type: item.type || 'bar',
        barGap: 0,
        label: {
          show: true,
          formatter: '{c}',
          fontSize: 16,
          position: 'top',
          color: '#fff'
        },
        data: item.data
      }
    })
  }
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption(), true)
}

const resizeHandler = () => {
  chartInstance?.resize()
}

// 数据变化自动重绘（关键！）
// watch(
//     () => [props.seriesData, props.xAxisData, props.title],
//     () => {
//       chartInstance?.setOption(getOption(), true)
//     },
//     { deep: true }
// )

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
</script>