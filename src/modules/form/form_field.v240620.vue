<template>
  <div class="siyi-form-field">

    <div class="row row1'">
      <t-tabs :value="vData.itemQuery.type" @change="(value)=>{getList(value)}" :drag-sort="true" @drag-sort="onDragendType">
        <t-tab-panel value="" label="全部"></t-tab-panel>
        <t-tab-panel :value="index" :label="type" :draggable="true" v-for="(type,index) in vData.typeList">
        </t-tab-panel>
      </t-tabs>
      <div class="filter">
        <t-select v-model="vData.itemQuery.plant_id" label="工厂：" placeholder="请选择工厂" auto-width clearable
                  style="margin-left:50px" :options="userPlantList">
        </t-select>
      </div>
    </div>

    <div class="row row2">
      <t-tabs :value="vData.itemQuery.status" @change="async (value)=>{vData.itemQuery.status=value;await getList()}">
        <t-tab-panel value="" label="全部"></t-tab-panel>
        <t-tab-panel :value="1" label="启用"></t-tab-panel>
        <t-tab-panel :value="0" label="停用"></t-tab-panel>
      </t-tabs>
      <div class="filter">
        <t-input v-model="vData.itemQuery.search" @change="itemFilter" placeholder="" />
        <t-button theme="success" v-show="vData.itemQuery.type==='diy'" @click="onclickAdd"> 添加</t-button>
        <t-button theme="warning" variant="base" @click="onclickImportOpen" v-show="vData.itemQuery.type==='parameter'"> 导入
        </t-button>
        <t-button theme="primary" variant="base" @click="itemFilter"> 筛选</t-button>

        <t-button :theme="vData.isMulti?'primary':'default'" variant="base" style="margin:0 10px"
                  @click="isMultiOn"> 多选 </t-button>
        <t-button theme="success" variant="base" @click="itemSet({status:1})"> 启用 </t-button>
        <t-button theme="warning" variant="base" @click="itemSet({status:0})"> 停用 </t-button>
        <t-button theme="danger" variant="base" @click="itemSet({status:-1})"> 删除 </t-button>
      </div>
    </div>

    <div class="row row3">

      <div class="aside">
          <t-collapse  class="parameterGroupList" :expand-icon="true" :defaultExpandAll="true" :borderless="false" @change="">
            <t-collapse-panel v-for="(groupList,index_list) in vData.groupList" :value="groupList.code" :header="groupList.name">
              <div class="parameterList"  >
                <div v-for="(parameter,index_item) in groupList.children" class="parameter" :data-id="parameter.id" >
                  <t-button :title="parameter.description"  :theme="vData.itemIds.includes(parameter.id)?'primary':'default'"
                            @click="onclickItem" >
                    {{ parameter.label }}
                  </t-button>
                </div>
              </div>
            </t-collapse-panel>
          </t-collapse>

      </div>
      <div class="content">
        <t-form ref="form" :data="formData" scroll-to-first-error="smooth" v-show="vData.btnName">
          <fieldset>
            <legend>字段 · 基本设置</legend>

            <t-form-item label="ID" name="code" v-show="formData.id">
              <t-auto-complete v-model="formData.id" :disabled="true"></t-auto-complete>
            </t-form-item>

            <t-form-item label="标识" name="code">
              <t-auto-complete v-model="formData.code" :disabled="vData.itemQuery.type!=='diy'"></t-auto-complete>
            </t-form-item>

            <t-form-item label="名称" name="name">
              <t-input v-model="formData.name" :disabled="vData.itemQuery.type!=='diy'" />
            </t-form-item>

            <t-form-item label="来源" name="source_type">
              <t-select v-model="formData.source_type" :disabled="true">
                <t-option :key="code" :label="name" :value="code" v-for="(name,code) in vData.typeList"/>
              </t-select>
            </t-form-item>

            <t-form-item label="分组" name="group_name">
              <t-input v-model="formData.group_name" :disabled="vData.itemQuery.type!=='diy'" />
            </t-form-item>

            <t-form-item label="类型" name="input_type">
              <t-select v-model="formData.input_type" :disabled="vData.itemQuery.type!=='diy'">
                <t-option :key="type" :label="title" :value="type"
                          v-for="(title,type) in apiData.config?.input_type?.option"/>
              </t-select>
            </t-form-item>

            <t-form-item label="选项" name="input_options"
                         v-show="_.includes(['select','radio','checkbox','table'],formData.input_type)">
              <t-tag-input v-model="formData.input_options" placeholder="可多个，输入完按回车"
                           excess-tags-display-type="break-line"  clearable dragSort @drag-sort="onDragendOption"/>
            </t-form-item>

            <t-form-item label="默认值" name="input_default">
              <t-input v-model="formData.input_default" />
            </t-form-item>

            <t-form-item label="单位" name="input_unit">
              <t-input v-model="formData.input_unit" />
            </t-form-item>

            <t-form-item label="排序" name="sort">
              <t-input v-model="formData.sort" type="number" min="0" placeholder="越大越靠前" />
            </t-form-item>

            <t-form-item label="状态" name="status">
              <t-radio-group v-model="formData.status">
                <t-radio :value="0">停用</t-radio>
                <t-radio :value="1">正常</t-radio>
              </t-radio-group>
            </t-form-item>

          </fieldset>

          <fieldset>
            <legend>表单配置</legend>
            <t-form-item label="只读">
              <t-switch v-model="formData.input_config.bind.readonly" size="large">
                <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
              </t-switch>
            </t-form-item>

            <t-form-item label="提示文字">
              <t-input v-model="formData.input_config.item_bind.help"/>
            </t-form-item>

            <t-form-item label="保留小数" v-show="formData.input_type==='number'">
              <t-input-number v-model="formData.input_config.item_bind.digits" type="integer" min="0" step="1" max="6"/>
            </t-form-item>

            <t-form-item label="样式:宽(input)">
              <t-input v-model="formData.input_config.bind.style.width"/>
            </t-form-item>

            <t-form-item label="样式:宽(item)">
              <t-input v-model="formData.input_config.item_bind.style.width"/>
            </t-form-item>

            <t-form-item label="样式:宽(list)">
              <t-input v-model="formData.input_config.list_bind.style.width"/>
            </t-form-item>


            <t-form-item label="时间格式化" v-if="['datetime','date'].includes(formData.input_type)">
              <t-input v-model="formData.input_config.bind.format"/>
            </t-form-item>

            <t-form-item label="前缀 - 后缀">
              <t-input v-model="formData.input_config.prepend"/>
              <t-input v-model="formData.input_config.append"/>
            </t-form-item>


          </fieldset>


          <fieldset v-if="formData.input_type==='table'">
            <legend>表格配置</legend>
            <t-form-item label="显示序号">
              <t-switch v-model="formData.input_config.table.showIndex" size="large">
                <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
              </t-switch>
            </t-form-item>

            <t-form-item label="序号占几列" v-if="formData.input_config.table.showIndex">
              <t-input v-model="formData.input_config.table.indexColspan" type="number"/>
            </t-form-item>
            <t-form-item label="序号标题" v-if="formData.input_config.table.showIndex">
              <t-input v-model="formData.input_config.table.indexTitle"/>
            </t-form-item>
            <t-form-item label="序号选项" v-if="formData.input_config.table.showIndex">
              <t-tag-input v-model="formData.input_config.table.indexOption"></t-tag-input>
            </t-form-item>

            <t-form-item label="行限制" v-if="formData.input_config.table.showIndex">
              <t-input v-model="formData.input_config.table.minRows" type="number"/>
              <t-input v-model="formData.input_config.table.maxRows" type="number"/>
            </t-form-item>
          </fieldset>


          <fieldset>
            <legend>条件隐藏</legend>
            <t-form-item label="状态">
              <t-switch v-model="formData.view_config.status" size="large">
                <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
              </t-switch>
            </t-form-item>
            <div v-if="formData.view_config.status">
              <t-form-item label="类型" >
                <t-radio-group v-model="formData.view_config.type">
                  <t-radio value="show">显示</t-radio>
                  <t-radio value="hide">隐藏</t-radio>
                </t-radio-group>
              </t-form-item>
              <!--依赖-->
              <t-form-item label="条件" v-for="(depend,index) in formData.view_config.depend">
                <t-select v-model="depend.type">
                  <t-option label="" value="" />
                  <t-option label="code" value="code" />
                  <t-option label="item_id" value="item_id" />
                </t-select>
                <t-input :autoWidth="false" v-model="depend.key" placeholder="key"/>
                <t-select :autoWidth="false" v-model="depend.like">
                  <t-option v-for="likeValue in compareType" :label="likeValue" :value="likeValue"  />
                </t-select>
                <t-tag-input v-model="depend.value" v-if="depend.like==='in'"></t-tag-input>
                <t-input v-model="depend.value" v-else :autoWidth="false" placeholder="value"/>

                <t-button shape="square" variant="text" class="input-list-btn"
                          @click="inputList.add(formData.view_config.depend,index)"><AddIcon /></t-button>
                <t-button shape="square" variant="text"  class="input-list-btn"
                          @click="inputList.del(formData.view_config.depend,index)"><Delete1Icon /></t-button>
              </t-form-item>
            </div>
          </fieldset>

          <fieldset>
            <legend>EXCEL显示配置</legend>

            <t-form-item label="隐藏">
              <t-switch v-model="formData.view_config.excel_hide" size="large">
                <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
              </t-switch>
            </t-form-item>

            <t-form-item label="合并单元格"  v-show="!formData.view_config.excel_hide">
              <t-button variant="text">列</t-button>
              <t-input v-model="formData.view_config.excel_colspan" placeholder="列" type="number" min="1"/>
              <t-button variant="text">行</t-button>
              <t-input v-model="formData.view_config.excel_rowspan" placeholder="行" type="number"  min="1"/>
            </t-form-item>

            <t-form-item label="如果空" v-show="!formData.view_config.excel_hide">

              <t-button class="button-title"  variant="text">默认值</t-button>
              <t-input v-model="formData.view_config.excel_empty_value" placeholder="默认值"/>

              <t-button class="button-title"  variant="text">隐藏行</t-button>
              <t-input v-model="formData.view_config.excel_empty_hide.row_start" type="number" min="0"/>
              <t-input v-model="formData.view_config.excel_empty_hide.row_end" type="number" min="0"/>

              <t-button class="button-title"  variant="text">隐藏本行</t-button>
              <t-input v-model="formData.view_config.excel_empty_hide.row_this" type="number" min="0"/>

              <t-button class="button-title"  variant="text">隐藏本页</t-button>
              <t-switch v-model="formData.view_config.excel_empty_hide.sheet_this" size="large">
                <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
              </t-switch>

            </t-form-item>
          </fieldset>

          <fieldset>
            <legend>默认值设置</legend>
            <t-form-item label="启用">
              <t-switch v-model="formData.search_config.default.status" size="large">
                <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
              </t-switch>
            </t-form-item>
            <div v-show="formData.search_config.default.status">
            <t-form-item label="类型">
              <t-radio-group v-model="formData.search_config.default.type">
                <t-radio value="code">code</t-radio>
                <t-radio value="item">item</t-radio>
                <t-radio value="callback">回调</t-radio>
              </t-radio-group>
            </t-form-item>
            <t-form-item label="回调" v-if="formData.search_config.default.type==='callback'">
              <t-input v-model="formData.search_config.default.callback" placeholder="回调函数"/>
              <t-input v-model="formData.search_config.default.params" placeholder="参数（JSON）"/>
            </t-form-item>
            <t-form-item label="匹配值" v-else>
              <t-input v-model="formData.search_config.default.like" placeholder="like"/>
              <t-input v-model="formData.search_config.default.key" placeholder="值"/>
            </t-form-item>
            </div>
          </fieldset>

          <fieldset>
            <legend>查询设置</legend>
            <t-form-item label="启用">
              <t-switch v-model="formData.search_config.query.status" size="large">
                <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
              </t-switch>
            </t-form-item>

            <div v-if="formData.search_config.query.status" >
            <t-form-item label="类型" >
              <t-radio-group v-model="formData.search_config.query.action">
                <t-radio value="callback">回调</t-radio>
                <t-radio value="employee">用户</t-radio>
                <t-radio value="param">ERP参数</t-radio>
                <t-radio value="erpSaleOrder">ERP订单</t-radio>
                <t-radio value="erp">ERP通用</t-radio>
              </t-radio-group>
            </t-form-item>

            <!--回调配置-->
            <div v-if="formData.search_config.query.action==='callback'">
              <t-form-item label="回调" >
                <t-select v-model="formData.search_config.query.callback">
                  <t-option label="范围随机" value="betweenRand" />
                  <t-option label="范围" value="between" />
                  <t-option label="找序号" value="indexOption" />
                  <t-option label="DIY:字符面数" value="zfSideNum" />
                  <t-option label="DIY:SZNCCPTH" value="SZNCCPTH" />
                  <t-option label="DIY:SZWCCPTH" value="SZWCCPTH" />
                </t-select>
              </t-form-item>
              <div v-if="['betweenRand','between'].includes(formData.search_config.query.callback)">
                <t-form-item label="值">
                  <t-input :autoWidth="false" v-model="formData.search_config.query.rule.content" placeholder="值来源"/>
                  <t-input :autoWidth="false" v-model="formData.search_config.query.rule.fixed" type="number" min="0" placeholder="保留小数"/>
                </t-form-item>
                <t-form-item label="最小值">
                  <t-input :autoWidth="false"  v-model="formData.search_config.query.rule.min"   placeholder="固定值"/>
                  <t-input :autoWidth="false"  v-model="formData.search_config.query.rule.min_ratio"  placeholder="倍率"/>
                  <t-input :autoWidth="false"  v-model="formData.search_config.query.rule.min_ratio_ratio"  placeholder="取值倍率"/>
                </t-form-item>
                <t-form-item label="最大值">
                  <t-input :autoWidth="false"  v-model="formData.search_config.query.rule.max"  placeholder="固定值"/>
                  <t-input :autoWidth="false"  v-model="formData.search_config.query.rule.max_ratio"  placeholder="倍率"/>
                  <t-input :autoWidth="false"  v-model="formData.search_config.query.rule.max_ratio_ratio"  placeholder="取值倍率"/>
                </t-form-item>
              </div>
            </div>
            <!--远程-->
            <t-form-item label="表" v-else>
              <t-input :autoWidth="false"  v-model="formData.search_config.query.table" placeholder="table" />
              <t-input :autoWidth="false"  v-model="formData.search_config.query.alias" placeholder="alias" />
              <t-input :autoWidth="false"  v-model="formData.search_config.query.field" placeholder="field" />
              <t-input :autoWidth="false"  v-model="formData.search_config.query.alias" placeholder="alias" />
              <t-switch v-model="formData.search_config.query.search" size="large">
                <template #label="slotProps">{{ slotProps.value ? '输' : '否' }}</template>
              </t-switch>
              <t-input :autoWidth="false" placeholder="like"
                       v-model="formData.search_config.query.like"
                       v-if="formData.search_config.query.search" />
            </t-form-item>

            <!--依赖-->
            <t-form-item label="依赖" v-for="(depend,index) in formData.search_config.depend">

              <t-select  v-model="depend.type">
                <t-option label="" value="" />
                <t-option label="code" value="code" />
                <t-option label="item_id" value="item_id" />
              </t-select>
              <t-input  v-model="depend.key" placeholder="key"/>
              <t-input  v-model="depend.field" placeholder="field" v-show="formData.search_config.query.action!=='callback'" />
              <t-input  v-model="depend.like" placeholder="like" v-show="formData.search_config.query.action!=='callback'" />
              <t-input  v-model="depend.alias" placeholder="alias" v-show="formData.search_config.query.action!=='callback'" />
              <t-input  v-model="depend.search" placeholder="search" v-show="formData.search_config.query.action!=='callback'" />

              <t-button shape="square" variant="text" class="input-list-btn"
                        @click="inputList.add(formData.search_config.depend,index)"><AddIcon />
              </t-button>
              <t-button shape="square" variant="text"  class="input-list-btn"
                        @click="inputList.del(formData.search_config.depend,index)"><Delete1Icon />
              </t-button>
            </t-form-item>

            <t-form-item label="格式化函数" >
              <t-input v-model="formData.search_config.query.formatter"/>
            </t-form-item>

            </div>
          </fieldset>


          <fieldset>
            <legend>规则配置</legend>
            <t-form-item label="规则JSON" >
              <t-textarea v-model="formData.rules_config_json" placeholder="JSON配置" :autosize="true" />
            </t-form-item>
          </fieldset>

          <t-form-item>
            <t-space size="small">
              <t-button theme="primary" @click="onclickEdit"> {{ vData.btnName }}</t-button>
              <t-button theme="default" variant="base" @click="formData={...vData.item}"> 重置</t-button>
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
        @confirm="onclickImport(true)"
        @cancel="onclickImport(false)"
        style="max-height: 80vh"
    >
      <template #body>
        <div class="body" style="overflow: scroll;height: 70%">
          <t-input-adornment prepend="搜索:">
            <t-input v-model="treeFilterInput" style="width: 300px" @change="treeFilterEvent"/>
          </t-input-adornment>
          <t-tree
              ref="tree"
              :data="vData.erpList"
              :value="vData.importCodeList"
              :checkable="true"
              :filter="treeFilter"
              @change="onChangeTree"
              hover line
          />
        </div>
      </template>
    </t-dialog>

  </div>
