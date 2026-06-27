<template>
  <div class="body">
    <video ref="video" :src="videoBg" muted playsinline autoplay loop></video>
    <div class="box">
      <div class="left">
        <div v-if="!refObj.stackupInfo.length" class="empty">
          <i class="ri-database-2-line"></i>
          <span>暂无数据</span>
        </div>
        <div v-else v-for="item in refObj.stackupInfo" :class="[item.layerType,item.layerName,item.status]">{{ item['content'] }} <span>{{ item['layerName'] }}</span></div>
      </div>
      <div class="right">
        <div class="row1">
          {{ refObj.employee?.name }} ({{ refObj.employee?.code }})，{{ refObj.assets?.name }}，{{ refObj.stackupInfo[0]?.partNumRev }}
          <div>
            <span class="apply-btn" @click="obj.apply">申请混料</span>
            <span :class="{huanliao:refObj.huanliao}" @click="obj.huanliao">{{ refObj.huanliao ? '换料中' : '叠板中' }}</span>
          </div>
        </div>
        <div class="row2 siyi-table">
          <table>
            <thead>
            <tr>
              <th>PNL码</th>
              <th>工单号</th>
              <th>部件编号</th>
              <th>总数量</th>
              <th>已叠数量</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="!refObj.workOrder.length">
              <td colspan="5" class="empty">
                <i class="ri-database-2-line"></i>
                <span>暂无数据</span>
              </td>
            </tr>
            <tr v-else v-for="item in refObj.workOrder" :class="item.status">
              <td>{{ item.pnlCode }}</td>
              <td>{{ item.woNumber }}</td>
              <td>{{ item.layerText }}</td>
              <td>{{ item.pnlTotal }}</td>
              <td>{{ item.pnlStacked }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="row3 siyi-table">
          <table>
            <thead>
            <tr>
              <th>操作日志</th>
              <th>类型</th>
              <th>时间</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="!refObj.errors.length">
              <td colspan="4" class="empty">
                <i class="ri-database-2-line"></i>
                <span>暂无数据</span>
              </td>
            </tr>
            <tr v-else v-for="item in refObj.errors" :class="item.type">
              <td>{{ item.content }}</td>
              <td><i :class="obj.logsType[item.type]"></i>{{ item.typeText }}</td>
              <td>{{ item.time }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <DialogComponent v-if="refObj.dialogShow" v-bind="obj.dialogConfig">
        <div class="apply-dialog">   
            <div style="margin-bottom: 10px;">
                申请原因：
                <t-space>
                     <t-radio-group v-model="refObj.reason" @change="obj.onChange">
                      <t-radio v-for="reason in obj.reasons" :value="reason.value">{{ reason.label }}</t-radio>
                    </t-radio-group>
                </t-space>
            </div>
            <t-textarea v-model="refObj.reasonText" placeholder="请输入申请原因" v-if="refObj.reason == 3"></t-textarea>
        </div>
      </DialogComponent>
    </div>
  </div>
</template>
<script setup>
import {reactive, onActivated, onDeactivated, onMounted, ref} from 'vue';
import * as api from '@/core/script/api';
import siyi from '@/core/script/siyi';
import dialog from '@/core/script/dialog';
import * as core from '@/core/script/core';
import apiUrl from '@/core/config/url2';
import DialogComponent from '@/core/component/dialog.vue';

const video = ref()
const videoBg = '/video/packingStandardBg.mp4'

const refObj = reactive({
  employee: JSON.parse(localStorage.getItem('stackedboard_employee')),
  assets: JSON.parse(localStorage.getItem('stackedboard_assets')),
  workOrder: [],
  stackupInfo: [],
  huanliao: true,
  errors: [],
  dialogShow: false, //弹窗显示
  reason:1,
  reasonText:'',
  
});


const obj = {
      /**
       * 当前上料的CODE 工单号或者PNL码
       */
      woOrPnlCode: '',
      /**
       * 叠层原始数据
       */
      stackupInfo: [],
      /**
       * 待保存数据
       */
      saveData: [],
      /**
       * 换料
       */
      huanliao: () => refObj.huanliao = !refObj.huanliao,
      /**
       * 日志类型
       */
      logsType: {
        success: 'ri-checkbox-circle-line',
        error: 'ri-close-circle-line',
        info: 'ri-information-line',
        warning: 'ri-alert-line'
      },
      reasons:[
        {
          value: 1,
          label: '补料'
        },
        {
          value: 2,
          label: '换料'
        },
        {
          value: '3',
          label: '其他'
        },
      ],
      /**
       * 日志
       * @param content
       * @param type
       */
      logs: (content, type = 'success'
      ) => {
        const typeText = {success: '成功', error: '错误', info: '提示', warning: '警告'};
        refObj.errors.unshift({content, type, typeText: typeText[type], time: core.date.time()});
      },
      /**
       * 获取员工
       * @param employee
       * @returns {Promise<void>}
       */
      getEmployee: async employee => {
        refObj.employee = await api.get(apiUrl.mes.stackedBoard.employee, {employee});
        localStorage.setItem('stackedboard_employee', JSON.stringify(refObj.employee));
      },
      /**
       * 获取设备
       * @param assets
       * @returns {Promise<void>}
       */
      getAssets: async assets => {
        refObj.assets = await api.get(apiUrl.mes.stackedBoard.assets, {assets});
        localStorage.setItem('stackedboard_assets', JSON.stringify(refObj.assets));
      },
      /**
       * 获取叠层数据(换料)
       * @param woOrPnlCode PNL码或者工单号
       */
      getStackupInfo: async woOrPnlCode => {
        if (!refObj.employee?.id) {
          return obj.logs('请先扫描工卡', 'warning');
        }
        if (!refObj.assets?.id) {
          return obj.logs('请先扫描设备', 'warning');
        }
        if (woOrPnlCode.length < 7) {
          return obj.logs('扫描的工单或者PNL码错误', 'warning');
        }
        const result = await api.post(apiUrl.mes.stackedBoard.stackupInfo, {
          pnlCode: woOrPnlCode,
          woOrPnlCode,
          erpStepId: 35,//refObj.assets.erpstepid,todo: 待上线
          erpProcessId: 45,//refObj.assets.erpprocessid, todo: 待上线
          scenes: refObj.assets.scenes
        });
        if (result) {
          obj.woOrPnlCode = woOrPnlCode;
          obj.stackupInfo = result;
          obj.stackupInfo.forEach(item => refObj.stackupInfo.push({...item}));
          obj.saveData = [];
          refObj.huanliao = false;
        }
      },
      /**
       * 设置待叠状态
       * @param ms
       * @param seq
       * @returns {Promise<unknown>}
       */
      setStackupInfoStatus: async (ms, seq) => {
        return await new Promise(resolve => {
          setTimeout(() => {
            refObj.stackupInfo.forEach(item => {
              if (item.seq === seq) {
                item.status = 'ok';
              }
            });
            resolve();
          }, ms);
        });
      },
      /**
       * 验证PNL板
       * @param pnlCode
       * @returns {Promise<void>}
       */
      validCode: async pnlCode => {
        //当前数据
        const res = await api.post(apiUrl.mes.stackedBoard.validCode, {
          pnlCode,
          woOrPnlCode: obj.woOrPnlCode,
          woGroup: refObj.workOrder.map(item => item.woGroup),
          okMfgpartId: refObj.workOrder.map(item => item.mfgpartId),
          assetsId: refObj.assets.id,
          erpStepId: 35,//refObj.assets.erpstepid,todo: 待上线
          erpProcessId: 45,//refObj.assets.erpprocessid, todo: 待上线
          scenes: refObj.assets.scenes
        }, null, true, true);
        const data = res.data;
        obj.logs(data.message, data.status);

        if (data.status !== 'success') {
          return;
        }
        const workorder = data.data;


        refObj.workOrder.unshift(workorder);
        obj.saveData.push({mfgpartId: workorder.mfgpartId, pnlCode, woId: workorder.woId});


        //第三步：从下到上点亮叠层
        let stackupInfo_done = [];
        if (refObj.assets.scenes) {
          const topLayer = refObj.stackupInfo.filter(item => item.layerType === 'SIGNAL' && item.startLayer === workorder.startLayer);
          stackupInfo_done = refObj.stackupInfo.filter(item => item.seq >= topLayer[0].seq && ['wait', 'group'].includes(item.status));
        } else {
          stackupInfo_done = refObj.stackupInfo.filter(item => ['wait', 'group'].includes(item.status));
        }

        const len2 = stackupInfo_done.length - 1;
        for (let i = len2; i >= 0; i--) {
          await obj.setStackupInfoStatus(50, stackupInfo_done[i].seq);
        }


        if (refObj.stackupInfo.some(item => ['wait', 'group'].includes(item.status))) {
          return;
        }

        //第五步：保存
        if (await dialog.confirmAsync('请确认保存或者重叠', '请确认', {esc: false, okKeyCode: false, noval: '重叠', okval: '保存'})) {
          await obj.save(pnlCode);
        } else {
          obj.resetBoard();
        }
      },
      /**
       * 重置
       */
      resetBoard: () => {
        obj.saveData = [];
        refObj.stackupInfo = [];
        refObj.workOrder = [];
        obj.stackupInfo.forEach(item => refObj.stackupInfo.push({...item}));
      },
      /**
       * 保存
       * @returns {Promise<void>}
       */
      save: async pnlCode => {
        const res = await api.post(apiUrl.mes.stackedBoard.save, {
          saveData: obj.saveData,
          employee: refObj.employee.id,
          assets: refObj.assets.id,
          group_code: pnlCode,
          pnlCode: obj.woOrPnlCode,
          erpStepId: 35,//refObj.assets.erpstepid,todo: 待上线
          erpProcessId: 45,//refObj.assets.erpprocessid, todo: 待上线
          scenes: refObj.assets.scenes
        }, null, true, true);
        const data = res.data;
        obj.logs(data.message, data.status);
        obj.resetBoard();
      },
      dialogConfig:{
        title: '混料申请',
        width: 450,
        height: 200,
        changeSize: false,
        showFooter: true,
        showClose: false,
        okval: '提交',
        noval: '取消',
        okCallback:  async () => obj.applySubmit(),
        beforeOpenCallback: () => {},
        afterCloseCallback: () => {
          refObj.dialogShow = false;
          refObj.reasonText = '';
          refObj.reason = 1;
        }
      },
      apply: async () => {
        dialog.confirm('确认要申请混料吗？', async () =>{
          refObj.dialogShow = true;
        });
      },
      onChange:e=>{
        refObj.reason = e;
      },
      applySubmit:async () =>{
        const result = await api.post(apiUrl.mes.stackedBoard.applyMixedBoard,{
          partCode: refObj.stackupInfo[0]?.partNumRev,
          code: obj.woOrPnlCode,
          employee: refObj.employee.id,
          assets: refObj.assets.id,
          type:refObj.reason,
          content:refObj.reasonText
        });
        if(result.data > 0){
          dialog.success('申请成功');
        }else{
          dialog.error('申请失败');
        }
      }
    }
;


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  siyi.navHide = true;
  video.value.play().catch(error => console.warn('Playback was interrupted:', error));
  core.scan(char => {//注册一个扫码监听键盘事件
    if (char.startsWith('ZH') || char.startsWith('H') || char.startsWith('LT') || char.startsWith('Z')) {
      obj.getEmployee(char);
    } else if (char.startsWith('D_')) {
      obj.getAssets(char);
    } else {
      refObj.huanliao ? obj.getStackupInfo(char) : obj.validCode(char);
    }
  }, document.body, 50);
})


// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => siyi.navHide = false);


onMounted(async () => {
  // await obj.getEmployee('H21040801');
  await obj.getAssets('D_DB_01');


  //第一组测试：BR1313S10E0134457A0
  //L5-L6     2613900010 2613900009 2613900008 2613900007 2613900006 2613900005 2613900004 2613900003 2613900002 2613900001
  //L8-L9    2613900022 2613900021 2613900020
  //L4-L7    2613900025 2613900024 2613900023 2613900016 2613900015 2613900014 2613900013 2613900012 2613900011
  //L2-L3    2613900019 2613900018 2613900017

  // await obj.getStackupInfo('WOB2503071128-21-001-001');//L5-L6
  // await obj.validCode('2613900001');

  // await obj.getStackupInfo('WOB2503071128-12-001-001');//L4-L7
  // await obj.validCode('2613900021');
  // await obj.validCode('2613900024');
  // await obj.validCode('2613900018');


  // BR0016P12E0070561
  // await obj.getStackupInfo('WOB240806907-21-001-001');//L2-L3 2613900041 2613900042 2613900043 2613900044 2613900045 2613900046
  // await obj.getStackupInfo('WOB240806907-22-001-001');//L4-L5 2613900047 2613900048 2613900049
  // await obj.validCode('2613900046');
  // await obj.validCode('2613900047');
  // await obj.validCode('2613900042');


  // await obj.validCode('2613900041');
  // await obj.getStackupInfo('WOB240806907-24-001-001');//L8-L9 2613900050 2613900051 2613900052
  // await obj.getStackupInfo('WOB240806907-23-001-001');//L10-L11 2613900053 2613900054 2613900055
  // await obj.validCode('2613900053');
  // await obj.validCode('2613900050');
  //L8-L12 2614100004 2614100003
  //L1-L5 2614100002 2614100001

  // await obj.getStackupInfo('WOC2510282049-00-001-001C');//L2-L3  2614200033 2614200032 2614200031 2614200030 2614200029 2614200028
  // await obj.getStackupInfo('WOB240806907-12-001-001');//L6-L7 2613900056 2613900057 2613900058 2613900059 2613900060 2613900061


  // await obj.validCode('2614200033');
  // await obj.validCode('2613900058');
  // await obj.validCode('2613900055');
  // await obj.validCode('2614100004');
  // await obj.validCode('2614100004');
  // await obj.validCode('2614100004');
  // await obj.validCode('2613900053');
  // await obj.validCode('2614100004');
  // await obj.validCode('2613900053');
  // await obj.validCode('2613900050');
  // await obj.validCode('2614100004');
  // await obj.validCode('2614100001');


  //CR1284P08T0127275
  //问题汇总：
  //1.熔合区校验错误
  // await obj.getStackupInfo('WOC260505187-13-A001-001');// L6-L7 2614200021 2614200020 2614200019
  // await obj.getStackupInfo('WOC260505187-12-A001-001');// L4-L5 2614200024 2614200023 2614200022
  // await obj.getStackupInfo('WOC260505187-11-A001-001');// L2-L3 2614200027 2614200026 2614200025
 // await obj.validCode('2614200019');
// await  obj.validCode('2614200022');
//

  // BR0001S06E0146996
// await obj.getStackupInfo('WOB2503071128-21-001-001');//L4-L5 2614400060 2614400059 2614400058 2614400072 2614400071 2614400070 2614400069 2614400068 2614400067
// await obj.getStackupInfo('WOB2602262570-12-001-001');//L2-L3 2614400063 2614400062 2614400061
// await obj.getStackupInfo('WOB2602262570-11-001-001');//光板 2614400066 2614400065 2614400064

  // await obj.validCode('2614400060');
  // await obj.validCode('2614400063');
  // await obj.validCode('2614400066');


  //BR0535S10Y0134355
//问题汇总：
//熔合区叠板校验不通过
// await obj.getStackupInfo('RPB25061015891-22-001-001');//L7-L8 2614200048 2614200047 2614200046
// await obj.validCode('2614200051');
// await obj.getStackupInfo('RPB25061015891-21-001-001');//L9-L10 2614200051 2614200050 2614200049
// await obj.validCode('2614200048');
// obj.validCode('2614200050');
// await obj.getStackupInfo('RPB25061015891-11-001-001');//L7-L10 2614200054 2614200053 2614200052
//   await obj.validCode('2614200054');
//   await obj.validCode('2614200054');


  //CR1284P08T0127275
  //问题汇总：
  //1.熔合区校验错误
  // await obj.getStackupInfo('WOC260505187-13-A001-001');// L6-L7 2614200021 2614200020 2614200019
  // await obj.getStackupInfo('WOC260505187-12-A001-001');// L4-L5 2614200024 2614200023 2614200022
  // await obj.getStackupInfo('WOC260505187-11-A001-001');// L2-L3 2614200027 2614200026 2614200025
  // await obj.validCode('2614200021');
  // await obj.validCode('2614200024');
  // await obj.validCode('2614200027');



  //BH0625P06E0082668
// await obj.getStackupInfo('WOB2602252340-13-001-001');//L5-L6 2614400003  2614400002 2614400001 2614400006 2614400005 2614400004 2614400018 2614400017 2614400016 2614400015 2614400014 2614400013
// await obj.getStackupInfo('WOB2602252340-12-001-001');//L3-L4 2614400009  2614400008 2614400007
// await obj.getStackupInfo('WOB2602252340-11-001-001');//L1-L2 2614400012 2614400011 2614400010
// 熔合区
// await obj.getStackupInfo('WOB2602252340-11-001-001');//L5-L6
// await obj.validCode('2614400014');
// await obj.validCode('2614400007');
// await obj.validCode('2614400010');


// await obj.getStackupInfo('WOB2507101650-13-001-001'); //L5-L6 2615200003 2615200002 2615200001
// await obj.getStackupInfo('WOB2507101650-12-001-001'); //L3-L4 2615200006 2615200005 2615200004
// await obj.validCode('2614400013');
// await obj.validCode('2615200005');
// await obj.validCode('2614400012');

  // await obj.getStackupInfo('WOB2503071128-12-001-001');//L4-L7
  // await obj.validCode('2613900019');

// await obj.getStackupInfo('WOC260225784-13-001-002');
// await obj.validCode('2613910001');

  //第二组测试：BH1355S08Y0148126A0
  // await obj.getStackupInfo('WOB260403014-22-001-001');//L6-L7
  // await obj.validCode('2613500001');//L6-L7

  // await obj.getStackupInfo('WOB260403014-21-001-001');//L2-L3
  // await obj.validCode('2613400001');//L2-L3

  // await obj.getStackupInfo('WOB260403014-12-001-001');//L5-L8
  // await obj.validCode('2613300011');//L1-L4
  // await obj.validCode('2613300012');//L5-L8
  // await obj.validCode('2613300011');//L1-L4


});
</script>
<style scoped>
.body {
  border-top: 1px solid #0d1b2a;
  background: linear-gradient(180deg, #30364d, #0d1b2a);

  > video {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    object-fit: cover;
    opacity: .15;
  }

  > .box {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 2;
    display: flex;

    > .left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      border-right: 3px solid #0d1b2a;
      overflow: hidden auto;

      &::-webkit-scrollbar {
        display: none;
      }

      > div {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        font-weight: bold;
        font-size: 18px;
        padding: 0 10px;
      }

      > .empty {
        display: block;
        color: #c6ff00;
        font-size: 25px;

        > span {
          display: block;
        }
      }

      > .SIGNAL {
        background-color: rgba(255, 200, 0, 0.8);
      }

      > .Core {
        background-color: rgba(255, 255, 125, 0.8);
      }

      > .Foil {
        background-color: rgba(255, 140, 0, 0.8);
      }

      > .PrePreg {
        background-color: rgba(170, 255, 250, 0.7);
      }

      > .EtchedCore {
        background-color: rgba(255, 255, 255, 0.5);
      }

      > .wait {
        background-color: rgba(255, 255, 255, 0.7);
      }

      > .group {
        background-color: rgba(255, 255, 255, 0.5);
      }

      > .disabled {
        background-color: #fff;
        opacity: 0.2;
      }
    }

    > .right {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      width: 50%;
      white-space: nowrap;
      font-size: 25px;
      color: #c6ff00;
      font-weight: bold;

      > .row1 {
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
        height: 65px;
        background: rgba(0, 120, 180, 0.3);

        >div{
            span {
                padding: 5px 10px;
                border-radius: 3px;
                cursor: default;
                background-color: #00bb00;
                user-select: none;
                color: #FFF;

                &:hover {
                    cursor: pointer;
                }

                &.huanliao {
                    background-color: #ffa500;
                }
            }
            .apply-btn{
                margin-right: 10px;
            }
        } 
      }

      > .row2 {
        flex-shrink: 0;
        height: 45%;
        border: 0 none;
        border-top: 1px solid #0d1b2a;

        > table {
          color: #c6ff00;
          font-size: 25px;

          > thead {
            background: #0D1B2A;
          }

          > tbody > tr {
            background: transparent;
          }

          > thead > tr > th,
          > tbody > tr > td {
            border: 0 none;
            padding: 10px 0;
            border-bottom: 1px solid #0d1b2a;
          }

          > tbody > tr > td.empty > span {
            display: block;
          }
        }
      }

      > .row3 {
        flex: 1;
        border: 0 none;

        > table {
          color: #c6ff00;
          font-size: 25px;

          > thead {
            background: #0D1B2A;
          }

          > tbody > tr {
            background: transparent;
          }

          > thead > tr > th,
          > tbody > tr > td {
            border: 0 none;
            padding: 10px;
            border-bottom: 1px solid #0d1b2a;
          }

          > thead > tr > th:nth-child(1),
          > tbody > tr > td:nth-child(1) {
            text-align: left;
          }

          > thead > tr > th:nth-child(2),
          > tbody > tr > td:nth-child(2) {
            width: 115px;
          }

          > thead > tr > th:nth-child(3),
          > tbody > tr > td:nth-child(3) {
            width: 280px;
          }

          > tbody > tr > td.empty {
            text-align: center;

            > span {
              display: block;
            }
          }

          > tbody > tr.info {
            color: #FFF;
          }

          > tbody > tr.success {
            color: #00ff00;
          }

          > tbody > tr.error {
            color: red;
          }

          > tbody > tr.warning {
            color: orange;
          }
        }
      }
    }
    
  }
  .apply-dialog{
      padding: 10px;
  }
}
</style>