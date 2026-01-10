<template>
  <div class="siyi-form-tpl-list">

    <vxe-grid ref="grid" v-bind="gridOptions" @cellDblclick="cellDblclick" @cellClick="cellClick">

      <!-- 列表筛选条件 -->
      <template #toolbar_buttons>
        <t-button variant="text" size="small" @click="addClick" >
          <template #icon>
            <AddIcon />
          </template>
          添加
        </t-button>

        <t-popconfirm content="确定要复制吗?" theme="default" @confirm="doCopy">
          <t-button variant="text" size="small">
            <template #icon><CopyIcon /></template>复制
          </t-button>
        </t-popconfirm>

        <t-popconfirm :content="'确认把状态改为'+status_text+'吗?'" theme="danger"
                      @confirm="onStatusEdit(status_value)"
                      v-for="(status_text,status_value) in apiData.config?.status?.option"
        >
          <t-button variant="text" size="small">
            <template #icon><PlayCircleIcon /></template>{{status_text}}
          </t-button>
        </t-popconfirm>


        <t-button variant="text" size="small" @click="searchList('init')">
          <template #icon><RefreshIcon /></template>刷新
        </t-button>

        <vxe-select v-model="params.plant_id" placeholder="工厂" size="small" clearable class-name="search-select"
                    @change="searchList('init')" :options="userPlantList">
        </vxe-select>

        <vxe-select v-model="params.status" placeholder="状态" size="small" clearable class-name="search-select"
                    @change="searchList('init')">
          <vxe-option value="" label="全部"></vxe-option>
          <vxe-option :value="value" :label="label" v-for="(label,value) in apiData.config?.status.option"></vxe-option>
        </vxe-select>

        <!-- <t-button variant="text" size="small" @click="searchList('prev')">
                    <template #icon> <ChevronUpIcon /> </template> 上一页
              </t-button>
              <t-button variant="text" size="small" @click="searchList('next')">
                  <template #icon> <ChevronDownIcon /> </template> 下一页
              </t-button>
         -->

        <vxe-input type="search" v-model="params.customer_code" placeholder="客户代码" @click="grid.clearSelected()"
                   @search-click="searchList" @keydown="searchList" clearable
                   style="width: 200px;margin:0 5px"></vxe-input>

        <vxe-input type="search" v-model="params.search" placeholder="" @click="grid.clearSelected()"
                   @search-click="searchList" @keydown="searchList" clearable
                   style="width: 500px;margin:0 5px"></vxe-input>

      </template>
      <template #empty>
                <span>
                    <img :src="noData">
                    <p>{{ vData.msg }}</p>
                </span>
      </template>

    </vxe-grid>

  </div>
</template>

<script setup>
import {onActivated, onDeactivated, reactive, ref} from "vue"
import * as core from "@/core/script/core"
import noData from '@/core/assets/img/nodata.gif'
import {to as navTo} from "@/core/script/nav"
import {getPlant, getUserPlantList} from '@/utils/erp.js'
import _ from "lodash";
import {AddIcon, CopyIcon, PlayCircleIcon, RefreshIcon} from "tdesign-icons-vue-next";
import {http, url as apiUrl} from "@/core/script/api.js";
import dialog from "@/core/script/dialog.js";

//用户的工厂
const userPlantList = getUserPlantList('form-');

// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => {
  searchList()
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})
// 接口URL
const _apiUrl = apiUrl.form.tpl;

const apiData=ref({list:[],config:{status:{option:[]}}});

// 搜索筛选条件
const params = reactive({
  plant_id: userPlantList[0] ? userPlantList[0]['value'] : '', //工厂ID
  search: '',//客户代码
  status: undefined,//状态
  currentPage: 1,//当前页
  pageSize: 50,//每页多少条
})

const vData=reactive({
  msg:'',
});

const grid = ref()
// 列表项
const columns = [
  {title: '', width: 46, type: 'checkbox', sortable: true},
  {title: '序号', width: 46, type: 'seq', sortable: true},
  {title: '工厂', width: 150, field: 'plant_id', sortable: true,formatter:({row})=>{return getPlant(row.plant_id)}},
  {title: '类型', width: 150, field: '_text.type', sortable: true},
  {title: '分组', width: 80, field: 'group_name', sortable: true},
  {title: '标题', width: 200, field: 'title', sortable: true,visible:false},
  {title: '客户代码', width: 120, field: 'customer_code', sortable: true},
  {title: '模板文件', width: 300, field:'file_data.name',sortable: true,type:'html',formatter:({row})=>{
      let link=row?.file_data?.url || row.file_data?.path;
      let name =row?.file_data?.name || '';
      return `<a title="${link}" class="link" href="${link}" target="_blank">${name}</a>`;
    }
  },
  {title: '备注', width: 300, field: 'remark', sortable: true},
  {title: '版本', width: 80, field: 'version', sortable: true},
  {title: '状态', width: 80, field: '_text.status', sortable: true},
  {title: '创建人', width: 80, field: '_text.created_uid', sortable: true},
  {title: '创建时间', minWidth: 160, field: 'created_at', sortable: true, formatter: core.date.formatterYMDHms},
  {title: '更新人', width: 80, field: '_text.updated_uid', sortable: true},
  {title: '更新时间', minWidth: 160, field: 'updated_at', sortable: true, formatter: core.date.formatterYMDHms},
  {title: 'ID', width: 60, field: 'id', sortable: true},
];

