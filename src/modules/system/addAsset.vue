<template>
    <div class="body">
        <div class="add-cate" v-if="!props.query.edit">
            <t-form>
                <t-form-item label="分类" name="groupType" :label-width="80">
                    <t-radio-group v-model="groupType" @change="formEvents.onChange">
                        <t-radio value="1">资产</t-radio>
                        <t-radio value="0">资产组</t-radio>
                    </t-radio-group>
                </t-form-item>
            </t-form>
        </div>
        <div class="asset" v-if="formData.type === 'assets'">
            <t-form :data="formData" :rules="rules" ref="form" @reset="formEvents.onReset"
                @submit="formEvents.onSubmit">
                <t-form-item label="资产名称" name="name">
                    <t-input v-model="formData.name" placeholder="请输入资产名称"></t-input>
                </t-form-item>
                <t-form-item label="所属工厂" name="plant_id">
                    <t-select v-model="formData.plant_id" class="demo-select-base" @change="formEvents.handleChange"
                        clearable filterable placeholder="请选择所属工厂">
                        <t-option v-for="(item, index) in options.plantOptions" :value="item.value" :label="item.label"
                            :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="所属车间" name="workshop_id">
                    <t-select v-model="formData.workshop_id" class="demo-select-base" clearable filterable
                        placeholder="请选择所属车间">
                        <t-option v-for="(item, index) in options.workshopOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="资产分类" name="category_id">
                    <t-select v-model="formData.category_id" class="demo-select-base" clearable filterable
                        placeholder="请选择资产类型">
                        <t-option v-for="(item, index) in options.assetCategoryOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="特征值" name="label" help="系统管理员方可添加修改">
                    <t-select v-model="formData.label" creatable :options="options.assetLabelOptions"
                        :disabled="siyi.user.administrator === false ? true : false" filterable
                        @create="formEvents.createAssetOptions" />
                </t-form-item>
                <t-form-item label="资产编号" help="若不填写，则系统自动生成">
                    <t-input v-model="formData.code" placeholder="请输入资产编号"></t-input>
                </t-form-item>
                <t-form-item label="资产状态">
                    <t-switch size="large" v-model="formData.status" :label="['有效', '禁用']"></t-switch>
                </t-form-item>
                <t-form-item label="资产备注">
                    <t-textarea v-model="formData.remark" placeholder="请输入资产备注"
                        :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
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
                <t-form-item label="资产组名称" name="name">
                    <t-input v-model="assetGroupFormData.name" placeholder="请输入资产组名称"></t-input>
                </t-form-item>
                <t-form-item label="所属工厂" name="plant_id">
                    <t-select v-model="assetGroupFormData.plant_id" class="demo-select-base" clearable filterable
                        placeholder="请选择所属工厂" @change="formEvents.handleChange">
                        <t-option v-for="(item, index) in options.plantOptions" :value="item.value" :label="item.label"
                            :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="所属车间" name="workshop_id">
                    <t-select v-model="assetGroupFormData.workshop_id" class="demo-select-base" clearable filterable
                        placeholder="请选择所属车间">
                        <t-option v-for="(item, index) in options.workshopOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="特征值" name="group_label" help="系统管理员方可添加修改">
                    <t-select v-model="assetGroupFormData.group_label" creatable :options="options.groupLabelOptions"
                        :disabled="siyi.user.administrator === false ? true : false" filterable
                        @create="formEvents.createGroupOptions" />
                </t-form-item>
                <t-form-item label="资产组编号" help="若不填写，则系统自动生成">
                    <t-input v-model="assetGroupFormData.code" placeholder="请输入资产组编号"></t-input>
                </t-form-item>
                <t-form-item label="资产状态">
                    <t-switch size="large" v-model="assetGroupFormData.status" :label="['有效', '禁用']"></t-switch>
                </t-form-item>
                <t-form-item label="资产备注">
                    <t-textarea v-model="assetGroupFormData.remark" placeholder="请输入资产备注"
                        :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
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
import { ref, onMounted, reactive } from 'vue'
import apiUrl from '@/core/config/url2';
import * as api from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";
import siyi from '@/core/script/siyi';
const props = defineProps({
    query: {
        type: Object,
        default: {}
    },
    dialog: { type: Object },
    getAttach: { type: Function, default: () => { } },
})
const options = reactive({
    plantOptions: [],
    assetCategoryOptions: [],
    assetGroupOptions: [],
    groupLabelOptions: [],
    assetLabelOptions: [],
    workshopOptions: [],
});
const form = ref(null);
const groupForm = ref(null);
const rules = ref({
    code: [{ required: true, message: '资产编号必填', type: 'error' }],
    name: [{ required: true, message: '资产名称必填', type: 'error' }],
    plant_id: [{ required: true, message: '工厂名称必填', type: 'error' }],
    workshop_id: [{ required: true, message: '车间名称必填', type: 'error' }],
    category_id: [{ required: true, message: '资产类型必填', type: 'error' }],
    group_label: [{ required: true, message: '特征值必填', type: 'error' }],
});
const groupType = ref('1');
const formEvents = {
    INITIAL_DATA: {
        code: '',
        name: '',
        plant_id: props.query.plantId,
        workshop_id: '',
        category_id: '',
        type: 'assets',
        label: '',
        status: true,
        remark: ''
    },
    GROUP_INITIAL_DATA: {
        code: '',
        name: '',
        plant_id: props.query.plantId,
        type: '',
        workshop_id: '',
        group_label: '',
        status: true,
        remark: ''
    },
    onChange: (val) => {
        if (val === '1') {
            formData.value.type = 'assets';
        } else {
            formData.value.type = 'group';
            assetGroupFormData.value.type = 'group';
        }
    },
    onReset: () => {
        formData.value = { ...formEvents.INITIAL_DATA };
    },
    onSubmit: async (result) => {
        if (result.validateResult === true) {
            let msg = formData.value.edit ? '修改' : '添加';
            await api.post(apiUrl.sys.asset.addAsset, formData.value).then(res => {
                if (res !== null) {
                    if (res.ret) {
                        dialog.success(`资产${msg}成功`);
                        props.getAttach(true);
                    } else if (res.ret === -1) {
                        dialog.warning(res.msg || '资产已存在');
                    } else {
                        dialog.error(res.msg || `资产${msg}失败,请稍后再试`);
                    }
                    props.dialog.close();
                }else{
                    props.getAttach(false);
                }
            })
        } else {
            dialog.warning(result.firstError);
        }
    },
    handleClear: () => {
        form.value.clearValidate();
    },
    groupSubmit: async (result) => {
        let msg = assetGroupFormData.value.edit ? '修改' : '添加';
        if (result.validateResult === true) {
            await api.post(apiUrl.sys.asset.addAssetGroup, assetGroupFormData.value).then(res => {
                if (res !== null) {
                    if (res.ret) {
                        props.getAttach(true);
                        dialog.success(`资产组${msg}成功`);
                    } else if (res.ret === -1) {
                        dialog.warning(res.msg || '资产组已存在');
                    } else {
                        dialog.error(res.msg || `资产组${msg}失败,请稍后再试`);
                    }
                    props.dialog.close();
                }else{
                    props.getAttach(false);
                }
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
    },
    handleChange: (e) => {
        formData.value.workshop_id = '';
        assetGroupFormData.value.workshop_id = '';
        formEvents.getWorkshopsLists(e);
    },
    getWorkshopsLists: async (plantId) => {
        let workshopData = [];
        props.query.options.workshopOptionsLists.forEach((i) => {
            i.plant_id === plantId ? workshopData.push({ label: i.name, value: i.id }) : null;
        })
        options.workshopOptions = workshopData;
    },
    createGroupOptions: (value) => {
        options.groupLabelOptions.push({
            value,
            label: value,
        });
    },
    createAssetOptions: (value) => {
        options.assetLabelOptions.push({
            value,
            label: value,
        });
    }
}
const formData = ref({ ...formEvents.INITIAL_DATA });
const assetGroupFormData = ref({ ...formEvents.GROUP_INITIAL_DATA });

onMounted(async () => {
    let plantId = props.query.plantId;
    if (props.query.edit) {
        formData.value = props.query.asset
        formData.value.edit = true;
        plantId = props.query.asset.plant_id;
        if (props.query.asset.type === 'group') {
            assetGroupFormData.value = props.query.asset
            assetGroupFormData.value.group_label = props.query.asset.label
            assetGroupFormData.value.edit = true;
        }
    }
    let plantData = props.query.options.plantOptionsLists, categoryData = props.query.options.categoryOptionsLists, groupLabelData = props.query.options.groupLabelOptionsLists, assetsLabelData = props.query.options.labelOptionsLists;
    options.plantOptions = plantData.map(i => ({ label: i.title, value: i.id }));// 获取工厂列表
    options.assetCategoryOptions = categoryData.map(i => ({ label: i.name, value: i.id }));// 获取资产分类列表
    await formEvents.getWorkshopsLists(plantId);
    // 获取资产组类型列表
    const groupArr = [];
    for (let key in groupLabelData) {
        groupArr.push({ label: groupLabelData[key], value: groupLabelData[key] });
    }
    options.groupLabelOptions = groupArr;
    const assetsArr = [];
    for (let key in assetsLabelData) {
        assetsArr.push({ label: assetsLabelData[key], value: assetsLabelData[key] });
    }
    options.assetLabelOptions = assetsArr;
});
</script>

<style scoped>
.body {
    .add-cate {
        padding: 0 0 20px 0;
    }

    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>