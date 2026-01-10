import _ from 'lodash';
import * as core from '@/core/script/core';
import * as api from '@/core/script/api';
import VtableOptions from '@/core/script/tableOptions';
import dialog from '@/core/script/dialog';
import siyi from '@/core/script/siyi';
import {isNumber} from '@/utils/vars';
import tableSetingComponent from '@/core/component/tableSeting.vue';
import tableExportComponent from '@/core/component/tableExport.vue';
import approveFlowConponent from '@/core/component/approveFlow.vue';

/**
 * VTable表格的共用功能
 */

const prefix = '_enc'  //加密字段后缀
// 过滤器操作符
const filterOperator = {
    equals: '等于',
    notEquals: '不等于',
    greaterThan: '大于',
    lessThan: '小于',
    greaterThanOrEqual: '大于等于',
    lessThanOrEqual: '小于等于',
    between: '介于',
    notBetween: '不介于',
    contains: '包含',
    notContains: '不包含',
    startsWith: '开头是',
    notStartsWith: '开头不是',
    endsWith: '结尾是',
    notEndsWith: '结尾不是',
    checked: '已选中',
    unChecked: '未选中',
    open: '打开',
    close: '关闭',
};

// 过滤器分类
const filterCategory = {
    TEXT: {label: '文本', value: 'text', operators: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'notStartsWith', 'endsWith', 'notEndsWith']},
    NUMBER: {label: '数值', value: 'number', operators: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'between', 'notBetween']},
    COLOR: {label: '颜色', value: 'color', operators: ['equals', 'notEquals']},
    CHECKBOX: {label: '复选框', value: 'checkbox', operators: ['checked', 'unChecked']},
    RADIO: {label: '单选框', value: 'radio', operators: ['checked', 'unChecked']},
    SWITCH: {label: '开关', value: 'switch', operators: ['open', 'close']},
};

/**
 * 表格默认配置
 */
export const defaultConfig = (options = {}) => {
    return {
        id: siyi.nav.id,                //id
        name: siyi.nav.title,           //报表名称
        dom: null,                      //报表挂载的DOM节点
        box: null,                      //容器DOM节点
        table: null,                    //表格实例
        showCheck: false,               //行复选框 false 不显示 radio 强制单选 multiple 强制多选
        checkField: false,              //行复选框单击那一列生效 false 整行  其它就是指定列名
        data: [],                       //原始数据
        autoLoad: true,                 //是否首次自动加载数据
        page: 1,                        //当前页
        pageNum: 100,                   //每页条数
        disablePage: siyi.nav?.query?.disablePage === undefined ? false : siyi.nav.query.disablePage, //禁用分页
        url: '',                        //获取数据的API接口
        query: {},                      //获取数据的API参数
        selectRow: {},                  //当前选择的行
        prveSelectRow: {},              //上一次选择的行
        options: {...VtableOptions, ...options}, //字节表格配置
        columns: [],                    //本地列配置，如果配置了则不使用后端返回的列配置，否则使用后端返回的列配置
        search: {},                     //用于保存搜索默认值
        columnSplit: '_',               //列分割符
        //事件列表
        events: {
            _lists: {}                  //保存监听后的事件实例，每次加载都会自动卸载并重新监听并保存在这里
        },
        rowBeforCallback: undefined,    //行数据处理方法
        colAfterCallback: undefined,    //列数据处理方法
        emptyRow: true,                 //加载空行
        dataFetcher: undefined,         //自定义获取数据接口
        afterLoaded: undefined,         //数据加载完成并渲染完成后回调
        onLoaded: undefined,            //页面加载完成后回调
        getData: () => [],              //获取数据方法
        updateCallback: () => '',       //更新后回调
        getQuery: () => ({}),           //获取条件
        useEncryptionFields: true,      //是否使用加密字段
        useUserTableConfig: true,       //是否使用用户表格配置(有些表格，不需要用户来设置，此项关闭，加密列也无效)
        userConfig: {},                 //后端用户配置，有的则覆盖前端，没有则发请求获取  有两个属性 table为表格配置，encryption为加密字段配置
    }
}


/**
 * 合并表格配置
 * @param tableConfig   表格配置
 * @returns {Promise<*|{}|{}>}
 */
export const mergeConfig = async tableConfig => {
    const uc = tableConfig?.userConfig?.table || await api.getUserConfig(tableConfig.id, 2) || {}              //获取用户配置
    if (tableConfig.defaultPageNum === undefined) tableConfig.defaultPageNum = tableConfig?.pageNum || 9999999     //记录原始每页条数
    tableConfig.pageNum = uc?.pageNum || tableConfig?.pageNum || tableConfig.defaultPageNum                          //每页条数
    tableConfig.options.frozenColCount = uc?.frozenColCount || tableConfig.options.frozenColCount || 0                //左冻列
    tableConfig.options.rightFrozenColCount = uc?.rightFrozenColCount || tableConfig.options.rightFrozenColCount || 0 //右冻列
    tableConfig.search = _.merge({}, tableConfig?.search || {}, uc?.search || {})                 //默认搜索
    uc.columns = uc?.columns || []
    return uc
}


