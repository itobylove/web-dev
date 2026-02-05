import _ from "lodash";
import dayjs from "dayjs";
import siyi from "@/core/script/siyi.js";
import * as core from "@/core/script/core.js";
import * as listTableFn from "@/core/script/tableFn.js";
import * as select from '@/core/config/select.js'
import * as api from "@/core/script/api.js";

//搜索列表默认配置 数组中为对象，一个对象为一个控件，options:腾讯所支持的属于，on:腾讯所支持事件，style:每个组件的style名为可以独立设置CSS，value为控件值
const loadData = async (obj, searchObj) => {
    const res = await select.get(obj)
    for (const key in res) {
        searchObj.searchList.forEach(item => {
            if (item.load === key) {
                const options = [{label: '全部', checkAll: true},...res[key]];
                if (item.type === 'tree') {
                    item.options.data = options
                } else {
                    item.options.options = options
                }
            }
        })
    }
}

//右侧本地过滤初始化
export const loadFilter = (props, searchObj) => {
    if (typeof props.filter === 'object' && typeof props.table === 'object') {
        //本地过滤默认配置
        const defaultConfig = {
            field: '',
            fieldStyle: {width: '110px'},
            fieldOptions: {options: [], clearable: true, filterable: true},
            fieldChange: () => {
                searchObj.localFilter.value = ''
                dataFilter(props, searchObj)
            },
            value: '',
            valueStyle: {width: '220px'},
            valueOptions: {clearable: true, placeholder: '快速过滤'},
            valueChange: () => dataFilter(props, searchObj)
        }
        //手端专用
        if (siyi.mobile) {
            _.merge(defaultConfig, {
                fieldChange: (value, context) => {
                    if (value[0] === '') {
                        searchObj.localFilter.field = ''
                        searchObj.localFilter.valueOptions.placeholder = '快速过滤'
                    } else {
                        const item = searchObj.localFilter.fieldOptions.options[context.index];
                        searchObj.localFilter.field = item.value
                        searchObj.localFilter.valueOptions.placeholder = item.label
                    }
                    searchObj.localFilter.value = ''
                    dataFilter(props, searchObj)
                },
            })
        }
        searchObj.localFilter = _.merge({}, defaultConfig, props.filter)//合并配置
        searchObj.localFilter.fieldOptions.options = siyi.pc ? [] : [{label: '全部', value: ''}]
        props.table.options.columns.forEach(col => {
            col.hide === false && col.cellType !== 'checkbox' && searchObj.localFilter.fieldOptions.options.push({label: col.title, value: col.field})
        })
    }
}

