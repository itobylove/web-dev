<template>
<div>
  <t-form class="form-body" :data="formData" :rules="tableRules" requiredMarkPosition="right" @submit="formRef.submit"  >
    <div style="height: 100%;overflow: hidden;">
    <t-form-item label="统计时间" name="statistical" class="w274 fleft" v-if="formData.is_admin"  >
      <t-date-picker mode="year" v-model="formData.statistical" class="statistical" style="width: 160px" />
    </t-form-item>
    <t-form-item label="被考核部门" name="indicator_type" class="w274 fleft" v-if="formData.is_admin" >
      <t-input v-model="formData.indicator_type" placeholder="请输入" />
    </t-form-item>
    <t-form-item label="指标层级" name="ierarchys"  class="w297 fleft" v-if="formData.is_admin" >
      <t-select v-model="formData.ierarchys" class="demo-select-base" placeholder="请选择" >
        <t-option value="0" label="集团" ></t-option>
        <t-option value="5" label="珠海" ></t-option>
        <t-option value="1" label="湖北" ></t-option>
        <t-option value="30" label="外发组" ></t-option>
      </t-select>
    </t-form-item>
    <t-form-item label="指标名称" name="indicator_level" class="w274 fleft" v-if="formData.is_admin" >
      <t-input v-model="formData.indicator_level" placeholder="请输入" />
    </t-form-item>

    <t-form-item label="目标类型" name="target_type" class="w274 fleft" v-if="formData.is_admin" >
      <t-select v-model="formData.target_type" class="demo-select-base" placeholder="请选择" >
        <t-option value="annual" label="年度目标" ></t-option>
        <t-option value="quarter" label="季度目标" ></t-option>
        <t-option value="month" label="月度目标" ></t-option>
      </t-select>
    </t-form-item>    

    <t-form-item label="数值符号" name="target_value_type" help="" class="fleft clear" v-if="formData.is_admin" >
      <t-radio-group v-model="formData.target_value_type">
        <t-radio value="eq">等于</t-radio>
        <t-radio value="ge">大于等于</t-radio>
        <t-radio value="le">小于等于</t-radio>
      </t-radio-group>
    </t-form-item>

    <t-form-item label="考核方式" name="target_value_type" help="考核比：大于等于(绿色),小于(红色) 考核反比:小于等于(绿色):大于(红色)" class="fleft " v-if="formData.is_admin" >
      <t-radio-group v-model="formData.compare">
        <t-radio value="posi">正比</t-radio>
        <t-radio value="agai">反比</t-radio>
        <t-radio value="not_started">项目暂不开始</t-radio>
      </t-radio-group>
    </t-form-item>

    <t-form-item label="年度目标值" name="target_value" class="w274 fleft clear" v-if="formData.is_admin" >
      <t-input v-model="formData.target_value" placeholder="请输入" />
    </t-form-item>

    <t-form-item label="目标单位" name="number_type" help="" class="w274 fleft " v-if="formData.is_admin"  >
      <t-input v-model="formData.number_type" placeholder="请输入" />
    </t-form-item>

    <t-form-item label="是否累计" class="fleft" v-if="formData.is_admin" >
      <t-switch v-model="formData.is_sum" >
        <template v-slot:label="slotProps">{{ slotProps.value ? '累计' : '不累计' }}</template>
      </t-switch>
    </t-form-item>

    <t-form-item label="数据来源" name="data_source" layout="inline" class="w274 fleft clear" v-if="formData.is_admin" >
      <t-input v-model="formData.data_source" placeholder="请输入" />
    </t-form-item>

    <t-form-item label="管理单位" name="management_unit"  layout="inline" class="w274 fleft" v-if="formData.is_admin" >
      <t-input v-model="formData.management_unit" placeholder="请输入" />
    </t-form-item>

    <t-form-item label="排序" name="sort"  layout="inline" class="w274 fleft " v-if="formData.is_admin" >
      <t-input-number v-model="formData.sort" placeholder="请输入" />
    </t-form-item>
    </div>

    <div style="background-color: #e0e0e0;padding: 10px;margin: 10px 0;">
    <t-form-item :label="mon_label + '原因分析'" name="reason"  class="clear" v-if="formData.is_reason_user" >
      <t-textarea v-model="formData.reason" placeholder="" style="" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
    </t-form-item>

    <t-form-item :label="mon_label + '工作小结'" name="result" v-if="formData.is_reason_user" >
      <t-textarea v-model="formData.result" placeholder="" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
    </t-form-item>

    <t-form-item :label="mon_label_onw+'计划(具体)'" name="programme" class="clear"  v-if="formData.is_reason_user"  >
      <t-textarea v-model="formData.programme" placeholder="" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
    </t-form-item>

    <t-form-item label="附件" name="attachment" tips="附件不能超过三个，格式为图片，pdf,xlsx,docx 其他格式不支持"  v-if="formData.is_reason_user" >
      <t-upload
        theme="file"
        name="file" 
        :action="uploadUrl" 
        :headers="headers"
        v-model="formData.attachment"
        placeholder="未选择文件"
        accept="image/*|xlsx|docx|pdf"
        style="width: 279px;"
        :formatResponse="formRef.formatResponse"
        @fail="formRef.handleFail"
        clearable
        filterable
        :max="3"
        multiple
        />
    </t-form-item>
    </div>

    <t-form-item label="标色" name="marking" v-if="formData.is_admin_assign.includes('excel_text_evaluate_edit')" >
      <t-radio-group v-model="formData.marking" variant="primary-filled" default-value="0" style="background-color: #fff;border: 1px solid #b7c1ce;" >
        <t-radio-button value="red" >红<i class="ri-brush-2-fill" style="color:#ffc8ce"></i></t-radio-button>
        <t-radio-button value="green" >绿<i class="ri-brush-2-fill" style="color:#c6efcd;"></i></t-radio-button>
        <t-radio-button value="close" >关闭</t-radio-button>
      </t-radio-group>
    </t-form-item>

    <t-form-item label="评论" name="comment" :help="help" v-if="formData.is_admin_assign.includes('excel_text_evaluate_edit')" >
      <t-textarea v-model="formData.comment" placeholder=""></t-textarea>
    </t-form-item>


    <t-form-item label="原因分析人员" name="number_type" help="" style="width: 30%" class="fleft" v-if="formData.is_admin" >
      <t-select
          v-model="formData.reason_user"
          :options="permission"
          :minCollapsedNum="3"
          placeholder="请选择人员"
          :onClear="() => {formRef.onClearSelect({key:'reason_user'})}"
          clearable
          multiple
          filterable
      />
    </t-form-item>

     <t-form-item label="数据提供人员" name="number_type" help="" class="fleft" style="margin-left:20px;width: 30%" v-if="formData.is_admin"  >
      <t-select
          v-model="formData.print_user"
          :options="permission"
          :minCollapsedNum="3"
          placeholder="请选择人员"
          :onClear="() => {formRef.onClearSelect({key:'print_user'})}"
          clearable
          multiple
          filterable
      />
    </t-form-item>

    <t-form-item label="完整表单" class="clear" v-if="formData.is_admin"  >
      <t-switch v-model="isSlotProps">
        <template v-slot:label="slotProps">{{ slotProps ? '显示' : '隐藏' }}</template>
      </t-switch>
    </t-form-item>

    <div style="background-color: rgb(210 227 242);padding: 10px;margin: 10px 0;">
    <template v-for="item in addlist" :key="item.month"   >
      <t-form-item :label="formRef.label_value(item, '目标值')" class="w274 clear "   v-if="isTarg "  style="margin-top: 20px;" >
        <t-input v-model="formData.targ[item.months]" :disabled="!formData.is_admin" ></t-input>
      </t-form-item>

      <t-form-item :label="formRef.label_value(item, '实际完成值')"  class="w274 fleft clear" style="" v-if="formData.is_print_user"  >
        <t-input v-model="formData.months[item.months]" ></t-input>
      </t-form-item>

      <t-form-item :label="formRef.label_value(item, '数据说明')" class="clear" v-if="formData.is_print_user" >
        <t-textarea v-model="formData.sour[item.months]" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
      </t-form-item>

      <t-form-item :label="formRef.label_value(item, '不达标损失金额')" class="w274 fleft " labelWidth="150px" labelAlign="right" style="" v-if="formData.is_print_user" >
        <t-input v-model="formData.loss[item.months]" ></t-input>
      </t-form-item>

      <t-input type="hidden" v-model="formData.ids[item.months]"></t-input>




      <div v-if="isSlotProps" class="clear"  >
      <t-form-item :label="formRef.label_value(item, '原因分析')"  >
        <t-textarea v-model="formData.reas[item.months]" placeholder=""></t-textarea>
      </t-form-item>

      <t-form-item :label="formRef.label_value(item, '工作小结')" >
        <t-textarea v-model="formData.resu[item.months]" placeholder=""></t-textarea>
      </t-form-item>

      <t-form-item label="下月计划(具体)" >
        <t-textarea v-model="formData.prog[item.months]" placeholder=""></t-textarea>
      </t-form-item>


      <t-form-item label="附件" >
        <t-upload
            name="file"
            theme="file"
            :action="uploadUrl"
            :headers="headers"
            v-model="formData.atta[item.months]"
            placeholder="未选择文件"
            accept="image/*|doc/*|excel/*|pdf"
            style="width: 279px;"
            :formatResponse="formRef.formatResponse"
            @fail="formRef.handleFail"
            clearable
            :max="3"
            filterable
            multiple
        />
      </t-form-item>

      <t-form-item label="标色" v-if="formData.is_admin_assign.includes('excel_text_evaluate_edit')" >
        <t-radio-group v-model="formData.mark[item.months]" variant="primary-filled" default-value="0" style="background-color: #fff;border: 1px solid #b7c1ce;" >
          <t-radio-button value="red" >红<i class="ri-brush-2-fill" style="color:#ffc8ce"></i></t-radio-button>
          <t-radio-button value="green" >绿<i class="ri-brush-2-fill" style="color:#c6efcd;"></i></t-radio-button>
          <t-radio-button value="huang" >黄<i class="ri-brush-2-fill" style="color:#b17548;"></i></t-radio-button>
        </t-radio-group>
      </t-form-item>
      
      <t-form-item :label="formRef.label_value(item, '评论')" v-if="formData.is_admin_assign.includes('excel_text_evaluate_edit')" >
        <t-textarea v-model="formData.comm[item.months]" placeholder=""></t-textarea>        
      </t-form-item>
      </div>

    </template>

    <t-form-item label="指标不达标损失金额算法" name="loss_text" labelAlign="right" labelWidth="180px"  v-if="formData.is_print_user" class="clear" >
      <t-textarea v-model="formData.loss_text" placeholder="" :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
    </t-form-item>
    </div>


    <t-form-item style="clear: both;padding-top: 20px;" v-if="formData.is_admin || formData.is_print_user || formData.is_reason_user">
      <t-button theme="primary" type="submit" >提交</t-button>
    </t-form-item>
  </t-form>
