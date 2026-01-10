<template>
  <div ref="box" class="mainPage">
    <div style="flex:1"><TableComponent v-if="vData.isInit" ref="report" v-bind="getReportConfig()"/></div>
    <div style="width: 350px"><TableComponent v-if="vData.isInit && report" ref="report2" v-bind="report2Config"/></div>
    <input type="file" ref="fileInput" style="display:none" @change="tableEvent.import" />
  </div>

</template>


<script setup>
import {onDeactivated, onMounted, reactive, ref} from "vue"
import _ from "lodash";
import TableComponent from '@/core/component/table.vue'

import * as listTableFn from "@/core/script/tableFn.js";


import * as api from "@/core/script/api.js"
import apiUrl from "@/core/config/url.js";
import {getOptionsLabel, isNumber, listToTree} from "@/utils/vars.js";

import editPage from './edit.v250401.vue'
import TreePage from '@/modules/asset/tree.v250406.vue'
import attrPage from './attr.v250411.vue'
import bindPage from './bind.v250411.vue'
import print_small from './print_s.v250506.vue'
import print_medium from './print_m.v250918.vue'
import dialog, {openWindow} from "@/core/script/dialog.js";
import siyi from "@/core/script/siyi.js";
import {getDefaultPlantId} from "@/core/script/core.js";
import {download} from "@/utils/file.js";
import {updateRow} from "@/core/script/tableFn.js";

const fileInput = ref();
const report = ref()
const report2 = ref()

//页面数据
const vData = reactive({
  isInit: false,
  cate_id:null,
  plant_id:getDefaultPlantId(),
  dataMap:{},
  dataOption: {dept_id:{},status:{},area_id:{},cate_id:{}},
  selectOption:{dept_id:[],status:[],area_id:[],cate_id:[],area_tree:[],cate_tree:[]},
  menus:[],
  tableConfig:{columnSplit:'',columns:[]},
  menuHide:[],
  hide_fields:[],
  addDefault:{}, //新增时，默认的表单值
  lastSelectedRow: {},
});

