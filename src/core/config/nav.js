import {defineAsyncComponent as reg, ref} from 'vue'
import loadingComponent from '@/core/component/loadingComponent.vue'
import errorComponent from '@/core/component/errorComponent.vue'
import apiUrl from '@/core/config/url.js'
import ApiRequest from '@/event/ApiRequest.js'
import * as core from '@/core/script/core.js'
import {ASSET_CATE_ID_ELECTRONIC, ASSET_CATE_ID_TEST_BENCH, jobApproveStatus, jobStatusOptions, moTypeOptions, woStatusOptions} from "@/core/config/const.js";
import siyi from "@/core/script/siyi.js";


export const components = {
    // workOrderStatusQuery_v240507: reg({
    // oader: () => import('@/modules/dataCenter/workOrderStatusQuery.v240507.vue'),//组件
    // delay: 200,//延迟时间
    // timeout: 3000,//加载超时时间
    // }),
    home: reg({loader: () => import('@/modules/home/home.v240503.vue'), loadingComponent, errorComponent}),
    home_mobile: reg({loader: () => import('@/modules/home/home.mobile.v240503.vue'), loadingComponent, errorComponent}),
    profile: reg({loader: () => import('@/modules/home/profile.v250124.vue'), loadingComponent, errorComponent}),
    profile_mobile: reg({loader: () => import('@/modules/home/profile.v250124.vue'), loadingComponent, errorComponent}),
    riskConfig_v240503: reg({loader: () => import('@/modules/pe/riskConfig.v240503.vue'), loadingComponent, errorComponent}),
    openOrder: reg({loader: () => import('@/modules/pe/openOrder.v250909.vue'), loadingComponent, errorComponent}),
    jobParameter: reg({loader: () => import('@/modules/pe/jobParameter.v251016.vue'), loadingComponent, errorComponent}),
    openOrder_mobile: reg({loader: () => import('@/modules/pe/openOrder.v250909.vue'), loadingComponent, errorComponent}),
    peorder: reg({loader: () => import('@/modules/pe/peorder.v250313.vue'), loadingComponent, errorComponent}),
    peorder_mobile: reg({loader: () => import('@/modules/pe/peorder.v250313.vue'), loadingComponent, errorComponent}),
    ecnApprove: reg({loader: () => import('@/modules/pe/ecnApprove.v250313.vue'), loadingComponent, errorComponent}),
    ecnApprove_mobile: reg({loader: () => import('@/modules/pe/ecnApprove.v250313.vue'), loadingComponent, errorComponent}),
    moWaitingMaterials: reg({loader: () => import('@/modules/sc/moWaitingMaterials.v250210.vue'), loadingComponent, errorComponent}),
    rukuScanCode_mobile: reg({loader: () => import('@/modules/sc/rukuScanCode.v240515.vue'), loadingComponent, errorComponent}),
    testStand_v240816: reg({loader: () => import('@/modules/sc/testStand.v240816.vue'), loadingComponent, errorComponent}),
    packingStandard_v240524: reg({loader: () => import('@/modules/sc/packingStandard_v240524.vue'), loadingComponent, errorComponent}),
    packingSlip_v20240507: reg({loader: () => import('@/modules/qa/packingSlip.v20240507.vue'), loadingComponent, errorComponent}),
    packingSlipConfig_v20240507: reg({loader: () => import('@/modules/qa/packingSlipConfig.v20240507.vue'), loadingComponent, errorComponent}),
    form_table_list_v240620: reg({loader: () => import('@/modules/form/table_list.v240620.vue'), loadingComponent, errorComponent}),
    form_table_detail_v240620: reg({loader: () => import('@/modules/form/table_detail.v240620.vue'), loadingComponent, errorComponent}),
    form_tpl_list_v240620: reg({loader: () => import('@/modules/form/tpl_list.v240620.vue'), loadingComponent, errorComponent}),
    form_tpl_detail_v240620: reg({loader: () => import('@/modules/form/tpl_detail.v240620.vue'), loadingComponent, errorComponent}),
    form_field_v240620: reg({loader: () => import('@/modules/form/form_field.v240620.vue'), loadingComponent, errorComponent}),
    wo_case_v240730: reg({loader: () => import('@/modules/workOrder/case_v240731.vue'), loadingComponent, errorComponent}),
    wo_bill_v240802: reg({loader: () => import('@/modules/workOrder/bill_V240802.vue'), loadingComponent, errorComponent}),
    wo_case_v240730_mobile: reg({loader: () => import('@/modules/workOrder/case_m_v240731.vue'), loadingComponent, errorComponent}),
    wo_bill_v240802_mobile: reg({loader: () => import('@/modules/workOrder/bill_m_V240802.vue'), loadingComponent, errorComponent}),
    flow_order_v240817: reg({loader: () => import('@/modules/flow/flow_order.v240817.vue'), loadingComponent, errorComponent}),
    flow_item_v240817: reg({loader: () => import('@/modules/flow/flow_item.v240817.vue'), loadingComponent, errorComponent}),
    outwork_money: reg({loader: () => import('@/modules/outwork/money.v250626.vue'), loadingComponent, errorComponent}),
    user_auth_apply: reg({loader: () => import('@/modules/system/auth_apply.v241018.vue'), loadingComponent, errorComponent}),
    user_auth_apply_mobile: reg({loader: () => import('@/modules/system/auth_apply_m.v241018.vue'), loadingComponent, errorComponent}),
    user_list: reg({loader: () => import('@/modules/system/user.v250809.vue'), loadingComponent, errorComponent}),
    user_sns: reg({loader: () => import('@/modules/system/sns.v250916.vue'), loadingComponent, errorComponent}),
    dept_position: reg({loader: () => import('@/modules/system/dept_position.v250820.vue'), loadingComponent, errorComponent}),
    auth_item: reg({loader: () => import('@/modules/system/auth_item.v241204.vue'), loadingComponent, errorComponent}),
    auth_item_lists: reg({loader: () => import('@/modules/system/auth_item_lists.vue'), loadingComponent, errorComponent}),
    log_list: reg({loader: () => import('@/modules/system/log.v241019.vue'), loadingComponent, errorComponent}),
    cache_list: reg({loader: () => import('@/modules/system/cache.v251014.vue'), loadingComponent, errorComponent}),
    dev_test: reg({loader: () => import('@/modules/system/test.vue'), loadingComponent, errorComponent}),
    queue_list: reg({loader: () => import('@/modules/system/queue.v250219.vue'), loadingComponent, errorComponent}),
    asset_list: reg({loader: () => import('@/modules/asset/index.v250701.vue'), loadingComponent, errorComponent}),
    asset_check_mobile: reg({loader: () => import('@/modules/asset/check_v250920.vue'), loadingComponent, errorComponent}),
    outwork_order: reg({loader: () => import('@/modules/outwork/order.v240826.vue'), loadingComponent, errorComponent}),
    outwork_pack: reg({loader: () => import('@/modules/outwork/pack.v240826.vue'), loadingComponent, errorComponent}),
    outwork_log: reg({loader: () => import('@/modules/outwork/log.v240826.vue'), loadingComponent, errorComponent}),
    //报表开始
    publicReport: reg({loader: () => import('@/core/component/table_v2.vue'), loadingComponent, errorComponent}),
    publicReport_mobile: reg({loader: () => import('@/core/component/table_v2.vue'), loadingComponent, errorComponent}),
    workOrderStatusQuery_v241120: reg({loader: () => import('@/modules/sc/workOrderStatusQuery.v241120.vue'), loadingComponent, errorComponent}),
    salesOrderStatusQuery_v241120: reg({loader: () => import('@/modules/sales/salesOrderStatusQuery.v241120.vue'), loadingComponent, errorComponent}),
    salesOrderPlan: reg({loader: () => import('@/modules/sales/salesOrderPlan.v241127.vue'), loadingComponent, errorComponent}),
    bainengSyncOrder: reg({loader: () => import('@/modules/sales/bainengSyncOrder.vue'), loadingComponent, errorComponent}),
    salesPartsSyncBaineng: reg({loader: () => import('@/modules/sales/salesPartsSyncBaineng.v250515.vue'), loadingComponent, errorComponent}),
    byd_price: reg({loader: () => import('@/modules/table/byd_price_v250118.vue'), loadingComponent, errorComponent}),
    byd_toubiao: reg({loader: () => import('@/modules/table/byd_toubiao_v250118.vue'), loadingComponent, errorComponent}),
    job_weight: reg({loader: () => import('@/modules/sc/jobWeight.v250425.vue'), loadingComponent, errorComponent}),
    job_test_bench: reg({loader: () => import('@/modules/asset/testBench.v250510.vue'), loadingComponent, errorComponent}),
    cost_config: reg({loader: () => import('@/modules/cost/config.v251125.vue'), loadingComponent, errorComponent}),
    cost_index: reg({loader: () => import('@/modules/cost/index.v251125.vue'), loadingComponent, errorComponent}),
    siyi_job: reg({loader: () => import('@/modules/cost/job.v260109.vue'), loadingComponent, errorComponent}),
    visitor: reg({loader: () => import('@/modules/visitor/index.v250622.vue'), loadingComponent, errorComponent}),
    visitor_mobile: reg({loader: () => import('@/modules/visitor/index.v250622.vue'), loadingComponent, errorComponent}),
    checkin_mobile: reg({loader: () => import('@/modules/visitor/checkin.v250711.vue'), loadingComponent, errorComponent}),
    salesProfitVchat: reg({loader: () => import('@/modules/report/salesProfitVchat.vue'), loadingComponent, errorComponent}),
    pandian_wip: reg({loader: () => import('@/modules/ac/pandian_wip.vue'), loadingComponent, errorComponent}),
    pandian_product: reg({loader: () => import('@/modules/ac/pandian_product.vue'), loadingComponent, errorComponent}),
    pandian_material: reg({loader: () => import('@/modules/ac/pandian_material.vue'), loadingComponent, errorComponent}),
    pandian_step_material: reg({loader: () => import('@/modules/ac/pandian_step_material.vue'), loadingComponent, errorComponent}),
    materialStock: reg({loader: () => import('@/modules/sc/materialStock.v251010.vue'), loadingComponent, errorComponent}),
    biz_customer: reg({loader: () => import('@/modules/table/biz_customer.v251023.vue'), loadingComponent, errorComponent}),
    mesHoliday:reg({loader: () => import('@/modules/sc/mesHoliday.vue'), loadingComponent, errorComponent}),
    mes_production_report:reg({loader: () => import('@/modules/mes/production_report.vue'), loadingComponent, errorComponent}),
    mes_production_report_mobile:reg({loader: () => import('@/modules/mes/production_report.vue'), loadingComponent, errorComponent}),
    sys_unit:reg({loader: () => import('@/modules/system/unit.vue'), loadingComponent, errorComponent}),
    sys_unit_mobile:reg({loader: () => import('@/modules/system/unit.vue'), loadingComponent, errorComponent}),
    sys_step: reg({loader: () => import('@/modules/system/step_equipment/step.vue'), loadingComponent, errorComponent}),
    sys_step_equipment: reg({loader: () => import('@/modules/system/step_equipment/index.vue'), loadingComponent, errorComponent}),
    sys_step_report: reg({loader: () => import('@/modules/system/step_equipment/report.vue'), loadingComponent, errorComponent}),
    sys_step_mobile: reg({loader: () => import('@/modules/system/step_equipment/step.vue'), loadingComponent, errorComponent}),
    sys_process: reg({loader: () => import('@/modules/system/step_equipment/process.vue'), loadingComponent, errorComponent}),
    sys_process_mobile: reg({loader: () => import('@/modules/system/step_equipment/process.vue'), loadingComponent, errorComponent}),
    sys_station: reg({loader: () => import('@/modules/system/step_equipment/station.vue'), loadingComponent, errorComponent}),

    sys_employee: reg({loader: () => import('@/modules/system/employee.vue'), loadingComponent, errorComponent}),
    sys_employee_mobile: reg({loader: () => import('@/modules/system/employee.vue'), loadingComponent, errorComponent}),
    sys_supplier: reg({loader: () => import('@/modules/system/supplier.vue'), loadingComponent, errorComponent}),
    sys_supplier_mobile: reg({loader: () => import('@/modules/system/supplier.vue'), loadingComponent, errorComponent}),
    sys_equipment: reg({loader: () => import('@/modules/system/step_equipment/equipment.vue'), loadingComponent, errorComponent}),
    sys_equipment_mobile: reg({loader: () => import('@/modules/system/step_equipment/equipment.vue'), loadingComponent, errorComponent}),
    sys_parameter: reg({loader: () => import('@/modules/system/parameter.vue'), loadingComponent, errorComponent}),
    sys_parameter_rules: reg({loader: () => import('@/modules/system/parameter_rules.vue'), loadingComponent, errorComponent}),
    sys_parameter_mobile: reg({loader: () => import('@/modules/system/parameter.vue'), loadingComponent, errorComponent}),
    mes_report_template: reg({loader: () => import('@/modules/mes/report_template.vue'), loadingComponent, errorComponent}),
    mes_report_template_mobile: reg({loader: () => import('@/modules/mes/report_template.vue'), loadingComponent, errorComponent}),
    mes_report_template_parameter: reg({loader: () => import('@/modules/mes/report_template_parameter.vue'), loadingComponent, errorComponent}),
    mes_report_template_parameter_mobile: reg({loader: () => import('@/modules/mes/report_template_parameter.vue'), loadingComponent, errorComponent}),
    mes_production_report_data: reg({loader: () => import('@/modules/mes/report_history.vue'), loadingComponent, errorComponent}),
    mes_production_report_data_mobile: reg({loader: () => import('@/modules/mes/report_history.vue'), loadingComponent, errorComponent}),
}