</div>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from 'vue';
import siyi from '@/core/script/siyi';
import apiUrl from "@/core/config/url2.js";
import * as api from '@/core/script/api';
import dialog from "@/core/script/dialog.js";
import { param } from 'jquery';

const now = new Date();
const isTarg = ref(false)

const addlist = ref([
    {months:'jan' }, {months: 'feb'}, {months: 'mar'}, {months: 'apr'}, {months: 'may'}, {months: 'jun'},
    {months: 'jul'}, {months: 'aug'}, {months: 'sep'}, {months: 'oct'}, {months: 'nov'}, {months: 'dec'}
])
const months = ref({'jan':'一月', 'feb':'二月', 'mar':'三月', 'apr':'四月', 'may':'五月', 'jun':'六月', 'jul':'七月', 'aug':'八月', 'sep':'九月', 'oct':'十月', 'nov':'十一月', 'dec':'十二月'})
const allMonths = Object.keys(months.value)
const isItemAdd = ref(true)



const isSlotProps = ref(false)
const uploadUrl = ref(apiUrl.home.excel.uploadUrl)
const headers = ref(api.getHttpDefaultHeaders())
const props = defineProps({
  query: {
    type: Object,
    default: {}
  },
  dialog: { type: Object },
  getAttach: { type: Function, default: () => { } },
})

