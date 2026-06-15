const apiUrl = new Proxy(
    {
        base: '/api_v2/',
        user: {
            info: '/user/info',
            login: '/user/login',
            logout: '/user/logout',
            loginWx: '/user/wxLogin',
        },
        dept: {
            list: '/department/list',
        },
        mes: {
            report_data: {
                config: '/mes/product-report/config',//获取模板GET 提交：IP， 返回{配置id,设备名，工序，工艺}
                employee: '/mes/product-report/employee',//获取员工GET 提交：ID， 返回 {id,姓名}
                assets: '/mes/product-report/assets',//获取资产GET 提交：ID， 配置ID
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
            report_config: {
                config: '/mes/report-config/config',
                list: '/mes/report-config/list',
                add: '/mes/report-config/save',
                edit: '/mes/report-config/save',
                del: '/mes/report-config/delete',
            },
            report_template: {
                config: '/mes/report-template/config',
                list: '/mes/report-template/list',
                add: '/mes/report-template/save',
                edit: '/mes/report-template/save',
                del: '/mes/report-template/delete',
                assetsConfig: '/mes/report-template/assetsConfig',
                assetsList: '/mes/report-template/assetsList',
                addAssets: '/mes/report-template/saveAssets',
                editAssets: '/mes/report-template/editAssets',
                delAssets: '/mes/report-template/deleteAssets',
                parameterConfig: '/mes/report-template/parameterConfig',
                parameterList: '/mes/report-template/parameterList',
                addParameter: '/mes/report-template/saveParameter',
                editParameter: '/mes/report-template/saveParameter',
                delParameter: '/mes/report-template/deleteParameter',
            },
            return_cost: {
                index: '/mes/return-cost/index',
                config: '/mes/return-cost/config',
                getData: '/mes/return-cost/getData',
                editData: '/mes/return-cost/editData',
                updateArea: '/mes/return-cost/updateArea',
                getJobInfo: '/mes/return-cost/getJobInfo'
            },
            stacked_structure: {
                'index': '/mes/stackedstructure/index',
                'save': '/mes/stackedstructure/saveStackStructure',
                'validate': '/mes/stackedstructure/validateCode',
                'reStack': '/mes/stackedstructure/reStack',
                'employee': '/mes/stackedstructure/employee',
                'getAssetsByCode': '/mes/stackedstructure/assets',
            },
            stackedBoard: {
                employee: '/mes/stacked-board/employee',
                assets: '/mes/stacked-board/assets',
                stackupInfo: '/mes/stacked-board/stackupInfo',
                validCode: '/mes/stacked-board/validCode',
                save: '/mes/stacked-board/save',
            },
        },
        eap: {
            interface: {
                assets: '/eap/interface/assets',
                employee: '/eap/interface/employee',
                pda: '/eap/interface/pda',
            },
        },
        job: {
            job: {
                init: '/job/job/init',
                list: '/job/job/list',
                save: '/job/job/save',
                import: '/job/job/import',
                delete: '/job/job/delete',
            },
            mi: {
                job: '/job/mi/job',
                jobParams: '/job/mi/jobParams',
                jobRoutes: '/job/mi/jobRoutes',
                jmpParams: '/job/mi/jmpParams',
                stationRouteParams: '/job/mi/stationRouteParams',
                erpRouteParams: '/job/mi/erpRouteParams',
            },
        },
        cost: {
            index: {
                init: '/cost/index/init',
                list: '/cost/index/list',
            },
            quote: {
                config: '/cost/quote/config',
                list: '/cost/quote/list',
                get: '/cost/quote/get',
                exportQuote: '/cost/quote/exportQuote',
                exportParams: '/cost/quote/exportParams',
                costList: '/cost/quote/costList',
                save: '/cost/quote/save',
                delete: '/cost/quote/delete',
                create: '/cost/quote/create',
                remake: '/cost/quote/remake',
                jobList: '/cost/quote/jobList',
                jobQuoteParams: '/cost/quote/jobQuoteParams',
                materialList: '/cost/quote/materialList',
                calcParameter: '/cost/quote/calcParameter',
            },
            product_group: {
                init: '/cost/quote/init',
                list: '/cost/quote/list',
            },
            config: {
                init: '/cost/config/init',
                list: '/cost/config/list',
                save: '/cost/config/save',
                set: '/cost/config/set',
                export: '/cost/config/export',
                delete: '/cost/config/delete',
            },
            item: {
                init: '/cost/item/init',
                list: '/cost/item/list',
                save: '/cost/item/save',
                delete: '/cost/item/delete',
            },
            overage: {
                init: '/cost/overage/init',
                list: '/cost/overage/list',
                save: '/cost/overage/save',
                set: '/cost/overage/set',
                delete: '/cost/overage/delete',
            },
            package: {
                init: '/cost/package/init',
                list: '/cost/package/list',
                save: '/cost/package/save',
                delete: '/cost/package/delete',
            },
            packageItem: {
                init: '/cost/package-item/init',
                list: '/cost/package-item/list',
                save: '/cost/package-item/save',
                set: '/cost/package-item/set',
                delete: '/cost/package-item/delete',
            },
            zxd: {
                list: '/cost/zxd/list',
                download: '/cost/zxd/download',
                delete: '/cost/zxd/delete',
            },
        },
        sys: {
            unit: {
                config: '/base/unit/config',
                list: '/base/unit/list',
                add: '/base/unit/save',
                edit: '/base/unit/save',
                del: '/base/unit/delete',
                import: '/base/unit/import',
            },
            steps: {
                stepsConfig: '/base/steps/stepsConfig',
                stepsList: '/base/steps/stepsList',
                stepsCreate: '/base/steps/stepsCreate',
                stepsUpdate: '/base/steps/stepsUpdate',
                stepsDelete: '/base/steps/stepsDelete',
                processConfig: '/base/steps/processConfig',
                processList: '/base/steps/processList',
                bindstepsProcess: '/base/steps/bindstepsProcess',
                unBindstepsProcess: '/base/steps/unBindstepsProcess',
            },
            step: {
                config: '/base/step/config',
                list: '/base/step/list',
                attach: '/base/Step/getAttrToId',   //  指定ID获取工序属性、参数等信息
                add: '/base/step/save',
                edit: '/base/step/save',
                del: '/base/step/delete',
                import: '/base/step/import',
                report: '/base/step/report',
                reportConfig: '/base/step/reportConfig',
                process: {
                    config: '/base/stepProcess/config',
                    list: '/base/stepProcess/list',
                    add: '/base/stepProcess/save',
                    del: '/base/stepProcess/delete',
                }
            },
            process: {
                processConfig: '/base/process/processConfig',
                processList: '/base/process/processList',
                processCreate: 'base/process/processCreate',
                processUpdate: '/base/process/processUpdate',
                processDelete: '/base/process/processDelete',
                processDisabled: '/base/process/processDisabled',

                bindAssets: '/base/process/bindAssets', // 绑定资产到工艺
                unBindAssets: '/base/process/unBindAssets', // 解绑指定工艺下的资产
                updateAssets: '/base/process/updateAssets', // 修改状态和备注

                config: '/base/process/config',
                list: '/base/process/list',
                assetsConfig: '/base/process/assetsConfig',
                assetsList: '/base/process/assetsList',
                parameterConfig: '/base/process/parameterConfig',
                parameterList: '/base/process/parameterList',
                parameterDel: '/base/process/parameterDel',
                parameterAdd: '/base/process/parameterAdd',
                parameterSet: '/base/process/parameterSet',
                mainList: '/base/process/mainList',
                attach: '/base/process/getAttrToId',   //  指定ID获取工艺属性、参数等信息
                add: '/base/process/save',
                edit: '/base/process/save',
                del: '/base/process/delete',
                import: '/base/process/import',
                step: {
                    config: '/base/processStep/config',
                    list: '/base/processStep/list',
                    add: '/base/processStep/save',
                    del: '/base/processStep/delete',
                },
                station: {
                    config: '/base/processStation/config',
                    list: '/base/processStation/list',
                    add: '/base/processStation/save',
                    del: '/base/processStation/delete',
                }
            },
            station: {
                init: '/base/station/init',
                list: '/base/station/list',
                attach: '/base/station/getAttrToId',   //  指定ID获取工段属性、参数等信息数据
                save: '/base/station/save',
                delete: '/base/station/delete',
                process: {
                    config: '/base/stationProcess/config',
                    list: '/base/stationProcess/list',
                    add: '/base/stationProcess/save',
                    del: '/base/stationProcess/delete',
                },
                parameter: {
                    config: '/base/stationParameter/config',
                    list: '/base/stationParameter/list',
                    add: '/base/stationParameter/save',
                    del: '/base/stationParameter/delete',
                }
            },
            employee: {
                config: '/base/employee/config',
                list: '/base/employee/list',
                add: '/base/employee/save',
                edit: '/base/employee/save',
                del: '/base/employee/delete',
            },
            parameter: {
                config: '/base/parameter/config',
                list: '/base/parameter/list',
                add: '/base/parameter/save',
                edit: '/base/parameter/save',
                set: '/base/parameter/set',
                del: '/base/parameter/delete',
                import: '/base/parameter/import',
                upload: '/base/parameter/upload',
                getErpParameters: '/base/parameter/getErpParameters',
                // getMaterialConfig: '/base/parameter/getMaterialConfig',

            },
            parameter_rules: {
                init: '/base/parameterRules/init',
                list: '/base/parameterRules/list',
                save: '/base/parameterRules/save',
                set: '/base/parameterRules/set',
                delete: '/base/parameterRules/delete',
            },
            supplier: {
                config: '/base/supplier/config',
                list: '/base/supplier/list',
                add: '/base/supplier/save',
                edit: '/base/supplier/save',
                del: '/base/supplier/delete',
            },
            auth: {
                config: '/sys/authitem/config',
                userConfig: '/sys/authitem/userConfig',
                getMenu: '/sys/authitem/import',
                getMenuLists: '/sys/authitem/index',
                getEmployeeLists: '/sys/authitem/getemployeesbyauthid',
                getEmployeeListsByAuthId: '/sys/authitem/getEmployeesListsByAuthId',
                addAuthAssignment: '/sys/authitem/addAuthAssignment',
                delAuthAssignment: '/sys/authitem/delAuthAssignment',
                getAuthAssignmentByUid: '/sys/authitem/getAuthAssignmentByUid',
                getAllEmployeeLists: '/sys/authitem/getAllEmployeeLists',
                copyAuthAssignment: '/sys/authitem/copyAuthAssignment',
                getAuthItemDetailsById: '/sys/authitem/getAuthItemDetailsById',
                operateAuth: '/sys/authitem/operateAuth',
                batchCancelAuthItem: '/sys/authitem/batchCancelAuthItem',
                updateAuthItem: '/sys/authitem/updateAuthItem'
            },
            category: {
                config: '/base/category/config',
                list: '/base/category/list',
                add: '/base/category/save',
                edit: '/base/category/save',
                del: '/base/category/delete',
            },
            asset: {
                assetsConfig: '/asset/assets/assetsConfig',
                assetsList: '/asset/assets/assetsList',
                assetsCreate: 'base/assets/assetsCreate',
                assetsUpdate: '/base/assets/assetsUpdate',
                assetsDelete: '/base/assets/assetsDelete',
                assetsDisabled: '/base/assets/assetsDisabled',

                getUsers: '/asset/assets/getUsers',
                deleteUser: '/asset/assets/deleteUser',
                addAssetsUser: '/asset/assets/addAssetsUser',
                addAssetGroup: '/asset/assets/addAssetGroup',
                mainConfig: '/asset/assets/mainConfig',
                mainList: '/asset/assets/mainList',
                userConfig: '/asset/assets/userConfig',
                userList: '/asset/assets/userList',
                processConfig: '/asset/assets/processConfig',
                processList: '/asset/assets/processList',
                addAssetLabel: '/asset/assets/addAssetLabel',
                delAssetLabel: '/asset/assets/delAssetLabel',
                getNoExistsAssets: '/asset/assets/getNoExistsAssets',
                addAssetsGroupLink: '/asset/assets/addAssetsGroupLink',
                deleteAssetsGroup: '/asset/assets/deleteAssetsGroup',
                addAsset: '/asset/assets/addAsset',
                delAssets: '/asset/assets/delAssetsOrGroup',
                parameterEapConfig: '/asset/assets/parameterEapConfig',
                parametersEapList: '/asset/assets/parametersEapList',
                deleteParameterEap: '/asset/assets/deleteParameterEap',
                addParameterEapConfig: '/asset/assets/addParameterEapConfig',
                addParameterEap: '/asset/assets/addParameterEap',
                addParameterEapList: '/asset/assets/addParameterEapList',
                editParameterEap: '/asset/assets/editParameterEap',
                parameterConfig: '/asset/assets/parameterConfig',
                parameterList: '/asset/assets/parameterList',
                deleteParameter: '/asset/assets/deleteParameter',
                addParameterConfig: '/asset/assets/addParameterConfig',
                addParameter: '/asset/assets/addParameter',
                addParameterList: '/asset/assets/addParameterList',
                editParameter: '/asset/assets/editParameter',
                repairConfig: '/asset/assets/repairConfig',
                repairList: '/asset/assets/repairList',
                deleteRepair: '/asset/assets/deleteRepair',
                addRepair: '/asset/assets/addRepair',
                editRepair: '/asset/assets/editRepair',
            },


        },
        home: {
            academy: { // 龙腾学院
                upload: '/home/academy/upload',
                addLog: '/home/academy/addLog',
                handle: '/home/academy/handle',
                save: '/home/academy/save',
                del: '/home/academy/delete',
                menuList: '/home/academy/menu',
                detail: '/home/academy/detail',
                userListVisit: '/home/academy/user_visit',
                userPermission: '/home/academy/permission'
            },
            userLog: {
                mainConfig: '/home/userLog/init',
                list: '/home/userLog/list',
            },
            excel: {
                config: '/home/excel/init',
                month_init: '/home/excel/month_init',
                list: '/home/excel/list',
                save: '/home/excel/save',
                del: '/home/excel/delete',
                month_list: '/home/excel/month_list',
                details: '/home/excel/details',
                userList: '/home/excel/user_list',
                uploadUrl: '/home/excel/upload',
                editValue: '/home/excel/edit_value',
                editIndicator: '/home/excel/edit_indicator'
            },
            analysis: {
                init: '/home/analysis/init',
                indicator_ini: '/home/analysis/indicator_ini',
                list: '/home/analysis/list',
                save: '/home/analysis/save',
                del: '/home/analysis/delete',
                month_list: '/home/analysis/month_list',
                details: '/home/analysis/details',
                userList: '/home/analysis/user_list',
                uploadUrl: '/home/analysis/upload',
                editIndicator: '/home/analysis/edit_indicator',
                month_save: '/home/analysis/month_save',
                batch_modify: '/home/analysis/batch_modify',
                field_config: '/home/analysis/field_config',
                organ_init: '/home/analysis/organ_init',
                organ_list: '/home/analysis/organ_list',
            },
            noble_metal: {
                list: '/home/noble/list',

            },
            todo_matter: {
                config: '/home/todo/init',
                list: '/home/todo/list',
                save: '/home/todo/save',
                del: '/home/todo/delete',
                details: '/home/todo/details',
                permission: '/home/todo/permission',
                editValue: '/home/todo/edit_value',
                uploadUrl: '/home/todo/upload',

            },
            tags_625: {
                config: '/home/tags/init',
                list: '/home/tags/list',
                save: '/home/tags/save',
                del: '/home/tags/del'
            },
            raise: {
                config: '/home/raise/init',
                list: '/home/raise/list',
                detail_init: '/home/raise/detail_init',
                detail_list: '/home/raise/detail_list',
                depart_list: '/home/raise/depart_list',
                process_depart: '/home/raise/process_depart',
                dept_user: '/home/raise/dept_user',
                archive: '/home/raise/archive',
                field_config: '/home/raise/field_config',
                uploadUrl: '/home/raise/upload',
                update_process: '/home/raise/update_process',
                process_user: '/home/raise/process_user'

            },
            raise_mobile: {
                mobile_init: '/home/raisemobile/mobile_init',
                init: '/home/raisemobile/init',
                list: '/home/raisemobile/list',
                uploadUrl: '/home/raisemobile/upload',
                save: '/home/raisemobile/save',
                mobile_list: '/home/raisemobile/user_list',
                details: '/home/raisemobile/details',
                delete: '/home/raisemobile/delete',
                user_process: '/home/raisemobile/user_process',
            },
            quotation: {
                config: '/home/quotation/init',
                list: '/home/quotation/list',
                save: '/home/quotation/save',
                del: '/home/quotation/delete',
                import: '/home/quotation/import',
            },
            organizational: {
                organ_init: '/home/organizational/organ_init',
                init: '/home/organizational/init',
                dept_list: '/home/organizational/dept_list',
                user_list: '/home/organizational/user_list'
            },
            performance: {
                init: '/home/performance/init',
                list: '/home/performance/list',
                editIndicator: '/home/performance/edit_indicator',
                assessee_init: '/home/performance/assessee_init',
                assessee_list: '/home/performance/assessee_list',
                user_list: '/home/performance/user_list',
                batch_modify: '/home/performance/batch_modify',
                assessee_user_list: '/home/performance/assessee_user_list'
            },
            cost_control: {
                init: '/home/cost-control/init',
                list: '/home/cost-control/list',
                save: '/home/cost-control/save',
                del: '/home/cost-control/delete',
                detail: '/home/cost-control/detail',
                edit_value: '/home/cost-control/edit_value',
            },
            process_output: {
                init: '/home/process-output/init',
                list: '/home/process-output/list',
            }
        },
        common: {
            plantList: '/common/getPlantsLists',
            assetCategoryList: '/common/getAssetsCategoryLists',
            assetGroupList: '/common/getAssetsGroupLists',
            getGroupLabelLists: '/common/getGroupLabelLists',
            workshopsLists: '/common/getWorkshopsLists',
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
