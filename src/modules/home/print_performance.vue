<template>
  <div class="preview-wrapper">
    <div class="preview-controls">
      <label>预览比例：</label>
      <input type="range" min="0.5" max="5" step="0.1" v-model="scale" /><span>{{ scale }}</span>
      <t-switch v-model="isDebug" size="large" v-if="siyi.isDev" >
        <template #label="slotProps">{{ slotProps.value ? '调试' : '正常' }}</template>
      </t-switch>
      <button @click="printPage" class="ctrl-btn">🖨️打印</button>
      <p>一： 数量: {{ rows.length }}个</p>
      <p>二： 页面设置：边距：无</p>
      <p>三： 打印机首选项：横切标准横版；</p>
    </div>

    <div class="preview-area" :style="{ '--preview-scale': scale }">
      <div class="preview-grid">
        <div class="preview-item" >
          <table  border="0" >
            <tbody>
            <tr>
              <td colspan="12" style="border-bottom: none;">2026年4月人资部经理 绩效考核表</td>
            </tr>

            <tr>
              <td colspan="2" style="text-align: left;border-top: none;">&nbsp;&nbsp;部门:xxx</td>
              <td colspan="2" style="text-align: left;">&nbsp;&nbsp;职位:xxx</td>
              <td colspan="3" style="text-align: left;">&nbsp;&nbsp;被考核人:xxx</td>
              <td colspan="2" style="text-align: left;">&nbsp;&nbsp;日期:xxx</td>
              <td colspan="3" style="text-align: left;">&nbsp;&nbsp;考评人:xxx</td>
            </tr>

            <tr>
              <td>序号</td>
              <td colspan="2">衡量指标名称</td>
              <td>目标值</td>
              <td>分数</td>
              <td>分数计算</td>
              <td>数据提供部门</td>
              <td>实际完成数据</td>
              <td>指标定义</td>
              <td>实际完成率</td>
              <td>自评得分</td>
              <td>上级审核结果</td>
            </tr>
            <tr v-for="index in 3" :key="index">
              <td>{{ index }}</td>
              <td colspan="2">基于产量的标准人力配置达成率</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>1</td>
              <td>1</td>
            </tr>

            <tr>
              <td colspan="2" >绩效考评总分</td>
              <td colspan="8">按照公式自动运算</td>
              <td>1</td>
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
            <tr v-for="index in 3" :key="index">
              <td>{{ index }}</td>
              <td colspan="5"></td>
              <td colspan="4"></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colspan="2">提报人：xxxx</td>
              <td colspan="2"></td>
              <td colspan="2">审核：xxxx</td>
              <td colspan="2"></td>
              <td colspan="2">审核：xxxx</td>
              <td colspan="2"></td>
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
import Barcode from "@/core/component/barcode.vue";
import QRCode from "qrcode";
import {openWindow} from "@/core/script/dialog.js";
import siyi from "@/core/script/siyi.js";

const props = defineProps({
  title: {type: String, default: '资产标签打印预览'},
  query: {type: Object, default: {}},
  rows: {type: Array, default: []},
  dataOption: {type: Object, default: {}},
  qrcode:{type: Boolean, default: true},
  scale: {type: Number, default: 2},
})

const rows = ref([]);
const isDebug = ref(false) // 是否调试
const scale = ref(props.scale)
const useQrcode = ref(props.qrcode)

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
            @page {
                size: 1200mm 400mm;   /* 宽800mm，高400mm */
            }
            *{padding: 0;margin:0}
            html, body {
                height: 100%;
                width: 100%;
            }
            table{
                width: 90% !important;
                height: 90% !important;
                border-collapse: collapse;
                border: 1px solid #000 !important;
                margin: 0mm 2mm;
            }

           td{
              border: 1px solid #000 !important;
              font-size: 8pt !important;
              text-align: center;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
          }
          .qrcode img{ width: 70px }

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
  console.log('print  props', props.query.asset);

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
  grid-template-columns: repeat(auto-fit, minmax(calc(80mm * var(--preview-scale)), 1fr));
  gap: 12px;
  justify-items: center;

  .preview-item {
    height: 210mm;
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
      padding: 0;
      line-height: 1.5;
      font-size: 17px;
      text-align: center;
      outline: 1pt solid #858080;
      img{width: 95%}
    }
    .qrcode img{ width: calc(50pt * var(--preview-scale));; }
  }
}



</style>

