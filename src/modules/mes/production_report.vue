<template>
  <div class="box" ref="box">
    <div class="tabs">
      <dl :class="['tab',tab]">
        <dt class="report" @click="tabSwitch('report')">生产报表</dt>
        <dt class="reportDetails" @click="tabSwitch('reportDetails')">生产记录</dt>
        <!--
        <dt class="scrapDetails" @click="tabSwitch('scrapDetails')">报废明细</dt>
        <dt class="outputDetails" @click="tabSwitch('outputDetails')">产出明细</dt>
        <dt class="circulation" @click="tabSwitch('circulation')">生产过数</dt>
        <dt class="inspection" @click="tabSwitch('inspection')">设备点检</dt>
        <dt class="maintenance" @click="tabSwitch('maintenance')">设备保养</dt>
        -->
        <dt v-if="siyi.user.administrator" class="templateConfig" @click="tabSwitch('templateConfig')">模板配置</dt>
      </dl>
      <dl class="menu" v-if="tab==='report'">
        <!--        <dd :class="[{'active':reportData.status}]" @click="fa">首检</dd>-->
        <!--        <dd :class="[{'active':reportData.status}]" @click="ipqc">抽检</dd>-->
        <dd :class="[{'active':reportData.status}]" @click="del">重扫</dd>
        <dd :class="[{'active':reportData.status}]" @click="save">下机</dd>
      </dl>
    </div>
    <div class="body">
      <div class="report" v-if="tab==='report'">
        <div class="main header">
          <table>
            <thead>
            <tr>
              <th>操作员</th>
              <th>设备</th>
              <th>工序</th>
              <th>工艺</th>
              <th>状态</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{{ reportData.employee_name }}</td>
              <td>{{ reportData.equipment_name }}</td>
              <td>{{ reportData.step_name }}</td>
              <td>{{ reportData.process_name }}({{ reportData.station_name }})</td>
              <td>{{ reportData.status ? '等待下机' : '等待上机' }}</td>
            </tr>
            </tbody>
            <thead>
            <tr>
              <th>追溯码</th>
              <th>生产部件</th>
              <th>工单结存</th>
              <th>已生产数量</th>
              <th>当前生产数量</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{{ reportData.wonumber }}</td>
              <td>{{ reportData.partnum }} {{ reportData.partrev }}<br>{{ reportData.mfgpartcode }}</td>
              <td>{{ reportData.qty_pnl_backlog }} PNL<br>{{ reportData.qty_set_backlog }} SET<br>{{ reportData.qty_pcs_backlog }} PCS</td>
              <td>{{ reportData.qty_pnl_complete }} PNL<br>{{ reportData.qty_set_complete }} SET<br>{{ reportData.qty_pcs_complete }} PCS</td>
              <td>{{ reportData.qty_pnl }} PNL<br>{{ reportData.qty_set }} SET<br>{{ reportData.qty_pcs }} PCS</td>
            </tr>
            </tbody>
            <thead>
            <tr>
              <th>备注</th>
              <th colspan="4">
                <t-input size="large" v-model="reportData.remark" :disabled="!reportData.status"/>
              </th>
            </tr>
            </thead>
          </table>
        </div>
        <div class="detail header">
          <table>
            <thead>
            <tr>
              <th class="sort">序号</th>
              <th class="name">参数</th>
              <th class="value">数据</th>
              <th class="where">要求</th>
              <th class="qctype">类型</th>
              <th class="unit">单位</th>
            </tr>
            </thead>
          </table>
        </div>
        <div class="detail body">
          <table>
            <tbody>
            <tr v-for="(item,sort) in reportData.parameters">
              <td class="sort">{{ sort + 1 }}</td>
              <td class="name">{{ item.name }}</td>
              <td class="value">
                <t-input-number class="number" v-if="item.input_type==='number'" v-model="item.value" v-bind="item.options" :disabled="!reportData.status"/>
                <t-input class="string" v-else-if="item.input_type==='string'" v-model="item.value" v-bind="item.options" :disabled="!reportData.status"/>
                <t-radio-group class="radio" v-else-if="item.input_type==='radio'" v-model="item.value" v-bind="item.options" :disabled="!reportData.status"/>
                <t-select class="select" v-else-if="item.input_type==='select'" v-model="item.value" v-bind="item.options" :disabled="!reportData.status"/>
                <t-switch class="switch" v-else-if="item.input_type==='switch'" v-model="item.value" v-bind="item.options" :disabled="!reportData.status"/>
                <t-time-picker class="time" v-else-if="item.input_type==='time'" v-model="item.value" v-bind="item.options" :disabled="!reportData.status"/>
              </td>
              <td class="where">{{ item.where }}</td>
              <td class="qctype">{{ item.qc_type_text }}</td>
              <td class="unit">{{ item.unit }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="reportDetails" v-else-if="tab==='reportDetails'">
        <report_history :where="{step_id:reportData.step_id,process_id:reportData.process_id}"></report_history>
      </div>
      <div class="scrapDetails" v-else-if="tab==='scrapDetails'">报废明细开发中</div>
      <div class="outputDetails" v-else-if="tab==='outputDetails'">产出明细开发中</div>
      <div class="circulation" v-else-if="tab==='circulation'">生产过数开发中</div>
      <div class="inspection" v-else-if="tab==='inspection'">设备点检开发中</div>
      <div class="maintenance" v-else-if="tab==='maintenance'">设备保养开发中</div>
      <div class="templateConfig" v-else-if="tab==='templateConfig'">
        <report_template :where="{step_id:reportData.step_id,process_id:reportData.process_id}"></report_template>
      </div>
    </div>
    <dialogComponent v-if="templateBox.show" v-bind="templateBox.config">
      <div class="templateBox">
        <dl v-for="item in tplList" @click="selectTpl(item)">
          <dt class="title">{{ item.equipment_name }}</dt>
          <dd class="body">{{ item.template_name }}</dd>
          <dd class="footer">{{ item.step_name }}/{{ item.process_name }}/{{ item.station_name }}</dd>
        </dl>
      </div>
    </dialogComponent>
    <dialogComponent v-if="qtyBox.show" v-bind="qtyBox.config">
      <div class="quantityBox">
        <t-alert v-if="reportData.warning_message" theme="warning" :message="reportData.warning_message"/>
        <t-radio-group variant="primary-filled" v-model="reportData.sc_type">
          <t-radio-button value="normal">正常生产</t-radio-button>
          <t-radio-button value="rework">返工生产</t-radio-button>
        </t-radio-group>
        <t-input-number v-model="reportData.qty_pnl" label="PNL" theme="column" @change="changeQuantity('pnl')"/>
        <t-input-number v-model="reportData.qty_set" label="SET" theme="column" @change="changeQuantity('set')"/>
        <t-input-number v-model="reportData.qty_pcs" label="PCS" theme="column" @change="changeQuantity('pcs')"/>
      </div>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onActivated, onMounted, reactive, ref} from 'vue';
