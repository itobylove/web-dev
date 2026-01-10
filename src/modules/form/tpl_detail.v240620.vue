<template>
  <div class="siyi-form-tpl-detail">

    <div class="row top">
      <div class="top-left">
        <div class="head1">
          <t-tabs :default-value="vData.itemQuery.sheet_index" @change="(value)=>{getTplItems({sheet_index:value})}">
            <t-tab-panel value="all" label="全部"></t-tab-panel>
            <t-tab-panel value="start" label="必填"></t-tab-panel>
            <t-tab-panel :value="index" :label="type" v-for="(type,index) in vData.tplDetail.sheet_data" >
            </t-tab-panel>
          </t-tabs>
          <div class="filter">
          </div>
        </div>

        <div class="head2">
          <t-tabs :value="vData.itemQuery.type"  @change="(value)=>{getTplItems({type:value})}" :drag-sort="true" @drag-sort="onDragend">
            <t-tab-panel value="all" label="全部"></t-tab-panel>
            <t-tab-panel :value="index" :label="type" :draggable="true" v-for="(type,index) in vData.typeList" >
            </t-tab-panel>
          </t-tabs>
          <div class="filter">
            <t-input v-model="vData.itemQuery.search" @change="tplItemsFilter"  placeholder=""></t-input>
            <t-button theme="warning" variant="base" @click="openImport" v-show="vData.itemQuery.sheet_index!=='all'"> 添加 </t-button>
            <t-button theme="primary" variant="base" @click="tplItemsFilter"> 筛选</t-button>

            <t-button :theme="vData.isMulti?'primary':'default'" variant="base" @click="isMultiOn" style="margin:0 10px"> 多选 </t-button>
            <t-button theme="success" variant="base" @click="itemSet({status:1})"> 启用 </t-button>
            <t-button theme="warning" variant="base" @click="itemSet({status:0})"> 停用 </t-button>
            <t-button theme="danger" variant="base" @click="itemSet({status:-1})"> 删除 </t-button>
          </div>
        </div>
      </div>

      <div class="top-right">


          <div style="height: 32px;line-height: 50px" class="w3">
            <t-input-adornment prepend="客户代码："  >
              <t-input placeholder="请输入"  style="width: 100px" v-model="vData.tplDetail.customer_code"></t-input>
            </t-input-adornment>
          </div>

          <t-select class="w3" v-model="vData.tplDetail.plant_id" :disabled="vData.tplDetail.id>0" label="工厂：" :options="userPlantList" placeholder="请选择" auto-width clearable >
          </t-select>

          <t-select class="w3" v-model="vData.tplDetail.status" label="状态：" placeholder="请选择" auto-width clearable >
            <t-option key="0" :value="0" label="停用"></t-option>
            <t-option key="1" :value="1" label="启用"></t-option>
          </t-select>

          <t-upload v-model="vData.files" v-bind="uploader.option" v-on="uploader.event"/>

          <t-button theme="success" variant="base" @click="tplDetailEdit" style="margin: 0 10px">{{vData.tplDetail.id >0 ?'保存':'添加'}} </t-button>
          <t-button theme="default" variant="base" @click="tplImport">解析 </t-button>

        </div>
      </div>

    <div class="row main">

      <div class="aside">
          <t-collapse class="parameterGroupList" :expand-icon="true"  :defaultExpandAll="true" :borderless="false" @change="">
            <t-collapse-panel  :value="groupList.code" :header="groupList.name" v-for="groupList in vData.groupList">
              <div class="parameterList">
                <div class="parameter" v-for="parameter in groupList.children" :data-id="parameter.id" >
                  <t-button tag="div" :title="parameter.description"  :theme="vData.itemIds.includes(parameter.id)?'primary':'default'"
                            @click="tplItemClick" >
                    {{parameter.label}}
                  </t-button>
                </div>
              </div>
            </t-collapse-panel>
          </t-collapse>
      </div>

      <div class="content"  v-show="vData.isMulti===false && vData.item?.id">
        <t-form ref="formDom" :data="formData"  scroll-to-first-error="smooth"  >

          <fieldset class="base-form">
            <legend>字段 · 基本设置</legend>

          <t-form-item label="标识" name="code">
            <t-auto-complete v-model="formData.code"  disabled="disabled" ></t-auto-complete>
          </t-form-item>

          <t-form-item label="名称" name="name" >
            <t-input v-model="formData.name" ></t-input>
          </t-form-item>

          <t-form-item label="页面" name="source_type">
            <t-select v-model="formData.sheet_index">
              <t-option value="start" label="必填" />
              <t-option v-for="(type,index) in vData.tplDetail.sheet_data" :value="index" :label="type" />
            </t-select>
          </t-form-item>

          <t-form-item label="来源" name="source_type">
            <t-select v-model="formData.source_type"  disabled="disabled">
              <t-option :key="type" :label="title" :value="type" v-for="(title,type) in apiData.item_list.config.field?.source_type?.option" />
            </t-select>
          </t-form-item>

          <t-form-item label="分组" name="group_name"  >
            <t-input v-model="formData.group_name" disabled="disabled" ></t-input>
          </t-form-item>

          <t-form-item label="类型" name="input_type">
            <t-select v-model="formData.input_type" disabled="disabled">
              <t-option :key="type" :label="title" :value="type" v-for="(title,type) in apiData.item_list.config.field?.input_type?.option" />
            </t-select>
          </t-form-item>


            <t-form-item label="选项" name="input_options"
                         v-show="_.includes(['select','radio','checkbox'],formData.input_type)">
              <t-tag-input v-model="formData.input_options" placeholder="可多个，输入完按回车"
                           excess-tags-display-type="break-line"  clearable/>
            </t-form-item>

            <t-form-item label="默认值" name="input_default">
              <t-input v-model="formData.input_default"></t-input>
            </t-form-item>



          <t-form-item label="单位" name="input_unit" >
            <t-input v-model="formData.input_unit" :disabled="formData.source_type!=='diy'" ></t-input>
          </t-form-item>

          <t-form-item label="排序" name="sort">
            <t-input v-model="formData.sort" type="number" min="0" placeholder="越大越靠前"></t-input>
          </t-form-item>

          <t-form-item label="状态" name="status" >
            <t-radio-group v-model="formData.status">
              <t-radio :value="0">停用</t-radio>
              <t-radio :value="1">正常</t-radio>
            </t-radio-group>
          </t-form-item>
          </fieldset>


          <fieldset >
            <legend>规则配置（input_config）</legend>
            <t-textarea v-model="formData.input_config_json" placeholder="JSON配置" :autosize="true" />
          </fieldset>


          <fieldset>
            <legend>规则配置（search_config）</legend>
              <t-textarea v-model="formData.search_config_json" placeholder="JSON配置" :autosize="true" />
          </fieldset>

          <fieldset>
            <legend>规则配置（view_config）</legend>
              <t-textarea v-model="formData.view_config_json" placeholder="JSON配置" :autosize="true" />
          </fieldset>

          <fieldset>
            <legend>规则配置（rules_config）</legend>
              <t-textarea v-model="formData.rules_config_json" placeholder="JSON配置" :autosize="true" />
          </fieldset>

          <t-form-item>
            <t-space size="small">
              <t-button theme="primary" @click="itemEdit"> {{vData.btnName}} </t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </div>
    </div>


    <t-dialog
        width="800px"
        v-model:visible="vData.isImport"
        :visibleCenter="true"
        :header="vData.importTitle"
        mode="modal"
        draggable="draggable"
        @confirm="doFieldImport()"
        @cancel="vData.isImport = false"
        style="max-height: 80vh"
    >
      <template #body>
        <div class="body" style="overflow: scroll;height: 70%">
          <t-input-adornment prepend="搜索:">
            <t-input v-model="treeFilterInput" style="width: 300px" @change="treeFilterEvent" />
          </t-input-adornment>
          <t-tree
              ref="tree"
              :data="vData.importTreeList"
              :value="vData.importSelectList"
              :checkable="true"
              :filter="treeFilter"
              @change="(value)=>{vData.importSelectList=value}"
              hover line
          />
        </div>
      </template>
    </t-dialog>

  </div>
