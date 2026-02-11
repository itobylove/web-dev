<template>
  <div ref="box" class="mainBox" >
    <div :id="`${path}#container`" class="anchor-demo anchor-container-demo">
      <t-anchor :id="`${path}#default`" container="#anchor-container" @click="handleClick">
        <t-anchor-item :href="`#${path}#content-1`" title="content-1" />
        <t-anchor-item :href="`#${path}#content-2`" title="content-2" />
        <t-anchor-item :href="`#${path}#content-3`" title="content-3" />
        <t-anchor-item :href="`#${path}#content-4`" title="content-4" />
      </t-anchor>
      <t-space id="anchor-container" direction="vertical" :size="0">
        <div :id="`${path}#content-1`" class="anchor-content-1">anchor-content-1</div>
        <div :id="`${path}#content-2`" class="anchor-content-2">anchor-content-2</div>
        <div :id="`${path}#content-3`" class="anchor-content-3">anchor-content-3</div>
        <div :id="`${path}#content-4`" class="anchor-content-4">anchor-content-4</div>
        <div :id="`${path}#content-5`" class="anchor-content-5">anchor-content-5</div>
      </t-space>
    </div>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref, watch} from "vue"
import TableComponent from '@/core/component/table_v2.vue'
import * as listTableFn from "@/core/script/tableFn.js";

import * as api from "@/core/script/api.js"
import {getOptionsLabel} from "@/utils/vars.js";
import siyi from "@/core/script/siyi.js";
import dialog from "@/core/script/dialog.js";

const props=defineProps({
  quote: {type: Object},
  selectOptions: {type: Object, default: {}},
})

//页面数据
const vData=reactive({
  isLargeScreen: false,
  selectOptions: {status: [],...props.selectOptions},
  plant_id:props.quote?.plant_id || siyi.user.plantId,
  tableInit:{
    processTable:false,
    assetTable:false,
    parameterTable:false,
    bomTable:false,
  },
  quote: props.quote,
  processList:[],
  bom_list:[],
  cost_items:[],
  bom_active_index:null,
  cost_active_index:null,
})


const productFrom=reactive({
  data: {
    id: vData.quote?.id,
    plant_id: vData.quote?.plant_id,
    customer_id: vData.quote?.customer_id,
    product_group_id: vData.quote?.product_group_id,
    product_name: vData.quote?.product_name,
    product_code: vData.quote?.product_code,
    cust_product_name: vData.quote?.cust_product_name,
    cust_product_code: vData.quote?.cust_product_code,
  },
  rules: {
    product_group_id:{
      required: true, message: '请输入客户', trigger: 'blur',}
  }
})


const processTableRef=ref();
const processTable = {
  menuConfig: {
    menu: {
      search: {sort: 10},
      // add: {title: '添加', click: () => processTableEvent.showEdit(), icon: 'ri-add-line', sort: 40},
      // moreSettings: {sort: 90, title: '表格设置'},
    },
    defaultMenuShowList: ['search', 'moreSettings'],
  },
  searchConfig:false,
/*  searchConfig: {
    search: [
      // {type: 'select', field: 'status', options: {options: vData.selectOptions.status,placeholder: '状态', style: {width: '160px'}}},
    ]
  },*/
  footer:false,
  tableConfig: {
    id:'quote_process_list',
    url: api.url2.cost.product_group.list,
    showCheck: true,
    useEncryptionFields: false,
    options: {
      select: {
        outsideClickDeselect: false,//点击外部区域是否取消选中。
      },
      heightMode: 'autoHeight',
    }
  },
}

const processTableEvent={
  init: async () => {
    vData.tableInit.processTable=true;
  },
  showEdit: () => {
  },
}


const assetTableRef=ref();
const parameterTableRef=ref();
const bomTableRef=ref();


// 页面初始化

onMounted(() => {

  vData.cost_items = [...Array(10)].map((_, i) => ({ id: i + 1 }));
  vData.bom_list = [...Array(8)].map((_, i) => ({ id: i + 1 }));


  processTableEvent.init();
  vData.tableInit.assetTable=true; //@todo
  vData.tableInit.parameterTable=true;//@todo
  vData.tableInit.bomTable=true;//@todo
});


</script>

<style scoped>

.ellipsis{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 2px;
  margin: 0 auto;
  text-align: center;

  .step-box,.preview-box{
    width: 200px;
    position: sticky;
    top: 0;
    height: 100%;
  }

  .step-box{
    background: #fff;
    width:100px;
    padding-top: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    .t-steps{
      max-height: 500px;
    }
  }
  .main-box{
    overflow-y: auto;
    margin: 0 5px;
    flex:1;
    .form-items{
      background: #fff;
    }
    scrollbar-width: none;
  }
  .main-box::-webkit-scrollbar {
    width: 1px;
  }

  .preview-box{
    width: 30%;
    background: #fff;

    .bom-list{
      .bom-item{
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      .collapse-header,.collapse-footer{
        line-height: 50px;
        padding: 0 15px;
      }
    }

    .quote-list{
      .quote-item{
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      .collapse-header,.collapse-footer{
        line-height: 50px;
        padding: 0 15px;
      }
    }



  }


}

</style>
