<template>
    <div ref="box" class="winContent">
      <div class="winHeader">
        <Menu :table="tableOptions" :search="searchRef" :menu="getMenus()" :defaultMenuShowList="['query','pageExport','moreSettings']"/>
        <Search ref="searchRef" :table="tableOptions" :search="props.searchList" :filter/>
        <slot name="header" :table="tableOptions"/>
      </div>
      <div class="winBody">
        <div class="winTable">
          <div ref="tableRef"></div>
        </div>
      </div>
    </div>
</template>
<script setup>
import {getCurrentInstance, onMounted, ref} from "vue"
import * as VTable from "@visactor/vtable";
import {InputEditor, ListEditor} from "@visactor/vtable-editors";
import _ from "lodash";
import * as core from '@/core/script/core.js'
import * as api from '@/core/script/api.js'
import siyi from '@/core/script/siyi.js'
import {findAdjacentLevelItems} from "@/utils/vars.js";
import * as listTableFn from '@/core/script/tableFn.js'
import Search from "../../core/component/search.vue";
import Menu from "../../core/component/menu.vue";
import dialog from "@/core/script/dialog.js";


const instance = getCurrentInstance()

//定义参数
const props = defineProps({
  id: String,//页面标识
  query: Object, // 列表API查询参数
  searchList: {type: Array, default: []}, // 搜索配置
  menus: {type: Object, default: null}, // 菜单配置
  apiUrl: {type: Object, default: {}}, // 请求地址
  columns: {type: Array, default: () => []}, // 列配置
  saveAfterEdit: {type: Boolean, default: false},//保存后修改
  fieldsAutoAdd: Object, // 新增列配置
  fieldsAutoSave: Object, // 修改列配置
  tableOptions: Object, // 表配置
  dataOption: {type: Object, default: () => {}}, // 数据翻译
  formatter: {type: Object, default: {saveItem: item => item, showItem: item => item}}, // 数据格式化方法
})

//窗口配置
const beforeClose= async () => {
  if (isChanged.value) {
    const confirmRes = await dialog.confirmAsync('数据有变动，是否保存修改？','关闭提示',{okval: "保存", noval: "不保存", otherval: "继续编辑",});
    if (confirmRes === true) {
      return await saveList();
    }
    return confirmRes === false
  }
  return true;
}


// 搜索配置
const searchRef = ref()
//过滤数据
const filter = ref({fieldOptions: {options: []}})

//列表数据
const apiUrl = ref({list: '', saveList: '', save: '', set: '', ...props.apiUrl});
const dataOption = ref({type: null, status: {0: '停用', 1: '启用'}, form_type: {}, ...props.dataOption});
const dataList = ref([]);
const isChanged = ref(0);

