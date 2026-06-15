<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />

    <DialogComponent v-if="dialogConfig.show" v-bind="dialogConfig.config">
      <t-form ref="formDataRef" :data="formData" :rules="formRules" class="dialogClass" >
        <t-form-item label="型号" name="sizes" style="margin-top: 20px;"  >
<!--          <t-input v-model="formData.sizes"  placeholder="请输入" style="width: 300px;" />-->
          <t-select v-model="formData.sizes"  v-bind="salePartSelector" style="width: 300px;" />
        </t-form-item>

        <t-form-item label="价格" name="price"  style="margin-top: 20px;" >
          <t-input v-model="formData.price"  placeholder="请输入" style="width: 300px;" />
        </t-form-item>

        <t-form-item label="生效时间" name="effective_time" style="margin-top: 20px;" >
          <t-date-picker v-model="formData.effective_time" style="width: 300px;" />
        </t-form-item>
      </t-form>
    </DialogComponent>

    <input type="file" ref="fileInput" style="display:none" @change="tableEvent.import" />
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
import printTags from "@/modules/home/print_tags.vue";
import * as selector from "@/core/config/select.js";

const formData = ref({})
const mainTable = ref()
const refObj = reactive({
  mainTableShow: false,
});
const fileInput = ref();
const vData = reactive({
  selectOption:{statistical:[]}
})

const formDataRef = ref(null)

const formRules = reactive({
  effective_time: [{required: true, message: '请输入生效时间', trigger: 'blur'},],
})

const salePartSelector = reactive({
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
    salePartSelector.loading = true;
    const list = await api.salePartSelector(value, {plant_id: siyi.user.plantId, showMore: 1});
    salePartSelector.options = list.map((item) => {
      item.value = item.label;
      return item;
    })
    salePartSelector.loading = false;
    if (salePartSelector.options.length === 1) {
      salePartSelector.onChange(salePartSelector.options[0].value);// 直接选择唯一选项
    }
  },
  onChange: async (value) => {
    const item = await salePartSelector.options.find(item => item.value === value);
    if (!item.value) return;
    formData.value.rec_id = item.recId;
    formData.value.sales_part_num = item.salesPartNum;
    formData.value.salespart_rev = item.salespartRev;
  },
})


const tableEvent = {
  import: async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) {
      fileInput.value.click();
      return;
    }
    e.target.value = "";
    const loading= dialog.loading(undefined,'正在导入数据，请稍等！');
    const res = await api.uploader({file}, apiUrl.home.quotation.import);
    loading.close();
    mainTable.value.reportConfig.getData();

  }
}
const fn = {
  create: () => {
    formData.value = {}
    dialogConfig.config.title = '添加';
    dialogConfig.show = true;
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
    height: '300px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.show = false,
    okCallback: async (obj) => {
      const validateResult = await formDataRef.value?.validate();
      if(validateResult === true){
        obj.close = false;
        const loading = dialog.loading(undefined, '保存中...');
        const resBase = await api.post(apiUrl.home.quotation.save, formData.value, null, true )
        loading && loading.close();
        if (resBase.data.code === 20000) {
          obj.close = true;
          mainTable.value.reportConfig.getData();
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
  // panelConfig: {
  //   destroyOnHide: false,
  // },
  mainTableConfig: {
    // changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'clearWhere', 'moreSettings', 'pageExport'],
      menu: {
        create: {
          click: () => fn.create()
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
              await api.post(apiUrl.home.quotation.del, {data}).then(res => {
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
        holidayCopy: {sort: 650, title: '导入' , icon: 'ri-import-line', click: async (e) => tableEvent.import() }
      },
    },
    // searchConfig: {
    //   search: [
    //     // {type: 'input', field: 'require_uid_text', filter: true, options: {placeholder: '提出人'}, style: {width: '120px',}},
    //     // {type: 'input', field: 'todo_matter', filter: true, options: {placeholder: '待办事项'}, style: {width: '200px'}},
    //     // {type: 'input', field: 'duty_user_text', filter: true, options: {placeholder: '责任(汇报)人'}, style: {width: '120px'}},
    //     // {type: 'input', field: 'reply', filter: true, options: {placeholder: '回复'}, style: {width: '200px'}},
    //   ],
    // },
    tableConfig: {
      // useEncryptionFields: false,
      url: apiUrl.home.quotation.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,      
      options: {},
      events: {
        // dblclick_cell: args => { },
        // change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
        //   if (changedValue===rawValue){
        //     return ;
        //   }
        //   const vTable = mainTable.value?.reportConfig.table; // 表格实例
        //   const field = vTable?.getHeaderField(col, row); //获取列名
        //   const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据
        //
        //   if (['comment', 'sort', 'reply', 'todo_matter'].includes(field) && record?.id) {
        //     const res = api.post(apiUrl.home.todo_matter.editValue, {
        //       field: field,
        //       id: record.id,
        //       value: changedValue,
        //     })
        //     if(res){
        //       dialog.success('修改成功')
        //     }
        //   }else {
        //     vTable.changeCellValue(col, row, rawValue);
        //   }
        // },
      },
      colAfterCallback: (col) => {
        return col;
      },
    },
  },
}


onMounted(() => {
  const loading = dialog.loading()
  api.get(apiUrl.home.quotation.config).then(res => {
    vData.selectOption = res?.option;
    obj.mainTableConfig.tableConfig = {...obj.mainTableConfig.tableConfig, ...res.table};
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