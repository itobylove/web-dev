<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
    <t-tabs class="t-tabs" v-model="refObj.tab" v-bind="obj.tabsConfig">
      <t-tab-panel class="t-tabs-panel" value="stepsTable" v-bind="obj.panelConfig" label="工序">
        <TableComponent ref="stepsTable" v-if="refObj.stepsTableShow" v-bind="obj.stepsTableConfig" />
      </t-tab-panel>
      <t-tab-panel class="t-tabs-panel" value="processTable" v-bind="obj.panelConfig" label="工艺"
        :disabled="refObj.type === 'assets'">
        <TableComponent ref="processTable" v-if="refObj.processTableShow" v-bind="obj.processTableConfig" />
      </t-tab-panel>
      <t-tab-panel class="t-tabs-panel" value="userTable" v-bind="obj.panelConfig" label="用户"
        :disabled="refObj.type === 'group'">
        <TableComponent ref="userTable" v-if="refObj.userTableShow" v-bind="obj.userTableConfig" />
      </t-tab-panel>
      <t-tab-panel class="t-tabs-panel" value="assetsTable" v-bind="obj.panelConfig" label="资产"
        :disabled="refObj.type === 'assets'">
        <TableComponent ref="assetsTable" v-if="refObj.assetsTableShow" v-bind="obj.assetsTableConfig" />
      </t-tab-panel>
      <t-tab-panel class="t-tabs-panel" value="parameterTable" v-bind="obj.panelConfig" label="属性">
        <TableComponent ref="parameterTable" v-if="refObj.parameterTableShow" v-bind="obj.parameterTableConfig" />
      </t-tab-panel>
      <t-tab-panel class="t-tabs-panel" value="repairTable" v-bind="obj.panelConfig" label="维修记录">
        <TableComponent ref="repairTable" v-if="refObj.repairTableShow" v-bind="obj.repairTableConfig" />
      </t-tab-panel>
    </t-tabs>
    <DialogComponent v-if="dialogParameterConfig.show" v-bind="dialogParameterConfig.config">
      <div class="dialogClass">
        <t-form>
          <t-row>
            <t-col :span="11">
              <t-form-item label="资产" name="assets_id">
                <t-select v-model="dialogParameterConfig.data.assets_id" :options="refObj.selectOptions.assets_id"
                  disabled />
              </t-form-item>
              <t-form-item label="参数名称" name="parameter_id">
                <t-select v-model="dialogParameterConfig.data.parameter_id" :options="refObj.selectOptions.parameter_id"
                  disabled />
              </t-form-item>
              <t-form-item label="参数值" name="parameter_value">
                <t-textarea v-model="dialogParameterConfig.data.parameter_value"
                  :autosize="{ minRows: 2, maxRows: 5 }" />
              </t-form-item>
              <t-form-item label="排序" name="sort">
                <t-input-number v-model="dialogParameterConfig.data.sort" theme="column" style="width: 100%"
                  type="integer" min="0" step="1" max="9999" placeholder="数字小靠前" />
              </t-form-item>
              <t-form-item label="状态" name="status">
                <t-select v-model="dialogParameterConfig.data.status" :options="refObj.selectOptions.status" />
              </t-form-item>
              <t-form-item label="备注" name="remark">
                <t-input v-model="dialogParameterConfig.data.remark" />
              </t-form-item>
            </t-col>
          </t-row>
        </t-form>
      </div>
    </DialogComponent>
    <DialogComponent v-if="refObj.assetDialog" v-bind="obj.assetDialogConfig.config">
      <div class="asset-component">
        <div class="add-cate" v-if="!refObj.edit">
          <t-form>
            <t-form-item label="添加分类" name="groupType" :label-width="80">
              <t-radio-group v-model="refObj.groupType" @change="obj.onChange">
                <t-radio value="1">资产</t-radio>
                <t-radio value="0">资产组</t-radio>
              </t-radio-group>
            </t-form-item>
          </t-form>
        </div>
        <div class="asset">
          <t-form :data="refObj.formData" :rules="rules" ref="assetsForm" @submit="obj.onSubmit" @reset="obj.onReset">
            <t-form-item :label="`${refObj.name}名称`" name="name">
              <t-input v-model="refObj.formData.name" :placeholder="`请输入${refObj.name}名称`"></t-input>
            </t-form-item>
            <t-form-item label="所属工厂">
              <t-select v-model="refObj.formData.plant_id" class="demo-select-base" placeholder="请选择所属工厂"
                @change="obj.handleChange">
                <t-option v-for="(item, index) in obj.plantOptions" :value="item.value" :label="item.label"
                  :key="index">
                  {{ item.label }}
                </t-option>
              </t-select>
            </t-form-item>
            <t-form-item label="所属车间" name="workshop_id">
              <t-select v-model="refObj.formData.workshop_id" class="demo-select-base" clearable filterable
                placeholder="请选择所属车间">
                <t-option v-for="(item, index) in refObj.workshopOptions" :value="item.value" :label="item.label"
                  :key="index">
                  {{ item.label }}
                </t-option>
              </t-select>
            </t-form-item>
            <template v-if="refObj.groupType === '1'">
              <t-form-item :label="`${refObj.name}分类`" name="category_id">
                <t-select v-model="refObj.formData.category_id" class="demo-select-base" clearable filterable
                  :placeholder="`请选择${refObj.name}类型`">
                  <t-option v-for="(item, index) in obj.assetCategoryOptions" :value="item.value" :label="item.label"
                    :key="index">
                    {{ item.label }}
                  </t-option>
                </t-select>
              </t-form-item>
            </template>
            <template v-if="refObj.groupType === '1'">
              <t-form-item label="特征值" help="系统管理员方可添加修改">
                <t-select v-model="refObj.formData.label" creatable :options="obj.assetLabelOptions"
                  :disabled="siyi.user.administrator === false ? true : false" filterable
                  @create="obj.createAssetOptions" />
              </t-form-item>
            </template>
            <template v-else>
              <t-form-item label="特征值" name="label" help="系统管理员方可添加修改">
                <t-select v-model="refObj.formData.label" creatable :options="obj.groupLabelOptions"
                  :disabled="siyi.user.administrator === false ? true : false" filterable
                  @create="obj.createGroupOptions" />
              </t-form-item>
            </template>
            <t-form-item :label="`${refObj.name}编号`" help="若不填写，则系统自动生成">
              <t-input v-model="refObj.formData.code" :placeholder="`请输入${refObj.name}编号`"></t-input>
            </t-form-item>
            <t-form-item :label="`${refObj.name}状态`">
              <t-switch size="large" v-model="refObj.formData.status" :label="['有效', '禁用']"></t-switch>
            </t-form-item>
            <t-form-item :label="`${refObj.name}备注`">
              <t-textarea v-model="refObj.formData.remark" :placeholder="`请输入${refObj.name}备注`"
                :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
            </t-form-item>
            <t-form-item>
              <t-space size="10px">
                <t-button theme="primary" type="submit">提交</t-button>
                <t-button theme="default" variant="base" type="reset">重置</t-button>
                <t-button theme="default" variant="base" @click="obj.handleClear">清空校验结果</t-button>
              </t-space>
            </t-form-item>
          </t-form>
        </div>

      </div>
    </DialogComponent>
    <DialogComponent v-if="dialogRepairConfig.show" v-bind="dialogRepairConfig.config">
      <div class="dialogClass">
        <t-form>
          <t-row>
            <t-col :span="11">
              <t-form-item label="资产" name="assets_id">
                <t-select v-model="dialogRepairConfig.data.assets_id" :options="refObj.selectOptions.assets_id" disabled
                  style="width: 100%" />
              </t-form-item>
              <t-form-item label="开始时间" name="start_time">
                <t-date-picker v-model="dialogRepairConfig.data.start_time" clearable allow-input format="YYYY-MM-DD"
                  style="width: 100%" />
              </t-form-item>
              <t-form-item label="结束时间" name="end_time">
                <t-date-picker v-model="dialogRepairConfig.data.end_time" clearable allow-input format="YYYY-MM-DD"
                  style="width: 100%" />
              </t-form-item>
              <t-form-item label="维修内容" name="content">
                <t-textarea v-model="dialogRepairConfig.data.content" :autosize="{ minRows: 2, maxRows: 5 }"
                  style="width: 100%" />
              </t-form-item>
              <t-form-item label="状态" name="status">
                <t-select v-model="dialogRepairConfig.data.status" :options="refObj.selectOptions.status"
                  style="width: 100%" />
              </t-form-item>
              <t-form-item label="备注" name="remark">
                <t-input v-model="dialogRepairConfig.data.remark" style="width: 100%" />
              </t-form-item>
            </t-col>
          </t-row>
        </t-form>
      </div>
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
import addAssetsParameter from "@/modules/system/addAssetsParameter.vue";
import DialogComponent from "@/core/component/dialog.vue";
import { getOptionsLabel } from "@/utils/vars.js";

