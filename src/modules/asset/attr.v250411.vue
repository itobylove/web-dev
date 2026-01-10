<template>
  <v-list v-bind="listBind" :columns="column" v-on="listEvent" />
</template>
<script setup>
import {onMounted, reactive, ref} from "vue";
import VList from './vlist.v250401.vue'
import apiUrl from "../../core/config/url.js";

const props = defineProps({
  query: {type: Object, default: {}},
});
const listBind=reactive({
  id:'asset_attr',
  title: "属性管理",
  query:props.query,
  fieldsAutoAdd:{'name':['form_type'],'form_type':['name']},
  apiUrl:apiUrl.asset.attr,
  tableOptions:{
    options:{excelOptions:{fillHandle:true}}
  },
  formatter: {
    showItem: (item, _default = {}, index = null) => {
      return {
        ..._default,
        ...item,
        status: !!item?.status,
      }
    },
    saveItem: (item, _default = {}, index = null) => {
      return {
        ..._default,
        ...item,
        status: item.status ? 1 : 0,
      }
    }
  },
});

const dataOption = ref({
  type: null, status: {0: '停用', 1: '启用'},
  form_type:{},
});

const column=[
  {title: '分组', width: 100, field: 'label',editorType:'text'},
  {title: '类型', width: 100, field: 'type',hide:true},
  {title: '名称', width: 100, field: 'name',editorType:'text'},
  {title: '表单类型', width: 100, field: 'form_type',editorType:'select',fieldFormat:(record)=>{
      return dataOption.value.form_type?.[record.form_type] || '';
    },},
  {title: '单位', width: 80, field: 'unit',editorType:'text'},
  {title: '表单名称', width: 100, field: 'form_title',editorType:'text',hide:true},
  {title: '表单提示', width: 100, field: 'form_tips',editorType:'text'},
  {title: '表单选项', width: 100, field: 'options',editorType:'text',fieldFormat:(record)=>{
      return Array.isArray(record.options)? record.options.join(','):record.options;
  }},
    {title: '表单配置', width: 100, field: 'form_options',editorType:'text',fieldFormat:(record)=>{
        return Object.keys(record.form_options || {}).length?JSON.stringify(record.form_options):'';
  }},
  {title: '默认值', width: 100, field: 'form_default',editorType:'text'},
  {title: '排序', width: 100, field: 'sort',editorType: 'text'},
  {title: '状态', width: 100, field: 'status',cellType:'switch',
    style:{color: '#FFF',switchStyle:{ checkedFill:"#35a1fd"},},
    uncheckedText:dataOption.value.status[0],checkedText:dataOption.value.status[1],
  },
  {title: 'ID', width: 80, field: 'id'},
  {title: '创建人', width: 100, field: '_text.created_uid',hide:true},
  {title: '创建时间', width: 100, field: '_text.created_at',hide:true},
  {title: '修改人', width: 100, field: '_text.updated_uid',hide:true},
  {title: '修改时间', width: 100, field: '_text.updated_at',hide:true},
];

const listEvent={
  listLoad:async({e,resolve, reject})=>{
    // console.log('onListLoad',e);
    dataOption.value=e.option;
    resolve(e);
  }
}

// 生命周期
onMounted(() => {
  console.log('attr props ',props);
})
</script>