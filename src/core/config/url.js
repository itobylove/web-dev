const apiUrl = new Proxy({
    base: '/api/',
    // userConfig: '/v1/user/config',
    // uploader: '/v1/common-api/upload',
    // jobSelector: '/v1/common-api/job-selector',
    // userSelector: '/v1/common-api/user-selector',
    // supplierSelector: '/v1/common-api/supplier-selector',
    // select: '/v1/common-api/selector',
    common: {
        jssdk: '/v1/common-api/jssdk',
        uploader: '/v1/common-api/upload',
        heartbeat: '/v1/common-api/heartbeat',
        // userSelector: '/v1/common-api/user-selector',
        // supplierSelector: '/v1/common-api/supplier-selector',
        selector: '/v1/common-api/selector',
        employeeSelector: '/v1/common-api/employee-selector',
        jobSelector: '/v1/common-api/job-selector',
    },
    erpReport: {
        mi: 'v1/erp-report/mi',
        osp: 'v1/erp-report/osp',
    },
    erp: {
        job: {
            'list': 'v1/erp/job/list',
            'testBench': 'v1/erp/job/test-bench',
            'getWeight': 'v1/erp/job/get-weight',
            'saveWeight': 'v1/erp/job/save-weight'
        }
    },
    user: {
        info: 'v1/user/info',//获取用户信息
        config: '/v1/user/config',//获取用户配置
        loginWx: 'v1/user/login-wx',//企业微信登录
        login: '/v1/user/login',//登录
        logout: '/v1/user/logout',//退出
        link: '/v1/user/link',//常用链接
        bindWeixin: '/v1/user/bind-weixin',//常用链接
    },
    visitor: {
        apply: {
            init: '/v1/visitor/apply/init',
            detail: '/v1/visitor/apply/detail',
            list: '/v1/visitor/apply/list',
            log: '/v1/visitor/apply/log',
            save: '/v1/visitor/apply/save',
            set: '/v1/visitor/apply/set',
            approval: '/v1/visitor/apply/approval',
            checkin: '/v1/visitor/apply/checkin',
            visitor: '/v1/visitor/apply/visitor',
        },
        scene: {
            list: '/v1/visitor/scene/list',
            save: '/v1/visitor/scene/save',
            set: '/v1/visitor/scene/set',
        },
        user: {
            list: '/v1/visitor/user/list',
            save: '/v1/visitor/user/save',
            set: '/v1/visitor/user/set',
        },
        log: {
            list: '/v1/visitor/log/list',
        }
    },
    asset: {
        list: {
            init: '/v1/asset/list/init',
            list: '/v1/asset/list/list',
            save: '/v1/asset/list/save',
            value: '/v1/asset/list/value',
            check: '/v1/asset/list/check',
            import: '/v1/asset/list/import',
            export: '/v1/asset/list/export',
            set: '/v1/asset/list/set',
        },
        cate: {
            list: '/v1/asset/cate/list',
            saveList: '/v1/asset/cate/save-list',
            save: '/v1/asset/cate/save',
            set: '/v1/asset/cate/set',
        },
        area: {
            list: '/v1/asset/area/list',
            saveList: '/v1/asset/area/save-list',
            save: '/v1/asset/area/save',
            set: '/v1/asset/area/set',
        },
        attr: {
            list: '/v1/asset/attr/list',
            saveList: '/v1/asset/attr/save-list',
            save: '/v1/asset/attr/save',
            set: '/v1/asset/attr/set',
        },
        bind: {
            list: '/v1/asset/bind/list',
            saveList: '/v1/asset/bind/save-list',
            save: '/v1/asset/bind/save',
            set: '/v1/asset/bind/set',
        },
    },
    system: {
        home: {
            index: '/v1/system/home/index',
        },
        cache: {
            init: '/v1/system/cache/init',
            list: '/v1/system/cache/list',
            delete: '/v1/system/cache/delete',
        },
        authItem: {
            list: '/v1/system/auth-item/list',
            import: '/v1/system/auth-item/import',
            set: '/v1/system/auth-item/set',
            save: '/v1/system/auth-item/save',
        },
        sns: {
            init: '/v1/system/sns/init',
            list: '/v1/system/sns/list',
            set: '/v1/system/sns/set',
            bind: '/v1/system/sns/bind',
        },
        user: {
            init: '/v1/system/user/init',
            list: '/v1/system/user/list',
            assignment: '/v1/system/user/assignment',
            position: '/v1/system/user/position',
            set: '/v1/system/user/set',
            update: '/v1/system/user/update',
            logout: '/v1/system/user/logout',
            command: '/v1/system/user/command',
            add: '/v1/system/user/add',
            password: '/v1/user/password',
        },
        dept_position: {
            init: '/v1/system/dept/init',
            list: '/v1/system/dept/list',
        },
        dept: {
            save: '/v1/system/dept/save',
            set: '/v1/system/dept/set',
        },
        position: {
            save: '/v1/system/position/save',
            set: '/v1/system/position/set',
            copy: '/v1/system/position/copy',
        },
        auth: {
            list: '/v1/system/auth/list',
            user: '/v1/system/auth/user',
            delete: '/v1/system/auth/delete',
            set: '/v1/system/auth/set',
            save: '/v1/system/auth/save',
            copy: '/v1/system/auth/copy',
        },
        authApply: {
            list: '/v1/system/auth-apply/list',
            audit: '/v1/system/auth-apply/audit',
            set: '/v1/system/auth-apply/set',
            add: '/v1/system/auth-apply/add',
        },
        log: {
            list0: '/v1/system/log/list',
            list1: '/v1/system/log/erp-login',
            set: '/v1/system/log/set',
        },
        queue: {
            list: '/v1/system/queue/list',
            set: '/v1/system/queue/set',
        },
        approvalInstance: {
            flowConfig: '/v2/system/approval-instance/flow-config',
            flowList: '/v2/system/approval-instance/flow-list',
            logsConfig: 'v2/system/approval-instance/logs-config',
            logsList: 'v2/system/approval-instance/logs-list',
            approval: '/v2/system/approval-instance/approval',
        }
    },
    publicReport: '/v2/dataCenter/public-report/index',
    ac: {
        pandian: {
            wip_config: '/v2/ac/pandian/wip-config',
            wip_list: '/v2/ac/pandian/wip-list',
            wip_create: '/v2/ac/pandian/wip-create',
            wip_send: '/v2/ac/pandian/wip-send',
            //wip_download: '/v2/ac/pandian/wip-download',
            material_config: '/v2/ac/pandian/material-config',
            material_list: '/v2/ac/pandian/material-list',
            material_create: '/v2/ac/pandian/material-create',
            material_send: '/v2/ac/pandian/material-send',
            //material_download: '/v2/ac/pandian/material-download',
            product_config: '/v2/ac/pandian/product-config',
            product_list: '/v2/ac/pandian/product-list',
            product_create: '/v2/ac/pandian/product-create',
            product_send: '/v2/ac/pandian/product-send',
            //product_download: '/v2/ac/pandian/product-download',
            step_material_config: '/v2/ac/pandian/step-material-config',
            step_material_list: '/v2/ac/pandian/step-material-list',
            step_material_send: '/v2/ac/pandian/step-material-send',
        }
    },
    sales: {
        salesOrderStatusQuery: {
            index: '/v2/sales/sales-order-status-query/index',
        },
        salesOrderPlan: {
            index: 'v2/sales/sales-order-plan/index',
            cancel: 'v2/sales/sales-order-plan/cancel',
            huizong: 'v2/sales/sales-order-plan/huizong',
            plan: 'v2/sales/sales-order-plan/plan',
            getchanneng: 'v2/sales/sales-order-plan/getchanneng',
            setchanneng: 'v2/sales/sales-order-plan/setchanneng',
        },
        salesPartsSyncBaineng: {
            index: '/v2/sales/sales-parts-sync-baineng/index',
            sync: 'v2/sales/sales-parts-sync-baineng/sync',
            unlink: 'v2/sales/sales-parts-sync-baineng/unlink',
            noticeems: 'v2/sales/sales-parts-sync-baineng/noticeems',
            getsalesparts: 'v2/sales/sales-parts-sync-baineng/getsalesparts',
        },
        bainengSyncOrder: {
            main_config: 'v2/sales/baineng-sync-order/main-config',
            main_list: 'v2/sales/baineng-sync-order/main-list',
            update_status: 'v2/sales/baineng-sync-order/update-status',
            del: 'v2/sales/baineng-sync-order/del',
        }
    },
    pe: {
        ecnApprove: {
            mainConfig: 'v2/pe/ecn-approve/main-config',
            mainList: 'v2/pe/ecn-approve/main-list',
            submit: 'v2/pe/ecn-approve/submit',
            close: 'v2/pe/ecn-approve/close',
            ok: 'v2/pe/ecn-approve/ok',
            back: 'v2/pe/ecn-approve/back',
            reset: 'v2/pe/ecn-approve/reset',
            export: 'v2/pe/ecn-approve/export',
            pause: 'v2/pe/ecn-approve/pause',
            setProcess: 'v2/pe/ecn-approve/set-process',
        },
        peorder: {
            so_config: 'v2/pe/peorder/so-config',
            so_list: 'v2/pe/peorder/so-list',
            main_config: 'v2/pe/peorder/main-config',
            main_list: 'v2/pe/peorder/main-list',
            add: 'v2/pe/peorder/add',
            receive: 'v2/pe/peorder/receive',
            start_design: 'v2/pe/peorder/start-design',
            eq_time: 'v2/pe/peorder/eq-time',
            rou_design: 'v2/pe/peorder/rou-design',
            plan_time: 'v2/pe/peorder/plan-time',
            priority: 'v2/pe/peorder/priority',
            orderinfo: 'v2/pe/peorder/orderinfo',
            ok: 'v2/pe/peorder/ok',
            del: 'v2/pe/peorder/del',
        },
        openOrder: {
            main_config: 'v2/pe/open-order/main-config',
            main_list: 'v2/pe/open-order/main-list',
            orderinfo: 'v2/pe/open-order/orderinfo',
            noplan: 'v2/pe/open-order/no-plan',
        },
        jobParameter:{
            init: 'v2/pe/job-parameter/init',
            list: 'v2/pe/job-parameter/list',
        }
    },
    sc: {
        warehouse: {
            materialStock: '/v2/sc/warehouse/material-stock'
        },
        testStand: {
            index: '/v1/test-stand/index',
            save: '/v1/test-stand/save',
            getJob: '/v1/test-stand/job',
            produce: '/v1/test-stand/produce',
        },
        workOrderStatusQuery: {
            //查询接口
            index: 'v2/sc/work-order-status-query/index',
            jiecun: 'v2/sc/work-order-status-query/jiecun',
            kucun: 'v2/sc/work-order-status-query/kucun',
            planGettime: 'v2/sc/work-order-status-query/plan-gettime',
            guoshu: 'v2/sc/work-order-status-query/guoshu',
            salesorder: 'v2/sc/work-order-status-query/salesorder',
            processparam: 'v2/sc/work-order-status-query/processparam',
            moprocess: 'v2/sc/work-order-status-query/moprocess',
            miprocess: 'v2/sc/work-order-status-query/miprocess',
            mibom: 'v2/sc/work-order-status-query/mibom',
            mobom: 'v2/sc/work-order-status-query/mobom',
            baofei: 'v2/sc/work-order-status-query/baofei',
            wolog: 'v2/sc/work-order-status-query/wolog',
            //操作接口
            plan: 'v2/sc/work-order-status-query/plan',//开始
            delplan: 'v2/sc/work-order-status-query/delplan',//取消
            planPause: 'v2/sc/work-order-status-query/plan-pause',//暂停
            planStart: 'v2/sc/work-order-status-query/plan-start',//恢复
            planLevel: 'v2/sc/work-order-status-query/plan-level',//插队
            planLevel2: 'v2/sc/work-order-status-query/plan-level2',//降级
            planSettime: 'v2/sc/work-order-status-query/plan-settime',//设置时间
            oaPause: 'v2/sc/work-order-status-query/oa-pause',//品质暂停
            oaStart: 'v2/sc/work-order-status-query/oa-start',//品质恢复
            getholiday: 'v2/sc/work-order-status-query/getholiday',//获取假日
            setholiday: 'v2/sc/work-order-status-query/setholiday',//设置假日
        },
        woPlan: {
            list: 'v2/sc/wo-plan/index',
            plan: 'v2/sc/wo-plan/plan',
            start: 'v2/sc/wo-plan/start',
            pause: 'v2/sc/wo-plan/pause',
            level: 'v2/sc/wo-plan/level',
            gettime: 'v2/sc/wo-plan/gettime',
            settime: 'v2/sc/wo-plan/settime',
        },
        moWaitingMaterials: {
            list: 'v2/sc/mo-waiting-materials/index',
            materials: 'v2/sc/mo-waiting-materials/materials',
            save: 'v2/sc/mo-waiting-materials/save',
        },
        mesHoliday: {
            holiday_config: 'v2/sc/mes-holiday/holiday-config',
            holiday_list: 'v2/sc/mes-holiday/holiday-list',
            holiday_add: 'v2/sc/mes-holiday/holiday-add',
            holiday_del: 'v2/sc/mes-holiday/holiday-del',
        },
    },
    packingSlip: {
        order: {
            list: '/v1/erp-packing-slip/list',
            detail: '/v1/erp-packing-slip/detail',
            edit: '/v1/erp-packing-slip/edit',
            preview: '/v1/erp-packing-slip/preview',
            upload: '/v1/erp-packing-slip/upload',
            send: '/v1/erp-packing-slip/send',
        },
        config: {
            list: '/v1/erp-packing-slip-config/list',
            edit: '/v1/erp-packing-slip-config/edit',
            customer: '/v1/erp-packing-slip-config/customer',
        }
    },
    form: {
        table: {
            list: '/v1/form/table/list',
            status: '/v1/form/table/status',
            export: '/v1/form/table/export',
            tpl: '/v1/form/tpl/list',
            detail: '/v1/form/table/detail',
            edit: '/v1/form/table/edit',
            save: '/v1/form/table/save',
            set: '/v1/form/table/set',
            remote: '/v1/form/table/remote',
            upload: '/v1/form/table/upload',
        },
        tpl: {
            list: '/v1/form/tpl/list',
            edit: '/v1/form/tpl/edit',
            status: '/v1/form/tpl/status',
            copy: '/v1/form/tpl/copy',
            detail: '/v1/form/tpl/detail',
            import: '/v1/form/tpl/import',
            upload: '/v1/form/tpl/upload',
            item_list: '/v1/form/item/list',
            item_edit: '/v1/form/item/edit',
            item_set: '/v1/form/item/set',
            item_sort: '/v1/form/item/sort',
            item_import: '/v1/form/item/import',
            field_list: '/v1/form/field/list',
        },
        field: {
            list: '/v1/form/field/list',
            edit: '/v1/form/field/edit',
            sort: '/v1/form/field/sort',
            set: '/v1/form/field/set',
            erpList: '/v1/form/field/erp-list',
            erpImport: '/v1/form/field/erp-import',
        },
    },
    flow: {
        order: {
            list: '/v1/flow/order/list',
            detail: '/v1/flow/order/detail',
            set: '/v1/flow/order/set',
            save: '/v1/flow/order/save',
        },
        item: {
            list: '/v1/flow/item/list',
            detail: '/v1/flow/item/detail',
            set: '/v1/flow/item/set',
            save: '/v1/flow/item/save',
            cron: '/v1/flow/item/cron',
        }
    },
    table: {
        byd_price: {
            list: 'v1/table/byd/price',
            save: 'v1/table/byd/price',
            data: 'v1/table/byd/data',
        },
        byd_toubiao: {
            list: 'v1/table/byd/toubiao',
            save: 'v1/table/byd/toubiao',
            data: 'v1/table/byd/data2',
        },
        biz_customer: {
            init: 'v1/table/biz-customer/init',
            list: 'v1/table/biz-customer/list',
            logs: 'v1/table/biz-customer/logs',
            save: 'v1/table/biz-customer/save',
            set: 'v1/table/biz-customer/set',
            update: 'v1/table/biz-customer/update',
        }
    },
    wo: {
        case: {
            list: '/v1/wo/case/list',
            detail: '/v1/wo/case/detail',
            set: '/v1/wo/case/set',
            save: '/v1/wo/case/save',
            billList: '/v1/wo/bill/detail',
            billSave: '/v1/wo/bill/save',
        },
        bill: {
            list: '/v1/wo/bill/list',
            detail: '/v1/wo/bill/detail',
            case: '/v1/wo/case/detail',
            set: '/v1/wo/bill/set',
            save: '/v1/wo/bill/save',
        }
    },
    outwork: {
        order: {
            list: '/v1/outwork/order/list',
            detail: '/v1/outwork/order/detail',
            price: '/v1/outwork/order/price',
            savePrice: '/v1/outwork/order/save-price',
            save: '/v1/outwork/order/save',
            mi: '/v1/outwork/order/mi',
            bill: '/v1/outwork/order/bill',
            file: '/v1/outwork/order/file',
        }, pack: {
            list: '/v1/outwork/pack/list',
            detail: '/v1/outwork/pack/detail',
            cancel: '/v1/outwork/pack/cancel',
            save: '/v1/outwork/pack/save',
            print: '/v1/outwork/pack/print',
        }, log: {
            list: '/v1/outwork/log/list',
            set: '/v1/outwork/log/set',
        }, money: {
            list: '/v1/outwork/money/list',
            detail: '/v1/outwork/money/detail',
            save: '/v1/outwork/money/save',
        }
    },
},
    {
        get(target, prop) {
            // 如果是 base,直接返回
            if (prop === 'base') {
                return target.base;
            }
            const value = target[prop];
            // 如果值是字符串,拼接 base
            if (typeof value === 'string') {
                return (target.base + value).replace(/\/\//g, '/');
            }
            // 如果值是对象,递归代理
            if (typeof value === 'object' && value !== null) {
                return createNestedProxy(value, target.base);
            }
            return value;
        }
    }
);

// 递归创建嵌套代理的辅助函数
function createNestedProxy(obj, baseUrl) {
    return new Proxy(obj, {
        get(target, prop) {
            const value = target[prop];
            // 如果值是字符串,拼接 base
            if (typeof value === 'string') {
                return (baseUrl + value).replace(/\/\//g, '/');
            }
            // 如果值是对象,继续递归代理
            if (typeof value === 'object' && value !== null) {
                return createNestedProxy(value, baseUrl);
            }
            return value;
        }
    });
}

export default apiUrl;