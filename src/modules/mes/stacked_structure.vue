<template>
    <div ref="box" class="body">
        <div ref="left" class="left">
            <!-- <div class="structure"
                    :class="[{ pp: item.isActive }, { core: item.isActived }, { etchedCore: item.isEtchedCore }, { error: item.errorActive }]"
                    draggable="true" @dragstart="obj.dragStart($event, item)" @dragover.prevent
                    @drop="obj.drop($event, item)"> -->
            <!-- <template v-for="(item, index) in refObj.bomList" :key="index">
                <div class="structure"
                    :class="[{ 'core': item.layerName == 'Core' }, { 'foil': item.layerName == 'Foil' }, { 'pp': item.layerName == 'PrePreg' }, { 'etchedCore': item.layerName == 'EtchedCore' }, { 'error': item.errorActive }, { 'active': item.isActive }]">
                    （{{ item.layerName }}）{{ item.name }}({{ item.mfgPartId }})
                </div>
            </template> -->
            <div class="top base">
                <h2>动态生成叠构图</h2>
                <div class="left-top">
                    <template v-for="(item, index) in refObj.bomList" :key="index">
                        <div class="structure"
                            :class="[{ 'longStack': refObj.longStack }, { 'core': item.layerName == 'Core' }, { 'foil': item.layerName == 'Foil' }, { 'pp': item.layerName == 'PrePreg' }, { 'etchedCore': item.layerName == 'EtchedCore' }, { 'error': item.errorActive }, { 'active': item.isActive }]">
                            {{ item.layerName === 'Core' ? '（' + item.layerName + '）' + (item.mfgPartName ||
                                item.mfgPartCode) + '（' +
                                item.woId + '）' : item.layerName }}{{ item.name }}
                        </div>
                    </template>
                </div>
            </div>
            <div class="bottom ">
                <h2 class="bottom-title">系統原始叠构图</h2>
                <div class="left-bottom">
                    <template v-for="(item, index) in refObj.data" :key="index">
                        <div class="structure"
                            :class="[{ 'longStack': refObj.longStack }, { 'core': item.layerName == 'Core' }, { 'foil': item.layerName == 'Foil' }, { 'pp': item.layerName == 'PrePreg' }, { 'etchedCore': item.layerName == 'EtchedCore' }, { 'error': item.errorActive }, { 'active': item.isActive }]">
                            {{ item.layerName === 'Core' ? '（' + item.layerName + '）' + (item.mfgPartName ||
                                item.mfgPartCode) + '（' +
                                item.woId + '）' : item.layerName }}{{ item.name }}
                        </div>
                    </template>
                </div>

            </div>
        </div>
        <div class="right">
            <div class="header">
                <div class="base area">
                    <div>
                        备料区
                    </div>
                    <div style="font-size: 16px;font-weight: normal; color: #f00;">
                        {{ refObj.typeName }}
                    </div>
                </div>
                <div class="base code">
                    <div>
                        工单号：
                    </div>
                    <div style="flex: 1;" class="code-input">
                        <t-input v-model="refObj.lot" placeholder="请输入当前工单号"></t-input>
                    </div>
                    <div class="ml-10">
                        设备：
                    </div>
                    <div>
                        <span>{{ refObj.assets_name }}</span>
                    </div>
                    <div class="ml-10">
                        操作员：
                    </div>
                    <div>
                        <span>{{ refObj.employee_name }}</span>
                    </div>
                </div>
            </div>
            <div>
                <h2 class="base">基本信息</h2>
                <t-table ref="tableRef" rowKey="index" :data="refObj.tableData ? refObj.tableData : []"
                    :columns="obj.columns" bordered resizable>
                </t-table>
            </div>
            <div class="base"> <!--v-if="refObj.bomList.length > 0" -->
                <t-space direction="vertical" size="32px">
                    <t-form layout="inline" ref="form">
                        <t-input style="min-width: 250px; display: inline-block; margin-right: 20px"
                            v-model="refObj.scanCode" placeholder="请扫描条码"></t-input>
                    </t-form>
                </t-space>
                <button @click="obj.reStack">重叠</button>
            </div>
            <div class="tip base" v-if="refObj.tipMsg !== ''">
                <h1>请放:<span style="color: red;">{{ refObj.startLayer }}-{{ refObj.endLayer }}层，</span>{{ refObj.tipMsg
                    }}</h1>
            </div>
            <!-- <div class="base" v-if="refObj.type === 1 && refObj.bomList.length > 0">
                您已暂存 <span style="color: red; font-size: 30px;font-weight: 700;"> {{ refObj.saveNum }} </span> 次
            </div> -->
        </div>
    </div>
