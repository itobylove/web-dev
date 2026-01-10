import siyi from '@/core/script/siyi.js'

//工厂列表
export const plantList = [
    {value: 1, label: '湖北龙腾', company_id: 1, en: 'hb'},
    {value: 4, label: '深圳龙腾', company_id: 4, en: 'sz'},
    {value: 6, label: '珠海龙昌', company_id: 5, en: 'zh'},
];

//公司列表
export const companyList = [
    {value: 1, label: '湖北龙腾', plant_ids: [1], en: 'hb'},
    {value: 4, label: '深圳龙腾', plant_ids: [4], en: 'sz'},
    {value: 5, label: '珠海龙昌', plant_ids: [6], en: 'zh'},
];


// 获取单个工厂信息
export const getPlant = (plant_id, field = 'label') => {
    const plant = plantList.find(item => item.value === parseInt(plant_id));
    return typeof field === 'string' ? (plant?.[field] || '') : plant;
}


// 用户的工厂列表
export const getUserPlantList = (node) => {
    const isAdmin = siyi.user.administrator || false;
    const userPermissions = siyi.user.permissions || [];
    if (isAdmin || !userPermissions.includes(node + 'on')) {
        return plantList;
    }
    return plantList.filter(item => userPermissions.includes(node + item.en));
}


//获取公司信息
export const getCompany = (company_id, field = 'title') => {
    const company = companyList.find(item => item.value === parseInt(company_id));
    return typeof field === 'string' ? (company?.[field] || '') : company;
}

// 解析生产编号
export const  parseJobSn=(jobSn, field = null)=>{
    // 将输入字符串转换为大写并去除两端空格
    jobSn = jobSn.trim().toUpperCase();
    // 定义正则表达式
    // @factory_code(1) + @G_ROHS(1) + @customer_code(4) + @P_S(1) + @layer(2) + @idfcode(1)_+ @flow_no(7) + @ver(2);
    const prep = /^(?<P>[A-Z]{0,1})(?<R>[A-Z]{1})(?<C>[0-9]{4})(?<M>[A-Z]{1})(?<L>[0-9]{2})(?<G>[A-Z]{1})(?<N>[0-9]{7})(?<V>[0-9A-Z]{0,2})$/i;
    // 匹配正则表达式
    const match = jobSn.match(prep)?.groups || {};
    // 映射表
    const companyIdCode = { B: 1, A: 4, C: 5 };
    const plantIdCode = { B: 1, A: 4, C: 6 };
    // 解析结果
    const result = {
        partNum: match.N ? `${match.P || ''}${match.R || ''}${match.C || ''}${match.M || ''}${match.L || ''}${match.G || ''}${match.N || ''}` : '',
        partRev: match.V || '',
        plantCode: match.P || '',
        M: match.M || '',
        plantId: match.P ? (plantIdCode[match.P] || 0) : 0,
        companyId: match.P ? (companyIdCode[match.P] || 0) : 0,
        customerCode: match.C || '',
        sn: match.N || '',
        layer: match.L || '',
    };
    // 返回指定字段或整个结果对象
    return field === null ? result : result[field] || '';
}
