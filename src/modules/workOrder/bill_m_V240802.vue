<template>
  <div class="siyi-wo-bill">

    <t-dropdown-menu class="head-filter" v-if="vData.action==='list' && vData.params.case_id===undefined">
      <t-dropdown-item label="工厂" v-bind="tabs.bind('plant_id')" @change="(value)=>tabs.change('plant_id',value)"/>
      <t-dropdown-item label="状态" v-bind="tabs.bind('status')" @change="(value)=>tabs.change('status',value)"/>
      <t-dropdown-item label="类型" v-bind="tabs.bind('item')"
                       @change="(value)=>tabs.change('item',value)"/>
      <t-dropdown-item label="进度" v-bind="tabs.bind('process_step','case')"
                       @change="(value)=>tabs.change('process_step',value)"/>
    </t-dropdown-menu>

    <t-row class="head-search" v-if="vData.action==='list' && vData.params.case_id===undefined">
      <t-col span="16" class="light">
        <t-search v-model="vData.params.search" v-bind="searcher.bind" v-on="searcher.on"></t-search>
      </t-col>
      <t-col span="4" class="light">
        只看我
      </t-col>
      <t-col span="4" class="light">
        <t-switch v-model="vData.params.only_myself" @change="()=>getList('init')" />
      </t-col>
    </t-row>

    <t-loading id="loader" theme="spinner" :loading="vData.loading" v-show="vData.loading" layout="vertical" size="30px" />

    <t-pull-down-refresh id="main-pull"
                         v-model="vData.refreshing"
                         :loading-bar-height="66"
                         :loading-texts="['下拉刷新', '松开刷新', '正在刷新', '刷新完成']"
                         @refresh="()=>getList()" v-if="vData.action==='list'"
    >
      <t-list id="main-list" @scroll="listCell.scroll" @loadMore="()=>getList('next')">
        <t-cell-group theme="default">
          <t-cell v-for="(item,index) in vData.list" :key="item.id"
                  v-bind="listCell.bind(item)"
                  @click="listCell.click(item,$event)"
          >
            <template #title>
              <t-badge color="#13151d" :count="index+1" style="position: absolute;left:0" />
              <p>{{ "客户：" + item.customer_code + "\t\t" + (item.title || '') }}</p>
            </template>

            <template #description>
              <p>{{ "料号：" + item.job_sn + "" }}</p>
              <p>{{ "类型：" + item['_text']['item']}}</p>
              <p>{{ "状态：" + item['_text']['status']}}</p>
              <p>{{ "时间：" + item['_text']['created_at'] }}</p>
            </template>
          </t-cell>
        </t-cell-group>
        <template #footer>
          <t-empty :description="vData.msg"></t-empty>
        </template>
      </t-list>

    </t-pull-down-refresh>


    <t-form v-else id="main-form"  :data="form.data" v-bind="form.bind" v-on="form.on"
            contentAlign="right">

      <t-form-item label="类型" name="item" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('item')">{{ formPicker.getViewData('item') }}<ChevronRightIcon/> </span>
      </t-form-item>

      <t-form-item label="明细" name="title" contentAlign="right">
        <t-input borderless v-model="form.data.title" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="金额" name="money" contentAlign="right">
        <t-input borderless v-model="form.data.money" type="number" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>


      <t-form-item label="付款人" name="payer_uid" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('payer_uid')">{{ formPicker.getViewData('payer_uid') }}<ChevronRightIcon/> </span>
      </t-form-item>


<!--      <t-form-item label="消费人" name="consumer_uids" contentAlign="right">-->
<!--        <t-input: borderless=true v-model="form.data.consumer_uids" align="right" placeholder="请输入内容"></t-input>-->
<!--      </t-form-item>-->

      <t-form-item label="消费时间" name="pay_at" contentAlign="right">
        <span class="pickerEntry"
              @click="formPicker.open('pay_at','date')">{{ formPicker.getViewData('pay_at') }}<ChevronRightIcon/> </span>
      </t-form-item>

      <t-form-item label="备注" name="remark" contentAlign="right">
        <t-input borderless v-model="form.data.remark" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

<!--
      <t-form-item label="状态" name="status" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('status')">{{ formPicker.getViewData('status') }}<ChevronRightIcon/> </span>
      </t-form-item>
