<template>
    <div class="preview-wrapper">
      <div class="preview-controls">
        <label>预览比例：</label>
        <input type="range" min="0.5" max="5" step="0.1" v-model="scale" /><span>{{ scale }}</span>
        <t-switch v-model="useQrcode" size="large" >
          <template #label="slotProps">{{ slotProps.value ? '二维码' : '条码' }}</template>
        </t-switch>
        <t-switch v-model="isDebug" size="large" v-if="siyi.isDev" >
          <template #label="slotProps">{{ slotProps.value ? '调试' : '正常' }}</template>
        </t-switch>
        <button @click="printPage" class="ctrl-btn">🖨️打印</button>
        <p>一： 数量: {{ rows.length }}个</p>
        <p>二： 页面设置：边距：无</p>
        <p>三： 打印机首选项：横切标签60*40（mm)；</p>
      </div>

      <div class="preview-area" :style="{ '--preview-scale': scale }">
        <div class="preview-grid">
          <div v-for="row in rows"  class="preview-item" >
            <table v-if="useQrcode">
              <tr><td colspan="3" >{{ row.plant_id_text }}资产标签</td></tr>
              <tr><td >名称</td> <td>{{ row.name }}</td><td rowspan="3" class="qrcode"><img :src="row.qrcode"></td></tr>
              <tr><td >编码</td> <td>{{ row.code }}</td></tr>
              <tr v-if="row.manager_dept"><td >部门</td> <td>{{ row.manager_dept }}</td></tr>
            </table>
            <table v-else>
              <tr><td colspan="2">{{ row.plant_id_text }}资产标签</td></tr>
              <tr><td >资产名称</td> <td>{{ row.name }}</td></tr>
              <tr><td >资产编码</td> <td>{{ row.code }}</td></tr>
              <tr><td >责任部门</td> <td>{{ row.manager_dept }}</td></tr>
              <tr>
                <td colspan="2" class="barcode">
                  <Barcode :value="row.code" :scale="scale" :displayValue="false"  />
                </td>
              </tr>
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

const rows= ref([]);
const isDebug=ref(false) // 是否调试
const scale = ref(props.scale)
const useQrcode=ref(props.qrcode)

const printPage = () => {
  const target = document.querySelector('.preview-area')
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
                size: 600mm 400mm;   /* 宽600mm，高400mm */
            }
            *{padding: 0;margin:0}
            html, body {
                height: 100%;width: 100%;
                text-align: center;
                display: none;
            }
            table{
                width:100%;
                height:100%;
                padding: 2mm 5mm ;
            }

            tr:first-child td:first-child {
              font-size: 14pt;
            }

           td{
            padding: 0;
            outline: 1pt solid #858080;
            line-height: 1.5;
            font-size: 8pt;
            text-align: center;
            font-weight: bold;
            &:first-child{
            }
            img{width: 95%}
          }
          .qrcode img{ width: 50pt }

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
  rows.value = await Promise.all(
      props.rows.map(async row => {
        row.qrcode = await QRCode.toDataURL(row.code, { width: 200, margin: 0 });
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
  grid-template-columns: repeat(auto-fit, minmax(calc(60mm * var(--preview-scale)), 1fr));
  gap: 12px;
  justify-items: center;

  .preview-item {
    width: calc(60mm * var(--preview-scale));
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
    tr:first-child td:first-child {
      font-size: calc(14pt * var(--preview-scale));
    }

    td{
      padding: 0;
      line-height: 1.5;
      font-size: calc(8pt * var(--preview-scale));
      text-align: center;
      font-weight: bold;
      outline: 1pt solid #858080;
      &:first-child{
      }
      img{width: 95%}
    }
    .qrcode img{ width: calc(50pt * var(--preview-scale));; }
  }
}



</style>