const mainTable = ref();
const userTable = ref();
const assetsTable = ref();
const processTable = ref();
const parameterTable = ref();
const repairTable = ref();
const stepsTable = ref();
//表单参数
const formObj = {
  rawData: {
    code: '',
    name: '',
    workshop_id: '',
    category_id: '',
    type: 'assets',//选择资产或资产组 
    label: '',
    status: true,
    remark: '',
    plant_id: '',
  }
}
const refObj = reactive({
  mainTableShow: false,
  stepsTableShow: false,
  userTableShow: false,
  assetsTableShow: false,
  processTableShow: false,
  parameterTableShow: false,
  repairTableShow: false,
  tab: 'stepsTable',
  selectOptions: { status: [], assets_id: [], parameter_id: [] },
  type: 'assets',
  plantId: siyi.user.plantId,
  stepsList: [],
  userLists: [],
  processLists: [],
  assetDialog: false,
  workshopOptions: [],
  groupType: '1',//选择资产或资产组
  name: '资产',//资产或资产组名称
  edit: false,//是否编辑
  formData: { ...formObj.rawData },
  assetsLists: [],
});
const rules = ref({
  code: [{ required: true, message: '编号必填', type: 'error' }],
  name: [{ required: true, message: `名称必填`, type: 'error' }],
  plant_id: [{ required: true, message: '工厂名称必填', type: 'error' }],
  workshop_id: [{ required: true, message: '车间名称必填', type: 'error' }],
  category_id: [{ required: true, message: '类型必填', type: 'error' }],
  label: [{ required: true, message: '特征值必填', type: 'error' }],
});
const assetsForm = ref(null);

