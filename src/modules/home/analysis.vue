<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
    <DialogComponent v-if="dialogConfig.createShow" v-bind="dialogConfig.createConfig"  >
      <t-form ref="formDataRef" :data="formData" requiredMarkPosition="right" class="dialogClass" v-bind="obj.formConfig" >
        <t-form-item label="统计时间" name="statistical" class=" fleft" style="width: 330px;" >
          <t-date-picker mode="year" v-model="formData.statistical" class="statistical"  />
        </t-form-item>

        <t-form-item label="被考核部门" name="indicator_type" class=" fleft" style="width: 330px" >
          <t-input v-model="formData.indicator_type" placeholder="请输入" />
        </t-form-item>

        <t-form-item label="指标层级" name="ierarchys"  class="w297 fleft">
          <t-select v-model="formData.ierarchys" class="demo-select-base" placeholder="请选择" style="width: 200px;" >
            <t-option value="0" label="集团" ></t-option>
            <t-option value="5" label="珠海" ></t-option>
            <t-option value="1" label="湖北" ></t-option>
            <t-option value="30" label="外发组" ></t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="指标名称" name="indicator_level" class="fleft" style="width: 360px;" label-width="130px">
          <t-input v-model="formData.indicator_level" placeholder="请输入" />
        </t-form-item>

        <t-form-item label="目标类型" name="target_type" class=" fleft">
          <t-select v-model="formData.target_type" class="demo-select-base" placeholder="请选择" >
            <t-option value="annual" label="年度目标" ></t-option>
            <t-option value="quarter" label="季度目标" ></t-option>
            <t-option value="month" label="月度目标" ></t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="数值符号" name="target_value_type" help="" class="fleft clear">
          <t-radio-group v-model="formData.target_value_type">
            <t-radio value="eq">等于</t-radio>
            <t-radio value="ge">大于等于</t-radio>
            <t-radio value="le">小于等于</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="考核方式" name="compare" help="考核比：大于等于(绿色),小于(红色) 考核反比:小于等于(绿色):大于(红色)" class="fleft ">
          <t-radio-group v-model="formData.compare">
            <t-radio value="posi">正比</t-radio>
            <t-radio value="agai">反比</t-radio>
            <t-radio value="not_started">项目暂不开始</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="年度目标值" name="target_value" class=" fleft clear" style="width: 300px" >
          <t-input v-model="formData.target_value" placeholder="请输入" :suffix="formData.number_type" />
        </t-form-item>

        <t-form-item label="目标单位" name="number_type" help="" class=" fleft " style="width: 360px" label-width="130px" >
          <t-input v-model="formData.number_type" placeholder="请输入" />
        </t-form-item>

        <t-form-item label="数据来源" name="data_source" layout="inline" class=" fleft clear" style="width: 300px" >
          <t-input v-model="formData.data_source" placeholder="请输入"  />
        </t-form-item>

        <t-form-item label="管理单位" name="management_unit"  layout="inline" class=" fleft" style="width: 360px" label-width="130px" >
          <t-input v-model="formData.management_unit" placeholder="请输入" />
        </t-form-item>

        <t-form-item label="是否累计" class="fleft" style="width: 300px;">
          <t-switch v-model="formData.is_sum" >
            <template v-slot:label="slotProps">{{ slotProps.value ? '累计' : '不累计' }}</template>
          </t-switch>
        </t-form-item>

        <t-form-item label="排序" name="sort"  layout="inline" class=" fleft " style="width: 360px" label-width="130px" >
          <t-input-number v-model="formData.sort" placeholder="请输入" />
        </t-form-item>

      <div v-if="formData.target_type === 'month'" class=" clear" >

        <t-form-item
            v-for="(monthName, monthKey) in dialogConfig.monthList"
            :key="monthKey"
            :label="`${monthName}目标`"
            class="fleft"
            style="width:180px;margin-left:10px;"
            label-width="70px"
        >
          <t-input  placeholder="请输入" v-model="formData.targ[monthKey]" :suffix="formData.number_type"   />
          <t-input type="hidden" v-model="formData.date_id[monthKey]" />
        </t-form-item>
      </div>
      </t-form>
    </DialogComponent>


    <DialogComponent v-if="dialogConfig.MonthListShow" v-bind="dialogConfig.MonthListConfig"  >
      <t-form ref="formMonthListRef" :data="formMonthList" requiredMarkPosition="right" class="dialogClass" v-bind="obj.formConfig" >
        <t-form-item label="统计时间" name="statistical" class=" fleft" style="width: 300px;" >
          <t-date-picker mode="year" v-model="formMonthList.statistical" readonly  class="statistical"  />
        </t-form-item>

        <t-form-item label="被考核部门" name="indicator_type" class="w274 fleft" style="width: 300px" >
          <t-input v-model="formMonthList.indicator_type" readonly placeholder="请输入" />
        </t-form-item>

        <t-form-item label="指标层级" name="ierarchys"  class="w297 fleft">
          <t-select v-model="formMonthList.ierarchys" readonly class="demo-select-base" placeholder="请选择" style="width: 200px;" >
            <t-option value="0" label="集团" ></t-option>
            <t-option value="5" label="珠海" ></t-option>
            <t-option value="1" label="湖北" ></t-option>
            <t-option value="30" label="外发组" ></t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="指标名称" name="indicator_level" class="fleft" style="width: 300px;">
          <t-input v-model="formMonthList.indicator_level" readonly placeholder="请输入" />
        </t-form-item>

        <t-form-item label="目标类型" name="target_type" class=" fleft">
          <t-select v-model="formMonthList.target_type" readonly class="demo-select-base" placeholder="请选择" >
            <t-option value="annual" label="年度目标" ></t-option>
            <t-option value="quarter" label="季度目标" ></t-option>
            <t-option value="month" label="月度目标" ></t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="数值符号" name="target_value_type" help="" class="fleft clear">
          <t-radio-group v-model="formMonthList.target_value_type" readonly  >
            <t-radio value="eq">等于</t-radio>
            <t-radio value="ge">大于等于</t-radio>
            <t-radio value="le">小于等于</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="考核方式" name="target_value_type" help="考核比：大于等于(绿色),小于(红色) 考核反比:小于等于(绿色):大于(红色)" class="fleft ">
          <t-radio-group v-model="formMonthList.compare" readonly >
            <t-radio value="posi">正比</t-radio>
            <t-radio value="agai">反比</t-radio>
            <t-radio value="not_started">项目暂不开始</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="年度目标值" name="target_value" class=" fleft clear" style="width: 300px" >
          <t-input v-model="formMonthList.target_value" placeholder="请输入" readonly />
        </t-form-item>

        <t-form-item label="目标单位" name="number_type" help="" class=" fleft " style="width: 300px"  >
          <t-input v-model="formMonthList.number_type" placeholder="请输入" readonly />
        </t-form-item>

        <t-form-item label="数据来源" name="data_source" layout="inline" class=" fleft clear" style="width: 300px" >
          <t-input v-model="formMonthList.data_source" placeholder="请输入" readonly  />
        </t-form-item>

        <t-form-item label="管理单位" name="management_unit"  layout="inline" class=" fleft" style="width: 300px" >
          <t-input v-model="formMonthList.management_unit" placeholder="请输入" readonly />
        </t-form-item>

        <t-form-item label="是否累计" class="fleft" style="width: 300px;">
          <t-switch v-model="formMonthList.is_sum" readonly disabled >
            <template v-slot:label="slotProps">{{ slotProps.value ? '累计' : '不累计' }}</template>
          </t-switch>
        </t-form-item>

        <t-form-item label="排序" name="sort"  layout="inline" class="w274 fleft">
          <t-input-number v-model="formMonthList.sort" readonly placeholder="请输入" />
        </t-form-item>

        <div>
          <template v-for="(monthName, monthKey) in dialogConfig.monthList" :key="monthKey" >
            <t-divider>{{ monthName }}数据 </t-divider>
          <t-form-item
            :label="`${monthName}目标`"
            class="fleft"
            style="width: 150px;margin-left:10px;"
            label-width="65px"
            v-if="formMonthList.targ[monthKey]"
          >
            <t-input placeholder="请输入" disabled v-model="formMonthList.targ[monthKey]" :suffix="formMonthList.number_type"  />
          </t-form-item>

            <t-form-item
                :label="`${monthName}完成值`"
                class="fleft"
                style="margin-left:10px;"
            >
              <t-input  placeholder="请输入" v-model="formMonthList.months[monthKey]" :suffix="formMonthList.number_type" />
            </t-form-item>

            <t-form-item
                :label="`${monthName}数据说明`"
                class="clear"
            >
              <t-textarea placeholder="请输入" v-model="formMonthList.sour[monthKey]" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
            </t-form-item>

            <t-form-item
                :label="`${monthName}不达标损失金额`"
                class="fleft"
                label-width="150px"
            >
              <t-input  placeholder="请输入" v-model="formMonthList.loss[monthKey]" :suffix="formMonthList.number_type" />
            </t-form-item>


            <t-form-item
                :label="`${monthName}原因分析`"
                class="clear"
            >
              <t-textarea placeholder="请输入" v-model="formMonthList.reas[monthKey]" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
            </t-form-item>

            <t-form-item
                :label="`${monthName}工作小结`"
                class="clear"
            >
              <t-textarea placeholder="请输入" v-model="formMonthList.resu[monthKey]" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
            </t-form-item>

            <t-form-item
                :label="`${fn.nextMonth(monthKey)}计划(具体)`"
                class="clear"
            >
              <t-textarea placeholder="请输入" v-model="formMonthList.prog[monthKey]" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
            </t-form-item>

            <t-form-item
                :label="`${monthName}附件`"
                class="clear"
            >
              <t-upload
                  name="file"
                  theme="file"
                  v-model="formMonthList.atta[monthKey]"
                  :action="dialogConfig.uploadUrl"
                  :headers="dialogConfig.headers"
                  placeholder="未选择文件"
                  accept="image/*|doc/*|excel/*|pdf"
                  style="width: 279px;"
                  clearable
                  :max="3"
                  filterable
                  multiple
              />
            </t-form-item>

            <t-form-item
                :label="`${monthName}标色`"
                class="clear"
            >
              <t-radio-group variant="primary-filled" default-value="0" style="background-color: #fff;border: 1px solid #b7c1ce;" v-model="formMonthList.mark[monthKey]" >
                <t-radio-button value="red" >红<i class="ri-brush-2-fill" style="color:#ffc8ce"></i></t-radio-button>
                <t-radio-button value="green" >绿<i class="ri-brush-2-fill" style="color:#c6efcd;"></i></t-radio-button>
                <t-radio-button value="huang" >黄<i class="ri-brush-2-fill" style="color:#b17548;"></i></t-radio-button>
              </t-radio-group>
            </t-form-item>

            <t-form-item
                :label="`${monthName}评论`"
                class="clear"
            >
              <t-textarea placeholder="请输入" v-model="formMonthList.comm[monthKey]" :autosize="{ minRows: 3, maxRows: 5 }" ></t-textarea>
            </t-form-item>


          </template>
        </div>

      </t-form>
    </DialogComponent>

    <DialogComponent v-if="dialogConfig.BatchDataUpdateShow" v-bind="dialogConfig.BatchDataUpdateConfig"  >
      <t-form ref="BatchDataUpdateFormRef" :data="BatchDataUpdateForm" requiredMarkPosition="right" class="dialogClass" v-bind="obj.BatchDataUpdateConfig" >
        <t-form-item label="字段" name="style"  layout="inline" style="width: 50%;"  >
          <t-select v-model="BatchDataUpdateForm.style" placeholder="请选择" :options="obj.BatchDataUpdateConfig.fromOptions" ></t-select>
        </t-form-item>

        <t-form-item v-if="['2', '3'].includes(BatchDataUpdateForm.style)" label="数据" name="sort"  layout="inline" style="width: 95%" >
          <t-input placeholder="请输入" v-model="BatchDataUpdateForm.value" />
        </t-form-item>

        <t-form-item v-if="BatchDataUpdateForm.style === '1'" label="层级" name="number_type"  style="width: 95%" >
          <t-select
              v-model="BatchDataUpdateForm.ierarchys"
              :options="ierarchysPermission"
              placeholder="请选择层级"
              clearable
          />
        </t-form-item>

        <t-form-item v-if="BatchDataUpdateForm.style === '5'" label="数据提供人员" name="number_type" help="注：可以多选" style="width: 95%" >
          <t-select
              v-model="BatchDataUpdateForm.print_user"
              :options="permission"
              :minCollapsedNum="3"
              placeholder="请选择人员"
              clearable
              multiple
              filterable
          />
        </t-form-item>

        <t-form-item v-if="BatchDataUpdateForm.style === '4'" label="原因分析人员" name="number_type" help="注：可以多选" style="width: 95%" >
          <t-select
              v-model="BatchDataUpdateForm.reason_user"
              :options="permission"
              :minCollapsedNum="3"
              placeholder="请选择人员"
              clearable
              multiple
              filterable
          />
        </t-form-item>

      </t-form>
    </DialogComponent>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";

