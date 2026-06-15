<template>
  <div ref="box" :class="['mainPage','page-'+mainReportConfig.tableConfig.tableId]">
    <TableComponent ref="mainReport" v-if="mainReportShow" v-bind="mainReportConfig"/>
    <dialogComponent v-if="dialogConfig.isShow" v-bind="dialogConfig.bind"  v-on="dialogConfig.on"  >
      <t-form :data="dialogConfig.data" :rules="dialogConfig.rules" @submit="dialogConfig.submit" v-bind="dialogConfig.form">
        <t-row><t-col :span="11" >
          <t-form-item label="ERP参数" name="erp_parameter_id" >
            <t-select v-model="dialogConfig.data.erp_parameter_id" placeholder="请输入ERP参数的名称/编码搜索" filterable clearable :options="dialogConfig.selectOptions.erp_parameter_id"
                      @search="changeDebounce('erp_parameter_search', $event)" @change="dialogConfig.change('erp_parameter_id',$event)" />
          </t-form-item>
          <t-form-item label="参数名称" name="name">
            <t-input v-model="dialogConfig.data.name" />
          </t-form-item>
          <t-form-item label="参数编码" name="code">
            <t-input v-model="dialogConfig.data.code" />
          </t-form-item>
          <t-form-item label="参数分组" name="category">
            <select-input v-model="dialogConfig.data.category"  :options="vData.selectOptions.category"  />