</template>

<script setup>
import { reactive, onActivated } from 'vue';
import * as api from '@/core/script/api';
import siyi from '@/core/script/siyi';
import dialog from '@/core/script/dialog';
import * as core from '@/core/script/core';
import apiUrl from '@/core/config/url2';
import _ from "lodash";

const refObj = reactive({
    bomList: [],//物料列表
    data: [],//原始构造图
    stackNum: 1,//当前层数
    tipMsg: '',//提示信息
    scanCode: '',//扫描条码
    materialList: [],//物料列表
    baseList: [],//基础信息
    typeName: 'pp普通叠合区',//类型名称
    type: 1,//类型
    // type: { value: 1, label: '熔合区' },//类型
    endLayer: 0,//结束层数
    startLayer: 0,//开始层数
    codeList: [],//条码列表
    lot: '',//工单号
    btn: '暂存',//按钮文字
    draggedItem: null,//拖动物料
    saveNum: 0,//暂存次数
    woId: '',//工单id
    assetsList: [], //用户的设备列表
    assets_id: 0, // 设备id
    assets_code: '', // 设备编号
    assets_name: '', //设备名称
    isRequestPending: false,//是否有请求正在进行
    employee_id: 0,//人员ID
    employee_code: '', //人员编号
    employee_name: '',//人员名称
    sameList: [],//相同物料列表
    longStack: false,//是否是长叠
    tableData: [],
    emptyData: [],
    isDone: false,//是否备料完成
});