-->


      <div class="button-group">
        <t-button theme="primary" type="submit" size="small">提交</t-button>
        <t-button theme="default" variant="base" type="button" size="small" @click="form.close(false)">返回</t-button>
      </div>

    </t-form>

    <t-popup v-model="formPicker.isShow" placement="bottom" @closed="formPicker.close">
      <t-input borderless
          v-if="formPicker.filter.isShow()"
          v-model="formPicker.filter.value"
          v-bind="formPicker.filter.bind"
          v-on="formPicker.filter.on"/>
      <t-picker
          v-if="formPicker.type==='normal'"
          v-model="formPicker.value"
          v-bind="formPicker.bind"
          v-on="formPicker.on"
      />
      <t-date-time-picker v-else v-bind="formPicker.bind" v-on="formPicker.on"/>
    </t-popup>
    <t-fab v-show="pageBtn.isShow()" v-bind="pageBtn.bind" v-on="pageBtn.on"/>
    <t-fab v-show="backBtn.isShow()" v-bind="backBtn.bind" v-on="backBtn.on" />
    <t-fab v-show="goTop.isShow" v-bind="goTop.bind" v-on="goTop.on"/>
  </div>
</template>

<script setup>
import {h, onActivated, onDeactivated, onMounted, reactive} from "vue"
import _ from "lodash"
import * as core from "@/core/script/core"
import {AddIcon, BacktopIcon, ChevronRightIcon, RollbackIcon} from 'tdesign-icons-vue-next'
import {getUserPlantList} from "@/utils/erp.js";
import dayjs from "dayjs";
import {http, userSelector} from "@/core/script/api.js";
import {back as navBack} from "@/core/script/nav"
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";


//主页状态
const userPlantList = getUserPlantList('wo-'); //用户的工厂

// 接口URL
const api = {
  list: '/v1/wo/bill/list',
  detail: '/v1/wo/bill/detail',
  save: '/v1/wo/bill/save',
};

//默认数据
const defaultData = {
  params: {
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    case_id: undefined,//工单ID
    search: '',//搜索关键字
    status: undefined,//状态
    currentPage: 1,//当前页
    pageSize: 10,//每页多少条
  },
  detail: {
    title:'',
    remark:'',
    consumer_uids:'',
    money:0,
  },
  picker: {
    date: {
      defaultValue: dayjs().format('YYYY-MM-DD'),
      end: dayjs().format('YYYY-MM-DD'),
      mode: 'date',
      format: 'YYYY-MM-DD',
      showWeek: true,
    },
    datetime: {
      defaultValue: dayjs().format('YYYY-MM-DD HH:mm'),
      end: dayjs().format('YYYY-MM-DD HH:mm'),
      mode: 'minute',
      format: 'YYYY-MM-DD HH:mm',
      showWeek: true,
    }
  }
};


//页面数据
const vData = reactive({
  params: {...defaultData.params},
  action: 'list',
  list: [],
  refreshing: false,
  loading: false,
  msg: '',
  caseLabel: {status: []},
  billLabel: {},
});


//筛选器
const tabs = {
  bind: (field,labelType='bill') => {
    return {
      multiple: true,
      optionsColumns: 2,
      options: vData?.[labelType+'Label']?.[field] || userPlantList,
    };
  },
  change: (field, value) => {
    vData.params[field] = value;
    getList();
  },
};

//搜索器
const searcher = reactive({
  bind:{},
  on: {
    keydown: _.debounce((e) => getList(), 500),
    search: (e) => getList(),
    submit: (e) => getList(),
    clear: (e) => getList(),
  }
})

//列表
const listCell = {
  bind: (row) => {
    return {
      arrow: true,
      bordered: true,
      align: 'middle',
      note: '￥'+row.money,
    }
  },
  scroll: _.debounce((scrollBottom, scrollTop, e) => {
    console.log('listCell', scrollTop, scrollBottom, e);
    if (scrollBottom < 50) {
      getList('next');
    }
    goTop.scroll(scrollTop, 'main-list');
  }, 500),
  click: ({id}, e) => {
    form.open(id);
  },
};