import editAnalysis from '@/modules/home/edit_analysis.vue'
import DialogComponent from "@/core/component/dialog.vue";


const mainTable = ref();
const formDataRef = ref();
const formMonthListRef = ref();

const BatchDataUpdateFormRef = ref()
const BatchDataUpdateForm = ref({ });

const permission = ref()
const ierarchysPermission = ref()



const refObj = reactive({
  mainTableShow: false,
});



const fn = {
  create: async () => {
    formData.value = {
      target_type: 'annual',
      statistical: new Date().getFullYear().toString(),
      target_value_type: 'eq',
      ierarchys: '0',
      compare:'posi',
      ...monthFields
    };
    dialogConfig.createConfig.title = '添加';
    dialogConfig.createShow = true;
  },
  update: async (value) => {
    const res = await api.post(apiUrl.home.analysis.details, {id: value.id})
    formData.value = res.list
    dialogConfig.createConfig.title = '编辑';
    dialogConfig.createShow = true;
  },
  MonthList: async (value) => {
    console.log('查看所有月份数据');
    const res = await api.post(apiUrl.home.analysis.details, {id: value.id})
    formMonthList.value = res.list

    dialogConfig.MonthListConfig.title = '查看所有月份数据';
    dialogConfig.MonthListShow = true;
  },
  BatchDataUpdate: async (value) => {
    BatchDataUpdateForm.value.ids = value
    const res = await api.post(apiUrl.home.analysis.field_config)
    console.log(res?.ierarchys)
    const options = Object.entries(res?.ierarchys).map(([key, label]) => {
      return {
        label,
        value: Number(key)
      }
    })
    ierarchysPermission.value = options
    dialogConfig.BatchDataUpdateConfig.title = '数据批量修改';
    dialogConfig.BatchDataUpdateShow = true;
  },
  // 根据当前 key（jan/feb）获取下一个月的名称
  nextMonth : (currentKey) => {
    const index = dialogConfig.monthKeys.indexOf(currentKey);
    const nextIndex = (index + 1) % dialogConfig.monthKeys.length;
    const nextKey = dialogConfig.monthKeys[nextIndex];
    return dialogConfig.monthList[nextKey] || "";
  },
}




