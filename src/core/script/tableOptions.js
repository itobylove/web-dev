import {register, themes, TYPES} from '@visactor/vtable';
import {DateInputEditor, InputEditor, ListEditor, TextAreaEditor} from '@visactor/vtable-editors';
// import {FilterPlugin} from '@visactor/vtable-plugins';

const filter = {
    type: 'svg',
    width: 20,
    height: 20,
    marginRight: 0,
    positionType: TYPES.IconPosition.right,
    cursor: 'pointer',
    hover: {bgColor: '#d3dbe5'},
    visibleTime: 'always',
};
register.icon('filter', {
    ...filter,
    ...{
        name: 'filter',
        // interactive: true,//是否可交互
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="color: #979fa9"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>'
    }
});
register.icon('filtering', {
    ...filter,
    ...{
        name: 'filtering',
        // interactive: true,//是否可交互
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="color: #416eff"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>'
    }
});
register.editor('inputEditor', new InputEditor());
register.editor('textAreaEditor', new TextAreaEditor());
register.editor('dateEditor', new DateInputEditor());
register.editor('listEditor', new ListEditor({values: ['女', '男']}));

// 创建筛选插件
// const filterPlugin = new FilterPlugin({});

//默认空行
const records = [];
//默认空列
const columns = [];
for (let i = 0; i < 100; i++) {
    columns.push({});
    records.push({});
}

export default {
    // plugins: [filterPlugin],
    //以下原始配置，原生框架的配置
    //主题
    theme: themes.DEFAULT.extends({
        cellInnerBorder: false,
        //画布样式
        frameStyle: {
            borderColor: '#c9d0da',
            borderLineWidth: 1,
        },
        //表头样式
        headerStyle: {
            fontSize: 12,
            color: '#000',
            bgColor: '#f3f4f7',
            hover: {cellBgColor: '#e6e8f0'}
        },
        //表体样式
        bodyStyle: {
            fontSize: 12,
            color: '#000',
            hover: {cellBgColor: '#e6e8f0'}
        },
        //选中样式
        selectionStyle: {
            cellBorderLineWidth: [1, 1, 1, 1],
            cellBorderColor: '#35a1fd',
            // cellBgColor: 'rgba(0,0,0,0.1)'
        },
    }),
    records,
    columns,
    // showHeader:false,
    //自动行高
    // heightMode:'autoHeight',
    //自动换行
    // autoWrapText:true,
    // searchType: 'remote',
    // searchData: [],
    frozenColCount: 0,//左冻结列
    rightFrozenColCount: 0,//右冻结列
    bottomFrozenRowCount: 0,//表尾统计栏
    rowSeriesNumber: {
        title: '#',
        disableColumnResize: true,
        headerStyle: {textAlign: 'center', fontSize: 12, color: '#000000', bgColor: '#f3f4f7'},
        style: {textAlign: 'center'}
    },
    autoFillWidth: true, //自动列宽
    defaultRowHeight: 30, //默认行高
    dragHeaderMode: 'all', //移动表头位置
    rowResizeMode: 'none', //禁用拖动行高
    columnResizeMode: 'header', //拖动列宽模式
    select: {
        blankAreaClickDeselect: true,//点击空白区域是否取消选中。
        outsideClickDeselect: true,//点击外部区域是否取消选中。
        disableHeaderSelect: true,//单独设置表头不响应鼠标 select 交互。
        // disableSelect:true,//禁用选择
    },
    editCellTrigger: 'click',//单元格编辑触发方式
    keyboardOptions: {
        copySelected: true, //复制
        pasteValueToCell: true, //粘贴
    },
    // editor: '',// 配置一个空的编辑器，以遍能粘贴到单元格中
    // excelOptions: {
    //     fillHandle: true // 允许使用表格编辑器填充数据
    // }
    // tooltip: {
    //     renderMode: 'html',//渲染模式
    // },
    // hover: {
    //     highlightMode: 'cross'
    //     // enableSingleHighlight: false,
    // },
    // filterData: {
    //     keyWord: {},
    //     search() {
    //     }
    // }
}