//搜索列表初始化
export const loadSearch = async (props, searchObj) => {
    //搜索默认配置
    const defaultConfig = {
        input: {
            filter: false, //true 本地过滤  false 远端搜索
            type: 'input', //类型
            field: '',     //字段
            style: {},     //样式
            value: '',     //值
            save: true,    //是否允许保存配置
            onChange: () => true, //事件
            onEnter: () => true,  //事件
            options: {clearable: true}, //腾讯选项配置
        },
        select: {
            filter: false,
            filterValueType: 'label',//选项的值是label字段 还是value字段去过滤，
            selectLabe: [],//手机端专用选择中的我下拉选项
            input: '',//当前输入的值
            type: 'select',
            field: '',
            style: {},
            value: '',//单选是字符串，多选是数组
            save: true,//是否允许保存配置
            onChange: () => true,  //事件
            onEnter: () => true, //事件
            onSearch: () => true, //事件
            options: {
                clearable: true,//清除
                filterable: true,//过滤
                multiple: true,//多选
                minCollapsedNum: 1,//显示数量
                options: [],//选项
                reserveKeyword:true,//保留关键字
            },
            load: '', //后端加载来源
            remote: false, //输入时后向后端获取列表值
        },
        tree: {
            filter: false,
            filterValueType: 'label',//选项的值是label字段 还是value字段去过滤，
            selectLabe: [],//手机端专用选择中的我下拉选项
            input: '',//当前输入的值
            type: 'select',
            field: '',
            style: {},
            value: '',//单选是字符串，多选是数组
            save: true,//是否允许保存配置
            onChange: () => true,  //事件
            onEnter: () => true, //事件
            onSearch: () => true, //事件
            options: {
                clearable: true,//清除
                filterable: true,//过滤
                multiple: true,//多选
                minCollapsedNum: 1,//显示数量
                options: [],//选项
            },
            load: '', //后端加载来源
            remote: false, //输入时后向后端获取列表值
        },
        switch: {
            filter: false,
            filterValueType: 'label',//选项的值是label字段 还是value字段去过滤，
            type: 'switch',
            field: '',
            style: {},
            value: 0,
            save: true,//是否允许保存配置
            onChange: () => true, //事件
            options: {
                placeholder: '标题',
                label: ['开', '关'],
                customValue: [1, 0],
                size: 'large',
            },
        },
        radio: {
            filter: false,
            filterValueType: 'label',//选项的值是label字段 还是value字段去过滤，
            type: 'radio',
            field: '',
            style: {},
            value: '',
            save: true,//是否允许保存配置
            onChange: () => true, //事件
            options: {
                theme: 'button',//按钮样式
                variant: 'primary-filled',//样式
                options: [],//选项
            },
            load: '', //后端加载来源
            remote: false, //输入时后向后端获取列表值
        },
        time: {
            filter: false,
            type: 'time',
            field: '',
            style: {},
            value: '',
            onChange: () => true, //事件
            onEnter: () => true, //事件
            options: {
                clearable: true,//清除
                enableTimePicker: true,//启用时间点
                presetsPlacement: 'top',//显示位置
                presets: core.date.list().startMonth,
            },
        },
        rangeTime: {
            filter: false,
            type: 'rangeTime',
            field: '',
            style: {},
            value: [],
            onChange: () => true, //事件
            onEnter: () => true, //事件
            options: {
                clearable: true,
                enableTimePicker: true,
                presetsPlacement: 'top',
                presets: core.date.list().month,
            },
            maxTime: 0, //最大时间范围秒
        },
        date: {
            filter: false,
            type: 'date',
            field: '',
            style: {},
            value: '',
            onChange: () => true, //事件
            onEnter: () => true, //事件
            options: {
                clearable: true,
                presetsPlacement: '',//显示位置
            }
        },
        rangeDate: {
            filter: false,
            type: 'rangeDate',
            field: '',
            style: {},
            value: [],
            onChange: () => true, //事件
            onEnter: () => true, //事件
            options: {
                clearable: true,
                presetsPlacement: 'top',
                presets: core.date.list().month,
            },
            maxTime: 0, //最大时间范围秒
        },
        month: {
            filter: false,
            type: 'month',
            field: '',
            style: {},
            value: '',
            onChange: () => true, //事件
            onEnter: () => true, //事件
            options: {
                clearable: true,
                mode: 'month',
                presetsPlacement: '',//显示位置
            }
        },
        rangeMonth: {
            filter: false,
            type: 'rangeMonth',
            field: '',
            style: {},
            value: '',
            onChange: () => true, //事件
            onEnter: () => true, //事件
            options: {
                clearable: true,
                mode: 'month',
                presetsPlacement: 'top',//显示位置
                presets: core.date.list().month,
            },
            maxTime: 0, //最大时间范围秒
        },
    }

    //1.合并默认配置
    const searchData = [...props.search]
    searchData.forEach((item, index) => {
        const _item = _.merge({}, defaultConfig[item.type], item)
        if (item?.options?.presets) {
            _item.options.presets = {...item.options.presets};
        }
        _item.options?.presets === false && delete _item.options.presets
        _item.enter = () => _item.onEnter() && _item.filter === false && props.table?.getData() //回车搜索
        _item.change = value => _item.onChange(value) && _item.filter === true && dataFilter(props, searchObj)  //改变值后过滤
        //如果是远程加载下拉框架时
        if (['select', 'tree'].includes(_item.type) && _item.load && _item.remote === true) {
            _item.search = value => {
                if (_item.onSearch(value)) {
                    loadData({[_item.load]: {keyword: value}}, searchObj);
                }
            }
        }
        searchData[index] = _item
    })
    searchObj.searchList = searchData //写入搜索项目
    //2.获取用户保存的默认值
    let res = {}
    if (typeof props.table === 'object') res = props.table?.userConfig?.table || await api.getUserConfig(props.table.id, 2)
    let load = false
    searchObj.searchList.forEach(item => {
        //3.加载4种类型的默认值
        for (const field in res.search) {
            if (['input', 'select', 'switch', 'radio'].includes(item.type) && item.field === field) item.value = res.search[field]
        }
        //4.准备3种下拉框
        if (['select', 'switch', 'radio', 'tree'].includes(item.type) && item.load) {
            if (load === false) load = {}
            if (item.remote === false) load[item.load] = {}//一次加载下拉列表，然后本地用
            if (item.remote === true && (Array.isArray(item.value) ? item.value.length > 0 : item.value !== '')) load[item.load] = {value: item.value}//加载远端列表
        }
    })
    //5.加载数据
    props.table?.autoLoad === true && props.table.getData()
    //6.加载默认列表
    load !== false && await loadData(load, searchObj)
    searchObj.searchList.forEach(item => {
        if (item.type === 'select') {
            item.options.optionsDefault = [...item.options.options]//备份用于过滤还原
            item.selectLabe = item.options.multiple ? item.options.options.filter(opts => item.value.includes(opts.value)) : item.options.options.filter(opts => opts.value === item.value)
        }
    })
}


