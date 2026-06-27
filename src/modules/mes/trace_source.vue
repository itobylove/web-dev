<template>
    <div class="body">
        <div class="search-left">
            <t-space class="justify-around">
                <t-steps layout="vertical" theme="dot" :defaultCurrent="refObj.current" :onChange="obj.onCurChanged">
                    <t-step-item v-for="item in refObj.options" :title="item.label" :content="item.date"></t-step-item>
                </t-steps>
            </t-space>
        </div>
        <div class="search-right">
            <div class="search-block">
                <!-- 工序：<t-select v-model="refObj.value" placeholder="请选择" :options="refObj.options" size="medium"
                    style="width: 200px; display: inline-block; margin-right: 20px" /> -->
                朔源码：<t-input clearable v-model="refObj.code" placeholder="请输入朔源码" style="width: 200px;" />
                LOT号：<t-input clearable v-model="refObj.lot" placeholder="请输入LOT号" style="width: 200px;" />
                <!-- 测试日期：<t-date-range-picker clearable v-model="refObj.range" :presets="refObj.presets" mode="date" /> -->
                <t-button :disabled="refObj.disabled" @click="obj.search">搜索</t-button>
            </div>
            <div class="search-results" v-if="refObj.testResults.length > 0">
                <div class="search-data" v-for="(item, index) in refObj.testResults" :key="index">
                    <div class="search-data-item" v-for="(item2, index2) in item" :key="index2">
                        <span class="item-key"> {{ index2 }}: </span> <span
                            :style="[item2 === 'NG' ? { color: 'red' } : '']">{{ item2 }}</span>
                        <!-- <div v-if="index2 === 'test_data'" v-for="(item3, index3) in item2" :key="index3">
                            <span v-for="(item4, index4) in item3" :key="index4">{{ index4 }}:{{ item4 }}</span>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import dialog from "@/core/script/dialog.js";
const refObj = reactive({
    current: 3,
    code: '',
    lot: '',
    step: 4, // 选择的值
    options: [
        { label: '开料', value: '1', date: '2026年5月26日' },
        { label: '钻孔', value: '2', date: '2026年5月27日' },
        { label: '焊接', value: '3', date: '2026年5月28日' },
        { label: '检验', value: '4', date: '2026年5月29日' },
        { label: 'AVI', value: '5', date: '2026年5月30日' },
        { label: 'LDI', value: '6', date: '2026年5月30日' },
    ],
    disabled: true, // 搜索按钮是否禁用
    testResults: [],
    presets: {
        最近7天: [new Date(+new Date() - 86400000 * 6), new Date()],
        最近3天: [new Date(+new Date() - 86400000 * 2), new Date()],
        今天: [new Date(), new Date()],
    },
    range: [
        // new Date(),
        // new Date()
    ],
});
watch(refObj, (newVal, oldVal) => {
    if (newVal.code === '' && refObj.lot === '' && refObj.range.length === 0) {
        refObj.disabled = true;
    } else {
        refObj.disabled = false;
    }
}, { immediate: true, deep: true });
const obj = {
    search: () => {
        const loading = dialog.loading(null, '努力追溯中...');
        api.get(apiUrl.mes.trace_source.search, { step: refObj.step, code: refObj.code.trim(), lot: refObj.lot.trim(), range: refObj.range }, null, false, false).then((res) => {
            refObj.testResults = res.data
            loading.close();
        });
    },
    onCurChanged(cur, pre) {
        refObj.current = cur;
        refObj.step = refObj.options[cur].value;
    },
}

</script>

<style scoped>
.body {
    display: flex;
    gap: 10px;
    padding: 3px;
    font-size: 16px;

    .search-left {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20%;
        border-right: 1px solid #ccc;
    }

    .search-right {
        display: flex;
        flex-direction: column;
        flex: 1;

        .search-block {
            display: flex;
            align-items: center;
            flex-direction: row;
            gap: 10px;
        }

        .search-results {
            display: flex;
            flex-direction: column;
            overflow: auto;

            .search-data {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                border-bottom: 1px solid #ccc;

                .search-data-item {
                    width: 25%;
                    margin: 10px 0;

                    .item-key {
                        font-weight: bold;
                    }
                }
            }
        }
    }
}
</style>