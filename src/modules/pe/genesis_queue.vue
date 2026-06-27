<template>
  <div ref="boxRef" class="mainBox">
    <TableComponent ref="mainTable" v-if="vData.mainShow" v-bind="obj.mainConfig"/>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import apiUrl from '@/core/config/url2';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import {getOptionLabel} from "@/utils/vars.js";
import ApiRequest from "@/event/ApiRequest.js";


const props = defineProps({
  part_num: {type: String, default: null}, // 型号
});

const boxRef = ref();
const mainTable = ref();

const vData = reactive({
  mainShow: false,
  select_options:{status:[]},
});

const tableEvent={
  add: async () => {
    const part_num = await dialog.inputAsync('','请输入型号',{ width: '300px' });
    if (!part_num) return;
    const res = await api.post(apiUrl.pe.GenesisQueue.add, {part_num});
    if (res){
      dialog.success('删除成功');
      await mainTable.value.reportConfig.getData();
    }
  },
  action: async (rows,action) => {
    const action_text={'top':'置顶','bottom':'置底','restart':'重试'};
    const ids = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要'+action_text[action]+' '+ids.length+' 条数据吗？');
    if (!result) return;
    const loading = dialog.loading(mainTable.value, '处理中...');
    const res = await api.post(apiUrl.pe.GenesisQueue.set, {ids,action});
    loading && loading.close();
    if (res){
      dialog.success('处理成功');
      await mainTable.value.reportConfig.getData();
    }
   },
  import: async (type) => {
    const num = await dialog.inputAsync(500,'请输入导入数量',{ width: '300px' });
    if (!num) return;
    const loading = dialog.loading(mainTable.value, '导入中...');
    const res = await api.post(apiUrl.pe.GenesisQueue.import, {num,type});
    loading && loading.close();
    if (res){
      dialog.success(`导入成功${res}个!`);
      await mainTable.value.reportConfig.getData();
    }
  },
  delete: async (rows) => {
    const ids = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+ids.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(mainTable.value, '删除中...');
    const res = await api.post(apiUrl.pe.GenesisQueue.delete, {ids});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await mainTable.value.reportConfig.getData();
    }
  },
}

const obj = {
  mainConfig: {
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings','prevPage','nextPage'],
      menu: {
        top: {sort: 130, title: '置顶', icon: 'ri-skip-up-line', listAction: (rows)=>tableEvent.action(rows,'top')},
        bottom: {sort: 140, title: '置底', icon: 'ri-skip-down-line', listAction: (rows)=>tableEvent.action(rows,'bottom')},
        restart: {sort: 150, title: '重试', icon: 'ri-refresh-line', listAction: (rows)=>tableEvent.action(rows,'restart')},
        add: {sort: 155, title: '手动添加', icon: 'ri-add-line', click: tableEvent.add},
        import: {sort: 160, title: '导入销售订单', icon: 'ri-import-line', click: ()=>tableEvent.import(1)},
        import2: {sort: 160, title: '导入投产订单', icon: 'ri-import-line', click:()=>tableEvent.import(2)},
        showMi: {title: '查看MI', sort: 180, icon: 'ri-file-pdf-2-line', listAction: (list, reportTable) => ApiRequest.showMi(list, reportTable, 'job_id')},
        delete: {sort: 300, title: '删除', icon: 'ri-delete-bin-2-line', listAction: tableEvent.delete,},
      },
    },
    searchConfig: {
      search: [
      {type: 'select', field: 'plant_id', style: {width: '120px'}, value: siyi.user.plantId, load: 'factory',
        options: {multiple: false, clearable: false,filterable: false},
      },
      {type: 'radio', field: 'status', options: {multiple:false,placeholder: '状态', options: vData.select_options.status}},
      {type: 'input', field: 'part_num',value: props.part_num, style: {width: '300px'}, options: {placeholder: '型号'}},
      ],
    },
    detailConfig:{colNum:3,colWidth:'100px'},
    tableConfig: {
      url: apiUrl.pe.GenesisQueue.list, showCheck: true, disablePage: false,pageNum:1000,
      get: async (url,query) =>  {
        const {list,count}= await api.get(url, query);
        const status_options=[{label: '全部('+(count['all'] || 0)+')', value: ''}];
        vData.select_options.status.forEach((title,key) => {
          status_options.push({label: title+'('+(count?.[key] || 0)+')', value: key})
        })
        mainTable.value.search.updateSearchItem('status',{options:status_options});
        return list;
      },
    },
  },
}



onMounted(() => {
  api.get(apiUrl.pe.GenesisQueue.init).then(res => {
    obj.mainConfig.tableConfig = {...obj.mainConfig.tableConfig, ...res.table};
    obj.mainConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    vData.select_options = res.option;
    const status_index = obj.mainConfig.searchConfig.search.findIndex(item => item.field === 'status');
    obj.mainConfig.searchConfig.search[status_index].options.options = getOptionLabel(vData.select_options.status);
    vData.mainShow = true;
  });
});




</script>

<style scoped>
.mainBox{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
</style>