</template>
<script setup>

import {AddIcon,Delete1Icon} from 'tdesign-icons-vue-next';
import dialog from "@/core/script/dialog.js";
import {onActivated, onMounted, reactive, ref} from "vue";
import _ from "lodash";
import {getUserPlantList} from "@/utils/erp.js";
import Sortable from "sortablejs";
import {VxeUI} from "vxe-pc-ui";
import {compareType, parseNumber} from "@/utils/vars.js";
import {http,url as apiUrl} from "@/core/script/api.js";

const userPlantList = getUserPlantList('form-');

// 接口数据
const _apiUrl = apiUrl.form.field;


//默认数据
const defaultData = {
  item: {
    code: '', value: '', group_name: '',rules_config_json:'',
  },
  formData: {
    id:0,
    code: '',
    name: '',
    source_type: 'diy',
    status: 1,
    input_type: 'text',
    input_unit: '',
    is_select: false,
    input_options: [],
    input_config: {
      "bind": {
        "readonly": false, //是否只读
        "format":"",//时间格式化
        "style":{width:''},//样式
        "digits":null,
      },
      "item_bind": {
        "help":"",//文字提示
       "style":{width:''},//样式
      },
      "list_bind": {
       "style":{width:''},//样式
      },
      "prepend":'', //前缀
      "append":'', //后缀
      table: {
        "showIndex": false, //是否显示序号
        "indexColspan": 1, // 序号占几个
        "indexTitle": "位置", //序号标题
        "indexOption": [], //序号选项
        "minRows": 0,//最小填的行数
        "maxRows": 5,//最多显示行数
      },
    },
    search_config: {
      default: {
        "status":false,
        "type":"",
        "key":"",
        "like":"",
        "callback": "",
        "params": {},
        "params_json": "",
      },
      query:{
        status: false,
        "action": "",
        "callback": "",
        "table":"",
        "field":"",
        "alias":"",
        "search":false,
        "like":"%search%",
        "formatter":"",
        "rule":
            {
              "content": "",
              "min": "",
              "min_ratio": "",//最小值（倍率）
              "min_ratio_ratio": "",//取随机值时，再公差范围内，再缩小比例
              "max": "",
              "max_ratio": "",//最大值（倍率）
              "max_ratio_ratio": "",// 取随机值时，再公差范围内，再缩小比例
              "fixed": 2
            }
      },
      depend: [
        {"type": "", "key": "","field":"","like":"","alias":"","search":""}
      ]
    },
    rules_config: [],
    rules_config_json: "",
    view_config: {
      status: false, //自动隐藏
      "type": "show", //类型
      "depend": [ //依赖项
        {
          "type": "",
          "key": "",
          "like": "",
          "value": []
        }
      ],
      "excel_hide":false,//是否在excel中隐藏
      "excel_colspan":1, //合并列数
      "excel_rowspan":1, //合并行
      "excel_empty_value":"", //如果空，默认值
      "excel_empty_hide": {
        "row_start": 0, //如果空，则隐藏 (开始)
        "row_end": 0, //如果空，则隐藏（结束）
        "row_this": 1, // 隐藏本行后面的
        "sheet_this": false, // 隐藏整个sheet
      }
    },
  },
  config: {source_type: {}, input_type: {}, is_diy: false},
  typeList:{'sys': '系统', 'diy': '自定义'},
};


