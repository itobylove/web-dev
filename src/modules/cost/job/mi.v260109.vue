<template>
  <div ref="box" class="mainPage">
    <div class="leftPage">
      <TableComponent class="page_job_detail" v-if="vData.tableInit.job_detail" ref="jobDetailRef"  v-bind="jobDetail"/>
      <TableComponent class="page_job_params" v-if="vData.tableInit.job_params" ref="jobParamsRef"  v-bind="jobParams"/>
    </div>
    <div class="centerPage">
      <TableComponent class="page_routes" v-if="vData.tableInit.job_routes" ref="jobRoutesRef"   v-bind="jobRoutes"/>
    </div>
    <div class="rightPage">
      <TableComponent class="page_jmp_params" v-if="vData.tableInit.jmp_params" ref="jmpParamsRef"  v-bind="jmpParams"/>
      <TableComponent class="page_route_params" v-if="vData.tableInit.route_params" ref="routeParamsRef"  v-bind="routeParams"/>
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
    job_detail:false,
    job_params:false,
    job_routes:false,
    jmp_params:false,
    route_params:false
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
    const tableConfig = await api.get(api.url2.job.mi.job, {erp_id: vData.job.erp_id});
    jobDetail.tableConfig={...jobDetail.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns).concat(Array(20-tableConfig.columns.length).fill({field:'',title:'',showSort:false}))
    };
    vData.tableInit.job_detail=true;
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
    emptyRow:false,
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
    const tableConfig = await api.get(api.url2.job.mi.jobParams, {erp_id: vData.job.erp_id});
    jobParams.tableConfig={...jobParams.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.job_params=true;
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
    emptyRow:false,
    data:[],
    options: {
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
        const newJmpId = originData?.jmp_erp_id === vData.route?.jmp_erp_id ? null : originData.jmp_erp_id;
        const newRouteId = originData?.route_erp_id === vData.route?.route_erp_id ? null : originData.route_erp_id;
        vData.route = originData;
        newJmpId && await jmpParamsFn.getData();
        newRouteId && await routeParamsFn.getData();
      }
    }
  },
}
const jobRoutesFn = {
  getData:async () => {
    const tableConfig = await api.get(api.url2.job.mi.jobRoutes, {id: vData.job.id});
    jobRoutes.tableConfig={...jobRoutes.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.job_routes=true;
    jobRoutesRef.value && jobRoutesRef.value.reportConfig.getData();
    vData.route={};
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
    const tableConfig = await api.get(api.url2.job.mi.jmpParams, {jmp_erp_id: vData.route.jmp_erp_id});
    jmpParams.tableConfig={...jmpParams.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.jmp_params=true;
    jmpParamsRef.value && jmpParamsRef.value.reportConfig.getData();
  }
}


const routeParamsRef=ref();
const routeParams = {
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
      routeParamsRef.value.reportConfig.getData();
    },
    get: async () => {
      return routeParams.tableConfig.data;
    },
  },
}
const routeParamsFn = {
  getData:async () => {
    const tableConfig = await api.get(api.url2.job.mi.routeParams, {route_erp_id: vData.route.route_erp_id});
    routeParams.tableConfig={...routeParams.tableConfig,...tableConfig,
      columns:listTableFn.createColumns(tableConfig.columns)
    };
    vData.tableInit.route_params=true;
    routeParamsRef.value && routeParamsRef.value.reportConfig.getData();
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
