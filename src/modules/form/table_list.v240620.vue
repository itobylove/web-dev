<template>
  <div class="siyi-form-table-list">
    <vxe-grid ref="grid" v-bind="gridOptions" @cellDblclick="cellDblclick">
      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>
        <t-button variant="text" size="small" @click="editForm.add">
          <template #icon>
            <AddIcon />
          </template>
          添加
        </t-button>

        <vxe-select v-bind="listBtn.status.bind" v-on="listBtn.status.on" />


        <vxe-select v-model="vData.params.plant_id" placeholder="工厂" size="small" clearable class-name="search-select"
                    @change="searchList('init')" :options="plantList">
        </vxe-select>

        <vxe-select v-model="vData.params.tpl_id" placeholder="模板" size="small" clearable style="width: 150px"
                    @change="searchList('init')" :options="vData.tplLabel.id">
        </vxe-select>

        <vxe-select v-model="vData.params.status" placeholder="状态" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.status">
        </vxe-select>

        <vxe-select v-model="vData.params.uid" placeholder="创建人" size="small" clearable style="width: 100px"
                    @change="searchList('init')" :options="vData.listLabel.uid" />

        <!-- <t-button variant="text" size="small" @click="searchList('prev')">
                    <template #icon> <ChevronUpIcon /> </template> 上一页
              </t-button>
              <t-button variant="text" size="small" @click="searchList('next')">
                  <template #icon> <ChevronDownIcon /> </template> 下一页
              </t-button>
         -->

        <vxe-input type="search" v-model="vData.params.customer_code" placeholder="客户代码" @click="grid.clearSelected()"
                   @search-click="searchList" @keydown="searchList" clearable
                   style="width: 200px;margin:0 5px"></vxe-input>

        <vxe-input type="search" v-model="vData.params.search" placeholder="料号" @click="grid.clearSelected()"
                   @search-click="searchList" @keydown="searchList" clearable
                   style="width: 300px;margin:0 5px"></vxe-input>


        <vxe-button mode="text"  icon="vxe-icon-funnel-clear" @click="searchList('reset')" title="清空筛选"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-left" @click="searchList('prev')" title="上一页"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-refresh" @click="searchList('init')" title="刷新"></vxe-button>
        <vxe-button mode="text"  icon="vxe-icon-arrow-right" @click="searchList('next')" title="下一页"></vxe-button>

      </template>
      <template #empty>
                <span>
                    <img :src="noData">
                    <p>{{ vData.msg }}</p>
                </span>
      </template>

    </vxe-grid>


    <!-- 修改弹窗 -->
    <vxe-modal v-model="editForm.status.isShow" v-bind="editForm.option" v-on="editForm.on">
      <template #title>
        <t-button variant="text" size="small" @click="editForm.save">
          <template #icon>
            <EditIcon v-if="editForm.status.isReadonly"/>
            <SaveIcon v-else />
          </template>
          {{ editForm.status.editBtnName }}
        </t-button>
      </template>
      <template #default>
        <vxe-form ref="editFormRef" :rules="editForm.rules" :data="editForm.data" title-width="80" title-align="right">

          <vxe-form-item field="plant_id" title="工厂" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.plant_id" :disabled="editForm.status.isReadonly" :options="userPlantList">
              </vxe-radio-group>
            </template>
          </vxe-form-item>


          <vxe-form-item field="type" title="类型" span="24">
            <template #default="{ data }">
              <vxe-radio-group v-model="data.type" :disabled="editForm.status.isReadonly" :options="vData.tplLabel.type" />
            </template>
          </vxe-form-item>

          <vxe-form-item field="customer_code" title="客户代码" span="24" >
            <template #default="{ data }">
              <vxe-input clearable v-model="editForm.data.customer_code" :readonly="editForm.status.isReadonly"/>
            </template>
          </vxe-form-item>

          <vxe-form-item field="job_sn" title="本厂型号" span="24" v-show="editForm.data.type==='report_chbg'">
            <template #default="{ data }">
              <vxe-select v-model="data.job_sn" placeholder="请输入本厂型号" clearable filterable remote
                          :remoteMethod="editForm.jobSelector"
                          @change="editForm.jobChange"
              >
                <vxe-option v-for="(option) in  vData.job_option_list" :label="option.label" :value="option.label"/>
              </vxe-select>
            </template>
          </vxe-form-item>




