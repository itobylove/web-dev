<template>
  <div ref="body" class="body">
    <div style="" class="title">集团BOM物料及各成本要素偏差率统计表</div>
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
    <DialogComponent v-if="dialogConfig.createShow" v-bind="dialogConfig.createConfig"  >
      <t-form
          ref="formDataRef"
          :data="formData"
          labelWidth="calc(2em + 24px)"
          layout="inline"
          style="margin: 20px;"
          v-bind="dialogConfig.createFormConfig"
      >
        <t-form-item label="时间" name="year" style="width: 300px;" :label-width="dialogConfig.createLabelWidth" >
          <t-date-picker mode="year" v-model="formData.year" style="width: 160px" />
        </t-form-item>

        <t-form-item label="工厂区分" name="factory_id" style="width: 40%;" :label-width="dialogConfig.createLabelWidth" >
          <t-select
              v-model="formData.factory_id"
              :options="optionsFactory"
              placeholder="请选择工厂"
              clearable
              filterable
          />
        </t-form-item>

        <t-form-item label="成本要素" name="cost_element" style="width: 90%;" :label-width="dialogConfig.createLabelWidth" >
          <t-input v-model="formData.cost_element" />
        </t-form-item>

        <t-form-item label="名称" name="name" style="width: 90%;" :label-width="dialogConfig.createLabelWidth" >
          <t-input v-model="formData.name" />
        </t-form-item>

        <t-form-item label="工序" name="process_name" style="width: 90%;" :label-width="dialogConfig.createLabelWidth" >
          <t-input v-model="formData.process_name" />
        </t-form-item>
        <t-form-item label="责任人" name="person_liable" style="width: 90%;" :label-width="dialogConfig.createLabelWidth" >
          <t-select
              v-model="formData.person_liable"
              :options="permission"
              :minCollapsedNum="3"
              placeholder="请选择人员"
              clearable
              multiple
              filterable
          />
        </t-form-item>
        <t-form-item label="目标值" name="target_rate" style="width: 45%" :label-width="dialogConfig.createLabelWidth" >
          <t-input v-model="formData.target_rate" />
        </t-form-item>
        <t-form-item label="单位" name="unit" style="width: 45%;" :label-width="dialogConfig.createLabelWidth" >
          <t-input v-model="formData.unit" />
        </t-form-item>

        <t-divider>单耗</t-divider>

        <template v-for="(item, key, index) in refObj.month">
        <t-form-item :label="item" v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
          <t-input v-model="formData.unit_consumption[key]" />
        </t-form-item>
        </template>

        <t-divider style="margin: 0;"></t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item  v-if="index < currentMonth" :label="item+`产品结构分析`" style="width: 45%;" label-width="150px">
            <t-textarea v-model="formData.product_analysis[key]" ></t-textarea>
          </t-form-item>
        </template>


        <t-divider>偏差率</t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item" v-if="index < currentMonth"   style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.deviation_rate[key]" suffix="%"/>
          </t-form-item>
        </template>

        <t-divider>偏差率分析</t-divider>
        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item + `偏差率分析`" v-if="index < currentMonth"  style="width: 45%;" label-width="150px" >
            <t-textarea v-model="formData.deviation_rate_analysis[key]" ></t-textarea>
          </t-form-item>
        </template>

        <t-divider>降本控制点/行动措施</t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.cost_control[key]" />
          </t-form-item>
        </template>

        <t-divider>偏差金额（元）</t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.deviation_amount[key]" />
          </t-form-item>
        </template>

        <t-divider>偏差量</t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.deviation_number[key]" />
          </t-form-item>
        </template>

        <t-divider>标准用量</t-divider>

        <template v-for="(item, key, index) in refObj.month">
        <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.standard_number[key]" />
          </t-form-item>
        </template>

        <t-divider style="margin: 0;"></t-divider>

        <template v-for="(item, key, index) in refObj.month">
        <t-form-item :label="item + `关联采购备货计划`" v-if="index < currentMonth" style="width: 45%;" label-width="150px" >
          <t-textarea v-model="formData.stock_plan[key]" ></t-textarea>
        </t-form-item>
        </template>

        <t-divider>标准用量金额</t-divider>

        <template v-for="(item, key, index) in refObj.month">
        <t-form-item :label="item " v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.standard_amount[key]" />
          </t-form-item>
        </template>

        <t-divider>关联财务资金计划</t-divider>

        <template v-for="(item, key, index) in refObj.month">
        <t-form-item :label="item "  v-if="index < currentMonth" style="width: 45%;" :label-width="dialogConfig.createLabelWidth" >
          <t-textarea v-model="formData.financial_funds[key]" ></t-textarea>
          </t-form-item>
        </template>

        <t-divider>实际用量</t-divider>

        <template v-for="(item, key, index) in refObj.month">
        <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.actual_number[key]" />
          </t-form-item>
        </template>

        <t-divider>实际用量金额</t-divider>

        <template v-for="(item, key, index) in refObj.month">
        <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.actual_amount[key]" />
          </t-form-item>
        </template>

        <t-divider>返工数量（平米）</t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.rework_number[key]" suffix="平米" />
          </t-form-item>
        </template>

        <t-divider>具体返工描述</t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item + `具体返工描述` "  v-if="index < currentMonth" style="width: 45%;" label-width="150px" >
            <t-textarea v-model="formData.rework_description[key]" ></t-textarea>
          </t-form-item>
        </template>

        <t-divider>返工金盐(g)</t-divider>

        <template v-for="(item, key, index) in refObj.month">
          <t-form-item :label="item "  v-if="index < currentMonth" style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.rework_gold[key]" suffix="g" />
          </t-form-item>
        </template>

        <template
            v-for="(item, key, index) in refObj.month"
            :key="key"
        >
          <template v-if="index < currentMonth">
          <t-divider  >{{item}} 在线物料</t-divider>
          <t-form-item  label="期初在线物料"  style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.early_nuber[key]" />
          </t-form-item>
          <t-form-item label="期末领用物料"  style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.midterm_nuber[key]" />
          </t-form-item>
          <t-form-item label="期末库存物料"  style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
            <t-input v-model="formData.latestage_nuber[key]" />
          </t-form-item>
        </template>
        </template>

        <t-divider style="margin: 0;"></t-divider>

        <template v-for="(item, key, index) in refObj.month" :key="key" >
        <t-form-item :label="item + `单价`" v-if="index < currentMonth"  style="width: 20%;" :label-width="dialogConfig.createLabelWidth" >
          <t-input v-model="formData.unit_price[key]" />
        </t-form-item>
        </template>



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
import editExcel from "@/modules/home/edit_excel.vue";
import Index from "@/modules/system/step_equipment/index.vue";

