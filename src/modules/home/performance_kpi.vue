<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
    <DialogComponent v-if="dialogConfig.assesseeShow" v-bind="dialogConfig.assesseeConfig"  >
      <t-form
          :data="formAssessee"
          labelWidth="calc(2em + 24px)"
          layout="inline"
          style="margin: 20px;"
      >
        <t-form-item label="考评人" name="assessee" style="width: 90%;"  >
          <t-select
              v-model="formAssessee.assessee"
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

    <DialogComponent v-if="dialogConfig.userEvaluationShow" v-bind="dialogConfig.userEvaluationConfig"  >
      <t-form
          labelWidth="calc(2em + 24px)"
          :data="formData"
          :rules="dialogConfig.formDataRules"
          ref="formDataRef"
          layout="inline"
          style="margin: 20px;"
      >
        <t-form-item label="考评人" name="assessee" label-width="70px" >
          <t-select
              v-model="formData.assessee"
              :options="assesseeOption"
              placeholder="请选择"
              clearable
              filterable
          />
        </t-form-item>
        <t-form-item label="时间"  name="month">
          <t-date-picker v-model="formData.month" mode="month" />
        </t-form-item>

        <t-button theme="primary" @click="fn.userEvaluationSearch" >查询</t-button>
        <t-button theme="primary" style="margin-left: 20px" @click="fn.print">打印</t-button>
      </t-form>

      <TableComponent class="mainTable" ref="userEvaluationTable" v-if="refObj.userEvaluationTableShow" v-bind="obj.userEvaluationTableConfig" />
    </DialogComponent>

    <DialogComponent v-if="dialogConfig.BatchDataUpdateShow" v-bind="dialogConfig.BatchDataUpdateConfig"  >
      <t-form ref="BatchDataUpdateFormRef" :data="BatchDataUpdateForm" requiredMarkPosition="right" class="dialogClass" v-bind="obj.BatchDataUpdateConfig" >
        <t-form-item label="字段" name="style"  layout="inline" style="width: 50%;"  >
          <t-select v-model="BatchDataUpdateForm.style" placeholder="请选择" :options="obj.BatchDataUpdateConfig.fromOptions" ></t-select>
        </t-form-item>

        <t-form-item v-if="['2', '3', '7'].includes(BatchDataUpdateForm.style)" label="数据" name="sort"  layout="inline" style="width: 95%" >
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

        <t-form-item v-if="BatchDataUpdateForm.style === '6'" label="被考核人" name="assessee" help="注：可以多选" style="width: 95%" >
          <t-select
              v-model="BatchDataUpdateForm.assessee"
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

import TableComponent from "@/core/component/table_v2.vue";
import {onMounted, reactive, ref} from "vue";
import siyi from "@/core/script/siyi.js";
import apiUrl from "@/core/config/url2.js";
import {getQuery} from "@/core/script/nav.js";
import dialog from "@/core/script/dialog.js";
import * as api from "@/core/script/api.js";
import * as tableFn from "@/core/script/tableFn.js";
import DialogComponent from "@/core/component/dialog.vue";

import print_performance from "@/modules/home/print_performance.vue";

const mainTable = ref()
const formData = ref({})
const BatchDataUpdateForm = ref({})
const ierarchysPermission = ref()
const permission = ref([])
const formAssessee = ref({})
const assesseeOption = ref([])
const userEvaluationTable = ref()
const formDataRef = ref()



const refObj = reactive({
  mainTableShow: false,
  userEvaluationTableShow: false,
});

const vData = reactive({
  selectOption:{statistical:[]},
})

const dialogConfig = reactive({
  assesseeShow: false,
  userEvaluationShow: false,
  formDataRules: {
    assessee: [{required: true, message: '请选择考评人', trigger: 'change'}],
    month: [{required: true, message: '请选择时间', trigger: 'change'}],
  },
  userEvaluationConfig: {
    width: '80%',
    height: '700px',
    type: 'window',
    onAfterClose: () => dialogConfig.userEvaluationShow = false,
    afterCloseCallback: () => dialogConfig.userEvaluationShow = false
  },
  assesseeConfig: {
    width: '800px',
    height: '400px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.assesseeShow = false,
    okCallback: async (obj) => {
      obj.close = false;
      const res = await api.post(apiUrl.home.performance.editIndicator, {
        id: formAssessee.value.id,
        field: 'assessee',
        value: formAssessee.value.assessee,
      }, null, true );
      if (res.data.code === 20000){
        dialog.success(res.data.message);
        mainTable.value.reportConfig.getData();
        obj.close = true;
      }
    },
    beforeOpenCallback: () => {},
    afterCloseCallback: () => dialogConfig.assesseeShow = false
  },
  BatchDataUpdateConfig: {
    width: '800px',
    height: '400px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.BatchDataUpdateShow  = false,
    okCallback: async (obj) => {
      obj.close = false;
      const res = await api.post(apiUrl.home.performance.batch_modify, BatchDataUpdateForm.value, null, true );
      if (res.data.code === 20000){
        dialog.success(res.data.msg);
        mainTable.value.reportConfig.getData();
        obj.close = true;
      }
    },
    beforeOpenCallback: () => {},
    afterCloseCallback: () => dialogConfig.BatchDataUpdateShow = false
  }

})

