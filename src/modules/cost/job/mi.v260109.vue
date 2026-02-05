<template>
  <div ref="box" class="mainPage">
    <div class="leftPage">
      <TableComponent class="page_jobDetail" v-if="vData.tableInit.jobDetail" ref="jobDetailRef"  v-bind="jobDetail"/>
      <TableComponent class="page_jobParams" v-if="vData.tableInit.jobParams" ref="jobParamsRef"  v-bind="jobParams"/>
    </div>
    <div class="centerPage">
      <TableComponent class="page_jobRoutes" v-if="vData.tableInit.jobRoutes" ref="jobRoutesRef"   v-bind="jobRoutes"/>
    </div>
    <div class="rightPage">
<!--      <TableComponent class="page_jmpParams" v-if="vData.tableInit.jmpParams" ref="jmpParamsRef"  v-bind="jmpParams"/>-->
      <TableComponent class="page_erpRouteParams" v-if="vData.tableInit.erpRouteParams" ref="erpRouteParamsRef"  v-bind="erpRouteParams"/>
      <TableComponent class="page_routeParams" v-if="vData.tableInit.stationRouteParams" ref="stationRouteParamsRef"  v-bind="stationRouteParams"/>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";
import * as api from "@/core/script/api.js"

const props=defineProps({
  job: {type: Object,default: {erp_id:null}},
})

//页面数据
const vData = reactive({
  job: props.job,
  route:{jmp_erp_id:null,route_erp_id:null},
  tableInit: {
    jobDetail:false,
    jobParams:false,
    jobRoutes:false,
    jmpParams:false,
    erpRouteParams:false
  },
})

const jobDetail = {
  menuConfig: false,
  searchConfig: false,
  footer: false,
  vTableConfig:{records:[]},
  tableConfig: {
    url:'',
    showCheck: false,
    useEncryptionFields: false,
    useUserTableConfig:false,
    emptyRow:false,
    data:[],
    options: {
      defaultColWidth:160,
      defaultHeaderColWidth:160,
      transpose:true,
      rowSeriesNumber:false,
    },
    get: async () => {
      return jobDetail.tableConfig.data;
    },
    onLoaded: () => {
      jobDetailRef.value.reportConfig.getData();
    },
  },
}
const jobDetailRef=ref();
const jobDetailFn={
  getData: async () => {
    if (!vData.job?.erp_id) return ;
    const tableConfig = await api.get(api.url2.job.mi.job, {erp_id: vData.job.erp_id});
    jobDetail.tableConfig={...jobDetail.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns.concat(Array(50-tableConfig.columns.length)))
    };
    vData.tableInit.jobDetail=true;
    jobDetailRef.value && jobDetailRef.value.reportConfig.getData();
  }
}

