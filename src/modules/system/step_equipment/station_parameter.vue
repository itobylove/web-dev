<template>
  <div ref="box" class="mainPage">
    <TableComponent v-if="vData.tableIsInit" ref="tableRef" v-bind="table"/>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref, shallowRef, watch} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import * as api from "@/core/script/api.js"
import {getPlant} from "@/utils/erp.js";
import parameterPage from "@/modules/system/parameter.vue";

const props = defineProps({
  station:{type:Object,default:null,required: false},
  tableConfig: {type: Object, default: {}},
  menuConfig: {type: Object, default: {}},
  query:{type:Object,default:{}}
});

//页面数据
const vData=reactive({
  tableIsInit: false,
  station_id:props.station?.id,
  station_name:props.station?.name,
  plant_id:siyi.user.plantId,
  selectOptions: {status:[],station_id:[],parameter_id:[]},
  ...props.query
})

const emit = defineEmits(['clickCell','afterLoaded'])

const tableRef = ref()
const table = shallowRef();

const tableEvent = {
  add: async () => {
    if (!vData.station_id) {
      console.log('vData',vData);
      return dialog.warning('请选择工段');
    }
    const existIds = tableRef.value.reportConfig.table.options.records.map(item => item.id).filter(item => item); // 已经存在的参数ID
    const options = vData.selectOptions.parameter_id.filter((item) => !existIds.includes(item.value) );
    const newIds = await dialog.selectAsync(options,'','可添加的参数('+getPlant(vData.plant_id)+' '+vData.station_name+')', {width:'800px',height:'200px'},{
      multiple: true,placeholder: '请输入名称过滤',clearable:true,minCollapsedNum:10,
    })
    if (!newIds)  return;
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.sys.station.parameter.add,{station_id:vData.station_id,parameter_ids:[...newIds,...existIds]});
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await tableRef.value.reportConfig.getData({where:{station_id:vData.station_id}});
    }
  },
  delete: async (rows) => {
    const sid = rows.map((row) => row.sid);
    const result = await dialog.confirmAsync('确定要删除'+sid.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.sys.station.parameter.del, {sid});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await tableRef.value.reportConfig.getData({where:{station_id:vData.station_id}});
    }
  },
  showList: async (args={}) => {
    args.query= {plant_id:vData.plant_id};
    dialog.window(parameterPage,args,{width: '80%',height: '80%',title:"参数管理"})
  }
};


// 页面初始化
const initTable = async () => {
  const apiData = vData.apiData = await api.get(api.url2.sys.station.parameter.config);
  vData.selectOptions = getOptionsLabel(apiData?.option);
  table.value={
    menuConfig: {
      menu:{
        add: {title: '添加', click: () => tableEvent.add(), icon: 'ri-add-line', sort: 40},
        del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-del-line', sort: 60},
        list: {title: '管理', click: ()=>tableEvent.showList(), icon: 'ri-list-check', sort: 70},
      },
      defaultMenuShowList:['moreSettings'],
      ...props.menuConfig
    },
    searchConfig:false,
    tableConfig: {
      url: api.url2.sys.station.parameter.list,
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
        heightMode:'autoHeight',
      },
      columns:listTableFn.createColumns(apiData.columns, apiData?.table?.columnSplit || '#'),
      ...apiData.table,
      events:{
        dblclick_cell: async ({originData,field}) => {
          if (!field) return ;
          await tableEvent.showList({where: {id: originData.id}})
        },
        click_cell: async ({originData,field}) => {
          if (!field) return ;
          emit('clickCell', {type: 'parameter', data: originData});
        }
      },
      ...props.tableConfig,
      afterLoaded:()=>{
        emit('afterLoaded',tableRef.value.reportConfig)
      },
    },
  }
  vData.tableIsInit = true;
}

onMounted(() => {
  initTable();
});

watch(() => [props.station], async () => {
  console.log('props.station',props.station);
  vData.station_id = props.station?.id;
  vData.station_name = props.station?.name;
  vData.plant_id =  props.station?.plant_id || props.query.plant_id;
  await tableRef.value.reportConfig.getData({where:{station_id:vData.station_id}});
});

watch(() => [props.query], async () => {
  for (const key in props.query) {
    vData[key] = props.query[key];
  }
});

</script>

<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}
</style>
