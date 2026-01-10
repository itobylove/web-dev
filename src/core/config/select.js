import * as api from '@/core/script/api.js'
import apiUrl from '@/core/config/url.js'
import {url} from "@/core/script/api.js";
import {moTypeOptions,woStatusOptions} from "@/core/config/const.js";
const lists = {
    /*公司*/
    company: [
        {label: '湖北龙腾', value: 1},
        {label: '深圳龙腾', value: 4},
        {label: '珠海龙昌', value: 5},
    ],
    /*工厂*/
    factory: [
        {label: '湖北龙腾', value: 1},
        {label: '深圳龙腾', value: 4},
        {label: '珠海龙昌', value: 6},
    ],
    //外协类型
    poType: [
        {label: '全制程', value: 'SO'},
        {label: '工单', value: 'WO'},
    ],
    // 投产类型
    moType:moTypeOptions,
    // 工单状态
    woStatus:woStatusOptions,
}

export const get = async obj => {
    const result = {}
    for (const type in obj) {
        if (lists[type]) {
            result[type] = lists[type]
            delete obj[type]
        }
    }
    return Object.keys(obj).length === 0 ? result : {...result, ...await api.post(apiUrl.common.selector, obj)}
}


export const getOptions = async (type, keyword, params = {}) => {
    if (lists?.[type]) {
        return lists[type]
    }
    return await api.post(url.common.selector, {type, keyword, ...params});
}

