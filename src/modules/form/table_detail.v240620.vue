<template>
  <div class="siyi-form-table-detail">

    <div class="row row1">

      <div class="step">
        <t-steps theme="dot" :current="vData.sheet_index" @change="loadPage" >
          <t-step-item value="start"  content="开始" title="必填项" />
          <t-step-item v-for="(sheet_data,index) in vData.sheet_data" :value="index" :status="sheet_data.status?'default':'error'"  :content="'第'+(index+1)+'步'" :title="sheet_data.title"  />
          <t-step-item value="end" content="结束" title="导出" />
        </t-steps>

      </div>
    </div>
    <div class="table_helper">
      <p><span>{{vData.formCommonData?.JOB_SN_0}}</span></p>
    </div>
    <div class="row row2">
      <t-form ref="formRef" :rules="vData.rules"  :data="vData.formData"  scroll-to-first-error="smooth"  @submit="onSubmit">

        <t-card class="emptyBox" v-show="formItemList.length===0">
          <p v-if="vData.msgText.length>0">{{vData.msgText}}</p>
          <p v-else>{{defaultData.msgNoItem}}</p>
        </t-card>

        <div v-bind="inputItem.list.bind(formItem)" v-show="itemIsShow(formItem)"   v-for="formItem in formItemList">

          <t-form-item  v-bind="inputItem.item?.bind(formItem)" v-if="formItem.input_type!=='table'" >

              <t-input-adornment
                  :prepend="formItem.input_config?.prepend || ''"
                  :append="(formItem.input_config?.append || '') + (formItem.input_unit || '')"
              >

              <t-input v-if="inputItem.text.isShow(formItem)" v-model="formItem.content"
                       v-bind="inputItem.text?.bind(formItem)" v-on="inputItem.text.event"
                       @focus="itemSearch(formItem,$event)"
                       @keyup="itemSearchDelay(formItem,$event)"
              >
              </t-input>

              <t-textarea v-else-if="inputItem.textarea.isShow(formItem)"
                       v-bind="inputItem.textarea?.bind(formItem)" v-on="inputItem.textarea.event"
                       @focus="itemSearch(formItem,$event)"
                       @keyup="itemSearchDelay(formItem,$event)"
              >

              </t-textarea>

              <t-input-number v-else-if="inputItem.number.isShow(formItem)" v-model="formItem.content"
                              v-bind="inputItem.number?.bind(formItem)" v-on="inputItem.number?.event"
                              @focus="itemSearch(formItem,$event)"
                              @keyup="itemSearchDelay(formItem,$event)"
              >
              </t-input-number>

              <t-radio-group v-else-if="inputItem.radio.isShow(formItem)" v-model="formItem.content"
                             v-bind="inputItem.radio?.bind(formItem)" v-on="inputItem.radio?.event"
                             @focus="itemSearch(formItem,$event)"
              >
              </t-radio-group>

              <t-checkbox-group v-else-if="inputItem.checkbox.isShow(formItem)" v-model="formItem.content"
                                v-bind="inputItem.checkbox?.bind(formItem)" v-on="inputItem.checkbox?.event"
                                @focus="itemSearch(formItem,$event)"
              >
              </t-checkbox-group>

              <t-select v-else-if="inputItem.select.isShow(formItem)" v-model="formItem.content"
                        v-bind="inputItem.select?.bind(formItem)" v-on="inputItem.select?.event"
                        @focus="itemSearch(formItem,$event)"
                        @search="itemSearch(formItem,$event)"
              >
              </t-select>

              <t-date-picker v-else-if="inputItem.date.isShow(formItem)" v-model="formItem.content"
                             v-bind="inputItem.date?.bind(formItem)" v-on="inputItem.date?.event"/>

              <t-upload v-else-if="inputItem.file.isShow(formItem)" v-model="formItem.content"
                        v-bind="inputItem.file?.bind(formItem)" v-on="inputItem.file?.event"/>

              <t-upload v-else-if="inputItem.html.isShow(formItem)" v-html="formItem.content"
                        v-bind="inputItem.html?.bind(formItem)" v-on="inputItem.html?.event"/>

            </t-input-adornment>
          </t-form-item>

          <t-card  v-bind="inputItem.card?.bind(formItem)" v-if="formItem.input_type==='table'"  style="width: 100%;">

            <template #actions>
              <t-button variant="outline" theme="success" @click="tableAddRow(formItem)">
                <template #icon><AddCircleIcon /></template> &nbsp;增加行
              </t-button>
              <t-button variant="outline" theme="danger" @click="tableDelRow(formItem)">
                <template #icon></template><MinusCircleIcon /> &nbsp;删除行
              </t-button>
            </template>

            <!-- 子表格-->
            <t-row :gutter="[16, 24]">
              <t-col v-if="formItem.input_config?.table?.showIndex">{{formItem.input_config?.table?.indexTitle || '序号'}}</t-col>
              <t-col v-for="(tableColumn,j) in formItem.table_items[0]" :flex="Math.ceil(12/formItem.input_options.length)">
                <div style="text-align: center;">{{tableColumn.name}} {{vData.showCode? "("+tableColumn.code+")":''}}</div>
              </t-col>
            </t-row>
            <t-row v-for="(items,i) in formItem.table_items" :key="i" :gutter="[16, 24]" style="margin: 20px 0">
              <t-col v-if="formItem.input_config?.table?.showIndex">
                <t-tag >{{formItem.input_config?.table?.indexOption?.[i] || i+1}}</t-tag>
              </t-col>
              <t-col v-for="(formItemChild) in items" :flex="Math.ceil(12/formItem.input_options.length)">

                <t-form-item v-show="itemIsShow(formItemChild)" v-bind="inputItem.item?.bind(formItemChild)">

                  <t-input-adornment
                      :prepend="formItemChild.input_config?.prepend || ''"
                      :append="(formItemChild.input_config?.append || '') + (formItemChild.input_unit || '')"
                  >
                    <t-input v-if="inputItem.text.isShow(formItemChild)" v-model="formItemChild.content"
                             v-bind="inputItem.text?.bind(formItemChild)" v-on="inputItem.text.event"
                             @focus="itemSearch(formItemChild,$event)"
                             @keyup="itemSearchDelay(formItemChild,$event)"
                    >
                    </t-input>

                    <t-input-number v-else-if="inputItem.number.isShow(formItemChild)" v-model="formItemChild.content"
                                    v-bind="inputItem.number?.bind(formItemChild)" v-on="inputItem.number?.event"
                                    @focus="itemSearch(formItemChild,$event)"
                                    @keyup="itemSearchDelay(formItemChild,$event)"
                    >
                    </t-input-number>


                    <t-select v-else-if="inputItem.select.isShow(formItemChild)" v-model="formItemChild.content"
                              v-bind="inputItem.select?.bind(formItemChild)" v-on="inputItem.select?.event"
                              @focus="()=>{formItemChild.popupVisible=true;itemSearch(formItemChild,$event)}"
                              @blur="()=>{formItemChild.popupVisible=false}"
                              @search="itemSearch(formItemChild,$event)"
                    >
                    </t-select>

                    <t-textarea v-else-if="inputItem.textarea.isShow(formItemChild)" v-model="formItemChild.content"
                             v-bind="inputItem.textarea?.bind(formItemChild)" v-on="inputItem.textarea.event"
                             @focus="itemSearch(formItemChild,$event)"
                             @keyup="itemSearchDelay(formItemChild,$event)"
                    >
                    </t-textarea>


                  </t-input-adornment>

                </t-form-item>

              </t-col>
            </t-row>
          </t-card>
        </div>
        <div class="form_item form_item_footer">
          <t-space size="small">
            <t-button title="PageDown" theme="success" type="button" :disabled="!vData.isReady" v-if="vData.sheet_index!=='end'" @click="changeSheet('next')"> 下一步 </t-button>

            <t-button title="Ctrl+S"  theme="success" v-if="formItemList.length>0" variant="base"  type="submit" > 保存 </t-button>


            <t-button title="Ctrl+P" theme="default" type="button" variant="base" v-if="vData.sheet_index==='end'" @click="onExport"> 导出excel </t-button>
            <t-button theme="default" type="button" variant="base" v-if="vData.sheet_index==='end'" @click="onExport($event,'pdf')"> 导出PDF </t-button>

            <t-button title="PageUP" theme="primary" type="button" :disabled="!vData.isReady" v-if="vData.sheet_index!=='start'" @click="changeSheet('previous')"> 上一步 </t-button>

            <t-loading attach="#alice" size="small" :loading="vData.isLoading"></t-loading>
            <t-button  theme="default" variant="base" @click="loadPage(vData.sheet_index,true)" > 刷新 </t-button>
            <t-button  theme="default" variant="base" @click="openMi" > 查看MI </t-button>
            <t-button  theme="default" variant="base" v-if="!['start','end'].includes(vData.sheet_index)"  @click="showSheet">{{vData.sheet_status?'隐藏':'显示'}}本页 </t-button>
            <t-button  theme="default" variant="base" v-if="formItemList.length>0"  @click="vData.showCode=!vData.showCode">{{vData.showCode?'隐藏':'显示'}}CODE </t-button>
            <t-button theme="primary" variant="base"  @click="siyi.navHide=!siyi.navHide">{{siyi.navHide?'显示':'隐藏'}}菜单 </t-button>
            <t-button theme="warning" variant="base" type="reset" @click="pageClose"> 退出 </t-button>
          </t-space>
        </div>
      </t-form>
    </div>
  
    
    <div class="fly-image"  v-bind="flyImage.bind" v-on="flyImage.on">

      <t-image-viewer v-model:visible="vData.viewerIsShow" draggable mode="modeless"   :navigationArrow="true"
                      v-show="flyImage.files.length>0"   :images="[flyImage.url]" :imageScale="flyImage.scale">
        <template #trigger>
            <img v-show="flyImage.url" :src="flyImage.url" @click="vData.viewerIsShow=!vData.viewerIsShow" :alt="flyImage.files?.[flyImage.index]?.['name']"/>
        </template>
      </t-image-viewer>

      <t-upload v-model="flyImage.files" v-bind="uploader.option" v-on="uploader.event">
        <template #fileListDisplay>
          <t-list :split="true" size="small">
            <t-list-item v-for="(file,index) in flyImage.files" size="small">
               <span @click="flyImage.show(index)">{{index+1}}:&nbsp;{{file.name}}</span>
              <CloseIcon class="t-upload__icon-delete" @click="() => uploader.event.remove({index})" />
            </t-list-item>
          </t-list>
        </template>
      </t-upload>
    </div>

  </div>