const fn = {
  fieldConfig: async () => {
    const res = await api.post(apiUrl.home.analysis.field_config)
    const options = Object.entries(res?.ierarchys).map(([key, label]) => {
      return {
        label,
        value: Number(key)
      }
    })
    ierarchysPermission.value = options
  },
  userList: async () => {
    const res = await api.post(apiUrl.home.excel.userList)
    permission.value = res.list
    // console.log('permission', permission.value)
  },
  BatchDataUpdate: async (value) => {
    BatchDataUpdateForm.value  = {
      ids: value
    }
    fn.fieldConfig()
    dialogConfig.BatchDataUpdateConfig.title = '数据批量修改';
    dialogConfig.BatchDataUpdateShow = true;
  },
  assesseeUpdate: async (value) => {
    console.log(value.assessee)
    formAssessee.value = {
      id: value.id,
      assessee: value?.assessee || []
    }
    dialogConfig.assesseeConfig.title = '修改考核人';
    dialogConfig.assesseeShow = true;
  },
  userEvaluation: async () => {
    const loading = dialog.loading()
    const res = await api.get(apiUrl.home.performance.assessee_init)
    if (res) {
      obj.userEvaluationTableConfig.tableConfig = {...obj.userEvaluationTableConfig.tableConfig, ...res.table};
      obj.userEvaluationTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
      obj.options = res.option;
      loading.close();


      const resUser = await api.get(apiUrl.home.performance.assessee_user_list)
      if(resUser){
        assesseeOption.value = resUser?.list

        refObj.userEvaluationTableShow = true;

        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        formData.value = {
          month: `${year}-${month}`
        }
        dialogConfig.userEvaluationConfig.title = '人员考评';
        dialogConfig.userEvaluationShow = true
      }
    }
  },
  userEvaluationSearch: async () => {
    console.log('formData', formData.value)
    const isValid = await formDataRef.value.validate()
    if(isValid === true){
      userEvaluationTable.value.reportConfig.getData(formData.value);
    }
  },
  print: () => {
    dialog.window(print_performance, {query: {asset: {} } }, {width: '80%', height: '80%', title: "标签打印"})
  }
}



const obj = {
  options: [],
  plantId: siyi.user.plantId,
  userEvaluationTableConfig: {
    changeSizeBottom: true,
    menuConfig: false,
    searchConfig: false,
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.performance.assessee_list,
      showCheck: false,
      checkField: 'check',
      disablePage: true,
      options: {
        rowSeriesNumber: {
          width: 55,
        }
      },
      events: {
        click_cell: args => { }, // 单击
        dblclick_cell: ({originData, field}) => {}, // 双击单元格
      },
      colAfterCallback: (col) => { //列数据处理方法
        return col;
      },
    },
  },
  mainTableConfig: {
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['search','moreSettings', 'clearWhere'],
      menu: {
        BatchDataUpdate: {sort: 650, title: '数据批量修改' , icon: 'ri-file-copy-line', click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }
            const data = asset.map(i => ({id: i.id}));
            fn.BatchDataUpdate(data)
          } },
        userEvaluation: {sort: 660, title: '人员考评' , icon: 'ri-file-copy-line', click: async () => {
            fn.userEvaluation();
          } }
      },
    },
    searchConfig: {
      search: [
        {type: 'select',field: 'statistical_text',filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '统计时间'}, value: new Date().getFullYear(), style: {width: '130px'}, save: false },
        {type: 'select', field: 'ierarchys_text', filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '层级'}, style: {width: '120px'}, save: false},
        {type: 'select', field: 'indicator_type_text', filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '考核部门'}, style: {width: '140px'}, save: false},
        {type: 'select', field: 'indicator_level_text', filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '指标名称'}, style: {width: '120px'}, save: false},
        {type: 'select', field: 'target_type_text', filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '目标类型'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'assessee_text', filter: true, options: {placeholder: '被考核人'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'reason_user_text', filter: true, options: {placeholder: '分析指派人员'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'print_user_text', filter: true, options: {placeholder: '数据指派人员'}, style: {width: '120px'}, save: false},
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.performance.list,
      showCheck: true,
      checkField: 'check',
      disablePage: true,
      options: {
        rowSeriesNumber: {
          width: 55,
        }
      },
      events: {
        click_cell: args => {
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(args.col, args.row); //获取列名
          const record = vTable?.getRecordByCell(args.col, args.row); //根据单元格获取行数据
          if(field === 'assessee_text'){
            fn.assesseeUpdate(record)
          }
        },
        dblclick_cell: ({originData, field}) => {
          console.log(originData);
          console.log(field);

        },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {  // 改变单元格值
          if (changedValue === rawValue) {
            return ;
          }
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据
          if(!record?.id) {
            vTable.changeCellValue(col, row, rawValue);
            return;
          }

          const res = await api.post(apiUrl.home.performance.editIndicator, {
            field: field,
            id: record.id,
            value: changedValue,
          }, null, true)
          if(res.data.code === 20000) {
            dialog.success('修改成功')
          }
        }

      },
      colAfterCallback: (col) => {
        return col;
      },
    },
  },
  BatchDataUpdateConfig: {
    fromOptions: [
      {label: '层级', value: '1'},
      {label: '考核部门', value: '2'},
      {label: '指标名称', value: '3'},
      {label: '分析人员', value: '4'},
      {label: '数据人员', value: '5'},
      {label: '被考核人', value: '6'},
      {label: '自评得分公式', value: '7'},
    ]
  }
}


onMounted(() => {
  const loading = dialog.loading()
  api.get(apiUrl.home.performance.init).then(res => {
    vData.selectOption = res?.option;

    const serchFileds = ['statistical_text', 'target_type_text', 'indicator_level_text', 'ierarchys_text', 'indicator_type_text'];
    serchFileds.forEach(field => {
      const serchItem = obj.mainTableConfig.searchConfig.search.find(item => item.field === field);
      if (serchItem) serchItem.options.options = vData.selectOption[field] || [];
    })

    obj.mainTableConfig.tableConfig = {...obj.mainTableConfig.tableConfig, ...res.table};
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;
    refObj.mainTableShow = true;
    loading.close();
  });

  fn.userList()

})
</script>


<style scoped>
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