const dialogConfig = reactive({
  MONTH_FIELDS : ['reas', 'prog', 'resu', 'targ', 'comm', 'atta', 'mark', 'months', 'sour', 'loss', 'date_id'],
  monthList: {'jan':'一月', 'feb':'二月', 'mar':'三月', 'apr':'四月', 'may':'五月', 'jun':'六月', 'jul':'七月', 'aug':'八月', 'sep':'九月', 'oct':'十月', 'nov':'十一月', 'dec':'十二月'},

  uploadUrl: apiUrl.home.excel.uploadUrl,
  headers: api.getHttpDefaultHeaders(),
  createShow: false,
  MonthListShow: false,
  BatchDataUpdateShow: false,
  createConfig: {
    width: '800px',
    height: '700px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.createShow = false,
    okCallback: async (obj) => {
      obj.close = false;
      console.log('formData', formData.value)
      const res = await api.post(apiUrl.home.analysis.save, formData.value );
    },
    beforeOpenCallback: () => formDataRef.value.validate(),
    afterCloseCallback: () => dialogConfig.createShow = false
  },
  MonthListConfig: {
    width: '800px',
    height: '650px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.MonthListShow = false,
    okCallback: async (obj) => {
      obj.close = false;
      const res = await api.post(apiUrl.home.analysis.month_save, formMonthList.value);

    },
    beforeOpenCallback: () => formMonthListRef.value.validate(),
    afterCloseCallback: () => dialogConfig.MonthListShow = false
  },
  BatchDataUpdateConfig: {
    width: '800px',
    height: '650px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.BatchDataUpdateShow = false,
    okCallback: async (obj) => {
      obj.close = false;
      console.log('BatchDataUpdateForm', BatchDataUpdateForm.value)
      const res = await api.post(apiUrl.home.analysis.batch_modify, BatchDataUpdateForm.value);
    },
    // beforeOpenCallback: () => formMonthListRef.value.validate(),
    afterCloseCallback: () => dialogConfig.BatchDataUpdateShow = false
  }
})