const obj = {
    columns: [
        {
            colKey: 'woNumber',
            title: '工单号',
            cell: 'type-slot-name',
            //   width: 120,
            align: 'center',
        },
        {
            title: '生产型号版本',
            colKey: 'partCode',
            align: 'center',
        },
        {
            colKey: 'recId',
            title: '部件编号',
            align: 'center',
        },
        {
            colKey: 'qty_pnl_backlog',
            title: 'PNL数量',
            align: 'center',
        }
    ],
    dragStart(event, item) {
        refObj.draggedItem = item;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', null);
        event.target.classList.add('dragging');
        console.log(event.target);
    },
    async drop(event, target) {
        event.preventDefault();
        //event.srcElement.classList.remove('dragging');
        event.target.classList.remove('dragging');
        // console.log(refObj.bomList);
        console.log(event);
        const confirmRes = await dialog.confirmAsync('修改叠合顺序，可能会导致物料位置变化，是否要修改叠合顺序？', '关闭提示', { okval: '修改', noval: "取消" });
        if (confirmRes === true) {
            // dialog.success('开发ing...');
            if (refObj.draggedItem && refObj.draggedItem !== target) {
                const index = refObj.bomList.indexOf(refObj.draggedItem);
                refObj.bomList.splice(index, 1); // 移动原数据
                const newIndex = refObj.bomList.indexOf(target); // 新位置
                refObj.bomList.splice(newIndex, 0, refObj.draggedItem); //插入到新位置
                refObj.draggedItem = null; // Reset the dragged item.
            }
            return;
        }
        return;
    },
    handleChange(e) {
        refObj.type = e;
    },
    calculateLayerInfo() {
        const data = refObj.bomList;
        if (data.length === 0) {
            return;
        }
        if (refObj.type === 1) {//熔合板
            refObj.tipMsg = '（' + data.at(-1).layerName + '）' + data.at(-1).mfgPartName + '(' + data.at(-1).mfgPartCode + ')';//data.at(-1).standard;//最先一层物料
            refObj.startLayer = data.at(-1).startLayer;
            refObj.endLayer = data.at(-1).endLayer;
        } else if (refObj.type === 2) {//pp叠合区
            let i = 0;
            //数组从后往前遍历，找到第一个core，激活，并设置tipMsg
            for (let index = data.length - 1; index >= 0; index--) {
                if (data[index].layerName === 'Core' || data[index].layerName === 'EtchedCore') {
                    refObj.stackNum = data.length - index;//第一层芯板层数
                    refObj.tipMsg = '（' + data.at(index).layerName + '）' + (data.at(index).mfgPartName !== null ? data.at(index).mfgPartName : data.at(index).mfgPartCode);//最先一层物料
                    refObj.startLayer = data.at(index).startLayer;
                    refObj.endLayer = data.at(index).endLayer;
                    break;
                } else if (data[index].layerName === 'PrePreg') {
                    setTimeout(function () {
                        data[index].isActive = true;
                    }, i * 500);//延迟激活
                    i++;
                } else if (data[index].layerName === 'Foil') {
                    continue;
                }

            }
        } else {//普通板
            // refObj.tipMsg = data.at(-1).standard;//最先一层物料
            refObj.tipMsg = '（' + data.at(-1).layerName + '）' + data.at(-1).mfgPartName || data.at(-1).mfgPartCode;//最先一层物料
        }
    },
    async save() {
        const confirmRes = await dialog.confirmAsync('本组叠合完成，是否' + refObj.btn + '？', '关闭提示', { okval: refObj.btn, noval: "重叠" });
        if (confirmRes === true) {//暂存或保存
            const res = await api.post(apiUrl.mes.stacked_structure.save, { type: refObj.type, lot: refObj.lot, codeList: refObj.codeList, woId: refObj.woId });
            if (res.result) {
                obj.reStack();
                refObj.saveNum++;
                return;
            }
            dialog.error(refObj.btn + '失败，请重试');
            setTimeout(() => {
                obj.save();
            }, 1500);
        } else if (confirmRes === false) {//重叠
            obj.reStack();
        }
    },
    reStack() {
        refObj.codeList = [];
        refObj.bomList.map((item) => { item.isActived = false; item.isActive = false; item.isEtchedCore = false; item.errorActive = false; }) //重置激活状态
        refObj.stackNum = 1;
        obj.calculateLayerInfo();
        api.get(apiUrl.mes.stacked_structure.reStack);
    },
    reload() {
        refObj.bomList = [];
        refObj.materialList = [];
        refObj.codeList = [];
        refObj.tipMsg = '';
        refObj.stackNum = 1;
        refObj.saveNum = 0;
    },
    async employee(employee) {
        try {
            if (refObj.isRequestPending) return; // 有请求正在进行
            refObj.isRequestPending = true;
            const result = await api.get(apiUrl.mes.stacked_structure.employee, { employee });
            if (result?.id > 0) {
                const employee = { employee_id: result.id, employee_name: result.name, employee_code: result.code };
                Object.assign(refObj, employee);
                sessionStorage.setItem(sessionStorage.getItem('x-api-key'), JSON.stringify(employee));
            }
            refObj.isRequestPending = false;
        } catch (error) {
            dialog.error(error.message);
            refObj.isRequestPending = false;
        }
    },
    async assets(assets) {
        try {
            const result = await api.get(apiUrl.mes.stacked_structure.getAssetsByCode, { assets });
            if (result.length > 0) {
                refObj.assets_id = result[0].id;
                refObj.assets_name = result[0].name;
                refObj.assets_code = result[0].code;
                refObj.typeName = result[0].parameter_name[0];
                refObj.type = result[0].parameter_name[0] === '热熔区' ? 1 : 2;
                if (refObj.assets_id <= 0) {
                    dialog.error('该账号没有该扫描设备权限，请联系管理员添加！');
                }
            } else {
                dialog.error('该账号没有绑定设备数据，请联系管理员添加');
            }
        } catch (error) {
            dialog.error(error.message);
        }
    },
    async getBomList(lot, isScanCode = 0) {
        api.get(apiUrl.mes.stacked_structure.index, { lot: lot.trim(), type: refObj.type, isScanCode }).then(res => {
            // refObj.btn = res.btn;
            refObj.stackNum = 1;
            refObj.bomList = [];
            refObj.layerNum = res.list.length;
            refObj.bomList = res.list
            // refObj.bomList = res.list.map((item) => {
            //     item.isActived = false;
            //     item.isActive = false;
            //     item.isEtchedCore = false;
            //     item.errorActive = false;
            //     return item;

            // });//添加isActive属性
            refObj.data = res.data;//原始构造图
            // refObj.baseList = res.base;
            // refObj.sameList = res.same;
            // refObj.woId = res.base.工单编号;
            refObj.longStack = res.data.length > 10 ? true : false;//是否是长叠
            refObj.tableData = res.same
            obj.calculateLayerInfo();
            if (isScanCode === 1) {
                refObj.lot = res.base.工单号;
            }
        });
    },
    async validateCode(code) {
        let length = refObj.bomList.length;//总层数
        if (length === 0) {
            obj.getBomList(code.trim(), 1);//如果没有bom信息，则说明是第一次扫描，获取bom信息，相当于备料
        } else {
            await api.get(apiUrl.mes.stacked_structure.validate, { code: code.trim(), recId: refObj.bomList[length - refObj.stackNum].recId }).then(async res => {//验证条码
                if (res.ret.dm_code === code.trim() && res.ret.woid === refObj.bomList[length - refObj.stackNum].woId) {
                    refObj.codeList.push({ recId: refObj.bomList[length - refObj.stackNum].recId, id: res.ret.id });
                    if (refObj.bomList[length - refObj.stackNum].errorActive) {
                        refObj.bomList[length - refObj.stackNum].errorActive = false;//激活当前物料错误
                    }
                    // refObj.bomList[length - refObj.stackNum].woId
                    refObj.bomList[length - refObj.stackNum].isActive = true;//激活当前物料
                    // if (refObj.bomList[length - refObj.stackNum].layerName === 'Core') {
                    //     refObj.bomList[length - refObj.stackNum].isActived = true;//激活当前物料
                    // } else if (refObj.bomList[length - refObj.stackNum].layerName === 'EtchedCore') {
                    //     refObj.bomList[length - refObj.stackNum].isEtchedCore = true;//激活当前物料
                    // }
                    if (refObj.stackNum === length) {//如果是最后一层，则提示完成，并保存到数据库，并返回                
                        obj.save();
                        return;
                    }
                    //判断下一层是什么物料，pp自动点亮，core等待用户操作
                    let i = 0;
                    refObj.stackNum++;
                    for (let index = length - refObj.stackNum; index >= 0; index--) {
                        if (refObj.bomList[index].layerName === 'PrePreg') {
                            setTimeout(function () {
                                refObj.bomList[index].isActive = true;//自动点亮pp
                            }, i * 500);//延迟激活
                            i++;
                        } else if (refObj.bomList[index].layerName === 'Core' || refObj.bomList[index].layerName === 'EtchedCore') {
                            //（{{ item.layerName }}）{{ item.name }}({{ item.code }})
                            refObj.tipMsg = '（' + refObj.bomList[index].layerName + '）' + refObj.bomList[index].mfgPartName + '(' + refObj.bomList[index].mfgPartCode + ')';   //refObj.bomList[index].standard;//下一层物料
                            refObj.startLayer = refObj.bomList[index].startLayer;
                            refObj.endLayer = refObj.bomList[index].endLayer;
                            break;
                        } else if (refObj.bomList[index].layerName === 'Foil') {
                            if (index === 0) {
                                setTimeout(function () {
                                    obj.save();
                                }, i * 500);//延迟激活
                                return;
                            }
                        }
                        refObj.stackNum++;
                    }
                } else {
                    refObj.bomList[length - refObj.stackNum].isActived = false;//取消激活当前物料
                    refObj.bomList[length - refObj.stackNum].errorActive = true;//激活当前物料错误
                    return;
                }
            });
        }
        refObj.scanCode = '';
    }
}
//叠构时扫描验证
const scanCode = _.debounce(async (e) => {
    let length = refObj.bomList.length;//总层数
    if (length === 0) {
        obj.getBomList(e.target.value.trim(), 1);//如果没有bom信息，则说明是第一次扫描，获取bom信息，相当于备料
    } else {
        await api.get(apiUrl.mes.stacked_structure.validate, { code: e.target.value.trim(), recId: refObj.bomList[length - refObj.stackNum].recId }).then(async res => {//验证条码
            if (res.ret.dm_code === e.target.value.trim() && res.ret.woid === refObj.bomList[length - refObj.stackNum].woId) {
                refObj.codeList.push({ recId: refObj.bomList[length - refObj.stackNum].recId, id: res.ret.id });
                if (refObj.bomList[length - refObj.stackNum].errorActive) {
                    refObj.bomList[length - refObj.stackNum].errorActive = false;//激活当前物料错误
                }
                // refObj.bomList[length - refObj.stackNum].woId
                refObj.bomList[length - refObj.stackNum].isActive = true;//激活当前物料
                // if (refObj.bomList[length - refObj.stackNum].layerName === 'Core') {
                //     refObj.bomList[length - refObj.stackNum].isActived = true;//激活当前物料
                // } else if (refObj.bomList[length - refObj.stackNum].layerName === 'EtchedCore') {
                //     refObj.bomList[length - refObj.stackNum].isEtchedCore = true;//激活当前物料
                // }
                if (refObj.stackNum === length) {//如果是最后一层，则提示完成，并保存到数据库，并返回                
                    obj.save();
                    return;
                }
                //判断下一层是什么物料，pp自动点亮，core等待用户操作
                let i = 0;
                refObj.stackNum++;
                for (let index = length - refObj.stackNum; index >= 0; index--) {
                    if (refObj.bomList[index].layerName === 'PrePreg') {
                        setTimeout(function () {
                            refObj.bomList[index].isActive = true;//自动点亮pp
                        }, i * 500);//延迟激活
                        i++;
                    } else if (refObj.bomList[index].layerName === 'Core' || refObj.bomList[index].layerName === 'EtchedCore') {
                        //（{{ item.layerName }}）{{ item.name }}({{ item.code }})
                        refObj.tipMsg = '（' + refObj.bomList[index].layerName + '）' + refObj.bomList[index].mfgPartName + '(' + refObj.bomList[index].mfgPartCode + ')';   //refObj.bomList[index].standard;//下一层物料
                        refObj.startLayer = refObj.bomList[index].startLayer;
                        refObj.endLayer = refObj.bomList[index].endLayer;
                        break;
                    } else if (refObj.bomList[index].layerName === 'Foil') {
                        if (index === 0) {
                            setTimeout(function () {
                                obj.save();
                            }, i * 500);//延迟激活
                            return;
                        }
                    }
                    refObj.stackNum++;
                }
            } else {
                refObj.bomList[length - refObj.stackNum].isActived = false;//取消激活当前物料
                refObj.bomList[length - refObj.stackNum].errorActive = true;//激活当前物料错误
                return;
            }
        });
    }
    refObj.scanCode = '';
}, 500);