const mainTable = ref()
const formDataRef = ref()
const currentMonth = ref(0)
const optionsFactory = ref([])

const permission = ref([])

const refObj = reactive({
  mainTableShow: false,
  userEvaluationTableShow: false,
  month: {'jan':'一月', 'feb':'二月', 'mar':'三月', 'apr':'四月', 'may':'五月', 'jun':'六月', 'jul':'七月', 'aug':'八月', 'sep':'九月', 'oct':'十月', 'nov':'十一月', 'dec':'十二月'},
  MONTH_FIELDS: [
    'ids', 'unit_consumption',  'deviation_rate', 'cost_control', 'deviation_amount',
    'deviation_number', 'rework_description',
    'standard_number', 'standard_amount', 'financial_funds', 'actual_number', 'actual_amount', 'rework_number','rework_gold',
    'early_nuber', 'midterm_nuber', 'latestage_nuber', 'deviation_rate_analysis', 'product_analysis', 'stock_plan', 'unit_price'
  ],
  MONTHS:  ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
});

const monthFields = refObj.MONTH_FIELDS.reduce((acc, field) => {
  acc[field] = Object.fromEntries(refObj.MONTHS.map(m => [m, '']));
  return acc;
}, {});

const formData = ref({
  year: new Date().getFullYear().toString(),
  ...monthFields,
})

const vData = reactive({
  selectOption:{statistical:[]},
})

const dialogConfig = reactive({
  createShow: false,
  createLabelWidth: '90px',
  createFormConfig:{
    rules: {
      cost_element: [{required: true, message: '请填写' }],
      factory_id:[{required: true, message: '请填写' }],
      name: [{required: true, message: '请填写' }],
      process_name: [{required: true, message: '请填写' }],
      target_rate: [{required: true, message: '请填写' }],
      unit: [{required: true, message: '请填写' }],
    }
  },
  createConfig: {
    width: '80%',
    height: '80%',
    type: 'confirm',
    onAfterClose: () => dialogConfig.createShow = false,
    okCallback: async (obj) => {
      obj.close = false;
      const validateResult = await formDataRef.value.validate()
      if(validateResult === true) {
        const res = await api.post(apiUrl.home.cost_control.save, formData.value, null, true)
        if (res.data.code === 20000) {
          dialog.success(`提交成功`);
          mainTable.value.reportConfig.getData();
          obj.close = true
        }
      }
    },
      beforeOpenCallback: () => formDataRef.value.validate(),
      afterCloseCallback: () => dialogConfig.createShow = false
  },
})

const fn = {
  create: async () => {
      formData.value = {
        factory_id: 1,
        year: new Date().getFullYear().toString(),
        ...Object.fromEntries(
            Object.keys(monthFields).map(field => {
              return [field, Object.fromEntries(refObj.MONTHS.map(m => [m, '']))];
            })
        )
      };
    dialogConfig.createConfig.title = '添加';
    dialogConfig.createShow = true;
  },
  update: async (value) => {
    const res = await api.get(apiUrl.home.cost_control.detail, {id: value.id}, null, true)
    formData.value = res.data.data.list
    dialogConfig.createConfig.title = '编辑';
    dialogConfig.createShow = true;
  },

  userList: async () => {
    const res = await api.post(apiUrl.home.excel.userList)
    permission.value = res.list
  },
}



