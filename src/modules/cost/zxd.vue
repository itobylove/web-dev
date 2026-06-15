<template>
  <div ref="box" :class="['mainPage','page-'+table.tableId]">
    <TableComponent v-if="table.isInit" ref="report" v-bind="getReportConfig()"/>
  </div>

</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import TableComponent from '@/core/component/table_v2.vue'

import * as api from "@/core/script/api.js"
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";
import * as core from "@/core/script/core.js";
import editPage from "@/modules/cost/quote_edit.vue";
import listPage from "@/modules/cost/quote_list.vue";



//页面数据
const vData=reactive({
  plant_id:siyi.user.plantId,
  date:core.date.list().month['上个月'],
})


const report = ref()



const table = reactive({
  isInit: false,
  tableId:'',
  menu: [],
  search: {},
  tableConfig:{userConfig: {}},
  param:{},
});

const tableEvent = {
  plantChange: async (value) => {
    vData.plant_id = value;
  },
  download: async () => {
    const loading = dialog.loading(report.value);
    const res = await api.post(api.url2.cost.zxd.download, {
      plant_id: vData.plant_id,
      date: vData.date,
    });
    loading.close();
    if (!res) return;
    await report.value.reportConfig.getData();
  },
  delete: async (rows) => {
    const id = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+id.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(undefined, '删除中...');
    const res = await api.post(api.url2.cost.zxd.delete, {id});
    loading && loading.close();
    if (res){
      dialog.success('删除成功');
      await report.value.reportConfig.getData();
    }
  },
  quote_add: async (rows) => {
    if (rows?.length && rows?.length!==1){
      dialog.error('请选择一条数据');
      return;
    }
    const row  = rows[0];
    const quote={
      quote_base:{
        plant_id_order:row?.plant_id || vData.plant_id,
        plant_id_make:row?.plant_id || vData.plant_id,
        product_code:row?.jobCode || '',
      }
    }
    const _window = dialog.window(editPage, {
      quote:quote,
      close: async () => _window.close(),
    }, {
      title: '精细化报价'+quote.quote_base.product_code,
      forceEnlarge: true,
      showFullscreen:false,
      onAfterClose: async () => {},
    });
  },
  quote_detail: async (rows) => {
    if (rows?.length!==1){
      dialog.error('请选择一条数据');
      return;
    }
    const product_code= rows[0]?.['jobCode'];
    const _window = dialog.window(listPage, {
      product_code,
      close: async () => _window.close(),
    }, {
      title: '报价记录'+product_code,
      height: '90%',
      width: '90%',
      onAfterClose: async () => {},
    });
  },
};


const getSearchForm = () => {
  return [
    {type: 'select', field: 'plant_id',style: {width: '100px'}, options: {multiple:false,placeholder: '工厂'},onChange:tableEvent.plantChange,value: vData.plant_id,load:'factory'},
    {type: 'select', field: 'quote_type', style: {width: '150px'}, options: {multiple: false, placeholder: '报价选择', options: [
        {value: 'new', label: '最新报价'}, {value: 'all', label: '全部报价'},{value: 'none', label: '未报价'}]},value:'new',},
    {type: 'rangeTime', field: 'date', value: vData.date, options: {placeholder: '时间'}, onChange: async (value) => vData.date=value},
    {type: 'input', field: 'customerCode', options: {placeholder: '客户代码'}, style: {width: '100px'}},
    {type: 'input', field: 'jobCode', options: {placeholder: '本厂型号'}, style: {width: '250px'}},
    {type: 'input', field: 'saleOrderSn', options: {placeholder: '销售订单号'}, style: {width: '250px'}},
  ]
}
const getMenus = () => {
  return {
    search: {sort: 10},
    quote_add: {title: '去报价', listAction: tableEvent.quote_add, icon: 'ri-add-line', sort: 60},
    quote_detail: {title: '查看报价', listAction: tableEvent.quote_detail, icon: 'ri-file-list-line', sort: 60},
    download: {title: '同步装箱单', click: tableEvent.download, icon: 'ri-download-line', sort: 70},
    del: {title: '删除装箱单', listAction: tableEvent.delete, icon: 'ri-delete-bin-2-line', sort: 80},
    moreSettings:{sort: 90,title:'表格设置'},
  };
}


const getReportConfig = () => {
  return {
    menuConfig: {
      menu:getMenus(),
      defaultMenuShowList:['search','moreSettings','pageExport','clearWhere'],
    },
    searchConfig: {
      search:getSearchForm(),
    },
    detailConfig:{colNum:3,colWidth:'250px'},
    tableConfig: {
      columnSplit:'#',
      autoLoad:false, // 自动加载
      url: api.url2.cost.zxd.list,
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      options: {
        select: {
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
      },
      colAfterCallback: (col) => {
        col.style = {
          bgColor: (args) => {
            const record = args.table.options.records[args.row-1];
           return record?.['bgColor'] || '#f3f4f7';
          },
          color: (args) => {
            const record = args.table.options.records[args.row-1];
            return record?.['color'] || '#000';
          },
        }
        return col;
      },
      ...table.tableConfig
    },
  }
};


onMounted(() => {
  table.isInit = true;
  dialog.info('加载完毕，请选择条件后点击查询！',1000);
});

</script>

<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
</style>