const label = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const help = ref('当前为' + ((new Date()).getMonth()) + '月数据')
const mon_label = ref((label[(new Date()).getMonth() - 1]))
const mon_label_onw = ref((label[(new Date()).getMonth()]))
const permission = ref()
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
// 需要初始化月份空对象的字段名
const MONTH_FIELDS = ['reas', 'prog', 'resu', 'targ', 'comm', 'atta', 'mark', 'months', 'sour', 'loss', 'ids'];
const monthFields = MONTH_FIELDS.reduce((acc, field) => {
  if (field === 'atta') {
    acc[field] = Object.fromEntries(MONTHS.map(m => [m, []]));
  } else {
    acc[field] = Object.fromEntries(MONTHS.map(m => [m, '']));
  }
  return acc;
}, {});

console.log(monthFields)

const formData = ref({
  data_source: '',
  management_unit: '',
  indicator_level: '',
  target_type: 'annual',
  target_value: '',
  annual_cumulation: '',
  statistical: new Date().getFullYear().toString(),
  target_value_type: 'eq',
  number_type: '',
  ierarchys: '0',
  ...monthFields,
  slotProps: false,
  is_sum: false,
  attachment:[],
  marking: '',
  comment: '',
  print_user:'',
  reason_user:'',
  is_print_user: true,
  is_reason_user: true,
  is_admin: true,
  compare:'posi',
  is_admin_assign: [
    'excel_text_add',
    'excel_text_edit',
    'excel_text_all',
    'excel_text_del',
    'excel_text_export',
    'excel_text_sort_edit',
    'excel_text_evaluate_edit',
    'excel_text_analysis_edit',
    'excel_text_fill_edit',
  ]
})