//表格事件
const tableEvent = {
  click_cell: async ({originData}) => {
    await tableEvent.showDetail(originData);
  },
  dblclick_cell: async ({originData,field}) => {
    if (!field) return ;
    if (field.indexOf('check_')!==-1) {
      return await tableEvent.showMap([originData]);
    }
    await tableEvent.showEdit([{...originData}],'edit');
  },
  plantChange: async (value) => {
    vData.plant_id = value;
    await report.value.reportOptions.getData();
  },
  delete: async (rows) => {
    const id = rows.filter(item => item?.id).map(item => item.id);
    if (!await dialog.confirmAsync('确定要删除' + id.length + '条数据吗？','删除确认')) {
      return;
    }
    if (await api.post(apiUrl.asset.list.set, {id, status: -1})) {
      dialog.success('删除成功');
      await report.value.reportOptions.getData();
    }
  },
  showDetail: async (row) => {
    const selectedRow = row || listTableFn.getCheckedRecords(report.value.reportOptions)?.[0];
    const lastSelectedRow = vData.lastSelectedRow;
    if (lastSelectedRow && lastSelectedRow?.index === selectedRow?.index) {
      return;
    }
    vData.lastSelectedRow = selectedRow;
    await report2.value.reportOptions.getData();
  },
  showEdit: async (rows,scene) => {
    const sceneMap={add:'添加',edit:'修改',copy:'复制'};
    const row = rows?.[0] || listTableFn.getCheckedRecords(report.value.reportOptions)?.[0];
    if (!row?.id && scene!=='add'){
      dialog.warning('请选择一条数据!');
      return ;
    }
    const _window = dialog.window(editPage, {
      query: {asset:row, hide_fields: vData.hide_fields,scene},
      selectOption: vData.selectOption,
      close: async () => {
        _window.close();
      },
    }, {
      title: sceneMap[scene],
      width: 1280,
      height: '80%',
      onAfterClose: async () => {
        const newRow = (await api.get(apiUrl.asset.list.list, {id: row.id}))?.[0] || {};
        await updateRow(report.value.reportOptions,newRow); // 更新单行
        await tableEvent.showDetail()
      },
    })
  },
  showAttr: async (query) => {
    dialog.window(attrPage, {query},{width: '80%',height: '80%',title:"属性管理"})
  },
  showBind: async (query) => {
    dialog.window(bindPage, {query},{width: '80%',height: '80%',title: "属性绑定"})
  },
  showArea: async (query) => {
    dialog.window(TreePage, {query, apiUrl: apiUrl.asset.area},{title: "区域管理", width: '80%',height: '80%',})
  },
  showMap: async (rows) => {
    const row = rows?.[0] || listTableFn.getCheckedRecords(report.value.reportOptions)?.[0];
    const address_gps= row?.check_gps;
    if (!address_gps) return dialog.warning('暂无定位');
    const url =`https://apis.map.qq.com/uri/v1/marker?zoom=18&marker=coord:${address_gps};title:`+row.area_full_name+(row?.area_remark || '')
    openWindow(url,'','',1080,600)
  },
  showCate: async (query) => {
    dialog.window(TreePage, {query, apiUrl: apiUrl.asset.cate, dataOption: {type: {0: '虚拟', 1: '实物'}}},{title: "分类管理", width: '80%',height: '90%',})
  },
  showPrint: async (rows) => {
    if (!Array.isArray(rows) ||  rows?.length < 1){
      dialog.error('请选中要打印的数据!');
      return ;
    }
    rows=rows.filter(item=>item?.id);
    dialog.window(print_small, {rows},{width: '80%',height: '80%',title:"小标签打印"})
  },
  showPrint2: async (rows) => {
    if (!Array.isArray(rows) ||  rows?.length < 1){
      dialog.error('请选中要打印的数据!');
      return ;
    }
    rows=rows.filter(item=>item?.id);
    dialog.window(print_medium, {rows},{width: '80%',height: '80%',title:"大标签打印"})
  },
  setArea:async (rows) => {
    const area_id  = await dialog.treeSelectAsync(vData.selectOption.area_tree, null, '请选择位置 ',);
    if (area_id===false) return dialog.warning('取消操作',500);
    const area_name = vData.selectOption['area_id'].find(item=>item.id===area_id)?.full_name || '(空)';
    return await tableEvent.assetSet(rows,{area_id},'位置',area_name);
  },
  setCate:async (rows) => {
    const cate_id  = await dialog.treeSelectAsync(vData.selectOption.cate_tree, null, '请选择分类',);
    if (cate_id===false) return dialog.warning('取消操作',500);
    const cate_title = vData.selectOption['cate_id'].find(item=>item.id===cate_id)?.full_name || '(空)';
    return await tableEvent.assetSet(rows,{cate_id},'分类',cate_title);
  },
  setStatus:async (rows) => {
    const status  = await dialog.selectAsync(vData.selectOption['status'], null, '请选择状态');
    if ((typeof status!=='string' && typeof status!=='number') || status==='') return dialog.warning('取消操作',500);
    const title = vData.dataOption['status']?.[status] || '';
    return await tableEvent.assetSet(rows,{status},'状态',title);
  },
  setUser:async (rows) => {
    const default_value= rows[0].manager_code;
    const manager_code= await dialog.selectAsync(vData.selectOption['employee'], default_value, '请选择用户');
    if (!manager_code) return dialog.warning('取消操作',500);
    const manager = vData.selectOption['employee'].find(item=>item.value===manager_code);
    return await tableEvent.assetSet(rows,{
      manager_uid:manager?.user?.id || null,
      manager_code:manager.user?.username || manager.hr.EmpNo,
      manager_name:manager.user?.nickname || manager.hr?.EmpName,
      manager_dept:manager.user?.identity_info || manager?.hr.PartName,
    },'负责人',manager.label);
  },
  setRemark:async (rows) => {
    const default_value= rows[0].remark;
    const remark  = await dialog.inputAsync(default_value,'请输入备注')
    if (remark===false) return dialog.warning('取消操作', 500);
    return await tableEvent.assetSet(rows,{remark},'备注',remark || '(空)');
  },
  setAreaRemark:async (rows) => {
    const default_value= rows[0].area_remark;
    const area_remark  = await dialog.inputAsync(default_value,'请输入位置')
    if (area_remark===false) return dialog.warning('取消操作', 500);
    return await tableEvent.assetSet(rows,{area_remark},'位置',area_remark || '(空)');
  },
  setDept:async (rows) => {
    const default_value= rows[0].manager_dept;
    const manager_dept  = await dialog.inputAsync(default_value,'请输入部门名称')
    if (manager_dept===false) return dialog.warning('取消操作', 500);
    return await tableEvent.assetSet(rows,{manager_dept},'部门',manager_dept || '(空)');
  },
  assetSet: async (rows, post, actionName = '', valueTitle = '') => {
    const id = rows.filter(item => item?.id).map(item => item.id);
    if (!await dialog.confirmAsync('确定要把' + id.length + '条资产的' + actionName + '，设置为' + valueTitle + '吗？')) {
      return;
    }
    const loading = dialog.loading(report.value);
    const res = await api.post(apiUrl.asset.list.set, {id, ...post});
    loading.close();
    if (res) {
      dialog.success('设置成功');
      await report.value.reportOptions.getData();
    }
  },
  import: async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) {
      fileInput.value.click();
      return;
    }
    e.target.value = "";
    const loading= dialog.loading(report.value,'正在导入数据，请稍等！');
    const res = await api.uploader({file}, api.url.asset.list.import,{plant_id:vData.plant_id,cate_id:vData.cate_id});
    loading.close();
    res?.info && dialog.success(res.info) && await report.value.reportOptions.getData();
  },
  export: async (rows) => {
    const id = rows.map(row=>row.id);
    const loading = dialog.loading(report.value);
    const cate_ids =  [...new Set(rows.map(row=>row.cate_id))];
    const fields = vData.tableConfig.columns.filter(item=>!item.hide).map(item=>item.field);
    const res= await api.post(api.url.asset.list.export,{id,cate_ids,fields,cate_id:vData.cate_id});
    loading.close();
    if (!res?.url) return;
    await download(res.url,res.name)
  },
}

