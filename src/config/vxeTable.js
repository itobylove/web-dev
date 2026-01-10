import {getUserConfig, saveUserConfig} from "@/core/script/api.js";

export const gridOptions = {
    id: 'grid001',//ID
    size: 'mini', //大小
    height: 'auto', //高度
    minHeight: '100%',//最小高度
    maxHeight: '100%', //最大高度
    border: true, //边框
    stripe: true, //斑马线条纹
    round: true,//圆色
    align: 'center', //对齐
    showOverflow: true, //当内容过长时显示为省略号
    showHeaderOverflow: true, //当表头内容过长时显示为省略号
    // showFooter: showFooter,
    // footerMethod: () => footerData,
    columnConfig: {
        resizable: true,//拖动列宽
        useKey: true,
        // minWidth:500,（不能设置固定，否则拖动改变列宽时出现问题）
    },
    rowConfig: {
        useKey: true,
        isHover: true,//鼠标滑过行高亮
    },
    sortConfig: {
        trigger: 'cell',
    },
    scrollY: {
        enabled: true,//横向虚拟滚动配置（不支持展开行）
        gt: 0,
    },
    scrollX: {
        enabled: true,//纵向虚拟滚动配置（不支持展开行）
        gt: 0,
    },
    mouseConfig: {
        selected: true, //鼠标选中单元格
    },
    keyboardConfig: {
        isArrow: true, //启用键盘事件
        isEnter: true, //回车键
        isTab: true, //TAB键
        enterToTab: true, //回车键转TAB键
    },
    toolbarConfig: {
        slots: {
            buttons: 'toolbar_buttons'
        },
        custom: true, //是否启用列配置器（临时启用，等迁移后再关闭）
    },
    customConfig: {
        allowVisible: true,
        allowFixed: true,
        allowResizable: true,
        allowSort: true,
        storage: true,
        immediate: true,
        restoreStore ({ id }) {
            return getUserConfig('vxe-grid-'+id, 2);
        },
        updateStore ({ id, storeData }) {
            return saveUserConfig('vxe-grid-'+id,storeData, 2);
        }
    },//列配置器，是否保存数据
}




