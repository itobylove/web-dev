<template>
  <div>
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import * as api from '@/core/script/api.js'
import apiUrl from '@/core/config/url.js'
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from '@/core/script/tableFn.js';
import {getOptionLabel} from '@/utils/vars.js';
import dialog from "@/core/script/dialog.js";


const fn = {
  exportecn: (rows) => {
    dialog.info('功能开发中');
  },
  setProcess: async (rows) => {
    const plantBind={1:'process_id1',6:'process_id6'};
    const plantId= rows[0]['plant_id'];
    const processIds=(rows[0]['processids'] || '').split(',').filter(item => item).map(item => parseInt(item)) || [];
    const ids= rows.map(item => item.id);
    const options= getOptionLabel(vData.option?.[plantBind?.[plantId]] || {});
    const processIdsNew= await dialog.selectAsync([], processIds, '请选择工艺(多选)', {width:500,select:{multiple: true,options}});
    if (typeof processIdsNew?.length !=='number') return ;
    const loading= dialog.loading(mainReport.value);
    const  res= await api.post(apiUrl.pe.ecnApprove.setProcess, {ids,processIds:processIdsNew});
    loading.close();
    if (!res) return;
    dialog.success('操作成功!');
    mainReport.value.reportConfig.getData();
  },
  pause: async (rows,isPause=true) => {
    const ids = rows.map(item => item.id);
    if (!ids.length || !await dialog.confirmAsync('确定要' + (isPause ? '暂停' : '恢复') + '审批吗？')) return;
    const remark = await dialog.inputAsync('', '请输入原因', {width: 500});
    if (!remark) return dialog.warning('操作取消',500);
    const loading = dialog.loading(mainReport.value);
    const res = await api.post(apiUrl.pe.ecnApprove.pause, {ids, remark, isPause: isPause ? 1 : 0});
    loading.close();
    if (!res) return;
    dialog.success('操作成功!');
    mainReport.value.reportConfig.getData();
  }
};

const vData={option:{process_id1:{}, process_id6:{}}};

const mainReport = ref()
const mainReportShow = ref(false)
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache', 'submitApprove', 'resetApprove','advancedExport'],
    menu: {
      exportecn: {sort: 650, title: '打印', icon: 'ri-file-excel-2-line', click:()=>fn.exportecn()},
      setProcess: {sort: 650, title: '设置工艺', icon: 'ri-list-settings-fill', listAction: fn.setProcess},
      pause: {sort: 650, title: '暂停审批', icon: 'ri-pause-line', listAction: (rows)=>fn.pause(rows)},
      resume: {sort: 650, title: '继续审批', icon: 'ri-play-line', listAction: (rows)=>fn.pause(rows,false)},
    },
  },
  searchConfig: {
    search: [
      {
        type: 'radio', field: 'wode', value: 1, options: {
          placeholder: '待我审批',
          options: [
            {label: '全部', value: 0},
            {label: '待我审批', value: 1}
          ]
        }
      },
      {type: 'select', field: 'factory', options: {placeholder: '生产工厂'}, load: 'factory'},
      {type: 'select', field: 'status', options: {placeholder: 'ECN审批状态', options: []}},
      {type: 'select', field: 'job_status', options: {placeholder: '型号状态', options: []}},
      {type: 'select', field: 'job_approval_status', options: {placeholder: '型号审批状态', options: []}},
      {type: 'select', field: 'is_paused', options: {placeholder: '是否暂停', options: [],multiple: false,style:'width:100px'}},
      {type: 'select', field: 'ecnType', options: {minCollapsedNum:2,style:'width:180px',placeholder: 'ECN类型', options: [{label: '外部', value: 'out'}, {label: '内部', value: 'in'}]}},
      {type: 'input', field: 'partnum', options: {placeholder: '生产型号'}, style: {width: '200px'}},
      {type: 'input', field: 'ecnNumber', options: {placeholder: 'ECN单号'}},
      // {type: 'input', field: 'search', options: {placeholder: '搜索：'}},
    ],
  },
  tableConfig: {
    url: apiUrl.pe.ecnApprove.mainList,
    showCheck: 'radio',
    disablePage: false
  }
}
onMounted(() => {
  //获取主表格配置
  api.get(apiUrl.pe.ecnApprove.mainConfig).then(res => {
    vData.option=res.option;
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = listTableFn.createColumns(res.columns);

    const searchIndex = mainReportConfig.searchConfig.search.findIndex(item => item.field === 'status');
    mainReportConfig.searchConfig.search[searchIndex].options.options = getOptionLabel(res.option?.lecnstatus || []);

    const searchIndex2 = mainReportConfig.searchConfig.search.findIndex(item => item.field === 'is_paused');
    mainReportConfig.searchConfig.search[searchIndex2].options.options = getOptionLabel(res.option?.is_paused || []);

    const searchIndex3 = mainReportConfig.searchConfig.search.findIndex(item => item.field === 'job_status');
    mainReportConfig.searchConfig.search[searchIndex3].options.options = getOptionLabel(res.option?.job_status || []);

    const searchIndex4 = mainReportConfig.searchConfig.search.findIndex(item => item.field === 'job_approval_status');
    mainReportConfig.searchConfig.search[searchIndex4].options.options = getOptionLabel(res.option?.job_approval_status || []);




    mainReportShow.value = true;
  })
})
</script>