/**
 * 合并表格列配置
 * @param tableConfig 表格配置
 * @param userColumn 用户列配置
 * @returns {Promise<void>}
 */
export const mergeColumn = async (tableConfig, userColumn = []) => {
    const column = []
    //用户配置覆盖默认配置
    userColumn.forEach(ucol => {
        for (const col of tableConfig.options.columns) {
            if (col.field === ucol.field) {
                if (col.encryption === undefined) ucol.encryption = undefined
                column.push(_.merge({}, col, ucol))
                break
            }
        }
    })
    //找到新列
    const oldColumns = []
    userColumn.forEach(col => oldColumns.push(col.field))
    tableConfig.options.columns.forEach(col => !oldColumns.includes(col.field) && column.push(col))
    //获取加密配置
    const encryptionFields = tableConfig?.useEncryptionFields ? (tableConfig?.userConfig?.encryption || await api.getUserConfig(tableConfig.id + prefix, 1) || []) : [];
    //合并加密与聚合
    tableConfig.options.bottomFrozenRowCount = 0
    column.forEach(col => {
        //加密处理
        // if (col.encryption !== undefined) col.encryption = false
        if (encryptionFields.includes(col.field)) col.encryption = true
        // if (col.aggregationType === undefined) col.aggregationType = 'NONE'
        //聚合处理
        aggregation(tableConfig, col)
    })

    tableConfig.options.columns = column
}


/**
 * 聚合处理
 * @param tableConfig 表格配置
 * @param col 列
 */
export const aggregation = (tableConfig, col) => {
    const list = {MAX: '最大值', MIN: '最小值', AVG: '平均值', SUM: '求和', COUNT: '普通统计', ONLYCOUNT: '去重统计'}
    if (col.aggregationType && col.aggregationType !== 'NONE') {
        if (col.aggregation === undefined) col.aggregation = {aggregationType: 'NONE', formatFun: () => ''}
        tableConfig.options.bottomFrozenRowCount = 1
        col.aggregation.aggregationType = col.aggregationType
        col.aggregation.formatFun = value => list[col.aggregationType] + ':' + _.round(value, 4)
        switch (col.aggregationType) {
            case 'COUNT':
                col.aggregation.aggregationType = 'CUSTOM'
                col.aggregation.aggregationFun = data => {
                    let count = 0
                    data.forEach(item => item?.length > 0 && count++)
                    return count
                }
                break
            case 'ONLYCOUNT':
                col.aggregation.aggregationType = 'CUSTOM'
                col.aggregation.aggregationFun = data => {
                    const onlyData = []
                    data.forEach(item => item?.length > 0 && onlyData.push(item))
                    return Array.from(new Set(onlyData)).length
                }
                break
            default :
                break
        }
    }
}


/**
 * 保存配置
 * @param tableConfig 表格配置
 * @returns {Promise<void>}
 */
export const saveConfig = async tableConfig => {
    const columns = []
    const encryption = []
    const encryptionFields = tableConfig?.userConfig?.encryption || await api.getUserConfig(tableConfig.id + prefix, 1)
    tableConfig.options.columns.forEach(col => {
        if (col.field) {
            columns.push({
                field: col.field,
                width: col.width,
                hide: col.hide,
                aggregationType: col.aggregationType
            })
        }
        if (col.encryption === true && !encryptionFields.includes(col.field)) {
            encryption.push({
                title: tableConfig.name,
                name: tableConfig.id + prefix,
                data: {
                    title: col.title,
                    name: col.field,
                }
            })
        }
    })
    const config = {}
    if (columns.length > 0) config.columns = columns //列
    if (tableConfig.page) config.pageNum = tableConfig.disablePage ? 9999999 : tableConfig.pageNum //分页条数
    if (Object.keys(tableConfig.search).length > 0) config.search = tableConfig.search //搜索
    if (tableConfig.options.frozenColCount) config.frozenColCount = tableConfig.options.frozenColCount //左冻列
    if (tableConfig.options.rightFrozenColCount) config.rightFrozenColCount = tableConfig.options.rightFrozenColCount //右冻列
    await api.saveUserConfig(tableConfig.id, config, 2) //保存用户配置
    encryption.length > 0 && await api.authApply({type: 3, data: encryption}) //加密申请
}


/**
 * 重置配置
 * @param tableConfig 表格配置
 * @returns {Promise<void>}
 */
export const resetConfig = async tableConfig => {
    tableConfig.pageNum = tableConfig.defaultPageNum;      //每页条数
    tableConfig.search = {};                               //默认搜索
    tableConfig.options.frozenColCount = 0;                //左冻列
    tableConfig.options.rightFrozenColCount = 0;             //右冻列
    await api.saveUserConfig(tableConfig.id, {}, 2);
}


/**
 * 渲染表格
 * @param tableConfig 表格配置
 * @param emptyRow 是否填充空行
 * @param scrollTo 滚动行
 */
