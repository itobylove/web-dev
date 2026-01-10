
/**
 * 判断变量是否为空
 * @param {*} value - 需要判断的变量
 * @param {Array} ignoreValue - 需要忽略的值数组
 * @param {Object} customCheckers - 自定义类型检查器
 * @returns {boolean} - 是否为空
 */
export const isEmpty = (value, ignoreValue = [], customCheckers = {}) => {
    // 检查忽略值
    if (ignoreValue.includes(value)) {
        return false;
    }

    // 基础空值检查
    if (value === null || value === undefined) {
        return true;
    }

    // 类型检查器
    const checkers = {
        string: val => val.trim().length === 0,
        number: val => val === 0 || Number.isNaN(val),
        boolean: val => val === false,
        object: val => {
            if (Array.isArray(val)) return val.length === 0;
            if (val instanceof Date) return val.getTime() === 0;
            if (val instanceof Map || val instanceof Set) return val.size === 0;
            return Object.keys(val).length === 0;
        },
        ...customCheckers
    };

    const type = typeof value;
    const checker = checkers[type];

    return checker ? checker(value) : false;
};
// 判断变量是否为数字
export const isNumber = (str) => {
    if (typeof str === 'number') {
        return true
    }
    if (typeof str !== 'string') {
        return false
    }
    // 正则表达式匹配，支持整数、小数以及以小数点开头的数字
    return /^-?(\d+(\.\d+)?|\.\d+)$/.test(str.trim());
}

/**
 * 判断是否为Vue组件
 * @param val
 * @returns {boolean}
 */
export function isVueComponent(val) {
    return val && (typeof val === 'object') &&
        (typeof val.render === 'function' || typeof val.template === 'string');
}



/**
 * 字符串转数字
 * @param {*} str
 * @param {*} defaultValue
 * @returns {number}
 */
export const parseNumber = (str, defaultValue = NaN) => {
    if (/^[-+]?[0-9]*\.?[0-9]+%$/.test(str)) {
        //百分数转小数
        return parseFloat(str.replace('%', '')) / 100
    }
    return isNumber(str) ? Number(str) : defaultValue
}
/**
 * 对象转数组 转select的option标签
 * @param options  对象 { value1: 'label1', value2: 'label2',} 或一维数组 ['label1', 'label2']
 * @param labelKey label字段
 * @param valueKey value字段
 * @returns {*[]} select的option标签 [{label: 'label1', value: 'value1'}, {label: 'label2', value: 'value2'}]
 */
export const getOptionLabel = (options, labelKey, valueKey) => {
    if (typeof options === 'string') options = options.split(',')

    const opt = []
    const isFn = fn => typeof fn === 'function'

    for (const key in options) {
        const item = options[key];
        if (typeof item === 'string' || typeof item === 'number') {
            opt.push({ label: item, value: parseNumber(key, key) })
            continue
        }
        const label = isFn(labelKey) ? labelKey(key, item)
            : (labelKey && item?.[labelKey]) ?? item?.label ?? item?.name ?? String(item)
        const value = isFn(valueKey) ? valueKey(key, item)
            : (valueKey && item?.[valueKey]) ?? (item?.value ?? item?.id ?? item?.recId ?? key)
        opt.push({ value:parseNumber(value,value), label, data: {...item} })
    }
    return opt
}

/**
 *  多个对象转对象数组 转select的option标签 (批量)
 * @param list {Object} 键值对数组 { key1: {value1: 'label1', value2: 'label2'},key2:['label1', 'label2']}
 * @param labelKey label字段
 * @param valueKey value字段
 * @returns {*}
 */
export const getOptionsLabel = (list,labelKey,valueKey) => {
    let res = {}
    for (let key in list) {
        res[key] = getOptionLabel(list[key],labelKey,valueKey)
    }
    return res
}

/**
 *  多组键值对对象 转select的option标签 (批量)
 *  <code>
 *      {list:{"status":["停用","正常"]}} = >
 *  </code>
 * @param list {Object} 键值对数组 { key1: {value1: 'label1', value2: 'label2'},key2:['label1', 'label2']}
 * @returns {*}
 */
