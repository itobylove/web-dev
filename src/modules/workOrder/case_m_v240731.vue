<template>
  <div class="siyi-wo-case">

    <t-dropdown-menu class="head-filter" v-if="vData.action==='list'">
      <t-dropdown-item label="工厂" v-bind="tabs.bind('plant_id')" @change="(value)=>tabs.change('plant_id',value)"/>
      <t-dropdown-item label="状态" v-bind="tabs.bind('status')" @change="(value)=>tabs.change('status',value)"/>
      <t-dropdown-item label="类型" v-bind="tabs.bind('process_type')"
                       @change="(value)=>tabs.change('process_type',value)"/>
      <t-dropdown-item label="进度" v-bind="tabs.bind('process_step')"
                       @change="(value)=>tabs.change('process_step',value)"/>
    </t-dropdown-menu>

    <t-row class="head-search" v-if="vData.action==='list'">
      <t-col span="16" class="light">
        <t-search v-model="vData.params.search" v-bind="searcher.bind" v-on="searcher.on"></t-search>
      </t-col>
      <t-col span="4" class="light">
        只看我
      </t-col>
      <t-col span="4" class="light">
        <t-switch v-model="vData.params.only_myself" @change="()=>getList('init')"></t-switch>
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
              <p>{{ "生产型号：" + item.job_sn}}</p>
              <p>{{ "周期：" + item['job_date'] }}</p>
              <p>{{ "类型：" + item['_text']['process_type'] }}</p>
              <p>{{ "进度：" + item['_text']['process_step'] }}</p>
              <p>{{ "状态：" + item['_text']['status'] }}</p>
              <p>{{ "时间：" + item['_text']['created_at'] }}</p>
            </template>

            <template #note>
              <div class="list-btn">
                <t-button size="small" theme="success" @click="listCell.btnClick(item,$event,'bill_view')">查看费用</t-button>
              </div>
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

      <t-form-item label="接诉工厂" name="plant_id" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('plant_id')">{{ formPicker.getViewData('plant_id') }}<ChevronRightIcon/> </span>
      </t-form-item>

      <t-form-item label="制造工厂" name="plant_id2" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('plant_id2')">{{ formPicker.getViewData('plant_id2') }}<ChevronRightIcon/> </span>
      </t-form-item>


      <t-form-item label="生产型号" name="job_sn" contentAlign="right">
        <t-input borderless v-model="form.data.job_sn" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="客户代码" name="customer_code" contentAlign="right">
        <t-input borderless v-model="form.data.customer_code" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="周期" name="job_date" contentAlign="right">
        <t-input borderless v-model="form.data.job_date" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="送货单号" name="delivery_sn" contentAlign="right">
        <t-input borderless v-model="form.data.delivery_sn" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="ERP客诉单号" name="erp_case_sn" contentAlign="right">
        <t-input borderless v-model="form.data.erp_case_sn" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="销售单号" name="sale_sn" contentAlign="right">
        <t-input borderless v-model="form.data.sale_sn" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>


      <t-form-item label="工单类型" name="type" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('type')">{{ formPicker.getViewData('type') }}<ChevronRightIcon/> </span>
      </t-form-item>

      <t-form-item label="标题" name="title" contentAlign="right">
        <t-input borderless v-model="form.data.title" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="客诉详情" name="detail" contentAlign="right">
        <t-textarea v-model="form.data.detail" align="right" autosize></t-textarea>
      </t-form-item>

      <t-form-item label="客户联系人" name="feedback_user" contentAlign="right">
        <t-input borderless v-model="form.data.feedback_user" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="客诉时间" name="feedback_at" contentAlign="right">
        <span class="pickerEntry"
              @click="formPicker.open('feedback_at','date')">{{ formPicker.getViewData('feedback_at') }}<ChevronRightIcon/> </span>
      </t-form-item>


      <t-form-item label="客服专员" name="receive_uid" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('receive_uid')">{{ formPicker.getViewData('receive_uid') }}<ChevronRightIcon/> </span>
      </t-form-item>


      <t-form-item label="备注" name="remark" contentAlign="right">
        <t-input borderless v-model="form.data.remark" align="right" placeholder="请输入内容"></t-input>
      </t-form-item>

      <t-form-item label="状态" name="status" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('status')">{{ formPicker.getViewData('status') }}<ChevronRightIcon/> </span>
      </t-form-item>

      <t-form-item label="处理方式" name="process_type" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('process_type')">{{ formPicker.getViewData('process_type') }}<ChevronRightIcon/> </span>
      </t-form-item>

      <t-form-item label="处理进度" name="process_step" contentAlign="right">
        <span class="pickerEntry" @click="formPicker.open('process_step')">{{ formPicker.getViewData('process_step') }}<ChevronRightIcon/> </span>
      </t-form-item>

<!--      <t-form-item label="售后专员" name="process_uids" contentAlign="right">-->
<!--        <t-input borderless v-model="form.data.process_uids" align="right" placeholder="请输入内容"></t-input>-->
<!--      </t-form-item>-->

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
    <t-fab v-show="goTop.isShow" v-bind="goTop.bind" v-on="goTop.on"/>
    <t-fab v-show="pageBtn.isShow" v-bind="pageBtn.bind" v-on="pageBtn.on"/>
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
import {to as navTo} from "@/core/script/nav"
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

const userPlantList = getUserPlantList('wo-'); //用户的工厂

// 接口URL
const api = {
  list: '/v1/wo/case/list',
  detail: '/v1/wo/case/detail',
  save: '/v1/wo/case/save',
};