</template>

<script setup>
import {onActivated, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import siyi from '@/core/script/siyi.js'
import * as core from "@/core/script/core";
import dialog from "@/core/script/dialog.js";
import {AddCircleIcon, CloseIcon, MinusCircleIcon} from 'tdesign-icons-vue-next';
import _ from "lodash";
import dayjs from "dayjs/";
import {getHttpDefaultHeaders, http, url as apiUrl} from "@/core/script/api.js";
import {pdfToImg} from "@/utils/pdf.js";
import {to as navTo , getQuery} from "@/core/script/nav"
import {compareValues, isEmpty, isNumber, parseNumber} from "@/utils/vars.js";


//api接口
const _apiUrl=apiUrl.form.table;

//默认数据
const defaultData={
  emptyStr:['0',0,'/','(隐藏)','（隐藏）'],
  inputTypeMulti:['checkbox','multiSelect','images','files'],
  inputIsSelect:['select','multiSelect','checkbox','radio'],
  callbackScope:['betweenRand'],
  msgNoItem:'本页没有需要填写的数据',
};

//api返回的数据
const apiData=reactive({
  table:{},
  tpl:{},
  items:[],
});

//页面数据
const vData=reactive({
  id:0,//当前tableID
  sheet_index:'start',//当前sheet_index
  sheet_status:true,//当前sheet_index
  sheet_data:[], //表单的sheet数据
  rules:{}, //表单验证规则
  formData:{},//表单值
  formDataIsChange:false,//变单值是否修改
  isReady:false,//页面是否加载完
  isLoading:false,//加载状态
  showCode:false,//是否显示code
  affected:[], //影响别人（被影响的组件）
  depend:{code:{},code2:{},item_id:{},input_name:{}}, // 依赖别人（本组件受其他组件影响）
  itemIndex:{},//item的索引
  msgText:'',
  viewerIsShow:false,
});

//当前页表单DOM
const formRef=ref(null);
//当前页所有的表单
const formItemList = ref([]);

//表单配置
const inputItem=reactive({
  list:{
    bind: ({input_type,input_config}) => {
      return {
        class:[
          {
            'form_item':true,
            'show_code':vData.showCode,
            'form_item_table':input_type==='table',
            'form_item_many':formItemList.value.length>8 && formItemList.value.length<12,
            'form_item_much':formItemList.value.length>=12,
          }],
        ...input_config?.list_bind || {},
      }
    },
    event: {
    },
  },
  card:{
    isShow: ({input_type}) => input_type === 'table',
    bind: ({name,code,input_name,input_config}) => {
      return {
        name:input_name,
        title:name+(vData.showCode?"("+code+")":''),
        ...input_config?.item_bind || {},
      }
    },
    event: {},
  },
  item:{
    isShow: ({input_type}) => input_type !== 'table',
    bind: ({name,code,input_name,rowIndex,input_config,input_type}) => {
      return {
        name:input_name,
        label:rowIndex===undefined?(name+(vData.showCode?"("+code+")":"")):'',
        // label:rowIndex===undefined?(name+"("+input_name+")"):'',
        ...input_config?.item_bind || {},
      }
    },
    event: {},
  },
  text: {
    isShow: ({input_type}) => input_type === 'text' ,
    bind: ({input_config, remark, item_remark,input_name}) => {
      return {
        autocomplete:'off',
        name:input_name,
        placeholder: '请填写',
        tips: item_remark || remark,
        ...input_config?.bind,
      }
    },
    event: {},
  },
  html:{
    isShow: ({input_type}) => input_type === 'html' ,
    bind:({input_config})=>{
      return {
        ...input_config?.bind,
      }
    },
    event: {},
  },
  textarea: {
    isShow: ({input_type}) => input_type === 'textarea' ,
    bind: ({input_config, remark, item_remark,input_name}) => {
      return {
        autocomplete:'off',
        name:input_name,
        placeholder: '请填写',
        autosize:{ maxRows: 5 },
        tips: item_remark || remark,
        ...input_config?.bind,
      }
    },
    event: {},
  },
  number:{
    isShow:({input_type})=>input_type==='number' ,
    bind:({input_config,input_name})=>{
      return {
        name:input_name,
        autocomplete:'off',
        theme:'normal',
        align:'left',
        placeholder: '请输入数字',
        ...input_config?.bind,
      }
    },
    event: {},
  },
  radio:{
    isShow:({input_type})=>{return input_type==='radio' },
    bind:({input_config,select_options,input_name})=>{
      return {
        name:input_name,
        options: select_options.reduce((acc,cur)=>[...acc,...cur.children],[]),
        ...input_config?.bind
      }
    },
    event: {},
  },
  checkbox:{
    isShow:({input_type})=>{return input_type==='checkbox' },
    bind:({input_config,select_options,input_name})=>{
      return {
        name:input_name,
        options: select_options.reduce((acc,cur)=>[...acc,...cur.children],[]),
        ...input_config?.bind
      }
    },
    event: {},
  },
  select:{
    isShow:({input_type})=>{return ['select','multiSelect'].includes(input_type)  },
    bind:({input_config,select_options,input_name,isMulti,popupVisible})=>{
      return {
        name:input_name,
        options: select_options,
        filterable: true,
        multiple:isMulti,
        ...input_config?.bind,
      }
    },
    event: {},
  },
  date:{
    isShow:({input_type})=>{return ['date','datetime'].includes(input_type)  },
    bind:({input_config,input_type,input_name})=>{
      return {
        name:input_name,
        format:input_type==='date'?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss',
        enableTimePicker:input_type==='datetime',
        ...input_config?.bind,
      }
    },
    event: {},
  },
  file:{
    isShow:({input_type})=>{return ['image','images','file'].includes(input_type) },
    bind:({input_config,input_type,input_name})=>{
      return {
        name:input_name,
        theme:inputItem.file.getTheme(input_type),
        action:_apiUrl.upload+"?field="+input_name,
        headers:getHttpDefaultHeaders(),
        accept:'jpg,png,jpeg,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,rar,zip',
        sizeLimit:{ size: 10, unit: 'MB' },
        multiple:input_type==='images' || input_type==='files',
        formatResponse:(response)=>{
          return response?.code === 20000? response.data : {error: response.message || '上传失败'};
        },
        ...input_config
      }
    },
    event:{
      validate:({type}) => {
        const messageMap = {
          FILE_OVER_SIZE_LIMIT: '文件大小超出限制',
          FILES_OVER_LENGTH_LIMIT: '文件数量超出限制',
          FILTER_FILE_SAME_NAME: '不允许上传同名文件',
        };
        messageMap[type] && dialog.warning(messageMap[type]);
      },
      success:(params) => {
        console.log('upload success',params);
      },
    },
    getTheme:(input_type)=>{
      let themes={image:'image',file:'file-input',images:'image',files:'file-input'}
      return themes[input_type] || 'file-input';
    },
  },
  table:{
    isShow:({input_type})=>{
      return input_type==='table';
    },
    bind:({input_config})=>{
      return {
        ...input_config?.bind
      }
    },
    event: {},
  },

});


//根据其他表单的值，来判断元素是否显示
const itemIsShow=(formItem)=>{
  formItem.isShow=true;
  let {status,depend,type}=formItem.view_config;
  if(!status){
    return true;
  }
  const isShow=type==='show' || !type;
  let ok=0;
  for (let i = 0; i < depend.length; i++) {
    let {type,key,like,value}=depend[i];
    let _findItem=findItem(type,key);
    let findContent=getItemContent(_findItem);

    if(like==='in' && typeof value==='object'  && typeof findContent==='object'){
      let res=_.intersection(value,findContent).length>0; // 数组求交集
      res && ok++;
      continue;
    }
    let res=compareValues(findContent,like,value);
    res && ok++;
    console.log(formItem.name,'itemIsShow:'+(isShow?'show':'hide')+i,res,value,"find->",findContent);
  }
  formItem.isShow=ok===depend.length?isShow:!isShow;
  if(formItem.content==='(隐藏)' && formItem.isShow){
    formItem.content='';
  }else if(formItem.content!=='(隐藏)' && !formItem.isShow){
    formItem.content='(隐藏)';
  }
  return formItem.isShow;
}


// 监听元素列表变化
watch(formItemList,(newList,oldList)=>{
  itemListOnChange(newList,oldList);
},{deep:true});


//元素列表变化(防抖)
const itemListOnChange=_.debounce((newList,oldList) => {
  newList?.forEach((item,i)=>{

    //监听content变化
    if(item.input_type!=='table' && vData.formData[item?.input_name]!==item?.content){
      contentOnChange(item,vData.formData[item?.input_name])
      vData.formData[item?.input_name]=item?.content;
    }

    //监听子表单content变化
    if(item.input_type==='table' && item?.table_items?.length>0){
      item?.table_items.forEach((table_item_rows)=>{
        table_item_rows.forEach((table_item)=>{
          if(vData.formData[table_item?.input_name]!==table_item?.content){
            contentOnChange(table_item,vData.formData[table_item?.input_name])
            vData.formData[table_item?.input_name]=table_item?.content;
          }
        })
      })
    }

  })
},800)

//表单内容更改事件
const contentOnChange=(formItem,oldContent)=>{
  console.log('contentOnChange',typeof oldContent+":",oldContent,"=>",formItem.content);
  vData.formDataIsChange=true;
  //更新其他表单
  let list_affected = _.uniq(_.concat(
      vData.depend.code2?.[formItem.code2] || [],
      vData.depend.code?.[formItem.code] || [],
      vData.depend.item_id?.[formItem.item_id] || [],
      vData.depend.input_name?.[formItem.input_name] || []
  ));

  if(list_affected?.length>0){
    console.log("\tlist_affected",formItem.input_name,'=>',list_affected);
    list_affected.forEach((input_name)=>{
      let itemFind= findItemByInputName(input_name);
      itemFind?.search_config===undefined || itemSearch(itemFind,null,false);
    });
  }

}

//判断表单内容是否为空
const contentIsEmpty=(value,numberZeroIsEmpty=false)=>{
  if(value===0 || (typeof value==='string' && value.length>0 && parseNumber(value)===0)){
    return numberZeroIsEmpty;
  }
  return  isEmpty(value) || defaultData.emptyStr.includes(value);
}



//获取指定input_name的表单item
const findItemByInputName=(input_name)=>{
  let {item_index,row_index,col_index}=vData.itemIndex?.[input_name];
  if(item_index===undefined){
    return ;
  }
  let item=formItemList.value[item_index];
  if(row_index!==undefined){
    item=item.table_items?.[row_index]?.[col_index];
  }
  if(item?.input_name!==input_name){
    console.error('findItemByInputName error',input_name,item_index,row_index,col_index,item?.input_name);
    return ;
  }
  return item;
}

//获取指定键的表单数据
const findItem=(type,key,rowIndex,tableInputName,tableInputField='input_name')=>{
  let findKey=typeof key==='string'?key.toUpperCase():key;
  let item;
  if(rowIndex===undefined){
    //普通表单搜索
    item = _.find(vData.items,{[type]:findKey});
  }else{
    //表格搜索
    let tableItem= _.find(formItemList.value,{[tableInputField]:tableInputName});
    item = _.find(tableItem?.table_items[rowIndex],{[type]:findKey});
    if(item===undefined){
      //表格没有，在外面找
      return findItem(type,key);
    }
  }
  if(item===undefined){
    console.warn('findItem error ',type,key,rowIndex,tableInputName);
  }
  return item;
}

//获取指定键的表单content
const getItemContent=(item,defaultValue)=>{
  if(item===undefined){
    return ;
  }
  let content=contentIsEmpty(item?.content)?  (defaultValue || '' ):item?.content;
  if(item.input_type==='number' && content!==''){
    content=parseNumber(content,defaultValue);
  }
  if(item.input_unit==='%' && typeof content==='number'){
    content=content/100;
  }
  return content;
}




//页面切换
const changeSheet=async (type,update=true)=>{
  if(vData.formDataIsChange){
    let validateResult=await  formRef.value.validate();
    if (validateResult !== true) {
       dialog.error("请检查表单数据是否正确");
      return ;
    }
    if(!await doSubmit()) return ;
  }
  let sheet_index;
  if(type==='previous' && vData.sheet_index===0){
    sheet_index='start';
  }else if(type==='next' && vData.sheet_index==='start'){
    sheet_index=0;
  }else if(type==='next' && vData.sheet_index===vData.sheet_data.length-1){
    sheet_index='end';
  }else{
    sheet_index=type==='previous'?vData.sheet_index-1:vData.sheet_index+1;
  }
  await loadPage(sheet_index,update);
  if(formItemList.value.length===0 && sheet_index!=='end'){
    //没有表单数据，自动切换到下一页
    await changeSheet('next');
  }
};


//初始化页面
const loadPage=async (sheet_index,update=false)=>{
  vData.isReady=false;
  vData.formDataIsChange=false;
  vData.sheet_index=sheet_index;
  vData.sheet_status=vData.sheet_data?.[sheet_index]===undefined?true:(vData.sheet_data?.[sheet_index]?.['status']);
  vData.sheet_status ||  dialog.info('本页面已隐藏')
  if(update || apiData.items.length===0){
    await getDetail();
  }
  formItemList.value=[];
  vData.formCommonData={
    PLANT_ID:apiData.table?.plant_id || 0,
    JOB_ID:apiData.table?.job_id || 0,
    USER_ID:siyi.user.id,
    USER_NAME:siyi.user.nickname,
    JOB_DATE_0:apiData.table?.job_date || '',
    JOB_SN_0:apiData.table?.job_sn || '',
    CUSTOMER_CODE_0:apiData.table?.customer_code || '',
  };
  vData.formData=_.cloneDeep(vData.formCommonData);
  await initForm(sheet_index);
  itemSearchAll();
  vData.isReady=true;
};


//加载本页面表单数据
const initForm = async (sheet_index) => {
  vData.depend={code:{},code2:{},item_id:{},input_name:{}};
  vData.affected=[];
  vData.rules={};
  let item_index=0;
  vData.items?.map((item) => {
    //table子元素 获取非本sheet的表单
    if (item?.pid > 0 || (item?.sheet_index !== sheet_index && item?.sheet_index?.toString() !== sheet_index?.toString())) {
      return item;
    }
    item=initItem(item);
    item.item_index=item_index;
    // 子表单处理
    if (item.input_type === 'table') {
      item=initTableItem(item)
    }

    vData.itemIndex[item.input_name]={
      item_index:item_index,
    }
    //初始化表单列表
    formItemList.value.push(item);
    item_index++;

    //初始化表单值
    vData.formData[item.input_name] =  item?.content;

    return item;
  })
}

//初始化表单item
const initItem=(item,row_index,parent_item)=>{
  console.log('initItem',item.name,item);
  item.isMulti=defaultData.inputTypeMulti.includes(item?.input_type);
  item.isSelect=defaultData.inputIsSelect.includes(item?.input_type);
  item.input_name=item.item_id + "_" + (row_index===undefined?'':row_index);
  item.isShow=true;
  item.inputting=false;
  item.code=item.code.toUpperCase();
  item.code2=item.code+(row_index===undefined?'':('_'+row_index));
  item.popupVisible=false;
  if (item.input_config.bind===undefined)  item.input_config.bind={};
  if (item.input_config.list_bind===undefined)  item.input_config.list_bind={};
  if (item.input_config.item_bind===undefined)  item.input_config.item_bind={};
  if (item.search_config.depend===undefined)  item.search_config.depend=[];

  //初始化input_options
  if (item.isSelect) {
    item.select_options = [
      {group: '推荐', children: [],},
      {group: '默认', children: item.input_options.map((option) => {
          return {
            label: option?.label || option,
            value: option?.value || option,
          }
        })
      }
    ];
    item.select_options[1]['children'].push({label:'/',value:'/'}); //增加空选项
    //给非表格select增加空选项
    // row_index!==undefined && item.select_options[1].push({label:'/',value:'/'});
  }


  //根据条件，求默认值
  if(item.search_config?.default && contentIsEmpty(item.content)){
    let localData= getLocalData(item.search_config.default,item);
    console.log("\t", 'localData', localData);
    if(!contentIsEmpty(localData)){
      vData.formDataIsChange=true;
      if(item.isSelect)  item.select_options[0]['children'].push(localData);
      item.content=item.isMulti?[localData['value']]:localData['value'];
    }
  }

  //初始化验证规则
  if(row_index===undefined || row_index<parent_item.input_config?.table?.minRows){
    let message=item.name  + (row_index===undefined?'':(row_index+1));
    let defaultRules=[{"required": true, "message": message + "必填"}];
    if(item.input_type==='number'){
      defaultRules.push({"min":0.0000000001,"message": message + "不能<0"});
    }
    vData.rules[item.input_name] = item?.rules_config?.length > 0 ? item?.rules_config : defaultRules;
  }

  //记录依赖关系
  if (item.search_config?.depend?.length > 0) {
    item.search_config.depend.forEach(({type,key})=>{
      if(!['code','item_id'].includes(type)){
        return ;
      }
      //格式化依赖KEY(转大写)
      key=typeof key==='string'?key.toUpperCase():key;
      if(type==='code' && row_index!==undefined){
        type='code2';
        key=key+'_'+row_index;
      }

      if (typeof vData.depend?.[type]?.[key] === 'undefined') {
        vData.depend[type][key] = [];
      }
      vData.depend[type][key].push(item.input_name); //记录 type和key 会影响到的表单
    })
    vData.affected.push({input_name:item?.input_name}); //记录会受别人影响的表单
  }

  //数字转文本
  if(item.input_type==='text' && typeof item.content==='number'){
    item.content+='';
  }

  return item;
}

//初始化子表
const initTableItem=(item)=>{
  const old_items=item?.table_items || [];
  const col_fields=item?.input_options || []; //列对应的field
  item.table_items = [];
  //表单值解析
  let table_content = typeof item.content==='string'? JSON.parse(item.content) : item.content;
  let rowMax=Math.max(table_content?.length || 0, item.input_config.table.maxRows);
  for (let i = 0; i < rowMax; i++) {
    item.table_items[i] = [];
    let col_index=0;
    col_fields?.forEach((col_field_id) => {
      let table_item = _.cloneDeep(_.find(vData.items, {'id': col_field_id}));
      if(table_item===undefined || table_item.status!==1){
        return ;
      }
      table_item= initItem(table_item,i,item);
      //获取子表单的值
      let table_item_content =  old_items?.[i]?.[col_index]?.content || table_content?.[i]?.[table_item.item_id];
      //默认值
      if(i<item?.input_config?.table?.minRows && contentIsEmpty(table_item_content)){
        table_item_content=contentIsEmpty(table_item.content)?table_item?.input_default:table_item.content;
      }
      vData.itemIndex[table_item.input_name]={
        item_index:item.item_index,
        row_index:i,
        col_index:col_index,
      };
      //初始化子表单列表
      item.table_items[i].push({...table_item,
        content: table_item_content,
        rowIndex:i,
        colIndex:col_index,
        tableInputName:item?.input_name
      });
      col_index++;
      //初始化子表单值
      vData.formData[table_item.input_name] =  table_item_content;
    })
  }
  return item;
}



//自动填充表单数据
const itemSearchAll=()=>{
  vData.affected.forEach(({input_name})=>{
    let item=findItemByInputName(input_name);
    item && itemSearch(item,null,false);
  })
}


//远程搜索（防抖）
const itemSearchDelay =_.debounce((formItem,e)=>{
    itemSearch(formItem,e,false);
},800);

//字段填充搜索
const itemSearch= async (formItem,e,showMsg=true) => {
  let {search_config,content,input_default}=formItem;
  let query = {...search_config.query, search: typeof e === 'string' ? e : '', field_id: formItem.id,};
  console.log('itemSearch',formItem?.code,formItem?.name,e,search_config);


  if(!query?.status) {
    //未开启配置
    if(contentIsEmpty(content,true) && !contentIsEmpty(input_default)  && formItem.isShow){
      formItem.content =input_default;// 有默认值，赋予默认值
    }
    return;
  }

  if (search_config?.query?.search && contentIsEmpty(query.search)) {
    console.log("\tsearch is empty", e);
    return;// 要求输入,但是输入为空
  }

  const updateCallback=['getAvg','betweenAvg','zfSideNum','BXGYBX'];// 需要更新的回调
  if (!search_config?.query?.search && !contentIsEmpty(content,true) && content!==input_default
      && !updateCallback.includes(query?.callback)) {
          console.log("\t content is not empty",typeof content,content);
          return;// 不要求搜索,但已经有值了
  }

  //依赖字段数据
  let dependDataList = getDependDataList(formItem, showMsg);
  console.log("\t", 'dependData', dependDataList);
  if (dependDataList === false) {
    return; // 有要求依赖,但未找到依赖数据
  }

  let optionList = [];

  if (query?.action && query.action !== 'callback') {
    // 获取远程数据
    optionList = await getRemoteData(query, dependDataList,formItem);
  }else{
    // 获取回调方法数据
    const callback=searchCallback?.[query?.callback] || searchCallback._default;
    optionList = callback?callback(query, dependDataList, formItem) : [];
  }

  //格式化
  if (query?.formatter) {
    const formatter=formatterCallback?.[query.formatter] || formatterCallback.pregMatch;
    optionList = formatter(optionList, formItem);
  }

  console.log("\toptionList", optionList,query, dependDataList, formItem);

  if (optionList?.length < 1) {
    //  dialog.error(formItem.name + "未找到匹配数据");
    return;
  }

  if (formItem.isSelect) {
    //input_options合并去重
    optionList.forEach(item=>{
      if(typeof item.value==='string' && item.value.indexOf("0")!==0){
        // 0 开头的 客户代码排除
        item.value=parseNumber(item.value,item.value);
      }
      if(formItem.select_options[0]['children'].findIndex(option=>option.value===item.value)===-1){
        formItem.select_options[0]['children'].push(item);
      }
    })
  }

  if (formItem.isSelect && formItem.isMulti) {
    formItem.content = _.map(optionList, 'value');
  } else if (optionList?.length === 1) {
    //数字类型，自身没有值，但是返回是0，就不填
    if(formItem.input_type==='number' && formItem.content==='' && optionList[0]['value']===0){
      return ;
    }
    formItem.content = optionList[0]['value'];
  }
}


//获取依赖字段数据
const getDependDataList = (formItem, showMsg = true) => {
  const {rowIndex, tableInputName,search_config:{depend}} = formItem;
  let dependDataList = [...depend]; //依赖字段数据
  for (let dependConfig of dependDataList) {
    const {type, key,index,table} = dependConfig;
    if(type!=='code' && type!=='item_id' && dependConfig){
      // 固定参数
      continue;
    }
    let findKey = typeof key === 'string' ? key.toUpperCase() : key;
    let content = vData.formCommonData?.[findKey];
    if (contentIsEmpty(content)) {
      let item;
      if(typeof index==='number' && typeof table==='string'){
        //表格搜索
        item = findItem(type, findKey,index, table,'code');
      }else{
        //表单搜索
        item = findItem(type, findKey,rowIndex,tableInputName);
      }
      content = getItemContent(item);
      if (contentIsEmpty(content)) {
        let msg = item?.name || (type + ":" + findKey);
        showMsg && dialog.warning(`请先填写【${msg}】`);
        return false;
      }
    }
    dependConfig.search = content;
  }
  return dependDataList;
};


//获取本地数据
const getLocalData = (defaultConfigList, item) => {
  let content;
  let defaultConfig = _.isArray(defaultConfigList) ? defaultConfigList[0] : defaultConfigList;
  if (defaultConfig?.callback) {
    content = defaultCallback?.[defaultConfig.callback](defaultConfig || {}, item);
  } else {
    let item = findItem(defaultConfig.type, defaultConfig.key);
    content = contentIsEmpty(item?.content) ? vData.formData?.[defaultConfig.key] : getItemContent(item);
  }
  if (content) {
    return {value: content, label: content};
  }
  return {};
}

//获取远程数据
const getRemoteData = async (query, dependDataList,formItem) => {
  if (dependDataList) {
    query = {field: 'parameterValue', ...query, source_id:formItem.source_id, source_type:formItem.source_type};
  }
  let result = await http.post(_apiUrl.remote, dependDataList, {params: query});
  let remoteData = result?.data?.data || [];
  if (result.data.code !== 20000 || typeof remoteData !== 'object' || remoteData.length === undefined) {
     dialog.error(result.data.message);
    return;
  }
  return remoteData;
}




/**
 * 获取数字的范围
 * @param rule
 * @param dependList 依赖的数据
 * @returns {{minValue: number, baseValue: number, maxValue: number}|boolean}
 */
const getNumberScope=(rule,dependList)=>{
  let {min, min_ratio, max, max_ratio, content, fixed,min_ratio_ratio,max_ratio_ratio}=rule;
  const fixValue = typeof fixed === 'number' ? fixed : 0;
  let baseValue=0,minValue=0, maxValue=0,minReal,maxReal;

  baseValue = content ? _.find(dependList, {key: content})?.search : 0;
  console.log('baseValue',baseValue);

  // baseValue 是范围 (eg: 0-20 )
  if(typeof baseValue==='string' && baseValue.indexOf('-')>0){
    [minValue,maxValue]=baseValue.split('-').map(Number);
    console.log('minValue,maxValue',minValue,maxValue);
    if(typeof min==='number') minValue=minValue+min;
    if(typeof max==='number') maxValue=minValue+max;
  }else if(typeof baseValue==='string' && baseValue.indexOf('±')>0){
    // baseValue 是范围 (eg: 100±10)
    let tmpValue=0;
    [baseValue,tmpValue]=baseValue.split('±').map(Number);
    minValue=baseValue-parseNumber(tmpValue,0);
    maxValue=baseValue+parseNumber(tmpValue,0);
  }else{
    baseValue=parseNumber(baseValue,0);
    if(typeof min==='string') min=_.find(dependList, {key: min})?.search; //从依赖转换
    if(typeof max==='string') max=_.find(dependList, {key: max})?.search;//从依赖转换

    if(typeof min==='string' && min.indexOf('%')>0){
      // 最小值 是百分比，转换为小数
      min_ratio=parseNumber(min,'');
      min=undefined;
    }else{
      min=parseNumber(min,'');
    }

    if(typeof max==='string' && max.indexOf('%')>0){
      // 最大值 是百分比，转换为小数
      max_ratio=parseNumber(max,'');
      max=undefined;
    }else{
      max=parseNumber(max,'');
    }

    //baseValue 有值
    if (typeof baseValue==='number' && baseValue > 0) {
      if(typeof min_ratio==='string') min_ratio=parseNumber(_.find(dependList, {key: min_ratio})?.search,'');//从依赖转换,如果是百分比转小数
      if(typeof max_ratio==='string') max_ratio=parseNumber(_.find(dependList, {key: max_ratio})?.search,'');//从依赖转换,如果是百分比转小数

      if(typeof min!=='number' && typeof min_ratio==='number'){
        // baseValue 的百分比
        min=baseValue*min_ratio;
      }
      if(typeof max!=='number' && typeof max_ratio==='number'){
        // baseValue 的百分比
        max=baseValue*max_ratio;
      }
      minValue = baseValue - min; //最小值
      maxValue = baseValue + max; //最大值
    }else{
      //baseValue 无值
      minValue= typeof min==='number'?min:0;
      maxValue= typeof max==='number'?max:9999;
    }
  }

  //在现有范围内，再缩小范围
  if(typeof min_ratio_ratio==='number'){
    minReal=minValue+(maxValue-minValue)*min_ratio_ratio;
  }
  if(typeof max_ratio_ratio==='number'){
    maxReal=maxValue-(maxValue-minValue)*max_ratio_ratio;
  }

  //保留小数位数
  minValue=typeof minValue==='number'?Number(minValue.toFixed(fixValue)):0;
  maxValue=typeof maxValue==='number'?Number(maxValue.toFixed(fixValue)):0;

  return {baseValue,minValue,maxValue,minReal,maxReal,fixValue};
}

// 获取AB之间的随机数，且是AB之间的倍数
const  getRandomMultiple=(A, B, N)=>{
  if (A > B) {
    throw new Error("A should be less than or equal to B.");
  }
  // 计算 A 和 B 之间的可用的 N 的倍数
  const minMultiple = Math.ceil(A / N) * N; // A 的下一个倍数
  const maxMultiple = Math.floor(B / N) * N; // B 的上一个倍数
  // 检查是否存在可用的 N 的倍数
  if (minMultiple > maxMultiple) {
    throw new Error("No multiples of N exist between A and B.");
  }
  // 计算能够生成的倍数的数量
  const count = (maxMultiple - minMultiple) / N + 1;
  // 生成一个随机索引，并计算出随机的倍数
  const randomIndex = Math.floor(Math.random() * count);
  return minMultiple + randomIndex * N;
}


//搜索回调
const searchCallback = {
  //直接赋值
  _default:(query, dependList, formItem)=>{
    let result=[];
    dependList.map(depend=>{
      depend?.search && result.push({label: depend.search, value: depend.search})
    });
    return result;
  },
  //平均数
  getAvg:(query, dependList, formItem)=>{
    const {fixed} = query?.rule || {fixed:2};
    let numberList=dependList.map(item=>item.search);
    const result=_.mean(numberList).toFixed(typeof fixed==='number'?fixed:2);
    return [{label: result, value: result}];
  },
  //范围平均数
  betweenAvg:(query, dependList, formItem)=>{
    for (const ruleKey in query.rule) {
      if(isNumber(query.rule[ruleKey])){
        query.rule[ruleKey]= Number(query.rule[ruleKey]);
      }
    }
    searchCallback.between(query, dependList, formItem);
    const {min, max} = formItem.input_config.bind;
    const {fixed} = query.rule;
    const result= Number(((parseNumber(min)+parseNumber(max))/2).toFixed(fixed));
    return [{label: result, value: result}];
  },
  //范围随机
  betweenRand: (query, dependList, formItem) => {
    for (const ruleKey in query.rule) {
      if(isNumber(query.rule[ruleKey])){
        query.rule[ruleKey]= Number(query.rule[ruleKey]);
      }
    }
    searchCallback.between(query, dependList, formItem);
    let {baseValue,minValue,maxValue,minReal,maxReal,fixValue:fixed}=formItem.input_config?.scope;
    if (minValue === undefined || maxValue === undefined || minValue>maxValue) {
      return [];
    }
    if(minValue===maxValue){
      return [{label: minValue,value: minValue}];
    }

    if(isNumber(minReal) && minReal!==minValue){
      minValue=minReal;
    }
    if(isNumber(maxReal) && maxReal!==maxValue){
      maxValue=maxReal;
    }

    let result;
    //在范围中，取ratio倍数的随机数
    if (typeof query.rule.ratio === 'number' && query.rule.ratio > 0) {
       result=getRandomMultiple(minValue,maxValue,query.rule.ratio);
    }else{
       result = _.random(minValue * 100000, maxValue * 100000, true) / 100000;
    }

    if (typeof fixed === 'number' && fixed >= 0 && typeof result==='number' && result>0) {
      result = Number(result.toFixed(fixed));
    }

    console.log("\tbetweenRand",[minValue,maxValue],result,formItem.input_config.scope);
    return [{label: result, value: result}];
  },
  //范围
  between: (query, dependList, formItem) => {
    for (const ruleKey in query.rule) {
      if(isNumber(query.rule[ruleKey])){
        query.rule[ruleKey]= Number(query.rule[ruleKey]);
      }
    }
    formItem.input_config.scope=getNumberScope(query.rule,dependList);
    const {minValue,maxValue}= formItem.input_config.scope;
    formItem.input_config.bind.min=minValue;
    formItem.input_config.bind.max=maxValue;
    formItem.input_config.item_bind.help = '范围 ' + minValue + "~" + maxValue;

    console.log("\tbetween",formItem.input_config.scope);

    return [{label: formItem.content, value: formItem.content}];
  },
  //求序号
  indexOption: (query, dependList, formItem) => {
    // 表格，求序号
    const {rowIndex, input_options} = formItem;
    let result = input_options?.[rowIndex] || ''
    return result ? [result] : [];
  },
  //字符面
  zfSideNum:(query, dependList, formItem)=>{
    let value = dependList?.[0]?.search;
    value=typeof value.filter==='undefined'?[]:value.filter(item=>!contentIsEmpty(item));
    const numberAlias={1:"单面",2:"双面"};
    const content=  numberAlias?.[value.length] || '';
    return content? [{label: content, value: content}] : [];
  },
  // 板型
  BXGYBX:(query, dependList, formItem)=>{
    let dataValue = dependList?.[0]?.search;
    const mapping = [
      { keyword: '金', type: '金板' },
      { keyword: '银', type: '银板' },
      { keyword: '锡', type: '锡板' },
      { keyword: 'OSP', type: 'OSP板' }
    ];
    const valueLit=[];
    dataValue.map(item => {
      const match = mapping.find(({ keyword }) => item.includes(keyword));
      return valueLit.push(match ? match.type : item);
    });
    return Array.from(new Set(valueLit)).map(value=>{return {label:value,value}});
  },
};

//格式化的回调
const formatterCallback = {
  //提取整数、小数和百分比
  getNumber: (dataList, formItem) => {
     dataList.map(dataItem => {
      dataItem.value = typeof dataItem.value==='string'?dataItem.value.match(/\b\d+(\.\d+)?%?/g)?.[0] :parseNumber(dataItem.value,0);
    })
    return dataList;
  },
  //转百分比
  percent: (dataList, formItem) => {
     dataList.map(dataItem => {
      dataItem.value = dataItem.value * 100;
    })
    return dataList;
  },
  ozToUmNC:(dataList, formItem)=>{
    //  内层铜厚转换
    let valueBind=formItem.search_config?.query?.params;
    valueBind=!isEmpty(valueBind) ?valueBind: {"Hoz":11.4,"1oz":24.9,"1.5oz":40.3,"2oz":55.7};
    dataList.map(dataItem => {
      if(dataItem.value.indexOf('oz')>0){
        dataItem.value = valueBind?.[dataItem.value] || '';
      }
    })
    return formatterCallback.getNumber(dataList,formItem);
  },
  ozToUmWC:(dataList, formItem)=>{
    // 外层铜厚铜厚单位转换
    let valueBind=formItem.search_config?.query?.params;
    valueBind=!isEmpty(valueBind) ?valueBind: {"Hoz":"","1oz":33.4,"1.5oz":47.9,"2oz":63.3,"2.5oz":78.7};
    dataList.map(dataItem => {
      if(dataItem.value.indexOf('oz')>0){
        dataItem.value = valueBind?.[dataItem.value] || '';
      }
    })
    return formatterCallback.getNumber(dataList,formItem);
  },
  IsEmpty:(dataList, formItem)=>{
    dataList.filter(dataItem=>contentIsEmpty(dataItem.value));
    const isEmpty=dataList.length>0?"否":"是";
    return [{label:isEmpty,value:isEmpty}];
  },
  IsNotEmpty:(dataList, formItem)=>{
    dataList.filter(dataItem=>contentIsEmpty(dataItem.value));
    const isNotEmpty=dataList.length>0?"是":"否";
    return [{label:isNotEmpty,value:isNotEmpty}];
  },
  //正则
  pregMatch:(dataList, formItem)=>{
    const [pattern,index]=formItem.search_config?.query?.params;
    dataList.map(dataItem => {
      const match=dataItem.value.match(new RegExp(pattern));
      dataItem.value = match?.[index || 0] || '';
    })
    return dataList;
  }
}


//默认值的回调
const defaultCallback = {
  getDate: (config, formItem) => {
    const {subtract, add} = config?.params || {};
    let format = formItem.input_config?.bind?.format || (formItem.input_type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
    if(subtract){
      return dayjs().subtract(subtract[0],subtract[1]).format(format);
    }else if(add){
      return dayjs().add(add[0],add[1]).format(format);
    }
    return dayjs().format(format);
  }
};

//增加行
const tableAddRow=(formItem)=>{
  formItem.input_config.table.maxRows++;
  initTableItem(formItem);
};


//删除行
const tableDelRow=(formItem)=>{
  formItem.input_config.table.maxRows--;
  initTableItem(formItem);
};

//隐藏/显示 本页
const showSheet=()=>{
  vData.formDataIsChange=true;
  vData.sheet_status=!vData.sheet_status;
  vData.sheet_data[vData.sheet_index]['status']=vData.sheet_status;
  doSubmit();
}


//提交数据
const doSubmit = async () => {
  if(vData.isLoading){
    return ;
  }
  let form = [];
  vData.isLoading=true;
  formItemList.value?.map((item) => {
    //处理子表单
    let content_list = [];
    item?.table_items?.forEach((table_items, i) => {
      content_list[i]={};
      table_items?.forEach((table_item) => {
        if(table_item.content!=='' && table_item.content!==undefined){
          content_list[i][table_item.item_id] = table_item.content;
        }
      })
    })
    form.push({
      id: item?.content_id || 0,
      content: content_list.length>0?content_list: item.content,
      input_type: item.input_type,
      item_id: item.item_id,
      field_id: item.field_id,
      field_code: item.code,
    });
  })
  let result = await http.post(_apiUrl.save, {
    plant_id: apiData.table.plant_id,
    tpl_id: apiData.table.tpl_id,
    table_id: apiData.table.id,
    sheet_index: vData.sheet_index,
    form: form,
    tpl_data:{...apiData.table.tpl_data,sheet_data:vData.sheet_data},
  });
  vData.isLoading=false;
  if (result.data.code !== 20000) {
     dialog.error(result.data.message);
    return;
  }
   dialog.success('保存成功');
  return true;
}

//保存事件
const onSubmit = async ({validateResult, firstError}) => {
  if (validateResult !== true) {
     dialog.warning(firstError);
    return;
  }
  await doSubmit() && await loadPage(vData.sheet_index, true);
}

//导出事件
const onExport = async (e, type = 'excel') => {
  vData.isLoading = true;
  let result = await http.get(_apiUrl.export, {params: {id: apiData.table.id, type: type}});
  vData.isLoading = false;
  let url = result.data?.data?.url || '';
  if (result.data.code !== 20000 || url.length < 1) {
     dialog.error(result.data.message);
    return;
  }
   dialog.success('导出成功');
  vData.msgText="导出成功: "+result.data?.data?.name;
  core.files.downloadFile(url);
}

const openMi = () => {
  let jobId = apiData.table.job_id;
  let jobSn = vData.formData?.['JOB_SN'] || apiData.table.job_sn;
  let url = "https://erp.ltepcb.com:52023/cimforce/frameset?__report=report/erp_report/print_module_mi01.rptdesign&__format=pdf&__masterpage=true&reportId=3099&orderId=" + jobId + "&__filename=" + jobSn;
  window.open(url);
}


//获取数据
const getDetail = async () => {
  vData.isLoading=true;
  let result = await http.get(_apiUrl.detail, {params: {id: vData.id,}});
  vData.isLoading=false;
  if (result.data.code !== 20000) {
     dialog.error(result.data.message);
    return;
  }
  apiData.table = result?.data?.data?.table || {};
  apiData.tpl = result?.data?.data?.tpl || {};
  apiData.items = result?.data?.data?.items || [];
  vData.items = _.cloneDeep(apiData.items);
  if(apiData.table.tpl_data?.sheet_data &&  apiData.table.tpl_data?.sheet_data.length===apiData.tpl?.sheet_data.length){
    vData.sheet_data=_.cloneDeep(apiData.table.tpl_data?.sheet_data);
  }else{
    vData.sheet_data=_.cloneDeep(apiData.tpl?.sheet_data).map((title,index)=>{
      return {index,title,status:true};
    })
  }
  flyImage.files=_.cloneDeep(apiData.table?.img_data || []);
  flyImage.init();
}

const pageClose = () => {
  vData.id = 0;
  localStorage.removeItem('form_table_id');
  siyi.navHide=false;
  navTo('form_table_list_v240620', {detailId: 0});
}

const handleKeyDown=(event)=>{
  if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    event.preventDefault();
    if(vData.formDataIsChange){
         doSubmit()
    }else{
      dialog.info('表单未修改，无需保存');
    }
  }else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyP') {
    event.preventDefault();
    onExport(event);
  }else if (event.code === 'PageUp') {
    event.preventDefault();
    changeSheet('previous')
  }else if (event.code === 'PageDown') {
    event.preventDefault();
    changeSheet('next')
  }
}

// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(async () => {
  let queryId=getQuery('id',false) || localStorage.getItem('form_table_id');
  queryId=parseNumber(queryId,null);
  if (queryId < 1) {
    navTo('form_table_list_v240620', {detailId: 0});
    return;
  }
  if (vData.id !== queryId) {
    vData.id = queryId;
    localStorage.setItem('form_table_id',queryId.toString());
    await loadPage('start', true);
  }
  siyi.navHide=true;
})

onMounted(() => {
  document.body.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.body.removeEventListener('keydown', handleKeyDown);
});

const flyImage=reactive({
  windowRatio:window?.devicePixelRatio || 1,
  baseWidth:120,
  zoom:1,
  scale:{
    max: 10,
    min: 1,
    step: 0.5,
    defaultScale:1,
  },
  isDragging:false,
  offset:{x: 0, y: 0},
  index:0,
  files: [],
  url:'',
  bind:{
    style:{
      width:"120px",
      right:'50px',
      top:'100px',
      zIndex:9999,
    },
  },
  init:()=>{
    flyImage.files.map(item=>{
      item.url=item?.url || item?.response?.data.url || (window.location.origin+'/'+item?.path)
    }).filter(item=>item?.url?.length);
    flyImage.imgs=flyImage.files.filter(item=>['jpg','png'].includes(item?.type || ''));
    flyImage.show(0);
    if(flyImage.files.length>0){
      flyImage.bind.style.width=200+'px';
    }else{
      flyImage.bind.style.width=flyImage.baseWidth+'px';
    }
  },
  show:async (index)=>{
    isNumber(index) && (flyImage.index=index);
    flyImage.url=flyImage.files[flyImage.index]?.url;
    if(flyImage.files[flyImage.index]?.type.indexOf('pdf')>=0){
      flyImage.url=await pdfToImg(flyImage.url,5)
    }
  },
  on:{
    drag: (e) => {
      let left=e.pageX-flyImage.offset.x;
      let top=e.pageY-flyImage.offset.y;
      if(left<0 || top<0
          || left>document.body.clientWidth-e.target.clientWidth
          || top>document.body.clientHeight-e.target.clientHeight
      ){
        return ;
      }
      flyImage.bind.style.left = left + 'px';
      flyImage.bind.style.top = top+ 'px';
    },
    dragstart:(e)=>{
      flyImage.isDragging=true;
      flyImage.offset.x=e.offsetX;
      flyImage.offset.y=e.offsetY;
    },
    dragend: (e) => {
      flyImage.isDragging=false;
      flyImage.offset={x:0,y:0};
    },
    mouseover:(e)=>{
      // console.log('mouseover',e);
      // if(flyImage.isDragging) return;
      // flyImage.zoom=flyImage.zoom*5;
      // flyImage.bind.style.width=flyImage.windowRatio*flyImage.zoom*flyImage.baseWidth+'px';
    },
    mouseout:(e)=>{
      // console.log('mouseout',e);
      // if(flyImage.isDragging) return;
      // flyImage.zoom=flyImage.zoom/5;
      // flyImage.bind.style.width=flyImage.windowRatio*flyImage.zoom*flyImage.baseWidth+'px';
    },
    wheel:(e)=>{
      if (e.deltaY > 0) { // 缩小
        flyImage.zoom=flyImage.zoom<1?1:flyImage.zoom-=0.1;
      }else{
        flyImage.zoom=flyImage.zoom+=0.1;
      }
      flyImage.bind.style.width=flyImage.windowRatio*flyImage.zoom*flyImage.baseWidth+'px';
    },
    click:()=>{
      // flyImage.index++;
      // flyImage.index=flyImage.index<0?0:flyImage.index;
      // flyImage.index=flyImage.index>=flyImage.files.length?0:flyImage.index;
      // console.log('click',flyImage.zoom)
    }
  }
});

