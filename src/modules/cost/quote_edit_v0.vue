<template>
  <div ref="box" class="mainPage">
    <div class="product-form">
      <t-form label-width="calc(3em + 24px)" layout="inline" scroll-to-first-error="smooth">
        <t-form-item label="客户" name="name">
          <t-select v-model="productFrom.data.customer_id" :options="vData.selectOptions.customer_id"></t-select>
        </t-form-item>
        <t-form-item label="产品分组" name="name">
          <t-select v-model="productFrom.data.product_group_id" :options="vData.selectOptions.product_group_id"></t-select>
        </t-form-item>
        <t-form-item label="产品名称" name="name">
          <t-input v-model="productFrom.data.product_name"></t-input>
        </t-form-item>
        <t-form-item label="产品编码" name="code">
          <t-input v-model="productFrom.data.product_code"></t-input>
        </t-form-item>
        <t-form-item label="客户品名" name="name">
          <t-input v-model="productFrom.data.cust_product_name"></t-input>
        </t-form-item>
        <t-form-item label="客户型号" name="code">
          <t-input v-model="productFrom.data.cust_product_code"></t-input>
        </t-form-item>
      </t-form>
    </div>
    <div class="product-detail">
      <TableComponent class="product-detail-left" v-if="vData.tableInit.processTable" ref="processTableRef" v-bind="processTable"/>
      <div class="product-detail-middle">
        <TableComponent class="asset-table" v-if="vData.tableInit.assetTable" ref="assetTableRef" v-bind="processTable"/>
        <TableComponent class="parameter-table" v-if="vData.tableInit.parameterTable" ref="parameterTableRef" v-bind="processTable"/>
      </div>
      <div class="product-detail-right">
        <TableComponent class="bom-list" v-if="vData.tableInit.bomTable" ref="bomTableRef" v-bind="processTable"/>
        <div class="quote-box">
          <div class="quote-items">
            <t-list :split="true" size="small" class="quote-menu">
              <t-list-item>BOM</t-list-item>
              <t-list-item>工序固定</t-list-item>
              <t-list-item>...</t-list-item>
            </t-list>
            <div class="siyi-table header quote-list">
              <table>
                <tbody>
                <tr>
                  <td>类型</td>
                  <td>项目</td>
                  <td>单价</td>
                  <td>数量</td>
                  <td>金额</td>
                </tr>
                <tr v-for="item in vData.cost_items">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <t-card bordered class="quote-total" >
            <p>总价格：0.00</p>
          </t-card>
        </div>
      </div>
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
  processTableEvent.init();
  vData.tableInit.assetTable=true; //@todo
  vData.tableInit.parameterTable=true;//@todo
  vData.tableInit.bomTable=true;//@todo
});


</script>

<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  .product-form{
    padding: 20px;
  }
  .product-detail{
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    .product-detail-left{
      height: 100%;
      width: 20%;
    }
    .product-detail-middle{
      height: 100%;
      width: 20%;
      flex-direction: row;
      .asset-table{
        height: 40%;
      }
      .parameter-table{
        height: 60%;
      }
    }
    .product-detail-right{
      flex:1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .bom-list{
        height: 40%;
      }
      .quote-box{
        height: 60%;
        width: 100%;
        display: flex;
        flex-direction: column;
        .quote-items{
          width: 100%;
            flex: 1;
          display: flex;
          flex-direction: row;
        }
        .quote-list{
          flex:1;
        }
        .quote-total{
          width: 100%;
          height: 80px;
        }
      }
    }
  }
}
</style>