//默认数据
const defaultData = {
  params: {
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    search: '',//搜索关键字
    status: undefined,//状态
    process_type: undefined,//处理方式
    currentPage: 1,//当前页
    pageSize: 10,//每页多少条
    only_myself:true,
  },
  detail: {
    job_sn: '',
    customer_code: '',
    job_date: '',
    delivery_sn: '',
    erp_case_sn: '',
    sale_sn: '',
    title: '',
    detail: '',
    feedback_user: '',
    feedback_at: '',
    remark: '',
    process_res: '',
    files: [],
    process_uids: [],

    plant_id: [],
    plant_id2: [],
    status: [],
    type: [],
    receive_uid: [],
    process_type: [],
    process_step: [],
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
  caseLabel: {},
  billLabel: {},
});


//筛选器
const tabs = {
  bind: (field,labelType='case') => {
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
      arrow: false,
      bordered: true,
      align: 'middle',
    }
  },
  scroll: _.debounce((scrollBottom, scrollTop, e) => {
    if (scrollBottom < 50) {
      getList('next');
    }
    goTop.scroll(scrollTop, 'main-list');
  }, 500),
  click: ({id}, e) => {
    form.open(id);
    console.log(2);
  },
  btnClick:(row,e,name)=>{
    if(name==='bill_view') showBillList(row);
    e.stopPropagation();
  }
};

const form = reactive({
  pickFields:['plant_id', 'plant_id2', 'status', 'type', 'receive_uid', 'process_type', 'process_step','feedback_at'],
  bind: {
    labelWidth: '120px',
    labelAlign: 'left',
    contentAlign: 'right',
    rules: {
      plant_id: [{required: true, message: '请选择工厂'}],
      type: [{required: true, message: '请选择类型'}],
      job_sn: [{required: true, message: '请填写生产型号'}],
      delivery_sn: [{required: true, message: '请填写送货单号'}],
      customer_code: [{required: true, message: '请填写客户代码'}],
      job_date: [{required: true, message: '请填写周期'}],
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
      await saveDetail(await form.format(form.data, true));
      form.close();
    }
  },
  format: async (formData, isSubmit = false) => {
    let data = {};
      // picker类型的字段需要单独处理
    for (let key in formData) {
      let isPicker = form.pickFields?.includes(key);
      data[key]=isPicker?(isSubmit?formData[key][0]:[formData[key]]):formData[key];
      if(!isSubmit && isPicker) form.viewData[key]=await formPicker.getViewText(key,data[key]);
    }
    return data;
  },
  open: async (id,case_id) => {
    if(id===undefined){
      let pickFieldsData={};
      form.pickFields.map((key)=>pickFieldsData[key]=[])
      form.data = {...defaultData.detail,...pickFieldsData};
    }else{
      form.data=await form.format(await getDetail(id,{case_id}), false);
    }
    vData.action = 'detail';
  },
  close: async (refresh=false) => {
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
    console.log('formPicker.open-field', field, type);
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
      plant_id: [[...[{label: '请选择'}], ...userPlantList]],
      plant_id2: [[...[{label: '请选择'}], ...userPlantList]],
      status: [[...[{label: '请选择'}], ...vData.caseLabel?.status || []]],
      type: [[...[{label: '请选择'}], ...vData.caseLabel?.type || []]],
      process_type: [[...[{label: '请选择'}], ...vData.caseLabel?.process_type || []]],
      process_step: [[...[{label: '请选择'}], ...vData.caseLabel?.process_step || []]],
      receive_uid: async () => {
        let options = await formPicker.getUserOptions(formPicker.filter.value);
        return [[...[{label: '请选择'}], ...options]];
      },
    }?.[field] || [];
  },
  getViewData:(field)=>{
    return form.viewData?.[field] || '请选择';
  },
  getViewText: async (field,valueList) => {
    let options = await formPicker.getOptions(field);
    if(typeof options==='function'){
      options=await options();
    }
    if (field.includes('_at')) {
      return valueList.map((value) =>core.date.dateFormat(value, 'YYYY-MM-DD')).join(',');
    }
    let labels = [];
    for (const i in options) {
      for(let j in valueList){
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
  isShow: true,
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

//回到底部
const goTop = reactive({
  targetId: '',
  isShow: false,
  bind: {
    buttonProps: {
      theme: 'light',
      size: 'small',
      style: {color: '#13151d',bottom:'40px'},
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

const showBillList=(row)=>{
  navTo('wo_bill_v240802',{
        plant_id:parseInt(row.plant_id),
        case_id:row.id,
        action:'list',
      }
  );
}


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
const getDetail = async (id) => {
  vData.loading=true;
  let res = await http.get(api.detail, {params: {id}});
  vData.loading=false;
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  saveConfig(res.data.data?.option);
  return res.data.data.data;
}

//保存详情
const saveDetail = async (post) => {
  vData.loading=true;
  let action = post.id === undefined ? 'add' : 'edit';
  let res = await http.post(api.save + "?action=" + action, post);
  vData.loading=false;
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  dialog.success('保存成功');
}

//保存配置
const saveConfig = (option) => {
  vData.caseLabel = getOptionsLabel(option?.case);
  vData.billLabel = getOptionsLabel(option?.bill);
}

// 首次挂载
onMounted(async () => {
  await getList()
})

// 页面显示时
onActivated(() => {

})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})

</script>


<style>
#main-form {
  .t-form__item {
    padding: 8px 16px !important
  }
  textarea{
    text-align: right ;
    font-family: "Arial","Microsoft YaHei","sans-serif";
  }
  textarea:focus{
    text-align: left ;
  }

}
</style>

<style scoped>
.siyi-wo-case {
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
    .t-cell__description{
      line-break: anywhere;
    }

    .list-btn{
      z-index: 999;
      display: flex;
      flex-direction: column;
      button{
        margin: 5px;
      }
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