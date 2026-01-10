<template>
    <div>
        <t-form ref="formRef" v-bind="form.option" v-on="form.on" class="form-body" :rules="form.rules" :data="formData">
          <t-row>
          <t-col :xs="12" :sm="6" :md="4">
            <t-form-item label="工厂" name="plant_id">
              <t-select v-model="formData.plant_id" :options="plantList"/>
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="6" :md="4" v-if="selectOption.cate_tree.length>0">
            <t-form-item label="分类" name="cate_id">
              <t-tree-select
                  v-model="formData.cate_id"
                  :data="selectOption.cate_tree"
                  clearable :treeProps="{ expandAll: true ,expandLevel:3}"
                  filterable
                  placeholder="请选择" @change="(value)=>getAttrList(value,formData?.id)"
              />
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="6" :md="4"  v-show="!props.query.hide_fields.includes('code')">
            <t-form-item label="编号" name="code">
              <t-input v-model="formData.code"  />
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="6" :md="4">
            <t-form-item label="型号" name="name" v-if="formData.cate_id===ASSET_CATE_ID_TEST_BENCH">
              <t-select v-model="formData.name"  v-bind="jobSelector" />
            </t-form-item>
            <t-form-item label="名称" name="name" v-else>
              <t-input v-model="formData.name" />
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="6" :md="4" v-if="selectOption.area_tree.length>0" v-show="!props.query.hide_fields.includes('area_full_name')">
            <t-form-item label="位置" name="area_id">
              <t-tree-select
                  v-model="formData.area_id"
                  :data="selectOption.area_tree"
                  clearable :treeProps="{ expandAll: true ,expandLevel:3}"
                  filterable
                  placeholder="请选择"
              />
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="6" :md="4" v-show="!props.query.hide_fields.includes('area_remark')">
            <t-form-item label="位置" name="area_remark">
              <t-input v-model="formData.area_remark"></t-input>
            </t-form-item>
          </t-col>

          <t-col :xs="12" :sm="6" :md="4" v-if="selectOption.employee.length>0" v-show="!props.query.hide_fields.includes('manager_name')">
            <t-form-item label="负责人" name="manager_code">
              <t-select @change="form.onManagerChange" v-model="formData.manager_code" :options="selectOption.employee" filterable/>
            </t-form-item>
          </t-col>
        <!-- <t-col :xs="12" :sm="6" :md="4">
            <t-form-item label="负责人姓名" name="manager_name">
              <t-input v-model="formData.manager_name" readonly />
            </t-form-item>
          </t-col>
          -->
          <t-col :xs="12" :sm="6" :md="4" v-show="!props.query.hide_fields.includes('manager_dept')">
            <t-form-item label="部门" name="manager_dept">
              <t-input v-model="formData.manager_dept"  />
            </t-form-item>
          </t-col>
          <t-col :xs="12" :sm="6" :md="4" v-show="!props.query.hide_fields.includes('manager_at')">
            <t-form-item label="领用时间" name="manager_at">
              <t-date-picker v-model="formData.manager_at" format=""/>
            </t-form-item>
          </t-col>
