<template>
  <div class="siyi-item-list">
    <vxe-grid ref="gridRef" v-bind="grid.bind" v-on="grid.on" :data="vData.list">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>

        <vxe-button-group v-bind="listBtn.action.bind" @click="listBtn.action.click"   />

        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />


        <span style="margin:0 10px 0 20px ">筛选：</span>
        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="plantList">
        </vxe-select>

        <!--        <vxe-select v-model="vData.params.type" placeholder="类型" size="small" clearable style="width: 120px"-->
        <!--                    @change="searchList('init')" :options="vData.listLabel.type">-->
        <!--        </vxe-select>-->

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.status">
        </vxe-select>


        <vxe-input type="search" v-model="vData.params.search" placeholder="搜索"  size="small" @clear="searchList"
                   @search-click="searchList" @change="searchListDelay" clearable
                   style="width: 200px" />

        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>

      </template>
      <template #empty><span><img :src="noData"><p>{{ vData.msg }}</p></span></template>
    </vxe-grid>

    <!-- 修改弹窗 -->
    <vxe-modal v-model="editModal.data.isShow" v-bind="editModal.bind" v-on="editModal.on">
      <template #title>
        <vxe-button status="success" :content="editModal.data.editBtnName"  @click="editModal.save" :icon="'vxe-icon-'+editModal.data.editBtnIcon" style="margin-right: 40px"/>
        <vxe-button-group v-bind="editModal.data.btn.bind()" @click="editModal.data.btn.click"/>
      </template>
      <template #default>


        <vxe-form ref="editFormRef"  v-bind="editForm.bind" v-on="editForm.on" :data="editForm.data">
          <vxe-form-item field="plant_id" title="工厂" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.plant_id" :disabled="editModal.data.isReadonly" :options="plantList"/>
            </template>
          </vxe-form-item>
          <vxe-form-item field="type" title="类型" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.type" :disabled="editModal.data.isReadonly" :options="vData.listLabel.type" />
            </template>
          </vxe-form-item>
          <vxe-form-item field="title" title="标题" span="24">
            <template #default="{ data }">
              <vxe-input v-model="data.title" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item field="remark" title="备注" span="24">
            <template #default="{ data }">
              <vxe-input v-model="data.remark" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item field="status" title="列表显示" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.status" :disabled="editModal.data.isReadonly" :options="vData.listLabel.status" />
            </template>
          </vxe-form-item>
          <vxe-form-item field="cron_status" title="自动抓取" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.cron_status" :disabled="editModal.data.isReadonly" :options="vData.listLabel.cron_status" />
            </template>
          </vxe-form-item>
        </vxe-form>

        <vxe-form ref="editForm2Ref"  v-bind="editForm2.bind" v-on="editForm2.on" :data="editForm.data.rule_config">

          <vxe-form-item field="customer_codes" title="客户代码（下单）" span="12">
            <template #default="{ data }">
              <vxe-input v-model="data.customer_codes" placeholder="多个用空格隔开" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>

          <vxe-form-item field="customer_codes2" title="（型号）" span="12">
            <template #default="{ data }">
              <vxe-input v-model="data.customer_codes2" placeholder="多个用空格隔开" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>

          <vxe-form-item field="custContractNumber" title="客户合同号" span="24">
            <template #default="{ data }">
              <vxe-input v-model="data.custContractNumber" placeholder="%代表任意字符" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>

          <vxe-form-item field="custMatCode"  title="客户料号" span="24">
            <template #default="{ data }">
              <vxe-input v-model="data.custMatCode" placeholder="%代表任意字符" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>

          <vxe-form-item field="order_type_in" title="订单类型（包含）" span="12" >
            <template #default="{ data }">
              <vxe-select multiple v-model="data.order_type_in" :disabled="editModal.data.isReadonly" :options="vData.listLabel.order_type" />
            </template>
          </vxe-form-item>
          <vxe-form-item field="order_type_notin" title="（排除）" span="12">
            <template #default="{ data }">
              <vxe-select multiple v-model="data.order_type_notin" :disabled="editModal.data.isReadonly" :options="vData.listLabel.order_type" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="order_status_in" title="订单状态（包含）" span="12">
            <template #default="{ data }">
              <vxe-select multiple v-model="data.order_status_in" :disabled="editModal.data.isReadonly" :options="vData.listLabel.order_status" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="order_status_notin"  title="（排除）" span="12">
            <template #default="{ data }">
              <vxe-select multiple v-model="data.order_status_notin"
                          :disabled="editModal.data.isReadonly"
                          :options="vData.listLabel.order_status" />
            </template>
          </vxe-form-item>

          <vxe-form-item  field="mtName" title="销售类型（包含）" span="12">
            <template #default="{ data }">
              <vxe-input v-model="data.mtName" placeholder="%代表任意字符" :disabled="editModal.data.isReadonly"></vxe-input>

            </template>
          </vxe-form-item>

          <vxe-form-item field="mtName_notlike"  title="（排除）" span="12" >
            <template #default="{ data }">
              <vxe-input v-model="data.mtName_notlike" placeholder="%代表任意字符" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>

          <vxe-form-item  field="mtName" title=" " span="24">
            <p class="help">{{Object.values(vData.listOption.sale_type).join("\t")}}</p>
          </vxe-form-item>

          <!--          <vxe-form-item title="销售类型（包含）" span="24" field="sale_type_notin">
                      <template #default="{ data }">
                        <vxe-select multiple v-model="data.sale_type_notin" :disabled="editModal.data.isReadonly" :options="vData.listLabel.sale_type" />
                      </template>
                    </vxe-form-item>-->



          <vxe-form-item title="下单顺序（=）" field="order_index"  span="12">
            <template #default="{ data }">
              <vxe-number-input v-model="data.order_index" min="0" placeholder="本订单(库存订单)在所有订单中的顺序（大版本）,0不限制" type="integer" clearable :disabled="editModal.data.isReadonly" />
            </template>
          </vxe-form-item>

          <vxe-form-item title="投产顺序（=）" field="mo_count_index"  span="12">
            <template #default="{ data }">
              <vxe-number-input v-model="data.mo_count_index" min="0" placeholder="本订单在所有投产订单中的顺序（大版本）" type="integer" clearable :disabled="editModal.data.isReadonly" />
            </template>
          </vxe-form-item>

          <vxe-form-item title="PCS数量（≥）" field="qty_Order_min"  span="12">
            <template #default="{ data }">
              <vxe-number-input v-model="data.qty_Order_min" min="0" placeholder="不包含赠品" type="integer" :disabled="editModal.data.isReadonly" />
            </template>
          </vxe-form-item>

          <vxe-form-item title="建单时间（≥）" field="EnterDate"  span="12" >
            <template #default="{ data }">
              <vxe-input v-model="data.EnterDate" type="date" :disabled="editModal.data.isReadonly"></vxe-input>
            </template>
          </vxe-form-item>

        </vxe-form>


      </template>
    </vxe-modal>


  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, reactive, ref} from "vue"