import * as api from '@/core/script/api';
import siyi from '@/core/script/siyi';
import dialog from '@/core/script/dialog';
import * as core from "@/core/script/core";
import apiUrl from '@/core/config/url2';
import dialogComponent from '@/core/component/dialog.vue';
import Report_history from '@/modules/mes/report_history.vue';
import Report_template from '@/modules/mes/report_template.vue';


const box = ref();//工作区
const tab = ref('report');//选项卡
const tplList = ref([]);//机台模板列表
//默认配置
const tdOptions = {
  number: {
    allowInputOverLimit: false,//是否允许超出范围
    theme: 'column',
    size: 'large',
  },
  string: {
    size: 'large',
  },
  select: {
    filterable: true,//过滤
    multiple: true,//多选
    minCollapsedNum: 1,//显示数量
    size: 'large',
  },
  switch: {
    label: ['是', '否'],
    customValue: ['是', '否'],
    size: 'large',
  },
  radio: {
    size: 'large',
  },
}
//初始配置
const defaultConfig = {
  id: 0,//主表ID
  employee_id: 0,//人员ID
  employee_name: '',// 人员
  equipment_name: '',// 设备名称
  step_name: '',//工序名称
  process_name: '',//流程名称
  station_name: '',//工段名称
  status: false,//当前状态
  wonumber: '',//追溯码
  mfgpartcode: '',//生产部件
  //参数列表
  parameters: [],
  sc_type: 'normal',//正常生产，2返工生产
}
// 数据
const reportData = ref({...defaultConfig});


