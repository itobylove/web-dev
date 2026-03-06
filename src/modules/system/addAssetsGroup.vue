<template>
    <div ref="body" class="body">
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
            <TableComponent class="table" ref="assets" v-if="refObj.assetsShow" v-bind="obj.assetsTableConfig" />
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
    getAttach: { type: Function, default: () => { } },
})
const assets = ref(null);
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
const refObj = ref({
    assetsShow: false,
});
const obj = {
    assetsTableConfig: {
        searchConfig: {},
        menuConfig: {
            defaultMenuShowList: ['search', 'clearWhere'],
            menu: {
                create: {
                    click: () => {
                        const records = assets.value.reportConfig.data;
                        let uids = tableFn.getCheckedRecords(assets.value.reportConfig).map(i => i.id), assetId = props.query.asset.id, type = props.query.asset.type, label = props.query.asset.label;
                        if (uids.length === 0) {
                            dialog.info('请先选择要添加的资产');
                            return;
                        }
                        dialog.confirm(`确定要添加${uids.length}个资产到《${props.query.asset['name']}》吗？`, async () => {
                            await api.post(apiUrl.sys.asset.addAssetsGroupLink, { assetId, uids, type, label }).then(res => {
                                if (typeof (res.ret) === 'boolean') {
                                    if (res.ret === true) {
                                        props.getAttach(true);
                                        dialog.success(`成功添加${uids.length}个资产到《${props.query.asset['name']}》`);
                                    } else {
                                        dialog.error('添加失败');
                                    }
                                } else if (typeof (res.ret) === 'object') {
                                    let msg = `已存在，请勿重复添加`,data = '';
                                    res.ret.forEach(i =>{
                                        data += records[i - 1].name + '</br>';
                                    })
                                    dialog.error(data + msg);
                                } else if (typeof (res.ret) === 'number') {
                                    if (res.ret < 0) {
                                        dialog.error('资产组赞时不支持添加人员');
                                    }
                                } else {
                                    dialog.error('网络错误，请稍后再试');
                                }
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
        tableConfig: { url: apiUrl.sys.asset.getNoExistsAssets, showCheck: 'multiple' }
    }
}
onMounted(async () => {
    await api.get(apiUrl.sys.asset.assetsConfig).then(res => {
        obj.assetsTableConfig.tableConfig = { ...obj.assetsTableConfig.tableConfig, ...res.table };
        obj.assetsTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.value.assetsShow = true;
    });
});
</script>

<style scoped>
.body {
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