//模块与导航，可以从后端获取
export const nav = ref([
    {
        id: 'home',
        title: '主页',
        icon: 'ri-home-8-line',
        items: [
            {
                id: 'home',
                title: '全局看板',
                icon: 'ri-gallery-view',
                auth: true,
            },
            {
                id: 'profile',
                title: '个人中心',
                icon: 'ri-gallery-view',
                show: false,
                auth: true,
                filter: false,
            },
        ],
    },
    {
        id: 'dataCenter',
        title: '报表',
        icon: 'ri-file-chart-line',
        items: [
            {
                id: 'lt_report_wip01', cid: 'publicReport', title: '1060-横向WIP数量+面积',
                query: {search: [{type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}}],}
            },
            {
                id: 'lt_report_wip02',
                cid: 'publicReport',
                title: '1060-横向WIP数量',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}}
                    ],
                }
            },
            {
                id: 'lt_report_request01',
                cid: 'publicReport',
                title: '1061-横向交货',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '客户交期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_kcmx',
                cid: 'publicReport',
                title: '1008-成品库存明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_kchz',
                cid: 'publicReport',
                title: '1008-1成品库存汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: '工厂', filter: true, options: {placeholder: '生产工厂'}},
                        {type: 'input', field: '仓库', filter: true, style: {width: '100px'}, options: {placeholder: '仓库名称'}},
                        {type: 'input', field: '客户代码', filter: true, style: {width: '80px'}, options: {placeholder: '客户代码'}},
                    ],
                }
            },

            {
                id: 'lt_report_wlkcmx',
                cid: 'publicReport',
                title: '1026-物料库存明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', style: {width: '300px'},options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'warehouse', field: 'warehouse', style: {width: '300px'},options: {placeholder: '仓库'}},
                    ],
                }
            },
            {
                id: 'lt_report_wlkchz',
                cid: 'publicReport',
                title: '1043-物料库存汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_jtmrxdhz',
                cid: 'publicReport',
                title: '1000-每日下单汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtdtddmx',
                cid: 'publicReport',
                title: '1001-待投订单',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jhddmi',
                cid: 'publicReport',
                title: '1001-1待投订单与MI状态',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_wffzyd',
                cid: 'publicReport',
                title: '1002-未发放作业单',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_jhbl',
                cid: 'publicReport',
                title: '1003-计划备料',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_faliao_and_bom',
                cid: 'publicReport',
                title: '1003-1配料与实际发料',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_SC_JHFHCX',
                cid: 'publicReport',
                title: '1003-2生产计划负荷表',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_wowfmx',
                cid: 'publicReport',
                title: '1004-1半制程外发明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_wowfmx_gys',
                cid: 'publicReport',
                title: '1004-2半制程对账模板',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '外发时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_wowfmx2',
                cid: 'publicReport',
                title: '1004-3半制程生产工厂投料记录',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-01-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_wowfshmx',
                cid: 'publicReport',
                title: '1004-4半制程外发收货明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '收货时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_socs',
                cid: 'publicReport',
                title: '1005-订单参数',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_salesparts',
                cid: 'publicReport',
                title: '1005-1销售部件',
                query: {
                    search: [
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '创建时间'}
                        },
                        {type: 'input', field: 'salesPartNum', options: {placeholder: '本厂型号'}},
                        {type: 'input', field: 'custMatCode', options: {placeholder: '客户物料号'}},
                        {type: 'input', field: 'salesPartName', options: {placeholder: '客户型号'}},
                        {type: 'select', field: 'code', load: 'customer', options: {placeholder: '客户代号'}},
                    ],
                }
            },
            {
                id: 'lt_report_khxxb',
                cid: 'publicReport',
                title: '1006-客户信息',
                query: {
                    search: [
                        {type: 'input', field: '客户代码', filter: true, style: {width: '80px'}, options: {placeholder: '客户代码'}},
                        {type: 'input', field: '客户名称', filter: true, style: {width: '100px'}, options: {placeholder: '客户名称'}},
                        {type: 'input', field: '业务员', filter: true, style: {width: '100px'}, options: {placeholder: '业务员'}},
                    ],
                }
            },
            {
                id: 'lt_report_khnlgf',
                cid: 'publicReport',
                title: '1006-1-客户能力规范',
                query: {
                    search: [
                        {type: 'input', field: '客户代码', filter: true, style: {width: '80px'}, options: {placeholder: '客户代码'}},
                    ],
                }
            },
            {
                id: 'lt_report_somx',
                cid: 'publicReport',
                title: '1007-订单明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {style:"width:260px",label:"生产工厂：",placeholder: '请选择'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            maxTime: 31 * 60 * 60 * 24,
                            options: {placeholder: '下单日期'}
                        },
                        {type: 'input', field: 'salesPartNum', options: {placeholder: '本厂编号'}},
                        // {type: 'input', field: 'code', options: {placeholder: '客户代号'}},
                        {type: 'select', load: 'customer', field: 'custId', options: {minCollapsedNum:3,style:"width:320px",placeholder: '客户代码'}},
                    ],
                }
            },
            {
                id: 'lt_report_djsh',
                cid: 'publicReport',
                title: '1007-1订单单价审核',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'EnterDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单日期'}
                        },
                        {type: 'input', field: 'soNumber', style: {width: '150px'}, options: {placeholder: '订单号'}},
                        {type: 'input', field: 'partNum', style: {width: '150px'}, options: {placeholder: '生产型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_chmx',
                cid: 'publicReport',
                title: '1009-装箱单明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'shippedDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '出货日期'}
                        },
                        {type: 'select', load: 'job', remote: true, field: 'job', options: {empty: "请输入本厂编号", placeholder: '本厂编号', style: "width:265px"}},
                        {type: 'input', field: 'custMatCode', style: {width: '120px'}, options: {placeholder: '客户物料号'}},
                        {type: 'input', field: 'salesPartName', style: {width: '120px'}, options: {placeholder: '客户型号'}},
                        {type: 'select', load: 'customer', field: 'code', options: {placeholder: '客户代码'}},
                        {type: 'input', field: 'custname', style: {width: '120px'}, options: {placeholder: '客户名称'}},
                        {type: 'input', field: 'contract', style: {width: '120px'}, options: {placeholder: '客户订单号'}},
                        {type: 'input', field: 'shipingNotes_Numer', style: {width: '120px'}, options: {placeholder: '出库单号'}},
                        {type: 'input', field: 'packingSlip_Numer', style: {width: '120px'}, options: {placeholder: '装箱单号'}},
                    ],
                }
            },
            {
                id: 'lt_report_CW_ZXDMX',
                cid: 'publicReport',
                title: '1009-装箱单明细(财务)',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'shippedDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '出货日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chbgddtccx',
                cid: 'publicReport',
                title: '1010-出货报告订单投产',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'shippedDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_aycxkhchje',
                cid: 'publicReport',
                title: '1012-按月出货金额',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'shippedDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_aycxkhgjje',
                cid: 'publicReport',
                title: '1013-按月工具金额',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'shippedDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_aycxkhthje',
                cid: 'publicReport',
                title: '1014-按月退货金额',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'shippedDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_wippd',
                cid: 'publicReport',
                title: '1016-WIP盘点',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'checkDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '盘点日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_myhtmx',
                cid: 'publicReport',
                title: '1017-物料销售明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '创建时间'}
                        },
                    ],
                }
            },
            // {
            //     id: 'lt_report_woccmx',
            //     cid: 'Table',
            //     title: '1018-1生产过数明细',
            //     query: {
            //         search: [
            //             {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
            //             {type: 'select', load: 'process', field: 'name', options: {placeholder: '工艺名称'}},
            //             {type: 'select', load: 'job', remote: true, field: 'job', options: {empty: "请输入型号", placeholder: '型号', style: "width:290px"}},
            //             {
            //                 type: 'rangeTime', field: 'createDate',
            //                 value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
            //                 options: {placeholder: '过数时间'}
            //             },
            //         ],
            //     }
            // },
            // {
            //     id: 'lt_report_woccmx_cnj',
            //     cid: 'Table',
            //     title: '1018-2生产过数沉镍金',
            //     query: {
            //         search: [
            //             {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
            //             {
            //                 type: 'rangeTime', field: 'receivedTime',
            //                 value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
            //                 options: {placeholder: '接收时间'}
            //             },
            //         ],
            //     }
            // },
            {
                id: 'lt_report_wlccmx1',
                cid: 'publicReport',
                title: '1019-物料出库明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '出库日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_sowfmx',
                cid: 'publicReport',
                title: '1020-全制程外发明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime',
                            field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '外发时间'}
                        },
                        {type: 'input', field: 'os_PO_Number', options: {placeholder: '采购单号'}},
                        {type: 'select', load: 'job', remote: true, field: 'job', options: {empty: "请输入型号", placeholder: '型号', style: "width:290px"}},
                    ],
                }
            },
            {
                id: 'lt_report_wlthmx',
                cid: 'publicReport',
                title: '1024-物料退货明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'returnDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '退货日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_yearjdmx',
                cid: 'publicReport',
                title: '1025-年接单明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'date', field: 'returnDate',
                            value: core.date.time('YYYY-MM-DD'),
                            options: {placeholder: '接单日期'}
                        },
                    ],
                }
            },
            // {
            //     id: 'lt_report_scccmx',
            //     cid: 'Table',
            //     title: '1027-2-生产产出明细',
            //     query: {
            //         search: [
            //             {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
            //             {
            //                 type: 'rangeTime', field: 'createDate',
            //                 value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
            //                 options: {placeholder: '入库时间'}
            //             },
            //             {type: 'select', load: 'step', field: 'step', options: {placeholder: '工序名称'}},
            //             {type: 'input', field: 'partNum', style: {width: '150px'}, options: {placeholder: '生产型号'}},
            //         ],
            //     }
            // },
            {
                id: 'lt_report_movote_v2',
                cid: 'publicReport',
                title: '1027-3-生产欠数',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_drc',
                cid: 'publicReport',
                title: '1027-4工单待入仓',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_QZCWXQJ',
                cid: 'publicReport',
                title: '1028-全制程外欠交',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_wrcyl',
                cid: 'publicReport',
                title: '1029-未入仓余料',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_ylwhs',
                cid: 'publicReport',
                title: '1029-1余料未回收',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_jtjqwdyrkcx',
                cid: 'publicReport',
                title: '1030-交期未到已入库',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            // {
            //     id: 'lt_report_momx',
            //     cid: 'Table',
            //     title: '1031-1投产明细v231117',
            //     group: 'lt_report_momx',
            //     query: {
            //         search: [
            //             {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
            //             {
            //                 type: 'rangeTime', field: 'createDate',
            //                 value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
            //                 options: {placeholder: '建单时间'}
            //             },
            //         ],
            //     }
            // },
            // {
            //     id: 'lt_report_momx1',
            //     cid: 'Table',
            //     group: 'lt_report_momx',
            //     title: '1031-2投产按批次v240325',
            //     query: {
            //         search: [
            //             {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
            //             {
            //                 type: 'rangeTime', field: 'createDate',
            //                 value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
            //                 options: {placeholder: '建单时间'}
            //             },
            //         ],
            //     }
            // },
            {
                id: 'lt_report_toc',
                cid: 'publicReport',
                title: '1032-TOC排单',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_cppd',
                cid: 'publicReport',
                title: '1034-成品盘点汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单时间'}
                        },
                    ],
                }
            },
            // {
            //     id: 'lt_report_gcpd',
            //     cid: 'Table',
            //     title: '1035-在线物料盘点',
            //     query: {
            //         search: [
            //             {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
            //             {
            //                 type: 'rangeTime', field: 'createDate',
            //                 value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
            //                 options: {placeholder: '建单时间'}
            //             },
            //         ],
            //     }
            // },
            // {
            //     id: 'lt_report_gxpdb',
            //     cid: 'Table',
            //     title: '1036-湖北/珠海在线物料盘点表',
            //     query: {
            //         search: [
            //             {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
            //             {
            //                 type: 'rangeTime', field: 'createDate',
            //                 value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
            //                 options: {placeholder: '建单时间'}
            //             },
            //         ],
            //     }
            // },
            {
                id: 'lt_report_zhbcaqkc',
                cid: 'publicReport',
                title: '1037-1珠海板材安全库存',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [6], options: {placeholder: '工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_wlpd',
                cid: 'publicReport',
                title: '1041-物料盘点明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'checkDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '盘点日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_bomfl',
                cid: 'publicReport',
                title: '1042-BOM领料未发完',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '领料时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_mrbmx',
                cid: 'publicReport',
                title: '1044-报废明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'step', field: 'step', options: {placeholder: '责任工序'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '报废时间'}
                        },
                        {
                            type: 'select', field: 'mrbtype',
                            options: {
                                placeholder: '类型',
                                options: [
                                    {label: '缺陷', value: 'Defect'},
                                    {label: '报废', value: 'Scrapped'},
                                    {label: '冲销', value: 'CharDefect'},
                                ]
                            }
                        },
                        {type: 'input', field: 'partNum', options: {placeholder: '本厂编号'}},
                    ],
                    tableConfig: {autoLoad: false,},
                },
            },
            {
                id: 'lt_report_mrbhz',
                cid: 'publicReport',
                title: '1044-1报废按工序',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'step', field: 'step', options: {placeholder: '责任工序'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '报废时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_mrbhz_culayers',
                cid: 'publicReport',
                title: '1044-2报废工序+层',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'step', field: 'step', options: {placeholder: '责任工序'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '报废时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_mrbhz_defect',
                cid: 'publicReport',
                title: '1044-3报废工序+缺陷',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'step', field: 'step', options: {placeholder: '责任工序'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '报废时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_mrbhz_defect1',
                cid: 'publicReport',
                title: '1044-4报废按缺陷',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '报废时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_mrb_xinghao',
                cid: 'publicReport',
                title: '1044-5报废按型号',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_cpbf',
                cid: 'publicReport',
                title: '1044-6成品报废',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '创建日期'}
                        },
                        {type: 'input', field: 'code', style: {width: '150px'}, options: {placeholder: '报废单号'}},
                        {type: 'input', field: 'partNum', style: {width: '150px'}, options: {placeholder: '生产型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_cpzxbf',
                cid: 'publicReport',
                title: '1044-7订单报废成品+在线',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'input', field: 'code', style: {width: '150px'}, options: {placeholder: '订单号'}},
                        {type: 'input', field: 'partNum', style: {width: '150px'}, options: {placeholder: '生产型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_mrbisyf',
                cid: 'publicReport',
                title: '1044-8在线报废匹配研发',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'tctime',
                            value: [core.date.time('YYYY-01-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_WXPODZMX',
                cid: 'publicReport',
                title: '1046-外协订单对账',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'enterDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '对账日期'}
                        },
                        {type: 'input', field: 'reconcileNumber', style: {width: '150px'}, options: {placeholder: '对账单号'}},
                        {type: 'input', field: 'name', style: {width: '150px'}, options: {placeholder: '供应商'}},
                    ],
                }
            },
            {
                id: 'lt_report_wf_mlfx',
                cid: 'publicReport',
                title: '1047-全制程外发毛利',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'enterDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '接收时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_SZBZCWF_CS',
                cid: 'publicReport',
                title: '1048-半制程外发参数',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'osPODate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '采购日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_yhqd',
                cid: 'publicReport',
                title: '1049-用户一览表',
                query: {
                    search: [
                        {type: 'input', field: '姓名', filter: true, style: {width: '100px'}, options: {placeholder: '姓名'}},
                    ],
                }
            },
            {
                id: 'lt_report_CPZDMX',
                cid: 'publicReport',
                title: '1050-成品销售对账明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'enterDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '对账日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_wuhao',
                cid: 'publicReport',
                title: '1051-1物耗',
                query: {
                    search: [
                        {type: 'select', load: 'company', field: 'company', options: {placeholder: '生产工厂'}},
                        {type: 'month', field: 'enterDate', value: core.date.time('YYYY-MM'), options: {placeholder: '建单日期'}},
                    ],
                }
            },
            {
                id: 'lt_report_lingliao',
                cid: 'publicReport',
                title: '1051-2领料单明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'requestedDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '领料日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_meParameters',
                cid: 'publicReport',
                title: '1052-工艺参数',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_zkcs',
                cid: 'publicReport',
                title: '1052-1钻孔工艺参数',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {type: 'input', field: 'partNum', style: {width: '150px'}, options: {placeholder: '生产型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_deptuser',
                cid: 'publicReport',
                title: '1053-部门成员',
                query: {
                    search: [
                        {type: 'input', field: '部门名称', filter: true, style: {width: '80px'}, options: {placeholder: '部门名称'}},
                        {type: 'input', field: '用户姓名', filter: true, style: {width: '100px'}, options: {placeholder: '用户姓名'}},
                    ],
                }
            },
            {
                id: 'lt_report_CG_BJCX',
                cid: 'publicReport',
                title: '1054-采购报价明细',
                query: {
                    search: [
                        /* {type: 'input', field: 'gys', style: {width: '150px'}, options: {placeholder: '供应商名称'}},
                         {type: 'input', field: 'wl', style: {width: '150px'}, options: {placeholder: '物料名称'}},*/
                        {type: 'input', field: '供应商名称', filter: true, style: {width: '150px'}, options: {placeholder: '供应商名称'}},
                        {type: 'input', field: '物料名称', filter: true, style: {width: '150px'}, options: {placeholder: '物料名称'}},
                    ],
                }
            },
            {
                id: 'lt_report_CW_DZHZ',
                cid: 'publicReport',
                title: '1055-销售对账汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'enterDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '录入日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_kcpd',
                cid: 'publicReport',
                title: '1056-成品盘点表下载',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_CW_zydcx',
                cid: 'publicReport',
                title: '1057-作业单查询',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_CW_ksgl',
                cid: 'publicReport',
                title: '1059-客诉管理按审批时间',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'approveTime',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '通过时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_gxgxb',
                cid: 'publicReport',
                title: '1062-1工序关联部门',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: '工厂名称', filter: true, options: {placeholder: '工厂名称'}},
                        {type: 'select', load: 'step', field: '工序名称', filter: true, options: {placeholder: '工序名称'}},
                        {type: 'select', load: 'process', field: '工艺名称', filter: true, options: {placeholder: '工艺名称'}},
                    ],
                }
            },
            {
                id: 'lt_report_userqx',
                cid: 'publicReport',
                title: '1062-2用户权限',
                query: {
                    search: [
                        {type: 'input', field: '用户姓名', filter: true, style: {width: '80px'}, options: {placeholder: '用户姓名'}},
                    ],
                }
            },
            {
                id: 'lt_report_usergroup',
                cid: 'publicReport',
                title: '1062-3用户组成员',
                query: {
                    search: [
                        {type: 'input', field: '组名', filter: true, style: {width: '80px'}, options: {placeholder: '组名'}},
                        {type: 'input', field: '用户姓名', filter: true, style: {width: '80px'}, options: {placeholder: '用户姓名'}},
                    ],
                }
            },
            {
                id: 'lt_report_cgqjcx',
                cid: 'publicReport',
                title: '1063-物料采购欠交查询',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'entDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '采购日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_caigou02',
                cid: 'publicReport',
                title: '1064-寄售采购明细查询',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'date', field: 'entDate',
                            value: core.date.time('YYYY-MM-DD'),
                            options: {placeholder: '会计期间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_cgddcx',
                cid: 'publicReport',
                title: '1065-物料采购订单查询',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', style: {width: '150px'}, options: {placeholder: '生产工厂'}},
                        {type: 'input', field: 'supCode', style: {width: '200px'}, options: {placeholder: '供应商代码'}},
                        {type: 'input', field: 'materCode', style: {width: '200px'}, options: {placeholder: '物料编码'}},
                        {
                            type: 'rangeTime', field: 'entDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '采购日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtakhjqkhjhdc',
                cid: 'publicReport',
                title: '1066-按客户交期计划达成',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'requestDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '客户交期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtascjqkhjhdc',
                cid: 'publicReport',
                title: '1067-按市场交期计划达成',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'requestDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '客户交期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_canshu',
                cid: 'publicReport',
                title: '1068-成本参数',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_ylsy',
                cid: 'publicReport',
                title: '1069-余料使用',
                query: {
                    search: [
                        {type: 'input', field: '制造订单(留)', filter: true, options: {placeholder: '制造订单(留)'}},
                        {type: 'input', field: '生产型号(留)', filter: true, options: {placeholder: '生产型号(留)'}},
                        {type: 'input', field: '制造订单(用)', filter: true, options: {placeholder: '制造订单(用)'}},
                        {type: 'input', field: '生产型号(用)', filter: true, options: {placeholder: '生产型号(用)'}},
                        {type: 'input', field: '物料编码', filter: true, options: {placeholder: '物料编码'}},
                        {type: 'input', field: '规格', filter: true, options: {placeholder: '规格'}},
                        {type: 'input', field: '批次号', filter: true, options: {placeholder: '批次号'}},
                    ],
                }
            },

            {
                id: 'lt_report_suiliao',
                cid: 'publicReport',
                title: '1070-余料汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_CG_DZHZ',
                cid: 'publicReport',
                title: '1071-采购对账汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建立日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtmrjdtj',
                cid: 'publicReport',
                title: '1072-每日接单统计',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_mixdwctj',
                cid: 'publicReport',
                title: '1073-MI新单每日完成',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'lastModifyDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '更新时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_costWoBalance',
                cid: 'publicReport',
                title: '1074-1成本计算平衡表',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'date', field: 'starting',
                            value: core.date.time('YYYY-MM-DD'),
                            options: {placeholder: '会计期间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_zh_wcxl_zh',
                cid: 'publicReport',
                title: '1075-珠海线路干膜油墨',
                query: {
                    search: [
                        {type: 'input', field: '生产编号', filter: true, style: {width: '100px'}, options: {placeholder: '生产编号'}},
                        {type: 'input', field: '工单号', filter: true, style: {width: '120px'}, options: {placeholder: '工单号'}},
                    ],
                }
            },
            {
                id: 'lt_report_ZHBZCWF_CS',
                cid: 'publicReport',
                title: '1076-珠海半制程外发参数',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '采购日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_danzhong',
                cid: 'publicReport',
                title: '1077-生产型号单重',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_gccs',
                cid: 'publicReport',
                title: '1078-工程参数（要求）',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_cost01',
                cid: 'publicReport',
                title: '1080-1订单成本',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'date', field: 'shippedDate',
                            value: core.date.time('YYYY-MM-DD 00:00:00'),
                            options: {placeholder: '出货日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_cost02',
                cid: 'publicReport',
                title: '1080-2型号成本',
                query: {
                    search: [
                        {
                            type: 'time', field: 'ending',
                            value: core.date.time('YYYY-MM-DD 00:00:00'),
                            options: {placeholder: '会计期间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_cost03',
                cid: 'publicReport',
                title: '1080-3出货毛利',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'time', field: 'date1',
                            value: core.date.time('YYYY-MM-DD 00:00:00'),
                            options: {placeholder: '出货日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_cost04',
                cid: 'publicReport',
                title: '1080-4出货成本明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'month', field: 'shippedDate',
                            value: core.date.time('YYYY-MM'),
                            options: {placeholder: '出货月份'}
                        },
                    ],
                    tableConfig: {autoLoad: false,},
                }
            },
            {
                id: 'lt_report_cost05',
                cid: 'publicReport',
                title: '1080-5成品月结',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '会计日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_cost_rkcb',
                cid: 'publicReport',
                title: '1080-6入库成本',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'date', field: 'date1',
                            value: core.date.time('YYYY-MM-DD 00:00:00'),
                            options: {placeholder: '会计日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_cost06',
                cid: 'publicReport',
                title: '1080-7物料月结',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '会计日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_bomwlcbjs2',
                cid: 'publicReport',
                title: '1080-8BOM物料成本v3',
                query: {
                    search: [
                        {type: 'select', load: 'job', remote: true, field: 'job', options: {empty: "请输入型号", placeholder: '生产型号', style: "width:290px"}},
                    ],
                }
            },
            {
                id: 'lt_report_wlxz',
                cid: 'publicReport',
                title: '1080-9物料领用限制',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'input', field: 'name', style: {width: '150px'}, options: {placeholder: '物料名称'}},
                    ],
                }
            },
            {
                id: 'lt_report_cost07',
                cid: 'publicReport',
                title: '1080-10工单成本明细',
                query: {
                    search: [
                        {
                            type: 'date', field: 'starting',
                            value: core.date.time('YYYY-MM-DD'),
                            options: {placeholder: '会计日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_caigoumingxi',
                cid: 'publicReport',
                title: '1082-采购对账明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '收货日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtxdbpmx',
                cid: 'publicReport',
                title: '1083-订单销货不平明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-01-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '建单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jhffmx',
                cid: 'publicReport',
                title: '1084-工单发放',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {type:  'select',load: 'process', field: 'process', options: {title:'包含工序', placeholder: '包含工序'}},
                        {type:  'select',load: 'job', field: 'jobId', options: {style:"width:300px",title:'型号', placeholder: '型号'}},
                        {type: 'select', field: 'moType', options: {options:moTypeOptions,title:'投产类型',placeholder: '投产类型'}},
                        {type: 'select', field: 'woStatus', options: {options:woStatusOptions,title:'工单状态',placeholder: '工单状态'}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {title:'发放日期',placeholder: '发放日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_CW_jttccx',
                cid: 'publicReport',
                title: '1085-投产报废',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '投产日期'}
                        },
                    ],
                }

            },
            {
                id: 'lt_report_tc_bf_bl',
                cid: 'publicReport',
                title: '1085-1投产报废补料',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {type: 'input', field: 'partNum', style: {width: '150px'}, options: {placeholder: '生产型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_fgwo',
                cid: 'publicReport',
                title: '1086-在线返工过数',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtzjltj',
                cid: 'publicReport',
                title: '1087-1订单准交率',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '客户交期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtmyxdhz',
                cid: 'publicReport',
                title: '1087-2每月下单汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_hbltmyxdqktj',
                cid: 'publicReport',
                title: '1087-3每月接单统计',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_hbltmychqktj',
                cid: 'publicReport',
                title: '1087-4湖北每月出货统计',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_hbltmychcsfltj',
                cid: 'publicReport',
                title: '1087-5每月出货层数分类',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_xbsjmx',
                cid: 'publicReport',
                title: '1088-箱包送检单明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'submissionDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '送检日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_jtecnmx',
                cid: 'publicReport',
                title: '1089-集团ECN明细查询',
                query: {
                    search: [
                        {type: 'select', load: 'company', field: 'company', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'submissionDate',
                            value: [core.date.time('YYYY-01-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '创建日期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_dd_tc_ch_jc_cy',
                cid: 'publicReport',
                title: '1090-投产出入库结存差异',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                    ],
                }
            },
            {
                id: 'lt_report_kcddmxcx',
                cid: 'publicReport',
                title: '1091-库存订单明细',
            },
            {
                id: 'lt_report_orderchuhuokucun',
                cid: 'publicReport',
                title: '1092-型号每月订单与出货',
                query: {
                    search: [
                        {type: 'rangeDate', field: 'time', value: core.date.list().month['本月'], options: {placeholder: '查询范围'}},
                    ],
                }
            },
            {
                id: 'lt_report_fxrk',
                cid: 'publicReport',
                title: '1093-成品返修入库查询',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '下单时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_scfdcbcsb',
                cid: 'publicReport',
                title: '1094-市场返单成本参数表',
                query: {
                    search: [
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-01 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '创建时间'}
                        },
                        {type: 'input', field: 'salesPartNum', options: {placeholder: '生产编号'}, style: {width: '200px'}},
                        {type: 'input', field: 'custMatCode', options: {placeholder: '客户物料号'}, style: {width: '200px'}},
                        {type: 'input', field: 'salesPartName', options: {placeholder: '客户型号'}, style: {width: '200px'}},
                        {type: 'select', load: 'customer', field: 'code', options: {placeholder: '客户代码'}},
                    ],
                }
            },
            {
                id: 'lt_report_ZHBZJGCS',
                cid: 'publicReport',
                title: '1095-珠海半制程加工参数',
            },
            {
                id: 'lt_report_materials_bc',
                cid: 'publicReport',
                title: '1096-1板材属性对比',
                query: {
                    search: [
                        {type: 'input', field: 'code', filter: true, style: {width: '120px'}, options: {placeholder: '编码'}},
                        {type: 'input', field: 'standard', filter: true, style: {width: '300px'}, options: {placeholder: '规格'}},
                        {type: 'input', field: 'userdef01', filter: true, style: {width: '120px'}, options: {placeholder: '品牌'}},
                        {type: 'input', field: 'userdef02', filter: true, style: {width: '120px'}, options: {placeholder: '型号'}},
                        {type: 'input', field: 'orgtype', filter: true, style: {width: '120px'}, options: {placeholder: '类型'}},
                        {type: 'input', field: 'watermark', filter: true, style: {width: '100px'}, options: {placeholder: '水印'}},
                        {type: 'input', field: 'thickcu', filter: true, style: {width: '100px'}, options: {placeholder: '含铜'}},
                        {type: 'input', field: 'haligonfree', filter: true, style: {width: '100px'}, options: {placeholder: '卤素'}},
                        {type: 'input', field: 'userdef20', filter: true, style: {width: '100px'}, options: {placeholder: '铜厚'}},
                    ],
                }
            },
            {
                id: 'lt_report_materials_bghp',
                cid: 'publicReport',
                title: '1096-2半固化片属性对比',
                query: {
                    search: [
                        {type: 'input', field: 'code', filter: true, style: {width: '120px'}, options: {placeholder: '编码'}},
                        {type: 'input', field: 'standard', filter: true, style: {width: '300px'}, options: {placeholder: '规格'}},
                        {type: 'input', field: 'userdef01', filter: true, style: {width: '120px'}, options: {placeholder: '品牌'}},
                        {type: 'input', field: 'userdef02', filter: true, style: {width: '120px'}, options: {placeholder: '型号'}},
                        {type: 'input', field: 'orgtype', filter: true, style: {width: '120px'}, options: {placeholder: '类型'}},
                    ],
                }
            },
            {
                id: 'lt_report_materials_tb',
                cid: 'publicReport',
                title: '1096-3铜箔属性对比',
                query: {
                    search: [
                        {type: 'input', field: 'code', filter: true, style: {width: '120px'}, options: {placeholder: '编码'}},
                        {type: 'input', field: 'standard', filter: true, style: {width: '300px'}, options: {placeholder: '规格'}},
                    ],
                }
            },
            {
                id: 'lt_report_materials_gm',
                cid: 'publicReport',
                title: '1096-4干膜属性对比',
                query: {
                    search: [
                        {type: 'input', field: 'code', filter: true, style: {width: '120px'}, options: {placeholder: '编码'}},
                        {type: 'input', field: 'standard', filter: true, style: {width: '300px'}, options: {placeholder: '规格'}},
                        {type: 'input', field: 'userdef01', filter: true, style: {width: '120px'}, options: {placeholder: '品牌'}},
                        {type: 'input', field: 'userdef02', filter: true, style: {width: '120px'}, options: {placeholder: '型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_materials_wzym',
                cid: 'publicReport',
                title: '1096-5文字油墨属性对比',
                query: {
                    search: [
                        {type: 'input', field: 'code', filter: true, style: {width: '120px'}, options: {placeholder: '编码'}},
                        {type: 'input', field: 'standard', filter: true, style: {width: '300px'}, options: {placeholder: '规格'}},
                        {type: 'input', field: 'userdef01', filter: true, style: {width: '120px'}, options: {placeholder: '品牌'}},
                        {type: 'input', field: 'userdef02', filter: true, style: {width: '120px'}, options: {placeholder: '型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_materials_zhym',
                cid: 'publicReport',
                title: '1096-6阻焊油墨属性对比',
                query: {
                    search: [
                        {type: 'input', field: 'code', filter: true, style: {width: '120px'}, options: {placeholder: '编码'}},
                        {type: 'input', field: 'standard', filter: true, style: {width: '300px'}, options: {placeholder: '规格'}},
                        {type: 'input', field: 'userdef01', filter: true, style: {width: '120px'}, options: {placeholder: '品牌'}},
                        {type: 'input', field: 'userdef02', filter: true, style: {width: '120px'}, options: {placeholder: '型号'}},
                    ],
                }
            },
            {
                id: 'lt_report_salesprofitvchat',
                cid: 'salesProfitVchat',
                title: '1097-销售利润表',
            },
            {
                id: 'lt_report_tcgymx',
                cid: 'publicReport',
                title: '1098-投产工艺流程表',
                icon: 'ri-play-list-add-line',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '工厂'}},
                        {
                            type: 'rangeTime', field: 'Date',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '时间'}
                        },
                    ]
                }
            },{
                id: 'lt_report_zhlcfl',
                cid: 'publicReport',
                title: '1099-ZHLCFL',
                icon: 'ri-play-list-add-line',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '时间'}
                        },
                    ]
                }
            },{
                id: 'lt_report_1462newseq',
                cid: 'publicReport',
                title: '1100-1462客户流水号',
                icon: 'ri-play-list-add-line',
                query: {
                    search: [
                        {type: 'input', field: 'salesPartNum', style: {width: '200px'}, options: {placeholder: '部件编号'}},
                    ],
                    menu:{approve:{hide:true},resetApprove:{hide:true},submitApprove:{hide:true},}
                }
            },{
                id: 'lt_report_0947newseq',
                cid: 'publicReport',
                title: '1100-0947客户流水号',
                icon: 'ri-play-list-add-line',
                query: {
                    search: [
                        {type: 'input', field: 'salesPartNum', style: {width: '200px'}, options: {placeholder: '部件编号'}},
                    ],
                    menu:{approve:{hide:true},resetApprove:{hide:true},submitApprove:{hide:true},}
                }
            },
            {
                id: 'lt_report_gysjqdcl',
                cid: 'publicReport',
                title: '1101-物料供应商交期达成分析',
                icon: 'ri-play-list-add-line',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '工厂'}},
                        {
                            type: 'rangeTime', field: 'Date',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '时间'}
                        },

                    ],
                    menu:{approve:{hide:true},resetApprove:{hide:true},submitApprove:{hide:true},}
                }
            },{
                id: 'lt_report_fgcx',
                cid: 'publicReport',
                title: '1102-返工记录查询',
                icon: 'ri-play-list-add-line',
                query: {
                    search: [
                        {type: 'select', load: 'factory',value:[siyi.user.plantId], field: 'factory', options: {placeholder: '工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '时间'}
                        },

                    ],
                    menu:{approve:{hide:true},resetApprove:{hide:true},submitApprove:{hide:true},}
                }
            },
        ]
    },
    {
        id: 'pe',
        title: '工程',
        icon: 'ri-bnb-fill',
        items: [
            {
                id: 'riskConfig_v240503',
                title: '风险警告',
                icon: 'ri-notification-2-fill',
            },
            {
                id: 'lt_report_ecnApprove',
                cid: 'ecnApprove',
                title: 'ECN审批',
                icon: 'ri-share-line',
            },
            {
                id: 'peorder',
                cid: 'peorder',
                title: '工程订单管理',
                icon: 'ri-share-line',
                api: [
                    apiUrl.pe.peorder.so_config,
                    apiUrl.pe.peorder.so_list,
                    apiUrl.pe.peorder.main_config,
                    apiUrl.pe.peorder.main_list,
                    apiUrl.pe.peorder.orderinfo,
                ],
            },
            {
                id: 'openOrder',
                cid: 'openOrder',
                title: '可计划投放订单管理',
                icon: 'ri-share-line',
            },
            {
                id: 'jobParameter',
                title: '工程参数',
                icon: 'ri-file-settings-line',
                api: [
                    apiUrl.pe.jobParameter.list,
                ],
            },
            {
                id: 'lt_report_zk_holds',
                cid: 'publicReport',
                title: '钻带孔数',
                query: {
                    menu:{
                        approve:{hide:true},resetApprove:{hide:true},submitApprove:{hide:true},
                        showMi: {title: '查看MI', sort: 105, icon: 'ri-file-pdf-2-line', listAction: (list, reportTable) => ApiRequest.showMi(list, reportTable, 'jobid')}
                    },
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'},value: [siyi.user.plantId]},
                        {type: 'select', load: 'customer', field: 'custId', options: {minCollapsedNum:1,style:"width:160px",placeholder: '客户代码'}},
                        {type: 'select', load: 'job', remote: true, field: 'job', options: {empty: "请输入型号", placeholder: '生产型号', style: "width:290px"}},
                        {type: 'select',  field: 'status', options: {options:jobStatusOptions,placeholder: '状态', style: "width:160px"}},
                        {type: 'select',  field: 'approveStatus', options: {options:jobApproveStatus,placeholder: '审批状态', style: "width:160px"}},
                        {
                            type: 'rangeTime', field: 'date',
                            value: [core.date.list().startMonth['本月'], core.date.list().endMonth['本月']],
                            options: {placeholder: '创建时间'}
                        },
                    ],
                    tableConfig: {
                        showCheck: true,
                        options: {select: {outsideClickDeselect: false}}
                    },
                }
            },
        ]
    },
    {
        id: 'sc',
        title: '计划',
        icon: 'ri-exchange-funds-line',
        items: [
            {
                id: 'lt_report_workOrderStatusQuery',
                cid: 'workOrderStatusQuery_v241120',
                title: '在线工单管理',
                icon: 'ri-bar-chart-box-ai-line',
                api: [
                    apiUrl.sc.workOrderStatusQuery.index,
                    apiUrl.sc.workOrderStatusQuery.jiecun,
                    apiUrl.sc.workOrderStatusQuery.kucun,
                    apiUrl.sc.workOrderStatusQuery.planGettime,
                    apiUrl.sc.workOrderStatusQuery.guoshu,
                    // apiUrl.sc.workOrderStatusQuery.order,
                    // apiUrl.sc.workOrderStatusQuery.process,
                    apiUrl.sc.workOrderStatusQuery.mobom,
                    apiUrl.sc.workOrderStatusQuery.baofei,
                    apiUrl.sc.workOrderStatusQuery.wolog,
                    apiUrl.sc.workOrderStatusQuery.getholiday,
                ],
            },
            {
                id: 'lt_report_salesplantouchan', cid: 'publicReport', icon: 'ri-bar-chart-box-ai-line', title: 'TOC排单未投产明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'plant', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'job', remote: true, field: 'job', options: {empty: "请输入型号", placeholder: '生产型号', style: "width:290px"}},
                    ],
                }
            },
            {
                id: 'lt_report_plandcl', cid: 'publicReport', title: 'TOC排产达成率',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'step', field: 'stepid', options: {placeholder: '工序'}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'moWaitingMaterials', title: '计划备料',
                api: [
                    apiUrl.sc.moWaitingMaterials.list,
                    apiUrl.sc.moWaitingMaterials.materials,
                ],
            },
            {
                id: 'lt_report_momx2',
                cid: 'publicReport',
                title: '投产明细',
                // group: 'lt_report_momx',
                // groupIcon: true,
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'rangeTime', field: 'createDate', value: core.date.list().month['7天内'], options: {placeholder: '建单时间'}},
                    ],
                }
            },
            // {
            //     id: 'salesOrderQuery_v240814',
            //     title: '在线订单查询',
            //     icon: 'ri-bar-chart-box-ai-line',
            // },
            {
                id: 'lt_report_chanchuDetails', cid: 'publicReport', title: '产出明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'step', field: 'stepid', options: {placeholder: '工序'}},
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {type: 'input', field: 'salespartname', options: {placeholder: '客户型号'}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                    tableConfig: {
                        autoLoad: false,
                    },
                },

            },
            {
                id: 'lt_report_scrb_v2', cid: 'publicReport', title: '产出汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 08:00:00'), core.date.time('YYYY-MM-DD 19:59:59')],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                    tableConfig: {
                        autoLoad: false,
                    },
                },
            },
            {
                id: 'lt_report_chanchuProcessDay', cid: 'publicReport', title: '产出汇总(工序+天)',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'job', field: 'jobid', remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.time('YYYY-MM-DD 08:00:00'), core.date.time('YYYY-MM-DD 19:59:59')],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                    tableConfig: {
                        autoLoad: false,
                    },
                },
            },
            {
                id: 'lt_report_scrb_layer_v1', cid: 'publicReport', title: '产出汇总(工序+层)',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'createDate',
                            value: [core.date.time('YYYY-MM-DD 08:00:00'), core.date.time('YYYY-MM-DD 19:59:59')],
                            options: {placeholder: '建单时间'}
                        },
                    ],
                    tableConfig: {
                        autoLoad: false,
                    },
                },

            },
            {
                id: 'lt_report_chanchuDetails_CNJ', cid: 'publicReport', title: '产出明细(B沉镍金)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_CCNJ', cid: 'publicReport', title: '产出明细(C沉镍金)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_BDJS', cid: 'publicReport', title: '产出明细(B镀金手指)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_CDJS', cid: 'publicReport', title: '产出明细(C镀金手指)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_woccmx_bd', cid: 'publicReport', title: '产出明细(B板电)',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'receivedTime',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '接收时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_woccmx_et', cid: 'publicReport', title: '产出明细(B二铜)',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeTime', field: 'receivedTime',
                            value: [core.date.time('YYYY-MM-DD 00:00:00'), core.date.time('YYYY-MM-DD 23:59:59')],
                            options: {placeholder: '接收时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_CDD', cid: 'publicReport', title: '产出明细(C电镀)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {type: 'select', load: 'process', field: 'processid', options: {placeholder: '工艺名称'}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_BZH', cid: 'publicReport', title: '产出明细(B阻焊)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_BZK', cid: 'publicReport', title: '产出明细(B钻孔)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_CZK', cid: 'publicReport', title: '产出明细(C钻孔)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_chanchuDetails_CXB', cid: 'publicReport', title: '产出明细(C铣边)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },
           /* {
                id: 'lt_report_chanchuDetails_CKL', cid: 'publicReport', title: '产出明细(C开料)',
                query: {
                    search: [
                        {type: 'select', field: 'jobid', load: "job", remote: true, options: {empty: "请输入型号", placeholder: '生产型号', style: "width:265px"}},
                        {
                            type: 'rangeTime', field: 'time',
                            value: [core.date.list().startMonth['今天'], core.date.list().endMonth['今天']],
                            options: {placeholder: '产出时间'}
                        },
                    ],
                }
            },*/
            /*    {
                    id: 'woPlan',
                    title: '计划排产',
                    icon: 'ri-play-list-add-line',
                    api: [apiUrl.sc.woPlan.list],
                    query: {
                        search: [
                            {type: 'select', load: 'factory', field: 'factory', options: {placeholder: '生产工厂'}},
                            {type: 'select', load: 'step', field: 'stepid', options: {placeholder: '工序'}},
                            {type: 'input', field: 'partnum', options: {placeholder: '生产型号'}, style: {width: '160px'}},
                            {type: 'input', field: 'wonumber', options: {placeholder: '工单号'}},
                            {type: 'input', field: 'monumber', options: {placeholder: '制造单号'}, style: {width: '150px'}},
                            {type: 'input', field: 'sonumber', options: {placeholder: '销售订单号'}, style: {width: '150px'}},
                            {
                                type: 'select', field: 'woplanstatus', options: {
                                    placeholder: '排产状态', options: [
                                        {label: '未排产', value: -1},
                                        {label: '生产中', value: 1},
                                        {label: '暂停中', value: 0},
                                    ]
                                }
                            },
                        ],
                    }
                },
                {
                    id: 'woPlanReport',
                    title: '工序排产看板',
                    icon: 'ri-play-list-add-line',
                    api: [apiUrl.dataCenter.woPlanReport, apiUrl.dataCenter.woPlanReportDcl],
                    query: {
                        search: [
                            {type: 'select', load: 'factory', filter: true, field: 'scgc', options: {placeholder: '生产工厂'}},
                            {type: 'select', load: 'step', filter: true, field: 'stepname', options: {placeholder: '工序'}},
                            // {type: 'input', field: 'partnum', options: {placeholder: '生产型号'}},
                            // {type: 'input', field: 'wonumber', options: {placeholder: '工单号'}},
                            // {type: 'input', field: 'monumber', options: {placeholder: '制造单号'}},
                        ],
                    }
                },*/
            {id: 'packingStandard_v240524', title: '包装标准看板', icon: 'ri-layout-5-line'},
            {id: 'rukuScanCode', title: '成品入库检测'},
            // {id: 'testStand_v240816', title: '测试架看板', icon: 'ri-layout-masonry-fill'},
            {id: 'job_weight', title: '单SET重量采集', icon: 'ri-weight-line', api: [apiUrl.erp.job.getWeight], query: {type: 'SET'}},
            {id: 'job_weight_pnl', cid: 'job_weight', title: '单PNL重量采集', icon: 'ri-weight-line', api: [apiUrl.erp.job.getWeight], query: {type: 'PNL'}},
            {id: 'materialStock', title: '物料库存看板', icon: 'ri-home-9-line',api:[apiUrl.sc.warehouse.materialStock]},
            {id: 'materialStock_173',cid: 'materialStock', title: '物料库存看板(B板材仓)', icon: 'ri-home-9-line',
                api:[apiUrl.sc.warehouse.materialStock],
                query:{warehouse:['173'],title:'物料库存看板'},
            },
            {
                id: 'mesHoliday',
                cid: 'mesHoliday',
                title: 'mes-节假日',
                icon: 'ri-zzz-line',
                api: [
                    apiUrl.sc.mesHoliday.holiday_config,
                    apiUrl.sc.mesHoliday.holiday_list,
                    apiUrl.sc.mesHoliday.holiday_add,
                    apiUrl.sc.mesHoliday.holiday_del,
                ],
            },

        ]
    },
    {
        id: 'sales', title: '市场', icon: 'ri-money-dollar-circle-fill',
        items: [
            {
                id: 'salesOrderPlan',
                title: 'TOC订单排单',
                icon: 'ri-play-list-add-line',
                api: [apiUrl.sales.salesOrderPlan.index, apiUrl.sales.salesOrderPlan.huizong],
            },
            {
                id: 'lt_report_salesplandacheng', cid: 'publicReport', icon: 'ri-bar-chart-box-ai-line', title: 'TOC订单达成明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'plant', options: {placeholder: '生产工厂'}},
                        {type: 'select', load: 'job', remote: true, field: 'job', options: {empty: "请输入型号", placeholder: '生产型号', style: "width:290px"}},
                        {
                            type: 'rangeDate', field: 'rangeDate',
                            value: [core.date.time('YYYY-MM-01'), core.date.time('YYYY-MM-DD')],
                            options: {placeholder: '排单交期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_orderdcl', cid: 'publicReport', icon: 'ri-bar-chart-box-ai-line', title: 'TOC订单达成汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'plant', value: [1], options: {placeholder: '生产工厂'}},
                        {
                            type: 'rangeDate', field: 'time',
                            value: [core.date.time('YYYY-MM-01'), core.date.time('YYYY-MM-DD')],
                            options: {placeholder: '排单交期'}
                        },
                    ],
                }
            },
            {
                id: 'lt_report_salesOrderQuery',
                cid: 'salesOrderStatusQuery_v241120',
                icon: 'ri-bar-chart-box-ai-line',
                title: '在线订单查询',
                api: [
                    apiUrl.sales.salesOrderStatusQuery.index,
                    apiUrl.sales.salesOrderStatusQuery.jiecun,
                    apiUrl.sales.salesOrderStatusQuery.kucun,
                ],

            },
            // {id: 'byd_price', title: 'BYD报价表', icon: 'ri-money-dollar-circle-fill', api: [apiUrl.table.byd_price.list]},
            // {id: 'byd_toubiao', title: 'BYD投标表', icon: 'ri-money-dollar-circle-fill', api: [apiUrl.table.byd_toubiao.list]},
            {
                id: 'salesPartsSyncBaineng', title: '销售部件同步百能数据', icon: 'ri-money-dollar-circle-fill',
                api: [
                    apiUrl.sales.salesPartsSyncBaineng.getsalesparts,
                    apiUrl.sales.salesPartsSyncBaineng.index,
                ],
            },
            {
                id: 'bainengSyncOrder', title: '百能订单推送', icon: 'ri-money-dollar-circle-fill',
                api: [
                    apiUrl.sales.bainengSyncOrder.main_config,
                    apiUrl.sales.bainengSyncOrder.main_list,
                ],
            },
            {
                id: 'biz_customer', title: '客户报备', icon: 'ri-money-dollar-circle-fill',
                api: [
                    apiUrl.table.biz_customer.list,
                    apiUrl.table.biz_customer.logs,
                    // apiUrl.table.biz_customer.save,
                    // apiUrl.table.biz_customer.set,
                    // apiUrl.table.biz_customer.update,
                ],
            },
        ]
    },
    {
        id: 'qa', title: '品质', icon: 'ri-heart-pulse-fill',
        items: [
            {
                id: 'packingSlip_v20240507',
                title: '邮件发送',
                icon: 'ri-mail-send-line',
                api: [apiUrl.packingSlip.order.list],
            },
            {
                id: 'packingSlipConfig_v20240507',
                title: '邮件配置',
                api: [apiUrl.packingSlip.config.list],
            },
            {
                id: 'flow_order_v240817',
                title: '承认书',
                query: {type: 'erpContractItem'},
                api: [apiUrl.flow.order.list],
            },
            {
                id: 'flow_item_v240817',
                title: '承认书配置',
                query: {type: 'erpContractItem'},
                api: [apiUrl.flow.item.list],
            },
            {
                id: 'form_table_list_v240620',
                title: '报告制作',
                api: [apiUrl.form.table.list],
            },
            {
                id: 'form_table_detail_v240620',
                title: '报告详情',
                show: false,
                filter: false,
            },
            {
                id: 'form_tpl_list_v240620',
                title: '报告模板',
                api: [apiUrl.form.tpl.list],
            },
            {
                id: 'form_tpl_detail_v240620',
                title: '模板详情',
                show: false,
                filter: false,
            },
            {
                id: 'form_field_v240620',
                title: '报告字段',
                api: [apiUrl.form.field.list],
            },

            {
                id: 'wo_case_v240730',
                title: '客诉',
                api: [apiUrl.wo.case.list],
                scope: 'admin',
            },
            {
                id: 'wo_bill_v240802',
                title: '费用',
                api: [apiUrl.wo.bill.list],
                scope: 'admin',
            }
        ]
    },
    {
        id: 'pr',
        title: '采购',
        icon: 'ri-shopping-bag-3-fill',
        items: [
            {
                id: 'outwork_money',
                title: '全制程外发费用',
                query: {type: 'po-item'},
                api: [apiUrl.outwork.money.list,],
            },
            {
                id: 'lt_report_os_po_price',
                cid: 'publicReport',
                title: '外协-采购明细',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'plant', options: {placeholder: '工厂'}},
                        {type: 'select', load: 'supplier', field: 'supplier', options: {placeholder: '供应商', style: "min-width:100px"}},
                        {type: 'select', load: 'job', remote: true, field: 'job', options: {placeholder: '型号', style: "min-width:244px"}},
                        {type: 'select', load: 'os_po_type', field: 'os_po_type', options: {placeholder: '类型', style: "min-width:244px"}},
                        {type: 'input', field: 'poNumber', options: {placeholder: '外协单号'}, style: {width: '160px'}},
                        {
                            type: 'rangeDate', field: 'orderDate',
                            value: [core.date.time('YYYY-MM-DD'), core.date.time('YYYY-MM-DD')],
                            options: {placeholder: '采购时间'}
                        },
                    ],
                    menu: {
                        approve:{hide:true},resetApprove:{hide:true},submitApprove:{hide:true},
                        savePrice: {title: '保存价格', sort: 105, icon: 'ri-save-line', listAction: ApiRequest.lt_report_os_po_price.savePrice},
                        showMi: {title: '查看MI', sort: 105, icon: 'ri-file-pdf-2-line', listAction: (list, reportTable) => ApiRequest.showMi(list, reportTable, 'jobid')}
                    },
                    tableConfig: {
                        showCheck: true,
                        options: {select: {outsideClickDeselect: false}}
                    },
                },
            },
            {
                id: 'outwork_order',
                title: '外协-订单',
                api: [apiUrl.outwork.order.list,],
            },
            {
                id: 'outwork_pack',
                title: '外协-送货单',
                api: [apiUrl.outwork.order.list,],
            },
            {
                id: 'outwork_log',
                title: '外协-操作记录',
                api: [apiUrl.outwork.log.list]
            },
        ]
    },
    {
        id: 'office',
        title: '行政',
        icon: 'ri-user-heart-line',
        items: [
            {
                id: 'visitor',
                title: '来访预约',
                icon: "ri-roadster-fill",
                api: [
                    apiUrl.visitor.apply.list,
                    apiUrl.visitor.apply.detail,
                    apiUrl.visitor.apply.log,
                    apiUrl.visitor.apply.save,
                    apiUrl.visitor.apply.set,
                ],
            },
            {
                id: 'checkin',
                title: '来访核销',
                icon: "ri-roadster-fill",
                api: [
                    apiUrl.visitor.apply.checkin,
                    apiUrl.visitor.apply.detail,
                ],
            }
        ],
    },
    {
        id: 'asset',
        title: '资产',
        icon: 'ri-macbook-line',
        items: [
            {
                id: 'asset_check',
                title: '资产盘点',
                icon: 'ri-computer-line',
                auth: true,
                scope: 'employee',
                // api: [apiUrl.asset.list.list, apiUrl.asset.list.value],
            },
            {
                id: 'asset_list',
                title: '资产管理',
                icon: 'ri-computer-line',
                query: {
                    menuHide: ['import', 'export'],
                }
            },
            {
                id: 'asset_list_1',
                cid: 'asset_list',
                title: '电子设备管理',
                icon: 'ri-computer-line',
                query: {
                    cate_id: ASSET_CATE_ID_ELECTRONIC,
                    addDefault: {status: 1},
                    menuHide: ['setAreaRemark', 'cate', 'attr', 'bind', 'area'],
                    hide_fields: ['area_remark'],
                },
                api: [apiUrl.asset.list.list, apiUrl.asset.list.value],
            },
            {
                id: 'asset_list_44',
                cid: 'asset_list',
                title: '测试架管理',
                icon: 'ri-tools-line',
                query: {
                    cate_id: ASSET_CATE_ID_TEST_BENCH, addDefault: {status: 1},
                    hide_fields: ['code', 'area_full_name', 'manager_name', 'manager_remark', 'manager_at', 'manager_dept', 'check_at', 'check_uid', 'check_uid_text'],
                    columns: {
                        cate_full_name: {width: '120px'},
                        name: {width: '160px'},
                    },
                    menuHide: ['print_s', 'print_m', 'setCate', 'setArea', 'setUser', 'setDept', 'cate', 'attr', 'bind', 'area'],
                },
                api: [apiUrl.asset.list.list, apiUrl.asset.list.value],
            },
            {
                id: 'job_test_bench',
                title: '测试架看板',
                icon: 'ri-computer-line',
                query: {
                    hide_fields: ['code', 'area_full_name', 'manager_name', 'manager_remark', 'manager_at', 'manager_dept', 'check_at', 'check_uid', 'check_uid_text'],
                },
            },

        ]
    },
    {
        id: 'ac',
        title: '财务',
        icon: 'ri-bar-chart-box-ai-fill',
        items: [
            {
                id: 'pandian_wip',
                title: '在制品盘点表',
                icon: 'ri-draft-fill',
                api: [
                    apiUrl.ac.pandian.wip_config,
                    apiUrl.ac.pandian.wip_list,
                ],
            },
            {
                id: 'pandian_material',
                title: '原材料盘点表',
                icon: 'ri-draft-fill',
                api: [
                    apiUrl.ac.pandian.material_config,
                    apiUrl.ac.pandian.material_list,
                ],
            },
            {
                id: 'pandian_product',
                title: '成品库存盘点表',
                icon: 'ri-draft-fill',
                api: [
                    apiUrl.ac.pandian.product_config,
                    apiUrl.ac.pandian.product_list,
                ],
            },
            {
                id: 'pandian_step_material',
                title: '在线物料盘点表',
                icon: 'ri-draft-fill',
                api: [
                    apiUrl.ac.pandian.step_material_config,
                    apiUrl.ac.pandian.step_material_list,
                ],
            },
            {
                id: 'lt_report_hbccgxcbhz', cid: 'publicReport', title: '产出工序成本汇总',
                query: {
                    search: [
                        {type: 'select', load: 'factory', field: 'factory',value:[1],style: {width: '200px'}, options: {placeholder: '工厂'}},
                        {
                            type: 'date', field: 'period',style: {width: '300px'},
                            value: core.date.lastMonth('YYYY/M'),
                            options: {label:"会计期间：",mode:"month",placeholder: '会计期间',format:"YYYY/M"}
                        },
                    ],

                }
            },
        ]
    },
    {
        id: 'mes',
        title: 'MES',
        icon: 'ri-dashboard-fill',
        items: [
            {
                id: 'mes_production_report',
                title: '生产记录',
                icon: 'ri-play-list-add-line',
                //api: [apiUrl.sales.salesOrderPlan.index, apiUrl.sales.salesOrderPlan.huizong],
            },
            {
                id: 'mes_production_report_data',
                icon:'ri-community-line',
                title: '生产报表数据',
            },
        ]
    },
    {
        id: 'cost',
        title: '成本',
        icon: 'ri-calculator-line',
        items: [
            {
                id: 'cost_config',
                title: '标准成本-设置',
                icon: 'ri-computer-line',
                query: {},
            },
            {
                id: 'cost_index',
                title: '标准成本-数据',
                icon: 'ri-computer-line',
                query: {},
            },
            {
                id: 'sys_step_equipment',
                icon:'ri-community-line',
                query: {},
                title: '工序设置',
            },
            {
                id: 'sys_step_report',
                icon:'ri-community-line',
                query: {},
                title: '工序数据',
            },
            {
                id: 'sys_parameter',
                icon:'ri-community-line',
                query: {},
                title: '参数库',
            },
            {
                id: 'sys_parameter_rules',
                icon:'ri-community-line',
                query: {},
                title: '参数取值规则',
            },
            {
                id: 'siyi_job',
                icon:'ri-community-line',
                query: {},
                title: '虚拟MI',
            },
        ]
    },
    {
        id: 'system',
        title: '系统',
        icon: 'ri-dashboard-fill',
        scope: 'admin',
        items: [
            {
                id: 'user_auth_apply',
                icon:'ri-key-2-line',
                title: '权限审核',
            },
            {
                id: 'auth_item',
                icon:'ri-shield-keyhole-line',
                title: '权限管理',
            },
            {
                id: 'auth_item_lists',
                icon:'ri-shield-keyhole-line',
                title: '权限管理',
            },
            {
                id: 'user_list',
                icon:'ri-user-line',
                title: '用户管理',
            },
            {
                id: 'user_sns',
                icon:'ri-wechat-2-line',
                title: '微信登录',
            },
            {
                id: 'dept_position',
                icon:'ri-building-line',
                title: '部门管理',
            },
            {
                id: 'queue_list',
                icon:'ri-play-list-2-line',
                title: '任务队列',
            },
            {
                id: 'log_list',
                query: {type: 0},
                icon:'ri-file-history-line',
                title: 'API日志',
            },
            {
                id: 'log_list2',
                cid: 'log_list',
                icon:'ri-file-history-line',
                query: {type: 1},
                title: 'ERP日志',
            },
            {
                id: 'cache_list',
                icon: 'ri-database-2-fill',
                query: {},
                title: '缓存管理',
            },
            {
                id: 'dev_test',
                icon:'ri-flask-line',
                query: {},
                title: '测试',
            },
           /* {
                id: 'sys_step',
                icon:'ri-community-line',
                query: {},
                title: '工序',
            },
            {
                id: 'sys_process',
                icon:'ri-community-line',
                query: {},
                title: '工艺',
            },
            {
                id: 'sys_station',
                icon:'ri-community-line',
                query: {},
                title: '工段',
            },
            {
                id: 'sys_equipment',
                icon:'ri-community-line',
                query: {},
                title: '设备',
            },*/
            {
                id: 'sys_unit',
                icon:'ri-community-line',
                query: {},
                title: '单位',
            },
            {
                id: 'sys_employee',
                icon:'ri-community-line',
                query: {},
                title: '人员',
            },
            {
                id: 'sys_supplier',
                icon:'ri-community-line',
                query: {},
                title: '供应商',
            },
        ]
    },
    {
        id: 'favorites',
        title: '收藏',
        icon: 'ri-heart-3-fill',
        items: [],
    },
    {
        id: 'open',
        title: '已打开',
        icon: 'ri-folder-open-fill',
        items: [],
    },
])