const lastAddItem = ref(1)

const tableRules = reactive({
  statistical: [{required: true, message: '请选择统计时间'}],
  data_source: [{required: true, message: '请输入数据来源'}],
  management_unit: [{required: true, message: '请输入管理单位'}],
  target_type: [{required: true, message: '请选择目标类型'}],
  indicator_level: [{required: true, message: '请选择指标名称'}],
  target_value_type: [{required: true, message: '请选择数值符号'}],
  target_value: [{required: true, message: '请输入目标数值'}],
})

const formRef = {
  submit: async ({ validateResult, firstError }) => {
    if (validateResult === true) {
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.home.excel.save, formData.value)
      loading && loading.close();

      if(res?.id){
        dialog.success(`数据提交成功`);
        props.getAttach(true);
        props.dialog.close();
      }
    } else {
      dialog.warning(firstError);
    }

  },
  removeItem : (item, index) => {
    addlist.value.splice(index, 1);
    if(addlist.value.length < 12){
      isItemAdd.value = true
    }
    delete formData.value.months[item.months]
  },
  addItem : () => {
    if(formRef.getAvailableMonth()){
      addlist.value.push({id: lastAddItem.value, months: formRef.getAvailableMonth() })
      lastAddItem.value ++
      if(addlist.value.length >= 12){
        isItemAdd.value = false
      }
    }

  },
  label_value: (item, value) => {
    return months.value[item?.months] + value
  },
  getAvailableMonth: () => {
    const usedMonths = addlist.value.map(item => item.months)
    return allMonths.find(month => !usedMonths.includes(month))
  }, 
  fileSuccess: (params) => {    
    // formData.value.attachment = [{
    //       name: params.response?.data?.name,
    //       status: 'success',
    //       url: params.response?.data?.url,
    //       size: params.response?.data?.size,
    //     }]
  },
  fileOnRemove: (params) => {
    formData.value.attachment = [];
  },
  onClearSelect: ({key}) => {
    formData.value[key] = '';
  },

  formatResponse:(response) => {
    if(response?.code === 22000){
      return {error: response.message}
    }
    return response;
  },

  handleFail: ({ file }) => {
    dialog.error(file?.response?.error)
  },

}

watch(
    () => formData.value.target_type,
    (newValue, oldValue) => {
      if(newValue === 'month'){
        isTarg.value = true 
      }else{
        isTarg.value = false
      }
    },
    {immediate: false}
)

onMounted(async () => {
  let id = props.query.asset?.id
  if(id){
    const res = await api.get(apiUrl.home.excel.details, {id})
    if(res){
      console.log('res', res)
      formData.value = res
      if(res.months.length === 0){
        formData.value.months = {}
      }
      if(res?.addlist.length > 0){
        addlist.value = res?.addlist
      }
    }

  }

  api.post(apiUrl.home.excel.userList).then(res => {    
    permission.value = res.list
  })

  

})
</script>

<style scoped>
.form-body {
  padding: 20px 30px;
}

.w297{
  width: 297px;
}
.fleft{
  float: left;
}
.clear{
  clear:both
}
.w274{
  width: 274px;
}
.download{
  margin-left:  20px;font-size: 22px;cursor: pointer;
}
.download:hover{
  color: royalblue;
}
</style>