const obj = {
  options: [],
  plantId: siyi.user.plantId,
  mainTableConfig: {
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['search','moreSettings', 'clearWhere'],
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
            const data = asset.map(i => ({id: i.id}));
            dialog.confirm(`确定要删除吗？`, async () => {
              await api.post(apiUrl.home.cost_control.del, {data}).then(res => {
                if (res) {
                  dialog.success(`成功删除`);
                  mainTable.value.reportConfig.getData();
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
      },
    },
    searchConfig: {
      search: [
        {type: 'select',field: 'year',filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '统计时间'}, value: new Date().getFullYear(), style: {width: '130px'}, save: false },
        {type: 'select', field: 'factory_id_text', filter: true, options: {multiple: false,placeholder: '工厂'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'cost_element', filter: true, options: {multiple: false,placeholder: '成本要素'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'name', filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '名称'}, style: {width: '140px'}, save: false},
        {type: 'input', field: 'process_name', filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '工序'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'person_liable_text', filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '责任人'}, style: {width: '120px'}, save: false},
        // {type: 'input', field: 'assessee_text', filter: true, options: {placeholder: '被考核人'}, style: {width: '120px'}, save: false},
        // {type: 'input', field: 'reason_user_text', filter: true, options: {placeholder: '分析指派人员'}, style: {width: '120px'}, save: false},
        // {type: 'input', field: 'print_user_text', filter: true, options: {placeholder: '数据指派人员'}, style: {width: '120px'}, save: false},
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.cost_control.list,
      showCheck: true,
      checkField: 'check',
      disablePage: true,
      options: {
        editCellTrigger:'doubleclick',
        maxCharactersNumber: 10000, // 设置单元格显示的最大字符数
        defaultRowHeight: 'auto', // 行高
        autoWrapText: true,
        enableLineBreak: true,
        defaultHeaderRowHeight: 30, // 表头行高
        frozenColCount: 2,
        rowSeriesNumber: {
          width: 55,
        },
        customMergeCell: (col, row, table) => { // 自定义单元格合并规则，传入的行列号在目标区域内时，返回合并规则：
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据
          const newMonth = (new Date()).getMonth() + 1;
          if((col >= (10+newMonth) && col <= (9+(newMonth*2))) && row >= 2 && field  && record && (record?.[field] !== '' && record?.[field] !== undefined ) ){

            return {
              text: record?.[field],
              range: {
                start: {col: col, row: row},
                end: {col: col, row: row}
              },
              style: {bgColor: parseFloat(record?.[field]) >= 2 ? '#ffc8ce' : '#c6efcd'}
            }
          }
        }
      },
      events: {
        click_cell: args => {
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(args.col, args.row); //获取列名
          const record = vTable?.getRecordByCell(args.col, args.row); //根据单元格获取行数据
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

          const res = await api.post(apiUrl.home.cost_control.edit_value, {
            field: field,
            id: record.id,
            value: changedValue,
          }, null, true)
          if(res.data.code === 20000) {
            dialog.success('修改成功')
          }
        }

      },
      colAfterCallback: (col) => { //
        if(col.cellType === 'sparkline' ) {
          col.cellType = 'sparkline';
          col.sparklineSpec = {
            type: 'line',xField: 'x',yField: 'y',pointShowRule: 'all',smooth: false,line: {style: {stroke: '#2E62F1',strokeWidth: 2,},},point: {
              hover: {stroke: 'blue',strokeWidth: 1,fill: 'red',shape: 'circle',size: 4,},
              style: {stroke: 'red',strokeWidth: 1,fill: 'yellow',shape: 'circle',size: 2,},
            },
            crosshair: {style: {stroke: 'gray',strokeWidth: 1,},},
          }
        }
      //
      //   // col.style = {
      //   //   bgColor: (args) => {
      //       // if(args?.value !== undefined ) {
      //       //   console.log(args)
      //       // }
      //
      //       // if(args.col === 9) {
      //       //   const record = mainTable.value?.reportConfig.table?.getCellOriginRecord(args.col, args.row)
      //       //   if(record?.index){
      //       //     // console.log(record)
      //       //   }
      //       //
      //       //
      //       //   return ""//{1:'#c6efcd', '-1':'#ffc8ce', 0:'#e6e8f0'}[record?.is_target] || ''
      //       // }
      //   //   }
      //   // }
      //
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
  currentMonth.value = (new Date()).getMonth() + 1;
  const loading = dialog.loading()
  api.get(apiUrl.home.cost_control.init).then(res => {
    vData.selectOption = res?.option;
    optionsFactory.value = res?.option?.factory_id;

    const serchFileds = ['statistical', 'factory_id_text'];
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
.title {
  text-align: center;z-index: 9999;position: fixed;left: 44%;font-size: 22px;margin-top: 3px;
}
</style>