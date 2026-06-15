<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />

    <DialogComponent v-if="dialogConfig.show" v-bind="dialogConfig.config">
      <t-form ref="formDataRef" :data="formData" :rules="formRules" class="dialogClass" >
        <t-form-item label="本厂型号" name="part_num" style="margin-top: 20px;"  >
          <t-select v-model="formData.part_num" :disabled="!!formData.part_num && formData.id > 0"  v-bind="jobSelector" style="width: 300px;" />
        </t-form-item>

        <t-form-item label="客户物料号" name="cust_mat_code"  style="margin-top: 20px;" >
          <t-input v-model="formData.cust_mat_code" disabled placeholder="请输入内容" style="width: 300px;" />
        </t-form-item>

        <t-form-item label="周期" name="period" style="margin-top: 20px;" >
          <t-input v-model="formData.period"  placeholder="请输入内容" style="width: 300px;" />
        </t-form-item>

        <t-form-item label="数量" name="number" >
          <t-input-number v-model="formData.number" theme="column" placeholder="请输入" style="width: 300px;" />
        </t-form-item>

        <t-form-item label="叉位数量" name="fork_number" >
          <t-input-number v-model="formData.fork_number" theme="column" placeholder="请输入" style="width: 300px;" />
        </t-form-item>

        <t-form-item label="单位" name="batch" >
          <t-select
              v-model="formData.batch"
              placeholder="请选择"
              :options="optionsBatch"
              size="medium"
              style="width: 300px;"
          >
          </t-select>
        </t-form-item>
        <t-input type="hidden" v-model="formData.cust_mat_code" />
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
import DialogComponent from "@/core/component/dialog.vue";
import print_medium from "@/modules/asset/print_m.v250918.vue";
import printTags from '@/modules/home/print_tags.vue'
import Index from "@/modules/system/step_equipment/index.vue";

const mainTable = ref();
const formDataRef = ref(null)

const optionsBatch = reactive([
    {label: 'pcs', value: 'pcs'},
    {label: 'set', value: 'set'},
    {label: 'pnl', value: 'pnl'},
])

const refObj = reactive({
  mainTableShow: false,
});

const vData = reactive({
  selectOption:{statistical:[]}
})

const formData = ref({
  part_num: '',
  number: '',
  period: '',
  batch: '',
  cust_mat_code:'',
  fork_number:''
});

const formRules = reactive({
  part_num: [{required: true, message: '请填写本厂型号' }],
  number: [{required: true, message: '请填写数量' }],

})

const jobSelector = reactive({
  empty: "至少5位以上(简写：客户代码.流水号.版本)",
  filterable: true,
  autofocus: false,
  visible: true,
  loading: false,
  options: [],
  onSearch: async (value) => {
    if (value.length < 5) {
      return;
    }
    jobSelector.loading = true;
    const list = await api.jobSelector(value, {plant_id: siyi.user.plantId});
    jobSelector.options = list.map((item) => {
      item.value = item.label;
      return item;
    })
    jobSelector.loading = false;
    if (jobSelector.options.length === 1) {
      jobSelector.onChange(jobSelector.options[0].value);// 直接选择唯一选项
    }
  },
  onChange: async (value) => {
    const item = await jobSelector.options.find(item => item.value === value);
    if (!item.value) return;
    console.log('custMatCode', item);
    formData.value.cust_mat_code = item.custMatCode;
    // formData.value.partRev = item.partRev;
  },
})


const fn = {
  create: (formValue) => {
    if(formValue.index){
      formData.value = formValue;
      dialogConfig.config.title = '复制';
      dialogConfig.show = true;
    } else {
      formData.value = {
        batch: 'pcs',
      };
      dialogConfig.config.title = '添加';
      dialogConfig.show = true;
    }

  },
  update: (value) => {
    formData.value = value;
    dialogConfig.config.title = '修改';
    dialogConfig.show = true;
  }
}

const dialogConfig = reactive({
  show: false,
  config: {
    width: '500px',
    height: '430px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.show = false,
    okCallback: async (obj) => {
      const validateResult = await formDataRef.value?.validate();
      if(validateResult === true){
        obj.close = false;
        const loading = dialog.loading(undefined, '保存中...');
        const resBase = await api.post(apiUrl.home.tags_625.save, formData.value, null, true )
        loading && loading.close();
        if (resBase.data.code === 20000) {
          obj.close = true;
          mainTable.value.reportConfig.getData();
          dialog.window(printTags, {query: {asset: [resBase.data.data] } }, {width: '80%', height: '80%', title: "标签打印"})
        }
      } else {
        obj.close = false;
      }
    }
  },
})

const obj = {
  options: [],
  plantId: siyi.user.plantId,
  tabsConfig: {
    theme: 'card',
    defaultValue: 'userTable',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  mainTableConfig: {
    footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'clearWhere', 'moreSettings', 'pageExport'],
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
              await api.post(apiUrl.home.tags_625.del, {data}).then(res => {
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
        holidayAdd: {sort: 650, title: '打印' , icon: 'ri-list-settings-fill', click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要打印的数据');
              return;
            }
            dialog.window(printTags, {query: {asset: asset } }, {width: '80%', height: '80%', title: "标签打印"})
        }},

        holidayCopy: {sort: 650, title: '复制' , icon: 'ri-file-copy-line', click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要复制的数据');
              return;
            }
            if(asset.length > 1){
              dialog.info('不能选择多条数据进行复制');
              return;
            }

            // delete asset[0].id
            // delete asset[0].created_time
            // delete asset[0].created_uid
            // delete asset[0].version
            // delete asset[0].updated_uid
            // delete asset[0].updated_time
            // delete asset[0].period
            // delete asset[0].number
            // delete asset[0].fork_number
            const {
              id,
              created_time,
              created_uid,
              version,
              updated_uid,
              updated_time,
              period,
              number,
              fork_number,
              ...cleanAsset
            } = asset[0]

            fn.create(cleanAsset)
            //
            // dialog.confirm(`确定要复制吗？`, async () => {
            //
            //   const loading = dialog.loading(undefined, '保存中...');
            //   const resBase = await api.post(apiUrl.home.tags_625.save, asset[0], null, true )
            //   loading && loading.close();
            //   if (resBase) {
            //     dialog.success(`复制成功`);
            //     mainTable.value.reportConfig.getData();
            //   } else {
            //     dialog.error(resBase.msg || '复制失败');
            //   }
            //
            // })




          }},

      },
    },
    searchConfig: {
      search: [
        {type: 'input', field: 'part_num', filter: true, options: {placeholder: '本厂型号'}, style: {width: '200px'}},
        {type: 'input', field: 'cust_code', filter: true, options: {placeholder: '客户代码'}, style: {width: '200px'}},
        {type: 'input', field: 'cust_mat_code', filter: true, options: {placeholder: '客户物料号'}, style: {width: '200px'}},
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.tags_625.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,
      options: {
      },
      events: {
        click_cell: args => {

        },
        dblclick_cell: args => { },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {

        },
      },
      colAfterCallback: (col) => {


        return col;
      },
    },
  },
}


onMounted(() => {
  const loading = dialog.loading()
  api.get(apiUrl.home.tags_625.config).then(res => {
    vData.selectOption = res?.option;
    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;
    refObj.mainTableShow = true;
    loading.close();
  });



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
</style>