<!--            <t-input v-model="dialogConfig.data.category" />-->
          </t-form-item>

          <t-form-item label="参数组件" name="plugin_name">
            <t-select v-model="dialogConfig.data.plugin_name" filterable clearable
                      @change="dialogConfig.change('plugin_name',$event)"
                      :options="[{label:'无',value:''},...vData.selectOptions.plugin_name]"
            />
          </t-form-item>
          <t-form-item label="物料分类" name="plugin_params.category_ids"  v-if="dialogConfig.data.plugin_name===dData.plugin_name.material_code">
            <t-select v-model="dialogConfig.data.plugin_params.category_ids" filterable clearable multiple reserve-keyword
                      :options="vData.selectOptions.erp_category_ids"
                      @change="(value,context)=>dialogConfig.change('plugin_params.category_ids',value,context)" />
          </t-form-item>

          <t-form-item label="物料名称" name="plugin_params.material_name"  v-if="dialogConfig.data.plugin_name===dData.plugin_name.material_code">
            <t-input v-model="dialogConfig.data.plugin_params.material_name" placeholder="物料关键词（名称或编码,多个用空格隔开），选填" />
          </t-form-item>

          <t-form-item label="数量参数" name="plugin_params.parameter_num"  v-if="dialogConfig.data.plugin_name===dData.plugin_name.material_code">
            <t-input v-model="dialogConfig.data.plugin_params.parameter_num" placeholder="关联的数量字段code" />
          </t-form-item>

          <t-form-item label="物料最大数量" name="plugin_params.material_max"  v-if="dialogConfig.data.plugin_name===dData.plugin_name.material_code">
            <t-input-number v-model="dialogConfig.data.plugin_params.material_max" :min="1" :step="1" :decimal-places="0" placeholder="物料最大数量" />
          </t-form-item>

          <t-form-item label="物料成本项" name="plugin_params.cost_items"  v-if="[dData.plugin_name.material_code,dData.plugin_name.material_num].includes(dialogConfig.data.plugin_name)">
            <t-select v-model="dialogConfig.data.plugin_params.cost_items" filterable clearable multiple reserve-keyword
                      :options="vData.selectOptions.cost_item"
                      @change="(value,context)=>dialogConfig.change('plugin_params.cost_items',value,context)" />
          </t-form-item>

          <t-form-item label="成本项类型" name="plugin_params.cost_item_type"  v-else>
            <t-select v-model="dialogConfig.data.plugin_params.cost_item_type" filterable clearable reserve-keyword
                      :options="vData.selectOptions.cost_item_type"
                      @change="(value,context)=>dialogConfig.change('plugin_params.cost_item_type',value,context)" />
          </t-form-item>

          <t-form-item label="组件备注" name="plugin_remark"  v-if="dialogConfig.data.plugin_name">
            <t-input v-model="dialogConfig.data.plugin_remark" />
          </t-form-item>

          <t-form-item label="输入框类型" name="input_type">
            <t-select v-model="dialogConfig.data.input_type" :options="vData.selectOptions.input_type" @change="dialogConfig.change('input_type',$event)"/>
          </t-form-item>
          <t-form-item label="数据类型" name="value_type">
            <t-select v-model="dialogConfig.data.value_type" filterable clearable :options="dialogConfig.selectOptions.value_type"/>
          </t-form-item>

          <t-form-item label="允许创建" name="input_options.creatable" v-if="[dData.input_type.SELECT,dData.input_type.RADIO].includes(dialogConfig.data.input_type)" >
            <t-radio-group v-model="dialogConfig.data.input_options.creatable">
              <t-radio value="1" >是</t-radio>
              <t-radio value="0" >否</t-radio>
            </t-radio-group>
          </t-form-item>

          <t-form-item label="小数位数" name="decimal_places" v-if="dialogConfig.data.value_type===dData.value_type.FLOAT" >
            <t-input-number v-model="dialogConfig.data.decimal_places" defaultValue="6" theme="column" style="width: 100%" type="integer" min="0" step="1" max="8"  />
          </t-form-item>

          <t-form-item label="最小值" name="input_options.min" v-if="dData.input_type.NUMBER===dialogConfig.data.input_type" >
            <t-input-number v-model="dialogConfig.data.input_options.min" defaultValue="0" theme="column" style="width: 100%" type="integer"  />
          </t-form-item>
          <t-form-item label="最大值" name="input_options.max" v-if="dData.input_type.NUMBER===dialogConfig.data.input_type" >
            <t-input-number v-model="dialogConfig.data.input_options.max" theme="column" style="width: 100%" type="integer"  />
          </t-form-item>



          <t-form-item label="选项" name="select_options" v-if="[dData.input_type.SELECT,dData.input_type.RADIO,dData.input_type.SWITCH].includes(dialogConfig.data.input_type)" >
            <t-tag-input v-model="dialogConfig.data.select_options" clearable drag-sort placeholder="输入后按回车"
                         @drag-sort="(e)=>dialogConfig.onDragSort(e,'select_options')" />
          </t-form-item>
          <t-form-item label="默认值" name="default_value">
            <t-input v-model="dialogConfig.data.default_value" />
          </t-form-item>
          <t-form-item label="单位" name="unit_id">
            <t-select v-model="dialogConfig.data.unit_id" filterable clearable :options="vData.selectOptions.unit_id"/>
          </t-form-item>


          <t-form-item label="排序" name="sort" >
            <t-input-number v-model="dialogConfig.data.sort" theme="column" style="width: 100%" type="integer" min="0" step="1" max="9999"  placeholder="数字小靠前" />
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-textarea v-model="dialogConfig.data.remark" :autosize="{ minRows: 1, maxRows: 5}"/>
          </t-form-item>
          <t-form-item label="只读" name="is_readonly">
            <t-radio-group v-model="dialogConfig.data.is_readonly"   :options="vData.selectOptions.is_readonly"/>
          </t-form-item>

          <t-form-item label="状态" name="status" >
            <t-radio-group v-model="dialogConfig.data.status" :options="vData.selectOptions.status"/>
          </t-form-item>
          <t-form-item>
            <t-button theme="primary" type="submit">保存</t-button>
          </t-form-item>
        </t-col></t-row>
      </t-form>
    </dialogComponent>
    <input type="file" ref="fileInput" style="display:none" @change="fn.upload" />
  </div>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import * as api from '@/core/script/api.js';
import * as tableFn from "@/core/script/tableFn.js";
import DialogComponent from "@/core/component/dialog.vue";
import dialog from "@/core/script/dialog.js";
import {getOptionsLabel} from "@/utils/vars.js";
import * as select from "@/core/config/select.js";
import _ from 'lodash';
import SelectInput from "@/core/component/SelectInput.vue";
import { AutoFillPlugin } from '@visactor/vtable-plugins';
import siyi from "@/core/script/siyi.js";
import {materialCategorySelector} from "@/core/script/api.js";

const props = defineProps({
  query:{type:Object,default:{}}
});

// 静态数据
const dData={
  plugin_name: {
    auto_calc: 'auto_calc',
    material_code: 'material_code',
    material_num: 'material_num',
    material_price: 'material_price',
    mj_price: 'mj_price',
    order_price: 'order_price',
    zk_normal_holds: 'zk_normal_holds',
    zk_slot_holds: 'zk_slot_holds',
    jgz_normal_holds: 'jgz_normal_holds',
    jgz_slot_holds: 'jgz_slot_holds',
  },
  plugin_params_default:{
    category_ids: [], // 物料分类ID
    material_name:null, // 物料名称
    cost_items: [], // 关联的成本项
    parameter_num:null, //数量参数
    material_max:null, //最大的物料数量
    cost_item_type:null,// 成本类型
  },
  input_type: {
    TEXT: 'string',
    NUMBER: 'number',
    RADIO: 'radio',
    SELECT: 'select',
    SWITCH: 'switch',
    TIME: 'time',
    DATE: 'date',
    IMG: 'img',
    FILE: 'file',
  },
  value_type: {
    INT: 'int',
    FLOAT: 'float',
    TEXT: 'text',
    ARRAY: 'array',
    OBJECT: 'object',
    FILE: 'file',
    DATE: 'date',
  },
  input_value_map:{},
  input_options_default:{
    creatable: 0, // 创建时是否可创建
    min: null, // 最小值
    max: null, // 最大值
  }
};


