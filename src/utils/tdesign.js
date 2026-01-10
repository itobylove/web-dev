import dayjs from "dayjs";
import isoWeek from 'dayjs/plugin/isoWeek';  // 支持获取周
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(isoWeek);
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')


// 腾讯tdesign相关扩展
export const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const dateNow=dayjs();

export const timeNow=dateNow.format('YYYY-MM-DD HH:mm:ss')

export const startOfToday=dateNow.startOf('day');

export const endOfToday=dateNow.endOf('day');



/**
 * 时间段格式化
 * @param items
 * @param formats
 * @returns {*}
 */
export const presetsFormat = (items, formats) => {
    for (const key in items) {
        items[key] = items[key].map((item, index) => {
            if (typeof item === 'string') return item;
            return item.format(formats?.[index] || formats || 'YYYY-MM-DD HH:mm:ss');
        })
    }
    return items;
}

export const dateFormat = (value, format = 'YYYY-MM-DD HH:mm:ss') => {
    return dayjs(value || new Date()).format(format);
}

/**
 * 时间快捷选择
 */
export const presets = presetsFormat({
    '最近1年': [dateNow.subtract(1, 'year'),endOfToday],
    '最近3个月': [dateNow.subtract(3, 'month'),endOfToday],
    '最近1个月': [dateNow.subtract(1, 'month'),endOfToday],
    '本月': [dateNow.startOf('month'),dateNow.endOf('month')],
    '最近7天': [dateNow.subtract(7, 'day').startOf('day'),endOfToday],
    '最近3天': [dateNow.subtract(3, 'day').startOf('day'),endOfToday],
    '昨天': [ dateNow.subtract(1, 'day').startOf('day'), dateNow.subtract(1, 'day').endOf('day')],
    '今天': [ dateNow.startOf('day'), endOfToday],
});

/**
 *  获取今天附近的几天
 * @param args
 * @returns {*}
 */
export const getAroundDays = (args = {}) => {
    const option = {
        format: ['YYYY-MM-DD 00:00', 'YYYY-MM-DD 23:59'],
        start: -3,
        end: 10,
        ...args
    };

    const today = dayjs().startOf('day');
    const result = {};
    const usedLabels = new Set();

    for (let i = option.start; i <= option.end; i++) {
        const date = today.add(i, 'day');
        const dayOfWeek = date.day();
        const labelBase = weekdayMap[dayOfWeek];
        const weekDiff = date.isoWeek() - today.isoWeek();
        let label = '';

        if (i === 0) label = '今天';
        else if (i === 1) label = '明天';
        else if (i === 2) label = '后天';
        else if (i < 0 || weekDiff === 0) {
            // 本周
            label = labelBase;
        } else {
            // 跨周
            label = `下${labelBase}`;
        }

        if (usedLabels.has(label)) continue; // 避免重复 label
        usedLabels.add(label);
        result[label] = [date.startOf('day'), date.endOf('day')];
    }

    return presetsFormat(result, option.format);
};

export function friendlyDate(dateStr, showTimeLabel = true,betweenStr='-') {
    const target = dayjs(dateStr)
    const today = dayjs().startOf('day')

    const diffDay = target.startOf('day').diff(today, 'day')

    const map = {
        "0": '今天',
        "1": '明天',
        "2": '后天',
        "-1": '昨天',
        "-2": '前天'
    }

    let label = ''

    if (map[diffDay] !== undefined) {
        label = map[diffDay]
        if (showTimeLabel) {
            label += betweenStr + getTimeLabel(target.hour())
        }
        return label
    }

    // 一个月内 → 天
    if (Math.abs(diffDay) < 30) {
        return diffDay > 0 ? `${diffDay}天后` : `${Math.abs(diffDay)}天前`
    }

    // 一年内 → 月
    const diffMonth =
        target.year() * 12 + target.month() - (today.year() * 12 + today.month())
    if (Math.abs(diffMonth) < 12) {
        return diffMonth > 0
            ? `${diffMonth}个月后`
            : `${Math.abs(diffMonth)}个月前`
    }

    // 超过一年 → 年
    const diffYear = target.year() - today.year()
    return diffYear > 0 ? `${diffYear}年后` : `${Math.abs(diffYear)}年前`
}

// 根据小时返回时间段
export function getTimeLabel(hour) {
    if (hour >= 0 && hour < 6) return '凌晨'
    if (hour >= 6 && hour < 12) return '上午'
    if (hour >= 12 && hour < 18) return '下午'
    return '晚上'
}


/**
 * 计算两个日期跨越的天数（自然日），从 start 到 end
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {number} 天数差，正负值
 */
export function diffNaturalDays(start, end) {
    const d1 = dayjs(start).startOf('day')
    const d2 = dayjs(end).startOf('day')
    let diff = d2.diff(d1, 'day') + 1 // 跨越天数 +1
    return diff > 0 ? diff : 1
}