const jobParamsRef=ref();
const jobParams = {
  menuConfig: false,
  searchConfig: false,
  footer: false,
  vTableConfig:{records:[]},
  tableConfig: {
    url:'',
    showCheck: false,
    useEncryptionFields: false,
    useUserTableConfig:false,
    data:[],
    options: {
      defaultColWidth:160,
      defaultHeaderColWidth:160,
      rowSeriesNumber:false,
    },
    onLoaded: () => {
      jobParamsRef.value.reportConfig.getData();
    },
    get: async () => {
      return jobParams.tableConfig.data;
    },
  },
}
const jobParamsFn = {
  getData:async () => {
    if (!vData.job?.erp_id) return ;
    const tableConfig = await api.get(api.url2.job.mi.jobParams, {erp_id: vData.job.erp_id});
    jobParams.tableConfig={...jobParams.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.jobParams=true;
    jobParamsRef.value && jobParamsRef.value.reportConfig.getData();
  }
}


const jobRoutesRef=ref();
const jobRoutes = {
  menuConfig: false,
  searchConfig: false,
  footer: false,
  vTableConfig:{records:[]},
  tableConfig: {
    url:'',
    showCheck: false,
    useEncryptionFields: false,
    useUserTableConfig:false,
    data:[],
    options: {
      select: {outsideClickDeselect: false,}, // 点击外部区域是否取消选中
      defaultColWidth:140,
      defaultHeaderColWidth:140,
      rowSeriesNumber:false,
    },
    onLoaded: () => {
      jobRoutesRef.value.reportConfig.getData();
    },
    get: async () => {
      return jobRoutes.tableConfig.data;
    },
    events: {
      click_cell: async ({originData,field}) => {
        if (!field) return ;
        // const newJmpId = originData?.jmp_erp_id === vData.route?.jmp_erp_id ? null : originData.jmp_erp_id;
        const newRouteId = originData?.route_erp_id === vData.route?.route_erp_id ? null : originData?.route_erp_id;
        const newStationRouteId = originData?.route_erp_id === vData.route?.station_route_id ? null : originData.station_route_id;
        vData.route = originData;
        // newJmpId && await jmpParamsFn.getData();
        newRouteId && await erpRouteParamsFn.getData();
        newStationRouteId && await stationRouteParamsFn.getData();
      }
    },
    afterLoaded:  (reportConfig) => {
      const firstRow = reportConfig.options.records[0];
      firstRow?.jmp_erp_id && reportConfig.table.selectRow(1);
      jobRoutes.tableConfig.events.click_cell({originData:firstRow,field:'jmp_erp_id'});
    },
  },
}
const jobRoutesFn = {
  getData:async () => {
    if (!vData.job?.id) return ;
    const tableConfig = await api.get(api.url2.job.mi.jobRoutes, {id: vData.job.id});
    jobRoutes.tableConfig={...jobRoutes.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.jobRoutes=true;
    jobRoutesRef.value && jobRoutesRef.value.reportConfig.getData();
    // vData.route={};
  }
}

const jmpParamsRef=ref();
const jmpParams = {
  menuConfig: false,
  searchConfig: false,
  footer: false,
  vTableConfig:{records:[]},
  tableConfig: {
    url:'',
    showCheck: false,
    useEncryptionFields: false,
    useUserTableConfig:false,
    emptyRow:false,
    data:[],
    options: {
      defaultColWidth:160,
      defaultHeaderColWidth:160,
      rowSeriesNumber:false,
    },
    onLoaded: () => {
      jmpParamsRef.value.reportConfig.getData();
    },
    get: async () => {
      return jmpParams.tableConfig.data;
    },
  },
}
const jmpParamsFn = {
  getData:async () => {
    if (!vData.route?.jmp_erp_id) return ;
    const tableConfig = await api.get(api.url2.job.mi.jmpParams, {jmp_erp_id: vData.route.jmp_erp_id});
    jmpParams.tableConfig={...jmpParams.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.jmpParams=true;
    jmpParamsRef.value && jmpParamsRef.value.reportConfig.getData();
  }
}


const erpRouteParamsRef=ref();
const erpRouteParams = {
  menuConfig: false,
  searchConfig: false,
  footer: false,
  vTableConfig:{records:[]},
  tableConfig: {
    url:'',
    showCheck: false,
    useEncryptionFields: false,
    useUserTableConfig:false,
    data:[],
    options: {
      defaultColWidth:160,
      defaultHeaderColWidth:160,
      rowSeriesNumber:false,
    },
    onLoaded: () => {
      erpRouteParamsRef.value.reportConfig.getData();
    },
    get: async () => {
      return erpRouteParams.tableConfig.data;
    },
  },
}
const erpRouteParamsFn = {
  getData:async () => {
    if (!vData.route?.route_erp_id) return ;
    const tableConfig = await api.get(api.url2.job.mi.erpRouteParams, {route_erp_id: vData.route.route_erp_id});
    erpRouteParams.tableConfig={...erpRouteParams.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.erpRouteParams=true;
    erpRouteParamsRef.value && erpRouteParamsRef.value.reportConfig.getData();
  }
}

const stationRouteParamsRef=ref();
const stationRouteParams = {
  menuConfig: false,
  searchConfig: false,
  footer: false,
  vTableConfig:{records:[]},
  tableConfig: {
    url:'',
    showCheck: false,
    useEncryptionFields: false,
    useUserTableConfig:false,
    data:[],
    options: {
      defaultColWidth:160,
      defaultHeaderColWidth:160,
      rowSeriesNumber:false,
    },
    onLoaded: () => {
      stationRouteParamsRef.value.reportConfig.getData();
    },
    get: async () => {
      return stationRouteParams.tableConfig.data;
    },
  },
}
const stationRouteParamsFn = {
  getData:async () => {
    const tableConfig = await api.get(api.url2.job.mi.stationRouteParams, {route_id: vData.route.station_route_id});
    stationRouteParams.tableConfig={...stationRouteParams.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.stationRouteParams=true;
    stationRouteParamsRef.value && stationRouteParamsRef.value.reportConfig.getData();
  }
}

onMounted(() => {
   jobDetailFn.getData();
   jobParamsFn.getData();
   jobRoutesFn.getData();
});

watch(() => [props.job], () => {
  vData.job = props.job;
  jobDetailFn.getData();
  jobParamsFn.getData();
  jobRoutesFn.getData();
})

</script>

<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  .leftPage,.rightPage{
    width: 30%;
    display: flex;
    flex-direction: column;
  }
  .centerPage{
    width: 40%;
    display: flex;
    flex-direction: column;
  }
  :deep(.tableBox) {
    padding: 1px;
  }
}
</style>