import * as core from "@/core/script/core.js"
import {getCurrentPage, http, url as apiUrl} from "@/core/script/api.js"
import noData from '@/core/assets/img/nodata.gif'
import {getQuery} from "@/core/script/nav.js"
import {getPlant, getUserPlantList, plantList} from '@/utils/erp.js'
import {gridOptions as gridOptionsDefault} from '@/config/vxeTable.js'
import _ from "lodash";
import {VxeUI} from "vxe-pc-ui";
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

const userPlantList = getUserPlantList('wo-'); //用户的工厂


// 接口URL
const _apiUrl = apiUrl.flow.item;

const getRowOptionsText = (value, field) => {
  let value_list = typeof value === 'string' ? value.split(' ') : value;
  return value_list ? value_list.map((vale) => vData.listOption[field][vale]).join(' ') : '';
}

const cronLogFormatter = ({cellValue: logList}) => {
  logList.reverse();
  return logList.map((log) => core.date.timeFormat(log.time, "MM-DD HH:mm") + "\t" + log['info']).join("\r\n");
}


//列配置
const columns = [
  {title: '', width: 46, type: 'checkbox', sortable: true},
  // {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: 'ID', width: 60, field: 'id', sortable: true, visible: true},
  {title: '工厂', width: 100, field: 'plant_id', sortable: true, formatter: ({row}) => getPlant(row.plant_id), visible: false},
  {title: '类型', width: 100, field: '_text.type', sortable: true, visible: false},
  {title: '名称', width: 160, field: 'title', sortable: true},
  {title: '备注', width: 120, field: 'remark', visible: true},

  {title: '客户代码', minWidth: 200, field: 'rule_config.customer_codes', sortable: true},
  {title: '客户代码(按型号)', minWidth: 200, field: 'rule_config.customer_codes2', sortable: true, visible: false},

  {title: '客户合同号', width: 100, field: 'rule_config.custContractNumber', sortable: true},
  {title: '客户型号', width: 100, field: 'rule_config.custMatCode', sortable: true},

  {title: '销售类型（包含）', minWidth: 160, field: 'rule_config.mtName', sortable: true},
  {title: '销售类型（排除）', minWidth: 140, field: 'rule_config.mtName_notlike', sortable: true},
  {title: '订单类型（包含）', minWidth: 140, field: 'rule_config.order_type_in', sortable: true, formatter: ({row}) => getRowOptionsText(row.rule_config.order_type_in, 'order_type')},
  {title: '订单类型（排除）', minWidth: 160, field: 'rule_config.order_type_notin', sortable: true, formatter: ({row}) => getRowOptionsText(row.rule_config.order_type_notin, 'order_type')},
  {title: '订单状态（包含）', minWidth: 140, field: 'rule_config.order_status_in', sortable: true, formatter: ({row}) => getRowOptionsText(row.rule_config.order_status_in, 'order_status')},
  {title: "订单状态（排除）", minWidth: 140, field: 'rule_config.order_status_notin', sortable: true, formatter: ({row}) => getRowOptionsText(row.rule_config.order_status_notin, 'order_status')},

  {title: '订单数量(>=)', width: 120, field: 'rule_config.qty_Order_min', sortable: true},
  {title: '下单顺序(=)', width: 120, field: 'rule_config.order_index', sortable: true},
  {title: '投产顺序(=)', width: 120, field: 'rule_config.mo_count_index', sortable: true},



  {title: '开始时间', width: 120, field: 'rule_config.EnterDate', sortable: true},

  {title: '状态', width: 80, field: '_text.status', sortable: true},
  {title: '定时', width: 80, field: '_text.cron_status', sortable: true},


  {title: '任务日志', width: 120, field: 'cron_log', visible: true, formatter: cronLogFormatter},


  {title: '创建人', width: 80, field: '_text.created_uid', sortable: true, visible: false},
  {title: '创建时间', minWidth: 140, field: '_text.created_at', sortable: true, visible: false},
  {title: '更新人', width: 80, field: '_text.updated_uid', sortable: true, visible: false},
  {title: '更新时间', minWidth: 140, field: '_text.updated_at', sortable: true, visible: false},

];


