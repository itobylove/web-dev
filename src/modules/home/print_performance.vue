<template>
  <div class="preview-wrapper">
    <div class="preview-controls">
      <label>预览比例：</label>
      <input type="range" min="0.5" max="5" step="0.1" v-model="scale" /><span>{{ scale }}</span>
      <t-switch v-model="isDebug" size="large" v-if="siyi.isDev" >
        <template #label="slotProps">{{ slotProps.value ? '调试' : '正常' }}</template>
      </t-switch>
      <button @click="printPage" class="ctrl-btn">🖨️打印</button>
      <p>二： 页面设置：边距：无</p>
      <p>三： 打印机首选项：横切标准横版；</p>
    </div>

    <div class="preview-area" :style="{ '--preview-scale': scale }">
      <div class="preview-grid">
        <div class="preview-item" >
          <table  border="0" cellpadding="0" cellspacing="0" >
            <tbody>
            <tr>
              <td colspan="12" style="border-bottom: none;font-size: 20px;"> {{month.year}} 年 {{month.month}}月 {{userInfo.dept_name}}{{userInfo.position_name}} 绩效考核表</td>
            </tr>

            <tr>
              <td colspan="2" style="text-align: left;border-top: none;">&nbsp;&nbsp;部门: {{userInfo.dept_name}}</td>
              <td colspan="2" style="text-align: left;">&nbsp;&nbsp;职位:{{userInfo.position_name}}</td>
              <td colspan="3" style="text-align: left;">&nbsp;&nbsp;被考核人: {{userInfo.nickname}}</td>
              <td colspan="2" style="text-align: left;">&nbsp;&nbsp;日期:{{ (new Date()).toISOString().split('T')[0] }}</td>
              <td colspan="3" style="text-align: left;">&nbsp;&nbsp;考评人:</td>
            </tr>

            <tr>
              <td>序号</td>
              <td colspan="2" style="width: 180px; max-width: 120px; white-space: normal; word-break: break-word; word-wrap: break-word; vertical-align: top;">衡量指标名称</td>
              <td>目标值</td>
              <td>分数</td>
              <td >分数计算</td>
              <td>数据提供部门</td>
              <td>实际完成数据</td>
              <td style="width: 180px;">指标定义</td>
              <td>实际完成率</td>
              <td>自评得分</td>
              <td>上级审核结果</td>
            </tr>
            <tr  v-for="(item, index) in list" :key="index">
              <td>{{ index+1 }}</td>
              <td colspan="2" style="width: 180px; max-width: 180px; white-space: normal; word-break: break-word; word-wrap: break-word; vertical-align: top;" >{{ item.indicator_level }}</td>
              <td>{{item.target_value}}</td>
              <td>{{ item.score_value }}</td>
              <td>{{ item.score_calculation }}</td>
              <td>{{ item.data_source }}</td>
              <td>{{ item.price }}</td>
              <td style="width: 180px;" >{{ item.indicator_definition }}</td>
              <td>{{ item.price_lv }}</td>
              <td>{{ item.score }}</td>
              <td></td>
            </tr>

            <tr>
              <td colspan="2" >绩效考评总分</td>
              <td colspan="8">按照公式自动运算</td>
              <td>{{ list.reduce((sum, item) => sum + (Number(item.score) || 0), 0).toFixed(2) }}</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="12" >当月特殊贡献/重大过错记录清单（部门安全事故>3万，绩效分全部扣完，>3千元每单扣5分，品质批量报废客诉>5万，绩效分全部扣完）</td>
            </tr>
            <tr>
              <td>序号</td>
              <td colspan="5">加分事项</td>
              <td colspan="4">扣分事项（扣分输入负数）</td>
              <td>加/扣分</td>
              <td>评价人</td>
            </tr>
            <tr v-for=" index in 2" :key="index">
              <td>{{ index }}</td>
              <td colspan="5"></td>
              <td colspan="4"></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colspan="10" style="text-align: right;">最终得分&nbsp;</td>
              <td>{{ list.reduce((sum, item) => sum + (Number(item.score) || 0), 0).toFixed(2) }}</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4"  style="text-align: left;">提报人：{{ userInfo.nickname }}</td>
              <td colspan="4" style="text-align: left;" >审核：</td>
              <td colspan="4" style="text-align: left;" >批准：</td>
            </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
