<template>
    <div class="container">
        <div class="base-info">
            <div class="base-info-content">
                <template v-for="(v, index) in getAsset" :key="index">
                    <div>工厂名称：<span>{{ v['plant_id_text'] }}</span></div>
                    <div>资产编号：<span>{{ v['code'] }}</span></div>
                    <div>资产名称：<span>{{ v['name'] }}</span></div>
                    <div>资产类型：<span>{{ v['type_text'] }}</span></div>
                </template>
            </div>
        </div>
        <div class="users-lists">
            <TableComponent class="table" ref="users" v-if="refObj.usersShow" v-bind="obj.usersConfig" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from "@/core/script/api.js";
import * as tableFn from '@/core/script/tableFn';
import dialog from "@/core/script/dialog.js";
const props = defineProps({
    query: {
        type: Object,
        default: {}
    },
    dialog: { type: Object },
    getAttach: { type: Function,default: () => {} },
})
//过滤数据，获取设备信息
const getAsset = computed(() => {
    const result = [];
    result.push({
        'plant_id_text': props.query.asset['plant_id_text'],
        'code': props.query.asset['code'],
        'name': props.query.asset['name'],
        'type_text': props.query.asset['type_text'],
    });
    return result;
});
const users = ref(null);
const refObj = ref({
    usersShow: false,
});
const obj = {
    usersConfig: {
        searchConfig: {},
        menuConfig: {
            defaultMenuShowList: ['search', 'clearWhere'],
            menu: {
                create: {
                    click: () => {
                        let uids = tableFn.getCheckedRecords(users.value.reportConfig).map(i => i.id), assetId = props.query.asset.id,type = props.query.asset.type;
                        if (uids.length === 0) {
                            dialog.info('请先选择要添加的员工');
                            return;
                        }
                        dialog.confirm(`确定要添加${uids.length}位员工到设备《${props.query.asset['name']}》吗？`, async () => {
                            await api.post(apiUrl.sys.asset.addAssetsUser, { assetId, uids,type }).then(res => {
                                if (res.ret === true) {
                                    dialog.success(`成功添加${uids.length}位员工到设备《${props.query.asset['name']}》`);
                                }else if(res.ret < 0){
                                    dialog.error('资产组赞时不支持添加人员');
                                }else {
                                    dialog.error(res.msg || '添加失败');
                                }
                                props.getAttach(true)
                                props.dialog.close();
                            })
                        });
                    }
                },
            },
        },
        query: {
            id: props.query.asset.id, type: props.query.asset.type, flag: true
        },
        tableConfig: { url: apiUrl.sys.asset.getUsers, showCheck: 'multiple' }
    }
}
onMounted(async () => {
    await api.get(apiUrl.sys.asset.userConfig).then(res => {
        obj.usersConfig.tableConfig = { ...obj.usersConfig.tableConfig, ...res.table };
        obj.usersConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.value.usersShow = true;
    });
});
</script>

<style scoped>
.container {
    padding: 20px;
    display: flex;
    flex-direction: column;

    .base-info {
        margin-bottom: 20px;

        .base-info-content {
            display: flex;
            flex-wrap: wrap;
            border-bottom: 1px solid #eee;

            >div {
                width: 50%;
                margin-bottom: 15px;
            }

            span {
                font-weight: 500;
                color: #606266;
                margin-right: 5px;
            }
        }
    }

    .users-lists {
        overflow: auto;

        .table {
            height: 61vh;
            overflow: auto;
            flex-shrink: 0;
        }
    }

}
</style>