//默认数据
const defaultData = {
  typeList: ['erpContractItem'],
  params: {
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    search: '',//搜索关键字
    type: 'erpContractItem',//类型
    status: undefined,//状态
    customer_code: '',//客户代码
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
  },
  modal_bind: {
    size: "mini",
    width: 760,
    position: 'center',
    loading: false,
    resize: 'resize',
    minHeight: 300,
  },
  modal_data: {
    formName: '',
    action: '',
    isReadonly: true,
    isShow: false,
    editBtnName: '提交',
    editBtnIcon: 'edit',
    btn: {
      bind: () => {
      }, click: () => {
      }
    },
  },
  form_data: {
    plant_id: 0,
    status: 1,
    cron_status: 1,
    rule_config: {
      customer_codes: '',
      customer_codes2: '',
      custContractNumber: '',
      custMatCode: '',
      order_type_in: [],
      order_type_notin: [],
      order_status_in: [],
      order_status_notin: [],
      mtName_like: '',
      mtName: '',
      qty_Order_min: '',
      order_index: '',
      mo_count_index: '',
      EnterDate: '',
    },
  }
};

//页面数据
const vData = reactive({
  params: {...defaultData.params},
  list: [],
  msg: '',
  listOption: {},
  listLabel: {},
});


//列表
const gridRef = ref()
const grid = reactive({
  bind: {
    ...gridOptionsDefault,
    id: 'siyi-item-list',
    columns: columns,
    seqConfig: {
      seqMethod: ({rowIndex}) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
    }
  },
  on: {
    cellClick: async ({row, columnIndex}) => {
      console.log(columnIndex);
      columnIndex > 1 && await gridRef.value.clearCheckboxRow();
      await gridRef.value.toggleCheckboxRow(row);
    },
    cellDblclick: ({row}) => {
      listBtn.action.click({name: 'view'}, row)
    },
    zoom: ({type}) => core.fullscreenSwitch(type === 'max'),
  }
})