export const update = (tableConfig, emptyRow = true, scrollTo = 0) => {
    const records = [];
    const columns = [];
    const check = tableConfig.showCheck ? {check: {check: false, disable: true}} : {};
    for (let i = 0; i < 100; i++) {
        columns.push({});
        records.push(check);
    }
    tableConfig.selectRow = {};
    tableConfig.options.records = _.merge([], emptyRow ? records : [], tableConfig.options.records);
    tableConfig.options.columns = _.merge([], tableConfig.options.columns.length > 0 ? tableConfig.options.columns : columns);
    tableConfig.table.updateOption(tableConfig.options);
    typeof scrollTo === 'number' && scrollTo >= 0 && tableConfig.table.setScrollTop(scrollTo)
    typeof tableConfig?.updateCallback === 'function' && tableConfig.updateCallback();
}

/**
 * 更新行数据
 * @param tableConfig
 * @param newRows
 * @param pkName
 * @param scrollTo 滚动到n行
 */
export const updateRow = (tableConfig, newRows, pkName = 'id', scrollTo = 0) => {
    if (!Array.isArray(newRows)) newRows = [newRows];
    let row = null;
    for (const newData of newRows) {
        for (const oldRecords of tableConfig.options.records) {
            if (oldRecords?.[pkName] === newData?.[pkName]) {
                row = _.merge(oldRecords, newData);
                break;
            }
        }
        for (const oldData of tableConfig.data) {
            if (oldData?.[pkName] === newData?.[pkName]) {
                _.merge(oldData, newData);
                break;
            }
        }
    }
    update(tableConfig, false, scrollTo);
    return row;
}

/**
 * 添加行
 * @param tableConfig
 * @param newRows
 */
export const addRow = (tableConfig, newRows) => {
    if (!Array.isArray(newRows)) newRows = [newRows];
    tableConfig.options.records = [...newRows, ...tableConfig.options.records];
    tableConfig.data = [...newRows, ...tableConfig.data];
    update(tableConfig);
}

/**
 * 更新排序
 * @param sortState 排序状态
 * @param tableConfig 表格配置
 */
export const updateSortState = (sortState = {field: 'sort', order: 'asc'}, tableConfig) => {
    const field = sortState.field, order = sortState.order === 'desc' ? 'desc' : 'asc';
    tableConfig.options.sortState = [sortState];
    core.data.sortData(tableConfig.options.records, field, order === 'asc');
    update(tableConfig);
}


/**
 * 监听事件
 * @param tableConfig 表格配置
 * @param type 事件类型
 */