// api返回的数据
const apiData = reactive({
  list: [],
  config:{...defaultData.config},
  erpList: [],
});


//view数据
const vData = reactive({
  typeList: {...defaultData.typeList},
  itemQuery:{
    plant_id:userPlantList?.[0]?.value,
    status:1,
    type:'',
    search:''
  },
  groupList:[],
  itemList:[],
  itemIds:[],
  item: {...defaultData.item},
  erpList: [],
  btnName: '',
  isMulti: false,
  isImport: false,
  importTitle: '',
  importCodeList: [],
});

//表单元素
const form = ref(null);
const formData = ref({...defaultData.formData});



//获取参数列表
const getList = async (type=null) => {
  if (typeof (type) === 'string') {
    vData.itemQuery.type = type;
  }
  let result = await http.get(_apiUrl.list, {params:vData.itemQuery});
  if (result.data.code !== 20000) {
      dialog.error(result.data.message);
    return;
  }
  vData.itemIds=[];
  vData.isMulti=false;
  apiData.list = result?.data?.data?.list || [];
  apiData.config = result?.data?.data?.config || {};
  vData.groupList = _.cloneDeep(apiData.list);
  vData.itemList=vData.groupList.reduce((acc, cur) => {
    return acc?.concat(cur?.children);
  }, []);
  vData.typeList = {...apiData.config?.source_type?.option}
  setTimeout(dragSort);
  onclickItem();
}