const tableEvent = {
  addLabel: async (rows) => {
    const types = [...new Set(rows.map(item => item.type))];
    if (types.length !== 1) {
      dialog.error('请选择同类型的数据!');
      return;
    }
    const id = rows.map(item => item.id);
    const label = await dialog.inputAsync('', '请输入标签名', { width: '300px' });
    if (!label) return;
    const res = await api.post(apiUrl.sys.asset.addAssetLabel, { id, label, type: types[0] });
    if (!res) return;
    dialog.success('添加成功!');
    mainTable.value.reportConfig.getData();
  },
  delLabel: async (rows) => {
    const types = [...new Set(rows.map(item => item.type))];
    if (types.length !== 1) {
      dialog.error('请选择同类型的数据!');
      return;
    }
    const id = rows.map(item => item.id);
    const label = await dialog.inputAsync('', '请输入标签名', { width: '300px' });
    if (!label) return;
    const res = await api.post(apiUrl.sys.asset.delAssetLabel, { id, label, type: types[0] });
    if (!res) return;
    dialog.success('删除成功!');
    mainTable.value.reportConfig.getData();
  },
};

const obj = {
  plantOptions: [],
  assetCategoryOptions: [],
  assetGroupOptions: [],
  assetLabelOptions: [],
  groupLabelOptions: [],
  options: [],
  tabsConfig: {
    theme: 'card',
    defaultValue: 'userTable',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  //查询条件
  filterMethod(search, option) {
    return option.label.indexOf(search) !== -1;
  },
  //表单提交
  onSubmit: async (result) => {
    if (result.validateResult === true) {
      const loading = dialog.loading(undefined, '保存中...');
      let url = '', title = '';
      const msg = refObj.edit ? '修改' : '添加';
      if (refObj.groupType === '1') {
        url = apiUrl.sys.asset.addAsset;
        title = '资产';
      } else {
        url = apiUrl.sys.asset.addAssetGroup;
        title = '资产组';
      }
      const res = await api.post(url, refObj.formData);
      if (res.ret) {
        dialog.success(`${msg}${title}成功`);
        mainTable.value.reportConfig.getData();
      } else {
        dialog.error(res.msg || `${msg}${title}失败,请稍后再试`);
      }
      if (refObj.edit) {
        refObj.formData = { ...formObj.rawData };
      }
      refObj.assetDialog = false;
      refObj.formData.type = 'assets';
      refObj.groupType = '1';
      refObj.edit = false;
      obj.onReset();
      loading && loading.close();
    } else {
      dialog.warning(result.firstError);
    }
  },
  //添加资产或资产组弹框
  assetDialogConfig: {
    data: {},
    config: {
      width: '580px',
      height: '650px',
      type: 'window',
      onAfterClose: () => {
        refObj.formData = { ...formObj.rawData };
        refObj.assetDialog = false;
        refObj.edit = false;
        refObj.groupType = '1';
        refObj.name = '资产';
        obj.getWorkshopsLists(refObj.plantId);
      }
    }
  },
  //资产或资产组表配置
  mainTableConfig: {
    changeSizeBottom: true,
    menuConfig: {
      defaultMenuShowList: ['search', 'pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          click: () => {
            refObj.assetDialog = true;
            refObj.formData.plant_id = refObj.plantId;
          }
        },
        delete: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要删除的资产或资产组');
              return;
            }
            const data = asset.map(i => ({ id: i.id, type: i.type }));
            dialog.confirm(`确定要删除吗？`, async () => {
              await api.post(apiUrl.sys.asset.delAssets, { data }).then(res => {
                if (res.ret > 0) {
                  dialog.success(`成功删除${data.length}条记录`);
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
              dialog.info('请先选择要修改的资产或资产组');
              return;
            }
            if (asset.length > 1) {
              dialog.error('只能选择一个资产或资产组进行修改');
              return;
            }
            refObj.edit = true;
            refObj.assetDialog = true;
            refObj.groupType = asset[0].type === 'group' ? '2' : '1';
            refObj.name = asset[0].type === 'group' ? '资产组' : '资产';
            refObj.formData = { ...asset[0], ...{ status: asset[0].status === 1 ? true : false } };
          }
        },
        addLabel: { title: '添加标签', listAction: tableEvent.addLabel, icon: 'ri-file-add-line', sort: 450, },
        delLabel: { title: '删除标签', listAction: tableEvent.delLabel, icon: 'ri-file-reduce-line', sort: 460, },
      },
    },
    searchConfig: {
      search: [{
        type: 'select', field: 'plant_id', style: { width: '100px' }, value: siyi.user.plantId, load: 'factory',
        options: { multiple: false, clearable: false },
        onChange: (val => {
          refObj.plantId = val;
          mainTable.value.reportConfig.getData({ where: { plant_id: val } })
          obj.getWorkshopsLists(val);
        })
      }],
    },
    tableConfig: {
      url: apiUrl.sys.asset.mainList, showCheck: true, disablePage: true,
      events: {
        click_cell: args => {
          if (args.originData?.type !== refObj.type) {
            refObj.tab = 'stepsTable';
          }
          if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
            refObj.type = args.originData.type;
            if (args.originData?.type === 'group') {
              assetsTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
              processTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
            } else {
              userTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
            }
            stepsTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
            parameterTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
            repairTable.value.reportConfig.getData({ exec: null, id: args.originData.id, type: args.originData.type });
          }
        }
      },
    },
  },
  //工序表配置
  stepsTableConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          //资产或资产组添加工序
          click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要添加的资产或资产组');
              return;
            }
            const exitsIds = stepsTable.value.reportConfig.data.map(item => item.id);
            const options = refObj.stepsList.filter((item) => refObj.plantId === item.plant_id && !exitsIds.includes(item.value));
            const stepIds = await dialog.selectAsync(options, '', '请选择要关联的工序', {
              width: '300px'
            }, {
              multiple: true,
              placeholder: '请输入工序名称',
              clearable: true,
              reserveKeyword: true,
              minCollapsedNum: 10
            });
            if (stepIds.length === 0) {
              dialog.info('请先选择要添加的工序');
              return;
            }
            if (stepIds.length > 0) {
              const loading = dialog.loading(undefined, '保存中...');
              const res = await api.post(apiUrl.sys.asset.addStep, {
                id: asset[0].id,
                type: asset[0].type,
                stepIds: stepIds,
              });
              loading && loading.close();
              const message = asset.type === 'group' ? '资产组' : '资产';
              if (res.ret === true) {
                dialog.success(`${message}添加工序成功`);
              } else if (res.ret === -1) {
                dialog.warning(`${message}不能重复添加工序`);
              } else {
                dialog.success(`${message}添加工序失败`);
              }
              stepsTable.value.reportConfig.getData({ id: asset[0].id, type: asset[0].type });
            }
          }
        },
        delete: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择资产或资产组');
              return;
            }
            let stepIds = tableFn.getCheckedRecords(stepsTable.value.reportConfig).map(item => item.step_asset_id);
            if (stepIds.length === 0) {
              dialog.info('请先选择要删除的工序');
              return;
            }
            dialog.confirm('确定要删除吗？', async () => {
              const res = await api.post(apiUrl.sys.asset.delSteps, { id: asset[0].id, type: asset[0].type, stepIds });
              if (res !== null && res !== undefined) {
                if (res.ret > 0) {
                  dialog.success('成功删除工序成功');
                  stepsTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                } else {
                  dialog.info('网络错误，请稍后再试');
                }
              }
            });
          }
        }
      },
    },
    tableConfig: { url: apiUrl.sys.asset.stepsList, showCheck: 'multiple', disablePage: true },
  },
  //用户表配置
  userTableConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          //添加人员
          click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择资产');
              return;
            }
            if (asset[0].type === 'group') {
              dialog.error('资产组不能添加用户');
              return;
            }
            const exitsIds = userTable.value.reportConfig.data.map(item => item.id);
            const options = refObj.userLists.filter((item) => !exitsIds.includes(item.value));
            const userIds = await dialog.selectAsync(options, '', '请选择要关联的用户', {
              width: '330px'
            }, {
              multiple: true,
              placeholder: '请输入用户名称',
              clearable: true,
              reserveKeyword: true,
              minCollapsedNum: 10
            });
            if (userIds.length === 0) {
              dialog.info('请先选择要添加的用户');
              return;
            }
            if (userIds.length > 0) {
              const loading = dialog.loading(undefined, '保存中...');
              const res = await api.post(apiUrl.sys.asset.addAssetsUser, {
                id: asset[0].id,
                userIds,
              });
              loading && loading.close();
              if (typeof (res.ret) === 'boolean') {
                if (res.ret === true) {
                  dialog.success(`成功添加${userIds.length}位用户到资产《${asset[0].name}》`);
                } else {
                  dialog.error('添加失败');
                }
              } else if (typeof (res.ret) === 'object') {
                const users = refObj.userLists.filter(item => res.ret.includes(item.value));
                let msg = `已存在，请勿重复添加`, data = '';
                users.forEach(i => {
                  data += i.label + '</br>';
                })
                dialog.error(data + msg);
              } else {
                dialog.error('网络错误，请稍后再试');
              }
              userTable.value.reportConfig.getData({ id: asset[0].id, type: asset[0].type });
            }
          }
        },
        delete: {
          click: () => {
            let uids = tableFn.getCheckedRecords(userTable.value.reportConfig).map(i => i.user_link_id);
            if (uids.length === 0) {
              dialog.info('请先选择要删除的用户');
              return;
            }
            dialog.confirm('确定要删除吗？', async () => {
              let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
              const res = await api.post(apiUrl.sys.asset.deleteUser, { aid: asset[0].id, type: asset[0].type, uids });
              if (res !== null && res !== undefined) {
                if (res.ret > 0) {
                  dialog.success(`成功删除${res.ret}条记录`);
                  userTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                } else {
                  dialog.info('网络错误，请稍后再试');
                }
              }
            });
          }
        }
      },
    },
    tableConfig: { url: apiUrl.sys.asset.userList, showCheck: 'multiple', disablePage: true },
  },
  //资产组表配置
  assetsTableConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择资产组');
              return;
            }
            if (asset[0]?.type !== 'group') {
              dialog.info('资产暂不支持添加资产，请选择资产组');
              return;
            }
            refObj.groupDialog = true;
            const exitsIds = assetsTable.value.reportConfig.data.map(item => item.id);
            const assetsLists = mainTable.value.reportConfig.data.filter(i => i.type === 'assets').map(i => ({ code: i.code, value: i.id, label: i.name, plant_id: i.plant_id, id: i.id, status: i.status, name: i.name }));
            const options = assetsLists.filter(i => !exitsIds.includes(i.value) && i.status === 1 && i.plant_id === refObj.plantId);
            const assetIds = await dialog.selectAsync(options, '', '请选择要关联的资产', {
              width: '310px'
            }, {
              multiple: true,
              placeholder: '请输入资产名称',
              clearable: true,
              reserveKeyword: true,
              minCollapsedNum: 10
            });
            if (assetIds.length === 0) {
              dialog.info('请先选择要添加的资产');
              return;
            }
            if (assetIds.length > 0) {
              const loading = dialog.loading(undefined, '保存中...');
              const res = await api.post(apiUrl.sys.asset.addAssetsGroupLink, {
                assetId: asset[0].id,
                uids: assetIds,
                label: asset[0].label,
              });
              if (typeof (res.ret) === 'boolean') {
                if (res.ret === true) {
                  dialog.success(`成功添加${assetIds.length}个资产到《${asset[0].name}》`);
                } else {
                  dialog.error('添加失败');
                }
              } else if (typeof (res.ret) === 'object') {
                const users = assetsLists.filter(item => res.ret.includes(item.value));
                let msg = `已存在，请勿重复添加`, data = '';
                users.forEach(i => {
                  data += i.label + '</br>';
                })
                dialog.error(data + msg);
              } else {
                dialog.error('网络错误，请稍后再试');
              }
              loading && loading.close();
              assetsTable.value.reportConfig.getData({ id: asset[0].id, type: asset[0].type });
            }
          }
        },
        delete: {
          click: () => {
            let uids = tableFn.getCheckedRecords(assetsTable.value.reportConfig).map(i => i.group_link_id);
            if (uids.length === 0) {
              dialog.info('请先选择要删除的资产');
              return;
            }
            dialog.confirm('确定要删除吗？', async () => {
              let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
              const res = await api.post(apiUrl.sys.asset.deleteAssetsGroup, { aid: asset[0].id, type: asset[0].type, uids });
              if (res !== null && res !== undefined) {
                if (res.ret > 0) {
                  dialog.success(`成功删除${res.ret}条记录`);
                  assetsTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                } else {
                  dialog.info('网络错误，请稍后再试');
                }
              }
            });
          }
        }
      },
    },
    tableConfig: { url: apiUrl.sys.asset.assetsList, showCheck: 'multiple', disablePage: true },
  },
  //工艺表配置
  processTableConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['pageExport', 'clearWhere', 'moreSettings'],
      menu: {
        create: {
          //资产或资产组添加工序
          click: async () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择资产组');
              return;
            }
            if (asset[0].type === 'assets') {
              dialog.info('资产赞暂不支持添加工艺，请选择资产组');
              return;
            }
            const exitsIds = processTable.value.reportConfig.data.map(item => item.id);
            const options = refObj.processLists.filter((item) => refObj.plantId === item.plant_id && !exitsIds.includes(item.value));
            const processIds = await dialog.selectAsync(options, '', '请选择要关联的工艺', {
              width: '300px'
            }, {
              multiple: true,
              placeholder: '请输入工艺名称',
              clearable: true,
              reserveKeyword: true,
              minCollapsedNum: 10
            });
            if (processIds.length === 0) {
              dialog.info('请先选择要添加的工艺');
              return;
            }
            if (processIds.length > 0) {
              const loading = dialog.loading(undefined, '保存中...');
              const res = await api.post(apiUrl.sys.asset.addProcess, {
                id: asset[0].id,
                pIds: processIds,
              });
              loading && loading.close();
              if (typeof (res.ret) === 'boolean') {
                if (res.ret === true) {
                  dialog.success(`成功添加${processIds.length}道工艺到资产组《${asset[0].name}》`);
                } else {
                  dialog.error('添加失败');
                }
              } else if (typeof (res.ret) === 'object') {
                const processes = refObj.processLists.filter(item => res.ret.includes(item.value));
                let msg = `已存在，请勿重复添加`, data = '';
                processes.forEach(i => {
                  data += i.label + '</br>';
                })
                dialog.error(data + msg);
              } else {
                dialog.error('网络错误，请稍后再试');
              }
              processTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
            }
          }
        },
        delete: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择资产组');
              return;
            }
            let processIds = tableFn.getCheckedRecords(processTable.value.reportConfig).map(item => item.process_asset_id);
            if (processIds.length === 0) {
              dialog.info('请先选择要删除的工艺');
              return;
            }
            dialog.confirm('确定要删除吗？', async () => {
              const res = await api.post(apiUrl.sys.asset.delProcess, { id: asset[0].id, processIds });
              if (res !== null && res !== undefined) {
                if (res.ret > 0) {
                  dialog.success('成功删除工艺成功');
                  processTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                } else {
                  dialog.info('网络错误，请稍后再试');
                }
              }
            });
          }
        }
      }
    },
    tableConfig: { url: apiUrl.sys.asset.processList, showCheck: 'multiple', disablePage: true },
  },
  //资产属性表配置
  parameterTableConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['pageExport', 'moreSettings'],
      menu: {
        create: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择资产');
              return;
            }
            if (asset[0]?.type === 'group') {
              dialog.info('资产组暂不支持添加资产属性，请选择资产');
              return;
            }
            dialog.window(
              addAssetsParameter,
              {
                query: { asset: asset[0], },
                scene: 'auth',
                getAttach: (e) => {
                  if (e) {
                    parameterTable.value.reportConfig.getData({ exec: null, id: asset[0].id, type: asset[0].type });
                  }
                }
              },
              {
                title: "添加资产属性：", width: '1260px', height: '800px', forceEnlarge: false, changeSize: false,
              }
            )
          }
        },
        delete: {
          click: () => {
            let ids = tableFn.getCheckedRecords(parameterTable.value.reportConfig).map(i => i.id);
            if (ids.length === 0) {
              dialog.info('请先选择要删除的资产属性');
              return;
            }
            dialog.confirm('确定要删除吗？', async () => {
              let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
              const res = await api.post(apiUrl.sys.asset.deleteParameter, { aid: asset[0].id, ids });
              if (res !== null && res !== undefined) {
                if (res.ret > 0) {
                  dialog.success(`成功删除${res.ret}条记录`);
                  parameterTable.value.reportConfig.getData({ id: asset[0].id });
                } else {
                  dialog.info('网络错误，请稍后再试');
                }
              }
            });
          }
        },
        update: {
          click: () => {
            dialogParameterConfig.config.title = '修改资产属性';
            dialogParameterConfig.type = 'editParameter';
            const checkedRows = tableFn.getCheckedRecords(parameterTable.value.reportConfig);
            if (checkedRows?.length < 1) return dialog.warning('请勾选资产属性');
            if (checkedRows?.length > 1) return dialog.warning('只能编辑一条资产属性');
            dialogParameterConfig.data = { ...checkedRows[0] };
            dialogParameterConfig.show = true;
          }
        },
      },
    },
    tableConfig: { url: apiUrl.sys.asset.parameterList, showCheck: true, disablePage: true },
  },
  //维修表配置
  repairTableConfig: {
    searchConfig: false,
    menuConfig: {
      defaultMenuShowList: ['pageExport', 'moreSettings'],
      menu: {
        create: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择资产');
              return;
            }
            if (asset[0]?.type === 'group') {
              dialog.info('资产组暂不支持添加资产维修信息，请选择资产');
              return;
            }
            dialogRepairConfig.config.title = '新增资产维修信息';
            dialogRepairConfig.type = 'addRepair';
            if (asset?.length > 1) return dialog.warning('只能勾选一条资产信息');
            dialogRepairConfig.data.assets_id = asset[0].id;
            dialogRepairConfig.data.type = asset[0].type;
            dialogRepairConfig.show = true;
          }
        },
        delete: {
          click: () => {
            let ids = tableFn.getCheckedRecords(repairTable.value.reportConfig).map(i => i.id);
            if (ids.length === 0) {
              dialog.info('请先选择要删除的资产维修信息');
              return;
            }
            dialog.confirm('确定要删除吗？', async () => {
              let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
              const res = await api.post(apiUrl.sys.asset.deleteRepair, { aid: asset[0].id, ids });
              if (res !== null && res !== undefined) {
                if (res.ret > 0) {
                  dialog.success(`成功删除${res.ret}条记录`);
                  repairTable.value.reportConfig.getData({ id: asset[0].id });
                } else {
                  dialog.info('网络错误，请稍后再试');
                }
              }
            });
          }
        },
        update: {
          click: () => {
            dialogRepairConfig.config.title = '修改资产维修信息';
            dialogRepairConfig.type = 'editRepair';
            const checkedRows = tableFn.getCheckedRecords(repairTable.value.reportConfig);
            if (checkedRows?.length < 1) return dialog.warning('请勾选资产维修信息');
            if (checkedRows?.length > 1) return dialog.warning('只能编辑一条资产维修信息');
            dialogRepairConfig.data = { ...checkedRows[0] };
            dialogRepairConfig.show = true;
          }
        },
      },
    },
    tableConfig: { url: apiUrl.sys.asset.repairList, showCheck: 'multiple', disablePage: true },
  },
  //重置form表单
  onReset: () => {
    refObj.formData = { ...formObj.rawData, ...{ status: true, plant_id: refObj.plantId } };
  },
  //清空校验结果
  handleClear: () => {
    assetsForm.value.clearValidate();
  },
  //添加select标签内容
  createAssetOptions: (value) => {
    refObj.assetLabelOptions.push({
      value,
      label: value,
    });
  },
  createGroupOptions: (value) => {
    refObj.groupLabelOptions.push({
      value,
      label: value,
    });
  },
  //获取车间列表
  getWorkshopsLists: (plantId) => {
    let workshopData = [];
    obj.options.workshopOptionsLists.forEach((i) => {
      i.plant_id === plantId ? workshopData.push({ label: i.name, value: i.id }) : null;
    })
    refObj.workshopOptions = workshopData;
  },
  //切换添加分类
  onChange: (val) => {
    if (val === '1') {
      refObj.formData.type = 'assets';
      refObj.name = '资产';
    } else {
      refObj.formData.type = 'group';
      refObj.name = '资产组';
    }
    assetsForm.value.clearValidate();
    obj.onReset();
  },
  handleChange: (e) => {
    obj.getWorkshopsLists(e);
  }
}
//参数弹框配置
const dialogParameterConfig = reactive({
  show: false,
  data: {},
  config: {
    type: 'confirm',
    onAfterClose: () => dialogParameterConfig.show = false,
    onOk: async obj => {
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.sys.asset[dialogParameterConfig.type], dialogParameterConfig.data);
      loading && loading.close();
      if (res) {
        dialog.success('保存成功');
        dialogParameterConfig.show = false;
        parameterTable.value.reportConfig.getData({ id: dialogParameterConfig.data.assets_id });
      }
    }
  },
});
//维修弹框配置
const dialogRepairConfig = reactive({
  show: false,
  data: { status: 1, start_time: new Date(), end_time: new Date() },
  config: {
    type: 'confirm',
    onAfterClose: () => dialogRepairConfig.show = false,
    onOk: async obj => {
      if (!dialogRepairConfig.data.start_time) {
        dialog.warning('请选择维修开始时间');
        obj.close = false;
        return;
      }
      if (!dialogRepairConfig.data.end_time) {
        dialog.warning('请选择维修结束时间');
        obj.close = false;
        return;
      }
      if (!dialogRepairConfig.data.content) {
        dialog.warning('请输入维修内容');
        obj.close = false;
        return;
      }
      if (!dialogRepairConfig.data.status) {
        dialog.warning('请选择状态');
        obj.close = false;
        return;
      }
      const loading = dialog.loading(undefined, '保存中...');
      const res = await api.post(apiUrl.sys.asset[dialogRepairConfig.type], dialogRepairConfig.data);
      loading && loading.close();
      if (res) {
        dialog.success('保存成功');
        dialogRepairConfig.show = false;
        repairTable.value.reportConfig.getData({ exec: null, id: dialogRepairConfig.data.assets_id, type: dialogRepairConfig.data.type });
        dialogRepairConfig.data = { status: 1, start_time: new Date(), end_time: new Date(), content: '' };
      }
    }
  },
});