export const on = tableConfig => {
    const colNumber = tableConfig.options.rowSeriesNumber ? 1 : 0;

    //自定义排序
    tableConfig.events._lists.sort_click && tableConfig.table.off(tableConfig.events._lists.sort_click);
    tableConfig.events._lists.sort_click = tableConfig.table.on('sort_click', args => {
        let [_text, field] = args.field.split('.');//后端字段配置可能是_text.fieldName形式
        field = field || _text;//得到字段名
        const order = args.order === 'desc' ? 'asc' : 'desc';//排序图标
        core.data.sortData(tableConfig.options.records, field, order === 'asc');//对数据排序
        tableConfig.options.sortState = [{field: args.field, order}];//更改排序状态这里要使用完整字段名
        update(tableConfig);//更新表格
        tableConfig.events.sort_click?.(args);//调用事自定义件配置
        return false; //不执行内部排序逻辑
    })

    //拖拽列宽
    tableConfig.events._lists.resize_column_end && tableConfig.table.off(tableConfig.events._lists.resize_column_end);
    tableConfig.events._lists.resize_column_end = tableConfig.table.on('resize_column_end', args => {
        let colIndex = 0;
        for (const item of tableConfig.options.columns) {
            if (item.hide) continue;
            if (colIndex === args.col - colNumber) {
                item.width = args.colWidths[args.col];
                break;
            }
            colIndex++;
        }
        tableConfig.events.resize_column_end?.(args);
    })


    //拖拽列顺序
    tableConfig.events._lists.change_header_position && tableConfig.table.off(tableConfig.events._lists.change_header_position);
    tableConfig.events._lists.change_header_position = tableConfig.table.on('change_header_position', args => {
        if (args.source.col + args.target.col > 0) {
            let index = 0, targetIndex = 0, moveCol = {};
            for (const i in tableConfig.options.columns) {
                if (tableConfig.options.columns[i].hide) continue;
                if (index === args.source.col - colNumber) moveCol = tableConfig.options.columns.splice(i, 1);
                if (index === args.target.col - colNumber) targetIndex = i;
                index++;
            }
            tableConfig.options.columns.splice(targetIndex, 0, ...moveCol);
        }
        tableConfig.events.change_header_position?.(args);
    })

    //选择复选框
    let defaultEvent = true; //为了修复自带功能没有事件冒泡阻止功能
    tableConfig.events._lists.click_cell && tableConfig.table.off(tableConfig.events._lists.click_cell);
    tableConfig.events._lists.click_cell = tableConfig.table.on('click_cell', args => {
        if (args.originData?.index === undefined) return;
        if (tableConfig.checkField !== false && tableConfig.checkField !== args.field) return;
        tableConfig.prveSelectRow = tableConfig.selectRow;//上一次选择行
        tableConfig.selectRow = args.originData;//当前选择行
        if (tableConfig.showCheck === false) return;

        //去掉选中的 不含当前这一行
        const cancelCheck = () => {
            const checkStatus = tableConfig.table.getCheckboxState('check');//已选
            for (let rowIndex in tableConfig.options.records) {
                rowIndex = parseInt(rowIndex);
                tableConfig.options.records[rowIndex].index && checkStatus[rowIndex] && rowIndex + 1 !== args.row && tableConfig.table.setCellCheckboxState(colNumber, rowIndex + 1, false);
            }
        }

        if (args.cellType === 'checkbox' && tableConfig.table.getCellValue(args.col, args.row)?.disable === false) {
            tableConfig.table.selectCell(args.col, args.row);
            tableConfig.showCheck === 'radio' && cancelCheck();
            if (args.target.name === undefined) defaultEvent = true;//特殊兼容
            defaultEvent && tableConfig.table.setCellCheckboxState(args.col, args.row, !tableConfig.table.getCellCheckboxState(args.col, args.row));//多选反选
            defaultEvent = true;
        } else if (tableConfig.table.getCellValue(colNumber, args.row)?.disable === false) {
            if (tableConfig.showCheck !== 'multiple') cancelCheck();
            tableConfig.table.setCellCheckboxState(colNumber, args.row, !tableConfig.table.getCellCheckboxState(colNumber, args.row));//选中
            defaultEvent = true;
        }

        //选中行的颜色
        tableConfig.table.registerCustomCellStyle('selectRowbg', {bgColor: '#e9f7ff'})
        const checkStatus = tableConfig.table.getCheckboxState('check')//已选
        for (const itme of tableConfig.options.records) {
            itme.index > 0 && tableConfig.table.arrangeCustomCellStyle({
                range: {
                    start: {row: itme.index, col: 0},
                    end: {row: itme.index, col: 9999999}
                }
            }, checkStatus[itme.index - 1] ? 'selectRowbg' : '', true)
        }
        tableConfig.events.click_cell?.(args)//回调
    })


    //改变复选框
    tableConfig.events._lists.checkbox_state_change && tableConfig.table.off(tableConfig.events._lists.checkbox_state_change);
    tableConfig.events._lists.checkbox_state_change = tableConfig.table.on('checkbox_state_change', args => {
        defaultEvent = false;
        tableConfig.events.checkbox_state_change?.(args);
    })


    //注册其它事件
    for (const eventsName in tableConfig.events) {
        if (['_lists', 'sort_click', 'resize_column_end', 'change_header_position', 'click_cell', 'checkbox_state_change'].includes(eventsName)) continue;
        tableConfig.events._lists[eventsName] && tableConfig.table.off(tableConfig.events._lists[eventsName]);
        tableConfig.events._lists[eventsName] = tableConfig.table.on(eventsName, tableConfig.events[eventsName]);
    }
}

/**
 * 生成表格列与行数据，创建表格
 * @param tableConfig 表格配置
 * @param rowBeforCallback 行数据生成前回调
 * @param colAfterCallback 列数据生成后回调
 */
export const createTable = (tableConfig, rowBeforCallback = undefined, colAfterCallback = undefined) => {
    const oldData = [...(tableConfig?.data?.list || tableConfig.data || [])];//行数据(api接口返回的)
    const oldColumns = [...tableConfig.columns];//列配置(模板中定义的)
    let newData = [];//行数据(表格中显示的)
    let newColumns = [];//列配置
    // 列格式化方法
    const columnFormater = (column, index) => {
        const _colAfterCallback = colAfterCallback || (col => col);
        return _colAfterCallback({
            index: index + 1,
            width: 'auto',
            headerIcon: 'filterIcon',
            filterWhere: {},
            showSort: true,//显示排序图标，使用自定义排序
            sort: false,//禁用内置排序
            hide: false,
            //以下是自定义字段
            oldfield: column.field,//原始字段
            disabledSeting: false,//禁止出现表格设置
            disabledExport: false,//禁止导出 正常都导出，隐藏字段不导出
            fieldOptions: {},//字段映射配置，如状态   1：有效果，2：无效
            aggregationType: 'NONE',//聚合
            encryption: undefined, //加密用到的字段
            ...column
        });
    }
    //行格式化方法
    const rowFormater = (row, index) => {
        const _rowBeforCallback = rowBeforCallback || (_row => _row);
        const check = tableConfig.showCheck ? {check: {check: false, disable: false}} : {};
        return _rowBeforCallback({...check, index: index + 1, ...row});
    }
    // 生成列配置
    if (oldColumns.length > 0) {//方式1：模板配置列，则使用模板中的列信息
        newData = oldData.map(rowFormater);
        newColumns = oldColumns.map(columnFormater);
    } else if (oldData.length > 0) {//方式2: 模板未配置，从提取第一条数据的键名生成列配置
        newColumns = createColumns(Object.keys(oldData[0]), tableConfig.columnSplit).map(columnFormater);
        oldData.forEach((row, index) => {
            const _row = {};
            for (const oldfield in row) _row[newColumns.filter(col => col.oldfield === oldfield).map(col => col.field)] = row[oldfield];//数据
            newData.push(rowFormater(_row, index));
        });
    }
    //添加勾选框
    newData.length > 0 && tableConfig.showCheck && newColumns.unshift(columnFormater({
        field: 'check',
        headerType: 'checkbox',
        disable: tableConfig.showCheck === 'radio',
        cellType: 'checkbox',
        dragHeader: false,
        disableColumnResize: true,
        showSort: false,
        width: 50,
        headerStyle: {textAlign: 'center'},
        style: {textAlign: 'center'},
    }, -1));
    // 回写格式化后的数据
    tableConfig.data = [...newData];
    tableConfig.options.records = [...newData];
    tableConfig.options.columns = [...newColumns];
    if (tableConfig.options.rowSeriesNumber) {
        tableConfig.options.rowSeriesNumber.format = (col, row) => (tableConfig.page - 1) * tableConfig.pageNum + row;//行号
    }
    on(tableConfig);//事件
}