//切换参数
const onclickItem = (e) => {
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
  ["input_config","view_config","search_config"].map(key=>{
    // 如果是数组，转成对象
    vData.item[key]=_.isArray(vData.item[key])?{}:vData.item[key];
  });
  formData.value=_.defaultsDeep(vData.item,defaultData.formData);
  formData.value.search_config.default.params_json=JSON.stringify(formData.value.search_config.default.params);
  formData.value.rules_config_json=JSON.stringify(formData.value.rules_config);
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

        const res = await http.post(_apiUrl.sort, {id, leftId, rightId,changeGroup:'group_id'});
        if (res.data.code !== 20000) {
            dialog.error(res.data.message);
        }
        formData.value.id=id;
        await getList();
        itemFilter();
      }
    });
  })
}

//列表筛选
const itemFilter = () => {
  const input = vData.itemQuery.search.toLowerCase();
  if(input.length===0){
    vData.groupList=_.cloneDeep(apiData.list);
  }else{
    vData.groupList.map((groupList, index) => {
      groupList.children = groupList?.children.filter(item => {
        return item?.label?.toLowerCase()?.includes(input)
      })
      return groupList;
    });
  }
  vData.groupList=vData.groupList.filter(item=>item?.children.length>0);
  onclickItem();
}


//添加
const onclickAdd = () => {
  formData.value = {
    ...defaultData.formData, ...{
      group_name: vData.item?.group_name || '默认',
      plant_id: vData.itemQuery.plant_id,
    }
  };
  vData.item = null;
  vData.itemIds=[];
  vData.btnName='添加';
}