onMounted(async () => {
  //获取主表配置
  await api.get(apiUrl.sys.asset.mainConfig).then(res => {
    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;
    obj.plantOptions = res.option.plantOptionsLists.map(i => ({ label: i.title, value: i.id }));// 获取工厂列表;
    obj.assetCategoryOptions = res.option.categoryOptionsLists.map(i => ({ label: i.name, value: i.id }));// 获取资产分类列表
    const groupArr = [], groupLabelData = res.option.groupLabelOptionsLists;
    for (let key in groupLabelData) {
      groupArr.push({ label: groupLabelData[key], value: groupLabelData[key] });
    }
    obj.groupLabelOptions = groupArr;
    const assetsArr = [], assetsLabelData = res.option.labelOptionsLists;
    for (let key in assetsLabelData) {
      assetsArr.push({ label: assetsLabelData[key], value: assetsLabelData[key] });
    }
    obj.assetLabelOptions = assetsArr;
    obj.getWorkshopsLists(siyi.user.plantId);
    refObj.mainTableShow = true;
  });
  //获取工序表配置
  await api.get(apiUrl.sys.asset.stepsConfig).then(res => {
    obj.stepsTableConfig.tableConfig = { ...obj.stepsTableConfig.tableConfig, ...res.table };
    obj.stepsTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.stepsTableShow = true;
    const ret = [];
    Object.values(res.option.stepLists).filter((item) => {
      if (item.status === 1) {
        ret.push({ value: item.id, label: item.name, plant_id: item.plant_id });
      }
    });
    refObj.stepsList = ret;
  });
  //获取用户表配置
  await api.get(apiUrl.sys.asset.userConfig).then(res => {
    obj.userTableConfig.tableConfig = { ...obj.userTableConfig.tableConfig, ...res.table };
    obj.userTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.userTableShow = true;
    const ret = [];
    Object.values(res.option.userLists).filter((item) => {
      ret.push({ value: item.id, label: `${item.nickname}(${item.username})` });
    });
    refObj.userLists = ret;
  });
  //获取资产表配置
  await api.get(apiUrl.sys.asset.assetsConfig).then(res => {
    obj.assetsTableConfig.tableConfig = { ...obj.assetsTableConfig.tableConfig, ...res.table };
    obj.assetsTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.assetsTableShow = true;
  });
  //获取工艺表配置
  await api.get(apiUrl.sys.asset.processConfig).then(res => {
    obj.processTableConfig.tableConfig = { ...obj.processTableConfig.tableConfig, ...res.table };
    obj.processTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.processTableShow = true;
    const ret = [];
    const data = Object.values(res.option.processLists);
    data.filter((item) => {
      if (item.status === 1) {
        ret.push({ value: item.id, label: item.name, plant_id: item.plant_id });
      }
    });
    refObj.processLists = ret;
  });
  //获取资产属性表配置
  await api.get(apiUrl.sys.asset.parameterConfig).then(res => {
    obj.parameterTableConfig.tableConfig = { ...obj.parameterTableConfig.tableConfig, ...res.table };
    obj.parameterTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.selectOptions = Object.assign({}, refObj.selectOptions, getOptionsLabel(res.option));
    refObj.parameterTableShow = true;
  });
  //获取维修表配置
  await api.get(apiUrl.sys.asset.repairConfig).then(res => {
    obj.repairTableConfig.tableConfig = { ...obj.repairTableConfig.tableConfig, ...res.table };
    obj.repairTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.selectOptions = Object.assign({}, refObj.selectOptions, getOptionsLabel(res.option));
    refObj.repairTableShow = true;
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
    height: 40%;
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

  .dialogClass {
    width: 450px;
    height: 100%;
    overflow: hidden;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    >div {
      width: auto;
    }
  }

  .steps-dialog {
    display: flex;
    align-items: center;
    height: stretch;
    padding: 0 3px;
  }

  .asset-component {
    padding: 15px 30px 3px 27px;

    .add-cate {
      padding: 0 0 15px 0;
    }
  }
}
</style>