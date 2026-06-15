<template>
  <div ref="body" class="body scrollbar-hidden">
    <Noble_metal_chart type="gold" title="黄金9999 统计折线图" :min="950" :max="1100" sampling="min"  />

    <Noble_metal_chart type="gold_buy" title="金盐购买价 统计折线图" :min="715" sampling="min"  />

    <Noble_metal_chart type="copper" title="铜 磷铜球 统计折线图" :min="100" :max="115" sampling="min" />

    <Noble_metal_chart type="tin" title="锡 无铅锡条 统计折线图" :min="350" :max="480" sampling="min" />

  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import VChart from "@visactor/vchart";
import {presets} from "@/utils/tdesign.js";
import Noble_metal_chart from "@/modules/home/noble_metal_chart.vue";

onMounted(() => {

});
</script>


<style scoped>
.body {
  //display: flex;
  //flex-direction: column;
  //gap: 3px;
  overflow-y: auto !important;
  padding: 3px;

  .w300 {
    width: 300px;
  }
}
</style>