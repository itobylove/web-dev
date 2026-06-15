<template>
  <div ref="body" class="body">

    <div style="height: calc(100vh - 390px);">
      <t-tabs class="t-tabs mainTable" v-model="refObj.tab" v-bind="obj.tabsConfig" >
        <t-tab-panel class="t-tabs-panel mainTable" value="mainTable" v-bind="obj.panelConfig" label="待指派到部门">
          <TableComponent ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
        </t-tab-panel>

        <t-tab-panel class="t-tabs-panel" value="waitUserTable" v-bind="obj.panelConfig" label="待指派到人员">
          <TableComponent ref="waitUserTable" v-if="refObj.waitUserTableShow" v-bind="obj.waitUserTableConfig" />
        </t-tab-panel>

        <t-tab-panel class="t-tabs-panel" value="userTable" v-bind="obj.panelConfig" label="人员处理">
          <TableComponent ref="userTable" v-if="refObj.userTableShow" v-bind="obj.userTableConfig" />
        </t-tab-panel>

        <t-tab-panel class="t-tabs-panel" value="archiveTable" v-bind="obj.panelConfig" label="归档">
          <TableComponent ref="archiveTable" v-if="refObj.archiveTableShow" v-bind="obj.archiveTableConfig" />
        </t-tab-panel>
      </t-tabs>
    </div>

    <t-tabs class="t-tabs processTable" v-model="refObj.processTab" v-bind="obj.tabsConfig">
      <t-tab-panel class="t-tabs-panel " value="processTableConfig" v-bind="obj.panelConfig" label="操作明细">
        <TableComponent class="processTableShow" ref="processTable" v-if="refObj.processTableShow"  v-bind="obj.processTableConfig" />
      </t-tab-panel>
    </t-tabs>

    <DialogComponent v-if="dialogConfig.mainTableShow" v-bind="dialogConfig.config">
      <t-form ref="formDataRef" :data="formData" :rules="TableRules.mainTableRules" class="dialogClass" >
        <t-form-item label="选择部门" name="depart_id" style="margin-top: 20px;width: 85%;"  >
          <t-tree-select
              v-model="formData.depart_id"
              :treeProps="{ expandAll: true }"
              filterable
              :data="dataDepart"
              placeholder="请选择"
              class="path-label"
          />
        </t-form-item>
      </t-form>
    </DialogComponent>

    <DialogComponent v-if="dialogConfig.waitUserTableShow" v-bind="dialogConfig.config">
      <t-form ref="waitUserTableRef" :data="waitUserTableData" :rules="TableRules.waitUserTableRules" class="dialogClass" >
        <t-form-item label="选择人员" name="depart_id" style="margin-top: 20px;width: 85%;"  >
          <t-tree-select
              v-model="waitUserTableData.uid"
              :treeProps="{ expandAll: true }"
              filterable
              :data="waitUserData"
              placeholder="请选择"
              class="path-label"
          />
        </t-form-item>
      </t-form>
    </DialogComponent>

    <DialogComponent v-if="dialogConfig.userTableShow" v-bind="dialogConfig.config">
      <t-form ref="userTableDataRef" :data="userTableData" :rules="TableRules.userTableRules" class="dialogClass" >
        <t-form-item label="问题发现区域" name="problem_area" style="margin-top: 20px;width: 95%;" label-width="130px"  >
          <t-input placeholder="请输入内容" v-model="userTableData.problem_area" readonly style="color: #0f0d0d" />
        </t-form-item>

        <t-form-item label="问题类型" name="problem_type" style="margin-top: 20px;width: 95%;" label-width="130px" >
          <t-select readonly v-model="userTableData.problem_type" :options="problemTypeOptions" />
        </t-form-item>

        <t-form-item label="举手内容" name="problem_details" style="margin-top: 20px;width: 95%;" label-width="130px" >
          <t-textarea placeholder="请输入内容" v-model="userTableData.problem_details" readonly :autosize="{ minRows: 3, maxRows: 5 }" />
        </t-form-item>

        <t-form-item label="上传附件" name="uid" style="margin-top: 20px;width: 95%;" label-width="130px" >
          <t-upload v-model="userTableData.problem_attach" readonly disabled />
        </t-form-item>

        <t-form-item label="要求完成时间" name="uid" style="margin-top: 20px;width: 95%;" label-width="130px" >
          <t-input v-model="userTableData.problem_time_text"  readonly />
        </t-form-item>

        <t-form-item label="处理描述" name="pu_details" style="margin-top: 20px;width: 95%;" label-width="130px"  >
          <t-textarea v-model="userTableData.pu_details" placeholder="请输入内容" :autosize="{ minRows: 3, maxRows: 5 }" />
        </t-form-item>

        <t-form-item label="计划完成时间" name="pu_time" style="margin-top: 20px;width: 85%;" label-width="130px" >
          <t-date-picker v-model="userTableData.pu_time" />
        </t-form-item>

        <t-form-item label="处理附件" name="uid" style="margin-top: 20px;width: 85%;" label-width="130px" >
          <t-upload
              accept="image/*|pdf|docx|excel"
              :max="3"
              placeholder="未选择文件"
              name="file"
              :action="uploadUrl"
              :headers="headers"
              useMockProgress
              showUploadProgress
              autoUpload
              multiple
              v-model="userTableData.pu_atta"
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
import {getOptionMap, getOptionsLabel} from "@/utils/vars.js";


