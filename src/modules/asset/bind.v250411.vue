<template>
    <v-list ref="vListRef" v-bind="listBind()" v-on="listEvent">
    </v-list>
</template>
<script setup>
import VList from './vlist.v250401.vue'
import {onMounted, ref} from "vue";
import {getOptionLabel} from "@/utils/vars.js";
import apiUrl from "../../core/config/url.js";
import dialog from "@/core/script/dialog.js";
import _ from 'lodash';

const props = defineProps({
  query:{type:Object,default:{}}
});


const vListRef = ref()
const listBind=()=>{
  return {
    ...props.query,
    id:'asset_bind',
    apiUrl:apiUrl.asset.bind,
    menus:{
      turnOnRequired: {title: "设置必填", click: () => vListRef.value.updateAll({attr_required:1}),icon: 'ri-play-line',sort:30,},
      turnOffRequired: {title: "设置选填", click: () => vListRef.value.updateAll({attr_required:0}),icon: 'ri-stop-line',sort:40,},
    },
    columns:column,
    fieldsAutoAdd:{'cate_id':['attr_id'],'asset_id':['attr_id'],'attr_id':['cate_id'],},
    formatter:{
      showItem:(item, _default={},index=null) => {
        return {
          ..._default,
          ...item,
          status: !!item?.status,
          attr_required: !!item?.attr_required,
          ...item.attr_extend
        }
      },
      saveItem:(item,_default={},index=null) => {
        console.log('item',item);
        return {
          id: item.id,
          cate_id: item.cate_id,
          asset_id: item.asset_id,
          attr_id: item.attr_id,
          attr_required: item?.attr_required?1:0,
          attr_default: item?.attr_default?item.attr_default:null,
          attr_extend:{
            form_title: item.form_title,
            form_tips: item.form_tips,
            form_options: item.form_options,
          },
          status: item.status?1:0,
          sort: typeof item?.sort==='number'?item?.sort:(index*10),
          ..._default,
        }
      }
    }
  }
}
const listEvent={
  listLoad:async({e,resolve, reject})=>{
    console.log('onListLoad',e);
    dataOption.value=e.option;
    dataOption.value.cate=_.sortBy(e.option.cate,'sort');
    dataOption.value.attr=_.sortBy(e.option.attr,'sort');
    resolve(e);
  },
  editor_dblclick:async ({e,resolve, reject,}) => {
    console.log('bind cell_dblclick',e);
    if (e.field==='cate_name'){
      const value= await dialog.selectAsync(getOptionLabel(dataOption.value.cate,'full_name','id'));
      if (value===null){
        reject(null);
        return ;
      }
      const record={...e.originData,cate_id:value,cate_name:dataOption.value.cate.find((item)=>item.id===value)?.['full_name']};
      resolve({record});
    }else if(e.field==='name'){
      const value= await dialog.selectAsync(getOptionLabel(dataOption.value.attr,'full_name','id'));
      if (value===null || value===false){
        reject(null);
        return ;
      }
      const attrItem=dataOption.value.attr.find((item)=>item.id===value);
      const record={...e.originData,attr_id:value,
        name:attrItem?.name,
        label:attrItem?.label,
        form_type:attrItem?.form_type
      };
      resolve({record});
    }
  },
}

const dataOption = ref({
  status: {0: '停用', 1: '启用'},
  attr_required: {0: '否', 1: '是'},
  form_type:{},
  cate:{},
  asset:{},
  attr:{},
  ...props.query?.dataOption,
});
const column=[
  {title: '分类', width: 200, field: 'cate_name',editorType:'dblclick',
    fieldFormat:(record)=>dataOption.value.cate.find((item)=>item.id===record.cate_id)?.['full_name'] || '',},
  {title: '分类ID', width: 100, field: 'cate_id',hide:true},
  {title: '资产', width: 100, field: 'asset_name',hide:true},
  {title: '资产ID', width: 100, field: 'asset_id',hide:true},
  {title: '属性', width: 100, field: 'name',editorType:'dblclick'},
  {title: '属性ID', width: 100, field: 'attr_id',hide:true},
  {title: '分组', width: 100, field: 'label'},
  {title: '表单类型', width: 100, field: 'form_type',fieldFormat:(record)=>dataOption.value.form_type?.[record.form_type] || '',},
  {title: '表单名称', width: 100, field: 'form_title',editorType:'text',hide:true},
  {title: '表单提示', width: 100, field: 'form_tips',editorType:'text'},
  {title: '表单配置', width: 100, field: 'form_options',editorType:'text'},
  {title: '默认值', width: 100, field: 'form_default',editorType:'text'},
  {title: '排序', width: 100, field: 'sort',editorType: 'text'},
  {title: '是否必填', width: 100, field: 'attr_required',cellType:'switch',
    style:{color: '#FFF',switchStyle:{ checkedFill:"#35a1fd"},},
    uncheckedText:dataOption.value.attr_required[0],checkedText:dataOption.value.attr_required[1]
  },
  {title: '状态', width: 100, field: 'status',cellType:'switch',
    style:{color: '#FFF',switchStyle:{ checkedFill:"#35a1fd"},},
    uncheckedText:dataOption.value.status[0],checkedText:dataOption.value.status[1]
  },
  {title: 'ID', width: 80, field: 'id'},
  {title: '创建人', width: 100, field: '_text.created_uid',hide:true},
  {title: '创建时间', width: 100, field: '_text.created_at',hide:true},
  {title: '修改人', width: 100, field: '_text.updated_uid',hide:true},
  {title: '修改时间', width: 100, field: '_text.updated_at',hide:true},
];


// 生命周期
onMounted(() => {
  console.log('bind props',props);
})
</script>
<style >
.bind-form {
  padding: 20px;
  display: flex;
  align-items: center;
  height: 100%;
}

</style>