export const getAllOptionLabel = (list) => {
    let res = {}
    for (let key in list) {
        res[key] = getOptionsLabel(list[key])
    }
    return res
}


/**
 * 数组转对象 select的option转键值对
 * @param list
 * @param fields
 * @returns {{}}
 */
export const getOptionsMap = (list, fields) => {
    let res = {}
    for (let key in list) {
        const field = typeof fields === 'string' ? fields : fields[key];
        res[key] = _.keyBy(list[key], field)
    }
    return res
}

/**
 * 数组转对象 select的option转键值对
 * @param options
 * @param key_field key字段
 * @param value_field value字段
 * @returns {{}}
 */
export const getOptionMap = (options, key_field='value',value_field='label') => {
    let res = {}
    options.forEach(item => {
        res[item[key_field]] = item[value_field]
    })
    return res
}


/**
 * list转分组
 * @param list
 * @param group_field
 * @returns {{group: *, children: *}[]}
 */
export const list2Group = (list, group_field='category') => {
    const map = {};

    list.forEach(item => {
        const group = item?.[group_field] || item?.['data']?.[group_field] || '默认分组';
        if (!map[group]) map[group] = [];
        map[group].push({ label: item.label, value: item.value });
    });

    return Object.keys(map).map(g => ({
        group: g,
        children: map[g]
    }));
};











//对比类型
export const compareType = {
    '>': '>',
    '<': '<',
    '=': "=",
    '>=': ">=",
    '<=': "<=",
    'like': 'like',
    'in': "in",
    '^': '以...开头',
    '$': '以...结尾',
    'not like': 'not like',
    'not in': "not in",
    '!^': '不以...开头',
    '!$': '不以...结尾',
}

//对比值
export const compareValues = (value1, operator, value2, strict = false) => {
    switch (operator) {
        case '>':
            return value1 > value2
        case '<':
            return value1 < value2
        case '=':
            return strict ? value1 === value2 : parseNumber(value1, value1) === parseNumber(value2, value2)
        case '>=':
            return value1 >= value2
        case '<=':
            return value1 <= value2
        case 'like':
            return value2.indexOf(value1) > -1
        case 'not like':
            return value2.indexOf(value1) === -1
        case 'in':
            return value2.includes(value1)
        case 'not in':
            return !value2.includes(value1)
        case '^':
            return value1.startsWith(value2)
        case '!^':
            return !value1.startsWith(value2)
        case '$':
            return value1.endsWith(value2)
        case '!$':
            return !value1.endsWith(value2)
        default:
            return false
    }
}

// 把数字转换为EXCEL 列名
export const getExcelColumn=(columnNumber)=>{
    if (columnNumber <= 0) return '';
    let columnName = '';
    while (columnNumber > 0) {
        columnNumber--; // 减 1 是因为 Excel 列号从 1 开始
        const currentChar = String.fromCharCode((columnNumber % 26) + 65);// 计算当前列对应的字母
        columnName = currentChar + columnName;
        columnNumber = Math.floor(columnNumber / 26); // 更新列号，处理下一位
    }
    return columnName;
}

/**
 * 将列表转换为树形结构
 * @param {Array} list 列表数据
 * @param {Object} options 配置选项
 * @returns {Array} 树形结构
 */
export const listToTree = (list, options = {}) => {
    const {
        idKey = 'id',
        pidKey = 'pid',
        childKey = 'children',
        labelKey = 'label',
        valueKey = 'value',
        rootId = 0
    } = options;

    const nodeMap = new Map();   // 存储 id => 节点
    const tree = [];

    // 先拷贝每个节点，初始化 children，避免修改原数据
    for (const item of list) {
        const node = { ...item, [childKey]: [], label: item[labelKey], value: item[valueKey] };
        nodeMap.set(node[idKey], node);
    }

    // 第二轮挂载
    for (const node of nodeMap.values()) {
        const parentId = node[pidKey];
        if (parentId === rootId || !nodeMap.has(parentId)) {
            tree.push(node); // 根节点或孤儿
        } else {
            nodeMap.get(parentId)[childKey].push(node); // 挂到父节点
        }
    }

    return tree;
};