</template>
<script setup>
import {getQuery} from "@/core/script/nav"
import dialog from "@/core/script/dialog.js";
import {onActivated, onMounted, reactive, ref} from "vue";
import _ from "lodash";
import {getUserPlantList} from "@/utils/erp.js";
import Sortable from "sortablejs";
import {VxeUI} from "vxe-pc-ui";
import {isEmpty, parseNumber} from "@/utils/vars.js";
import {getHttpDefaultHeaders, http,url as apiUrl} from "@/core/script/api.js";

const userPlantList=getUserPlantList('form-');


// 接口数据
const _apiUrl = apiUrl.form.tpl;

// api返回的数据
const apiData=reactive({
  detail:{data:{},config:{}},
  item_list:{list:[],config:{}},
  field_list:{list:[],config:{}},
  upload:{},
});

//main数据
const defaultData={
  tplDetail:{
    id:0,
    customer_id:'',
    customer_code:'',
    plant_id:userPlantList?.[0]?.value,
    group_id:0,
    title:'',
    status:0,
    sheet_data:{},
    file_data:{},
  },
  formData: {
    code: '',
    name: '',
    source_type: 'diy',
    status: 1,
    sheet_index:0,
    sheet_title:'',
    input_type: 'text',
    input_unit: '',
    is_select: false,
    input_options: [],
    input_config: {},
    input_config_json: '',
    search_config: {query: {},status: 0,depend:[]},
    search_config_json: '',
    rules_config: {},
    rules_config_json: '',
    view_config: {},
    view_config_json: '',
  }
}