<!--          <vxe-form-item field="job_sn" title="型号" span="24" v-show="editForm.data.type==='report_chbg'">-->
<!--            <template #default="{ data }">-->
<!--              <vxe-input clearable placeholder="带版本的" v-model="data.job_sn" @change="getTplList"-->
<!--                       :readonly="editForm.status.isReadonly"/>-->
<!--            </template>-->
<!--          </vxe-form-item>-->




          <vxe-form-item field="tpl_id" title="模板" span="24">
            <template #default="{ data }">
              <vxe-select v-model="data.tpl_id" placeholder="请选择" @focus="getTplList">
                <vxe-option v-for="(tpl,i) in vData.tplList" :key="i" :value="tpl?.id" :label="tpl?.file_data?.name+'('+tpl.customer_code+')'"></vxe-option>
              </vxe-select>
            </template>
          </vxe-form-item>


          <vxe-form-item field="job_date" title="周期" span="24">
            <template #default="{ data }">
              <vxe-input clearable v-model="editForm.data.job_date" @change="editFormRef.validate()" />
            </template>
          </vxe-form-item>


          <vxe-form-item field="remark" title="备注" span="24">
            <template #default="{ data }">
              <vxe-input clearable v-model="editForm.data.remark"  :readonly="editForm.status.isReadonly"/>
            </template>
          </vxe-form-item>



        </vxe-form>
      </template>
    </vxe-modal>


  </div>
</template>

<script setup>
import {reactive, ref, onActivated, onDeactivated} from "vue"
import siyi from '@/core/script/siyi.js'
import * as core from "@/core/script/core"
import noData from '@/core/assets/img/nodata.gif'
import {to as navTo,getQuery} from "@/core/script/nav"
import {getPlant, parseJobSn, plantList, getUserPlantList} from '@/utils/erp.js'
import _ from "lodash";
import {gridOptions as gridOptionsDefault} from "@/config/vxeTable.js";
import {getCurrentPage, http, jobSelector,url as apiUrl} from "@/core/script/api.js";
import {VxeUI} from "vxe-pc-ui";
import {AddIcon, EditIcon, SaveIcon} from "tdesign-icons-vue-next";
import {getOptionsLabel, isEmpty, parseNumber} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";

//用户的工厂
const userPlantList = getUserPlantList('form-');

// onShow
onActivated(() => {
  let detailId=getQuery('detailId',false) || localStorage.getItem('form_table_id');
  detailId=parseNumber(detailId,null);
  if(typeof detailId==='number' && detailId>1){
    navTo('form_table_detail_v240620', {id: detailId});
    return ;
  }
  searchList()
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})

// 接口URL
const _apiUrl = apiUrl.form.table;


const defaultData={
  params:{
    plant_id: userPlantList?.[0]?.['value'] || '', //工厂ID
    search: '',//客户代码
    status: undefined,//状态
    currentPage: 1,//当前页
    pageSize: 50,//每页多少条
    uid:'',
  },
  uid_list:[{label:"所有人",value:""},{label:siyi.user.nickname,value:siyi.user.id}],
};

const vData=reactive({
  msg:'请搜索',
  tplList:[],
  params:{...defaultData.params},
  statusAction:'',
  list:[],
  listOption: {id:[],type:[]},
  listLabel: {uid:[],status:[]},
  tplOption: {},
  tplLabel: {},
});