import editExcel from '@/modules/home/edit_excel.vue'
import downExcel from '@/modules/home/down_excel.vue'
import DialogComponent from "@/core/component/dialog.vue";

const uploadUrl = ref(apiUrl.home.raise.uploadUrl)
const headers = ref(api.getHttpDefaultHeaders())

const mainTable = ref();
const waitUserTable = ref();
const userTable = ref();
const archiveTable = ref();
const processTable = ref();
const dataDepart = ref([]); // 所有部门数据
const waitUserData = ref([]) // 部门人员数据

const refObj = reactive({
  mainTableShow: false, // 待指派到部门
  waitUserTableShow: false, // 待指派到人员
  userTableShow: false, // 人员处理
  archiveTableShow: false, // 归档
  processTableShow: false,
  tab: 'mainTable',
  processTab: 'processTableConfig'
});

const problemTypeOptions = ref([])

// const vData = reactive({
//   selectOption:{statistical:[]}
// })

const formData = ref({
  depart_id: ''
});

const waitUserTableData = ref({

})

const userTableData = ref({

})

const TableRules = reactive({
  mainTableRules: {
    depart_id: [{required: true, message: '请选择部门' }],
  },
  userTableRules: {
    pu_details: [{required: true, message: '请输入内容' }],
    pu_time: [{required: true, message: '请选择时间' }],
  },
  waitUserTableRules : {
    uid: [{required: true, message: '请选择人员' }],
  }
})


const formDataRef = ref(null)

