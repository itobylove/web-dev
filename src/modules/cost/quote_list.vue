<template>
  <div ref="boxRef" class="mainBox">
    <TableComponent ref="mainTable" v-if="vData.mainShow" v-bind="obj.mainConfig"/>
    <dialogComponent v-if="costListBox.isShow" v-bind="costListBox.bind"  v-on="costListBox.on"  >
      <TableComponent  v-if="costList.isShow" v-bind="costList.mainConfig"/>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import apiUrl from '@/core/config/url2';
import TableComponent from '@/core/component/table_v2.vue';
import dialogComponent from '@/core/component/dialog.vue'
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import editPage from "@/modules/cost/quote_edit.vue";
import {getOptionsLabel, isNumber} from "@/utils/vars.js";
import * as listTableFn from "@/core/script/tableFn.js";
import {download} from "@/utils/file.js";
import * as core from "@/core/script/core.js";


const props = defineProps({
  customer_name: {type: String, default: null}, // 客户名称
  product_code: {type: String, default: null}, // 型号
});

const boxRef = ref();
const mainTable = ref();

const vData = reactive({
  mainShow: false,
  selectOptions:{},
  optionMap:{},
  FORM_TITLE_MAP:{}, // 语言包
});
const dData = reactive({
  costFieldName: {
    item_type_text:'类型',name: '类别',  title: '名称',desc:'描述', unit: '单位', pcs_used: 'PCS耗量', order_used: '订单耗量',
    price: '单价', rmb: '货币', order_price: '订单成本#A', pcs_price: 'PCS成本#A', square_price: '平米成本#A',
  },
});

const costListBox=reactive({
  isShow:false,
  bind:{
    width: '80%',
    height: '80%',
    title: "成本明细"
  },
  on:{
    afterClose: () => {
      costListBox.isShow=false;
      costList.isShow=false;
    }
  },
  show:(rows) => {
    if (!rows?.length || rows.length!==1){
      dialog.error('请选择一条数据');
      return;
    }
    const row = rows?.[0];
    costList.mainConfig.query.id=row.id;
    costList.mainConfig.tableConfig.name = '成本明细_'+(row.product_code || row.cust_product_code)+'_'+row.pcs_num+'PCS';
    const columnFields=[];
    for (let key in dData.costFieldName) {
      columnFields.push(key+'#'+dData.costFieldName[key]);
    }
    costList.mainConfig.tableConfig.columns=listTableFn.createColumns(columnFields, '#');
    costListBox.isShow=true;
    costListBox.bind.title= costList.mainConfig.tableConfig.name;
    costList.isShow=true;
  },
  getMI: async (rows) => {
    const loading = await dialog.loading(mainTable.value, '获取MI中...');
    try {
      const lengthLimit = 5;
      const codeList = [...new Set(
          rows.filter(row => row.product_code).map(row => row.product_code)
      )];
      if (codeList.length > lengthLimit) {
        dialog.error('勾选的数据过多，请不要勾选超过' + lengthLimit + '条数据！');
        return;
      }
      await Promise.all(codeList.map(code => api.getErpPdf('mi', {code}, 'open'))
      );
    } finally {
      loading.close();
    }
  }
});
const costList = {
  isShow:false,
  mainConfig: {
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport'],
      menu: {},
    },
    searchConfig: {
      search: [],
    },
    detailConfig:{colNum:3,colWidth:'350px'},
    query:{id:''},
    tableConfig: {
      url: apiUrl.cost.quote.costList,
      showCheck: true,
      disablePage: false,
      useEncryptionFields: false,
      useUserTableConfig:false,
    },
  },
}

