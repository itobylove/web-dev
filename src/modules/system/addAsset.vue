<template>
    <div class="container">
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
                <t-form-item label="资产类型" name="category_id">
                    <t-select v-model="formData.category_id" class="demo-select-base" clearable filterable
                        placeholder="请选择资产类型">
                        <t-option v-for="(item, index) in options.assetCategoryOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="label标签" name="label">
                    <t-select v-model="formData.label" class="demo-select-base" clearable filterable
                        placeholder="请选择所属label标签">
                        <t-option v-for="(item, index) in options.assetLabelOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="资产编号" help="若不填写，则系统自动生成">
                    <t-input v-model="formData.code" placeholder="请输入资产编号"></t-input>
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
                <t-form-item label="label标签" name="label">
                    <t-select v-model="assetGroupFormData.label" class="demo-select-base" clearable filterable
                        placeholder="请选择所属label标签">
                        <t-option v-for="(item, index) in options.assetLabelOptions" :value="item.value"
                            :label="item.label" :key="index">
                            {{ item.label }}
                        </t-option>
                    </t-select>
                </t-form-item>
                <t-form-item label="资产组编号" help="若不填写，则系统自动生成">
                    <t-input v-model="assetGroupFormData.code" placeholder="请输入资产组编号"></t-input>
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
import siyi from '@/core/script/siyi';
const props = defineProps({
    query: {
        type: Object,
        default: {}
    },
    dialog: { type: Object },
    getAttach: { type: Function,default: () => {} },
})
const options = reactive({
    plantOptions: [],
    assetCategoryOptions: [],
    assetGroupOptions: [],
    assetLabelOptions: [],
    workshopOptions: [],
});
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
    plant_id: [{ required: true, message: '工厂名称必填', type: 'error' }],
    workshop_id: [{ required: true, message: '车间名称必填', type: 'error' }],
    category_id: [{ required: true, message: '设备类型必填', type: 'error' }],
    label: [{ required: true, message: '资产编号必填', type: 'error', trigger: 'blur' }]
});
const groupType = ref('1');
const formEvents = {
    INITIAL_DATA: {
        code: '',
        name: '',
        plant_id: siyi.user.plantId,
        workshop_id: '',
        category_id: '',
        type: 'assets',
        label: ''
    },
    GROUP_INITIAL_DATA: {
        code: '',
        name: '',
        plant_id: siyi.user.plantId,
        type: '',
        workshop_id: '',
        label: '',
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
        formData.value = { ...INITIAL_DATA };
    },
    onSubmit: async (result) => {
        if (result.validateResult === true) {
            let msg = assetGroupFormData.value.edit ? '编辑' : '添加';
            await api.post(apiUrl.sys.asset.addAsset, formData.value).then(res => {
                if (res.ret) {
                    dialog.success(`资产${msg}成功`);
                    props.getAttach(true);
                } else if (res.ret === -1) {
                    dialog.warning(res.msg || '资产已存在');
                } else {
                    dialog.error(res.msg || `资产${msg}失败,请稍后再试`);
                }
                props.dialog.close();
            })
        } else {
            dialog.warning(result.firstError);
        }
    },
    handleClear: () => {
        form.value.clearValidate();
    },
    groupSubmit: async (result) => {
        let msg = assetGroupFormData.value.edit ? '编辑' : '添加';
        if (result.validateResult === true) {
            await api.post(apiUrl.sys.asset.addAssetGroup, assetGroupFormData.value).then(res => {
                if (res.ret) {
                    props.getAttach(true);
                    dialog.success(`资产组${msg}成功`);
                } else if (res.ret === -1) {
                    dialog.warning(res.msg || '资产组已存在');
                } else {
                    dialog.error(res.msg || `资产组${msg}失败,请稍后再试`);
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
    },
    handleChange: (e) => {
        formData.value.groupId = '';
        formEvents.getWorkshopsLists(e);
    },
    getWorkshopsLists: async (plantId) => {
        await api.get(apiUrl.common.workshopsLists, { where: { plant_id: plantId } }).then(res => {
            if (res.list.length > 0) {
                options.workshopOptions = res.list.map(i => ({ label: i.name, value: i.id }));
            }
        });
    },
}
const formData = ref({ ...formEvents.INITIAL_DATA });
const assetGroupFormData = ref({ ...formEvents.GROUP_INITIAL_DATA });
onMounted(async () => {
    let status = [0, 0, 0];
    let loading = dialog.loading();;
    if (props.query.edit) {
        formData.value = props.query.asset
        formData.value.edit = true;
        if (props.query.asset.type === 'group') {
            assetGroupFormData.value = props.query.asset
            assetGroupFormData.value.edit = true;
        }
    }
    // 获取工厂列表
    await api.get(apiUrl.common.plantList).then(res => {
        if (res.list.length > 0) {
            options.plantOptions = res.list.map(i => ({ label: i.title, value: i.id }));
            status[0] = 1;
            if (status[0] && status[1] && status[2]) {
                loading.close();
            }
        }
    });
    //获取资产分类
    await api.get(apiUrl.common.assetCategoryList).then(res => {
        if (res.list.length > 0) {
            options.assetCategoryOptions = res.list.map(i => ({ label: i.name, value: i.id }));
            status[1] = 1;
            if (status[0] && status[1] && status[2]) {
                loading.close();
            }
        }
    });
    //获取车间列表
    await formEvents.getWorkshopsLists(siyi.user.plantId);
    //获取资产组类型
    await api.get(apiUrl.common.getGroupLabelLists).then(res => {
        const arr = [];
        for (let key in res.list) {
            arr.push({ label: res.list[key], value: key });
        }
        options.assetLabelOptions = arr;
        status[2] = 1;
        if (status[0] && status[1] && status[2]) {
            loading.close();
        }
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