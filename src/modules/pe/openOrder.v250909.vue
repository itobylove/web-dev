<template>
  <div>
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="management.show" v-bind="management.dialogConfig">
      <t-tabs v-model="management.tab" v-bind="management.tabsConfig">
        <t-tab-panel value="detail" :destroyOnHide="false" label="基本数据">
          <div class="detail" :style="management.style">
            <dl v-for="item in management.detail">
              <dt :style="management.width">{{ item.title }}</dt>
              <dd>{{ item.value }}</dd>
            </dl>
          </div>
        </t-tab-panel>
        <t-tab-panel value="orderinfo" :destroyOnHide="false" label="委托加工单">
          <div class="detail" :style="management.style">
            <dl v-for="item in management.orderinfo">
              <dt :style="management.width">{{ item.title }}</dt>
              <dd>{{ item.value }}</dd>
            </dl>
          </div>
        </t-tab-panel>
      </t-tabs>
    </dialogComponent>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref} from 'vue';
import apiUrl from '@/core/config/url.js';
import TableComponent from '@/core/component/table_v2.vue';
import dialogComponent from '@/core/component/dialog.vue'
import * as api from '@/core/script/api.js';
import * as tableFn from '@/core/script/tableFn.js';
import siyi from '@/core/script/siyi.js';
import dialog from "@/core/script/dialog.js";


const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['submitApprove', 'resetApprove', 'approve', 'clearCache'],
    menu: {
      noPlan: {sort: 151, title: '不投产', icon: 'ri-close-circle-line', click: () => noplan()},
    },
  },
  searchConfig: {
    search: [
      {type: 'select', field: 'factory', load: 'factory', options: {placeholder: '生产工厂'}},
      {type: 'input', field: 'partnum', options: {placeholder: '生产型号'}, style: {width: '150px'}},
      {type: 'input', field: 'sonumber', options: {placeholder: '销售订单号'}, style: {width: '150px'}},
      {type: 'input', field: 'custcode', options: {placeholder: '客户代码'}, style: {width: '100px'}},
      {
        type: 'select', field: 'ordertype', options: {
          placeholder: '订单类型', options: [
            {label: '新单', value: '新单'},
            {label: '加急新单', value: '加急新单'},
            {label: '样转批', value: '样转批'},
            {label: '返单更改', value: '返单更改'},
            {label: '24H加急新单', value: '24H加急新单'},
            {label: '48H加急新单', value: '48H加急新单'},
            {label: '72H加急新单', value: '72H加急新单'},
            {label: '96H加急新单', value: '96H加急新单'},
          ]
        },
      },
    ],
  },
  tableConfig: {
    url: apiUrl.pe.openOrder.main_list,
    disablePage: false,
    showCheck: true,
    events: {
      dblclick_cell: ({originData}) => {//双击单元格
        if (originData?.index === undefined) return;//索引为undefined的行不处理
        management.detail = tableFn.detail(mainReport.value.reportConfig, originData);
        management.show = true;
        api.get(apiUrl.pe.openOrder.orderinfo, {contractitem_id: mainReport.value.reportConfig.selectRow.contractitem_id}).then(res => {
          if (res) management.orderinfo = res;
        })
      }
    },
  },
}

const management = reactive({
  show: false,
  dialogConfig: {
    title: '订单数据', type: 'window', width: '80%', height: '90%', top: 'center',
    onAfterClose: () => management.show = false, onBeforeOpen: () => management.tab = 'detail'
  },
  tab: 'detail',
  width: `width:${siyi.pc ? '160px' : '120px'}`,
  style: `grid-template-columns:${siyi.pc ? 'repeat(3,1fr)' : 'repeat(1,1fr)'}`,
  tabsConfig: {
    theme: 'card',
    swipeable: false,//禁止滑动 移动端的配置项
    defaultValue: 'detail',
    onChange(newValue) {
      management.tab = newValue;
    }
  },
  detail: [],
  orderinfo: [],
})

const noplan=()=>{
  const rows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
  if (rows <=0) return dialog.error('必须选择订单进行操作');
  dialog.confirm('确定要设置不投产吗？', async () => {
    const loading = dialog.loading(mainReport.value.$el, '操作中，请稍等！');
    api.post(apiUrl.pe.openOrder.noplan, {contractitem_ids: rows.map(item => item.contractitem_id), sonumbers: rows.map(item => item.sonumber), partnums: rows.map(item => item.partnum)}).then(
        res => {
          if(res) {dialog.success(res);}
          loading.close();
          mainReport.value.reportConfig.getData({}, false);
        });
  });
}

onMounted(() => {
  api.get(apiUrl.pe.openOrder.main_config).then(res => {
    mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
    mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    mainReportShow.value = true;
  })
})
</script>
<style scoped>
.detail {
  display: grid;

  > dl {
    font-size: 16px;
    display: flex;

    > dt, > dd {
      flex-shrink: 0;
      line-height: 20px;
      word-wrap: break-word;
      border-bottom: 1px solid #c9d0da;
      border-right: 1px solid #c9d0da;
      display: flex;
      align-items: center;
      padding: 10px 5px;
    }

    > dt {
      min-width: 120px;
      background-color: #f3f4f7;
    }

    > dd {
      flex: 1;
    }
  }
}
</style>