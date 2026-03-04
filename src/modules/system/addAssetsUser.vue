<template>
    <div class="container">
        <div class="base-info">
            <div class="base-info-content">
                <template v-for="(v, index) in getAsset" :key="index">
                    <div>工厂名称：<span>{{ v['工厂名称'] }}</span></div>
                    <div>设备编号：<span>{{ v['设备编号'] }}</span></div>
                    <div>设备名称：<span>{{ v['设备名称'] }}</span></div>
                    <div>设备类型：<span>{{ v['设备类型'] }}</span></div>
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
})
//过滤数据，获取设备信息
const getAsset = computed(() => {
    const result = [];
    result.push({
        '资产编号': props.query.asset['资产编号'],
        '资产名称': props.query.asset['资产名称'],
        '资产类型': props.query.asset['资产类型'],
        '资产分类': props.query.asset['资产分类'],
    });
    return result;
});
const users = ref(null);
const refObj = ref({
    usersShow: false,
});
const tableEvent = {
    add: () => {
        let uids = tableFn.getCheckedRecords(users.value.reportConfig).map(i => i.id), assetId = props.query.asset.id;
        if (uids.length === 0) {
            dialog.info('请先选择要添加的员工');
            return;
        }
        dialog.confirm(`确定要添加${uids.length}位员工到设备《${props.query.asset['设备名称']}》吗？`, async () => {
            await api.post(apiUrl.sys.asset.addAssetsUser, { assetId, uids }).then(res => {
                if (res.ret) {
                    dialog.success(`成功添加${uids.length}位员工到设备《${props.query.asset['设备名称']}》`);
                    props.dialog.close();
                } else {
                    dialog.error(res.msg || '添加失败');
                }
            })
        });
    },
}
const obj = {
    usersConfig: {
        searchConfig: {},
        menuConfig: {
            defaultMenuShowList: ['search', 'clearWhere'],
            menu: {
                create: { sort: 152, title: '添加', icon: 'ri-add-line', click: () => tableEvent.add() },
            },
        },
        query: {
            where: { id: props.query.asset.id, flag: true }
        },
        tableConfig: { url: apiUrl.sys.asset.getUsers, showCheck: 'multiple' }
    }
}
onMounted(async () => {
    await api.get(apiUrl.sys.asset.getuserConfig).then(res => {
        console.log(res);
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