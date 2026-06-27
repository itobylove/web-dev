<template>
  <div class="line-chart-wrapper">
    <!-- 日期选择器 -->
    <div class="date-picker-box">
      <t-date-range-picker
          v-model="dateRange"
          mode="date"
          allow-input
          clearable
          class="w300"
          @confirm="handleSearch"
      />
    </div>

    <!-- 图表容器 -->
    <div
        ref="chartDom"
        class="chart-container"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import VChart from '@visactor/vchart'
import * as api from "@/core/script/api.js";
import apiUrl from "@/core/config/url2.js";

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  // 图表标题
  title: {
    type: String,
    default: ''
  },
  // Y轴最小值
  min: {
    type: Number,
    default: 0
  },
  // Y轴最大值
  max: {
    type: Number,
    default: null
  },
  // 采样优化
  sampling: {
    type: String,
    default: ''
  }
})

// 日期范围
const dateRange = ref([])
// 图表 DOM
const chartDom = ref(null)
// 图表实例
let chartInstance = null

// 基础配置
const getBaseConfig = () => {
  return {
    type: 'line',
    invalidType: 'break',
    legends: {
      item: { label: { formatter: `{label}` } }
    },
    xField: 'date_time',
    yField: 'value',
    seriesField: 'country_text',
    tooltip: {
      dimension: {
        title: (data) => data.type,
        content: [
          {
            key: (data) => data.country_text,
            value: (data) => {
              if (data.value == null) {
                return '';
              }
              return `${data.value}(${data.unit})`;
            }
          }
        ]
      }
    },
    axes: [
      {
        orient: 'left',
        // min: props.min,
        // max: props.max,
        zero: false,
        tick: { tickCount: 10 }
      }
    ],
    title: { visible: true, text: props.title },
    data: [],
    sampling: props.sampling
  }
}

// 渲染图表
const renderChart = (data) => {
  if (!chartDom.value) return

  const config = getBaseConfig()
  config.data = data || []

  if (chartInstance) {
    chartInstance.updateConfig(config)
  } else {
    chartInstance = new VChart(config, { dom: chartDom.value })
    chartInstance.renderSync()
  }
}

// 查询数据
const handleSearch = async () => {
  const res = await api.post(apiUrl.home.noble_metal.list, {type: props.type})
  renderChart(res.list || [])
}

// 初始化
onMounted(() => {
  handleSearch()
})

// 销毁
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.release()
    chartInstance = null
  }
})
</script>

<style scoped>
.line-chart-wrapper {
  position: relative;
  margin-bottom: 20px;
}
.date-picker-box {
  text-align: right;
  z-index: 99;
  position: relative;
}
.chart-container {
  width: 100%;
  height: 600px;
  margin-top: -38px;
}
:deep(.w300) {
  width: 300px;
}
</style>