//表格事件
const tableRef = ref();
const tableEvent = {
  getData: async (init = false) => {
    //第0步：去除多余的列
    tableOptions.options.columns = tableOptions.options.columns.filter(item => item?.field);
    //第1步: 加载数据
    const loading = dialog.loading(tableRef.value)
    tableOptions.data = await loadList();
    //第2步：创建表格
    listTableFn.createTable(tableOptions)
    //第3步：设置编辑器
    tableOptions.options.columns.filter(column => column?.editorType).forEach(column => {
      column.editor = column.field + '-' + column.editorType;
      if (column.editorType === 'select') {
        VTable.register.editor(column.editor, new ListEditor({values: Object.keys(dataOption.value?.[column.field] || {})}));
      } else if (column.editorType === 'list') {
        VTable.register.editor(column.editor, new ListEditor({values: column.fieldOptions}));
      } else if (column.editorType === 'text') {
        VTable.register.editor(column.editor, new InputEditor());
      }
    })
    //第4步：加载配置 （只加载一次）
    if (init) {
      //第4.1步： 合并用户的表格基本配置：如分页，冻结列
      const userConfig = await listTableFn.mergeConfig(tableOptions)
      //第4.2步： 合并用户自定的列配置信息
      await listTableFn.mergeColumn(tableOptions, userConfig.columns)
      //第4.5步：初始化自定义事件
      tableEvent.init();
    }
    // 第5步：更新表格配置
    listTableFn.update(tableOptions)
    //第6步：本地过滤
    searchRef.value.dataFilter()
    filter.value.fieldOptions.options = []
    tableOptions.options.columns.forEach(col => !col?.hide && col.cellType !== 'checkbox' && filter.value.fieldOptions.options.push({label: col.title, value: col.field}))
    //最后完成
    loading.close()

  },
  init: function () {
    tableOptions.table.on('change_cell_value', this.cell_change);
    tableOptions.table.on('checkbox_state_change', this.checkbox_change);
    tableOptions.table.on('switch_state_change', this.switch_change);
    tableOptions.table.on('radio_state_change', this.radio_change);
    tableOptions.table.on('dblclick_cell', this.cell_dblclick);
    listTableFn.cellAction.bindEvents(tableOptions);
  },
  cell_dblclick: async (e) => {
    console.log('cell_dblclick e', e);
    e.cloumn = tableOptions.options.columns.find(item => item.field === e.field);
    e.tableOptions = tableOptions;

    // 双击编辑
    if (e.cloumn?.editorType === 'dblclick') {
      const {value, record, records} = await api.emitWithPromise('editor_dblclick', {e}, instance);
      console.log('cell_dblclick res', value, record, records);
      if (typeof value !== 'undefined' && value !== e.value) {
        isChanged.value += 1;
        tableOptions.table.changeCellValue(e.col, e.row, value); //修改本身
      } else {
        if (typeof record !== 'undefined' && e.row > tableOptions.data.length) {
          isChanged.value += 1;
          const data = {...record, index: tableOptions.data.length + 1};
          tableOptions.table.updateRecords([data], [e.row - 1]);
          for (const key in record) {
            const recordNow = tableOptions.table.getRecordByCell(e.col, e.row);
            if (await saveInsert(key, recordNow, e.row)) {
              break;
            }
          }
        }
        if (typeof records !== 'undefined') {
          isChanged.value += records.length;
          tableOptions.table.setRecords(records);
        }
      }
    }
  },
  cell_change: async (e) => {
    console.log('cell_change', e);
    const {rawValue, changedValue, col, row} = e;
    if (rawValue === changedValue || (rawValue?.length===0 && changedValue?.length===0)) {
      return;
    }
    const field = tableOptions.table.getHeaderField(col, row); //获取列名
    if (field.length < 0 || field === 'check') return;
    const record = tableOptions.table.getRecordByCell(col, row); //根据单元格获取行数据
    // 给父组件发送事件
    const {result} = await api.emitWithPromise('cell_change', {e, record, field}, instance);
    if (typeof result === 'boolean') {
      result || tableOptions.table.changeCellValue(col, row, rawValue);//恢复到原始值
      return;
    }
    //自动注册
    if (await saveInsert(field, record, row)) {
      return;
    }
    if (typeof record?.id !== 'undefined' && props.saveAfterEdit) {
      await saveData(record, row);
    } else {
      isChanged.value += 1;
    }
  },
  checkbox_change: ({col, row, value, dataValue, checked}) => {
    console.log('checkbox_change', col, row, value, dataValue, checked);
    tableOptions.table.changeCellValue(col, row, checked);
  },
  switch_change: ({col, row, value, dataValue, checked}) => {
    console.log('switch_change', col, row, value, dataValue, checked);
    tableOptions.table.changeCellValue(col, row, checked);
    console.log('tableOptions', tableOptions.options.records);
  },
  radio_change: ({col, row, value, dataValue, checked}) => {
    console.log('radio_change', col, row, value, dataValue, checked);
    tableOptions.table.changeCellValue(col, row, checked);
  },
}
const tableOptions = _.merge({}, listTableFn.defaultConfig(), {
  id: siyi.nav.id + "_" + props.id,
  columnSplit: "", //列分割方式
  columns: props.columns,
  options: {
    menu: listTableFn.cellAction.menu,
    editCellTrigger: 'doubleclick',
    keyboardOptions: {selectAllOnCtrlA: true, pasteValueToCell: true, moveEditCellOnArrowKeys: true},
    select: {
      headerSelectMode: 'body',
      blankAreaClickDeselect: false,//点击空白区域是否取消选中。
      outsideClickDeselect: false,//点击外部区域是否取消选中。
    }, excelOptions: {
      fillHandle: false
    },
  },
  showCheck: true,
  disablePage: true,
  dom: tableRef.value,
  url: apiUrl.value.list,
  getData: tableEvent.getData,
},props.tableOptions)