//页面数据
const vData=reactive({
  selectOptions: {status:[],value_type:[],input_type:[],unit_id:[],category:[],is_readonly:[],erp_category_ids:[],cost_item:[],cost_item_type:[]},
  ...props.query
})

const fileInput = ref();

const mainReport = ref();
const mainReportShow = ref(false);
const mainReportConfig = {
  menuConfig: {
    defaultMenuHideList: ['clearCache','submitApprove', 'resetApprove', 'approve', 'advancedExport'],
    menu: {
      create: { click: () => fn.addParameter()},
      update: { click: () => fn.editParameter()},
      delete: { click: () => fn.delParameter()},
      import: {sort: 500, title: '从ERP导入', icon: 'ri-download-line', click: () => fn.importFromErp()},
      upload: {sort: 550, title: '从文件上传', icon: 'ri-upload-line', click: () => fn.upload()},
      editCate: {sort: 651, title: '设置分组', icon: 'ri-edit-line', listAction: (rows)=>fn.setAttr('category',rows)},
      editStatus: {sort: 651, title: '设置状态', icon: 'ri-edit-line', listAction: (rows)=>fn.setAttr('status',rows)},
    },
  },
  searchConfig: {
    search: [
      {type: 'input', field: 'code', options: {placeholder: '编码'}},
      {type: 'input', field: 'name', options: {placeholder: '名称'}},
      {type: 'select', field: 'plugin_name', options: {multiple:false,placeholder: '组件名', options: vData.selectOptions.plugin_name}},
      {type: 'select', field: 'category', options: {multiple:false,placeholder: '分组', options: vData.selectOptions.category}},
      {type: 'select', field: 'input_type', options: {multiple:false,placeholder: '输入类型', options: vData.selectOptions.input_type}},
      {type: 'select', field: 'status', options: {multiple:false,placeholder: '状态', options: vData.selectOptions.status}},
    ],
  },
  detailConfig:{colNum:1},
  tableConfig: {
    url: api.url2.sys.parameter.list,
    showCheck: true,
    checkField: 'check',
    disablePage: true,
    options: {
      enableLineBreak: true, // 自动解析换行符
      heightMode: 'autoHeight', // 自动行高
      editCellTrigger:'doubleclick', // 单元格双击触发编辑
      select: {
        outsideClickDeselect: false,//点击外部区域是否取消选中。
      },
      excelOptions: {
        fillHandle: true // 启用填充炳功能
      },
      plugins: [new AutoFillPlugin()]
    },
    events:{
      dblclick_cell: async ({originData,field}) => {
        if (!originData?.id) {
          fn.addParameter();
          return;
        }
        mainReport.value.detail.show(originData,field);
      },
      change_cell_value: async ({row, col, changedValue, currentValue,rawValue}) => {
        if (changedValue===rawValue){
          return ;
        }
        const vTable=mainReport.value.reportConfig.table; // 表格实例
        const field = vTable.getHeaderField(col, row); //获取列名
        if (field==='sort' && typeof changedValue!=='number'){
          dialog.warning('请输入正整数!');
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          return ;
        }
        const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
        if (!record?.id) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          fn.addParameter({[field]: changedValue});
          return;
        }
        const res = await fn.set(record.id, field, changedValue);
        if (!res) {
          vTable.changeCellValue(col, row, rawValue);  //恢复到原始值
          return;
        }
        dialog.success('修改成功');
      },

    },
    colAfterCallback: (col) => {
      const inputFields = ['code','name', 'default_value', 'decimal_places', 'sort', 'remark',];
      if (siyi.user.administrator) {
        inputFields.push('code'); // 管理员可快速编辑code
      }
      if (inputFields.includes(col.field)) {
        col.editor = 'inputEditor';
      }
      if (col.field === 'remark' ) {
        col.autoWrapText=true; // 是否允许自动换行
        col.style= {lineClamp:'auto'} ; // lineClamp:最大行数;lineHeight:行高
      }
      return col;
    },
  }
}