/**
 * 获取树结构的节点
 * @param tree
 * @param value
 * @param key
 * @param childKey
 * @returns {*|null}
 */
export const findTreeNodeByValue = (tree, value, key = 'value', childKey = 'children') => {
    if (!Array.isArray(tree)) return null;
    for (const node of tree) {
        if (node[key] === value) {
            return node;
        }
        if (Array.isArray(node[childKey])) {
            const found = findTreeNodeByValue(node[childKey], value, key, childKey);
            if (found) return found;
        }
    }
    return null;
};


/**
 * 将树形结构转换为列表
 * @param {Array} tree 树形结构数据
 * @param {Object} options 配置选项
 * @returns {Array} 扁平化的列表
 */
export const treeToList=(tree, options = {})=> {
    const {
        idKey = 'id',
        pidKey = 'pid',
        childKey = 'children',
        rootId = 0
    } = options;

    const list = [];

    /**
     * 递归处理节点
     * @param {Object} node 当前节点
     * @param {number|string} parentId 父节点ID
     */
    function traverse(node, parentId) {
        // 创建新对象，避免修改原始数据
        const item = { ...node };

        // 设置父ID
        item[pidKey] = parentId;

        // 删除子节点数组
        const children = item[childKey] || [];
        delete item[childKey];

        // 添加到结果列表
        list.push(item);

        // 递归处理子节点
        children.forEach(child => traverse(child, item[idKey]));
    }

    // 处理根节点数组
    tree.forEach(node => traverse(node, rootId));

    return list;
}

/**
 * 查找列表中，指定对象在指定字段上的“相邻等级”的所有项
 * @param {Array} list - 数据列表
 * @param {Object} targetItem - 参考对象
 * @param {'next'|'prev'} direction - 查找方向：下一个等级或上一个等级
 * @param {string} field - 比较字段（如 'age', 'sort' 等）
 * @returns {Array} 相邻等级的所有项
 */
 export const findAdjacentLevelItems=(list, targetItem, direction = 'next', field='sort')=>{
    if (!targetItem || !targetItem.hasOwnProperty(field)) return [];

    const uniqueValues = [...new Set(list.map(item => item[field]))].sort((a, b) => a - b);
    const currentIndex = uniqueValues.indexOf(targetItem[field]);

    const targetIndex = direction === 'next' ? currentIndex + 1 : direction === 'prev' ? currentIndex - 1 : null;

    if (targetIndex == null || targetIndex < 0 || targetIndex >= uniqueValues.length) {
        return [];
    }

    const targetValue = uniqueValues[targetIndex];
    return list.filter(item => item[field] === targetValue);
}

export const getPercent = (a, b, fixedNum = 2,NaNData) => {
     const numA = parseFloat(a);
    const numB = parseFloat(b);
    return isNaN(numA) || isNaN(numB) || numB === 0 ? (typeof NaNData===undefined?NaN:NaNData) : Number(`${((numA / numB) * Math.pow(10, fixedNum)).toFixed(fixedNum)}`);
}

/**
 * 获取百分比范围颜色
 * @param percent
 * @param color1
 * @param color2
 * @returns {*|string}
 */
export const getRangeColor = (percent, color1, color2) => {
    const interpolate = (start, end, factor) => Math.round(start + (end - start) * factor);
    const hexToRgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
    const rgbToHex = ([r, g, b]) => `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    // 限制百分比范围，并确保边界值返回对应颜色
    const p = Math.min(100, Math.max(0, percent)) / 100;
    if (p === 0) return color2; // 0% 时返回 color2
    if (p === 1) return color1; // 100% 时返回 color1
    const [r1, g1, b1] = hexToRgb(color2); // 交换颜色
    const [r2, g2, b2] = hexToRgb(color1);
    return rgbToHex([
        interpolate(r1, r2, p),
        interpolate(g1, g2, p),
        interpolate(b1, b2, p),
    ]);
};

/**
 * 复制文本到剪贴板
 * @param text
 * @returns {Promise<boolean>}
 */
export async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // 兼容旧版浏览器
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
        return true; // 复制成功
    } catch (err) {
        console.error("复制失败", err);
        return false;
    }
}