const dialogConfig = reactive({
  mainTableShow: false,
  waitUserTableShow: false,
  userTableShow: false,
  archiveTable: false,
  type:'',
  config: {
    width: '500px',
    height: '220px',
    type: 'confirm',
    onAfterClose: () => {
      dialogConfig.mainTableShow = false
      dialogConfig.waitUserTableShow= false
      dialogConfig.userTableShow = false
      dialogConfig.archiveTable = false
    },
    okCallback: async (obj) => {
      console.log(dialogConfig.tyle)
      // 派遣部门
      if(dialogConfig.tyle === 'mainTable'){
        const validateResult = await formDataRef.value?.validate();
        if(validateResult === true){
          obj.close = false;
          let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
          const data = asset.map(i => i.id);
          const ids = asset.map(i => ({id: i.id}))
          const loading = dialog.loading(undefined, '提交中...');
          const resBase = await api.post(apiUrl.home.raise.process_depart, {id: data, ids: ids, depart_id: formData.value.depart_id }, null, true)
          loading && loading.close();
          if (resBase.data.code === 20000) {
            obj.close = true;
            mainTable.value.reportConfig.getData();
          }
        } else {
          obj.close = false;
        }
        return;
      }

      // 指派人员
      if(dialogConfig.tyle === 'waitUserTable'){
        obj.close = false;
        // console.log(waitUserTableData.value.uid)
        let asset = tableFn.getCheckedRecords(waitUserTable.value.reportConfig);
        console.log(asset[0])
        const loading = dialog.loading(undefined, '提交中...');
        const resBase = await api.post(apiUrl.home.raise.process_user, {id: asset[0].id, process_uid: waitUserTableData.value.uid}, null, true)
        // console.log(resBase)
        loading && loading.close();
        if (resBase.data.code === 20000) {
          obj.close = true;
          waitUserTable.value.reportConfig.getData();
        }
        return;
      }

      // 指派人员提交数据
      if(dialogConfig.tyle === 'userTable'){
        obj.close = false;
        const res = await api.post(apiUrl.home.raise.update_process, userTableData.value, null, true)
        if (res.data.code === 20000) {
          obj.close = true;
          userTable.value.reportConfig.getData();
        }

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
    onChange: val => {
      switch (val){
        case 'mainTable':
          mainTable.value.reportConfig.getData();
          break;
        case 'waitUserTable':
          waitUserTable.value.reportConfig.getData();
          break;
        case 'userTable':
          userTable.value.reportConfig.getData();
          break;
        case 'archiveTable':
          archiveTable.value.reportConfig.getData();
          break;
      }
      refObj.tab = val
    },
  },
  panelConfig: {
    destroyOnHide: false,
  },
  mainTableConfig: {
    // footer: false, // 默认关闭表尾
    // changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings', 'pageExport'],
      menu: {
        createPandian: {sort: 650, title: '指派到部门', icon: 'ri-list-settings-fill', click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            waitUserTableData.value = {}
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }

            const isAssignDepartment = ref(false);
            asset.forEach(item => {
              if(item.state !== 0){
                isAssignDepartment.value = true;
              }
            })
            if(isAssignDepartment.value){
              dialog.error('选择的部门已经被指派，请调整');
              return;
            }



            formData.value = {};
            dialogConfig.config.title = '分配到部门';
            dialogConfig.mainTableShow = true;
            dialogConfig.tyle = 'mainTable';
        }},
      },
    },
    searchConfig: {
      search: [ ],
    },
    query:{
      type:'mainTable',
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.raise.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,      
      options: {
      },
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
            processTable.value.reportConfig.getData({ exec: null, raise_id: args.originData.id});
          }
        },
        // dblclick_cell: async ({originData,field}) => {
        //   if (originData?.index === undefined) return;
        // },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          if (changedValue===rawValue){
            return ;
          }
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据
        },
      },
    },
  },
  waitUserTableConfig:{
    // footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings', 'pageExport'],
      menu: {
        createPandian: {sort: 650, title: '指派人员', icon: 'ri-list-settings-fill', click: async () => {
            let asset = tableFn.getCheckedRecords(waitUserTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要指派的数据');
              return;
            }
            if(asset[0].state !== 1){
              dialog.warning('当前选择数据不在能指派的状态，请调整');
              return;
            }
            const resDeptUser = await api.get(apiUrl.home.raise.dept_user, {dept_id: asset[0].process_depart_id})
            waitUserData.value = resDeptUser.list ;
            waitUserTableData.value = {}
            dialogConfig.config.title = '指派人员';
            dialogConfig.waitUserTableShow = true;
            dialogConfig.tyle = 'waitUserTable';
          }},
      },
    },
    searchConfig: {
      search: [ ],
    },
    query:{
      type:'waitUserTable',
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.raise.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,
      options: {
      },
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== waitUserTable.value.reportConfig.prveSelectRow.index) {
            processTable.value.reportConfig.getData({ exec: null, indicator_id: args.originData.id, type: args.originData.type });
          }
        },
        // dblclick_cell: async ({originData, field}) => {
        //   if (originData?.index === undefined) return;
        // }
      },
    },

  },
  userTableConfig:{
    // footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings', 'pageExport'],
      menu: {
        createPandian: {sort: 650, title: '提交处理', icon: 'ri-list-settings-fill', click: () => {
            let asset = tableFn.getCheckedRecords(userTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }
            if(asset.length > 1){
              dialog.info('不能选择多条数据进行修改');
              return;
            }
            if(asset[0].state !== 2){
              dialog.warning('当前选择数据不在能处理状态，请调整');
              return;
            }

            userTableData.value = asset[0];
            dialogConfig.config.title = '处理';
            dialogConfig.userTableShow = true;
            dialogConfig.config.height = '60%';
            dialogConfig.config.width = '800px';
            dialogConfig.tyle = 'userTable';
          }},
      },
    },
    searchConfig: {
      search: [ ],
    },
    query:{
      type:'userTable',
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.raise.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,
      options: {
      },
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
            processTable.value.reportConfig.getData({ exec: null, indicator_id: args.originData.id, type: args.originData.type });
          }
        },
        // dblclick_cell: async ({originData,field}) => {
        //   if (originData?.index === undefined) return;
        // },
      },
    },

  },
  archiveTableConfig:{
    // footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings', 'pageExport'],
      menu: {
        createPandian: {sort: 650, title: '归档', icon: 'ri-list-settings-fill', click: () => {
            let asset = tableFn.getCheckedRecords(archiveTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }

            const data = asset.map(i => ({id: i.id}));
            dialog.confirm(`确定要归档吗？`, async () => {
              await api.post(apiUrl.home.raise.archive, data).then(res => {
                if (res) {
                  dialog.success(`成功归档`);
                  archiveTable.value.reportConfig.getData();
                } else {
                  dialog.error(res.msg || '归档失败');
                }
              })
            })

          }},
      },
    },
    searchConfig: {
      search: [ ],
    },
    query:{
      type:'archiveTable',
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.raise.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,
      options: {
      },
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
            processTable.value.reportConfig.getData({ exec: null, indicator_id: args.originData.id, type: args.originData.type });
          }
        },
        // dblclick_cell: async ({originData,field}) => {
        //   if (originData?.index === undefined) return;
        //   // archiveTable.value.reportConfig.getData({}, false);
        //   obj.detail.show(originData, field,'dblclick');
        // },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          if (changedValue===rawValue){
            return ;
          }
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据

          if (['reason', 'programme', 'result', 'comment'].includes(field) && record?.id) {
            const res = api.post(apiUrl.home.excel.editValue, {
              field: field,
              id: record.id,
              value: changedValue,
            })
            if(res){
              dialog.success('修改成功')
            }
          }else if(['sort'].includes( field) && record?.id){
            const res = api.post(apiUrl.home.excel.editIndicator, {
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
    },

  },
  processTableConfig:{
    // footer: false,
    searchConfig: false,
    menuConfig: false,
    tableConfig: {
      url: apiUrl.home.raise.detail_list,
      showCheck: false,
      disablePage: false,
      useEncryptionFields: false,
      options: {
        // rowSeriesNumber:{width: 55},
        customMergeCell : (col, row, table) => { },
      },
      colAfterCallback: (col) => {
        return col;
      },
      events: {
      },
    },
  },
}


