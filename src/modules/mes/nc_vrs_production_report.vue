<template>
  <div class="box" ref="box">
    <div class="tabs">
      <dl :class="['tab',refobj.tabType]">
        <dt class="report" @click="obj.tabSwitch('report')">生产报表</dt>
        <dt class="reportDetails" @click="obj.tabSwitch('reportDetails')">生产记录</dt>
        <dt v-if="siyi.user.administrator" class="templateConfig" @click="obj.tabSwitch('templateConfig')">模板配置</dt>
      </dl>
      <dl class="menu" v-if="refobj.tabType==='report'">
        <dd :class="[{'active':refobj.status}]" @click="obj.del">重扫</dd>
        <dd :class="[{'active':refobj.status}]" @click="obj.save">下机</dd>
      </dl>
    </div>
    <div class="body">
      <div class="report" v-if="refobj.tabType==='report'">
        <div class="siyi-table header">
          <table>
            <tbody>
            <tr>
              <td>操作员</td>
              <td>设备</td>
              <td>工段</td>
              <td>工艺</td>
              <td>工序</td>
              <td>状态</td>
            </tr>
            <tr>
              <td>{{ refobj.employee_name }}</td>
              <td>{{ refobj.equipment_name }}</td>
              <td>{{ refobj.station_name }}</td>
              <td>{{ refobj.process_name }}</td>
              <td>{{ refobj.step_name }}</td>
              <td>{{ refobj.status ? '等待下机' : '等待上机' }}</td>
            </tr>
            <tr>
              <td>工单号</td>
              <td>部件号</td>
              <td>总结存</td>
              <td>正常生产</td>
              <td>返工生产</td>
              <td>当前生产</td>
            </tr>
            <tr class="wo">
              <td @click="obj.wolistShow">{{ refobj.wonumber }} <span v-if="refobj.multiple&&refobj.status&&refobj.wolist.length>1">{{ refobj.wolist.length }}</span></td>
              <td>{{ refobj.partnum }} {{ refobj.partrev }}<br>{{ refobj.mfgpartcode }}</td>
              <td>{{ refobj.qty_pnl_backlog }} PNL<br>{{ refobj.qty_set_backlog }} SET<br>{{ refobj.qty_pcs_backlog }} PCS</td>
              <td>{{ refobj.qty_pnl_complete }} PNL<br>{{ refobj.qty_set_complete }} SET<br>{{ refobj.qty_pcs_complete }} PCS</td>
              <td>{{ refobj.qty_pnl_complete_rework }} PNL<br>{{ refobj.qty_set_complete_rework }} SET<br>{{ refobj.qty_pcs_complete_rework }} PCS</td>
              <td>{{ refobj.qty_pnl }} PNL<br>{{ refobj.qty_set }} SET<br>{{ refobj.qty_pcs }} PCS</td>
            </tr>
            <tr>
              <td colspan="6" class="remark">
                <input v-model="refobj.remark" placeholder="可输入备注信息" :disabled="!refobj.status">
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="siyi-table parameters">
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
            <tbody>
            <tr v-if="refobj.parameters.length===0">
              <td colspan="6" class="empty">
                <t-empty type="empty" size="large" description="请扫描工单" title="暂无数据"></t-empty>
              </td>
            </tr>
            <tr v-for="(item,sort) in refobj.parameters">
              <td class="sort">{{ sort + 1 }}</td>
              <td class="name">{{ item.name }}</td>
              <td class="value">
                <t-input-number class="number" v-if="item.input_type==='number'" v-model="item.value" v-bind="item.options" :disabled="!refobj.status" :readonly="item.template_parameter_id === 80 || item.template_parameter_id === 81 "  @change="obj.changeParam(item)"/>
                <t-input class="string" v-else-if="item.input_type==='string'" v-model="item.value" v-bind="item.options" :disabled="!refobj.status"/>
                <t-radio-group class="radio" v-else-if="item.input_type==='radio'" v-model="item.value" v-bind="item.options" :disabled="!refobj.status"  />
                <t-select class="select" v-else-if="item.input_type==='select'" v-model="item.value" v-bind="item.options" :disabled="!refobj.status"/>
                <t-switch class="switch" v-else-if="item.input_type==='switch'" v-model="item.value" v-bind="item.options" :disabled="!refobj.status"/>
                <t-time-picker class="time" v-else-if="item.input_type==='time'" v-model="item.value" v-bind="item.options" :disabled="!refobj.status"/>
                <t-date-picker class="date" v-else-if="item.input_type==='date'" v-model="item.value"  :presets="{'此刻': () => new Date()}"  v-bind="item.options" :disabled="!refobj.status" />
              </td>
              <td class="where">{{ item.where }}</td>
              <td class="qctype">{{ item.qc_type_text }}</td>
              <td class="unit">{{ item.unit }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="reportDetails" v-else-if="refobj.tabType==='reportDetails'">
        <report_history :where="{station_id:refobj.station_id,equipment_id:refobj.equipment_id}"></report_history>
      </div>
      <div class="scrapDetails" v-else-if="refobj.tabType==='scrapDetails'">报废明细开发中</div>
      <div class="outputDetails" v-else-if="refobj.tabType==='outputDetails'">产出明细开发中</div>
      <div class="circulation" v-else-if="refobj.tabType==='circulation'">生产过数开发中</div>
      <div class="inspection" v-else-if="refobj.tabType==='inspection'">设备点检开发中</div>
      <div class="maintenance" v-else-if="refobj.tabType==='maintenance'">设备保养开发中</div>
      <div class="templateConfig" v-else-if="refobj.tabType==='templateConfig'">
        <report_template :where="{step_id:refobj.step_id,process_id:refobj.process_id}"></report_template>
      </div>
    </div>
    <dialogComponent ref="templateBox" v-if="refobj.templateBoxShow" v-bind="obj.templateBox">
      <div class="templateBox">
        <dl v-for="item in obj.templateList" @click="obj.selectTpl(item)">
          <dt class="title">{{ item.equipment_name }}</dt>
          <dd class="body">{{ item.template_name }}</dd>
          <dd class="footer">{{ item.station_name }}</dd>
        </dl>
      </div>
    </dialogComponent>
    <dialogComponent ref="qtyBox" v-if="refobj.qtyBoxShow" v-bind="obj.qtyBox">
      <div class="quantityBox">
        <t-alert class="warning_message" v-if="refobj.warning_message" theme="warning" :message="refobj.warning_message"/>
        <div class="siyi-table table">
          <table>
            <thead>
            <tr>
              <th rowspan="2">
                <t-checkbox :disabled="!obj.qtyBox.showFooter" :checked="refobj.checkAll" :indeterminate="refobj.indeterminate" @change="obj.selectAll"/>
              </th>
              <th rowspan="2">工单号</th>
              <th rowspan="2">工序</th>
              <th rowspan="2">工艺</th>
              <th rowspan="2">返工</th>
              <th colspan="3">PNL</th>
              <th colspan="3">SET</th>
              <th colspan="3">PCS</th>
            </tr>
            <tr>
              <th>结存</th>
              <th>完成</th>
              <th>上机</th>
              <th>结存</th>
              <th>完成</th>
              <th>上机</th>
              <th>结存</th>
              <th>完成</th>
              <th>上机</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in refobj.wolist" :class="item.sc_type">
              <td>
                <t-checkbox v-model="item.checked" @change="obj.select" :disabled="!obj.qtyBox.showFooter"/>
              </td>
              <td>{{ item.wonumber }}</td>
              <td>{{ item.step_name }}</td>
              <td>{{ item.process_name }}</td>
              <td>
                <t-switch v-model="item.sc_type" v-bind="obj.reworkSwitch" :disabled="!obj.qtyBox.showFooter"/>
              </td>
              <td>{{ item.qty_pnl_backlog }}</td>
              <td>{{ item.sc_type === 'rework' ? item.qty_pnl_complete_rework : item.qty_pnl_complete }}</td>
              <td>
                <t-input-number style="width: 50px"
                                v-model="item.qty_pnl"
                                @change="obj.changeQuantity('pnl',item)"
                                theme="normal"
                                :disabled="!obj.qtyBox.showFooter"
                                :min="0"
                                :max="item.sc_type==='rework'?item.qty_pnl_backlog:item.qty_pnl_backlog-item.qty_pnl_complete"/>
              </td>
              <td>{{ item.qty_set_backlog }}</td>
              <td>{{ item.sc_type === 'rework' ? item.qty_set_complete_rework : item.qty_set_complete }}</td>
              <td>
                <t-input-number style="width: 60px"
                                v-model="item.qty_set"
                                @change="obj.changeQuantity('set',item)"
                                theme="normal"
                                :disabled="!obj.qtyBox.showFooter"
                                :min="0"
                                :max="item.sc_type==='rework'?item.qty_set_backlog:item.qty_set_backlog-item.qty_set_complete"/>
              </td>
              <td>{{ item.qty_pcs_backlog }}</td>
              <td>{{ item.sc_type === 'rework' ? item.qty_pcs_complete_rework : item.qty_pcs_complete }}</td>
              <td>
                <t-input-number style="width: 70px"
                                v-model="item.qty_pcs"
                                @change="obj.changeQuantity('pcs',item)"
                                theme="normal"
                                :disabled="!obj.qtyBox.showFooter"
                                :min="0"
                                :max="item.sc_type==='rework'?item.qty_pcs_backlog:item.qty_pcs_backlog-item.qty_pcs_complete"/>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </dialogComponent>
  </div>
</template>
<script setup>
import {onActivated, onMounted, reactive, ref} from 'vue';
import * as api from '@/core/script/api';
import siyi from '@/core/script/siyi';
import dialog from '@/core/script/dialog';
import * as core from '@/core/script/core';
import apiUrl from '@/core/config/url2';
import dialogComponent from '@/core/component/dialog.vue';
import Report_history from '@/modules/mes/report_history.vue';
import Report_template from '@/modules/mes/report_template.vue';
import {dateNow} from "@/utils/tdesign.js";


const box = ref();//工作区
const qtyBox = ref();//上机数量窗口
const templateBox = ref();


/**
 * 响应性属性
 */
const refobj = reactive({
  tabType: 'report',//选项卡
  templateBoxShow: false,//选择模板的窗口
  qtyBoxShow: false,//输入上机数量的窗口
  checkAll: false,//全选
  indeterminate: false,//部分选中
  employee_id: 0,//人员ID
  employee_name: '',//人员
  equipment_id: 0,//设备ID
  equipment_name: '',// 设备名称
  station_id: 0,//工段ID
  station_name: '',//工段名称
  template_id: 0,//模板ID
  template_name: '',//模板名称
  multiple: false,//是否可多工单上机
  isRequestPending : false,  // 是否有请求正在进行
});


/**
 * 常规表态配置
 */
const obj = {
  /**
   * 初始配置
   */
  default: {
    process_name: '',//流程名称
    step_name: '',//工序名称
    status: false,//当前状态
    wonumber: '',//工单号
    partnum: '',//型号
    partrev: '',//版本
    mfgpartcode: '',//生产部件
    qty_pnl_backlog: 0,
    qty_set_backlog: 0,
    qty_pcs_backlog: 0,
    qty_pnl_complete: 0,
    qty_set_complete: 0,
    qty_pcs_complete: 0,
    qty_pnl_complete_rework: 0,
    qty_set_complete_rework: 0,
    qty_pcs_complete_rework: 0,
    qty_pnl: 0,
    qty_set: 0,
    qty_pcs: 0,
    warning_message: '',
    wolist: [],//工单数据
    parameters: [],//参数列表
  },
  /**
   * 腾讯组件的默认配置
   */
  defaultOptions: {
    string: {size: 'large'},
    number: {allowInputOverLimit: true, theme: 'column', size: 'large'}, //允许超出 目前是记录 超出不合格即可
    select: {filterable: true, multiple: true, minCollapsedNum: 1, size: 'large'},
    switch: {label: ['是', '否'], customValue: ['是', '否'], size: 'large'},
    radio: {size: 'large',options:[]},
  },
  /**
   * 返工开关
   */
  reworkSwitch: {customValue: ['rework', 'normal']},
  /**
   * 获取到后商的模板列表
   */
  templateList: [],
  /**
   * 选择模板的窗口配置
   */
  templateBox: {
    minHeight: 50, changeSize: false, showHeader: false, esc: false, forceEnlarge: false,
    onAfterClose: () => refobj.templateBoxShow = false
  },
  /**
   * 选择模板
   * @param config 模板配置
   */
  selectTpl: config => {
    Object.assign(refobj, config, JSON.parse(sessionStorage.getItem(sessionStorage.getItem('x-api-key'))));
    templateBox.value?.close();
    obj.wo('WOC2601221941-00-001-003');
  },
  wolistShow: () => {
    if(refobj.wolist.length>1 && Boolean(refobj.wonumber)){
      obj.qtyBox.showFooter = false;
      obj.qtyBox.showClose = true;
      obj.qtyBox.title = '已上机工单列表';
      refobj.qtyBoxShow = true;//输入上机数据
    }
  },
  /**
   * 输入上机数量的窗口配置
   */
  qtyBox: {
    okval: '上机', noval: '取消', showFooter: true, esc: false, forceEnlarge: false, showClose: false, changeSize: false,
    onAfterClose: () => refobj.qtyBoxShow = false, okCallback: async o => o.close = await obj.create(),
  },
  selectAll: val => {
    refobj.wolist.forEach(item => item.checked = val);
    const len = refobj.wolist.filter(item => item.checked).length;
    refobj.checkAll = len === refobj.wolist.length;
    refobj.indeterminate = len > 0 && len < refobj.wolist.length;
  },
  select: () => {
    const len = refobj.wolist.filter(item => item.checked).length;
    refobj.checkAll = len === refobj.wolist.length;
    refobj.indeterminate = len > 0 && len < refobj.wolist.length;
  },
  /**
   * 选项卡切换
   * @param val 选择卡值
   */
  tabSwitch: val => refobj.tabType = val,

  /**
   * 获取工单数据
   * @param wonumber 工单号
   */
  wo: async wonumber => {
    if (refobj.isRequestPending)  return; // 有请求正在进行
    refobj.isRequestPending = true;
    try{
      qtyBox.value?.close();
      const result = await api.post(apiUrl.mes.report_data.wo, {
        wonumber, station_id: refobj.station_id,
        equipment_id: refobj.equipment_id,
        template_id: refobj.template_id,
        multiple: refobj.multiple,
      });
      if (result?.wolist?.length > 0) {
        Object.assign(refobj, result);
        obj.selectAll(result.wolist.every(item => item.checked));
        refobj.parameters.forEach(item => item.options = {...obj.defaultOptions[item.input_type], ...item.options});//合并配置项
        if (refobj.status) {//已上机直接显示
          obj.updateData();
          obj.tolerance();
        } else {
          obj.qtyBox.showFooter = true;
          obj.qtyBox.showClose = false;
          obj.qtyBox.title = '请输入上机数量';
          refobj.qtyBoxShow = true;//输入上机数据
        }
      }
    }catch (error){
      dialog.error(error.message);
    }finally {
      refobj.isRequestPending = false; // 请求结束
    }
  },
  /**
   * 输入上机数量联动效果
   * @param type 类型
   */
  changeQuantity: (type,item) => {
    if (type === 'pnl') {
      item.qty_set = item.qty_pnl * item.setofpnl;
      item.qty_pcs = item.qty_pnl * item.pcsofpnl;
    } else if (type === 'set') {
      item.qty_pcs = item.qty_set * item.pcsofset;
    } else if (type === 'pcs' && item.pcsofset === 1) {
      item.qty_set = item.qty_pcs;
    }
  },
  /**
   * 上机
   */
  create: async () => {
    //防止重复提交
    if (refobj.isRequestPending)  return; // 有请求正在进行
    refobj.isRequestPending = true;
    try {
      const wolist = refobj.wolist.filter(item => item.checked);
      //判断上机的数量必须大于0
      const errors = [];
      wolist.forEach(item => {
        if (item.qty_pcs <= 0) {
          errors.push(`【${item.wonumber}】工单数量必须大于0`);
        }
      });
      if (errors.length > 0) {
        dialog.error(errors.join('<br/>'));  // 这里用换行符连接所有错误信息
        return false;
      }

      const ids = await api.post(apiUrl.mes.report_data.create, {
        wolist, station_id: refobj.station_id,
        equipment_id: refobj.equipment_id,
        template_id: refobj.template_id,
        employee_id: refobj.employee_id,
        multiple: refobj.multiple,
      });
      if (ids && Object.keys(ids).length > 0) {
        refobj.wolist = wolist;
        refobj.status = true;
        obj.updateData(ids);
        obj.tolerance();
        return true;
      } else {
        return false;
      }
    }catch (error){
      dialog.error(error.message);
    }finally {
      refobj.isRequestPending = false;
    }
  },
  /**
   * 下机
   */
  save: async () => {
    if (!refobj.status) return;
    // 检查参数数据
    for (const item of refobj.parameters) {
      if (/number|string/.test(item.input_type) && (item.value === null || item.value === '')) {
        return dialog.error('【' + item.name + '】参数值未填写，不能下机');
      }
    }
    const loading = dialog.loading(box.value, '正在下机');
    const status = await api.post(apiUrl.mes.report_data.save, {
      wolist: refobj.wolist,
      remark: refobj.remark,
      parameters: refobj.parameters,

      station_id: refobj.station_id,
      equipment_id: refobj.equipment_id,
      template_id: refobj.template_id,
      employee_id: refobj.employee_id,
      multiple: refobj.multiple,
    });
    status === true && Object.assign(refobj, obj.default)
    loading.close();
  },
  /**
   * 重扫
   */
  del: async () => {
    if (!refobj.status) return;
    const loading = dialog.loading(box.value, '正在删除');
    if (await api.post(apiUrl.mes.report_data.del, {wolist: refobj.wolist}) === true) {
      Object.assign(refobj, obj.default);
      loading.close();
    }
  },
  /**
   * 首检
   */
  fa: () => dialog.warning('功能开发中'),
  /**
   * 抽检
   */
  ipqc: () => dialog.warning('功能开发中'),
  updateData: ids => {
    const step_name = [];
    const process_name = [];
    refobj.wolist.forEach((item, index) => {
          if (ids) item.id = ids[item.erp_woid];
          step_name.push(item.step_name);
          process_name.push(item.process_name);
          if (index === 0) {
            refobj.wonumber = item.wonumber;
            refobj.partnum = item.partnum;
            refobj.partrev = item.partrev;
            refobj.mfgpartcode = item.mfgpartcode;
          }
          refobj.qty_pnl_backlog += item.qty_pnl_backlog;
          refobj.qty_set_backlog += item.qty_set_backlog;
          refobj.qty_pcs_backlog += item.qty_pcs_backlog;
          refobj.qty_pnl_complete += item.qty_pnl_complete;
          refobj.qty_set_complete += item.qty_set_complete;
          refobj.qty_pcs_complete += item.qty_pcs_complete;
          refobj.qty_pnl_complete_rework += item.qty_pnl_complete_rework;
          refobj.qty_set_complete_rework += item.qty_set_complete_rework;
          refobj.qty_pcs_complete_rework += item.qty_pcs_complete_rework;
          refobj.qty_pnl += item.qty_pnl;
          refobj.qty_set += item.qty_set;
          refobj.qty_pcs += item.qty_pcs;
        }
    );
    refobj.step_name = [...new Set(step_name)].join(',');
    refobj.process_name = [...new Set(process_name)].join(',');
  },
  /**
   * 处理公差
   */
  tolerance: () => {
    refobj.parameters.forEach(item => {
      item.options = {...obj.defaultOptions[item.input_type], ...item.options};
      if (item.qc_type === 'DL') {//定量
        // 统一数值
        const standard = Number(item.standard) || 0;
        const up = Number(item.uptolerance) || 0;
        const down = Number(item.downtolerance) || 0;

        let min = null;
        let max = null;
        let where = '';

        const upText = up > 0 ? `${up}${item.uptoleranceunit}` : '';
        const downText = down > 0 ? `${down}${item.downtoleranceunit}` : '';
        switch (item.tolerance_type) {
          case 'BL': // 百分比
            if (up > 0) max = standard + standard * up / 100;
            if (down > 0) min = standard - standard * down / 100;
            break;
          case 'GC': // 固定公差
            if (up > 0) max = standard + up;
            if (down > 0) min = standard - down;
            break;
          case 'GDZ': // 给定范围
            max = up;
            min = down;
            break;
        }

        if (upText && downText) {
          where = item.tolerance_type === 'GDZ' ? `${upText}-${downText}` : `+${upText}/-${downText}`;
        } else if (upText) {
          where = `≤${upText}`;
        } else if (downText) {
          where = `≥${downText}`;
        } else if (max !== null && min !== null) {
          where = `${max}/${min}`;
        }

        item.where = where;
        item.options.min = min !== null ? Number(min) : null;
        item.options.max = max !== null ? Number(max) : null;
      }

      if(item.input_type === 'date' || item.input_type === 'time'){
        if(item.options?.format){
          item.value = core.date.datetimeFormat(dateNow, item.options.format);
        } else {
          item.value = item.input_type === 'date' ? core.date.time() : core.date.date();
        }
      }

    });
  },
  /**
   * 扫码人员
   * @param employee_id
   */
  employee: async employee_id => {
    const result = await api.get(apiUrl.mes.report_data.employee, {employee_id});
    if (result?.id > 0) {
      const employee = {employee_id: result.id, employee_name: result.name};
      Object.assign(refobj, employee);
      sessionStorage.setItem(sessionStorage.getItem('x-api-key'), JSON.stringify(employee));
    }
  },
  /**
   * 扫码设备  该模板下必须有这个设备 否则不能转换
   */
  equipment: equipment_id => {
    const template = obj.templateList.find(t => t.equipment_id === +equipment_id && t.template_id === +refobj.template_id);
    if (!template) {dialog.error('当前账号未配置该设备，请联系管理员添加！');return;}
    Object.assign(refobj, {equipment_id: template.equipment_id, equipment_name: template.equipment_name});
  },
  /**
   * 参数改变事件
   */
  changeParam: (item) => {
    if (item.qc_type === 'BF') {
      obj.calculateScrapTotal();
      obj.calculatePassRate();
    } else if (item.qc_type === 'BL') {
      obj.calculatePassRate();
    }
  },

  /**
   * 计算某个类型参数的总和
   */
  calculateTotal : (qcType) => {
    return refobj.parameters.filter(p => p.qc_type === qcType)
        .reduce((sum, param) => sum + (parseFloat(param.value) || 0), 0);
  },

  /**
   * 计算报废总数：所有qc_type为BF的参数之和
   */
   calculateScrapTotal : () => {
    const totalScrap = obj.calculateTotal('BF');

    const scrapTotalParam = refobj.parameters.find(p => p.template_parameter_id === 80);
    if (scrapTotalParam) {
      scrapTotalParam.value = totalScrap.toString();
    }
  },

  /**
   * 计算一次合格率
   */
  calculatePassRate : () => {
    const totalSet = refobj.qty_set_backlog || 0; //总SET数
    const scrapValue = parseFloat(refobj.parameters.find(p => p.template_parameter_id === 80)?.value) || 0; //报废数量
    const defectValue = obj.calculateTotal('BL'); //不良数

    if (totalSet > 0) {
      //(总set - 报废数- 不良数)/ 总set数
      const passRate = ((totalSet - scrapValue - defectValue) / totalSet * 100).toFixed(2);

      const passRateParam = refobj.parameters.find(p => p.template_parameter_id === 81);
      if (passRateParam) {
        passRateParam.value = passRate.toString();
      }
    }
  },

}


/**
 * 在首次挂载 以及每次从缓存中被重新插入的时候调用
 */
onActivated(() => {
  siyi.navHide = true;//隐藏导航栏
  core.scan(char => {//注册一个扫码监听键盘事件
    const [prefix, code] = char.split('#');
    if (prefix === 'employee') {
      obj.employee(code);
    } else if (prefix === 'equipment') {
      obj.equipment(code);
    } else {
      refobj.employee_id > 0 && refobj.template_id > 0  ? obj.wo(char) : dialog.error('没有选择操作员或者设备模板');
    }
  }, document.body, 50);
});

Object.assign(refobj, obj.default); //合并配置

/**
 * 打开页面
 */
onMounted(async () => {
  obj.templateList = await api.get(apiUrl.mes.report_data.config);//获取模板配置
  if (Array.isArray(obj.templateList)) {
    if (obj.templateList.length > 1) {
      refobj.templateBoxShow = true;
    } else {
      obj.selectTpl(obj.templateList[0]);
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

      > dt {
        height: 40px;
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

    > .menu {
      gap: 3px;
      padding-right: 3px;
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
    margin: 3px;
    overflow: hidden;

    > div {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    > .report {
      > .header {
        flex-shrink: 0;

        > table {
          > tbody {
            > tr {
              background-color: #f5f5f5;
              font-weight: bold;

              &.wo {
                > td {
                  padding: 2px;
                }

                > td:first-child {
                  position: relative;

                  > span {
                    width: 18px;
                    height: 18px;
                    display: inline-block;
                    line-height: 18px;
                    text-align: center;
                    background-color: red;
                    font-size: 12px;
                    color: #fff;
                    font-weight: bold;
                    border-radius: 50%;
                  }
                }
              }

              > td {
                text-align: center;
                padding: 8px;
                white-space: nowrap;

                &.remark {
                  padding: 3px;
                  background: #fff;

                  > input {
                    width: 100%;
                    height: 34px;
                    padding: 0 5px;
                    font-size: 16px;
                    border: none;
                    outline: none;
                    background: #efefef;
                    border-radius: 3px;
                  }
                }
              }
            }

            /*隔行换色*/

            > tr:nth-child(even) {
              background-color: #fff;
              font-weight: normal;
            }
          }
        }
      }

      > .parameters {
        border-top: none;

        > table {
          > thead > tr > th, > tbody > tr > td {
            height: 48px;
            padding: 0 4px;
            white-space: nowrap;

            &.empty {
              height: auto;
              padding: 10px 0;
            }

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
              > .date {
                width: 100%;
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
    flex-shrink: 0;
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
      flex-shrink: 0;
      font-weight: bold;
      font-size: 20px;
      color: #0a8dff;
    }

    > dd.body {
      flex-shrink: 0;
      font-size: 18px;
      font-weight: bold;
      padding: 20px 0;
    }

    > dd.footer {
      flex-shrink: 0;
      font-size: 14px;
      color: #333;
    }
  }
}

.quantityBox {
  padding: 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  > .warning_message {
    width: 100%;
  }

  > .table {
    max-height: 250px;

    > table {
      > thead > tr > th {
        padding: 8px;
        white-space: nowrap;
        text-align: center;
      }

      > tbody > tr.rework {
        background-color: #fff9ab;
      }

      > tbody > tr > td {
        padding: 4px;
        white-space: nowrap;
        text-align: center;
      }
    }
  }
}
</style>