//输入列表
const inputList={
  add:(list,index)=>{
    let newItem={};
     Object.keys(list[index]).forEach(key => {
       newItem[key] = '';
    });
    list.splice(index + 1, 0, newItem);
  },
  del:(list,index)=>{
    list.splice(index, 1);
  },
};

//保存
const onclickEdit = async () => {
  formData.value.search_config.default.params=JSON.parse(formData.value.search_config.default.params_json);
  formData.value.rules_config=JSON.parse(formData.value.rules_config_json);
  let post = formData.value;
  let result = await http.post(_apiUrl.edit, post);
  if (result.data.code !== 20000) {
      dialog.error(result.data.message);
    return;
  }
    dialog.success((formData.value?.id ? '添加' : '修改') + '成功');
  await getList();
}


//顶部tabs 拖动排序
const onDragendType = ({currentIndex, targetIndex}) => {
  [vData.typeList[currentIndex], vData.typeList[targetIndex]] = [
    vData.typeList[targetIndex],
    vData.typeList[currentIndex],
  ];
};

//顶部tabs 排序
const onDragendOption = ({currentIndex, targetIndex}) => {
  [formData.value.input_options[currentIndex], formData.value.input_options[targetIndex]] = [
    formData.value.input_options[targetIndex],
    formData.value.input_options[currentIndex],
  ];
};


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
  let result = await http.post(_apiUrl.set, {id:vData.itemIds,...post});
  if (result.data.code !== 20000) {
      dialog.error(result.data.message);
    return ;
  }
    dialog.success('修改成功');
  await getList();
}