//选择模板窗口配置
const templateBox = reactive({show: false, config: {minHeight: 50, changeSize: false, showHeader: false, esc: false, forceEnlarge: false}})
//上机数量窗口配置
const qtyBox = reactive({
  show: false,
  config: {
    title: '请输入上机数量', okval: '上机', noval: '取消', showFooter: true, esc: false, forceEnlarge: false, showClose: false, changeSize: false,
    okCallback: async obj => {
      tolerance();
      obj.close = await create();
    },
    onNo: () => {
      qtyBox.show = false;
    }
  }
});

//选项卡切换
const tabSwitch = async name => {
  tab.value = name;
}

//选择模板
const selectTpl = item => {
  Object.assign(defaultConfig, item);//模板数据
  Object.assign(reportData.value, defaultConfig);//数据
  templateBox.show = false;
}


//输入上机数量联动效果
const changeQuantity = type => {
  if (type === 'pnl') {
    reportData.value.qty_set = reportData.value.qty_pnl * reportData.value.setofpnl;
    reportData.value.qty_pcs = reportData.value.qty_pnl * reportData.value.pcsofpnl;
  } else if (type === 'set') {
    reportData.value.qty_pcs = reportData.value.qty_set * reportData.value.pcsofset;
  } else if (type === 'pcs' && reportData.value.pcsofset === 1) {
    reportData.value.qty_set = reportData.value.qty_pcs;
  }
}


//上机
const create = async () => {
  const id = await api.post(apiUrl.mes.report_data.create, {
    qty_pnl: reportData.value.qty_pnl,
    qty_set: reportData.value.qty_set,
    qty_pcs: reportData.value.qty_pcs,
    erp_woid: reportData.value.erp_woid,
    step_id: reportData.value.step_id,
    process_id: reportData.value.process_id,
    station_id: reportData.value.station_id,
    equipment_id: reportData.value.equipment_id,
    template_id: reportData.value.template_id,
    employee_id: reportData.value.employee_id,
    sc_type: reportData.value.sc_type,
  });
  if (id > 0) {
    reportData.value.id = id;
    reportData.value.status = true;
    qtyBox.show = false;
    return true;
  } else {
    return false;
  }
}


//下机
const save = async () => {
  if (!reportData.value.status) return;
  // 检查参数数据
  for (const item of reportData.value.parameters) {
    if (/number|string/.test(item.input_type) && (item.value === null || item.value === '')) {
      return dialog.error('参数值未填写，不能下机');
    }
  }
  const loading = dialog.loading(box.value, '正在下机', {onAfterClose: () => dialog.success('下机成功')});
  const status = await api.post(apiUrl.mes.report_data.save, {
    id: reportData.value.id,
    remark: reportData.value.remark,
    parameters: reportData.value.parameters,
  });
  if (status === true) {
    reportData.value = {...defaultConfig};
    loading.close();
  }
}

//重扫
const del = async () => {
  if (!reportData.value.status) return;
  const loading = dialog.loading(box.value, '正在删除', {onAfterClose: () => dialog.success('删除完成')});
  if (await api.get(apiUrl.mes.report_data.del, {id: reportData.value.id}) === true) {
    reportData.value = {...defaultConfig};
    loading.close();
  }
}


//首检
const fa = () => {
  dialog.warning('功能开发中');
}


//抽检
const ipqc = () => {
  dialog.warning('功能开发中');
}


