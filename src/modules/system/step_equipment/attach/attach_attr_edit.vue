<template>
  <div class="layout">
    <div class="layout-item" v-if="props.type === 'step'">
      <t-form :data="formData.data" :rules="formData.rules.step" @submit="fn.submit">
        <t-row>
          <t-col :span="11">
            <t-form-item label="名称" name="name">
              <t-input v-model="formData.data.name"/>
            </t-form-item>
            <t-form-item label="工厂" name="plant_id">
              <t-select v-model="formData.data.plant_id" :options="plantList"
                        @change="fn.selectChange('plant_id',$event)"/>
            </t-form-item>
            <t-form-item :label="'ERP' + fn.getTitle()" name="erp_step_id">
              <t-select filterable v-model="formData.data.erp_step_id"
                        :options="props.config.option.erp_step_id.filter(item => item.plantsId === props.data.plant_id)"
                        clearable/>
            </t-form-item>
            <t-form-item label="编码" name="code">
              <t-input v-model="formData.data.code"/>
            </t-form-item>
            <t-form-item label="排序" name="sort">
              <t-input-number v-model="formData.data.sort" theme="column" style="width: 100%" type="integer" min="0"
                              step="1" max="9999" placeholder="数字小靠前"/>
            </t-form-item>
            <t-form-item label="状态" name="status">
              <t-select v-model="formData.data.status" :options="formData.status"/>
            </t-form-item>
            <t-form-item label="备注" name="remark">
              <t-input v-model="formData.data.remark"/>
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" type="submit">保存</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </div>
    <div class="layout-item" v-if="props.type === 'process'">
      <t-form :data="formData.data" :rules="formData.rules.process" @submit="fn.submit">
        <t-row>
          <t-col :span="11">
            <t-form-item label="名称" name="name">
              <t-input v-model="formData.data.name"/>
            </t-form-item>
            <t-form-item label="工厂" name="plant_id">
              <t-select v-model="formData.data.plant_id" :options="plantList"/>
            </t-form-item>
            <t-form-item label="erp工艺" name="erp_process_id">
              <t-select filterable v-model="formData.data.erp_process_id"
                        :options="props.config.option.erp_process_id.filter(item => item.plantsId === props.data.plant_id)"
                        clearable/>
            </t-form-item>
            <t-form-item label="编码" name="code">
              <t-input v-model="formData.data.code"/>
            </t-form-item>
            <t-form-item label="工序" name="step_ids">
              <t-select filterable multiple v-model="formData.data.step_ids" :options="props.config.option.step_ids"/>
            </t-form-item>
            <t-form-item label="单位" name="unit_id">
              <t-select filterable v-model="formData.data.unit_id" :options="props.config.option.unit_id"/>
            </t-form-item>
            <t-form-item label="排序" name="sort">
              <t-input-number v-model="formData.data.sort" theme="column" style="width: 100%" type="integer" min="0"
                              step="1" max="9999" placeholder="数字小靠前"/>
            </t-form-item>
            <t-form-item label="状态" name="status">
              <t-select v-model="formData.data.status" :options="formData.status"/>
            </t-form-item>
            <t-form-item label="备注" name="remark">
              <t-input v-model="formData.data.remark"/>
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" type="submit">保存</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </div>
    <div class="layout-item" v-if="props.type === 'station'">
      <t-form :data="formData.data" :rules="formData.rules.station" @submit="fn.submit">
        <t-row>
          <t-col :span="11">
            <t-form-item label="名称" name="name">
              <t-input v-model="formData.data.name"/>
            </t-form-item>
            <t-form-item label="工厂" name="plant_id">
              <t-select v-model="formData.data.plant_id" :options="plantList"/>
            </t-form-item>
            <t-form-item label="工艺" name="process_ids">
              <t-select v-model="formData.data.process_ids" :options="props.config.option.process_list" multiple
                        filterable/>
            </t-form-item>
            <t-form-item label="代码" name="code">
              <t-input v-model="formData.data.code"/>
            </t-form-item>
            <t-form-item label="排序" name="sort">
              <t-input-number v-model="formData.data.sort" theme="column" style="width: 100%" type="integer" min="0"
                              step="1" max="9999" placeholder="数字小靠前"/>
            </t-form-item>
            <t-form-item label="状态" name="status">
              <t-select v-model="formData.data.status" :options="formData.status"/>
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" type="submit">提交</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </div>
    <div class="layout-item" v-if="props.type === 'equipment'">
      <t-form :data="formData.data" :rules="formData.rules.equipment" @submit="fn.submit">
        <t-row>
          <t-col :span="11">
            <t-form-item label="名称" name="name">
              <t-input v-model="formData.data.name"/>
            </t-form-item>
            <t-form-item label="工厂" name="plant_id">
              <t-select v-model="formData.data.plant_id" :options="plantList"/>
            </t-form-item>
            <t-form-item label="设备分组" name="equipment_group_ids" v-if="dialogConfig.data.type===0"> <!--设备 选择分组-->
              <t-select filterable multiple reserveKeyword v-model="dialogConfig.data.equipment_group_ids" :options="vData.selectOptions.equipment_group_ids"/>
            </t-form-item>
            <t-form-item label="ERP设备" name="erp_equipment_id">
              <t-select filterable v-model="formData.data.erp_equipment_id" :options="props.config.option.erp_equipment_id"/>
            </t-form-item>
            <!--            <t-form-item label="工段" name="station_ids">-->
            <!--              <t-select filterable multiple reserveKeyword v-model="dialogConfig.data.station_ids"-->
            <!--                        :options="dialogConfig.selectOptions.station_ids"/>-->
            <!--            </t-form-item>-->
            <t-form-item label="编码" name="code">
              <t-input v-model="formData.data.code"/>
            </t-form-item>
            <t-form-item label="型号" name="model">
              <t-input v-model="formData.data.model"/>
            </t-form-item>
            <t-form-item label="供应商" name="supplier_id">
              <t-select filterable v-model="formData.data.supplier_id" :options="props.config.option.supplier_id"/>
            </t-form-item>
            <t-form-item label="排序" name="sort">
              <t-input-number v-model="formData.data.sort" theme="column" style="width: 100%" type="integer" min="0"
                              step="1" max="9999" placeholder="数字小靠前"/>
            </t-form-item>
            <t-form-item label="状态" name="status">
              <t-select v-model="formData.data.status" :options="formData.status"/>
            </t-form-item>
            <t-form-item label="备注" name="remark">
              <t-input v-model="formData.data.remark"/>
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" type="submit">保存</t-button>
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </div>
  </div>