<!--          <t-col :xs="12" :sm="6" :md="4" v-show="!props.query.hide_fields.includes('manager_remark')">
            <t-form-item label="领用备注" name="manager_remark">
              <t-input v-model="formData.manager_remark"></t-input>
            </t-form-item>
          </t-col>-->
          <t-col :xs="12" :sm="6" :md="4" v-if="selectOption.status.length>0" v-show="!props.query.hide_fields.includes('status')">
            <t-form-item label="状态" name="status">
              <t-select v-model="formData.status" :options="selectOption.status"/>
            </t-form-item>
          </t-col>
            <t-col :xs="12" :sm="6" :md="4">
              <t-form-item label="备注" name="remark">
                <t-input v-model="formData.remark"></t-input>
              </t-form-item>
            </t-col>
          </t-row>
       </t-form>
      <t-form ref="form2Ref" v-bind="form2.option" v-on="form2.on" class="form-body" :rules="form2.rules" :data="form2Data">
        <t-collapse defaultExpandAll>
          <t-collapse-panel  :header="label+'属性'" className="form-tabs" v-for="label in Object.keys(attrGroupList)" :destroy-on-hide="false">
            <t-row justify="start">
              <t-col :xs="12" :sm="6" :md="4" v-for="(item,index) in attrGroupList[label]" :pull="item.sort">
                <t-form-item :key="index" :label="item.form_title || item.name" :name="item.bind_id" v-show="item.is_show">
                  <t-input-adornment :append="item.unit" v-if="item.form_type==='text'">
                    <t-input style="min-width: 250px" v-model="form2Data[item.bind_id]"
                             v-bind="{...defaultFormOption[item.form_type],...item.form_options}"></t-input>
                  </t-input-adornment>
                  <t-input-adornment :append="item.unit" v-if="['number-int','number-float'].includes(item.form_type)">
                    <t-input-number style="min-width: 250px" v-model="form2Data[item.bind_id]"
                                    v-bind="{...defaultFormOption[item.form_type],...item.form_options}"></t-input-number>
                  </t-input-adornment>
                  <t-input-adornment  v-if="item.form_type==='radio'">
                    <t-radio-group v-model="form2Data[item.bind_id]" :options="item.options"
                                   v-bind="{...defaultFormOption[item.form_type],...item.form_options}"
                    />
                  </t-input-adornment>
                  <t-input-adornment  v-if="item.form_type==='datetime'">
                    <t-date-picker v-model="form2Data[item.bind_id]"  v-bind="{...defaultFormOption[item.form_type],...item.form_options}"/>
                  </t-input-adornment>
                  <t-input-adornment  v-if="item.form_type==='date'">
                    <t-date-picker v-model="form2Data[item.bind_id]"  v-bind="{...defaultFormOption[item.form_type],...item.form_options}"/>
                  </t-input-adornment>
                  <t-input-adornment :append="item.unit" v-if="item.form_type==='text_tags'">
                    <t-tag-input style="min-width: 250px" v-model="form2Data[item.bind_id]"
                             v-bind="{...defaultFormOption[item.form_type],...item.form_options}"></t-tag-input>
                  </t-input-adornment>
                </t-form-item>
                <input v-if="!item.is_show" type="hidden" :name="item.bind_id" v-model="form2Data[item.bind_id]">
              </t-col>
            </t-row>
          </t-collapse-panel>
        </t-collapse>
      </t-form>
      <t-row>
        <t-col :md="4" :offset="1">
          <t-form-item>
            <t-button theme="primary" type="button" @click="formRef.submit()">提交</t-button>
          </t-form-item>
        </t-col>
      </t-row>
    </div>
</template>
<script setup>
import {onMounted, reactive, ref} from "vue"
import * as api from "../../core/script/api.js";
import {getOptionLabel, listToTree} from "@/utils/vars.js";
import {plantList} from "@/utils/erp.js";
import dialog from "@/core/script/dialog.js";
import {ASSET_CATE_ID_TEST_BENCH} from "@/core/config/const.js";

const props = defineProps({
  title: String,
  query: {type: Object, default: {hide_fields: [],query:'add'}},
  afterSave: {type: Function,default: () => true},
  close: {type: Function,default: () => true},
  selectOption: Object,
})


//窗口配置
const isChanged = ref(0);
const isSubmit = ref(0);


/**
 * 表单默认配置
 */
const defaultFormOption={
  'text':{},
  'textarea':{},
  'number-int':{min: 0,step:1,autoWidth:true,decimalPlaces:0},
  'number-float':{min:0,step:0.01,autoWidth:true,decimalPlaces:2},
  'datetime':{enableTimePicker:true,allowInput:true,clearable:true,format:"YYYY-MM-DD hh:mm"},
  'date':{allowInput:true,clearable:true,format:"YYYY-MM-DD"},
  'switch':{},
  'radio':{},
  'checkbox':{},
  'select':{},
  'select_multi':{},
  'file':{},
  'files':{},
  'image':{},
  'images':{},
};

const selectOption=reactive({
  cate_tree: [],
  area_tree: [],
  status: [],
  employee:[],
});


const jobSelector=reactive({
  empty:"至少5位以上(简写：客户代码.流水号.版本)",
  filterable:true,
  autofocus:false,
  visible:true,
  loading: false,
  options: [],
  onSearch: async (value) => {
    if (value.length < 5) {
      return ;
    }
    jobSelector.loading= true;
    const list = await api.jobSelector(value,{plant_id:formData.value.plant_id});
    jobSelector.options =  list.map((item) => {
      item.value=item.partNum+item.partRev;
      return item;
    })
    jobSelector.loading= false;
    if (jobSelector.options.length===1){
      jobSelector.onChange(jobSelector.options[0].value);// 直接选择唯一选项
    }
  },
  onChange: (value) => {
    const item = jobSelector.options.find(item => item.value === value);
    if (!item.value) return ;
    formData.value.name = item.value;
  },
})




//资产表单
const formRef = ref();
const formData = ref({
  id: null,
  cate_id:null,
  plant_id:null,
  name: '',
  code: '',
  remark: '',
  area_id: null,
  area_remark: '',
  manager_name: null,
  manager_at: null,
  manager_remark: null,
  status: 0,
});

