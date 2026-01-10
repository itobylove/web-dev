// 【资产分类ID】电子产品
export const ASSET_CATE_ID_ELECTRONIC=1;
// 【资产分类ID】测试架
export const ASSET_CATE_ID_TEST_BENCH=44;

export const HOST='office.ltepcb.com:52030';

//投产类型
export const moTypeOptions=[
    {label: '正常投产', value: 'SO'},
    {label: '退货返修', value: 'ReturnRepair'},
    {label: '补货', value: 'Replenishment'},
    {label: '仓库返修', value: 'StockRepair'},
    {label: '生产补投', value: 'ProVote'},
    {label: '合拼板投产', value: 'Merger'},
    {label: '存货补投', value: 'MakeToStock'},
]

// 工单状态
export const woStatusOptions=[
    {label: '外协', value: 1},
    {label: '未发放', value: 2},
    {label: '已发放', value: 3},
    {label: '暂停', value: 4},
    {label: '取消', value: 5},
    {label: '完成', value: 6},
]

// 型号状态
export const jobStatusOptions=[
    {label: '通过', value: 'Valid'},
    {label: '活动', value: 'Active'},
]

// 型号审核状态
export const jobApproveStatus=[
    {label: '制作中', value: 'Pending'},
    {label: '已提交', value: 'Submit'},
    {label: '审批中', value: 'Waiting'},
    {label: '审批通过', value: 'Approved'},
    {label: '拒绝', value: 'Rejected'},
]

/**
 * 用户类型
 * @type {{employee: number, supplier: number}}
 */
export const USER_TYPE={
    employee: 1,
    supplier: 2,
};
/**
 * 用户关联系统类型
 * @type {{old: number, employee: number, supplier: number, customer: number, wxwork: number, weixin: number, oa: number, hr: number, api: number}}
 */
export const USER_LINK_TYPE={
    old:0,
    employee:1,
    supplier:2,
    customer:3,
    weixin:4,
    wxwork:5,
    oa:6,
    hr:7,
    api:8,
}

/**
 * 默认的用户信息
 * @type {{id: number, username: string, nickname: string, identity_info: string, type: number, type_text: string, gender: number, avatar: string, favorites: {nav: *[]}, view: {theme: string}, administrator: boolean, permissions: *[], assignment: *[], plantId: null, link: {employee: undefined, supplier: undefined}}}
 */
export const USER_INFO={
    id: 0,
    username: '',  //用户名
    nickname: '',  //昵称
    identity_info: '',  //身份信息描述
    type: 1,       //用户类型 是 type  用户类型(1:员工;2:供应商;3:API)
    type_text:'',//用户类型名称
    gender: null, //性别  0女 1男
    avatar: '', //头像
    favorites: {
        nav: [],//收藏导航
    },
    view: {
        theme: 'default',//主题名称
    },
    administrator: false,//超管
    permissions: [],//导航权限
    assignment:[],
    plantId:null,//默认工厂
    link:{
        // new:{value:null}, // 新系统
        old:{value:null}, // 旧系统
        employee:{value:null}, // ERP员工
        supplier:{value:null}, // 供应商
        // customer:{value:null}, //  客户
    },// 关联系统的用户ID
    // name: '',      //姓名（身份）
    // code: '',      //代码（身份）
    // uid: 0,        // 身份原始UID (类型员工时：身份UID和用户ID相等，供应商时UID为主账户userID)
    // erp_recid: 0,       //身份其它系统的UID
}