//上传组件
const uploader=reactive({
  option:{
    placeholder:'',
    theme:"file",
    action:"/api/"+apiUrl.common.uploader,
    headers:getHttpDefaultHeaders(),
    accept:'image/*,.pdf',
    sizeLimit:{ size: 10, unit: 'MB' },
    multiple:true,
    style:'text-align:center',
    triggerButtonProps:{"content":"上传图片"},
  },
  event:{
    validate:({type}) => {
      const messageMap = {
        FILE_OVER_SIZE_LIMIT: '文件大小超出限制, 最大支持10MB',
        FILES_OVER_LENGTH_LIMIT: '文件数量超出限制，仅上传未超出数量的文件',
        FILTER_FILE_SAME_NAME: '不允许上传同名文件',
      };
      messageMap[type] && dialog.warning(messageMap[type]);
    },
    success: (params) => {
      params.response.map(({code, message, data}) => {
        if (code !== 20000 || isEmpty(data.url)) {
          dialog.info(message || '上传失败');
        }
      });
      console.log('flyImage',flyImage.files);
      flyImage.init();
      uploader.event.save();
    },
    remove:(e)=>{
      console.log('remove',e);
      if(!confirm('是否删除'+flyImage.files[e.index]['name']+'？')){
        return ;
      }
      flyImage.files.splice(e.index,1);
      if(e.index===flyImage.index){
        flyImage.index-=1;
      }
      flyImage.init();
      uploader.event.save();
    },
    save:()=>{
      const img_data=flyImage.files.map(item=>item?.response?.data || {}).filter(item=>item?.url);
      http.post(_apiUrl.set,{id:vData.id,img_data}).then((result)=>{
        if (result.data.code !== 20000) {
          dialog.error(result.data.message);
        }
      });
    },
  }
});