</template>
<script setup>
import {onActivated, onMounted, ref} from "vue"
import {openWindow} from "@/core/script/dialog.js";
import siyi from "@/core/script/siyi.js";
import url2 from "@/core/config/url2.js";
import * as api from "@/core/script/api.js";

const list = ref([]);
const userInfo = ref({})

const props = defineProps({
  title: {type: String, default: '预览'},
  query: {type: Object, default: {}},
  rows: {type: Array, default: []},
  dataOption: {type: Object, default: {}},
  qrcode:{type: Boolean, default: true},
  scale: {type: Number, default: 2},
})

const month = ref({})
const isDebug = ref(false) // 是否调试
const scale = ref(props.scale)

const printPage = () => {
  const target = document.querySelector('.preview-area')
  console.log('print target', target);
  if (!target) return

  const printWindow = openWindow('', '','', 800,900)
  if (!printWindow) return

  const html =`
    <html>
      <head>
        <title>打印预览</title>
        <meta charset="UTF-8">
        <style>

            *{padding: 0;margin:0}
            html, body {
                height: 100%;
                width: 100%;
            }
            table{
                width: 95% !important;
                margin: 10mm 5mm;
                border-right: 1px solid #000 !important;
                border-bottom: 1px solid #000 !important;
            }

           td{
              padding: 3px 3px !important;
              border-top: 1px solid #000 !important;
              border-left: 1px solid #000 !important;
              font-size: 10px;
              height: 7mm;
              text-align: center;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
          }

          @media print {
              html, body {
               display: block;
              }
          }

        </style>
      </head>
      <body>
         ${target.innerHTML}
      </body>
    </html>
  `;
  printWindow.document.write(html)

  isDebug.value || printWindow.document.close()
  printWindow.focus()

  printWindow.onload = () => {
    isDebug.value || printWindow.print()
    printWindow.close()
  }
}
onMounted(async () => {
  month.value = {
    year: props?.query?.asset?.month?.split('-')[0],
    month: parseInt(props?.query?.asset?.month?.split('-')[1])
  }
  console.log('month', props?.query?.asset?.assessee)
  const res = await api.get(url2.home.performance.assessee_list, props?.query?.asset);
  list.value = res.list

  const userRes = await  api.post(url2.home.performance.user_info, {user_id: props?.query?.asset?.assessee})
  if(userRes) {
    userInfo.value = userRes


    console.log(userInfo.value)
  }

})
</script>
<style scoped>
.preview-wrapper {
  height: 100%;
  padding: 12px 12px 50px 12px ;
  font-family: sans-serif;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  .ctrl-btn{
    padding: 5px 10px;
    color: #000;
    cursor: pointer;
    background:none;
    border:none;
    font-size: 14px;
    margin-right: 100px;
    &:hover{
      background: #eee;
    }
  }
  p{
    color: #262727;
  }
}

.preview-area {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  background: #f9f9f9;
  height: 100%;
  overflow-y: auto;
}

.preview-grid {
  display: grid;

  gap: 12px;
  justify-items: center;

  .preview-item {
    height: 310mm;
    width: 297mm;
    aspect-ratio: 2 / 1;
    background: white;
    border: 1px dashed #bbb;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
    flex-direction: column;
  }


  table{
    padding: 2mm 5mm ;
    th{
      height: 20px;
    }


    td{
      padding: 0 3px !important;
      font-size: 13px;
      text-align: center;
      outline: 1pt solid #858080;

    }
  }
}



</style>

