<template>
  <div class="box-page">
    <div class="box-list">
      <div class="box-item box-step">
        <stepPage ref="stepView" v-if="vData.step_show" :query="{ plant_id: vData.plant_id }"
                  @click-cell="({ data }) => { vData.step = data; showData(data, 'step') }"
                  @after-loaded="(stepTable) => { vData.step = null; vData.plant_id = stepTable.data?.[0]?.['plant_id']; }"
                  :tableConfig="{ options: { rowSeriesNumber: false }, showCheck: 'radio' }"
                  :config="vData.step_config"/>
      </div>
      <div class="box-item box-process">
        <processPage ref="processView" v-if="vData.process_show" :step="vData.step"
                     :query="{ plant_id: vData.plant_id }"
                     @click-cell="({ data }) => { vData.process = data; showData(data, 'process') }"
                     @after-loaded="vData.process = null"
                     :tableConfig="{ options: { rowSeriesNumber: false }, showCheck: 'radio' }"
                     :config="vData.process_config"/>
      </div>
      <div class="box-item box-station">
        <StationPage ref="stationView" v-if="vData.station_show" :process="vData.process"
                     :query="{ plant_id: vData.plant_id }"
                     @click-cell="({ data }) => { vData.station = data; showData(data, 'station') }"
                     @after-loaded="vData.station = null"
                     :tableConfig="{ options: { rowSeriesNumber: false }, showCheck: 'radio' }"
                     :config="vData.station_config"/>
      </div>
      <div class="box-item box-equipment">
        <EquipmentPage ref="equipmentView" v-if="vData.equipment_show" :station="vData.station"
                       :query="{ plant_id: vData.plant_id,type:0}"
                       @click-cell="({ data }) => { vData.equipment = data; showData(data, 'equipment') }"
                       @after-loaded="vData.equipment = null"
                       :tableConfig="{ options: { rowSeriesNumber: false }, showCheck: 'radio' }"
                       :config="vData.equipment_config"/>
      </div>
    </div>
    <div class="box-detail">
      <div class="box-detail-item" v-if="vData.clickData.type !== ''">
        <SetTabs v-bind="vData.clickData" :step="vData.step_config" :process="vData.process_config"
                 :station="vData.station_config" :equipment="vData.equipment_config"/>
      </div>
    </div>
  </div>
</template>
<script setup>
import {reactive, onMounted} from "vue";
import StepPage from "@/modules/system/step_equipment/step.vue";
import ProcessPage from "@/modules/system/step_equipment/step_process.vue";
import StationPage from "@/modules/system/step_equipment/process_station.vue";
import EquipmentPage from "@/modules/system/step_equipment/station_equipment.vue";
import SetTabs from "@/modules/system/step_equipment/set_tabs.vue"
import siyi from "@/core/script/siyi.js";
import * as api from "@/core/script/api.js";
import apiUrl from "@/core/config/url2.js";

const vData = reactive({
  plant_id: siyi.user.plantId,
  step: null,
  process: null,
  station: null,
  equipment: null,

  step_config: null,
  process_config: null,
  station_config: null,
  equipment_config: null,

  step_show: false,
  process_show: false,
  station_show: false,
  equipment_show: false,

  equipmentUser: null,
  clickData: {type: '', data: {}},
});
const showData = (data, type) => {
  if (data === undefined) return;
  vData.clickData = {type, data};
}
onMounted(() => {
  api.get(apiUrl.sys.step.config).then(res => {
    vData.step_config = res;
    vData.step_show = true;
  });
  api.get(apiUrl.sys.step.process.config).then(res => {
    vData.process_config = res;
    vData.process_show = true;
  });
  api.get(apiUrl.sys.process.station.config).then(res => {
    vData.station_config = res;
    vData.station_show = true;
  });
  api.get(apiUrl.sys.station.equipment.config).then(res => {
    vData.equipment_config = res;
    vData.equipment_show = true;
  });
});
</script>
<style scoped>
.box-page {
  display: flex;
  flex-direction: column;

  .box-list {
    display: flex;
    flex-direction: row;
    flex: 1;

    .box-item {
      width: 25%;

      :deep(.tableBox) {
        padding: 1px;
      }
    }
  }

  .box-detail {
    height: 40vh;

    :deep(.tableBox) {
      padding: 1px;
    }

    .box-detail-item {
      height: 100%;
    }
  }
}
</style>