//数据过滤
export const dataFilter = (props, searchObj) => {
    if (props.table?.data?.length > 0) {
        const type = {
            input: {type: 'string', operator: '%'}, //模糊匹配
            select: {type: 'string', operator: 'in'},//精确匹配
            tree: {type: 'string', operator: 'in'},//精确匹配
            time: {type: 'time', operator: '='},//时间等于
            rangeTime: {type: 'time', operator: '-'},//时间范围
            date: {type: 'date', operator: '='},//日期等于
            rangeDate: {type: 'date', operator: '-'},//日期范围
            month: {type: 'string', operator: '='},//月份等于
            rangeMonth: {type: 'string', operator: '-'},//月份范围
            switch: {type: 'string', operator: '='},//开关等于
            radio: {type: 'string', operator: '='},//单选等于
        }
        let data = [...props.table.data] //数据源
        let keyword = false//搜索关键字

        //左边搜索条件
        for (const item of searchObj.searchList) {
            if (item.filter === false) {
                continue
            }

            keyword = item.value //值
            //如果是下拉选择
            if (item.type === 'select' || item.type === 'tree') {
                const value = item.options.multiple ? (item.value || []) : [item.value] //转换成数组
                //如果是要以标题去过滤就循环找到标题当作值
                keyword = value.join(',')
                if (item.filterValueType === 'label') {
                    keyword = []
                    value.forEach(val => {
                        for (const list of item.options.options) {
                            if (list.value === val) {
                                keyword.push(list.label)
                                break
                            }
                        }
                    })
                    keyword = keyword.join(',')
                }
            }

            //如果是单选
            if (item.type === 'radio') {
                for (const list of item.options.options) {
                    if (list.value === keyword) {
                        keyword = item.filterValueType === 'label'?list.label:list.value
                        break
                    }
                }
            }

            //如果是时间范围
            if (['rangeTime', 'rangeDate', 'rangeMonth'].includes(item.type)) keyword = keyword.join(',')

            //过滤
            data = core.data.search({
                data,
                keyword,
                operator: type[item.type]?.operator,
                columns: item.field ? [{type: type[item.type].type, field: item.field}] : []
            })
        }

        //右边的过滤条件
        data = core.data.search({
            data,
            keyword: searchObj.localFilter.value,
            columns: searchObj.localFilter.field ? [{type: 'string', field: searchObj.localFilter.field}] : []
        })

        //最后过滤
        props.table.options.records = data
        listTableFn.update(props.table)
        props.filterCallBack()
    }
}

//还原默认条件
export const clearWhere = (props, searchObj) => {
    searchObj.searchList.forEach(item => {
        if (item.type === 'input') {
            item.value = ''
        } else if (item.type === 'select' || item.type === 'tree') {
            item.value = item.options.multiple ? [] : ''
        }
    })
    dataFilter(props, searchObj)
}


//清空快速过滤
export const clearLocalFilter = (props, searchObj) => {
    if (typeof props.filter === 'object') {
        searchObj.localFilter.field = ''
        searchObj.localFilter.value = ''
        searchObj.localFilter.valueChange()
    }
}


//检查时间范围
export const checkRangeTime = searchObj => {
    for (const item of searchObj.searchList) {
        if (['rangeTime', 'rangeDate', 'rangeMonth'].includes(item.type)) {
            const time = dayjs(item.value[1]).diff(dayjs(item.value[0]), 'seconds')
            if (item.maxTime > 0 && time > item.maxTime) return item.maxTime / 60 / 60 / 24  //天
        }
    }
}


/**
 * 获取搜索值
 * @param props
 * @param searchObj
 * @param type 保存配置或者搜索
 */
export const get = (props, searchObj, type = 'remote') => {
    const saveConfig = {}//保存配置
    //搜索条件
    const searchConfig = {
        page: props.table?.page || 1,
        pageNum: props.table?.disablePage ? 9999999 : props.table?.pageNum || 9999999,
        user: siyi.user.link?.employee?.value,
    }
    for (const item of searchObj.searchList) {
        if (['input', 'switch', 'radio'].includes(item.type)) {
            if (item.save) saveConfig[item.field] = item.value
            if (item.filter === false) searchConfig[item.field] = item.value
            continue
        }
        if (item.type === 'select' || item.type === 'tree') {
            if (item.save) saveConfig[item.field] = item.value  //保存配置：单选是字符串，多选是数组
            if (item.filter === false) searchConfig[item.field] = (item.value === '' || Array.isArray(item.value) && item.value.length === 0) ? '' : item.value
            continue
        }
        if (['time', 'date', 'month'].includes(item.type) && item.filter === false) {
            searchConfig[item.field] = item.value
            continue
        }
        if (['rangeTime', 'rangeDate', 'rangeMonth'].includes(item.type) && item.filter === false) {
            searchConfig[item.field + '1'] = item.value[0] || ''
            searchConfig[item.field + '2'] = item.value[1] || ''
        }
    }
    return type === 'remote' ? searchConfig : saveConfig
}

/**
 * 更新搜索项的选项
 * @param field 搜索的字段名
 * @param value 配置值
 * @param key 配置项
 * @param searchObj
 */
export const updateSearchItem = (field, value, key = 'options', searchObj) => {
    for (const item of searchObj.searchList) {
        if (item.field === field) {
            // value ===null 时，删除属性
            if (value===null){
                delete item[key];
                break;
            }
            if (typeof value === 'object') {
                item[key] = _.mergeWith({}, item[key], value, (objValue, srcValue) => {
                    if (Array.isArray(objValue) || Array.isArray(srcValue)) return srcValue
                })
            } else {
                item[key] = value
            }
            break
        }
    }
}