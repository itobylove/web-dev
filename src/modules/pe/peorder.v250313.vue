<template>
  <div class="box">
    <TableComponent class="solist" ref="solistReport" v-if="solistReportShow" v-bind="solistReportConfig"/>
    <TableComponent class="pelist" ref="pelistReport" v-if="pelistReportShow" v-bind="pelistReportConfig"/>
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
import {onMounted, reactive, ref} from 'vue';
import {ListEditor} from '@visactor/vtable-editors';
import {register} from '@visactor/vtable';
import apiUrl from '@/core/config/url.js';
import dialog from '@/core/script/dialog.js';
import TableComponent from '@/core/component/table_v2.vue';
import dialogComponent from '@/core/component/dialog.vue'
import * as api from '@/core/script/api.js';
import * as select from '@/core/config/select.js';
import * as tableFn from '@/core/script/tableFn.js';
import siyi from '@/core/script/siyi.js';

const fn = {
  //接收订单
  receive: rows => {
    api.post(
        apiUrl.pe.peorder.receive,
        rows.map(row => ({contractitem_id: row.contractitem_id, job_id: row.job_id}))
    ).then(res => {
      if (res) {
        solistReport.value.reportConfig.getData({}, false);
        pelistReport.value.reportConfig.getData({}, false);
      }
    });
  },
  //手动添加
  manualAdd: () => {
    dialog.select(
        [],
        '',
        jobid => api.post(apiUrl.pe.peorder.add, {jobid}).then(res => res && pelistReport.value.reportConfig.getData({}, false)),
        '请选择型号',
        {select: {style: {width: '250px'}, onSearch: (val, obj) => select.get({job: {keyword: val}}).then(res => obj.select.options = res.job)}}
    );
  },
  //开始制作
  startDesign: rows => {
    if (rows.length !== 1) return dialog.error('必须且只能选择一个订单进行操作');
    api.post(apiUrl.pe.peorder.start_design, {id: rows[0].id}).then(res => res && pelistReport.value.reportConfig.getData({}, false));
  },
  /**
   * 开始EQ与结束EQ
   * @param type
   */
  eqTime: type => {
    const rows = tableFn.getCheckedRecords(pelistReport.value.reportConfig);
    if (rows.length !== 1) return dialog.error('必须且只能选择一个订单进行操作');
    api.post(apiUrl.pe.peorder.eq_time, {id: rows[0].id, type}).then(res => res && pelistReport.value.reportConfig.getData({}, false));
  },
  /**
   * 锣带制作
   */
  rouDesign: rows => {
    if (rows.length !== 1) return dialog.error('必须且只能选择一个订单进行操作');
    api.post(apiUrl.pe.peorder.rou_design, {id: rows[0].id}).then(res => res && pelistReport.value.reportConfig.getData({}, false));
  },
  /**
   * 手动完成
   */
  manualOk: async () => {
    const rows = tableFn.getCheckedRecords(pelistReport.value.reportConfig);
    if (rows.length !== 1) return dialog.error('必须且只能选择一个订单进行操作');
    let opts = {okval: '可以', noval: '不可以', showClose: true};
    if (!/已取消|已删除/.test(rows[0].remark)) opts.okval = '';
    const confirm = await dialog.confirmAsync('下线后可重新接单？', '请确认', opts);
    api.post(apiUrl.pe.peorder.ok, {id: rows[0].id, receive: confirm}).then(res => {
      if (res) {
        solistReport.value.reportConfig.getData({}, false);
        pelistReport.value.reportConfig.getData({}, false);
      }
    });
  },
  /**
   * 退回市场
   */
  del: async () => {
    const rows = tableFn.getCheckedRecords(pelistReport.value.reportConfig);
    if (rows.length !== 1) return dialog.error('必须且只能选择一个订单进行操作');
    const confirm = await dialog.confirmAsync('确定要退回给市场吗？', '请确认');
    confirm && api.post(apiUrl.pe.peorder.del, {id: rows[0].id}).then(res => {
      if (res) {
        solistReport.value.reportConfig.getData({}, false);
        pelistReport.value.reportConfig.getData({}, false);
      }
    });
  }
}


const solistReport = ref();
const solistReportShow = ref(false);
const solistReportConfig = {
  menuConfig: {
    defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
    menu: {receive: {sort: 152, title: '接单', icon: 'ri-check-line', listAction: fn.receive}},
  },
  searchConfig: {
    search: [
      {type: 'select', field: 'factory', load: 'factory', options: {placeholder: '生产工厂'}},
      {type: 'input', field: 'partnum', options: {placeholder: '生产型号'}, style: {width: '200px'}},
      {type: 'input', field: 'sonumber', options: {placeholder: '销售订单号'}, style: {width: '200px'}},
    ],
  },
  tableConfig: {url: apiUrl.pe.peorder.so_list, showCheck: 'multiple', disablePage: true},
}