//列表批量操作
const listBtn = reactive({
  status: {
    bind: {
      modelValue: vData.params.statusAction,
      size: "small",
      placeholder: '批量修改-状态',
      prefixIcon: 'vxe-icon-checkbox-checked',
      options: [],
      className: 'search-select',
    },
    on: {
      focus: () => {
        listBtn.status.bind.options = [...vData.listLabel.status || [], ...[{label: '删除', value: -1}]];
      },
      change: async ({value}) => {
        await formEvent.set(listBtn.getSelectedRows(true), value, 'status');
        await searchList('init');
      }
    },
  },
  action: {
    bind: {
      className: 'list-action',
      size: "small",
      options: [
        {name: 'add', mode: 'text', content: "添加", icon: 'vxe-icon-add'},
        {name: 'copy', mode: 'text', content: "复制", icon: 'vxe-icon-copy'},
        {name: 'view', mode: 'text', content: "查看", icon: "vxe-icon-search-zoom-in"},
        {name: 'delete', mode: 'text', content: "删除", icon: 'vxe-icon-delete'},
        {name: 'cron', mode: 'text', content: "执行", icon: 'vxe-icon-caret-right'},
      ]
    },
    click: ({name}, row) => {
      switch (name) {
        case 'add': {
          editModal.open('add');
          break;
        }
        case 'delete': {
          let ids = listBtn.getSelectedRows(true);
          ids && formEvent.delete(ids);
          break;
        }
        case 'cron': {
          let id = listBtn.getSelectedRow(true);
          id && formEvent.cron(id);
          break;
        }
        default : {
          row = row === undefined ? listBtn.getSelectedRow(false) : row;
          row && editModal.open(name, row);
        }
      }
    }
  },
  getSelectedRow: (getId = false) => {
    const res = listBtn.getSelectedRows(getId);
    if (res && res?.length !== 1) {
      dialog.error('请勾选一个需要操作的数据')
      return;
    }
    return res?.[0];
  },
  getSelectedRows: (getIds = false) => {
    const selectedRows = gridRef.value.getCheckboxRecords();
    if (selectedRows === undefined || selectedRows.length === 0) {
      dialog.error('请勾选要操作的数据！')
      return
    }
    return getIds ? selectedRows.map((item) => item.id) : selectedRows;
  }
})


//弹出层
const editModal = reactive({
  bind: {...defaultData.modal_bind},
  on: {
    show: (e) => {
      const modalTop = e.$modal.getPosition().top;
      editModal.bind.height = ((window.innerHeight - modalTop * 2)) + 'px';//自动高度
    }
  },
  getForm: () => {
    return editForm;
  },
  open: (action, params = {}, formName = 'form') => {
    editModal.data = {...defaultData.modal_data, action, isShow: true, isReadonly: false, formName};
    editModal.getForm()?.onShow(params);
    editModal.getForm()[action](params);
  },
  save: async (e) => {
    await editModal.getForm()?.save(e);
  },
  close: (callback) => {
    editModal.getForm()?.onClose();
    editModal.data = {...defaultData.modal_data};
    editModal.bind = {...defaultData.modal_bind};
    callback && callback();
  },
  data: {...defaultData.modal_data},
});

//表单事件
const formEvent = {
  view: async ({id}) => {
    if (id === undefined) {
      return;
    }
    let res = await http.get(_apiUrl.detail, {params: {id: id}})
    if (res.data.code !== 20000) {
      dialog.error(res.data.message)
      return;
    }
    let detailData = res.data.data.data;
    editForm.data = {...defaultData.form_data, ...detailData};//合并数据
    editModal.data.editBtnName = '修改(ID:' + detailData.id + ")";
    editModal.data.isReadonly = true;
    return detailData;
  },
  add: () => {
    editModal.data.isReadonly = false;
    editForm.data.plant_id = vData.params.plant_id;
    editForm.data.type = Object.keys(vData.listOption.type)?.[0];
  },
  copy: async (row) => {
    await formEvent.view(row);
    editModal.data.editBtnName = '复制(ID:' + editForm.data.id + ")";
    editForm.data.id = null;
    editModal.data.isReadonly = false;
  },
  edit: async (row) => {
    await formEvent.view(row);
    editModal.data.isReadonly = false;
  },
  save: async (e) => {
    if (editModal.data.isReadonly) {
      editModal.data.isReadonly = false;
      editModal.data.editBtnName = "保存";
      editModal.data.editBtnIcon = "save";
      return
    }
    if (await editFormRef.value.validate() !== undefined) {
      return;
    }
    editModal.data.loading = true
    let url = _apiUrl.save + "?action=" + editModal.data?.action;
    let res = await http.post(url, editForm.data);
    editModal.data.loading = false
    if (res.data.code !== 20000) {
      dialog.error(res.data.message)
      return;
    }
    editModal.close(searchList);
    await searchList();
  },
  set: async (id, value, key = 'status') => {
    if (id === undefined) {
      return;
    }
    let confirm = await VxeUI.modal.confirm({content: '确认操作？',});
    if (confirm !== 'confirm') {
      return;
    }
    let res = await http.post(_apiUrl.set, {id: id, [key]: value});
    if (res.data.code !== 20000) {
      dialog.error(res.data.message);
      return;
    }
    await searchList()
  },
  delete: async (id) => {
    return await formEvent.set(id, -1, 'status');
  },
  cron: async (id) => {
    const loading= dialog.loading(gridRef.value.$el,'执行中，请勿关闭页面~', );
    let res = await http.get(_apiUrl.cron, {params: {id: id}});
    loading.close()
    if (res.data.code !== 20000) {
      dialog.error(res.data.message);
      return;
    }
    dialog.success(res.data.message);
    await searchList()
  },
};

