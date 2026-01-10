
/**
 * 状态: 草稿编辑中，待提交
 */
export const STATUS_EDIT = 0;

/**
 * 状态: 已提交，待审核
 */
export const STATUS_SUBMIT = 1;

/**
 * 状态: 审核中
 */
export const STATUS_APPROVING = 2;

/*
* 状态: 审核拒绝
*/
export const STATUS_REJECT = 3;
/**
 * 状态: 已审核
 */
export const STATUS_APPROVED = 4;

/**
 * 状态: 已核销
 */
export const STATUS_CHECKIN = 5;

/**
 * 状态: 已完结
 */
export const STATUS_FINISH = 6;



/**
 * 审核动作: 通过
 * @type {number}
 */
export const APPROVAL_RESULT_PASS=1;

/**
 * 审核动作: 拒绝
 * @type {number}
 */
export const APPROVAL_RESULT_REJECT=2;


/**
 * 审核状态: 编辑
 */
export const APPROVAL_STATUS_EDIT = 0;
/**
 * 状态: 审核中
 */
export const APPROVAL_STATUS_WAIT = 1;
/**
 * 状态: 审核通过
 */
export const APPROVAL_STATUS_PASS = 2;

/**
 * 状态: 审核拒绝
 */
export const APPROVAL_STATUS_REJECT = 3;

/**
 * 状态: 撤销
 */
export const APPROVAL_STATUS_CANCEL = 4;

/**
 * 申请来源: 自己申请
 */
export const SOURCE_SELF = 0;

/**
 * 申请来源: 邀请
 */
export const SOURCE_INVITE = 1;
