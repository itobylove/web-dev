<template>
    <div class="body">
        <div class="apply-content">
            <p><strong>申请类型：</strong>{{ refObj.data.apply_type_text }}</p>
            <p v-if="refObj.data.apply_type_text === 3 || refObj.data.apply_content !== ''"><strong>申请内容：</strong>{{
                refObj.data.apply_content }}</p>
            <p><strong>提交人：</strong>{{ refObj.data.employee_name }}</p>
            <p><strong>资产名称：</strong>{{ refObj.data.assets_name }}</p>
            <p><strong>提交时间：</strong>{{ refObj.data.created_time }}</p>
            <p v-if="refObj.data.updated_time !== null"><strong>审核时间：</strong>{{ refObj.data.updated_time }}</p>
            <p><strong>审核状态：</strong>{{ refObj.data.status_text }}</p>
            <div class="btn-group">
                <button class="reject-btn" @click="obj.set(2)" :disabled="refObj.data.status != 1">驳回</button>
                <button class="agree-btn" @click="obj.set()" :disabled="refObj.data.status != 1">同意</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import * as api from "@/core/script/api.js"
import dialog from '@/core/script/dialog';
import apiUrl from '@/core/config/url2';

const refObj = reactive({
    data: [],
});

const obj = {
    set: async (status = 0) => {
        let str = status == 0 ? '同意' : '驳回'; // 确认按钮文字
        if (await dialog.confirmAsync(`您确定要${str}申请吗？`, '请确认', { esc: false, okKeyCode: false, noval: '驳回', okval: '同意', showClose: true })) {
        } else {
        }
        const res = await api.post(apiUrl.sys.review_approval.set, { id: refObj.data.id, status: status });
        if (res?.data) {
            refObj.data = { ...refObj.data, ...res.data }; // 合并对象
            dialog.success(`${str}申请完成`);
        }
    }
}

onMounted(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    if (id !== null && id > 0) {
        api.get(apiUrl.sys.review_approval.index, { id: id }).then((res) => {
            refObj.data = res.data;
        });
    }
})
</script>

<style scoped>
.body {
    padding: 3px;
    font-size: 16px;

    .apply-content {
        >p {
            margin: 15px 0;
        }

        .btn-group {
            margin-top: 10px;

            >button {
                border: none;
            }

            .reject-btn {
                background: gray;
                padding: 5px 10px;
                margin-right: 10px;
                cursor: pointer;
                border-radius: 2px;
            }

            .agree-btn {
                background: green;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 2px;
            }
        }
    }
}
</style>