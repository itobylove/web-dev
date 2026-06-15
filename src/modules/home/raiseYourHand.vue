<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
    <DialogComponent v-if="dialogConfig.show" v-bind="dialogConfig.config">
      <t-form ref="formDataRef" :data="formData" :rules="dialogConfig.formRules" class="dialogClass" >
        <t-form-item label="发现问题区域" name="problem_area"  style="margin-top: 20px;" >
          <t-input v-model="formData.problem_area"  placeholder="请输入内容" style="width: 80%;" />
        </t-form-item>
        <t-form-item label="问题类型" name="problem_type"  style="margin-top: 20px;" >
          <t-select v-model="formData.problem_type" :options="problemTypeOptions" placeholder="请选择" style="width: 80%;"  />
        </t-form-item>
        <t-form-item label="举手内容" name="problem_details"  style="margin-top: 20px;" >
          <t-textarea v-model="formData.problem_details"  placeholder="请输入内容" style="width: 80%;" :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
        </t-form-item>

        <t-form-item label="上传附件" name="problem_attach"  style="margin-top: 20px;" >
          <t-upload
              name="file"
              theme="file"
              :action="uploadUrl"
              :headers="headers"
              v-model="formData.problem_attach"
              placeholder="未选择文件"
              accept="image/*|doc/*|excel/*|pdf"
              style="width: 279px;"
              clearable
              :max="3"
              filterable
              multiple
          />
        </t-form-item>

        <t-form-item label="期望完成时间" name="problem_time"  style="margin-top: 20px;" >
          <t-date-picker v-model="formData.problem_time"   />
        </t-form-item>

      </t-form>
    </DialogComponent>

    <DialogComponent v-if="dialogConfig.detailsShow" v-bind="dialogConfig.detailsConfig">
      <raiseYourHand_detail ref="raiseYourHandDetail" :query="detail" />
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
import raiseYourHand_detail from '@/modules/home/raiseYourHand_detail.vue'

const raiseYourHandDetail = ref(null)
const formDataRef = ref(null)
const mainTable = ref();
const processTable = ref();
const uploadUrl = ref(apiUrl.home.raise.uploadUrl)
const headers = ref(api.getHttpDefaultHeaders())
const problemTypeOptions = ref([])
const formData = ref({
  problem_type: 0,
  problem_attach: []
});

const detail = ref({});

const refObj = reactive({
  mainTableShow: false,
  processTableShow: false,
  tab: 'processTable'
});

const fn = {
  create: () => {
      formData.value = {
        problem_type: 0,
        problem_attach: []
      };
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
  formRules: {
    problem_area: [
      { required: true, message: '请输入问题区域', trigger: 'blur' },
    ],
    problem_type: [{ required: true, message: '请选择问题类型', trigger: 'blur' }],
    problem_time: [{ required: true, message: '请填写完成时间', trigger: 'blur' }],
  },
  show: false,
  detailsShow: false,
  config: {
    width: '800px',
    height: '500px',
    type: 'confirm',
    onAfterClose: () => dialogConfig.show = false,
    okCallback: async (obj) => {
      const validateResult = await formDataRef.value?.validate();
      if(validateResult === true){
        obj.close = false;
        const loading = dialog.loading(undefined, '保存中...');
        const resBase = await api.post(apiUrl.home.raise_mobile.save, formData.value, null, true )
        loading && loading.close();
        console.log(resBase)
        if (resBase.data.code === 20000) {
          obj.close = true;
          mainTable.value.reportConfig.getData();
        }
      } else {
        obj.close = false;
      }
    }
  },
  detailsConfig: {
    width: '800px',
    height: '500px',
    type: 'confirm',
    okval: '完成',
    otherval: "未完成",
    onAfterClose: () => dialogConfig.detailsShow = false,
    okCallback: async (obj) => {
        obj.close = false;
        const loading = dialog.loading(undefined, '保存中...');
        const resBase = await api.post(apiUrl.home.raise_mobile.user_process, {id: detail.value.asset.id, state: 4}, null, true)
        loading && loading.close();
        if (resBase.data.code === 20000) {
          obj.close = true;
          mainTable.value.reportConfig.getData();
        }
      console.log('完成')
    },
    otherCallback: async (obj) => {
      obj.close = false;
      const loading = dialog.loading(undefined, '保存中...');
      const resBase = await api.post(apiUrl.home.raise_mobile.user_process, {id: detail.value.asset.id, state: 2}, null, true)
      loading && loading.close();
      if (resBase.data.code === 20000) {
        obj.close = true;
        mainTable.value.reportConfig.getData();
      }
      console.log('未完成')
    }
  }
})

const obj = {
  options: [],
  plantId: siyi.user.plantId,
  // tabsConfig: {
  //   theme: 'card',
  //   defaultValue: 'userTable',
  //   onChange: val => refObj.tab = val,
  // },
  // panelConfig: {
  //   destroyOnHide: false,
  // },
  mainTableConfig: {
    // footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings', 'clearWhere', 'pageExport'],
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

            const isDelete = ref(false);
            asset.forEach(item => {
              if(item.state !== 0){ isDelete.value = true; }
            })

            if(isDelete.value){
              dialog.info('有数据已经被派发任务，无法删除');
              return;
            }

            dialog.confirm(`确定要删除吗？`, async () => {
              await api.post(apiUrl.home.raise_mobile.delete, {data}).then(res => {
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

            if(asset[0].state !== 0){
              dialog.info('已经被派发任务，无法修改');
              return;
            }

            dialogConfig.config.title = '添加';
            dialogConfig.show = true;
            fn.update(asset[0])

          }
        },
        holidayAdd: {sort: 650, title: '验证' , icon: 'ri-list-settings-fill', click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择验证的数据');
              return;
            }

            if (asset.length > 1) {
              dialog.info('不能选择多条数据进行验证');
              return;
            }
            if (asset[0].state !== 3) {
              dialog.info('当前数据不在待验证状态');
              return;
            }

            dialogConfig.detailsConfig.title = '验证';
            dialogConfig.detailsShow= true;
            detail.value = {asset: asset[0] };
            //dialog.window(raiseYourHand_detail, {query: {asset: asset[0] } }, {width: '80%', height: '80%', title: "查看详情"})
          }},
      },
    },
    searchConfig: {
      search: [
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.raise_mobile.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,
      options: {},
      events: {},
      colAfterCallback: (col) => {
        return col;
      },
    },
  },
}


onMounted(() => {
  const loading = dialog.loading()
  api.get(apiUrl.home.raise_mobile.init).then(res => {
    // vData.selectOption = res?.option;

    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;

    refObj.mainTableShow = true;
    loading.close();
  });

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

  >.mainTable {
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
.dialogClass{
  margin-left: 35px;
}
</style>