//处理公差
const tolerance = () => {
  reportData.value.parameters.forEach(item => {
    item.options = {...tdOptions[item.input_type], ...item.options};//合并配置项
    if (item.qc_type === 'DL') {//定量
      let uptolerance = '', downtolerance = '', max = 0, min = 0;
      //上公差
      if (item.uptolerance > 0) {
        uptolerance = item.uptolerance + item.uptoleranceunit;
        if (item.uptoleranceunit === '%') {
          max = Number(item.standard) + (Number(item.standard) * (item.uptolerance / 100));
        } else {
          max = Number(item.standard) + item.uptolerance;
        }
      }
      //下公差
      if (item.downtolerance > 0) {
        downtolerance = item.downtolerance + item.downtoleranceunit;
        if (item.downtoleranceunit === '%') {
          min = Number(item.standard) - (Number(item.standard) * (item.downtolerance / 100));
        } else {
          min = Number(item.standard) - item.downtolerance;
        }
      }
      if (uptolerance && !downtolerance) {
        // 只有上公差，使用 <=
        item.where = `≤${uptolerance}`;
      } else if (!uptolerance && downtolerance) {
        // 只有下公差，使用 >=
        item.where = `≥${downtolerance}`;
      } else if (uptolerance && downtolerance) {
        item.where = `+${uptolerance}/-${downtolerance}`;
      }
      if (item.where === '' && max && min) {
        item.where = max + '/' + min;
      }
      item.options.min = parseFloat(min);
      item.options.max = parseFloat(max);
    }
    if (item.input_type === 'time' && !item.value) {
      // 为时间类型设置默认值（如果当前值为空）
      item.value = core.date.time(); // 当前时间
    }
    if (item.input_type === 'number' && item.qc_type === 'DX') {//数字
      //定性
      const m = {
        PNL: reportData.value.qty_pnl,
        SET: reportData.value.qty_set,
        PCS: reportData.value.qty_pcs
      }
      item.where = `0-${m[item.unit]}`;
      item.options.min = 0;
      item.options.max = m[item.unit];
    }
  });
};


//获取数据
const wo = async wonumber => {
  const result = await api.get(apiUrl.mes.report_data.wo, {
    wonumber,
    step_id: reportData.value.step_id,
    process_id: reportData.value.process_id,
    station_id: reportData.value.station_id,
    equipment_id: reportData.value.equipment_id,
    template_id: reportData.value.template_id,
  });
  if (result?.erp_woid > 0) {
    Object.assign(reportData.value, result);//合并数据
    reportData.value.parameters.forEach(item => item.options = {...tdOptions[item.input_type], ...item.options})//合并配置项
    if (reportData.value.id > 0) {//已上机直接显示
      reportData.value.status = true;
      tolerance();
    } else {
      qtyBox.show = true;//输入上机数据
    }
  }
}


//扫码人员
const employee = async employee_id => {
  const employee = await api.get(apiUrl.mes.report_data.employee, {employee_id});
  if (employee?.id > 0) {
    defaultConfig.employee_id = employee.id;
    defaultConfig.employee_name = employee.name;
    Object.assign(reportData.value, defaultConfig);
  }
}


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  siyi.navHide = true;//隐藏导航栏
  //注册一个扫码监听键盘事件
  core.scan(char => {
    const [prefix, code] = char.split('#');
    if (prefix === 'employee') {
      employee(code);
    } else {
      defaultConfig.employee_id > 0 && defaultConfig.template_id > 0 ? wo(char) : dialog.error('没有选择操作员或者设备模板');
    }
  }, document.body,50);
});