const pelistReport = ref();
const pelistReportShow = ref(false);
const pelistReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['submitApprove', 'resetApprove', 'approve', 'clearCache', 'advancedExport'],
    menu: {
      del: {sort: 151, title: '退回市场', icon: 'ri-arrow-go-back-line', click: () => fn.del()},
      add: {sort: 151, title: '手动添加', icon: 'ri-add-line', click: () => fn.manualAdd()},
      startDesign: {sort: 153, title: '开始制作', icon: 'ri-pencil-ruler-line', listAction: fn.startDesign},
      startEq: {sort: 154, title: '开始EQ', icon: 'ri-mail-check-line', click: () => fn.eqTime('start')},
      endEq: {sort: 155, title: '结束EQ', icon: 'ri-mail-forbid-line', click: () => fn.eqTime('end')},
      rou: {sort: 156, title: '锣带制作', icon: 'ri-layout-masonry-line', listAction: fn.rouDesign},
      ok: {sort: 157, title: '手动下线', icon: 'ri-donut-chart-fill', click: () => fn.manualOk()},
    },
  },
  searchConfig: {
    search: [
      {type: 'select', field: 'factory', load: 'factory', options: {placeholder: '生产工厂'}},
      {type: 'input', field: 'partnum', options: {placeholder: '生产型号'}, style: {width: '200px'}},
      {type: 'input', field: 'sonumber', options: {placeholder: '销售订单号'}, style: {width: '200px'}},
      {
        type: 'select', field: 'ordertype', options: {
          placeholder: '订单类型',
          options: [
            {label: '返单更改', value: 8},
            {label: '新单', value: 9},
            {label: '样转批', value: 10},
          ]
        },
      },
      {type: 'select', field: 'designuser', load: 'user_local', options: {placeholder: '制作人'}},
      {type: 'select', field: 'approve1user', load: 'user', options: {placeholder: '一审人'}},
      {type: 'select', field: 'approve2user', load: 'user', options: {placeholder: '二审人'}},
      {
        type: 'select', field: 'status', value: [0], options: {
          placeholder: '下线',
          options: [
            {label: '未下线', value: 0},
            {label: '正常下线', value: 1},
            {label: '下线可重接', value: 2},
            {label: '取消接单', value: 3},
          ]
        }
      },
    ],
  },
  tableConfig: {
    url: apiUrl.pe.peorder.main_list,
    showCheck: 'radio',
    disablePage: false,
    pageNum: 500,
    events: {
      change_cell_value: ({row, col, changedValue, currentValue}) => {
        col = col - (pelistReport.value.reportConfig.options.rowSeriesNumber ? 1 : 0);//处理起始列
        const columns = pelistReport.value.reportConfig.options.columns.filter(column => column.hide === false)[col];
        if (['plan_time', 'priority'].includes(columns.field) && changedValue !== currentValue) {
          const newRow = pelistReport.value.reportConfig.options.records[row - 1];
          newRow.index > 0 && api.post(apiUrl.pe.peorder[columns.field], newRow).then(res => {
            res && tableFn.updateRow(pelistReport.value.reportConfig, res);
          })
        }
      },
      dblclick_cell: ({originData}) => {//双击单元格
        if (originData?.index === undefined) return;//索引为undefined的行不处理
        management.detail = tableFn.detail(pelistReport.value.reportConfig, originData);
        management.show = true;
        api.get(apiUrl.pe.peorder.orderinfo, {contractitem_id: pelistReport.value.reportConfig.selectRow.contractitem_id}).then(res => {
          if (res) management.orderinfo = res;
        })
      }
    },
    colAfterCallback: (col) => {
      if (col.field === 'plan_time') {
        col.editor = 'dateEditor';
        col.style = () => {
          return {bgColor: 'rgb(238,255,241)'};
        }
      }
      if (col.field === 'priority') {
        col.editor = 'priorityOptions';
        col.style = () => {
          return {bgColor: 'rgb(238,255,241)'};
        }
      }
      if (col.field === 'partnum') {
        col.style = args => {
          const newRow = pelistReport.value.reportConfig.options.records[args.row - 1];
          if (newRow && newRow.datafrom === 'market' && newRow.remark) {
            return {bgColor: 'rgb(255,0,0)'};
          }
        }
      }
      return col;
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
    onChange: newValue => management.tab = newValue
  },
  detail: [],
  orderinfo: [],
})


//在首次挂载 以及每次从缓存中被重新插入的时候调用
// onActivated(() => core.scan(char => {
//   const [contractitem_id, job_id] = char.split(',');
//   fn.receive([{contractitem_id, job_id}]);
// }));


onMounted(() => {
  api.get(apiUrl.pe.peorder.so_config).then(res => {
    solistReportConfig.tableConfig = {...solistReportConfig.tableConfig, ...res.table};
    solistReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    solistReportShow.value = true;
  });
  api.get(apiUrl.pe.peorder.main_config).then(res => {
    register.editor('priorityOptions', new ListEditor({values: ['', '24H加急', '48H加急', '72H加急', '96H加急']}));
    pelistReportConfig.tableConfig = {...pelistReportConfig.tableConfig, ...res.table};
    pelistReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    pelistReportShow.value = true;
  });
})
</script>
<style scoped>
.box {
  display: flex;
  flex-direction: column;

  > .solist {
    height: 350px;
    flex-shrink: 0;
    padding-bottom: 0;
  }

  > .pelist {
    flex: 1;
    flex-shrink: 0;
  }
}

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