/**
 * 创建列配置
 * @param baseColumns 基础列配置
 * @param separator 分隔符
 * @returns {*[]}
 */
export const createColumns = (baseColumns, separator = '#') => {
    const columns = [];
    baseColumns.forEach(oldfield => {
        let column;
        if (typeof oldfield === 'object') {
            column = oldfield;
        } else {
            //从字段名解析列配置,转小写，英文字段名_中文字段名_标识[M加密、H隐藏、D禁止出现表格设置、E禁止导出]
            const [field, title, label] = oldfield.toLowerCase().split(separator);
            column = {field, title, label};
        }
        columns.push({
            oldfield,//原始字段
            ...column,
            field: column['field'],//字段名
            title: (column?.['title'] || column['field']).toUpperCase(),//标题
            hide: column['label']?.indexOf('h') > -1,//隐藏
            disabledSeting: column?.['label']?.indexOf('d') > -1,//禁止出现表格设置
            disabledExport: column?.['label']?.indexOf('e') > -1,//禁止导出 正常都导出，隐藏字段不导出
            encryption: column?.['label']?.indexOf('m') > -1 ? false : undefined, //加密用到的字段
        });
    });
    return columns;
}


/**
 * 状态信息
 * @param tableConfig 表格配置
 * @param startTime 开始时间
 * @returns {string}
 */
export const footerMessage = (tableConfig, startTime) => {
    const s = _.round((Date.now() - startTime) / 1000, 4);
    let str = `${tableConfig.name}，${tableConfig.id}，耗时：${s}s，本页${tableConfig.options.records.filter(row => row.index).length}条`;
    if (!tableConfig.disablePage) str = `${str}，每页${tableConfig.pageNum}条，当前第${tableConfig.page}页`;
    return str;
}


/**
 * 进度条
 * @param reversal
 * @returns {{showBar: boolean, barHeight: string, barBottom: number, barColor: (function(*): string)}}
 */
export const progressbar = (reversal = false) => {
    return {
        showBar: true,
        barHeight: '3',
        barBottom: 0,
        barColor: data => color.greenTored(data.percentile, reversal)
    }
}


/**
 * 生成进度颜色
 * @type {{greenTored(*, boolean=): string}}
 */
export const color = {
    greenTored(percentile, reversal = false) {
        let r = 255
        let g = 255
        if (percentile > 0.5) {
            g = 255 * (1 - percentile) * 2
        } else {
            r = 255 * percentile * 2
        }
        return reversal ? `rgb(${g},${r},0)` : `rgb(${r},${g},0)`
    },
}


/**
 * 表格设置
 * @param opts 参数
 * @returns {false|void}
 */
export const seting = (opts = {}) => {
    if (opts.table.options.columns.filter(col => col?.title).length > 0) {
        dialog.window(tableSetingComponent, {
            table: opts.table,
            menu: opts.menu,
            search: opts.search
        }, {
            title: opts.table.name + '页面设置',
            width: siyi.pc ? 970 : '100%',
            height: siyi.pc ? '80%' : '100%',
            changeSize: false
        })
    }
}

/**
 * 审批
 * @param opts 参数
 * @returns {false|void}
 */
export const approve = (opts = {}) => {
    if (Object.keys(opts.detail.filter(
        d => d?.value !== 'undefined' && d?.value != null && d?.value !== ''
    )).length === 0) {
        dialog.error('请选择要审批的数据！')
        return {};
    }
    const _window = dialog.window(approveFlowConponent, {
        table: opts.table,
        detail: opts.detail,
        close: () => _window.close(0)
    }, {
        title: '审批',
        width: '80%',
        height: '90%',
        top: 'center',
        changeSize: siyi.pc,
        forceEnlarge: siyi.mobile
    })
}

/**
 * 高级导出
 * @param opts 参数
 */
export const exportData = (opts = {}) => {
    dialog.window(tableExportComponent, {
        table: opts.table,
        search: opts.search,
    }, {
        title: opts.table.name + '高级导出',
        width: siyi.pc ? 1070 : '100%',
        height: siyi.pc ? '80%' : '100%',
        changeSize: siyi.pc
    })
}