//加载列表数据
const loadList = async (getNew = true) => {
  if (getNew || !dataList.value) {
    if (isChanged.value) {
      const confirmRes = await dialog.confirmAsync('数据有变动，是否保存修改？','关闭提示',{okval: "保存", noval: "不保存", otherval: "继续编辑",});
      if (typeof confirmRes !== 'boolean') return;
      confirmRes && await saveList();
    }
    const res = await api.get(apiUrl.value.list, props.query);
    const {list, option} = await api.emitWithPromise('listLoad', {e: res}, instance);
    dataList.value = list.map((item, index) => formatter.showItem(item, {}, index));
    dataOption.value = option;
    isChanged.value = 0;
  }
  return dataList.value;
}

//插入数据
const saveInsert = async (field, record, row) => {
  const autoAddFields = props.fieldsAutoAdd?.[field] || []; // 新增列字段
  //判断是否有足够的数据来提交
  const autoAddData = autoAddFields.length > 0 ? autoAddFields.every(key => record?.[key]) : undefined;
  if (typeof record?.id === 'undefined' && autoAddData) {
    const maxSort = tableOptions.options.records.reduce((max, item) => Math.max(max, item.sort || 0), 0);
    const maxIndex = tableOptions.options.records.reduce((max, item) => Math.max(max, item.index || 0), 0);
    const {id, sort} = await saveData({...record, sort: maxSort + 1, index: maxIndex + 1}, row);
    if (typeof id !== 'number' || id > 0) {
      const sortColId = tableOptions.table.getTableIndexByField('sort');
      const idColId = tableOptions.table.getTableIndexByField('id');
      tableOptions.table.changeCellValue(idColId, row, id);
      tableOptions.table.changeCellValue(sortColId, row, sort);
      return true;
    }
  }
}

//保存列表数据
const saveList = async () => {
  if (!isChanged.value) return;
  const records = tableOptions.options.records;
  console.log('records', records);
  const recordsData = records.filter(item => item?.id).map((item, index) => formatter.saveItem(item, {sort: (index + 1) * 10}, index))
  if (recordsData.length < 1) return;
  const loading = dialog.loading(tableRef.value, '数据保存中，请稍等！');
  const url = apiUrl.value.saveList;
  const post = await api.emitWithPromise('listSave', {e: recordsData}, instance);
  const result = await api.post(url, post);
  loading.close();
  if (!result) {
    return false;
  }
  isChanged.value = 0;
  tableOptions.getData()
  return true;
}


//保存单条数据
const saveData = async (record, index) => {
  const url = apiUrl.value.save;
  const post = await api.emitWithPromise('itemSave', {e: formatter.saveItem(record)}, instance);
  return await api.post(url, post);
}

//批量设置
const updateAll = async (post, actionName = '') => {
  // 获取所有选中节点
  const checkedRecords = listTableFn.getCheckedRecords(tableOptions);
  if (checkedRecords?.length < 1) {
      dialog.error('请勾选要操作的数据');
    return;
  }
  if (actionName && !await dialog.confirmAsync('确认' + actionName + checkedRecords.length + '条吗？',actionName + '确认')) {
    return;
  }
  const ids = checkedRecords.map(row => row?.id).filter(id => id);
  if (ids.length < 1) {
    if (actionName === '删除') {
      // @todo 删除未保存的行
    }
    return;
  }
  const loading = dialog.loading(tableRef.value, '数据保存中，请稍等！');
  const result = await api.post(apiUrl.value.set, {id: ids, ...post});
  result && tableOptions.getData()
  loading.close();
}

// 批量删除
const deleteAll = async () => {
  return await updateAll({status: -1}, '删除')
}

// 批量修改状态
const editAllStatus = async (status) => {
  return await updateAll({status});
}

