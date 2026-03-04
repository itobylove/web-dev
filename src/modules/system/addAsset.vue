<template>
    <div class="container">
        <div class="add-cate">
            <t-form>
                <t-form-item label="分类" name="groupType" :label-width="80">
                    <t-radio-group v-model="groupType" @change="onChange">
                        <t-radio value="1">资产</t-radio>
                        <t-radio value="0">资产组</t-radio>
                    </t-radio-group>
                </t-form-item>
            </t-form>
        </div>
        <div class="asset" v-if="isAsset">
            <t-form :data="formData" :rules="rules" ref="form" @reset="formEvents.onReset"
                @submit="formEvents.onSubmit">
                <t-form-item label="资产编号" name="code">
                    <t-input v-model="formData.code" placeholder="请输入资产编号"></t-input>
                </t-form-item>
                <t-form-item label="资产名称" name="name">
                    <t-input v-model="formData.name" placeholder="请输入资产名称"></t-input>
                </t-form-item>
                <!-- <t-form-item label="资产状态" name="status">
                    <t-switch size="large" v-model="formData.status" :label="['启用', '停用']"></t-switch>
                </t-form-item> -->
                <t-form-item label="所属工厂" name="plantId">
                    <t-select v-model="formData.plantId" class="demo-select-base" clearable filterable
                        placeholder="请选择所属工厂">
                        <t-option v-for="(item, index) in options.plantOptions" :value="item.value" :label="item.label"
                            :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="资产类型" name="categoryId">
                    <t-select v-model="formData.categoryId" class="demo-select-base" clearable filterable
                        placeholder="请选择资产类型">
                        <t-option v-for="(item, index) in options.assetCategoryOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="资产分组" name="groupId">
                    <t-select v-model="formData.groupId" class="demo-select-base" clearable filterable
                        placeholder="请选择资产分组">
                        <t-option v-for="(item, index) in options.assetGroupOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item>
                    <t-space size="10px">
                        <t-button theme="primary" type="submit">提交</t-button>
                        <t-button theme="default" variant="base" type="reset">重置</t-button>
                        <t-button theme="default" variant="base" @click="formEvents.handleClear">清空校验结果</t-button>
                    </t-space>
                </t-form-item>
            </t-form>
        </div>
        <div class="asset-group" v-else>
            <t-form :data="assetGroupFormData" :rules="rules" ref="groupForm" @reset="formEvents.groupReset"
                @submit="formEvents.groupSubmit">
                <t-form-item label="资产组编号" name="code">
                    <t-input v-model="assetGroupFormData.code" placeholder="请输入资产组编号"></t-input>
                </t-form-item>
                <t-form-item label="资产组名称" name="name">
                    <t-input v-model="assetGroupFormData.name" placeholder="请输入资产组名称"></t-input>
                </t-form-item>
                <t-form-item label="所属工厂" name="plantId">
                    <t-select v-model="assetGroupFormData.plantId" class="demo-select-base" clearable filterable
                        placeholder="请选择所属工厂">
                        <t-option v-for="(item, index) in options.plantOptions" :value="item.value" :label="item.label"
                            :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="资产类型" name="type">
                    <t-select v-model="assetGroupFormData.type" class="demo-select-base" clearable filterable
                        placeholder="请选择资产类型">
                        <t-option v-for="(item, index) in options.assetTypeOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="所属车间" name="workshopId">
                    <t-select v-model="assetGroupFormData.workshopId" class="demo-select-base" clearable filterable
                        placeholder="请选择所属车间">
                        <t-option v-for="(item, index) in options.workshopOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="label标签" name="label">
                    <t-input v-model="assetGroupFormData.label" placeholder="请输入label标签"></t-input>
                </t-form-item>
                <t-form-item>
                    <t-space size="10px">
                        <t-button theme="primary" type="submit">提交</t-button>
                        <t-button theme="default" variant="base" type="reset">重置</t-button>
                        <t-button theme="default" variant="base" @click="formEvents.groupHandleClear">清空校验结果</t-button>
                    </t-space>
                </t-form-item>
            </t-form>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import apiUrl from '@/core/config/url2';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import { type } from 'jquery';