/**
 * 获取指定行或多行所有列的渲染数据详情
 * @param tableInstance VTable 实例
 * @param {number|number[]} rows 单个行号或行号数组
 * @returns {Array|Array[]}
 *   单行时返回该行列详情数组，
 *   多行时返回多行二维数组，结构如：
 * [
 *   [ {title, colIndex, field, value}, ... ], // 第1行
 *   [ {title, colIndex, field, value}, ... ]  // 第2行
 * ]
 */
// export const getRenderedRows = (tableInstance, rows) => {
//     // 获取单行所有列的渲染数据详情
//     function getRowDetail(rowIndex) {
//         return tableInstance.columns.filter(col => !col.hide).map((col, colIndex) => ({
//             title: col.title || '',
//             colIndex,
//             field: col.field || '',
//             cellType: col.cellType || 'text',
//             hide: col.hide || false,
//             value: tableInstance.getCellValue(colIndex + 1, rowIndex)
//         }));
//     }
//
//     if (Array.isArray(rows)) {
//         // 多行，返回二维数组
//         return rows.map(rowIndex => getRowDetail(rowIndex));
//     }
//     // 单行，返回一维数组
//     return getRowDetail(rows);
// }


/**
 * 获取选中行(点中或勾选)
 * 注意：options.select.outsideClickDeselect  需要设置为 false
 * @param tableConfig
 * @param fields
 * @returns {*[]}
 */
// export const getActiveRecords = (tableConfig, fields = null) => {
//     const rows = getCheckedRecords(tableConfig, fields)
//     return rows.length > 0 ? rows : getSelectedRecords(tableConfig, fields)
// }


/**
 * 获取选中行(点选中)
 * @param tableConfig 表格配置
 * @param fields 字段
 * @returns {*[]}
 * @deprecated 请使用 getCheckedRecords替代，表格已经调整成单击勾选行，所以此方法用处不大，除非取消了单击勾选行事件
 */
/*export const getSelectedRecords = (tableConfig, fields = null) => {
    const data = []
    const checkStatus = {}
    const selectedCells = tableConfig.table.getSelectedCellInfos()
    selectedCells.forEach(cells => checkStatus[cells[0].row - 1] = true)
    fields = fields === null ? [] : fields.split(',')
    tableConfig.options.records.forEach((itme, index) => {
        if (itme?.index && checkStatus[index]) {
            let row = {}
            fields.length > 0 ? fields.forEach(field => row[field] = itme[field]) : row = itme
            data.push(row)
        }
    })
    return data
}*/

/**
 * 获取选中行(勾选状态)
 * @param tableConfig 表格配置
 * @param fields 字段
 * @returns {*[]}
 */
export const getCheckedRecords = (tableConfig, fields = null) => {
    const data = []
    const checkStatus = tableConfig.table.getCheckboxState('check')
    fields = fields === null ? [] : fields.split(',')
    tableConfig.options.records.forEach((itme, index) => {
        if (itme?.index && checkStatus[index]) {
            let row = {}
            fields.length > 0 ? fields.forEach(field => row[field] = itme[field]) : row = itme
            data.push(row)
        }
    })
    return data
}

/**
 * 行列转换显示明细数据
 * @param tableConfig 表格配置
 * @param data 数据
 * @param callback 回调
 * @returns {*[]}
 */
export const detail = (tableConfig, data, callback = '') => {
    const detail = [];
    const getObjectValue = (key, obj) => key.split('.').reduce((acc, k) => acc[k] ?? '', obj); // 获取对象属性值
    for (const col of tableConfig.options.columns) {
        if (col.cellType === 'checkbox' || col.hide === true) continue; //跳过checkbox和隐藏列
        const value = typeof callback === 'function' ? callback(col.field, data) : getObjectValue(col.field, data);
        const row = {
            ...data,//原始数据
            title: col.title,//标题
            value: typeof value === 'object' ? JSON.stringify(value) : String(isNumber(value) ? value * 1 : value),//转换为数字
        }
        row.value = row.value.trim() === 'null' ? '' : row.value.trim()
        detail.push(row)
    }
    return detail
}


