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
import * as select from "@/core/config/select.js";
import {getPlant, plantList} from "@/utils/erp.js";

const props = defineProps({
  process:{type:Object,default:null,required: false},
});

//页面数据
const vData=reactive({
  tableIsInit: false,
  process_id:null,
  process_name:null,
  plant_id:siyi.user.plantId,
  selectOptions: {status:[],process_id:[],step_id:[]},
})

const tableRef = ref()
const table = shallowRef();

const tableEvent = {
  add: async () => {
    if (!vData.process_id) {
      return dialog.warning('请选择工序');
    }
    const existIds = tableRef.value.reportConfig.table.options.records.map(item => item.id).filter(item => item); // 已经存在的工艺ID
    const options = vData.selectOptions.step_id.filter((item) => item.data.plant_id === vData.plant_id && !existIds.includes(item.value) );
    const step_ids = await dialog.selectAsync(options,'','可添加的工艺('+getPlant(vData.plant_id)+' '+vData.process_name+')', {width:'800px',height:'200px'},{
      multiple: true,placeholder: '请输入名称过滤',clearable:true,minCollapsedNum:10,
    })
    if (!step_ids)  return;
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.sys.process.step.add,{process_id:vData.process_id,step_ids:[...step_ids,...existIds]});
    loading && loading.close();
    if (res){
      dialog.success('保存成功');
      await tableRef.value.reportConfig.getData({where:{process_id:vData.process_id}});
    }
  },
  delete: async (rows) => {
    const sid = rows.map((row) => row.sid);
    const result = await dialog.confirmAsync('确定要删除'+sid.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.sys.process.step.del, {sid});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await tableRef.value.reportConfig.getData({where:{process_id:vData.process_id}});
    }
  },
};


// 页面初始化
const initTable = async () => {
  const apiData = vData.apiData = await api.get(api.url2.sys.process.step.config);
  vData.selectOptions = getOptionsLabel(apiData?.option);
  table.value={
    menuConfig: {
      menu:{
        search: {sort: 10},
        add: {title: '添加', click: () => tableEvent.add(), icon: 'ri-add-line', sort: 40},
        del: {title: '删除', listAction: tableEvent.delete, icon: 'ri-del-line', sort: 60},
      },
      defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    },
    searchConfig:false,
    tableConfig: {
      url: api.url2.sys.process.step.list,
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
    },
  }
  vData.tableIsInit = true;
}

onMounted(() => {
  initTable();
});

watch(() => [props.process], async () => {
  vData.process_id = props.process?.id;
  vData.process_name = props.process?.name;
  vData.plant_id =  props.process?.plant_id;
  tableRef.value.reportConfig.getData({where:{process_id:vData.process_id}});
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