</script>


<style>
.t-select-option-group .t-select__list{
  padding-left: 20px !important;
}
.siyi-right {
  overflow: scroll !important;
}
.siyi-form-table-detail {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  overflow: scroll !important;

  > .row {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .table_helper{
    font-size: 12px;
    color: gray;
    text-align: center;
  }

  > .row1 {
    .step {
      padding: 30px 10px;
      flex-grow: 1;
      overflow: auto;

      .t-steps--horizontal.t-steps--dot-anchor .t-steps-item__content{
        width:120px;
      }

      .t-steps--horizontal.t-steps--dot-anchor .t-steps-item:not(:last-child)::after{
        left: calc(120px / 2 + 5px);
        width: calc(100% - 18px);
      }

     .t-steps .t-steps-item{
       margin-right:0;
     }
    }
  }

  > .row2 {
    flex-grow: 1;
    justify-content: center;
    align-items: center;

    .t-input.t-is-readonly{
      background-color: #f5f5f5;
    }

    .t-card__actions .t-button{
      margin-right: 5px;
    }

    .emptyBox{
      width: 50%;
      height: 100px;
      line-height: 70px;
      margin: 0 auto 50px;
      text-align: center;
      p{
        font-size: 16px;
      }
    }

    .t-form {
      width: 100%;
      padding: 20px;
      display: flex;
      flex-wrap: wrap;
    }

    .form_item {
      width: 60%;
      margin: 20px 0 20px 20%;
      .t-form__label {
        width: 180px !important;
      }
      .t-input-adornment {
        width: 100%;
      }

      .t-input__inner {
        width: 100%;
      }

      .t-input-number {
        width: 100%;
      }


    }

    .show_code{
      .t-form__label {
        width: 250px !important;
      }
    }

    .form_item_many {
      margin: 20px 7.5%;
      width: 35%;
    }

    .form_item_much {
      margin: 20px 0;
      width: 25%;
    }

    .form_item_table {
      width: 100%;
      margin: 10px;

      .t-form__label {
        width: 20px !important;
      }

      .t-form__controls {
        margin-left: 20px !important;
      }

    }

    .form_item_footer {
      width: 100%;
      text-align: center;
      margin: 20px 0;
    }


  }
  .fly-image{
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    position: fixed;
    img{
      cursor: move;
      width: 100%;
      height: 100%;
      display: block;
    }
    .t-upload{
      cursor:pointer;
    }
    .t-list {
      text-align: left;
      .t-list-item-main {
        font-size: 12px;
        line-height: 12px;
      }
    }
  }

  & .siyi-leftHide {
    margin-left: 0;
    .step{
      padding: 30px 0;
    }
  }

}
</style>