//view数据
const vData=reactive({
  files:[],
  tplDetail:defaultData.tplDetail,
  typeList:{'sys':'系统','diy':'自定义'},
  itemQuery:{sheet_index:'all',type:'all',search:''},
  groupList:[],
  itemList:[],
  item:{id:0,code:'',value:'',input_config:{}},
  itemIds:[],
  btnName: '',
  isMulti:false,
  isImport:false,
  importTitle:'',
  importTreeList:[],
  importSelectList:[],
});

// 模板表单元素
const formDom=ref(null);
const formData=ref({...defaultData.formData});

//上传组件
const uploader=reactive({
  option:{
    theme:"file-input",
    action:_apiUrl.upload,
    headers:getHttpDefaultHeaders(),
    accept:'.xlsx',
    sizeLimit:{ size: 10, unit: 'MB' },
    multiple:false,
    placeholder:"请选择模板文件",
    style:'flex: 0 0 55%; max-width: 55%;',
  },
  event:{
    validate:({type}) => {
      const messageMap = {
        FILE_OVER_SIZE_LIMIT: '文件大小超出限制, 最大支持10MB',
      };
      messageMap[type] && dialog.warning(messageMap[type]);
    },
    success:(params) => {
      if (params.response?.code !== 20000) {
        dialog.error(params.response?.message || '上传失败');
        return ;
      }
      apiData.upload=params.response.data || {};
      vData.tplDetail.file_data={
        name: params.file.name,
        status: params.file.status,
        percent: params.file.percent,
        url: params.response.data.url,
        path: params.response.data.path,
        size: params.file.size,
      };
      vData.tplDetail.sheet_data=params.response.data?.sheets || [];
    },
  }
});


//获取模板详情
const getTplDetail=async(id)=>{
  let result = id===undefined?{}:await http.get(_apiUrl.detail, {params: {id}});
  if(result?.data?.code!==20000){
    return ;
  }
  apiData.detail=result?.data?.data || {};
  vData.tplDetail=apiData.detail?.data;
  vData.files=typeof vData.tplDetail.file_data==='undefined'?[]:[vData.tplDetail.file_data];
  vData.typeList=apiData.detail?.config?.field?.source_type?.option || {};
  await getTplItems();
}

//模板保存（提交）
const tplDetailEdit=async()=>{
  let result = await http.post(_apiUrl.edit, vData.tplDetail);
  if(result.data.code!==20000){
     dialog.error(result.data.message);
    return ;
  }
   dialog.success('保存成功');
  await getTplDetail(result.data.data?.id);
}

//导入模板中的字段
const tplImport=async () => {
  const id = vData.tplDetail?.id;
  let result = await http.get(_apiUrl.import, {params: {id}});
  if(result.data.code!==20000){
     dialog.error(result.data.message);
    return ;
  }
   dialog.success('保存成功');
  await getTplItems();
}





//获取模板参数
const getTplItems=async (query={}) => {
  vData.itemQuery=vData.tplDetail?.id?{...vData.itemQuery,...query,
    plant_id:vData.tplDetail.plant_id,
    tpl_id:vData.tplDetail.id,
  }:{};
  let result = vData.itemQuery?await http.get(_apiUrl.item_list, {params: vData.itemQuery}):{};
  if(result && result.data.code!==20000){
     dialog.error(result.data.message);
    return ;
  }
  vData.itemIds=[];
  vData.isMulti=false;
  apiData.item_list=result?.data?.data || {};
  vData.groupList=_.cloneDeep(apiData.item_list.list);
  vData.itemList=vData.groupList.reduce((acc, cur) => {
    return acc?.concat(cur?.children);
  }, []);
  setTimeout(dragSort);
  tplItemClick();
}

