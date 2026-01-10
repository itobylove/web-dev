<template>
    <div class="preview-wrapper">
      <div class="preview-controls">
        <label>预览比例：</label>
        <input type="range" min="0.5" max="5" step="0.1" v-model="scale" />
        <span>{{ scale }}</span>
        <t-switch v-model="showCate" size="large" >
          <template #label="slotProps">{{ slotProps.value ? '显示分类' : '隐藏分类' }}</template>
        </t-switch>
        <t-switch v-model="useQrcode" size="large" >
          <template #label="slotProps">{{ slotProps.value ? '二维码' : '条码' }}</template>
        </t-switch>
        <t-switch v-model="isDebug" size="large" v-if="siyi.isDev" >
          <template #label="slotProps">{{ slotProps.value ? '调试' : '正常' }}</template>
        </t-switch>
        <button @click="printPage" class="ctrl-btn">🖨️打印</button>
        <p>一： 数量: {{ props.rows.length }}个</p>
        <p>二： 页面设置：边距：默认</p>
        <p>三： 打印机首选项：横切标签30*10（mm)</p>
      </div>

      <div class="preview-area print-target" :style="{ '--preview-scale': scale }">
          <div class="preview-grid">
            <div v-if="useQrcode"  v-for="row in rows" class="preview-item qrcode-label" >
              <div class="qr-info">
                <p >{{ row.code }} </p>
                <p v-if="showCate" >({{row.cate_name}})</p>
              </div>
              <img :src="row.qrcode">
            </div>
            <div v-else v-for="row in props.rows" class="preview-item">
              <Barcode  :value="row.code" :scale="scale" height="20" :display-value="false" />
              <span >{{ row.code }} <small v-if="showCate">({{row.cate_name}})</small></span>
            </div>
          </div>
      </div>


    </div>
</template>
<script setup>
import {onMounted, ref} from "vue"
import Barcode from "@/core/component/barcode.vue";

import {openWindow} from "@/core/script/dialog.js";
import QRCode from "qrcode";
import siyi from "@/core/script/siyi.js";


const props = defineProps({
  title: String,
  query: Object,
  rows: Array,
  dataOption: Object,
})
const scale = ref(3) // 缩放比例
const showCate= ref(true); // 显示分类
const useQrcode=ref(true) // 是否使用二维码
const isDebug=ref(false) // 是否调试
const rows= ref([]);

const printPage = () => {
  const target = document.querySelector('.print-target')
  if (!target) return
  console.log('target.innerHTML',target);
  const printWindow = openWindow('', '','', 800,900)
  if (!printWindow) return

  const html =`
    <html>
      <head>
        <title>打印预览</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: 30mm 10mm;
            margin: 0;
          }

          body {
            margin: 0 auto;
            padding: 0;
            font-family: sans-serif;
            background: none;
            width: 30mm;
            height: 10mm;
            display: none;
          }
          .preview-grid {
            width: 100%;
            display: grid;
            grid-template-columns: 30mm;
            gap: 0;
            box-sizing: border-box;
          }

      .preview-item {
        width: 30mm;
        height: 10mm;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        /*outline: 1px dashed #bbb;*/
        flex-direction: column;
        img{
          margin-top: 2pt;
          width: 90%;
          height: 55%;
        }
        span{
          font-size: 6pt;
          height: 12pt;
          line-height: 20px;
          margin-top: -3pt;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          small{
            font-size: 6pt;
            height: 12pt;
          }
        }
      }
      .qrcode-label{
        flex-direction: row;
        img{
          width: unset;
          height: 80%;
        }
        .qr-info{
          width: 60%;
          p{
            font-size:  7pt;
            line-height: 10pt;
            margin: 0;
          }
        }
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
  console.log('print  props', props);
  rows.value = await Promise.all(
      props.rows.map(async row => {
        row.qrcode = await QRCode.toDataURL(row.code, { width: 200, margin: 0 });
        return row;
      })
  );


  /*setTimeout(() => {
    printPage()
  }, 0)*/
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
  grid-template-columns: repeat(auto-fit, minmax(calc(30mm * var(--preview-scale)), 1fr));
  gap: 12px;
  justify-items: center;
}


.preview-item {
  width: calc(30mm * var(--preview-scale));
  aspect-ratio: 3 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: white;
  outline: 1px dashed #bbb;
  flex-direction: column;
  padding: 5px;
  img{
    margin-top: 2px;
    width: 90%;
    height: 55%;
  }
  span{
    font-size:  calc(7pt * var(--preview-scale));
    line-height: calc(14pt * var(--preview-scale));
    margin-top: calc(-3pt * var(--preview-scale));
    display: inline-block;   /* 或 block / flex 子项 */
    white-space: nowrap;     /* 不换行 */
    overflow: hidden;        /* 超出隐藏 */
    text-overflow: ellipsis; /* 超出部分显示省略号 */
    small{
      font-size:  calc(7pt * var(--preview-scale));
      line-height: calc(14pt * var(--preview-scale));
    }
  }
}
.qrcode-label{
  flex-direction: row;
  img{
    width: unset;
    height: 80%;
  }
  .qr-info{
    width: 60%;
    p{
      font-size:  calc(7pt * var(--preview-scale));
      line-height: calc(10pt * var(--preview-scale));
      margin: 0;
    }
  }
}

</style>

