<template>
  <div class="dept-position">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" style="width: 600px;" />
    <TableComponent class="mainTable" ref="matrixTable" v-if="refObj.matrixTableShow" v-bind="obj.matrixTableConfig" style="width: 50%;" />
    <TableComponent class="mainTable" ref="costConfigLog" v-if="refObj.costConfigLogShow" v-bind="obj.costConfigLogConfig" style="width: 27%;" />

    <DialogComponent v-if="dialogConfig.show" v-bind="dialogConfig.config">
      <t-form ref="formDataRef" :data="formData" :rules="dialogConfig.formRules" class="dialogClass" >
        <t-form-item label="上级" name="pid"   >
          <t-tree-select
              v-model="formData.pid"
              :data="treeData"
              placeholder="请选择"
              :treeProps="{ expandAll: true, valueMode: 'onlyLeaf' }"
              filterable
              clearable
          />
        </t-form-item>

        <t-form-item label="标题" name="title" style="margin-top: 20px;"  >
          <t-input v-model="formData.title" placeholder="请输入" />
        </t-form-item>


        <t-form-item label="价格" name="part_num" style="margin-top: 20px;"  >
          <t-input v-model="formData.price" placeholder="请输入" />
        </t-form-item>

        <t-form-item label="属性" name="part_num"   >
          <t-space>
            <t-radio-group v-model="formData.attr" disabled variant="primary-filled" >
            <t-radio-button value="1">标题</t-radio-button>
            <t-radio-button value="2">属性</t-radio-button>
            </t-radio-group>
          </t-space>
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
import {getQuery} from "@/core/script/nav.js";

import DialogComponent from "@/core/component/dialog.vue";
import printTags from "@/modules/home/print_tags.vue";
import {ListTable} from "@visactor/vtable";

const mainTable = ref()
const matrixTable = ref()
const costConfigLog = ref()
const formDataRef = ref()
const treeData = ref([])
// const recordId = ref(0)
const argsData = ref({});

const formData = ref({
  attr: "1"
});



const refObj = reactive({
  mainTableShow: false,
  formTableShow: false,
  matrixTableShow: false,
  costConfigLogShow: false,
});

const fn = {
  create: (formValue) => {
      fn.list()
      formData.value = {attr: "2" }
      dialogConfig.config.title = '添加';
      dialogConfig.show = true;
  },
  update: (value) => {
    fn.list()
    value.attr += ""
    formData.value = value
    dialogConfig.config.title = '修改';
    dialogConfig.show = true;
  },
  list: async () => {
    const res = await api.post(apiUrl.home.stabdardCostConfig.list)
    treeData.value = [ ...[{value:0, label:'顶级'}] , ...res.list]
  }

}

const vData = reactive({
  selectOption:{statistical:[]},
})

const dialogConfig = reactive({
  show: false,
  formRules: {
    title: [{required: true, message: '请填写标题' }],
  },
  config: {
    width: '500px',
    height: '430px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.show = false,
    okCallback: async (obj) => {
      const validateResult = await formDataRef.value?.validate();
      console.log(validateResult)
      if(validateResult === true){
        obj.close = false;
        console.log(formData.value)
        const loading = dialog.loading(undefined, '保存中...');
        const resBase = await api.post(apiUrl.home.stabdardCostConfig.save, formData.value, null, true)
        loading && loading.close();
        if (resBase.data.code === 20000) {
          obj.close = true;
          mainTable.value.reportConfig.getData();
          matrixTable.value.reportConfig.getData();
          costConfigLog.value.reportConfig.getData();
        }
      } else {
        obj.close = false;
      }
    },
    beforeOpenCallback: () => formDataRef.value.validate(),
    afterCloseCallback: () => dialogConfig.createShow = false
  },
})


// const tempDom = document.createElement('div');
// const tempTable = new ListTable({ container: tempDom });
// const editableTheme = JSON.parse(JSON.stringify(tempTable.theme));
// tempTable.release();
//
// editableTheme.scrollStyle = {
//   visible: 'always',
//   barToSide: true,
//   width: 8
// };

