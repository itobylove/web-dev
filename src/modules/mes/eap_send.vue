<template>
  <div class="body">
    <div class="siyi-table card1">
      <table>
        <tbody>
        <tr>
          <td>操作员</td>
          <td>{{ refobj.employee_name }}</td>
        </tr>
        <tr>
          <td>设备</td>
          <td>
            <div v-for="device in displayAssets" :key="device.id" class="device-item" :class="{ 'active': refobj.assets_code === device.id }">
              <div class="device-left"><span class="device-name">{{ device.name }}</span></div>
              <div class="device-right" v-if="device.interface && Object.keys(device.interface).filter(key => device.interface[key].pda === 'show').length > 1">
                <t-radio-group theme="button" v-model="refobj.selected_interface"
                               @change="obj.changeFormula(device, $event)"
                               :options="Object.values(device.interface).filter(item => item.pda === 'show').map(item => ({label: item.label, value: item.value}))"/>
              </div>
              </div>
          </td>
        </tr>
        <tr v-if="refobj.assets.length >= 2">
          <td>是否单独下发</td>
          <td>
            <t-switch class="switch" v-model="refobj.push" v-bind="refobj.switch"/>
          </td>
        </tr>
        <tr>
          <td>Lot</td>
          <td>{{ refobj.lot }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <!-- LOT -->
    <div class="siyi-table card2">
      <table>
        <thead>
        <tr>
          <th>工序</th>
          <th>工艺</th>
          <th>PNL</th>
          <th>SET</th>
          <th>PCS</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="Object.keys(refobj.workorder).length === 0">
          <td colspan="5">请扫描工单</td>
        </tr>
        <tr v-else>
          <td>{{ refobj.workorder.step_name }}</td>
          <td>{{ refobj.workorder.process_name }}</td>
          <td>
            <t-input-number v-model="refobj.workorder.qty_pnl_backlog" theme="normal" style="width: 45px"
                            @change="obj.changeQuantity('pnl', refobj.workorder)"
                            :min="0" :max="refobj.workorder.qty_pnl_backlog"/>
          </td>
          <td>
            <t-input-number v-model="refobj.workorder.qty_set_backlog" theme="normal" style="width: 60px"
                            @change="obj.changeQuantity('set', refobj.workorder)"
                            :min="0" :max="refobj.workorder.qty_set_backlog"/>
          </td>
          <td>
            <t-input-number v-model="refobj.workorder.qty_pcs_backlog" theme="normal" style="width: 80px"
                            @change="obj.changeQuantity('pcs', refobj.workorder)"
                            :min="0" :max="refobj.workorder.qty_pcs_backlog"/>
          </td>
        </tr>
        </tbody>

      </table>
    </div>

    <!-- 配方信息 -->
    <div class="siyi-table card3">
      <table>
        <thead>
        <tr>
          <th>配方名称</th>
          <th>参数名称</th>
          <th>参数值</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="refobj.formula.length===0">
          <td colspan="3">请扫描工单</td>
        </tr>
        <template v-for="item in displayFormula">
          <tr>
            <td>{{ item.function_name }}</td>
            <td>{{ item.parameter_name }}</td>
            <td>{{ item.parameter_value }}</td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>


    <!-- 按钮 -->
    <div class="button">
      <t-button variant="outline" @click="obj.del">重置</t-button>
      <t-button theme="primary" @click="obj.send" :disabled="countdown <= 0">
        下发 {{ countdown > 0 ? `(${countdown}s)` : '' }}
      </t-button>
    </div>


  </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, reactive, ref} from "vue";

import * as api from '@/core/script/api';
import apiUrl from "@/core/config/url2.js";
import dialog from "@/core/script/dialog.js";
import * as core from "@/core/script/core.js";
import siyi from "@/core/script/siyi.js";


const countdown = ref(0); // 倒计时
let countdownTimer = null; // 倒计时定时器
const refobj = reactive({
  isRequestPending: false, //请求
  employee_code: '', //人员编号
  employee_name: '',//人员名称
  assets_code: '',//扫码的设备ID
  assets: [], // 设备
  function: '',// 方法
  lot: '', //工单
  workorder: [],  //扫描的工单结存
  wolist: [],  //扫描的工单结存
  formula: [], //需要下的配方参数
  qty_pnl_backlog: 0, //Pnl数量
  qty_set_backlog: 0,
  qty_pcs_backlog: 0,
  assetsBoxShow: false, //设备列表是否显示
  push: 0, //是否单独下发 默认否
  switch: {label: ['是', '否'], customValue: [1, 0], size: 'large'},
});

/**
 * 设备列表 根据是否打包下发过滤
 */