const form = reactive({
  pickFields:['status', 'item', 'payer_uid','pay_at'],
  bind: {
    labelWidth: '120px',
    labelAlign: 'left',
    contentAlign: 'right',
    rules: {
      item: [{required: true, message: '类型必填', trigger: 'change'}],
      title: [{required: true, message: '明细必填', trigger: 'change'}],
      payer_uid: [{required: true, message: '付款人必填', trigger: 'change'}],
      money: [
        {required: true, message: '金额必填', trigger: 'change'},
        {type: 'number', min: 1, message: '金额必须>0', trigger: 'change'}
      ],
    }
  },
  data: {},
  viewData: {},
  on: {
    scroll: ({target}) => {
      goTop.scroll(target.scrollTop, target.id)
    },
    change: async (e) => {
      console.log('form-change', e);
    },
    submit: async (e) => {
      if (typeof e.firstError === 'string' && e.firstError.length > 0) {
        dialog.warning(e.firstError);
        return;
      }
     let res =await saveDetail(await form.format(form.data, true));
     res && form.close();
    }
  },
  format: async (formData, isSubmit = false) => {
    let data = {};
    for (let key in formData) {
      if(form.pickFields?.includes(key)){
        // picker类型的字段需要单独处理
        data[key]=isSubmit ? formData[key][0] : [formData[key]];
        isSubmit || (form.viewData[key]=await formPicker.getViewText(key, data[key]));
      }else{
        data[key] = formData[key];
      }
    }
    return data;
  },
  open: async (id,case_id) => {
    if(id===undefined){
      case_id===undefined && (case_id=vData.params.case_id);
      if(case_id===undefined){
        return dialog.warning('请选择工单');
      }
      let pickFieldsData={};
      form.pickFields.map((key)=>pickFieldsData[key]=[])
      form.data = {...defaultData.detail,...pickFieldsData,case_id};
    }else{
      form.data={...await form.format(await getDetail(id,{case_id}), false)};
    }
    vData.action = 'detail';
  },
  close: async (refresh = false) => {
    refresh && await getList('init');
    form.data = {...defaultData.detail};
    form.viewData = {};
    vData.action = 'list';
    goTop.scroll(0, 'main-list');
  },
});
//表单选择器
const formPicker = reactive({
  type: 'normal',
  value: [],
  labels: [],
  field: '',
  isShow: false,
  filter: {
    value: '',
    options: [], //过滤之前的选项,
    bind: {
      label: '筛选',
      placeholder: '',
      align: 'right',
    },
    isShow: () => {
      return formPicker.filter.value.length > 0 || (formPicker.type === 'normal'
          && formPicker.bind?.columns?.length === 1
          && formPicker.bind?.columns?.[0].length > 2)
    },
    on: {
      change: _.debounce((value) => {
        if (formPicker.filter.options.length === 0) {
          //保存过滤之前的选项
          formPicker.filter.options = _.cloneDeep(formPicker.bind?.columns[0]);
        }
        formPicker.bind['columns'][0] = formPicker.filter.options.filter((option) => {
          return option.label.includes(value);
        })
      }, 500),
    },
  },
  bind: {},
  on: {
    change: (value) => {
      console.log('change', value);
      // form.viewData[formPicker.field]='';
    },
    cancel: (e) => {
      console.log('cancel', e);
      formPicker.isShow = false;
    },
    confirm: (value, context) => {
      console.log('confirm', value, context);
      formPicker.isShow = false;
      form.data[formPicker.field] = value;
      form.viewData[formPicker.field] = context?.label.join(',') || value;
    },
    pick: (value, e2) => {
      console.log('pick', value, e2);
    },
  },
  open: async (field, type = 'normal', bind = {}) => {
    formPicker.field = field;
    formPicker.type = type;
    formPicker.bind = {...bind, ...defaultData.picker?.[type]};
    if (type === 'normal') {
      let res = formPicker.getOptions(field);
      formPicker.bind.columns = typeof res === 'function' ? await res() : res;
    }
    formPicker.value = form.data[field];
    formPicker.isShow = true;
    console.log('formPicker.open-field', field, type,formPicker.bind);
  },
  close: () => {
    formPicker.type = 'normal';
    formPicker.value = [];
    formPicker.field = '';
    formPicker.filter.value = '';
    formPicker.filter.options = [];
    formPicker.bind = {...defaultData.picker}
  },
  getOptions: (field) => {
    return {
      status: [[...[{label: '请选择'}], ...vData.billLabel?.status || []]],
      item: [[...[{label: '请选择'}], ...vData.billLabel?.item || []]],
      payer_uid: async () => {
        let options = await formPicker.getUserOptions(formPicker.filter.value);
        return [[...[{label: '请选择'}], ...options]];
      },
      consumer_uids: async () => {
        let options = await formPicker.getUserOptions(formPicker.filter.value);
        return [[...[{label: '请选择'}], ...options]];
      },
    }[field] || [];
  },
  getViewData: (field) => {
    return form.viewData?.[field] || '请选择';
  },
  getViewText: async (field, valueList) => {
    let options = await formPicker.getOptions(field);
    if (typeof options === 'function') {
      options = await options();
    }
    if (field.includes('_at')) {
      return valueList.map((value) => core.date.dateFormat(value, 'YYYY-MM-DD')).join(',');
    }
    let labels = [];
    for (const i in options) {
      for (let j in valueList) {
        let option = options[i].find(item => item.value === valueList[j]);
        labels.push(option?.label || '');
      }
    }
    return labels.join(',');
  },
  getUserOptions: async (searchValue) => {
    return await userSelector(searchValue, {showMore: 0});
  }
});