const tableEvent={
  edit: async (rows) => {
    if (rows?.length && rows.length!==1){
      dialog.error('请选择一条数据');
      return;
    }
    const _window = dialog.window(editPage, {
      quote_id: rows?.[0]?.id,
      optionMap:vData.optionMap,
      selectOptions:vData.selectOptions,
      FORM_TITLE_MAP:vData.FORM_TITLE_MAP,
      close: async () => _window.close(),
    }, {
      title: '精细化报价',
      forceEnlarge: true,
      showFullscreen:false,
      onAfterClose: async () => {},
    });
  },
  remake: async (rows) => {
    const ids = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要更新'+ids.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(mainTable.value, '更新中...');
    const res = await api.post(api.url2.cost.quote.remake, {ids});
    loading && loading.close();
    if (res){
      dialog.success('更新成功');
      await mainTable.value.reportConfig.getData();
    }
  },
  exportQuote: async (rows) => {
    const ids = rows.map((row) => row.id);
    const profit_rate = await dialog.inputAsync(0,'请输入利润率(%)');
    if (!isNumber(profit_rate)) return; // 不是数字，取消
    const loading = dialog.loading(mainTable.value, '导出中...');
    const res = await api.post(api.url2.cost.quote.exportQuote, {ids,profit_rate});
    loading && loading.close();
    if (res?.url){
      core.files.downloadFile(res.url,res.title || res.name);
      dialog.success('导出成功');
    }
  },
  exportParams: async (rows) => {
    const ids = rows.map((row) => row.id);
    const loading = dialog.loading(mainTable.value, '更新中...');
    const res = await api.post(api.url2.cost.quote.exportParams, {ids});
    loading && loading.close();
    if (res?.url){
      core.files.downloadFile(res.url,res.title || res.name);
      dialog.success('导出成功');
    }
  },
  delete: async (rows) => {
    const ids = rows.map((row) => row.id);
    const result = await dialog.confirmAsync('确定要删除'+ids.length+'条数据吗？');
    if (!result) return;
    const loading = dialog.loading(mainTable.value, '删除中...');
    const res = await api.post(api.url2.cost.quote.delete, {ids});
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
        create: {sort: 150, title: '新报价', icon: 'ri-add-line', click: tableEvent.edit,},
        edit: {sort: 155, title: '编辑', icon: 'ri-edit-line', listAction: tableEvent.edit,hide:!siyi.isDev},
        remake: {sort: 160, title: '重算', icon: 'ri-loop-right-line', listAction: tableEvent.remake,},
        exportQuote: {sort: 200, title: '导出报价', icon: 'ri-download-cloud-2-line', listAction: tableEvent.exportQuote,},
        exportParams: {sort: 250, title: '导出参数', icon: 'ri-download-cloud-2-line', listAction: tableEvent.exportParams,},
        costs: {sort: 280, title: '成本明细', icon: 'ri-list-view', listAction: costListBox.show,},
        mi: {sort: 290, title: '查看MI', icon: 'ri-printer-line', listAction: costListBox.getMI,},
        delete: {sort: 300, title: '删除', icon: 'ri-delete-bin-2-line', listAction: tableEvent.delete,},
      },
    },
    searchConfig: {
      search: [
      {
        type: 'select', field: 'plant_id_make', style: {width: '100px'}, value: siyi.user.plantId, load: 'factory',
        options: {multiple: false, clearable: true},
        onChange: val => mainTable.value.reportConfig.getData({where: {plant_id_make: val}}),
      },
        {type: 'select', field: 'quote_user', style: {width: '150px'}, options: {multiple: false, placeholder: '报价人类型', options: [
              {value: 'self', label: '我的报价'}, {value: 'all', label: '全部报价'}]},value:siyi.user.administrator?'all':'self',},
        {type: 'input', field: 'customer_name',value: props.customer_name, style: {width: '200px'}, options: {placeholder: '客户代码'}},
        {type: 'input', field: 'product_code',value: props.product_code, style: {width: '200px'}, options: {placeholder: '本厂型号'}},
        {type: 'input', field: 'cust_product_code', style: {width: '300px'}, options: {placeholder: '客户型号'}},
      ],
    },
    detailConfig:{colNum:3,colWidth:'260px'},
    tableConfig: {
      url: apiUrl.cost.quote.list, showCheck: true, disablePage: false,pageNum:50,
      afterLoaded: res => {

      },
    },
  },
}



onMounted(() => {
  api.get(apiUrl.cost.quote.config).then(res => {
    obj.mainConfig.tableConfig = {...obj.mainConfig.tableConfig, ...res.table};
    obj.mainConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    vData.optionMap = {...res?.option};
    vData.selectOptions = getOptionsLabel(res?.option);
    vData.FORM_TITLE_MAP = res.FORM_TITLE_MAP;
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
