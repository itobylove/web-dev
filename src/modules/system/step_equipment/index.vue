<template>
  <div class="box-page">
    <div  class="box-list">
      <div class="main-item box-step">
        <stepPage :query="{plant_id:vData.plant_id}"
                  @click-cell="({data})=>vData.step=data"
                  @after-loaded="(stepTable)=>{vData.step=null;vData.plant_id=stepTable.data?.[0]?.['plant_id'];}"
                  :tableConfig="{options:{rowSeriesNumber:false},showCheck:'radio'}"/>
      </div>
      <div class="main-item box-process">
        <processPage :step="vData.step" :query="{plant_id:vData.plant_id}"
                     @click-cell="({data})=>vData.process=data" @after-loaded="vData.process=null"
                     :tableConfig="{options:{rowSeriesNumber:false},showCheck:'radio'}"/>
      </div>
      <div class="main-item box-station">
        <StationPage  :process="vData.process" :query="{plant_id:vData.plant_id}"
                     @click-cell="({data})=>vData.station=data" @after-loaded="vData.station=null"
                     :tableConfig="{options:{rowSeriesNumber:false},showCheck:'radio'}"/>
      </div>
      <div class="main-item box-equipment-group">
        <EquipmentPage  :station="vData.station" :query="{plant_id:vData.plant_id,type:1,pid:null}"
                       @click-cell="({data})=>vData.equipment_group=data" @after-loaded="vData.equipment_group=null"
                       :tableConfig="{options:{rowSeriesNumber:false},showCheck:'radio'}"/>
      </div>
      <div class="main-item box-equipment">
        <EquipmentPage :station="vData.station" :query="{plant_id:vData.plant_id,type:0,pid:vData.equipment_group?.id}"
                        @click-cell="({data})=>vData.equipment=data" @after-loaded="vData.equipment=null"
                        :tableConfig="{options:{rowSeriesNumber:false},showCheck:'radio'}"/>
      </div>

    </div>
    <div class="box-detail">
      <div class="detail-item box-parameter" v-if="vData.station?.id && !vData.equipment?.id">
        <stationParameterPage  :station="vData.station" :tableConfig="{options:{rowSeriesNumber:false},showCheck:'radio'}"/>
      </div>
      <div class="main-item box-equipment-user" v-if="vData.equipment?.id">
        <EquipmentUserPage  :equipment="vData.equipment" :tableConfig="{options:{rowSeriesNumber:false},showCheck:'radio'}"/>
      </div>
    </div>
  </div>
</template>
<script setup>
import StepPage from "@/modules/system/step_equipment/step.vue";
import ProcessPage from "@/modules/system/step_equipment/step_process.vue";
import StationPage from "@/modules/system/step_equipment/process_station.vue";
import EquipmentPage from "@/modules/system/step_equipment/station_equipment.vue";
import stationParameterPage from "@/modules/system/step_equipment/station_parameter.vue";
import EquipmentUserPage from "@/modules/system/step_equipment/equipment_user.vue";
import {reactive} from "vue";
import siyi from "@/core/script/siyi.js";
const vData = reactive({
  plant_id:siyi.user.plantId,
  step:null,
  process:null,
  station:null,
  equipment_group:null,
  equipment:null,
  equipmentUser:null
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

    .main-item {
      width: 25%;
      :deep(.tableBox) {
        padding: 1px;
      }
    }


  }

  .box-detail {
    height: 200px;
    justify-content: center;
    align-items: center;
    display: flex;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 2px;

    .detail-item{
      width: 100%;
      height: 100%;
    }
  }
}
</style>