const fn = {
  addParameter: () => {
    dialogConfig.data = {status:1,plugin_name:'',plugin_params:{...dData.plugin_params_default},input_options:{...dData.input_options_default}};
    dialogConfig.bind.title = '新增参数';
    dialogConfig.type = 'add';
    dialogConfig.isShow = true;
  },
  editParameter: (rows) => {
    const checkedRows = rows || tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    if (checkedRows?.length > 1) return dialog.warning('只能编辑一条数据');
    dialogConfig.bind.title = '修改参数';
    dialogConfig.type = 'edit';
    dialogConfig.data= {...checkedRows[0]};
    dialogConfig.data.plugin_params= {...dData.plugin_params_default,...dialogConfig.data.plugin_params}; // 初始化参数，防止有空值
    dialogConfig.data.input_options= {...dData.input_options_default,...dialogConfig.data.input_options}; // 初始化参数，防止有空值
    dialogConfig.selectOptions.erp_parameter_id = checkedRows[0]['erp_parameter_id']?[{
      label: checkedRows[0]['name'], value: checkedRows[0]['erp_parameter_id']
    }]:[];
    dialogConfig.change('input_type', checkedRows[0]['input_type']);
    dialogConfig.isShow = true
  },
  delParameter: async () => {
    const checkedRows = tableFn.getCheckedRecords(mainReport.value.reportConfig);
    if (checkedRows?.length < 1) return dialog.warning('请勾选数据');
    const result = await dialog.confirmAsync('确定要删除' + checkedRows.length + '条数据吗？');
    if (!result) return;
    await api.post(api.url2.sys.parameter.del, { ids: checkedRows.map(item => item.id) }).then(
        res => {
          if (res) {
            dialog.success('删除成功');
            mainReport.value.reportConfig.getData();
          }
        }
    );
  },
  importFromErp: async () =>{
    const ids = await dialog.selectAsync([],'','请选择要导入的数据', {width:'800px',height:'200px'},{
      multiple: true,placeholder: '请输入名称过滤',clearable:true,minCollapsedNum:10,
      onSearch: (val, obj) => select.getOptions('parameters',val,{showMore:1}).then(res =>
          obj.select.options = [{value:'',label:'全选',checkAll:true},...
              res.map(item=> {return {...item,value:parseInt(item.value)}}).filter(item=>item?.ifActive)
          ])
    })
    if (!ids) return;
    const loading2 = dialog.loading(undefined, '导入中...');
    const res = await api.post(api.url2.sys.parameter.import, {erp:ids});
    loading2 && loading2.close();
    if (!res?.count) return;
    dialog.success('导入成功'+res.count+'个');
    await mainReport.value.reportConfig.getData();
  },
  upload: async (e) => {
    const file = e?.target?.files?.[0];
    console.log(file)
    if (!file) {
      fileInput.value.click();
      return;
    }
    e.target.value = "";
    const loading= dialog.loading(mainReport.value,'正在导入数据，请稍等！');
    const res = await api.uploader({file}, api.url2.sys.parameter.upload);
    loading.close();
    res?.info && dialog.success(res.info) && await mainReport.value.reportConfig.getData();
  },
  setAttr: async (attrName, rows) => {
    const post = {};
    if (attrName === 'category') {
      const defaultCategory = rows?.[0]?.['category'] || '';
      const categoryName = await dialog.inputAsync(defaultCategory, '请输入分组名称', {width: '300px'});
      if (typeof categoryName!=='string') return;
      post.category = categoryName;
    }else if (attrName === 'status') {
      const statusValue = await dialog.selectAsync(vData.selectOptions.status,'','请选择状态', {width:'300px',height:'200px'});
      if (typeof statusValue!=='number') return;
      post.status = statusValue;
    }
    const res = post === {} ? null : await api.post(api.url2.sys.parameter.set, {ids: rows.map(item => item.id), data:post});
    if (!res) return;
    dialog.success('修改成功');
    await mainReport.value.reportConfig.getData();
  },
  set: async (id, key, value) => {
    const post = {};
    post[key] = value;
    return await api.post(api.url2.sys.parameter.set, {ids:[id], data:post});
  },
}

const changeDebounce = _.debounce((key, val) => {
  dialogConfig.change(key, val);
}, 500);