onMounted(() => {
  const loading = dialog.loading()
  api.get(apiUrl.home.raise.config, {style:'wait_department'}).then(res => {
    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;
    refObj.mainTableShow = true;
    loading.close();
  });


  api.get(apiUrl.home.raise.config, {style:'wait_user'}).then(res => {
    obj.waitUserTableConfig.tableConfig = { ...obj.waitUserTableConfig.tableConfig, ...res.table };
    obj.waitUserTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.waitUserTableShow = true;
  })

  api.get(apiUrl.home.raise.config, {style:'user'}).then(res => {
    obj.userTableConfig.tableConfig = { ...obj.userTableConfig.tableConfig, ...res.table };
    obj.userTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.userTableShow = true;
  })
  api.get(apiUrl.home.raise.config, {style:'archive'}).then(res => {
    obj.archiveTableConfig.tableConfig = { ...obj.archiveTableConfig.tableConfig, ...res.table };
    obj.archiveTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.archiveTableShow = true;
  })

  api.get(apiUrl.home.raise.detail_init).then(res => {
    obj.processTableConfig.tabcleConfig = { ...obj.processTableConfig.tableConfig, ...res.table };
    obj.processTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.processTableShow = true;
  });

  api.get(apiUrl.home.raise.depart_list).then(res => {
    dataDepart.value = res.list
  })



  api.get(apiUrl.home.raise.field_config, {keys:'problem_type'}).then(res => {
    problemTypeOptions.value = res?.list ;
  })
  
});
</script>


<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;

  .mainTable {
    flex-shrink: 0;
  }
  .processTable{

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
</style>