//排序
const editSort = async (type) => {
  //获取选中行数据
  const selectedRecords = listTableFn.getCheckedRecords(tableOptions);
  const selectedRecord = selectedRecords?.[0];
  if (!selectedRecord) return dialog.error('请选中1条数据操作');

  // 记录列号
  const selectedCells = tableOptions.table.getSelectedCellInfos();
  const selectCols = [selectedCells?.[0]?.[0]?.col, selectedCells?.[0]?.[selectedCells?.[0].length - 1]?.col];

  let updateRecords = [], updateIndex = [];
  let findRecords = [];
  let newSort;

  if (type === 'prev') {
    // 上移: 找比sort小的数据
    findRecords = findAdjacentLevelItems(tableOptions.options.records, selectedRecord, 'prev');
    newSort = findRecords.length > 0 ? findRecords[0].sort : 0;
  } else if (type === 'next') {
    // 下移: 找比sort大的数据
    findRecords = findAdjacentLevelItems(tableOptions.options.records, selectedRecord, 'next');
    newSort = findRecords.length > 0 ? findRecords[0].sort : selectedRecord.sort + 1;
  } else if (type === 'top') {
    // 置顶: 找最小的sort
    newSort = 0;
  } else if (type === 'bottom') {
    // 置底: 找最大的sort
    newSort = tableOptions.options.records.reduce((max, record) => record.sort > max ? record.sort : max) + 1;
  } else {
    return;
  }
  if (findRecords?.length > 0) {
    // 记录被交换排序的数据
    findRecords.map((findRecord) => {
      updateRecords.push({...findRecord, sort: selectedRecord.sort}); // 修改被交换排序的数据
      updateIndex.push(tableOptions.options.records.findIndex(record => record.index === findRecord.index));
    })
  }

  // 记录要交换的数据
  if (typeof newSort === 'number') {
    const selectIndex = tableOptions.options.records.findIndex(record => record.index === selectedRecord.index);
    updateRecords.push({...selectedRecord, sort: newSort});
    updateIndex.push(selectIndex);
  }

  // 更新数据
  if (updateRecords) {
    tableOptions.table.updateRecords(updateRecords, updateIndex);
    isChanged.value += updateRecords.length;
    listTableFn.updateSortState({field: 'sort', order: 'asc'}, tableOptions); // 更新排序
    tableOptions.table.clearSelected(); // 清除选中行
    //找到要选中行的索引
    const selectRow = 1 + tableOptions.options.records.findIndex(record => record.index === selectedRecord.index);
    tableOptions.table.selectCells([{start: {col: selectCols[0], row: selectRow}, end: {col: selectCols[1], row: selectRow}}]);
  }

}


//数据格式化
const formatter = {
  showItem: (item, _default = {}, index = null) => {
    return {
      ...item,
      status: !!item?.status,
    };
  },
  saveItem: (item, _default = {}, index = null) => {
    return {
      ...item,
      sort: typeof item?.sort === 'number' ? item?.sort : index,
      status: item?.status ? 1 : 0,
      code: item?.code || core.getUUID(),
      ..._default
    }
  },
  ...props.formatter
};


//菜单栏和搜索栏目
const getMenus = ()=>{
  return _.merge({},{
    saveList: {title: "保存", click: saveList, icon: 'ri-save-line', sort: 10,options:{disabled:isChanged.value<1}},
    deleteAll: {title: "删除", click: deleteAll, icon: 'ri-delete-bin-line', sort: 20,},
    turnOnStatus: {title: "启用", click: () => editAllStatus(1), icon: 'ri-play-line', sort: 30,},
    turnOffStatus: {title: "停用", click: () => editAllStatus(0), icon: 'ri-stop-line', sort: 40,},
    sortUp: {title: "上移", click: () => editSort('prev'), icon: 'ri-arrow-up-line', sort: 50,},
    sortDown: {title: "下移", click: () => editSort('next'), icon: 'ri-arrow-down-line', sort: 60,},
    search: {title: '刷新', icon: 'ri-refresh-line', sort: 100},
  }, props.menus);
}


onMounted(async () => {
  tableOptions.table = new VTable.ListTable(tableRef.value, tableOptions.options)
  await tableOptions.getData(true)
})

// 暴露方法和状态
defineExpose({updateAll,beforeClose})

</script>
<style scoped>
.winContent {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;


  > .winHeader {
    width: 100%;

    > .menuBox {
      border-bottom: 1px solid #ddd;
    }
  }

  > .winBody {
    width: 100%;
    height: 100%;
    overflow: hidden;

    > .winTable {
      width: 100%;
      height: 100%;
      position: relative;

      > div {
        width: 100%;
        height: 100%;
        position: absolute;
      }
    }
  }
}
</style>