//打开导入弹窗
const onclickImportOpen = () => {
  vData.isImport = !vData.isImport
  if (vData.isImport) {
    vData.importTitle = "导入" + vData.typeList?.[vData.itemQuery.type]
    getErpList();
  }
}
//获取ERP中的参数
const getErpList = async (type) => {
  type = type || vData.itemQuery.type;
  let result = await http.get(_apiUrl.erpList, {params: {type: type}});
  if (result.data.code !== 20000) {
      dialog.error(result.data.message);
    return;
  }
  apiData.erpList = result?.data?.data?.list || [];
  vData.erpList = _.cloneDeep(apiData.erpList);
}
//ERP参数筛选
const treeFilterInput = ref(null);
const treeFilter = ref();
const treeFilterEvent = () => {
  treeFilter.value = treeFilterInput.value ? (node) => node.data.label.indexOf(treeFilterInput.value) >= 0 : null;
}


//选中导入的数据
const onChangeTree = (value, e) => {
  vData.importCodeList = value;
}

//导入数据
const onclickImport = async (isSubmit) => {
  if (isSubmit) {
    let result = await http.post(_apiUrl.erpImport, {
          plant_id: vData.itemQuery.plant_id,
          type: vData.itemQuery.type,
          data: vData.importCodeList
        }
    );
    if (result.data.code !== 20000) {
        dialog.error(result.data.message);
      return;
    }
      dialog.success('导入成功');
    await getList(vData.itemQuery.type);
  }
  vData.isImport = false;
}


