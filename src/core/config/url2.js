const apiUrl = new Proxy(
    {
        base: '/api_v2/',
        user: {
            info: '/user/info',
            login: '/user/login',
            logout: '/user/logout',
            loginWx: '/user/wxLogin',
        },
        dept:{
            list: '/department/list',
        },
        mes: {
            report_data:{
                config: '/mes/product-report/config',//获取模板GET 提交：IP， 返回{配置id,设备名，工序，工艺}
                employee: '/mes/product-report/employee',//获取员工GET 提交：ID， 返回 {id,姓名}
                wo: '/mes/product-report/wo',//获取工单GET 提交：工单号，配置ID 返回 {工单号和ID，生产部件，剩余数量，状态和ID，list:[参数ID，名称，默认值，单位，上下公关及单位]}
                create: '/mes/product-report/create',//上机POST{我传给你：WOID，模板ID，数量，人员ID}，返回：是否
                fa: '/mes/product-report/fa',//首检POST
                ipqc: '/mes/product-report/ipqc',//抽检POST
                del: '/mes/product-report/del',//重扫 POST{主表ID} 返回：是否
                save: '/mes/product-report/save',//下机POST{主表ID，list:} 返回：是否
                historyMainConfig: '/mes/product-report/main-config',//历史记录GET {型号} 返回
                historyMain: '/mes/product-report/main-list',//历史记录GET {型号} 返回
                historyDetailConfig: '/mes/product-report/detail-config',//历史记录GET {型号} 返回
                historyDetail: '/mes/product-report/detail-list',//历史记录详情GET {主表ID} 返回
            },
            report_config:{
                config: '/mes/report-config/config',
                list: '/mes/report-config/list',
                add: '/mes/report-config/save',
                edit: '/mes/report-config/save',
                del: '/mes/report-config/delete',
            },
            report_template:{
                config: '/mes/report-template/config',
                list: '/mes/report-template/list',
                add: '/mes/report-template/save',
                edit: '/mes/report-template/save',
                del: '/mes/report-template/delete',
                equipmentConfig: '/mes/report-template/equipmentConfig',
                equipmentList: '/mes/report-template/equipmentList',
                addEquipment: '/mes/report-template/saveEquipment',
                editEquipment: '/mes/report-template/editEquipment',
                delEquipment: '/mes/report-template/deleteEquipment',
                parameterConfig: '/mes/report-template/parameterConfig',
                parameterList: '/mes/report-template/parameterList',
                addParameter: '/mes/report-template/saveParameter',
                editParameter: '/mes/report-template/saveParameter',
                delParameter: '/mes/report-template/deleteParameter',
            },

        },
        cost:{
            index:{
                init: '/cost/index/init',
                list: '/cost/index/list',
            },
            config:{
                init: '/cost/config/init',
                list: '/cost/config/list',
                save: '/cost/config/save',
                delete: '/cost/config/delete',
            },
            item:{
                init: '/cost/item/init',
                list: '/cost/item/list',
                save: '/cost/item/save',
                delete: '/cost/item/delete',
            },
            boom:{
                init: '/cost/boom/init',
                list: '/cost/boom/list',
                save: '/cost/boom/save',
                delete: '/cost/boom/delete',
            },
        },
        sys: {
            unit:{
                config: '/base/unit/config',
                list: '/base/unit/list',
                add: '/base/unit/save',
                edit: '/base/unit/save',
                del: '/base/unit/delete',
                import: '/base/unit/import',
            },
            step:{
                config: '/base/step/config',
                list: '/base/step/list',
                add: '/base/step/save',
                edit: '/base/step/save',
                del: '/base/step/delete',
                import: '/base/step/import',
                report: '/base/step/report',
                reportConfig: '/base/step/reportConfig',
                process:{
                    config: '/base/stepProcess/config',
                    list: '/base/stepProcess/list',
                    add: '/base/stepProcess/save',
                    del: '/base/stepProcess/delete',
                }
            },
            process:{
                config: '/base/process/config',
                list: '/base/process/list',
                add: '/base/process/save',
                edit: '/base/process/save',
                del: '/base/process/delete',
                import: '/base/process/import',
                step:{
                    config: '/base/processStep/config',
                    list: '/base/processStep/list',
                    add: '/base/processStep/save',
                    del: '/base/processStep/delete',
                },
                station:{
                    config: '/base/processStation/config',
                    list: '/base/processStation/list',
                    add: '/base/processStation/save',
                    del: '/base/processStation/delete',
                }
            },
            station:{
                init: '/base/station/init',
                list: '/base/station/list',
                save: '/base/station/save',
                delete: '/base/station/delete',
                process:{
                    config: '/base/stationProcess/config',
                    list: '/base/stationProcess/list',
                    add: '/base/stationProcess/save',
                    del: '/base/stationProcess/delete',
                },
                equipment:{
                    config: '/base/stationEquipment/config',
                    list: '/base/stationEquipment/list',
                    add: '/base/stationEquipment/save',
                    del: '/base/stationEquipment/delete',
                },
                parameter:{
                    config: '/base/stationParameter/config',
                    list: '/base/stationParameter/list',
                    add: '/base/stationParameter/save',
                    del: '/base/stationParameter/delete',
                }
            },
            equipment:{
                config: '/base/equipment/config',
                list: '/base/equipment/list',
                add: '/base/equipment/save',
                edit: '/base/equipment/save',
                del: '/base/equipment/delete',
                station:{
                    config: '/base/equipmentStation/config',
                    list: '/base/equipmentStation/list',
                    add: '/base/equipmentStation/save',
                    del: '/base/equipmentStation/delete',
                },
                user:{
                    config: '/base/equipment/userConfig',
                    list: '/base/equipment/userList',
                    add: '/base/equipment/saveUser',
                    edit: '/base/equipment/saveUser',
                    del: '/base/equipment/deleteUser',
                }
            },
            employee:{
                config: '/base/employee/config',
                list: '/base/employee/list',
                add: '/base/employee/save',
                edit: '/base/employee/save',
                del: '/base/employee/delete',
            },
            parameter:{
                config: '/base/parameter/config',
                list: '/base/parameter/list',
                add: '/base/parameter/save',
                edit: '/base/parameter/save',
                set: '/base/parameter/set',
                del: '/base/parameter/delete',
                import: '/base/parameter/import',
                getErpParameters: '/base/parameter/getErpParameters',
            },
            parameter_rules:{
                init: '/base/parameterRules/init',
                list: '/base/parameterRules/list',
                save: '/base/parameterRules/save',
                set: '/base/parameterRules/set',
                delete: '/base/parameterRules/delete',
            },
            supplier:{
                config: '/base/supplier/config',
                list: '/base/supplier/list',
                add: '/base/supplier/save',
                edit: '/base/supplier/save',
                del: '/base/supplier/delete',
            },
            auth:{
                getMenu: '/sys/authitem/import',
                getMenuLists: '/sys/authitem/index',
            }
        }
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
