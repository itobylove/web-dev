<template>
  <div class="dept-position">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" style="width: 300px;" />
    <TableComponent ref="processTable" v-if="refObj.processTableShow" v-bind="obj.processTableConfig" style="width: 100%;margin-left: 5px;" />

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

          </template>
        </div>

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
import {getQuery} from "@/core/script/nav.js";

import DialogComponent from "@/core/component/dialog.vue";

const mainTable = ref();
const processTable = ref();
const BatchDataUpdateFormRef = ref()
const BatchDataUpdateForm = ref({})
const permission = ref()
const ierarchysPermission = ref()
const formDataRef = ref();
const formMonthListRef = ref();

const refObj = reactive({
  mainTableShow: false,
  processTableShow: false,
  detailsTableShow: false
});


const vData = reactive({
  selectOption:{statistical:[]},
  item: {id: null, name: null, level: null},
})

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
      const res = await api.post(apiUrl.home.analysis.save, formData.value, null, true );
      if (res.data.code === 20000){
        dialog.success(res.data.msg);
        processTable.value.reportConfig.getData({name: vData.item.name, level: vData.item.level, id: vData.item.id, url_type:refObj.urlType  });
        mainTable.value.reportConfig.getData();
        obj.close = true;
      }
    },
    beforeOpenCallback: () => formDataRef.value.validate(),
    afterCloseCallback: () => dialogConfig.createShow = false
  },
  BatchDataUpdateConfig: {
    width: '800px',
    height: '650px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.BatchDataUpdateShow = false,
    okCallback: async (obj) => {
      obj.close = false;
      console.log('BatchDataUpdateForm', BatchDataUpdateForm.value)
      const res = await api.post(apiUrl.home.analysis.batch_modify, BatchDataUpdateForm.value, null, true);
      if (res.data.code === 20000){
        dialog.success(res.data.message);
        processTable.value.reportConfig.getData({name: vData.item.name, level: vData.item.level, id: vData.item.id, url_type:refObj.urlType  });
        mainTable.value.reportConfig.getData();
        obj.close = true;
      }
    },
    // beforeOpenCallback: () => formMonthListRef.value.validate(),
    afterCloseCallback: () => dialogConfig.BatchDataUpdateShow = false
  },
  MonthListConfig: {
    width: '800px',
    height: '650px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.MonthListShow = false,
    okCallback: async (obj) => {
      obj.close = false;
      const res = await api.post(apiUrl.home.analysis.month_save, formMonthList.value, null, true);
      if (res.data.code === 20000){
        dialog.success(res.data.message);
        processTable.value.reportConfig.getData({name: vData.item.name, level: vData.item.level, id: vData.item.id, url_type:refObj.urlType  });
        mainTable.value.reportConfig.getData();
        obj.close = true;
      }

    },
    beforeOpenCallback: () => formMonthListRef.value.validate(),
    afterCloseCallback: () => dialogConfig.MonthListShow = false
  },
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
  MonthList: async (value) => {
    console.log('查看所有月份数据');
    const res = await api.post(apiUrl.home.analysis.details, {id: value.id})
    formMonthList.value = res.list

    dialogConfig.MonthListConfig.title = '查看所有月份数据';
    dialogConfig.MonthListShow = true;
  },
  nextMonth : (currentKey) => {
    const index = dialogConfig.monthKeys.indexOf(currentKey);
    const nextIndex = (index + 1) % dialogConfig.monthKeys.length;
    const nextKey = dialogConfig.monthKeys[nextIndex];
    return dialogConfig.monthList[nextKey] || "";
  },
}