//表格配置
const gridOptions = reactive({
  id: 'packingSlipConfig',//ID
  size: 'mini', //大小
  height: 'auto', //高度
  border: true, //边框
  stripe: true, //斑马线条纹
  align: 'center', //对齐
  showOverflow: true, //当内容过长时显示为省略号
  showHeaderOverflow: true, //当表头内容过长时显示为省略号
  // showFooter: showFooter,
  // footerMethod: () => footerData,
  columnConfig: {
    // isHover: true,
    resizable: true,
    useKey: true,
  },
  customConfig: {
    storage: {
      visible: true,
      resizable: true,
      fixed: true,
    }
  },
  rowConfig: {
    useKey: true,
    isHover: true,
    // height: 30
  },
  sortConfig: {
    trigger: 'cell',
  },
  scrollY: {
    enabled: true,//横向虚拟滚动配置（不支持展开行）
  },
  scrollX: {
    enabled: true,//纵向虚拟滚动配置（不支持展开行）
  },
  mouseConfig: {
    selected: true, //鼠标选中单元格
  },
  keyboardConfig: {
    isArrow: true, //启用键盘事件
    isEnter: true, //回车键
    isTab: true, //TAB键
    enterToTab: true, //回车键转TAB键
  },
  toolbarConfig: {
    slots: {
      buttons: 'toolbar_buttons'
    },
    zoom: true,
    custom: true,
  },
  seqConfig: {
    seqMethod: ({rowIndex}) => params.pageSize * (params.currentPage - 1) + rowIndex + 1
  },
  columns: columns
})

//添加操作
const addClick=()=>{
  navTo('form_tpl_detail_v240620', {plant_id:params.plant_id});
}


//点击时，选中行
const cellClick=(e)=>{
  console.log('cellClick',e);
  const isChecked=grid.value.isCheckedByCheckboxRow(e.row);
  grid.value.setCheckboxRow(e.row,!isChecked);
};

//双击时，打开详情页
const cellDblclick=({row,column})=>{
  // if(column.field==='customerName' || column.field==='customerCode'){
  // }
  navTo('form_tpl_detail_v240620', {id:row['id']});
}
//批量操作
const onStatusEdit = (nextStatus) => {
  const checkedRows = grid.value.getCheckboxRecords();
  if (checkedRows.length === 0) {
    dialog.info('请选择要操作的数据！')
    return
  }
  const ids = checkedRows.map((item) => item.id)
  updateStatus(ids, nextStatus)
}

// 修改状态
const updateStatus = (id, status) => {
  http.post(_apiUrl.status, {id: id, status: status}).then((res) => {
    dialog.info(res.data.message)
    searchList()
  })
}

const doCopy = async () => {
  const checkedRows = grid.value.getCheckboxRecords();
  if (checkedRows.length !== 1) {
    dialog.error('请选择一条数据！')
    return
  }
  const id = checkedRows.map((item) => item.id)?.[0];
  const result = await http.get(_apiUrl.copy, {params: {id}});
  if (result.data.code !== 20000) {
    dialog.error(result.data.message);
    return ;
  }
   dialog.success(result.data.message);
}

//搜索
const searchList =async (type = 'init') => {
  if (type === 'prev' && params.currentPage > 1) {
    params.currentPage -= 1
  } else if (type === 'next' && gridOptions.data.length === params.pageSize) {
    params.currentPage += 1
  } else if (
      type === 'init' ||
      type?.$event?.type === 'click' ||
      type?.$event?.type === 'keydown' && type?.$event?.keyCode === 13
  ) {
    params.currentPage = 1
  } else {
    // return
  }
  gridOptions.data = []
  vData.msg='加载中。。。';
  let res= await http.get(_apiUrl.list, {params});
  vData.msg='';
  if (res.data.code === 20000) {
    apiData.value= {...res.data.data};
    gridOptions.data = [...apiData.value.list];
  } else {
       dialog.error(res.data.message)
  }

}

</script>

<style>
.siyi-form-tpl-list {
  width: 100%;
  height: 100%;
  position: absolute;
  & .siyi-leftHide {
    margin-left: 162px;
  }
  .search-select {
    width: 100px;
  }

}
</style>