const dialogConfig = reactive({
  isShow:false,
  data: {status:1,value_type:null,plugin_params:{...dData.plugin_params_default},input_options:{...dData.input_options_default}},
  selectOptions:{erp_parameter_id:[],value_type:[],plugin_name:[]},
  rules:{
    // code: [{required: true, message: '请输入参数编码', trigger: 'change'},],
    name: [{required: true, message: '请输入参数名称', trigger: 'change'},],
    type: [{required: true, message: '请选择参数输入类型', trigger: 'change'},],
    input_type: [{required: true, message: '请选择输入类型', trigger: 'change'},],
    status: [{required: true, message: '请选择状态', trigger: 'change'},],
  },
  bind:{
    width: '800px',
    height: '80%',
  },
  form:{
    style: {
      padding: '20px 10px',
    },
  },
  onDragSort:({ currentIndex, targetIndex },field)=> {
    const temp = dialogConfig.data[field][currentIndex];
   dialogConfig.data[field][currentIndex] = dialogConfig.data[field][targetIndex];
   dialogConfig.data[field][targetIndex] = temp;
  },
  change: async (field,value,context) => {
    console.log('change',field,value,context);
    if (field === 'erp_parameter_search') {
      const options= (await select.getOptions('parameters',value,{showMore:1,toNumber:1})) || [];
      dialogConfig.selectOptions.erp_parameter_id = options.filter(item=>item?.ifActive);
    }else if (field === 'erp_parameter_id') {
      const paramList= await api.get(api.url2.sys.parameter.getErpParameters, {recId:value})
      if (paramList){
        dialogConfig.data= {...paramList[0],status:typeof dialogConfig.data.status === 'number'?dialogConfig.data.status:1};
      }
    }else if (field === 'input_type'){
      const input_value_map= dData.input_value_map?.[value] || null ;
      if (typeof input_value_map==='object' && Array.isArray(input_value_map)){
        // 按照绑定关系，限制数据类型
        dialogConfig.selectOptions.value_type=vData.selectOptions.value_type.filter(item=>input_value_map.includes(item.value));
      }else{
        dialogConfig.selectOptions.value_type=[...vData.selectOptions.value_type]; // 默认所有数据类型
      }
      if (dialogConfig.data.value_type && input_value_map && !input_value_map.includes(dialogConfig.data.value_type)){
        dialogConfig.data.value_type=null; // 输入类型和数据类型不匹配,清楚
      }
      if (dialogConfig.selectOptions.value_type.length===1 && !dialogConfig.data.value_type){
        dialogConfig.data.value_type = dialogConfig.selectOptions.value_type[0].value; // 默认选中第一个
      }
    }else if(field==='plugin_name' && value===dData.plugin_name.material_code){
      dialogConfig.data.input_type=dData.input_type.RADIO;
      dialogConfig.data.value_type=dData.value_type.TEXT;
    }else if(field==='plugin_name' && value===dData.plugin_name.material_num){
      dialogConfig.data.input_type=dData.input_type.NUMBER;
      dialogConfig.data.value_type=dData.value_type.INT;
    }else if(field==='plugin_params.category_ids'){
      const selectedOptions = vData.selectOptions.erp_category_ids.filter(item=>value.includes(item.value));
      dialogConfig.data.plugin_remark = selectedOptions.map(item=>item.label).join(' / ');
    }
   },
  submit: async ({validateResult, firstError}) => {
    if (validateResult !== true) return dialog.warning(firstError);
    const loading = dialog.loading(undefined, '保存中...');
    const res = await api.post(api.url2.sys.parameter[dialogConfig.type], dialogConfig.data);
    loading && loading.close();
    if (res) {
      dialog.success('保存成功');
      dialogConfig.close();
      await mainReport.value.reportConfig.getData();
    }
  },
  close: () => {
    dialogConfig.isShow=false;
  },
  on:{
    afterClose: () => {
      dialogConfig.close();
    }
  }

})

onMounted(async () => {
  const res = await api.get(api.url2.sys.parameter.config);
  vData.selectOptions = getOptionsLabel(res?.option);
  mainReportConfig.tableConfig = {...mainReportConfig.tableConfig, ...res.table};
  mainReportConfig.tableConfig.columns = tableFn.createColumns(res.columns);
  const searchFields = ['status', 'input_type', 'category','plugin_name'];
  searchFields.forEach(field => {
    const searchItem = mainReportConfig.searchConfig.search.find(item => item.field === field);
    if (searchItem) searchItem.options.options = vData.selectOptions[field] || [];
  });
  dData.input_value_map = {...res.input_value_map};
  mainReportShow.value = true;
  vData.selectOptions.erp_category_ids = await api.materialCategorySelector(); // 获取物料分类
});

</script>
<style scoped>
.mainPage{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}
</style>