onActivated(() => {

})

onMounted(() => {
  getList();
})


</script>
<style>
.siyi-form-field {
  display: flex;
  flex-direction: column;

  > .row {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  > .row1, > .row2,
  .row .input, .row .t-select__wrap {
    height: 50px; /* 第一行固定高度为50px */
    line-height: 50px;
  }

  > .row {
    > .filter {
      margin-left: 60px;
      display: flex;
      flex-direction: row;
      align-items: center;

      button {
        margin: 0 2px;
      }
    }
  }


  > .row3 {
    flex-grow: 1;
    height: calc(100vh - 100px);

    > .aside {
      overflow: auto;
      width: 55%;
      padding-bottom: 50px;

      .parameterGroupList {
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
      width: 40%;
      overflow: scroll;
      padding: 0 20px 20px 20px;

      .t-form__item {
        margin-bottom: 12px;
      }

      .t-input__inner{
        width: 100%;
      }
      .input-list-btn{
        padding: 5px;
        margin-left:10px;
      }

    }

  }

  & .siyi-leftHide {
    margin-left: 162px;
  }

  .button-title{
    margin: 0 0 0 8px;
    padding: 0 25px;
  }


  fieldset {
    padding: 20px 50px 20px 20px;
    border: 1px solid var(--td-component-border);
    margin-bottom: 20px;
  }

  legend {
    display: inline-block;
    padding: 0 10px;
    text-align: center;
  }

  .t-dialog__wrap .t-dialog__body .body{
    overflow:auto !important;
  }


}
</style>