</template>

<script setup>

import {onMounted, reactive} from "vue";
import {plantList} from "@/utils/erp.js";
import dialog from "@/core/script/dialog.js";
import * as api from "@/core/script/api.js";

const fData = [{label: '测试1', value: 1}, {label: '测试2', value: 2}, {label: '测试3', value: 3}, {
  label: '测试4',
  value: 4
}];
const title = {step: '工序', process: '工艺', station: '工段', equipment: '设备'};
const props = defineProps({
  type: {type: String, default: ''},
  model: {type: String, default: ''},
  data: {type: Object, default: {}},
  editsAttach: {type: Function, default: () => true},
  urls: {type: Object, default: {}},
  config: {type: Object, default: {}}
})
const fn = {
  getTitle: () => {
    return title[props.type];
  },
  selectChange: (name, id) => {
    console.log('selectChange', id);
  },
  submit: async ({validateResult, firstError}) => {
    let url = props.urls[props.type];
    console.log(url);
    if (validateResult === true) {
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(url, formData.data);
      loading && loading.close();
      if (res) {
        dialog.success('保存成功');
        props.editsAttach(formData.data);
      }
    }
  }
};
const formData = reactive({
  data: JSON.parse(JSON.stringify(props.data)),
  rules: {
    step: {
      code: [{required: true, message: '请输入' + fn.getTitle() + '编码', trigger: 'submit'}],
      name: [{required: true, message: '请输入' + fn.getTitle() + '名称', trigger: 'submit'}],
    },
    process: {
      code: [{required: true, message: '请输入' + fn.getTitle() + '编码', trigger: 'submit'}],
      name: [{required: true, message: '请输入' + fn.getTitle() + '名称', trigger: 'submit'}],
    },
    station: {
      code: [{required: true, message: '请输入' + fn.getTitle() + '代码', trigger: 'submit'}],
      name: [{required: true, message: '请输入' + fn.getTitle() + '名称', trigger: 'submit'}],
    },
    equipment: {
      code: [{required: true, message: '请输入' + fn.getTitle() + '编码', trigger: 'submit'}],
      name: [{required: true, message: '请输入' + fn.getTitle() + '名称', trigger: 'submit'}],
    }
  },
  status: [{label: '禁用', value: 0}, {label: '有效', value: 1}]
})
onMounted(() => {
  console.log(props.data);
  console.log(props.config);
})
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100%;

  .layout-item {
    width: 100%;
    height: 100%;

    .t-form {
      padding: 10px 0;
    }
  }
}
</style>