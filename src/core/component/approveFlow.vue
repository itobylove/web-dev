<template>
  <div class="content">
    <div class="header">
      <Menu v-bind="opts.menu" v-show="approval_id"/>
    </div>
    <div class="body">
      <t-tabs v-model="optsReactive.tab" v-bind="opts.tabs">
        <t-tab-panel value="detail" :destroyOnHide="false" label="审批数据">
          <div class="detail" :style="`grid-template-columns:${siyi.pc?'repeat(3,1fr)':'repeat(1,1fr)'}`">
            <dl v-for="item in optsReactive.detail">
              <dt :style="`width:${siyi.pc?'160px':'120px'}`">{{ item.title }}</dt>
              <dd>{{ item.value }}</dd>
            </dl>
          </div>
        </t-tab-panel>
        <t-tab-panel value="flow" :destroyOnHide="false" label="审批流程" :disabled="!optsReactive.flow">
          <TableComponent v-if="optsReactive.flow" ref="flow" v-bind="opts.flow"/>
        </t-tab-panel>
        <t-tab-panel value="logs" :destroyOnHide="false" label="操作记录" :disabled="!optsReactive.logs">
          <TableComponent v-if="optsReactive.logs" ref="logs" v-bind="opts.logs"/>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue'
import Menu from '@/core/component/menu.vue'
import siyi from '@/core/script/siyi.js'
import TableComponent from '@/core/component/table.vue'
import apiUrl from '@/core/config/url.js'
import * as api from '@/core/script/api.js'
import * as listTableFn from '@/core/script/tableFn.js'
import dialog from "@/core/script/dialog.js";

const props = defineProps({
  table: {type: Object},
  detail: {type: Array, default: []},
  close: {type: Function,default: () => {}}
})

const approval_id= props.detail?.[0]?.approval_id;

const operate = async (action = 'pass') => {
  const actionScope = {pass: "通过", reject: "拒绝", close: "重走审批", export: "导出"}
  if (!await dialog.confirmAsync('确定' + actionScope[action] + '吗？','审批确认')) return;
  let remark='';
  if (action === 'reject') {
    remark = await dialog.inputAsync('', '请输入拒绝原因');
    if (typeof remark !== 'string' || remark.length < 1) {
      return;
    }
  }
  if (['pass', 'reject','close'].includes(action)){
    const res= await api.post(apiUrl.system.approvalInstance.approval, {
      approval_id: optsReactive.detail[0].approval_id,
      action: action,
      remark,
    })
    if (!res) return;
    dialog.success('操作成功!');
    props.close()
  }
}


//工单管理
const flow = ref('')//审批流程表格
const logs = ref('')//审批日志表格
const optsReactive = reactive({
  tab: 'detail',//当前显示的标签卡
  detail: props.detail,//详情数据
  table: props.table,//详情数据
  flow: false,
  logs: false,
})
const opts = {
  // prevnext: (type = true) => {
  //   let index = optsReactive.detail[0].index
  //   type ? index += 1 : index -= 1
  //   for (const originData of props.table.reportOptions.options.records) {
  //     if (originData.index === index) {
  //       optsReactive.detail = tableFn.detail(props.table.reportOptions, originData)
  //       if (originData.wode < 1) config.prevnext(type)//与我不相关继续寻找下一条
  //       break
  //     }
  //   }
  // },
  menu: {
    defaultMenuShowList: [],
    menu: {
      ok: {sort: 110, title: '通过', icon: 'ri-check-line', click: () => operate('pass')},
      back: {sort: 120, title: '拒绝', icon: 'ri-close-line', click: () => operate('reject')},
      // close: {sort: 130, title: '终止审批', icon: 'ri-loop-right-line', click: () => operate('close')},
      // prevPage: {sort: 150, title: '上一条', icon: 'ri-skip-left-line', click: () => config.prevnext(false)},
      // nextPage: {sort: 160, title: '下一条', icon: 'ri-skip-right-line', click: () => config.prevnext()},
    },
  },
  tabs: {
    swipeable: false,//禁止滑动 移动端的配置项
    theme: 'card',
    onChange(value) {
      optsReactive.tab = value
      switch (value) {
        case 'flow':
          flow.value.reportOptions.getData()
          break
        case 'logs':
          logs.value.reportOptions.getData()
          break
      }
    }
  },
  flow: {
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {url: apiUrl.system.approvalInstance.flowList},
    vTableOptions: {dragHeaderMode: 'none', rowSeriesNumber: null},
    query:{approval_id: optsReactive.detail[0].approval_id},
    colAfterCallback: col => {
      col.showSort = false
      if (['step', 'name'].includes(col.field)) col.mergeCell = true
      return col
    },
    afterLoaded: (reportOptions) => {
      reportOptions.table.registerCustomCellStyle('bg-current', { bgColor: '#35a1fd'});
      const currentRows=reportOptions.table.options.records.filter(item=>item.step && item.step===item?.current_step); // 找到当前步骤行
      if (currentRows.length<1) return ;
      const rowIndex=[currentRows[0].index, currentRows[currentRows.length-1].index];
      reportOptions.table.arrangeCustomCellStyle({range: {start: {row: rowIndex[0], col: 0}, end: {row: rowIndex[1], col: 99999}}}, 'bg-current',true);
    },
  },
  logs: {
    query:{refer_id: optsReactive.detail[0].id,refer_name:optsReactive.table.id},
    menu: false, search: false, dblclickCell: false, header: false,
    tableConfig: {url: apiUrl.system.approvalInstance.logsList},
    vTableOptions: {dragHeaderMode: 'none'},
  },
}

onMounted(() => {
  if (!approval_id){
    dialog.error('未找到审批单(approval_id 为空)！',10000);
    props.close();
    return;
  }
  //获取审批流程表格配置
  api.get(apiUrl.system.approvalInstance.flowConfig).then(res => {
    opts.flow.tableConfig = {...opts.flow.tableConfig, ...res.table}
    opts.flow.tableConfig.columns = listTableFn.createColumns(res.columns)
    optsReactive.flow = true
  })
  //获取审批记录表格配置
  api.get(apiUrl.system.approvalInstance.logsConfig).then(res => {
    opts.logs.tableConfig = {...opts.logs.tableConfig, ...res.table}
    opts.logs.tableConfig.columns = listTableFn.createColumns(res.columns)
    optsReactive.logs = true
  })
})
</script>
<style scoped>
.content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .header {
    background-color: #f3f4f7;
    flex-shrink: 0;

    > .menu {
      border-bottom: 1px solid #e1e4e8;
    }
  }

  > .body {
    overflow: hidden;
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
      background-color: #f3f4f7;
    }

    > dd {
      flex: 1;
    }
  }
}
</style>