const displayAssets = computed(() => {
  if (refobj.push === 1) {
    return refobj.assets.filter(device => device.id === refobj.assets_code || device.code === refobj.assets_code);
  }
  return refobj.assets;
});
/**
 * 配方列表 根据是否打包下发过滤
 */
const displayFormula = computed(() => {
  if (refobj.push === 1) {
    return refobj.formula.filter(formula => formula.assets_code === refobj.assets_code);
  }
  return refobj.formula;
});

const obj = {
  /**
   * 初始配置
   */
  default: {
    isRequestPending: false,
    employee_code: '', //人员编号
    employee_name: '',//人员名称
    assets_code: '',//扫码的设备ID
    assets: [], // 设备
    function: [], //方法
    lot: '', //工单
    workorder: [],  //工单数据
    wolist: [], //修改后的工单数据
    formula: [], //需要下的配方参数
    qty_pnl_backlog: 0, //Pnl数量
    qty_set_backlog: 0,
    qty_pcs_backlog: 0,
    assetsBoxShow: false, //设备列表是否显示
    push: 0,
    switch: {label: ['是', '否'], customValue: [1, 0], size: 'large'},
  },

  /**
   * 选择设备方法的窗口配置
   */
  assetsBoxShow: {
    minHeight: 50, changeSize: false, showHeader: false, esc: false, forceEnlarge: false,
    onAfterClose: () => refobj.assetsBoxShow = false
  },
  /**
   * 重置页面上的信息
   */
  del() {
    Object.assign(refobj, obj.default);
    countdown.value = 0;
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  },
  /**
   * 检查获取信息或者下发需要的内容
   * @returns {boolean}
   */
  check(lot) {
    refobj.function = {};
    if (!refobj.assets || refobj.assets.length === 0) {
      dialog.error('请先选择设备');
      return false;
    }
    for (const device of refobj.assets) {
      const showInterfaces = device.interface ? Object.keys(device.interface).filter(key => device.interface[key].pda === 'show') : [];
      if (showInterfaces.length > 1) {
        // 有多个方法列表的设备，需要检查是否已选择
        if (!refobj.selected_interface) {
          dialog.error(`请选择设备 ${device.name} 的方法`);
          return false;
        }
        refobj.function[device.code] = refobj.selected_interface;
      } else if (showInterfaces.length === 1) {
        // 只有一个方法，自动使用该方法的value
        const singleInterfaceKey = showInterfaces[0];
        refobj.function[device.code] = device.interface[singleInterfaceKey].value;
      } else {
        // 没有方法列表的设备，设置为空字符串
        refobj.function[device.code] = '';
      }
    }

    if (refobj.employee_code.length <= 0) {
      dialog.error('请先选择操作员');
      return false;
    }
    if (lot) refobj.lot = lot;
    if (refobj.lot.length <= 0) {
      dialog.error('请先扫描工单');
      return false;
    }
    return true;
  },

  /**
   * 推送配方信息到设备商
   * @returns
   */
  send() {
    if (obj.check("")) {
      if (refobj.isRequestPending) return; // 有请求正在进行
      refobj.isRequestPending = true;
      const loading = dialog.loading()
      try {
        api.post(apiUrl.eap.interface.pda,
            {
              assets: refobj.assets_code, //设备
              workorder: refobj.lot, //工单号
              employee: refobj.employee_code, //员工
              function: refobj.function,  //设备+方法
              wolist: refobj.wolist, // 工单结存
              push: refobj.push === 1 ? "single" : "batch", //批量或单独下发
              type: 'send'
            }).then(res => {
          refobj.isRequestPending = false;
          if (!res || Object.keys(res).length === 0) {
            loading.close();
            return;
          }
          const devices = displayAssets.value;
          const failedDevices = devices.filter(device => {
            const deviceCode = device.code || device.id;
            return res[deviceCode]?.code !== 20000;
          });

          if (failedDevices.length === 0) {
            dialog.success('配方下发成功');
            countdown.value = 0;
          } else {
            const errorMsg = failedDevices.map(device => {
              const deviceCode = device.code || device.id;
              return `${device.name || deviceCode}: ${res[deviceCode]?.message || '下发失败'}`;
            }).join('\n');
            dialog.error(errorMsg);
          }
          loading.close();
        });
      } catch (error) {
        dialog.error(error.message);
        loading.close();
        refobj.isRequestPending = false;
      }
    }
  },

  /**
   * 获得配方数据展示在页面
   * @param lot 工单
   */
  formula(lot) {
    if (obj.check(lot)) {
      if (refobj.isRequestPending) return; // 有请求正在进行
      refobj.isRequestPending = true;
      try {
        api.post(apiUrl.eap.interface.pda, {
          assets: refobj.assets_code,
          workorder: refobj.lot,
          employee: refobj.employee_code,
          function: refobj.function,
          push: refobj.push === 1 ? "single" : "batch", //批量或单独下发
          type: 'show'
        }).then(res => {
          refobj.isRequestPending = false;
          if (res) {
            const allFormula = [];
            refobj.assets.forEach(device => {
              const deviceCode = device.code || device.id;
              if (res['parameter'][deviceCode]) {
                allFormula.push(...res['parameter'][deviceCode]);
              }
            });
            refobj.formula = allFormula;
            refobj.workorder = res.workorder;
            refobj.wolist = res.workorder;
            //设置下发的按钮倒计时30s 超过30s之后禁用按钮
            obj.setCountdown();
          }
        });
      } catch (error) {
        dialog.error(error.message);
        refobj.isRequestPending = false;
      }
    }

  },

  /**
   * 扫码人员
   * @param employee_code
   */
  employee: async employee_code => {
    try {
      if (refobj.isRequestPending) return; // 有请求正在进行
      refobj.isRequestPending = true;
      const result = await api.post(apiUrl.eap.interface.employee, {employee: employee_code});
      refobj.isRequestPending = false;
      if (result?.id > 0) {
        const employee = {employee_name: result.name, employee_code: result.code};
        Object.assign(refobj, employee);
        sessionStorage.setItem(sessionStorage.getItem('x-api-key'), JSON.stringify(employee));
      }
    } catch (error) {
      dialog.error(error.message);
      refobj.isRequestPending = false;
    }
  },

  /**
   * 扫码设备
   * @param assets_code
   */
  assets: async assets_code => {
    try {
      if (refobj.isRequestPending) return; // 有请求正在进行
      refobj.isRequestPending = true;
      refobj.assets_code = assets_code
      const result = await api.post(apiUrl.eap.interface.assets, {assets: refobj.assets_code});
      if (result) {
        refobj.assets = result;
      }
      refobj.isRequestPending = false;
    } catch (error) {
      dialog.error(error.message);
      refobj.isRequestPending = false;
    }
  },

  /**
   * 切换配方
   */
  changeFormula: () => {
    if (refobj.formula?.length > 0) {
      //判断 lot
      obj.formula(refobj.lot);
    }
  },

  /**
   * 设置下发的按钮倒计时30s 超过30s之后禁用按钮
   */
  setCountdown: () => {
    countdown.value = 30;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }, 1000);
  },


  /**
   * 输入数量联动效果
   * @param type 类型
   * @param item 数据
   */
  changeQuantity: (type, item) => {
    if (type === 'pnl') {
      item.qty_set_backlog = item.qty_pnl_backlog * item.setofpnl;
      item.qty_pcs_backlog = item.qty_pnl_backlog * item.pcsofpnl;
    } else if (type === 'set') {
      item.qty_pcs_backlog = item.qty_set_backlog * item.pcsofset;
    } else if (type === 'pcs' && item.pcsofset === 1) {
      item.qty_set_backlog = item.qty_pcs_backlog;
    }
    refobj.wolist.qty_pnl_backlog = item.qty_pnl_backlog;
    refobj.wolist.qty_set_backlog = item.qty_set_backlog;
    refobj.wolist.qty_pcs_backlog = item.qty_pcs_backlog;
  },


}
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});

