<template>
    <div class="assets">
        <TableComponent class="table" ref="assets" v-if="refObj.assetsShow" v-bind="obj.assetsConfig" />
        <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
            <t-tab-panel value="user" v-bind="obj.panelConfig" label="人员">
                <TableComponent ref="user" v-if="refObj.userShow" v-bind="obj.userConfig" />
            </t-tab-panel>
            <t-tab-panel value="a" v-bind="obj.panelConfig" label="资产">未来扩展，待开发</t-tab-panel>
            <!-- <t-tab-panel value="b" v-bind="obj.panelConfig" label="资产">未来扩展，待开发</t-tab-panel> -->
        </t-tabs>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from "@/core/script/api.js";
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import addAssetsUser from '@/modules/system/addAssetsUser.vue';
import addAsset from '@/modules/system/addAsset.vue';
const assets = ref(null);
const user = ref(null);
const assetId = ref(null);
const refObj = reactive({
    assetsShow: false,
    userShow: false,
    tab: 'user',
});
const tableEvent = {
    //添加资产
    assetsCreate: () => {
        console.log('添加资产');
        dialog.window(
            addAsset,
            {},
            {
                title: "添加资产：", width: '60%', height: '80%',
                onAfterClose: async () => {
                    // assets.value.reportConfig.getData();
                }
            }
        );
    },
    //删除资产
    assetsDelete: () => {
        console.log('删除资产');
    },
    //添加人员
    userCreate: () => {
        let asset = tableFn.getCheckedRecords(assets.value.reportConfig);
        if (asset.length === 0) {
            dialog.info('请先选择资产');
            return;
        }
        dialog.window(
            addAssetsUser,
            {
                query: {
                    asset: asset[0],
                },
                scene: 'auth'
            },
            {
                title: "添加资产人员：", width: '60%', height: '80%',
                onAfterClose: async () => {
                    user.value.reportConfig.getData({ where: { id: assetId.value } });
                }
            }
        )
    },
    //删除人员
    userDelete: () => {
        dialog.confirm('确定要删除吗？', async () => {
            let aid = tableFn.getCheckedRecords(assets.value.reportConfig).map(i => i.id);
            let uids = tableFn.getCheckedRecords(user.value.reportConfig).map(i => i.id);
            const res = await api.post(apiUrl.sys.asset.deleteUser, { aid, uids });
            if (res !== null && res !== undefined) {
                if (res.ret > 0) {
                    dialog.success(`成功删除${res.ret}条记录`);
                    user.value.reportConfig.getData();
                    user.value.reportConfig.getData({ where: { id: aid[0] } });
                } else {
                    dialog.info('网络错误，请稍后再试');
                }
            }
        });
    }
}
const obj = {
    tabsConfig: {
        theme: 'card',
        defaultValue: 'user',
        onChange: val => refObj.tab = val,
    },
    panelConfig: {
        destroyOnHide: false,
    },
    assetsConfig: {
        // footer: false,//是否显示表尾合计，默认为false
        menuConfig: {
            defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
            menu: {
                create: { sort: 152, title: '添加', icon: 'ri-add-line', click: () => tableEvent.assetsCreate() },
                delete: { sort: 153, title: '删除', icon: 'ri-add-line', listAction: tableEvent.assetsDelete }
            },
        },
        searchConfig: {
            search: [{
                type: 'select', field: 'plant_id', style: { width: '100px' }, value: siyi.user.plantId, load: 'factory',
                options: { multiple: false, clearable: false },
                onChange: val => assets.value.reportConfig.getData({ where: { plant_id: val } }),
            }],
        },
        tableConfig: {
            url: apiUrl.sys.asset.index, showCheck: 'radio', disablePage: true,
            events: {
                click_cell: args => {
                    if (args.originData?.index > 0 && args.originData.index !== assets.value.reportConfig.prveSelectRow.index) {
                        console.log(args);
                        assetId.value = args.originData.id;
                        user.value.reportConfig.getData({ where: { id: args.originData.id } });
                    }
                }
            },
        },
    },
    userConfig: {
        searchConfig: false,
        menuConfig: {
            defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
            menu: {
                create: { sort: 152, title: '添加', icon: 'ri-add-line', click: () => tableEvent.userCreate() },
                delete: { sort: 153, title: '删除', icon: 'ri-add-line', listAction: tableEvent.userDelete }
            },
        },
        query: {
            where: { id: 0 }
        },
        tableConfig: { url: apiUrl.sys.asset.getUsers, showCheck: 'multiple', disablePage: true },
    }
}
onMounted(() => {
    api.get(apiUrl.sys.asset.config).then(res => {
        obj.assetsConfig.tableConfig = { ...obj.assetsConfig.tableConfig, ...res.table };
        obj.assetsConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.assetsShow = true;
    });
    api.get(apiUrl.sys.asset.getuserConfig).then(res => {
        obj.userConfig.tableConfig = { ...obj.userConfig.tableConfig, ...res.table };
        obj.userConfig.tableConfig.columns = tableFn.createColumns(res.columns);
        refObj.userShow = true;
    });
});
</script>

<style scoped>
.assets {
    display: flex;
    flex-direction: column;

    .table {
        height: 40%;
        flex-shrink: 0;
    }

    .t-tabs {
        flex: 1;
        flex-shrink: 0;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin: 0 2px 2px 2px;
    }
}
</style>