onActivated(() => {
    siyi.navHide = true;//隐藏导航栏
    core.scan(char => {//注册一个扫码监听键盘事件
        const [before, after] = char.split('#');
        console.log(before);
        console.log(after);
        if (before === 'employee') {
            console.log(after);
            obj.employee(after);
        } else if (before === 'assets') {
            obj.assets(after);
        } else {
            if (char.indexOf('-') > 0) {
                refObj.lot = char;
                obj.getBomList(char);
            } else {
                if (refObj.isDone) {
                    //就是验码
                    console.log(123);
                    obj.validateCode(char);
                } else {
                    obj.getBomList(char, 1);//如果没有bom信息，则说明是第一次扫描，获取bom信息，相当于备料
                }
                // console.log(char);
            }
        }
    }, document.body, 50);
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (e.target.value.indexOf('-') > 0) {
                obj.getBomList(e.target.value);
            } else {
                console.log('验码...');
                obj.validateCode(e.target.value);
            }
        }
    });
})
</script>

<style scoped>
/* keyframes必须写到最外层，不然会不起效 */
@keyframes bounceIn {
    to {
        transform: scale(1.2);
    }

    from {
        transform: scale(1);
    }
}

@-webkit-keyframes bounceIn {
    to {
        transform: scale(1.2);
    }

    from {
        transform: scale(1);
    }
}