onMounted(async () => {
  siyi.navHide = true;//隐藏导航栏
  Object.assign(refobj, JSON.parse(sessionStorage.getItem(sessionStorage.getItem('x-api-key'))));
  core.scan(char => {//注册一个扫码监听键盘事件
    if (char.startsWith('ZH') || char.startsWith('H') || char.startsWith('LT') || char.startsWith('Z')) {
      obj.employee(char);
    } else if (char.startsWith('C_') || char.startsWith('D_')) {
      obj.assets(char);
    } else {
      obj.formula(char);
    }
  }, document.body, 50);
});
</script>
<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;
  background: #f5f6f7;

  > div {
    flex-shrink: 0;
    border-radius: 5px;

    > table > thead > tr > th,
    > table > tbody > tr > td {
      padding: 5px;
      font-size: 14px;
      white-space: nowrap;
    }
  }

  > .card1 > table > tbody > tr {
    background-color: #fff;

    > td:first-child {
      width: 100px;
      font-weight: bold;
    }
  }

  > .card2 > table > tbody > tr,
  > .card3 > table > tbody > tr {
    background-color: #fff;
  }

  > .card3 {
    flex: 1;
    background-color: #fff;
  }

  > .button {
    flex-shrink: 0;
    display: flex;
    gap: 5px;
    background: #FFF;
    text-align: center;

    > button {
      flex: 1;
      flex-shrink: 0;
      height: 40px;
    }
  }
}
</style>