//打开页面
onMounted(async () => {
  tplList.value = await api.get(apiUrl.mes.report_data.config);//获取模板配置
  if (Array.isArray(tplList.value)) {
    if (tplList.value.length > 1) {
      templateBox.show = true;
    } else {
      selectTpl(tplList.value[0]);
    }
  }
});
</script>
<style scoped>
.box {
  display: flex;
  flex-direction: column;

  > .tabs {
    background-color: #f1f1f1;
    user-select: none;
    overflow-x: auto;
    display: flex;
    justify-content: space-between;

    &::-webkit-scrollbar {
      display: none;
    }

    > .menu,
    > .tab {
      display: flex;
      align-items: center;
      height: 40px;

      &.menu {
        gap: 3px;
        padding-right: 5px;
      }

      > dt {
        height: 100%;
        padding: 0 20px;
        white-space: nowrap;
        cursor: default;
        display: flex;
        align-items: center;
      }

      > dd {
        height: 34px;
        padding: 0 20px;
        background: #c5c5c5;
        color: #5d5d5d;
        cursor: not-allowed;
        border-radius: 3px;
        white-space: nowrap;
        display: flex;
        align-items: center;
      }

      > dd.active {
        color: #000;
        background: #35a1fd;
        cursor: default;
      }
    }

    > .tab.report > dt.report,
    > .tab.reportDetails > dt.reportDetails,
    > .tab.templateConfig > dt.templateConfig,
    > .tab.scrapDetails > dt.scrapDetails,
    > .tab.outputDetails > dt.outputDetails,
    > .tab.circulation > dt.circulation,
    > .tab.inspection > dt.inspection,
    > .tab.maintenance > dt.maintenance {
      color: #35a1fd;
      background-color: #fff;
      font-weight: bold;
    }
  }

  > .body {
    flex: 1;
    padding: 3px;
    overflow: hidden;

    > div {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    > .report {
      display: flex;
      flex-direction: column;

      > .main.header {
        overflow-x: auto;

        &::-webkit-scrollbar {
          display: none;
        }

        > table {
          min-width: 100%;
          border-collapse: collapse;

          > thead {
            background: #f5f5f5;

            > tr > th {
              width: 20%;
            }
          }

          > thead > tr > th,
          > tbody > tr > td {
            border: 1px solid #ddd;
            height: 36px;
            text-align: center;
            white-space: nowrap;
            padding: 2px;
            overflow: hidden;
          }
        }
      }

      > .detail {
        &.body {
          flex: 1;
          overflow-y: auto;

          &::-webkit-scrollbar {
            display: none;
          }
        }

        > table {
          min-width: 100%;
          border-collapse: collapse;

          > tbody > tr:nth-child(even) {
            background-color: #f8fbff;
          }

          > thead > tr > th {
            background-color: #f5f5f5;
          }

          > thead > tr > th,
          > tbody > tr > td {
            height: 48px;
            padding: 0 4px;
            border: 1px solid #ddd;
            overflow: hidden;
            white-space: nowrap;

            &.sort {
              width: 50px;
              text-align: center;
            }

            &.name {
              width: 200px;
              text-align: center;
            }

            &.value {
              width: auto;
              text-align: left;

              > .number {
                width: 100%;
              }

              > .time {
                width: 100%;
              }

              > .switch_number {
                width: 90%;
              }
            }

            &.where {
              width: 200px;
              text-align: center;
            }

            &.qctype {
              width: 80px;
              text-align: center;
            }

            &.unit {
              width: 80px;
              text-align: center;
            }
          }

          > thead > tr:first-child > th,
          > tbody > tr:first-child > td {
            border-top: 0 none;
          }
        }
      }
    }
  }
}

.templateBox {
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  > dl {
    padding: 20px 30px;
    background: linear-gradient(135deg, #affbfd 0%, #fedffd 40%, #e4e9fd 80%);
    border-radius: 5px;
    cursor: default;
    display: flex;
    flex-direction: column;

    &:hover {
      background: linear-gradient(130deg, #affbfd 0%, #e1fac0 40%, #e4e9fd 100%);
    }

    > dt.title {
      font-weight: bold;
      font-size: 20px;
      color: #0a8dff;
    }

    > dd.body {
      font-size: 18px;
      font-weight: bold;
      padding: 20px 0;
    }

    > dd.footer {
      font-size: 14px;
      color: #6f6f6f;
    }
  }
}

.quantityBox {
  width: 100%;
  height: 100%;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;

  > div {
    width: 180px
  }
}

</style>