<template>
  <div ref="body" class="body">
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";

import editTodo from '@/modules/home/edit_todo.vue'
import down from '@/modules/home/down_todo.vue'
import {getQuery} from "@/core/script/nav.js";

const mainTable = ref();
const uid = ref(0)

const refObj = reactive({
  mainTableShow: false,
});

const vData = reactive({
  selectOption:{statistical:[]},
  uid:0
})

const departId = ref(0)

const obj = {
  options: [],
  plantId: siyi.user.plantId,
  tabsConfig: {
    theme: 'card',
    defaultValue: 'userTable',
    onChange: val => refObj.tab = val,
  },
  panelConfig: {
    destroyOnHide: false,
  },
  mainTableConfig: {
    // footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'clearWhere', 'moreSettings', 'pageExport'],
      menu: {
        create: {
          click: () => {
            dialog.window(editTodo, {
                  query: {options: obj.options, plantId: obj.plantId, departId: departId.value, uid: vData.uid },
                  scene: 'auth',
                  getAttach: e => e && mainTable.value.reportConfig.getData()
                }, {title: "添加", width: '80%', height: '700px', forceEnlarge: false, changeSize: false,}
            );
          }
        },
        delete: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要删除的数据');
              return;
            }
            const data = asset.map(i => ({id: i.id, type: i.type}));
            dialog.confirm(`确定要删除吗？`, async () => {
              await api.post(apiUrl.home.todo_matter.del, {data}).then(res => {
                if (res) {
                  dialog.success(`成功删除`);
                  mainTable.value.reportConfig.getData();
                } else {
                  dialog.error(res.msg || '删除失败');
                }
              })
            });
          }
        },
        update: {
          click: () => {
            let asset = tableFn.getCheckedRecords(mainTable.value.reportConfig);
            if (asset.length === 0) {
              dialog.info('请先选择要修改的数据');
              return;
            }

            if(asset.length > 1){
              dialog.info('不能选择多条数据进行修改');
              return;
            }

            let title = '修改';
            dialog.window(editTodo, {
                  query: {asset: asset[0], options: obj.options, edit: true, departId: departId.value},
                  scene: 'auth',
                  getAttach: e => e && mainTable.value.reportConfig.getData()
                }, {title: title, width: '80%', height: '700px', forceEnlarge: false, changeSize: false,}
            );
          }
        },
      },
    },
    searchConfig: {
      search: [
        {type: 'input', field: 'require_uid_text', filter: true, options: {placeholder: '提出人'}, style: {width: '120px',}, save: false},
        {type: 'input', field: 'todo_matter', filter: true, options: {placeholder: '待办事项'}, style: {width: '200px'}, save: false},
        {type: 'input', field: 'duty_user_text', filter: true, options: {placeholder: '责任(汇报)人'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'reply', filter: true, options: {placeholder: '回复'}, style: {width: '200px'}, save: false},
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      getQuery: query => {
        return {
          depart_id: departId.value,
        }
      },
      url: apiUrl.home.todo_matter.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,      
      options: {
        editCellTrigger:'doubleclick', // 单元格双击触发编辑
        maxCharactersNumber: 10000, // 设置单元格显示的最大字符数
        enableLineBreak: true, // 自动解析换行符
        defaultRowHeight: 'auto', // 行高
        autoWrapText: true,
        defaultHeaderRowHeight: 30,
      },
      events: {
        click_cell: args => {
          const record = mainTable.value?.reportConfig.table?.getCellOriginRecord(args.col, args.row)
          if( (record.attachment_text !== '' && args.col === 10)
              || (record.attachment_text2 !== '' && args.col === 11)
              || (record.attachment_text3 !== '' && args.col === 12)
          ){
            record.col = args.col;
            dialog.window(down, {
                  query: {asset: record},
                  scene: 'auth',
                  getAttach: e => e && mainTable.value.reportConfig.getData()
                }, {title: "文件预览", width: '90%', height: '85%', forceEnlarge: false, changeSize: false,}
            );
          }
        },
        dblclick_cell: args => { },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          if (changedValue===rawValue){
            return ;
          }
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据

          if (['comment', 'sort', 'reply', 'todo_matter'].includes(field) && record?.id) {
            const res = api.post(apiUrl.home.todo_matter.editValue, {
              field: field,
              id: record.id,
              value: changedValue,
            })
            if(res){
              dialog.success('修改成功')
            }
          }else {
            vTable.changeCellValue(col, row, rawValue);
          }
        },
      },
      colAfterCallback: (col) => {
        col.style = {
          fontSize: 15,
          bgColor: (args) => {
            const record = mainTable.value?.reportConfig.table?.getCellOriginRecord(args.col, args.row)
            if (record?.marking && args.col === 7) {
              return { red:'#ffc8ce', green:'#c6efcd', blue:'#4dc2ed' }[record.marking] || ''
            }
            return null;
          },
          lineHeight:20,
          lineClamp:'auto'
        }
        col.headerStyle = {
          textAlign: "center",
          bgColor: "#e0e0e0",
          // fontSize: '16',
        };
        if(col.index === 6){
          col.style.fontSize = 12;
        }

        if(col.index === 9 || col.index === 10 || col.index === 11){
          col.style = {
            fontSize: 12,
            lineHeight: 20,
            color: '#35a1fd',
          }
        }
        return col;
      },
    },
  },
}


onMounted(() => {
  const query = getQuery();
  console.log('query', query)
  departId.value = query?.depart_id;
  const loading = dialog.loading()
  api.get(apiUrl.home.todo_matter.config, {depart_id: query?.depart_id}).then(res => {
    vData.selectOption = res?.option;
    vData.uid = res?.option?.uid;

    const serchFileds = ['statistical'];
    serchFileds.forEach(field => {
      const serchItem = obj.mainTableConfig.searchConfig.search.find(item => item.field === field);
      if (serchItem) serchItem.options.options = vData.selectOption[field] || [];
    })

    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;

    refObj.mainTableShow = true;
    loading.close();
  });


  
});
</script>


<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 3px;

  >.mainTable {
    height: 100%;
    flex-shrink: 0;
  }

  .t-tabs {
    flex: 1;
    flex-shrink: 0;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .t-tabs-panel {
    padding: 3px;
  }
}
</style>