const grid = ref()
// 列表项
const columns = [
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '工厂', width: 80, field: 'plant_id', sortable: true,formatter:({row})=>{return getPlant(row.plant_id)}},
  {title: '类型', width: 100, field: '_text.tpl_type', sortable: true},
  {title: '客户代码', width: 100, field: 'customer_code', sortable: true},
  {title: '型号', width: 166, field: 'job_sn', sortable: true},
  {title: '周期', width: 80, field: 'job_date', sortable: true},
  {title: '模板', width: 150, field: 'file_data.name', sortable: true,visible:true},
  {title: '模板文件', width: 200, field:'file_data.name',sortable: true,type:'html',visible:false,formatter:({row})=>{
      let link=row?.file_data?.url || row.file_data?.path;
      let name =row?.file_data?.name || '';
      return `<a title="${link}" class="link" href="${link}" target="_blank">${name}</a>`;
    }
  },
  {title: '状态', width: 80, field: '_text.status', sortable: true},
  {title: '文件', width: 120, field: 'export_data.excel', sortable: true,type:'html',formatter:({row})=>{
    let excel_url=row?.export_data?.xlsx || '';
    let pdf_url=row?.export_data?.pdf || '';
    let excel_html= excel_url?`<a title="${excel_url}" class="link" href="${excel_url}" target="_blank">${excel_url?'excel':''}</a>`:'';
    let pdf_html= pdf_url?`<a title="${pdf_url}" class="link" href="${pdf_url}" target="_blank">${pdf_url?'pdf':''}</a>`:'';
    return excel_html+pdf_html;
  }},
  {title: '创建人', width: 80, field: '_text.created_uid', sortable: true},
  {title: '创建时间', minWidth: 140, field: 'created_at', sortable: true, formatter: core.date.formatterYMDHms},
  {title: '更新人', width: 80, field: '_text.updated_uid', sortable: true},
  {title: '更新时间', minWidth: 140, field: 'updated_at', sortable: true, formatter: core.date.formatterYMDHms},
  {title: '模板ID', width: 80, field: 'tpl_id', sortable: true,visible:false},
  {title: 'ID', width: 60, field: 'id', sortable: true},
];

//表格配置
const gridOptions = reactive({
  ...gridOptionsDefault,
  id: 'siyi-form-table-list', //ID
  seqConfig: {
    seqMethod: ({ rowIndex }) => vData.params.pageSize * (vData.params.currentPage - 1) + rowIndex + 1
  },
  columns: columns,
  data:[],
})

const cellDblclick = ({row, column}) => {
  navTo('form_table_detail_v240620', {id: row['id']});
}


// 修改状态
const updateStatus = async (id, status) => {
  let confirm= await VxeUI.modal.confirm({content: '确认操作？',});
  if(confirm!=='confirm'){
    return ;
  }
  http.post(_apiUrl.status, {id: id, status: status}).then((res) => {
    dialog.info(res.data.message)
    searchList()
  })
}


const editFormRef=ref();
const editForm = reactive({
  rules:{
    plant_id: [{ required: true, message: '请选择工厂' }],
    type: [{ required: true, message: '请选择类型' }],
    job_sn: [{ required: true, message: '请输入型号' },{pattern:/^[0-9A-Z]{19}$/,message:"型号格式不正确"}],
    customer_code: [{ required: true, message: '请填写客户代码' },{pattern:/^[0-9]{4}$/,message:"请输入4位数字"}],
    tpl_id: [{ required: true, message: '请选择模板' }],
    job_date: [{ required: true, message: '请输入周期' },{pattern:/^[0-9]{4}$/,message:"请输入4位数字"}],
  },
  defaultData:{
    plant_id: vData.params.plant_id,
    customer_code: '',
    status:0,
    type:'',
    job_date:'',
  },
  data:{},
  option: {
    size: "mini",
    width: 600,
    position: {top: '10%'},
    loading: false,
    resize: 'resize',
    height: 500,
  },
  status: {
    isReadonly: true,
    isShow: false,
    editBtnName: '添加',
    editBtnIcon: 'edit',
  },
  add:()=>{
    editForm.status.isShow=true;
    editForm.status.isReadonly=false;
    editForm.data ={...editForm.defaultData};//重置数据
  },
  save: async () => {
    if (editForm.status.isReadonly) {
      editForm.status.isReadonly = false;
      editForm.status.editBtnName = "保存";
      editForm.status.editBtnIcon = "save";
      return
    }
   if(await editFormRef.value.validate()!==undefined){
     return ;
   }
    editForm.option.loading = true
    let res= await http.post(_apiUrl.edit, editForm.data);
    editForm.option.loading = false
    let id = res.data?.data?.id || 0;
    if (res.data.code !== 20000) {
      dialog.info(res.data.message)
      return ;
    }
    editForm.status.isShow = false
    editForm.status.isReadonly = true;
    editForm.data ={...editForm.defaultData};//重置数据
    navTo('form_table_detail_v240620', {id: id});
  },
  jobChange: ({value}, e) => {
   getTplList();
    setTimeout(() => {
      vData.job_option_list = []
    }, 1000);
  },
  jobSelector: async ({searchValue}) => {
    vData.job_option_list = searchValue ? await jobSelector(searchValue,{customer_code:editForm.data.customer_code}) : [];
    vData.job_option_list.map(item=>item.value=item.value.replace('_',''));
  },
  on: {
    close: (event) => {
      editForm.status.isReadonly = true
      editForm.data = Object.assign(reactive({}), editForm.defaultData);//重置数据
    },
    show: (e) => {
      // const modalTop = e.$modal.getPosition().top;
      // editForm.option.height = ((window.innerHeight - modalTop * 2)) + 'px';//自动高度
    }
  }
});

