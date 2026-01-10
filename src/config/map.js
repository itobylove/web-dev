export const dataMap = {
    copperthickness: {
        '1oz': 35, '2oz': 70, '70um': 70,
    },
    s_contractitem: {
        approvestatus: {
            waiting: '审批中', submit: '提交', pending: '制作中', approved: '审批通过', na: '直接通过', rejected: '拒绝',
        },
        status: {
            cancel: '取消', active: '活动', valid: '生效', close: '关闭', planned: '已计划', toreplenishment: '待返修', shipped: '已发货', onhold: '暂缓', toexchange: '待换货', outsoucing: '外协'
        }
    },
    s_job: {
        type: {
            'sample': '样板', 'batch': '批量', 'other': '其它', 'merger': '合拼', 'mgsuit': '套版', 'subsuit': '套版子板'
        },
        approvestatus: {
            'pending': '制作中', 'submit': '已提交', 'waiting': '审批中', 'approved': '审批通过', 'rejected': '拒绝', 'subsuit': '套版子板'
        },
        status: {
            valid: '通过', active: '活动'
        }
    },
    woplan: {
        wolevel: ['标准生产', '加急生产', '特急生产', '十万火急']
    },
    shipping:{
        "SPMO001": "快递",
        "SPMO002": "物流",
        "SPMO003": "大巴",
        "SPMO004": "空运",
        "SPMO005": "厂送",
        "SPMO006": "顺丰",
        "SPMO007": "跨越",
        "SPMO008": "物流专车",
        "SPMO009": "德邦",
        "SPMO010": "龙邦",
        "SPMO011": "广盛物流",
        "SPMO012": "顺丰(特快)",
        "SPMO013": "顺丰(陆运件)",
        "SPMO014": "顺丰(重量包裹)",
        "SPMO015": "跨越(次日达)",
        "SPMO016": "跨越(隔日达)",
        "SPMO017": "跨越(陆运件)",
        "SPMO018": "跨越(当日达)",
        "SPMO019": "小刘物流",
        "SPMO020": "司机送货",
        "SPM0021": "广盛客户端",
        "SPM0022": "广盛深圳龙腾",
        "SPM0023": "哲进客户端",
        "SPM0024": "哲进深圳龙腾",
        "SPM0025": "睿成客户端"
    }
}

export default dataMap;