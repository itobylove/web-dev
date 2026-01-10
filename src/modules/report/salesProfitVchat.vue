<template>
  <div ref="box" class="vchartBox">
    <div class="header">
      <SearchComponent ref="searchRef" v-bind="searchConfig"/>
    </div>
    <div class="body">
      <div ref="vchart1" class="vchart1">1</div>
      <div ref="vchart2" class="vchart2">2</div>
    </div>
  </div>
</template>
<script setup>
import {defineAsyncComponent, onMounted, ref} from "vue";
import siyi from "@/core/script/siyi.js";
import * as core from '@/core/script/core.js'
import * as echarts from 'echarts';

const searchRef = ref()
const vchart1 = ref()
const vchart2 = ref()
const SearchComponent = defineAsyncComponent(() => siyi.pc ? import('@/core/component/search.vue') : import('@/core/component/search_mobile.vue'))
const searchConfig = {
  filter: false,
  search: [
    {
      type: 'rangeMonth',
      field: 'month',
      value: [core.date.time('YYYY-01-01 00:00:00'), core.date.time('YYYY-12-DD 23:59:59')],
      options: {placeholder: '月份'}
    },
  ]
}

const options1 = {
  title: {text: '销售利润表', left: '5%', top: '3%'},
  grid: {left: '10%', top: '10%'},
  legend: {right: '10%', top: '3%', data: ['1990']},
  xAxis: {
    name: '毛利率',
    splitNumber: 10,
    splitLine: {lineStyle: {type: 'dashed'}},
    axisLabel: {formatter: '{value}%', align: 'center'},
  },
  yAxis: {
    name: '销售额',
    splitNumber: 10,
    splitLine: {lineStyle: {type: 'dashed'}},
    axisLabel: {formatter: '{value}万元', align: 'right'},
    scale: true
  },
  series: [
    {
      type: 'scatter',
      name: '1990',
      data: [
        [5, 100, 100 / 2, '972', [150, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [3, 80, 80 / 2, '973', [120, 8, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [2, 60, 60 / 2, '974', [130, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [3, 50, 50 / 2, '1185', [170, 80, 7, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [-5, 50, 50 / 2, '1186', [110, 80, 70, 11, 130, 120, 200, 150, 80, 70, 110, 130]],
        [-3, 100, 80 / 2, '1187', [90, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [-2, 90, 60 / 2, '1188', [100, 80, 70, 110, 13, 120, 200, 150, 80, 70, 110, 130]],
        [-1, 60, 50 / 2, '1189', [110, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [-3, 50, 50 / 2, '1325', [120, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [-6, 100, 80 / 2, '1234', [130, 80, 70, 11, 130, 120, 200, 150, 80, 70, 110, 130]],
        [-7, 80, 60 / 2, '0001', [140, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [-8, 90, 50 / 2, '1108', [150, 80, 70, 110, 130, 120, 20, 150, 80, 70, 110, 130]],
        [10, 50, 100 / 2, '1345', [50, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130]],
        [9, 100, 80 / 2, '1346', [120, 80, 70, 110, 130, 120, 200, 15, 80, 70, 110, 130]],
        [2, 70, 60 / 2, '1356', [110, 80, 70, 11, 130, 12, 200, 150, 80, 70, 110, 130]],
        [5, 80, 50 / 2, '1287', [100, 80, 70, 110, 130, 120, 20, 15, 80, 70, 11, 130]],
      ],
      symbolSize: data => data[2],
      emphasis: {
        focus: 'series',
        label: {
          show: true,
          formatter: function (param) {
            return param.data[3];
          },
          position: 'top'
        }
      },
      itemStyle: {
        borderColor: 'rgba(255,0,0,1)',
        color: (param) => {
          console.log(param)
          return param.data[0] < 0 ? '#ff0000' : '#00ff00';
        },
      }
    },
  ]
};
const options2 =
    {
      xAxis: {
        type: 'category',
        data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [110, 80, 70, 110, 130, 120, 200, 150, 80, 70, 110, 130],
          type: 'bar'
        },
      ]
    };
;
onMounted(() => {
  const myChart1 = echarts.init(vchart1.value);
  const myChart2 = echarts.init(vchart2.value);
  myChart1.setOption(options1);
  myChart2.setOption(options2);

  myChart1.on('click', function (param) {
    myChart2.setOption({
      series: [{data: param.data[4]}]
    });
  });

})

</script>
<style scoped>
.vchartBox {
  width: 100%;
  height: 100%;
  padding: 5px;
  position: relative;
  display: flex;
  flex-direction: column;

  > .header {
    flex-shrink: 0;
    border: 1px solid #c9d0da;
    border-bottom: 0 none;
    border-radius: 5px 5px 0 0;
    background-color: #f3f4f7;
    display: flex;
    flex-direction: column;
  }

  > .body {
    flex: 1;
    flex-shrink: 0;
    border: 1px solid #c9d0da;
    border-radius: 0 0 5px 5px;
    overflow: hidden;
    display: flex;

    > div {
      flex: 1;
    }

  }
}
</style>