const listBtn=reactive({
  status: {
    bind: {
      modelValue: vData.statusAction,
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
      await  updateStatus(grid.value.getCheckboxRecords().map((item) => item.id), value)
      }
    },
  }
})

const getTplList=async ()=>{
  const {plantId,customerCode,partNum,partRev}=parseJobSn(editForm.data.job_sn);
  if(!plantId || !partNum || !partRev){
    dialog.info('请输入完整型号+版本号');
    return ;
  }
  let query={
    plant_id:editForm.data.plant_id,
    type:editForm.data.type,
  }
  let res = await http.get(_apiUrl.tpl, {params:query});
  if (res.data.code !== 20000) {
    dialog.info(res.data.message);
    return ;
  }
  if(res.data.data?.list?.length<1){
    dialog.info('无可用模板,请先添加模板！');
    return ;
  }
  vData.tplList=_.cloneDeep(res.data.data.list).filter(tpl=>{
    tpl.customer_code=isEmpty(tpl.customer_code)?'':tpl.customer_code.toString();
    return ['0','',' '].includes(tpl.customer_code) || tpl.customer_code.split(' ').filter(code=>customerCode.indexOf(code)>=0).length>0;
  })
  if( vData.tplList.length===1){
    editForm.data.tpl_id=vData.tplList[0].id;
  }
  if(customerCode){
    editForm.data.customer_code=customerCode;
  }
  editFormRef.value.validate();
};

//搜索
const searchList = async (type = 'init',param={}) => {
  vData.params=type==='reset'?
      {...defaultData.params}:
      {...vData.params,...param, currentPage:getCurrentPage(type,vData.params,gridOptions.data.length)};
  vData.msg = '正在搜索数据，请稍等！'
  gridOptions.data = []
  let res= await http.get(_apiUrl.list, {params: vData.params});
  vData.msg = '没有搜索到数据！'
  if (res.data.code === 20000) {
    gridOptions.data=vData.list = _.cloneDeep(res.data.data.list);
  } else {
    dialog.error(res.data.message)
  }
  vData.listOption = res.data.data?.option?.list || {};
  vData.listLabel =  getOptionsLabel(vData.listOption);
  vData.listLabel.uid=_.unionBy([],defaultData.uid_list,vData.listLabel.uid,'value');

  vData.tplOption = res.data.data?.option?.tpl || {};
  vData.tplLabel =  getOptionsLabel(vData.tplOption);
  editForm.defaultData.type=Object.keys(vData.tplOption?.type)?.[0];
}


</script>

<style>
.siyi-form-table-list {
  width: 100%;
  height: 100%;
  position: absolute;

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .search-select {
    width: 100px;
  }
  .link{
    color:#409eff;
    margin-right: 10px;
  }

}
</style>