@-moz-keyframes bounceIn {
    to {
        transform: scale(1.2);
    }

    from {
        transform: scale(1);
    }
}

:deep(.t-table__th-cell-inner) {
    color: #000000;
    font-size: 16px;
    font-weight: bold;
}

:deep(.t-table__body) {
    font-size: 16px;
}

.body {
    display: flex;

    .base {
        padding: 10px 0;
        border-bottom: 2px solid #d1d1d1;
        margin-bottom: 10px;
    }

    .ml-10 {
        margin-left: 10px;
    }

    .left,
    .right {
        width: 50%;
        border: 1px solid #ccc;
    }

    .left {
        display: flex;
        align-items: center;
        justify-content: end;
        flex-direction: column;
        padding: 0 20px;

        .top,
        .bottom {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: end;
            flex: 1;

            .left-top,
            .left-bottom {
                display: flex;
                flex-direction: column;
                flex: 1;
                align-items: center;
                text-align: center;
                width: 100%;
                justify-content: end;

                .structure {
                    width: 80%;
                    min-height: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 10px 0;
                    text-align: center;
                    margin: 5px;
                    cursor: move;
                    opacity: .3;
                    /* background: #e1e1e1; */
                }

                .dragging {
                    opacity: .5;
                }

                .active {
                    opacity: 1;
                    background: rgb(0 255 255);
                }

                .foil {
                    background: #969600;
                    color: #ffffff;
                }

                .error {
                    display: inline-block;
                    background: #d54941;
                    animation: bounceIn 1.5s infinite alternate;
                    -moz-animation: bounceIn 1.5s infinite alternate;
                    -webkit-animation: bounceIn 1.5s infinite alternate;
                    -o-animation: bounceIn 1.5s infinite alternate;
                }

                .pp {
                    background: #00ffff;
                    color: #000000;
                }

                .core {
                    background: linear-gradient(to bottom, #969600 15%, #FFFFFF 15% 25%, #ffff00 25% 75%, #FFFFFF 75% 85%, #969600 85% 100%);
                    color: #f00;
                }

                .etchedCore {
                    background: #ffff00;
                    color: #f00;
                }
            }

            .bottom-title {
                padding-bottom: 10px;
            }

            .left-bottom {
                flex: 1;
                width: 100%;
                overflow: hidden;

                .structure {
                    opacity: 1;
                }

            }

            .longStack {
                min-height: 0 !important;
                margin: 2px !important;
                padding: 2px !important;
            }
        }



    }

    .right {
        padding: 20px;
        font-size: 16px;

        .header {
            font-size: 32px;
            font-weight: 700;

            .area {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .code {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 16px;

                .code-input {
                    :deep(.t-input__inner) {
                        font-size: 20px;
                        font-weight: 700;
                        color: red;
                    }
                }

            }
        }

        .base-info {
            display: flex;
            flex-wrap: wrap;
            align-items: center;

            &>div {
                width: 33.333%;
                /* 或者具体的像素值，例如 300px */
                padding: 20px;
            }

            &>div span {
                font-weight: bold;
            }
        }

        /* .lists {
            padding: 20px 0;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;

            >div {
                height: 50px;
                line-height: 50px;
                font-weight: 700;
                padding-left: 15px;
                margin-bottom: 15px;
                color: #ffffff;
            }

            .pp {
                background: #00ffff;
                color: #000000;
                padding: 0 20px;
                min-width: 420px;
                text-align: center;
            }

            .foil {
                background: #969600;
                color: #ffffff;
            }

            .core {
                background: linear-gradient(to bottom, #969600 15%, #FFFFFF 15% 25%, #ffff00 25% 75%, #FFFFFF 75% 85%, #969600 85% 100%);
                color: #f00;
            }

            .etchedCore {
                background: #ffff00;
                color: #f00;
            }

        } */

        .buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            flex-direction: column;
            width: 400px;
            gap: 20px;
        }

        .active {
            background-color: #f00;
        }

        .tip {
            margin-top: 30px;

            >span {
                color: red;
                font-size: 16px;
                font-weight: bold;
            }
        }
    }
}
</style>