//模板参数筛选
const tplItemsFilter=()=>{
  const input=vData.itemQuery.search.toLowerCase();
  vData.groupList.map((groupList,index) => {
    if(input.length===0 ){
      groupList.children=apiData.item_list.list[index]['children'];
    }else{
      groupList.children=groupList?.children.filter(item =>{
        return  item?.label?.toLowerCase()?.includes(input)
      })
    }
    return groupList;
  })
}

//开启拖动排序
const dragSort = async () => {
  const parameterListAll = document.querySelectorAll('.parameterList');
  parameterListAll.forEach(parameterList => {
    new Sortable(parameterList, {
      group: 'nested',
      animation: 150,
      onEnd: async function ({to, newIndex, item}) {
        const id = item.dataset?.id;

        const leftItem = to.children[newIndex - 1];
        const rightItem = to.children[newIndex + 1];

        const leftId = leftItem?.dataset?.id;
        const rightId = rightItem?.dataset?.id;

        const res = await http.post(_apiUrl.item_sort, {id, leftId, rightId});
        if (res.data.code !== 20000) {
           dialog.error(res.data.message);
        }
        tplItemClick();
      }
    });
  })
}



//选中模板参数
const tplItemClick=(e)=>{
  let id = e?.target?.dataset?.id || e?.target?.parentNode?.dataset?.id || e?.target?.parentNode?.parentNode?.dataset?.id || e;
  let item;
  id=parseNumber(id);
  if (typeof id === 'number' && id > 0) {
    item=vData.itemList.find(item=>item?.id===id) || {};
  }else{
    if(vData.item?.id){
      item=vData.itemList.find(item=>item?.id===vData.item?.id) || {};
    }else if(vData.itemIds.length>0){
      item=vData.itemList.find(item=>vData.itemIds?.includes(item?.id));
    }else{
      item=vData.itemList?.[0] || {};
    }
  }
  vData.item = {...defaultData.item,...item};
  vData.isMulti?vData.itemIds.push(vData.item?.id):vData.itemIds=[vData.item?.id];
  if(vData.isMulti){
    return ;
  }
  vData.btnName=vData.item?.id?'修改':'';
  formData.value = {...defaultData.formData, ...vData.item,
    source_type:vData.item?.source_type || vData.itemQuery?.type,
  };
  formData.value.sheet_index=parseNumber(formData.value.sheet_index,formData.value.sheet_index);
  formData.value.search_config_json=JSON.stringify(formData.value.search_config);
  formData.value.input_config_json=JSON.stringify(formData.value.input_config);
  formData.value.view_config_json=JSON.stringify(formData.value.view_config);
  formData.value.rules_config_json=JSON.stringify(formData.value.rules_config);

}

//修改表单
const itemEdit=async () => {
  formData.value.input_config=JSON.parse(formData.value.input_config_json);
  formData.value.search_config=JSON.parse(formData.value.search_config_json);
  formData.value.view_config=JSON.parse(formData.value.view_config_json);
  formData.value.rules_config=JSON.parse(formData.value.rules_config_json);
  formData.value.sheet_title=vData.tplDetail.sheet_data?.[formData.value.sheet_index] || '';
  let result = await http.post(_apiUrl.item_edit, formData.value);
  if (result.data.code !== 20000) {
     dialog.error(result.data.message);
    return ;
  }
   dialog.success('修改成功');
  await getTplItems();
}

//多选切换
const isMultiOn=(isMulti)=>{
  isMulti=!vData.isMulti;
  isMulti || (vData.itemIds=vData.itemIds?.[0] || []);
  vData.isMulti=isMulti;
}

//修改表单
const itemSet=async (post) => {
  let confirm= await VxeUI.modal.confirm({content: '确认操作？',});
  if(confirm!=='confirm'){
    return ;
  }
  let result = await http.post(_apiUrl.item_set, {id:vData.itemIds,...post});
  if (result.data.code !== 20000) {
     dialog.error(result.data.message);
    return ;
  }
   dialog.success('修改成功');
  await getTplItems();
}


