<template>
  <!-- 确保 ref 存在，且宽高生效 -->
  <div ref="chartRef" class="multi-axis-chart" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '400px' },
  title: { type: String, default: '' },
  xAxisData: { type: Array, default: () => [] },
  legendData: { type: Array, default: () => [] },
  seriesList: { type: Array, default: () => [] },
  yAxisConfig: { type: Array, default: () => [] },
  isShowTooltip: { type: Boolean, default: false },
  isxAxisTable: { type: Boolean, default: false }
})

const chartRef = ref(null)
let myChart = null

// 1. 初始化图表，确保 DOM 已渲染
const initChart = async () => {
  // 等待 DOM 更新完成
  await nextTick()

  if (!chartRef.value) return

  // 先销毁旧实例，防止重复初始化
  if (myChart) {
    myChart.dispose()
  }

  // 检查容器宽高
  const { clientWidth, clientHeight } = chartRef.value
  if (clientWidth === 0 || clientHeight === 0) {
    console.warn('ECharts 容器宽高为 0，初始化失败')
    return
  }

  myChart = echarts.init(chartRef.value)
  renderChart()
  window.addEventListener('resize', handleResize)
}

// 2. 渲染图表（加 myChart 判空）
const renderChart = () => {
  if (!myChart) return // 核心：判空，防止 null 调用 setOption

  const hasXData = props.xAxisData.length > 0
  const hasSeriesData = props.seriesList.length > 0

  const getYAxisCommonStyle = (color) => ({
    axisLabel: { color: '#fff' },
    axisLine: { lineStyle: { color } },
    splitLine: { lineStyle: { color: '#333' } },
    nameTextStyle: { color: '#fff', fontSize: 12 },
    nameGap: 20,
    nameLocation: 'end'
  })

  const yAxis = props.yAxisConfig.map((axis, index) => {
    const { name, unit, min, max, interval, color = '#666' } = axis
    return {
      type: 'value',
      name,
      // ...(min !== undefined && { min }),
      // ...(max !== undefined && { max }),
      ...(interval !== undefined && { interval }),
      axisLabel: {
        formatter: unit ? `{value} ${unit}` : '{value}',
        color: '#fff'
      },
      ...getYAxisCommonStyle(color),
      ...(index > 0 ? { offset: index * 80 } : {})
    }
  })

  const xAxis = [
    // 主X轴（显示工序，向下延伸竖线）
    {
      type: 'category',
      data: hasXData ? props.xAxisData : [],
      boundaryGap: true,
      axisPointer: { type: 'shadow' },
      axisLabel: {
        color: '#fff',
        interval: 0, // 强制显示所有标签
        width: 80, // 限制标签宽度
        overflow: 'break' // 文字自动换行
      },
      axisLine: { lineStyle: { color: '#666',width:2 } },
      axisTick: {
        alignWithLabel: true,
        length: props.seriesList.length * 30 + 30 // 动态延伸长度，刚好覆盖所有表格行
      }
    },
    // 动态生成表格行
    ...(props.isxAxisTable
            ? props.seriesList.map((item, index) => ({
              position: 'bottom',
              offset: 30 * (index + 1),
              type: 'category',
              data: item.data,
              name: `${index + 1}月`,
              nameGap: 15,
              boundaryGap: true,
              nameLocation: 'start',
              axisTick: { show: false },
              nameTextStyle: {
                color: props.seriesList[index].color,
                fontWeight: 'bold'
              },
              axisLabel: {
                color: props.seriesList[index].color,
                fontWeight: 'bold'
              }
            }))
            : []
    )

  ]
  const option = {
    title: {
      text: props.title,
      textStyle: { color: '#fff', fontSize: 16 },
      left: 'center',
      top: 10,
      show: !!props.title
    },
    alignTicks: true,
    responsive: true,
    backgroundColor: 'transparent',
    tooltip: {
      show: props.isShowTooltip,
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } }
    },
    legend: {
      data: props.seriesList.map(d => d.name ),
      textStyle: { color: '#fff' },
      show: true
    },
    grid: {
      left: '2%',
      right: '3%',
      bottom: props.isxAxisTable ? `${ props.seriesList.length * 25  }px` : (props.seriesList.length >= 19 ? `90px` :  `70px`) ,
      containLabel: true
    },
    xAxis,
    yAxis,
    series: hasSeriesData
        ? props.seriesList.map(item => ({
          type: item.type || 'bar',
          yAxisIndex: item.yAxisIndex || 0,
          label: {
            show: true,
            formatter: (params) => {
              return params.value === 0 ? '' : params.value
            },
            fontSize: 16,
            position: 'top',
            color: '#fff'
          },
          endLabel:{
            show: true,
            formatter: (params) => {
              return params.value === 0 ? '' : params.seriesName
            },
            fontSize: 16,
            position: 'bottom',
            color: '#fff'
          },
          tooltip: {
            valueFormatter: value => `${value} ${item.unit || ''}`
          },
          ...item
        }))
        : [{ type: 'bar', data: [] }]
  }

  myChart.setOption(option, true)
}

// 3. resize 也判空
const handleResize = () => {
  if (myChart) {
    myChart.resize()
  }
}

// 4. 监听数据变化，触发渲染
// watch(
//     [
//       () => props.title,
//       () => props.xAxisData,
//       () => props.legendData,
//       () => props.seriesList,
//       () => props.yAxisConfig
//     ],
//     () => {
//       renderChart()
//     },
//     { deep: true }
// )

onMounted(() => {
  initChart()

  console.log('onMounted', props.legendData )
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped>
.multi-axis-chart {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