const obj = {
  options: [],
  plantId: siyi.user.plantId,
  mainTableConfig: {
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings','pageExport','clearWhere'],
      menu: {
        create: {
          click: () => fn.create({})
        },
        update: {
          click: () => {
            const vTable = mainTable.value?.reportConfig.table; // 表格实例
            if (!argsData.value?.col || !argsData.value?.col ) {
              dialog.info('请选择要删除的数据');
              return;
            }
            const record = vTable?.getRecordByCell(argsData.value.col, argsData.value.row); //根据单元格获取行数据
            if (!record.id) {
              dialog.info('请选择要修改的数据');
              return;
            }
            fn.update(record)
          }
        },
        delete: {
          click: () => {
            const vTable = mainTable.value?.reportConfig.table; // 表格实例
            if (!argsData.value?.col || !argsData.value?.col ) {
              dialog.info('请选择要删除的数据');
              return;
            }
            const record = vTable?.getRecordByCell(argsData.value.col, argsData.value.row); //根据单元格获取行数据

            if(record.attr === 1) {
              dialog.info('表头不能删除，请联系管理员');
              return false;
            }

            if (!record.id) {
              dialog.info('请选择要删除的数据');
              return;
            }

            const data = [{id: record.id}];
            dialog.confirm(`确定要删除吗？`, async () => {
              api.post(apiUrl.home.stabdardCostConfig.del, {data}).then(res => {
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
      }
    },
    searchConfig: {
      search: [],
    },
    tableConfig: {
      useEncryptionFields: false, // 是否使用加密字段
      url: apiUrl.home.stabdardCostConfig.list,
      showCheck: false ,
      checkField: 'check',
      disablePage: false ,
      options: {
        // theme : editableTheme,
        editCellTrigger:'doubleclick', // 单元格双击触发编辑
        hierarchyExpandLevel: 2,
        rowSeriesNumber:{
          width: 55,
        }
      },
      events: {
        click_cell: args => {
          argsData.value = {col: args.col, row: args.row}
          // const vTable = mainTable.value?.reportConfig.table; // 表格实例
          // const record = vTable?.getRecordByCell(args.col, args.row); //根据单元格获取行数据
          // console.log(args)
          // if (record?.id <= 0) {
          //   console.log(record)
          //   dialog.warning('字段名或行ID不存在，跳过更新');
          //   return;
          // }
          // recordId.value = record.id
          // console.log(recordId.value)
        }, // 单击单元格
        dblclick_cell: ({originData}) => {}, // 双击单元格
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          // 改变单元格值
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); // 获取列名
          const record = vTable?.getRecordByCell(col, row); // 根据单元格获取行数据

          if (!field || !record?.id) {
            dialog.warning('字段名或行ID不存在，跳过更新');
            return;
          }
          const res = await api.post(apiUrl.home.stabdardCostConfig.save, {id: record.id, [field]: changedValue})
          if (res) {
            matrixTable.value.reportConfig.getData();
            costConfigLog.value.reportConfig.getData();
            dialog.success('保存成功');
          } else {
            dialog.error(res.data.msg);
          }
        }
      },
      colAfterCallback: (col) => {
        return col;
      },
    },
  },
  formTableConfig: {},
  matrixTableConfig: {
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['search'],
      menu: {}
    },
    searchConfig: {
      search: [],
    },
    tableConfig: {
      useEncryptionFields: false, // 是否使用加密字段
      url: apiUrl.home.stabdardCostConfig.matrix_list,
      showCheck: false ,
      checkField: 'check',
      disablePage: false ,
      options: {
        frozenColCount: 2,
        editCellTrigger:'doubleclick', // 单元格双击触发编辑
        rowSeriesNumber:{
          width: 55,
        }
      },
      events: {
        click_cell: args => {
          argsData.value = {col: args.col, row: args.row}
        }, // 单击单元格
        dblclick_cell: ({originData}) => {}, // 双击单元格
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          const vTable = matrixTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据
          let num = field.split('_')[1]
          const res = await api.post(apiUrl.home.stabdardCostConfig.save, {
            col: num,
            rows: record?.rows ,
            price: changedValue ,
            type: 'material',
          })

          if (res) {
            matrixTable.value.reportConfig.getData();
            costConfigLog.value.reportConfig.getData();
            dialog.success('保存成功');
          }

        }
      },
      colAfterCallback: (col) => {
        return col;
      },
    },
  },
  costConfigLogConfig:{
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['search'],
      menu: {}
    },
    searchConfig: {
      search: [],
    },
    tableConfig: {
      useEncryptionFields: false, // 是否使用加密字段
      url: apiUrl.home.stabdardCostConfig.constLogList,
      showCheck: false ,
      checkField: 'check',
      disablePage: false ,
      options: {
        rowSeriesNumber: {
          width: 55,
        }
      },
      events: {
        click_cell: args => {
          argsData.value = {col: args.col, row: args.row}
        }, // 单击单元格
        dblclick_cell: ({originData}) => {}, // 双击单元格
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          // // 改变单元格值
          console.log({row, col, changedValue, currentValue, rawValue})
        }
      },
      colAfterCallback: (col) => {
        return col;
      },
    },
  }
}


onMounted(() => {
  siyi.navHide = true;


  const loading = dialog.loading()
  api.get(apiUrl.home.stabdardCostConfig.init).then(res => {
    vData.selectOption = res?.option;

    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;
    refObj.mainTableShow = true;
    loading.close();
  });

  api.get(apiUrl.home.stabdardCostConfig.matrix_init).then(res => {
    obj.matrixTableConfig.tableConfig = { ...obj.matrixTableConfig.tableConfig, ...res.table };
    obj.matrixTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.matrixTableShow = true;
  })


  api.get(apiUrl.home.stabdardCostConfig.constLogInit).then(res => {
    obj.costConfigLogConfig.tableConfig = { ...obj.costConfigLogConfig.tableConfig, ...res.table };
    obj.costConfigLogConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.costConfigLogShow = true;
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


}
</style>