const form = ref({
  tabValue: '默认参数',
  onManagerChange:(manager_code)=>{
    const manager=selectOption.employee.find(item=>item.value===manager_code);
    formData.value.manager_uid=manager?.user?.id ||  null;
    formData.value.manager_code=manager.user?.username || manager.hr.EmpNo;
    formData.value.manager_name=manager.user?.nickname || manager.hr?.EmpName;
    formData.value.manager_dept=manager.user?.identity_info || manager?.hr.PartName;
  },
  on: {
    change: async (e) => {
      console.log('on.change', e);
      isChanged.value += 1;
    },
    submit: async ({validateResult, firstError, e}) => {
      if (validateResult !== true) {
         dialog.warning('请检查输入项');
         return false;
      }
      if (Object.keys(attrGroupList).length>0){
        form2Ref.value.submit();
      }else{
        await saveForm();
      }
    },
    validator: (e) => {
      console.log('validator', e)
    },
  },
  rules: {
    name: [{required: true, message: '必填', type: 'error'}],
    plant_id: [{required: true, message: '必填', type: 'warning'}],
    cate_id: [{required: true, message: '必填', type: 'warning'}],
    // code: [{required: true, message: '必填', type: 'warning'}],
  }
});



const form2Ref = ref();
const form2Data = ref();
const form2 = ref({
  on: {
    change: async (e) => {
      console.log('on.change', e);
      isChanged.value += 1;
    },
    validator: (e) => {
      console.log('validator', e)
    },
    submit: async ({validateResult, firstError, e}) => {
      if (validateResult !== true) {
          dialog.warning('请检查输入项');
        return;
      }
      await saveForm();
    },
  },
  rules: {

  }
});


const attrList = ref([]);
const attrGroupList = ref({});

const getAttrList = async (cate_id, asset_id) => {
  attrGroupList.value = {};
  if (!cate_id) {
    attrList.value = [];
    return;
  }
  const {list} = await api.get(api.url.asset.list.value, {cate_id, asset_id});
  list.forEach((item) => {
    item.label = item.label || '默认分组';
    item.bind_id=String(item.bind_id);
    if (!attrGroupList.value?.[item.label]) {
      attrGroupList.value[item.label] = [];
    }
    form2Data.value[item.bind_id] = item.attr_value || item.form_default;
    item.is_show=item.show_scene.charAt(item.value_id?1:2)==='1'; // show_scene: 展示条件(查询/新增/修改)
    attrGroupList.value[item.label].push(item);
    if (item?.attr_required){
      form2.value.rules[item.bind_id]=form2.value.rules?.[item.bind_id] || [];
      form2.value.rules[item.bind_id].push({required: true, message: '必填', type: 'error'});
    }
  })
  attrList.value = list;
  form.value.tabValue = Object.keys(attrGroupList.value)[0];
  // console.log('attrGroupList.value', attrList.value, attrGroupList.value);
}

const saveForm = async () => {
  const loading=  dialog.loading(formRef.value.$el,'数据保存中...');
  if (props.query?.scene==='copy'){
    formData.value={...formData.value,id:0,code:''}; // 复制时，清空id
  }
  const res = await api.post(api.url.asset.list.save, {asset:formData.value,attr:form2Data.value});
  loading.close();
  if (res) {
    if (res?.id) {
      formData.value.id = res.id;
    }
    isChanged.value = 0;
    isSubmit.value = 1;
    dialog.success('保存成功');
    await props.afterSave(res,formData.value) && props.close();
  }
  return res;
}



onMounted(() => {
  // console.log('edit-page props', props);
  selectOption.cate_tree=props.selectOption?.cate_tree || [];
  selectOption.area_tree=props.selectOption?.area_tree || [];
  selectOption.status = props.selectOption?.status || []
  selectOption.employee = props.selectOption?.employee || [];
  formData.value = {...props.query.asset};
  form2Data.value = {...props.query.attr};
  getAttrList(formData.value.cate_id, formData.value.id);
})



</script>
<style scoped>
.form-body {
  padding: 10px 30px;
  .t-form__item {
    margin: 20px 0 !important;
  }
}
.t-collapse{
  margin: 20px 0;
  border: none;
}
:deep(.form-tabs){
  margin: 10px 0 10px 10px;
  .t-collapse-panel__content{
    padding: 0;
  }
  .t-collapse-panel__body{
    background: none;
  }
}
</style>
<style>
.t-form__label {
  padding-right: 10px;
}
</style>