//单元格操作
export const cellAction = {
    menu: {
        contextMenuItems: [
            {text: '刷新', menuKey: 'refresh'},
            {text: '清空', menuKey: 'clear'},
            {text: '复制', menuKey: 'copy'},
            {text: '粘贴', menuKey: 'paste'},
        ],
    },
    menuAction: {
        refresh: (e, tableConfig) => {
            tableConfig.table.setRecords([]);
            tableConfig.getData()
        },
        clear: (e, tableConfig) => {
            // 清空单元格
            const selectedCells = tableConfig.table.getSelectedCellInfos();
            selectedCells.forEach(row => {
                row.forEach(cell => {
                    const column = tableConfig.options.columns.find(column => column.field === cell.field);
                    if (cell.dataValue !== '' && cell.dataValue !== null && column?.editor) {
                        tableConfig.table.changeCellValue(cell.col, cell.row, '');
                    }
                })
            })
        },
        copy: async (e, tableConfig) => {
            // 复制单元格
            const selectValue = tableConfig.table.getCopyValue();
            if (selectValue.length < 1) {
                return;
            }
            try {
                await navigator.clipboard.writeText(selectValue);
            } catch (e) {
                dialog.error('复制失败' + e.msg);
            }
        },
        paste: async (e, tableConfig) => {
            // 粘贴单元格
            const copyData = await navigator.clipboard.readText();
            const copyTable = copyData.split(/\r\n|\r|\n/g).map(item => item.split('\t'));
            if (copyTable.length < 1) {
                return;
            }
            const selectedCells = tableConfig.table.getSelectedCellInfos();
            selectedCells.forEach((cells, i) => {
                cells.forEach((cell, j) => {
                    const column = tableConfig.options.columns.find(column => column.field === cell.field);
                    let newValue = '';
                    if (column?.editor) {
                        if (copyTable.length === 1 && copyTable[0].length === 1) {
                            newValue = copyTable[0][0] || '';
                        } else {
                            newValue = copyTable?.[i]?.[j] || ''
                        }
                        tableConfig.table.changeCellValue(cell.col, cell.row, newValue);
                    }
                })
            })
        }
    },
    beforeDrag: {MaxCol: 0, MinCol: 0, MaxRow: 0, MinRow: 0,},// 填充柄之前的选中范围
    sourceValues: [], // 源数据
    bindEvents(tableConfig) {
        const eventHandlers = {
            dropdown_menu_click: (arg, tableConfig) => {
                if (this.menuAction.hasOwnProperty(arg.menuKey)) {
                    this.menuAction[arg.menuKey](arg, tableConfig);
                }
            },
            mousedown_fill_handle: (arg, tableConfig) => {
                const startSelectCellRange = tableConfig.table.getSelectedCellRanges()[0];
                this.beforeDrag.MaxCol = Math.max(startSelectCellRange.start.col, startSelectCellRange.end.col);
                this.beforeDrag.MinCol = Math.min(startSelectCellRange.start.col, startSelectCellRange.end.col);
                this.beforeDrag.MaxRow = Math.max(startSelectCellRange.start.row, startSelectCellRange.end.row);
                this.beforeDrag.MinRow = Math.min(startSelectCellRange.start.row, startSelectCellRange.end.row);

                // 保存源数据用于填充
                this.sourceValues = [];
                for (let row = this.beforeDrag.MinRow; row <= this.beforeDrag.MaxRow; row++) {
                    const rowValues = [];
                    for (let col = this.beforeDrag.MinCol; col <= this.beforeDrag.MaxCol; col++) {
                        rowValues.push(tableConfig.table.getCellValue(col, row));
                    }
                    this.sourceValues.push(rowValues);
                }
            },
            drag_fill_handle_end: (arg, tableConfig) => {
                const direction = arg.direction;
                let startChangeCellCol;
                let startChangeCellRow;
                let endChangeCellCol;
                let endChangeCellRow;
                const endSelectCellRange = tableConfig.table.getSelectedCellRanges()[0];

                // 根据填充方向确定需要填充值的范围
                if (direction === 'bottom') {
                    startChangeCellCol = this.beforeDrag.MinCol;
                    startChangeCellRow = this.beforeDrag.MaxRow + 1;
                    endChangeCellCol = this.beforeDrag.MaxCol;
                    endChangeCellRow = endSelectCellRange.end.row;
                } else if (direction === 'right') {
                    startChangeCellCol = this.beforeDrag.MaxCol + 1;
                    startChangeCellRow = this.beforeDrag.MinRow;
                    endChangeCellCol = endSelectCellRange.end.col;
                    endChangeCellRow = this.beforeDrag.MaxRow;
                } else if (direction === 'top') {
                    startChangeCellCol = this.beforeDrag.MinCol;
                    startChangeCellRow = this.beforeDrag.MinRow - 1;
                    endChangeCellCol = this.beforeDrag.MaxCol;
                    endChangeCellRow = endSelectCellRange.end.row;
                } else if (direction === 'left') {
                    startChangeCellCol = this.beforeDrag.MinCol - 1;
                    startChangeCellRow = this.beforeDrag.MinRow;
                    endChangeCellCol = endSelectCellRange.end.col;
                    endChangeCellRow = this.beforeDrag.MaxRow;
                }
                this.changeTableValues(tableConfig, startChangeCellCol, startChangeCellRow, endChangeCellCol, endChangeCellRow, direction);
            },
        };
        // 绑定所有事件
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            tableConfig.table.on(event, (arg) => handler(arg, tableConfig));
        });
    },


    // 检测序列类型
    detectSequenceType(values) {
        // 检查是否为数字序列
        const isNumberSequence = values.every(v => typeof v === 'number' || (typeof v === 'string' && /^-?\d+$/.test(v)));
        if (isNumberSequence) {
            const numbers = values.map(v => typeof v === 'string' ? parseInt(v) : v);
            const diffs = numbers.slice(1).map((n, i) => n - numbers[i]);
            const isConstantDiff = diffs.every(d => d === diffs[0]);
            return {
                type: isConstantDiff ? 'number' : 'copy',
                values: numbers,
                diff: isConstantDiff ? diffs[0] : 0,
                lastValue: numbers[numbers.length - 1]
            };
        }

        // 检查是否为日期序列
        const isDateSequence = values.every(v => {
            if (typeof v !== 'string') return false;
            const date = new Date(v);
            return !isNaN(date.getTime());
        });
        if (isDateSequence) {
            return {type: 'date'};
        }

        // 检查是否为文本序列（带数字后缀）
        const isTextWithNumber = values.every(v => {
            if (typeof v !== 'string') return false;
            const match = v.match(/^(.+?)(\d+)$/);
            return match !== null;
        });
        if (isTextWithNumber) {
            return {type: 'textWithNumber'};
        }

        return {type: 'copy'};
    },

    // 计算填充值
    calculateFillValue(sourceValue, row, col, startRow, startCol, rowPattern, colPattern, direction) {
        // 获取源数据序列
        // const sourceRow = (row - startRow) % rowPattern;
        // const sourceCol = (col - startCol) % colPattern;
        // const sourceValues = this.sourceValues[sourceRow][sourceCol];

        // 检测序列类型
        const sequenceInfo = this.detectSequenceType([sourceValue]);

        // 计算步数
        const isForward = direction === 'bottom' || direction === 'right';
        const steps = isForward
            ? (row - startRow) / rowPattern + (col - startCol) / colPattern
            : (startRow - row) / rowPattern + (startCol - col) / colPattern;

        // 根据序列类型处理
        switch (sequenceInfo.type) {
            case 'number': {
                const increment = isForward ? 1 : -1;
                const totalSteps = Math.floor(steps);
                // 使用最后一个值作为基准，并加上步数
                return sequenceInfo.lastValue + (increment * (totalSteps + 1));
            }

            case 'date': {
                const date = new Date(sourceValue);
                const increment = isForward ? 1 : -1;
                date.setDate(date.getDate() + (increment * steps));
                return date.toISOString().split('T')[0];
            }

            case 'textWithNumber': {
                const match = sourceValue.match(/^(.+?)(\d+)$/);
                if (match) {
                    const [, prefix, numStr] = match;
                    const numValue = parseInt(numStr);
                    const increment = isForward ? 1 : -1;
                    return `${prefix}${numValue + (increment * steps)}`;
                }
                return sourceValue;
            }

            default:
                return sourceValue;
        }
    },

    // 获取源数据索引
    getSourceIndex(row, col, startRow, startCol, rowPattern, colPattern) {
        return {
            row: (row - startRow) % rowPattern,
            col: (col - startCol) % colPattern
        };
    },

    // 改变表格值
    changeTableValues(tableConfig, startChangeCellCol, startChangeCellRow, endChangeCellCol, endChangeCellRow, direction) {
        const startCol = Math.min(startChangeCellCol, endChangeCellCol);
        const startRow = Math.min(startChangeCellRow, endChangeCellRow);
        const endCol = Math.max(startChangeCellCol, endChangeCellCol);
        const endRow = Math.max(startChangeCellRow, endChangeCellRow);
        const values = [];

        // 计算填充模式
        const rowPattern = this.beforeDrag.MaxRow - this.beforeDrag.MinRow + 1;
        const colPattern = this.beforeDrag.MaxCol - this.beforeDrag.MinCol + 1;

        // 获取源数据序列
        const sourceSequence = [];
        for (let row = this.beforeDrag.MinRow; row <= this.beforeDrag.MaxRow; row++) {
            for (let col = this.beforeDrag.MinCol; col <= this.beforeDrag.MaxCol; col++) {
                sourceSequence.push(tableConfig.table.getCellValue(col, row));
            }
        }

        // 检测序列类型并获取序列信息
        const sequenceInfo = this.detectSequenceType(sourceSequence);
        const isForward = direction === 'bottom' || direction === 'right';
        const increment = isForward ? 1 : -1;

        // 如果是数字序列，计算起始值
        let startValue = sequenceInfo.type === 'number' ? sequenceInfo.lastValue : null;

        for (let row = startRow; row <= endRow; row++) {
            const rowValues = [];
            for (let col = startCol; col <= endCol; col++) {
                // 获取源数据索引
                const {row: sourceRow, col: sourceCol} = this.getSourceIndex(row, col, startRow, startCol, rowPattern, colPattern);

                // 获取源数据
                const sourceValue = this.sourceValues[sourceRow][sourceCol];

                // 计算步数
                const steps = isForward
                    ? (row - startRow) / rowPattern + (col - startCol) / colPattern
                    : (startRow - row) / rowPattern + (startCol - col) / colPattern;
                const totalSteps = Math.floor(steps);

                // 根据序列类型计算新值
                let newValue;
                if (sequenceInfo.type === 'number') {
                    // 对于数字序列，从最后一个值开始递增
                    newValue = startValue + (increment * (totalSteps + 1));
                } else {
                    newValue = this.calculateFillValue(sourceValue, row, col, startRow, startCol, rowPattern, colPattern, direction);
                }

                rowValues.push(newValue);
            }
            values.push(rowValues);
        }
        try {
            tableConfig.table.changeCellValues(startCol, startRow, values);
        } catch (error) {
            console.error('填充数据时发生错误:', error);
        }
    }
}