const editFormRef = ref();
const editForm = reactive({
  data: {...defaultData.form_data},
  bind: {
    titleWidth: 120,
    titleAlign: "right",
    rules: {
      plant_id: [
        {required: true, message: '工厂不能为空'},
      ],
      type: [
        {required: true, message: '类型不能为空'},
      ],
      item_id: [
        {required: true, message: '项目不能为空'},
      ]
    }
  },
  validate: async () => {
    return await editFormRef.value.validate(editForm.data);
  },
  on: {
    change: () => editForm.validate,
    submit: formEvent.save,
  },
  onShow: ({}) => {
    editModal.bind.width = 760
    editForm.data = {...defaultData.form_data};
  },
  onClose: () => {
    editForm.data = {...defaultData.form_data};//重置数据
  },
  ...formEvent,
});


const editForm2Ref = ref();
const editForm2 = reactive({
  bind: {
    titleWidth: 120,
    titleAlign: "right",
    rules: {
      customer_codes: [
        {pattern: /^(\d{4}\s)*\d{4}$/, message: "必须是4位数字，多个用空格隔开"},
      ],
      customer_codes2: [
        {pattern: /^(\d{4}\s)*\d{4}$/, message: "必须是4位数字，多个用空格隔开"},
      ]
    }
  },
  validate: async () => {
    return await editForm2Ref.value.validate(editForm.data.rule_config);
  },
  on: {
    change: () => editForm2.validate,
  },
});


const searchListDelay = _.debounce((e) => {
  searchList('search', {search: e?.value});
}, 500)

//搜索
const searchList = async (type = 'init', param = {}) => {
  vData.params = {...vData.params, ...param, currentPage: getCurrentPage(type, vData.params, vData.list.length)};
  type === 'reset' && (vData.params = {...defaultData.params});
  vData.msg = '正在搜索数据，请稍等！'
  vData.list = []
  let res = await http.get(_apiUrl.list, {params: vData.params});
  vData.msg = '没有搜索到数据！'
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  vData.list = _.cloneDeep(res.data.data.list);
  vData.listOption = res.data.data?.option?.list;
  vData.listLabel = getOptionsLabel(vData.listOption);
}


// 首次挂载
onMounted(() => {
  let {type} = getQuery();
  console.log('onMounted type', type);
  vData.params.type = defaultData.typeList.includes(type) ? type : defaultData.typeList[0];
  searchList()
})

// 页面显示时
onActivated(() => {
  let {type} = getQuery();
  console.log('onActivated type', type);
  if (type !== vData.params.type) {
    vData.params.type = defaultData.typeList.includes(type) ? type : defaultData.typeList[0];
    searchList();
  }
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})


</script>

<style>
.siyi-item-list {
  width: 100%;
  height: 100%;
  position: absolute;

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .list-action {
    margin-right: 40px;

    .vxe-button + .vxe-button.type--button {
      margin-left: 2px;
    }

    .mr10 {
      margin-left: 10px;
    }
  }

  .search-select {
    width: 140px;
  }

  .new-row {
    margin-top: 20px;
    border-top: 1px solid #e8e8e8;
  }

}
</style>