dialogConfig.monthKeys = Object.keys(dialogConfig.monthList)


const monthFields = dialogConfig.MONTH_FIELDS.reduce((acc, field) => {
  acc[field] = Object.fromEntries(dialogConfig.monthKeys.map(m => [m, '']));
  return acc;
}, {});


const formData = ref({
  target_type: 'annual',
  statistical: new Date().getFullYear().toString(),
  target_value_type: 'eq',
  ierarchys: '0',
  compare:'posi',
  ...monthFields
});

const formMonthList = ref({
  target_type: 'annual',
  statistical: new Date().getFullYear().toString(),
  target_value_type: 'eq',
  ierarchys: '0',
  compare:'posi',
  ...monthFields
})



const vData = reactive({
  selectOption:{
    statistical:[],
    ierarchys:[]
  }
})

const obj = {
  formConfig: {
    rules: {
      statistical: [{required: true, message: '请选择统计时间'}],
      data_source: [{required: true, message: '请输入数据来源'}],
      management_unit: [{required: true, message: '请输入管理单位'}],
      target_type: [{required: true, message: '请选择目标类型'}],
      indicator_level: [{required: true, message: '请选择指标名称'}],
      target_value_type: [{required: true, message: '请选择数值符号'}],
      target_value: [{required: true, message: '请输入目标数值'}],
    },
    onSubmit: async ()  => {
      console.log('submit')
    }
  },
  BatchDataUpdateConfig: {
    fromOptions: [
      {label: '层级', value: '1'},
      {label: '考核部门', value: '2'},
      {label: '指标名称', value: '3'},
      {label: '分析人员', value: '4'},
      {label: '数据人员', value: '5'},
    ]
  },
  options: [],
  plantId: siyi.user.plantId,
  tabsConfig: {
    theme: 'card',
    defaultValue: 'userTable',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: true,
  },
  mainTableConfig: {
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings', 'clearWhere'],
      menu: {
        create: {
          click: () => fn.create({})
        },
        delete: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要删除的数据');
              return;
            }
            const data = asset.map(i => ({id: i.id, type: i.type}));
            dialog.confirm(`确定要删除吗？`, async () => {
              await api.post(apiUrl.home.analysis.del, {data}).then(res => {
                if (res) {
                  dialog.success(`成功删除`);
                  mainTable.value.reportConfig.getData()
                } else {
                  dialog.error(res.msg || '删除失败');
                }
              })
            });
          }
        },
        update: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }

            if(asset.length > 1){
              dialog.info('不能选择多条数据进行修改');
              return;
            }
            fn.update(asset[0])
          }
        },
        buttonMonthList: {sort: 650, title: '分析与数据' , icon: 'ri-file-copy-line', click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }

            if(asset.length > 1){
              dialog.info('不能选择多条数据进行修改');
              return;
            }
            fn.MonthList(asset[0])
        } },
        BatchDataUpdate: {sort: 650, title: '数据批量修改' , icon: 'ri-file-copy-line', click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }
            const data = asset.map(i => ({id: i.id}));
            fn.BatchDataUpdate(data, asset.length)
        } }
      },
    },
    searchConfig: {
      search: [
        {type: 'select',field: 'statistical',filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '统计时间' }, value: new Date().getFullYear(), style: {width: '130px'} },
        {type: 'select', field: 'ierarchys_text', filter: true, filterValueType: 'value', options: {multiple: false, placeholder: '指标层级' }, value:'', style: {width: '120px'}},
        {type: 'select', field: 'indicator_type', filter: true, filterValueType: 'value', options: {multiple: false,placeholder: '考核部门' }, value:'', style: {width: '140px'}},
        {type: 'input', field: 'indicator_level', filter: true, options: {placeholder: '指标名称'}, style: {width: '120px'}},
        {type: 'input', field: 'data_source', filter: true, options: {placeholder: '数据来源'}, style: {width: '120px'}},
        {type: 'input', field: 'management_unit', filter: true, options: {placeholder: '管理单位'}, style: {width: '120px'}},
        {type: 'input', field: 'management_unit', filter: true, options: {placeholder: '分析人员'}, style: {width: '120px'}},
        {type: 'input', field: 'management_unit', filter: true, options: {placeholder: '数据人员'}, style: {width: '120px'}},
        {type: 'select', field: 'is_data', filter: false,filterValueType: 'value',
          options: {placeholder: '数据填充状态',multiple: false, options: [{label: '全部', value: ''}, {label: '已填写', value: 1}, {label: '未填写', value: 2}]},value:'', style: {width: '120px'}, onChange: val => mainTable.value.reportConfig.getData({where: {is_data: val}}),},
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.analysis.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,
      options: {
        // maxCharactersNumber: 10000, // 设置单元格显示的最大字符数
        // defaultRowHeight: 'auto', // 行高
        // autoWrapText: true, // 是否允许自动换行
        // enableLineBreak: true, // 自动解析换行符
        // defaultHeaderRowHeight: 30, // 表头行高
        rowSeriesNumber:{ width: 55, }
      },
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
            // processTable.value.reportConfig.getData({ exec: null, indicator_id: args.originData.id, type: args.originData.type });
          }
        },
        dblclick_cell: async ({originData, field}) => { //  双击单元格
          if (originData?.index === undefined) return;
        },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => { // 单元格值改变
          if (changedValue===rawValue){
            return ;
          }
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据

          if (['reason', 'programme', 'result', 'comment'].includes(field) && record?.id) {
            const res = api.post(apiUrl.home.analysis.editValue, {
              field: field,
              id: record.id,
              value: changedValue,
            })
            if(res){
              dialog.success('修改成功')
            }
          }else if(['sort'].includes( field) && record?.id){
            const res = api.post(apiUrl.home.analysis.editIndicator, {
              field: field,
              id: record.id,
              value: changedValue,
            })
            if(res){
              dialog.success('修改成功')
            }
          }else {
            vTable.changeCellValue(col, row, rawValue);
          }
        },
      },
      colAfterCallback: (col) => {
        col.style = {
          bgColor: (args) => {
            const record = mainTable.value?.reportConfig.table?.getCellOriginRecord(args.col, args.row)
            if(args.col === 6) {
              return {1:'#c6efcd', '-1':'#ffc8ce', 0:'#e6e8f0'}[record?.is_target] || ''
            }
            if (record?.marking && args.col === 10) {
              return { red:'#ffc8ce', green:'#c6efcd' }[record.marking] || ''
            }
            return null;
          },
          lineClamp:'auto'
        }
        col.headerStyle = {
          textAlign: "center",
        };

        col.style.lineHeight = 20;
        if(col?.is_admin?.includes('bgColor')){
          col.headerStyle.bgColor = '#e0e0e0';
        }
        return col;
      },
    },
  },
}