const obj = {
  options: [],
  plantId: siyi.user.plantId,
  mainTableConfig: {
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['clearWhere', 'pageExport'],
      menu: {}
    },
    searchConfig: {
      search: [],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.analysis.organ_list,
      showCheck: false ,
      checkField: 'check',
      disablePage: true ,
      options: {
        hierarchyExpandLevel: 3,
        rowSeriesNumber:{
          width: 55,
        }
      },
      events: {
        click_cell: args => {
          if (args.originData?.name !== '' && args.originData?.value !== '' ) {
            vData.item = {
              id: args.originData.id,
              name: args.originData.name,
              level: args.originData.level
            };
            processTable.value.reportConfig.getData({ exec: null, name: args.originData.name, level: args.originData.level, id: args?.originData?.id });
          }
        },
      },
      colAfterCallback: (col) => {
        return col;
      },
    },
  },
  processTableConfig:{
    searchConfig: {
      search: [
        {type: 'select',field: 'statistical',filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '统计时间',options: vData.selectOption.statistical }, value: new Date().getFullYear(), style: {width: '130px'}, save: false },
      ]
    },
    menuConfig: {
      defaultMenuShowList: ['search','moreSettings', 'clearWhere', 'pageExport'],
      menu: {
        create: {
          click: () => fn.create({})
        },
        delete: {
          click: () => {
            let asset = tableFn.getCheckedRecords(processTable.value.reportConfig);
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
                  processTable.value.reportConfig.getData({name: vData.item.name, level: vData.item.level, id: vData.item.id, url_type:refObj.urlType  });
                } else {
                  dialog.error(res.msg || '删除失败');
                }
              })
            });
          }
        },
        update: {
          click: () => {
            let asset = tableFn.getCheckedRecords(processTable.value.reportConfig);
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
            let asset = tableFn.getCheckedRecords(processTable.value.reportConfig);
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
            let asset = tableFn.getCheckedRecords(processTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }
            const data = asset.map(i => ({id: i.id}));
            fn.BatchDataUpdate(data, asset.length)
          } },
        SelectAll: {sort: 650, title: '查看全部' , icon: 'ri-file-copy-line', click: async () => {
            processTable.value.reportConfig.getData({ exec: null, name: null, level: null, id: null });
        } }
      }
    },
    tableConfig: {
      url:apiUrl.home.analysis.list,
      showCheck: true,
      disablePage: false,
      useEncryptionFields: false, //是否使用加密字段
      options: {
        // editCellTrigger:'doubleclick', // 单元格双击触发编辑
        frozenColCount: 7, // 冻结列
        rowSeriesNumber: {width: 55},
        // showFrozenIcon: true,
        autoWrapText: true, // 是否允许自动换行
        enableLineBreak: true, // 自动解析换行符
        maxCharactersNumber: 10000, // 设置单元格显示的最大字符数
        defaultRowHeight: 'auto', // 行高
      },
      colAfterCallback: (col) => {
        col.style = {lineHeight:20}
        return col;
      },
      // getQuery: () => {
      //   return {
      //     url_type: refObj.urlType,
      //     level: vData.item.level,
      //     name: vData.item.name,
      //     id: vData.item.id,
      //   };
      // },
      events: {
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {  // 改变单元格值
          if (changedValue === rawValue) {
            return ;
          }
          const vTable = processTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据
          if(!record?.id) {
            vTable.changeCellValue(col, row, rawValue);
            return;
          }
          const res = await api.post(apiUrl.home.analysis.editIndicator, {
            field: field,
            id: record.id,
            value: changedValue,
          }, null, true)
          if(res.data.code === 20000) {
            dialog.success('修改成功')
          }
        },
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
    ]
  }
}


onMounted(() => {
  const query = getQuery();
  refObj.urlType = query.type;
  const loading = dialog.loading()
  api.get(apiUrl.home.analysis.organ_init, query).then(res => {
    vData.selectOption = res?.option;

    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;
    refObj.mainTableShow = true;
    loading.close();
  });

  api.get(apiUrl.home.analysis.indicator_ini, query).then(res => {
    vData.selectOption = res?.option;
    const serchFileds = ['statistical'];
    serchFileds.forEach(field => {
      const serchItem = obj.processTableConfig.searchConfig.search.find(item => item.field === field);
      if (serchItem) serchItem.options.options = vData.selectOption[field] || [];
    })

    obj.processTableConfig.tableConfig = { ...obj.processTableConfig.tableConfig, ...res.table };
    obj.processTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    const isAdmin = res?.option?.is_admin;
    if(!isAdmin.includes('excel_text_add')){
      delete obj.processTableConfig.menuConfig.menu.create
    }
    if(!isAdmin.includes('excel_text_del')){
      delete obj.processTableConfig.menuConfig.menu.delete
    }
    if(!isAdmin.includes('excel_text_edit')){
      delete obj.processTableConfig.menuConfig.menu.edit
      delete obj.processTableConfig.menuConfig.menu.BatchDataUpdate
    }

    if(!isAdmin.includes('excel_text_export')) {
      obj.processTableConfig.menuConfig.defaultMenuShowList = obj.processTableConfig.menuConfig.defaultMenuShowList.filter(
          item => item !== 'pageExport'
      )
    }
    refObj.processTableShow = true;
  });

  api.post(apiUrl.home.excel.userList).then(res => {
    permission.value = res.list
  })

});
</script>


<style scoped>
.dept-position{
  display: flex;
  flex-direction: row;
  & .tableBox{
    flex: 1;
    padding-right: 0;
  }
  .user-list{
    flex: 5;
  }
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