//页面按钮
const pageBtn=reactive({
  isShow: ()=>vData.params.case_id!==undefined || vData.action==='detail',
  icons:{list:AddIcon,detail:RollbackIcon},
  bind: {
    buttonProps: {
      theme: 'light',
      size: 'medium',
      style: {color: '#13151d',bottom:'100px'},
    },
    icon: () => h(pageBtn.icons[vData.action], {size: '20px', color: '#13151d'}),
    text: '',
    draggable:true,
  },
  on:{
    click: async () => {
      vData.action==='detail'?await form.close(false):await form.open();
    }
  },
});

//返回按钮
const backBtn=reactive({
  isShow: ()=>vData.action==='list' && vData.params.case_id!==undefined,
  bind: {
    buttonProps: {
      theme: 'light',
      size: 'medium',
      style: {color: '#13151d',bottom:'50px'},
    },
    icon: () => h(RollbackIcon, {size: '20px', color: '#13151d'}),
    text: '',
    draggable:true,
  },
  on:{
    click: async () => {
      navBack();
    }
  },
});

//回到底部
const goTop = reactive({
  targetId: '',
  isShow: false,
  bind: {
    buttonProps: {
      theme: 'light',
      size: 'small',
      style: {color: '#13151d',bottom:'10px'},
    },
    icon: () => h(BacktopIcon, {size: '18px', color: '#13151d'}),
    text: 'TOP',
    draggable:true,
  },
  on: {
    click: () => {
      document.getElementById(goTop.targetId).scrollTo({
        top: 0,
        behavior: 'smooth' // 使用平滑滚动效果
      });
    }
  },
  scroll: (scrollTop, targetId) => {
    // let logoDom = document.getElementsByClassName('siyi-logo')[0];
    // let rightDom = document.getElementsByClassName('siyi-right')[0];
    // logoDom.setAttribute('style', scrollTop === 0 ? 'display:grid' : 'display:none');
    // rightDom.setAttribute('style', scrollTop === 0 ? 'padding-top:40px' : 'padding-top:0px');
    goTop.isShow = scrollTop > 0;
    goTop.targetId = targetId;
  }
});

//搜索
const getList = async (type = 'init', params = {}) => {
  vData.action = 'list';
  if (type === 'next') {
    vData.params.currentPage += 1
  } else if (type === 'init') {
    vData.params.currentPage = 1
    vData.list = [];
  }
  vData.params = {...vData.params, ...params};
  if (vData.params.currentPage < 1) {
    return;
  }
  // vData.loading = true;
  vData.msg = '正在加载，请稍等！'
  let res = await http.get(api.list, {params: vData.params});
  // vData.loading = false;
  vData.refreshing = false;
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  vData.list = [...vData.list, ...res.data.data.list];
  vData.msg=vData.list.length>0?'':'没有更多数据了!';
  saveConfig(res.data.data.option);
  return res.data.data.list;
}

//获取详情
const getDetail = async (id,param) => {
  vData.loading=true;
  let res = await http.get(api.detail, {params: {id,...param}});
  vData.loading=false;
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  saveConfig(res.data.data?.option);
  return res.data.data.data[0];
}

//保存详情
const saveDetail = async (data) => {
  if(data.case_id===undefined){
    dialog.warning('请先选择工单');
    return;
  }
  let action = data.id === undefined ? 'add' : 'edit';
  vData.loading=true;
  let res = await http.post(api.save + "?action=" + action, {form:[data],case_id:data.case_id});
  vData.loading=false;
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  dialog.success('保存成功');
  return true;
}

//保存配置
const saveConfig =  (option) => {
  vData.caseLabel = getOptionsLabel(option?.case);
  vData.billLabel = getOptionsLabel(option?.bill)
}

// 首次挂载
onMounted(async () => {
})

// 页面显示时
onActivated(() => {
  const {case_id,action,plant_id} = getQuery(null,true);
  if(action!==undefined){
    vData.params={... vData.params,...{case_id,plant_id}};
    vData.action=action;
  }
  return getList('init');
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  vData.params=defaultData.params;
})

</script>


<style>
#main-form {
  textarea {
    text-align: right;
    font-family: "Arial", "Microsoft YaHei", "sans-serif";
  }
  .t-form__item {
    padding: 8px 16px !important
  }

  textarea:focus {
    text-align: left;
  }
}
</style>

<style scoped>
.siyi-wo-bill {
  width: 100%;
  height: 100%;
  position: absolute;

  .head-search {
    place-items: center;
    text-align: center;
  }

  #loader {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 9999;
    background-color: #fff;
    opacity: 0.9;
    padding-top: 50%
  }

  .t-pull-down-refresh {
    padding-bottom: 100px;
  }

  #main-list, #main-form {
    position: relative;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 100px;
  }

  #main-list {
    .t-cell {
      padding: 5px 16px;
    }
  }

  #main-form {
    .t-textarea {
      flex-grow: 1;
    }
    .pickerEntry {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.9);
    }

    .button-group {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 10px auto;
    }
  }
}
</style>