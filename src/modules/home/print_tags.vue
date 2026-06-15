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
      <p>三： 打印机首选项：横切标签80*40（mm)；</p>
    </div>

    <div class="preview-area" :style="{ '--preview-scale': scale }">
      <div class="preview-grid">
        <div v-for="row in rows"  class="preview-item" >
          <table v-if="useQrcode" border="0" >
            <tbody>
            <tr>
              <td>本厂型号：</td><td>{{ row.part_num }}  {{ row.part_rev }}</td>
              <td rowspan="3" class="qrcode"><img :src="row.qrcode" />
                <br/>
                <br/>
                叉位：{{row.fork_number}}X</td>
            </tr>
            <tr ><td>客户物料号：</td><td>{{ row.cust_mat_code }}</td></tr>
            <tr ><td COLSPAN="2">{{ row.water_number }}</td></tr>
            <tr ><td colspan="3">客户代码：{{ row.part_num.slice(2,6) }}  &nbsp;&nbsp;&nbsp; 数量：{{row.number}}{{row.batch}} &nbsp;&nbsp;&nbsp;  周期：{{row.period}}</td></tr>
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
                size: 800mm 400mm;   /* 宽800mm，高400mm */
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
  rows.value = await Promise.all(
      props.query.asset.map(async row => {
        row.qrcode = await QRCode.toDataURL(JSON.stringify({cust_mat_code:row.cust_mat_code,part_num:row.part_num,water_number:row.water_number }), { width: 200, margin: 0 });
        return row;
      })
  );
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
    width: calc(80mm * var(--preview-scale));
    aspect-ratio: 2 / 1;
    background: white;
    border: 1px dashed #bbb;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
    flex-direction: column;
  }


  table{
    width:100%;
    height:100%;
    padding: 2mm 5mm ;
    th{
      height: 20px;
    }


    td{
      padding: 0;
      line-height: 1.5;
      font-size: calc(8pt * var(--preview-scale));
      text-align: center;
      outline: 1pt solid #858080;
      img{width: 95%}
    }
    .qrcode img{ width: calc(50pt * var(--preview-scale));; }
  }
}



</style>