onMounted(() => {
  const loading = dialog.loading()
  api.get(apiUrl.home.analysis.init).then(res => {
    vData.selectOption = res?.option;
    const isAdmin = res?.option?.is_admin;

    const serchFileds = ['statistical', 'indicator_type', 'ierarchys_text'];
    serchFileds.forEach(field => {
      const serchItem = obj.mainTableConfig.searchConfig.search.find(item => item.field === field);
      if (serchItem) serchItem.options.options = vData.selectOption[field] || [];
    })

    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    // obj.options = res.option;

    if(!isAdmin.includes('excel_text_add')){
      delete obj.mainTableConfig.menuConfig.menu.create
    }
    if(!isAdmin.includes('excel_text_del')){
      delete obj.mainTableConfig.menuConfig.menu.delete
    }
    if(!isAdmin.includes('excel_text_edit')){
      delete obj.mainTableConfig.menuConfig.menu.edit
    }

    if(!isAdmin.includes('excel_text_export')) {
      obj.mainTableConfig.menuConfig.defaultMenuShowList = obj.mainTableConfig.menuConfig.defaultMenuShowList.filter(
          item => item !== 'pageExport'
      )
    }


    /************过滤权限**************/
    // delete obj.mainTableConfig.menuConfig.menu
    // obj.mainTableConfig.tableConfig.columns.forEach((field , index) => {
    //   if(field.editor){
    //     obj.mainTableConfig.tableConfig.columns[index].editor='false'
    //   }
    // })
    /************过滤权限**************/


    refObj.mainTableShow = true;
    loading.close();
  });

  api.post(apiUrl.home.excel.userList).then(res => {
    permission.value = res.list
  })



});
</script>


<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;

  >.mainTable {
    height: 100%;
    flex-shrink: 0;
  }

  .t-tabs {
    flex: 1;
    flex-shrink: 0;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .t-tabs-panel {
    padding: 3px;
  }
}

.excel_title {
  text-align: center;
  font-size: 25px;
  color: #0c93e5;
  position: absolute;
  top: 39px;
  z-index: 999;
  left: 775px;
  font-family:'微软雅黑';
}

.dialogClass {
  width: 100%;
  height: 100%;
  padding: 10px;
  flex-direction: column;
  gap: 10px;

  > div {
    width: auto;
  }

  .fleft {
    float: left;
  }

  .clear{
    clear:both
  }
  .w274{
    width: 274px;
  }

}
</style>