const props = defineProps({
    dialog: { type: Object },
})
const INITIAL_DATA = {
    code: '',
    name: '',
    status: true,
    plantId: '',
    categoryId: '',
    groupId: '',
};
const checked = ref(true);
const options = reactive({
    plantOptions: [],
    assetCategoryOptions: [],
    assetGroupOptions: [],
    assetTypeOptions: [],
    workshopOptions: [],
});
const isAsset = ref(true);
const formData = ref({ ...INITIAL_DATA });
const GROUP_INITIAL_DATA = {
    code: '',
    name: '添加资产组',
    plantId: '',
    type: '',
    workshopId: '',
    label: '',
};
const assetGroupFormData = ref({ ...GROUP_INITIAL_DATA });
const form = ref(null);
const groupForm = ref(null);
const rules = ref({
    code: [
        {
            required: true,
            message: '资产编号必填',
            type: 'error',
            trigger: 'blur',
        },
        { required: true, message: '资产编号必填', type: 'error' },
        { whitespace: true, message: '资产编号不能包含空格不能为空' },
        {
            min: 2,
            message: '至少需要两个字符，一个中文等于两个字符',
            type: 'warning',
            trigger: 'blur',
        },
        {
            max: 10,
            message: '资产编号字符长度超出',
            type: 'warning',
            trigger: 'blur',
        },
    ],
    name: [
        {
            required: true,
            message: '资产名称必填',
            type: 'error',
            trigger: 'blur',
        },
        // trigger 默认为 'change'
        { required: true, message: '资产名称必填', type: 'error' },
        { whitespace: true, message: '资产名称不能包含空格不能为空' },
        {
            min: 2,
            message: '至少需要两个字符，一个中文等于两个字符',
            type: 'warning',
            trigger: 'blur',
        },
        {
            max: 120,
            message: '资产名称字符长度超出',
            type: 'warning',
            trigger: 'blur',
        },
    ],
    plantId: [{ required: true, message: '工厂名称必填', type: 'error' }],
    categoryId: [{ required: true, message: '设备类型必填', type: 'error' }],
    groupId: [{ required: true, message: '设备分组必填', type: 'error' }],
    groupType: [{ required: true, message: '资产分组类型必填', type: 'error' }],

});
const selectType = ref(1);
const groupType = ref('1');
const onChange = (val) => {
    console.log('选择的类型：', val);
    if (val === '1') {
        isAsset.value = true;
    } else {
        isAsset.value = false;
    }
}
const formEvents = {
    onReset: () => {
        formData.value = { ...INITIAL_DATA };
    },
    onSubmit: (result) => {
        if (result.validateResult === true) {
            console.log(formData.value);
            dialog.success('提交成功');
        } else {
            dialog.warning(result.firstError);
        }
    },
    handleClear: () => {
        form.value.clearValidate();
    },
    groupSubmit: async (result) => {
        if (result.validateResult === true) {
            await api.post(apiUrl.sys.asset.addAssetGroup, assetGroupFormData.value).then(res => {
                if (res.ret) {
                    dialog.success('资产组添加成功');
                } else if (res.ret === -1) {
                    dialog.warning(res.msg || '资产组已存在');
                } else {
                    dialog.error(res.msg || '资产组添加失败,请稍后再试');
                }
                props.dialog.close();
            })
        } else {
            dialog.warning(result.firstError);
        }
    },
    groupReset: () => {
        groupForm.value.reset();
    },
    groupHandleClear: () => {
        groupForm.value.clearValidate();
    }
}
onMounted(async () => {
    // 获取工厂列表
    await api.get(apiUrl.common.plantList).then(res => {
        if (res.list.length > 0) {
            options.plantOptions = res.list.map(i => ({ label: i.title, value: i.id }));
        }
    });
    //获取资产分类
    await api.get(apiUrl.common.assetCategoryList).then(res => {
        if (res.list.length > 0) {
            options.assetCategoryOptions = res.list.map(i => ({ label: i.name, value: i.id }));
        }
    });
    //获取资产分组
    await api.get(apiUrl.common.assetGroupList).then(res => {
        if (res.list.length > 0) {
            options.assetGroupOptions = res.list.map(i => ({ label: i.name, value: i.id }));
        }
    });
    //获取资产组类型
    await api.get(apiUrl.common.getGroupTypeLists).then(res => {
        const arr = [];
        for (let key in res.list) {
            arr.push({ label: res.list[key], value: key });
        }
        options.assetTypeOptions = arr;
    })
});
</script>

<style scoped>
.container {
    .add-cate {
        padding: 0 0 20px 0;
    }

    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>