//打开导入弹窗
const openImport=async()=>{
  if(isEmpty(vData.tplDetail.id)){
    dialog.warning('请先保存模板');
    return ;
  }
  const type=vData.itemQuery.type==='all'?'':vData.itemQuery.type;
  let result = await http.get(_apiUrl.field_list, {params: {type: type,plant_id:vData.tplDetail.plant_id,status:1}});
  if (result.data.code !== 20000) {
    dialog.error(result.data.message);
    return;
  }
  treeFilterInput.value='';
  treeFilter.value=null;
  vData.isImport=true;
  vData.importTitle="导入"+  (vData.typeList?.[vData.itemQuery.type] || '');
  vData.importTreeList= result?.data?.data?.list || [];
  vData.importSelectList=[];
}


//导入参数筛选
const treeFilterInput=ref(null);
const treeFilter = ref();
const treeFilterEvent=()=>{
  treeFilter.value = treeFilterInput.value ? (node) => node.data.label.indexOf(treeFilterInput.value) >= 0 : null;
}


//导入数据
const doFieldImport=async () => {
  let result = await http.post(_apiUrl.item_import, {
    tpl_id:vData.tplDetail.id,
    plant_id:vData.tplDetail.plant_id,
    sheet_index:vData.itemQuery.sheet_index,
    sheet_title:vData.tplDetail.sheet_data?.[vData.itemQuery.sheet_index] || '',
    type:vData.itemQuery.type,
    data:vData.importSelectList}
  );
  if(result.data.code!==20000){
     dialog.error(result.data.message);
    return ;
  }
   dialog.success('导入成功');
  await getTplItems({type:vData.itemQuery.type});
  vData.isImport=false;
}


//拖动排序
const onDragend = ({ currentIndex, targetIndex }) => {
  [vData.typeList[currentIndex], vData.typeList[targetIndex]] = [
    vData.typeList[targetIndex],
    vData.typeList[currentIndex],
  ];
};

// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(async () => {
  let query= getQuery(null,true);
  await getTplDetail(query?.id);
})

onMounted(() => {
  vData.tplDetail.id=null;
})

</script>
<style>
.siyi-form-tpl-detail {
  display: flex;
  flex-direction: column;

  .row {
    display: flex;
    flex-direction: row;
    width: 100%;
  }


  .top {
    justify-content: space-between;
    padding: 10px;
    height: 120px;

    .top-left {
      flex-grow: 1;
      max-width: 60%;

      .head1, .head2 {
        display: flex;
        flex-direction: row;

        .filter {
          display: flex;
          flex-direction: row;
          align-items: center;

          button {
            margin: 0 2px;
          }
        }
      }
    }

    .top-right {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      max-width: 37%;

      > div {
        flex: 0 0 50%; /* 每个元素占据一半的宽度 */
        max-width: 48%; /* 最大宽度为一半 */
        box-sizing: border-box; /* 让 padding 和 border 不会增加元素的宽度 */
      }

      .w3 {
        flex: 0 0 33%;
        max-width: 33%;
      }



      .buttons {
        display: flex;
        justify-content: space-between;
        flex: 0 0 60%;
        max-width: 60%;

        > button {
          margin-right: 5px
        }
      }
    }

  }

  .main {
    flex-grow: 1;
    height: calc(100vh - 120px);

    .aside {
      overflow: auto;
      width: 60%;
      padding-bottom: 50px;

      .parameterGroupList {
        .t-collapse {
          border: none;
        }

        .t-collapse-panel__wrapper, .t-collapse-panel__content {
          padding: 0;
        }
      }

      .parameterList {
        padding: 5px 0 5px 5px;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-content: flex-start;
        line-height: 45px;
        scrollbar-width: thin;

        .parameter {
          margin-right: 15px;

          .t-button {
            padding: 15px 5px;
          }

          .t-icon {
            vertical-align: top;
            position: fixed;
            margin-left: -5px;
            color: #e34d59;
          }
        }

      }

    }

    > .content {
      flex-grow: 1;
      padding: 20px 50px 20px 20px;
      width: 40%;
      overflow: scroll;
    }
  }

  & .siyi-leftHide {
    margin-left: 162px;
  }

  fieldset{
    padding: 20px;
    border: 1px solid var(--td-component-border);
    margin-bottom: 20px;
  }

  .base-form {
    padding: 20px 50px 20px 0;
  }

  legend {
    display: inline-block;
    padding: 0 10px;
    text-align: center;
  }


}
</style>