const getSearchForm=()=>{
  return [
    {type: 'select', field: 'plant_id',style: {width: '100px'}, options: {placeholder: '工厂',multiple:false},value: vData.plant_id,onChange:tableEvent.plantChange,load: 'factory'},
    {type: 'tree', field: 'cate_full_path',filterValueType:'value',filter: true, options: {treeProps:{valueMode:'parentFirst'},placeholder: '分类', data: vData.selectOption.cate_tree}, style: {width: '200px'}},
    // {type: 'tree', field: 'area_id', filter: true,options: {placeholder: '位置', data:vData.selectOption.area_tree}, style: {width: '200px'}},
    {type: 'select',field: 'status', filter: true,filterValueType:'value', options: {multiple:false,placeholder: '状态', options: vData.selectOption.status}, style: {width: '100px'}},
    {type: 'input', field: 'name', filter: true, options: {placeholder: '名称'}, style: {width: '160px'}},
    {type: 'input', field: 'code', filter: true, options: {placeholder: '编号'}, style: {width: '160px'}},
    // {type: 'input', field: 'remark', filter: true, options: {placeholder: '备注'}, style: {width: '160px'}},
  ]
}
const getMenus = () => {
  const menus={
    add: {
      title: '添加', click: () => tableEvent.showEdit([{
        cate_id: vData.cate_id, plant_id: vData.plant_id, ...vData.addDefault
      }],'add'), icon: 'ri-add-line', sort: 10,
    },
    import: {title: '导入', click: ()=>tableEvent.import(), icon: 'ri-upload-cloud-line', sort: 10,},
    export: {title: '导出', listAction: tableEvent.export, icon: 'ri-download-cloud-line', sort: 10,},
    copy: {title: '复制', listAction: (rows)=>tableEvent.showEdit(rows,'copy'), icon: 'ri-file-copy-line', sort: 10,},
    print_s: {title: '打印(小)', listAction: tableEvent.showPrint, icon: 'ri-printer-line', sort: 10,},
    print_m: {title: '打印(大)', listAction: tableEvent.showPrint2, icon: 'ri-printer-line', sort: 10,},
    setRemark: {title: '设置备注', listAction: tableEvent.setRemark, icon: 'ri-message-2-line', sort: 10},
    setArea: {title: '设置位置', listAction: tableEvent.setArea, icon: 'ri-map-pin-line', sort: 10},
    setAreaRemark: {title: '设置位置', listAction: tableEvent.setAreaRemark, icon: 'ri-map-pin-line', sort: 10},
    setUser: {title: '设置负责人', listAction: tableEvent.setUser, icon: 'ri-user-line', sort: 10},
    setDept: {title: '设置部门', listAction: tableEvent.setDept, icon: 'ri-building-line', sort: 10},
    setStatus: {title: '设置状态', listAction: tableEvent.setStatus, icon: 'ri-shut-down-line', sort: 10},
    setCate: {title: '设置分类', listAction: tableEvent.setCate, icon: 'ri-menu-line', sort: 10},
    edit: {title: '修改', listAction: (rows)=>tableEvent.showEdit(rows,'edit'), icon: 'ri-edit-line', sort: 10,},
    delete: {title: '删除', listAction: tableEvent.delete, icon: 'ri-delete-bin-line', sort: 10,},
    cate: {title: '分类设置', click: () => tableEvent.showCate({cate: vData.cate_id}), icon: 'ri-menu-line', sort: 30},
    attr: {title: '属性设置', click: () => tableEvent.showAttr(), icon: 'ri-settings-line', sort: 40},
    bind: {title: '属性关联', click: () => tableEvent.showBind(), icon: 'ri-settings-line', sort: 50},
    area: {title: '区域设置', click: () => tableEvent.showArea(), icon: 'ri-map-pin-line', sort: 60},

    search: {sort: 0},
  };
  return Object.fromEntries(Object.entries(menus).filter(([key]) => !vData.menuHide?.includes(key)));
}



// 页面初始化
const initTable=async ()=>{
  const apiData = await api.get(apiUrl.asset.list.init,{cate_id:vData.cate_id});
  vData.dataOption = apiData?.option || {};
  vData.selectOption = getOptionsLabel(vData.dataOption,'full_name','id');
  vData.selectOption.employee=await api.employeeSelector(null,{with:'user'});
  vData.selectOption['cate_id']=apiData.option.cate;
  vData.selectOption['area_id']=apiData.option.area;
  vData.dataMap['cate']=_.keyBy(apiData.option.cate,'id');
  vData.dataMap['area']=_.keyBy(apiData.option.area,'id');
  vData.selectOption.cate_tree=listToTree([...apiData.option.cate], {labelKey:'name',valueKey:'id'});
  vData.selectOption.area_tree=listToTree([...apiData.option.area], {labelKey:'name',valueKey:'id'});
  // vData.selectOption.dept_id = await api.departmentSelector();
  // vData.dept_tree=listToTree(vData.selectOption.dept_id, {labelKey:'name',valueKey:'id'});
  vData.menus=getMenus();
  vData.searchForm=getSearchForm();
  vData.tableConfig = {...apiData.table,columns:listTableFn.createColumns(apiData.columns, vData.tableConfig?.columnSplit || '#').filter(item=>!vData.hide_fields.includes(item.field))};
  vData.isInit=true;
}

const getReportConfig = () => {
  return {
    dataFetcher: async (url,query) => {
      //第2步:获取数据
      const list = await api.get(apiUrl.asset.list.list, {...query,cate_id: vData.cate_id}) || [];
      return list.map(item => {
        const cate=vData.dataMap['cate']?.[item.cate_id] || {};
        const area=vData.dataMap['area']?.[item.area_id] || {};
        return {
          ...item,
          cate_full_name: cate?.full_name || '',
          cate_full_path: cate?.full_path || '',
          area_full_name: area?.full_name || '',
          area_full_path: area?.full_path || '',
        }
      },);
    },
    menu: vData.menus,
    search: vData.searchForm,
    defaultMenuShowList:['search','moreSettings','pageExport','clearWhere','pageExport'],
    clickCell:tableEvent.click_cell,
    dblclickCell:tableEvent.dblclick_cell,
    tableConfig: {
      options: {
        menu: {
          contextMenuItems: [
            // {text: '查看', menuKey: 'showDetail'},
            // {text: '修改', menuKey: 'showEdit'},
            // {text: '刷新', menuKey: 'refresh'},
          ],
        },
        bottomFrozenRowCount: 1,
        keyboardOptions: {selectAllOnCtrlA: true, pasteValueToCell: true, moveEditCellOnArrowKeys: true},
        select: {
          headerSelectMode: 'body',
          blankAreaClickDeselect: false,//点击空白区域是否取消选中。
          outsideClickDeselect: false,//点击外部区域是否取消选中。
        },
      },
      // autoLoad:false,
      showCheck: true,
      disablePage: true,
      useEncryptionFields: false,
      ...vData.tableConfig
    },
    afterLoaded:(reportOptions)=>{
      vData.lastSelectedRow = reportOptions.table.records[0];
      report2.value.reportOptions.getData();
    },
  }
};

const report2Config = {
  dataFetcher: async () => {
    const row = vData.lastSelectedRow;
    if (!row?.id) return [];
    const columns = vData.tableConfig.columns.filter(item=>!item.hide);
    const listBase= columns.map(item=>{return {label:'基础', name:item.title, attr_value:row?.[item.field]}}).filter(item=>item.attr_value);
    const {list} = await api.get(apiUrl.asset.list.value, {asset_id: row.id, cate_id: row.cate_id});
    return [...listBase,...list];
  },
  menu: false,
  search: false,
  footer:false,
  tableConfig: {
    id:'asset_value',
    columns: [
      {title: '分组', width: '80px', field: 'label', cellType: "text", mergeCell: true, showSort: false},
      {title: '属性名', width: '100px', field: 'name'},
      {
        title: '属性值', width: '170px', field: 'attr_value', fieldFormat: (row) => {
          return (row?.['attr_value'] || '') + (row?.['attr_unit'] || '')
        }
      },
    ],
    options:{
      rowSeriesNumber:false,
    },
    disablePage: true,
    showCheck: false,
    useEncryptionFields: false,
    useUserTableConfig:false,
  }
}


onMounted(async () => {
  const query = {...siyi.nav.query};
  for (const vKey in query) {
    if (typeof query[vKey]==='object' && !Array.isArray(query[vKey])){
      vData[vKey] =_.merge({},vData[vKey],query[vKey]);
    }else{
      vData[vKey] = query[vKey];
    }
  }
  await initTable();
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {

})

</script>

<style scoped>
.mainPage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  .publicReportBox{
    padding: 0;
  }
  .tableBox{
    padding: 1px;
  }
}
</style>