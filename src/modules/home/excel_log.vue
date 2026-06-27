<template>
  <div ref="body" class="body">
    <div class="excel_title">龙腾指标统计表单</div>
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" />
    <TableComponent ref="processTable" v-if="refObj.processTableShow" v-bind="obj.processTableConfig" />
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

import editExcel from '@/modules/home/edit_excel.vue'
import downExcel from '@/modules/home/down_excel.vue'

const mainTable = ref();
const processTable = ref();

const refObj = reactive({
  mainTableShow: false,
  processTableShow: false,
  tab: 'processTable'
});

const vData = reactive({
  selectOption:{statistical:[]}
})

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
    footer: false,
    changeSizeBottom:true,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings', 'clearWhere', 'pageExport'],
      menu: {
        create: {
          click: () => {
            dialog.window(editExcel, {
                  query: {options: obj.options, plantId: obj.plantId},
                  scene: 'auth',
                  getAttach: e => e && mainTable.value.reportConfig.getData() && processTable.value.reportConfig.getData()
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
              await api.post(apiUrl.home.excel.del, {data}).then(res => {
                if (res) {
                  dialog.success(`成功删除`);
                  mainTable.value.reportConfig.getData();
                  processTable.value.reportConfig.getData()
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
            dialog.window(editExcel, {
                  query: {asset: asset[0], options: obj.options, edit: true,},
                  scene: 'auth',
                  getAttach: e => e && mainTable.value.reportConfig.getData() && processTable.value.reportConfig.getData()
                }, {title: title, width: '80%', height: '700px', forceEnlarge: false, changeSize: false,}
            );
          }
        },
      },
    },
    searchConfig: {
      search: [
        {type: 'select',field: 'statistical',filter: true, filterValueType: 'value',options: {multiple: false,placeholder: '统计时间',options: vData.selectOption.statistical }, value: new Date().getFullYear(), style: {width: '130px'}, save: false },
        {type: 'input', field: 'ierarchys_text', filter: true, options: {placeholder: '指标层级'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'indicator_type', filter: true, options: {placeholder: '被考核部门'}, style: {width: '140px'}, save: false},
        {type: 'input', field: 'indicator_level', filter: true, options: {placeholder: '指标名称'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'data_source', filter: true, options: {placeholder: '数据来源'}, style: {width: '120px'}, save: false},
        {type: 'input', field: 'management_unit', filter: true, options: {placeholder: '管理单位'}, style: {width: '120px'}, save: false},
      ],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.excel.list,
      showCheck: true ,
      checkField: 'check',
      disablePage: true ,      
      options: {
        editCellTrigger:'doubleclick',
        maxCharactersNumber: 10000, // 设置单元格显示的最大字符数
        defaultRowHeight: 'auto', // 行高
        autoWrapText: true,
        enableLineBreak: true,
        defaultHeaderRowHeight: 30, // 表头行高
        rowSeriesNumber:{
          width: 55,
        }
      },
      events: {
        click_cell: args => {
          if (args.originData?.index > 0 && args.originData.index !== mainTable.value.reportConfig.prveSelectRow.index) {
            processTable.value.reportConfig.getData({ exec: null, indicator_id: args.originData.id, type: args.originData.type });
          }
        },
        dblclick_cell: async ({originData,field}) => {
          if (originData?.index === undefined) return;
          if(['attachment_one','attachment_two','attachment_three'].includes(field) && originData?.[field] !== '') {
            originData.field = field;
            dialog.window(downExcel, {
              query: {asset: originData, options: obj.options, edit: true,},
              scene: 'auth',
              getAttach: e => e && mainTable.value.reportConfig.getData() && processTable.value.reportConfig.getData()
            }, {title: '查看附件', width: '80%', height: '700px', forceEnlarge: false, changeSize: false,});
          }
        },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          if (changedValue===rawValue){
            return ;
          }
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据

          if (['reason', 'programme', 'result', 'comment'].includes(field) && record?.id) {
            const res = api.post(apiUrl.home.excel.editValue, {
              field: field,
              id: record.id,
              value: changedValue,
            })
            if(res){
              dialog.success('修改成功')
            }
          }else if(['sort'].includes( field) && record?.id){
            const res = api.post(apiUrl.home.excel.editIndicator, {
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
          if(col.cellType === 'sparkline' ) {
            col.cellType = 'sparkline';
            col.sparklineSpec = {
              type: 'line',xField: 'x',yField: 'y',pointShowRule: 'all',smooth: false,line: {style: {stroke: '#2E62F1',strokeWidth: 2,},},point: {
                hover: {stroke: 'blue',strokeWidth: 1,fill: 'red',shape: 'circle',size: 4,},
                style: {stroke: 'red',strokeWidth: 1,fill: 'yellow',shape: 'circle',size: 2,},
              },
              crosshair: {style: {stroke: 'gray',strokeWidth: 1,},},
            }
          }

          col.style = {
            bgColor: (args) => {
              const record = mainTable.value?.reportConfig.table?.getCellOriginRecord(args.col, args.row)
              if(args.col === 6) {
                return {1:'#c6efcd', '-1':'#ffc8ce', 0:'#e6e8f0'}[record?.is_target] || ''
              }

              if (record?.marking && args.col === 10) {
                return { red:'#ffc8ce', green:'#c6efcd' }[record.marking] || ''
              }
              return null;
            },

            lineClamp:'auto'
          }
          col.headerStyle = {
            textAlign: "center",
          };

          if(col?.is_admin?.includes('fontSize')){
            col.headerStyle.fontSize = 15;
            col.style.fontSize = 15;
          }
        col.style.lineHeight = 20;
        if(col?.is_admin?.includes('bgColor')){
          col.headerStyle.bgColor = '#e0e0e0';
        }


        if(col.index === 16 || col.index === 17 || col.index === 18){

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
  processTableConfig:{
    footer: false,
    searchConfig: false,
    menuConfig: false,
    tableConfig: {
      url:apiUrl.home.excel.month_list, showCheck: false, disablePage: false,useEncryptionFields: false,
      options: {
        rowSeriesNumber:{
          width: 55,
        },
        customMergeCell : (col, row, table) => {
          if(col >2 && col < 14 && row  === 7){
              return {
                text: processTable.value?.reportConfig?.table?.getCellOriginRecord(1, 7)?.jan,
                range: {start: {col: 2,row: 7 },end: {col: 30, row: 7 },BgColor: '#f5f5f5', },

              };
          }
        },
      },
      colAfterCallback: (col) => {

        col.style = {
          // fontSize: 15,
          bgColor: (args) => {            
            const record = processTable.value?.reportConfig.table.getCellOriginRecord(args.col, args.row)
            const monthMap = {
              2: 'jan',3: 'feb',4: 'mar',5: 'apr',6: 'may',7: 'jun',
              8: 'jul',9: 'aug',10: 'sep',11: 'oct',12: 'nov',13: 'dec'
            }
            // 列高亮数据
            const month = monthMap[args.col]
            if (month && record?.[month]) {
              const status = record?.[`is_${month}`]
              if (status === 1) { return '#c6efcd'}
              if (status === -1) { return '#ffc8ce' }
            }
            return null;
          },
        }
        col.headerStyle = {
          textAlign: "center",
        };
        if(col?.is_admin?.includes('fontSize') ){
          // col.headerStyle.fontSize = 16;
          // col.style.fontSize = 17;
        }
        if(col?.is_admin?.includes('bgColor') ){
          col.headerStyle.bgColor= "#e0e0e0";
        }
        return col;
      },
      events: {
        dblclick_cell: async ({originData, field}) => {
          let title = ['', '', '数据说明', '原因分析', '工作小结', '计划（具体）', '亏损额', '亏损说明'];
          const months = ref({'jan':'一月', 'feb':'二月', 'mar':'三月', 'apr':'四月', 'may':'五月', 'jun':'六月', 'jul':'七月', 'aug':'八月', 'sep':'九月', 'oct':'十月', 'nov':'十一月', 'dec':'十二月'})

          if (originData?.[field] && field !== 'title') {
            const html = `<div style="padding: 20px 40px;line-height: 200%;white-space:pre-wrap; word-break:break-all;font-size:18px;">${originData[field]}</div>`;
            if(originData?.index === 5 ) {
              const keys = Object.keys(months.value);
              const nextIndex = keys.indexOf(field) + 1;
              const nextMonth = months.value[keys[nextIndex]];
              dialog.window(html, {}, {width: '600px', height: '500px', title: nextMonth + title?.[originData.index]});
            }else if(originData?.index === 7){
              dialog.window(html,{},  { width: '600px', height: '500px', title: title?.[originData.index] });
            }else{
              dialog.window(html,{},  { width: '600px', height: '500px', title: months.value[field] + title?.[originData.index] });
            }
          }
        }
      },
    },
  },
}


onMounted(() => {
  const loading = dialog.loading()
  api.get(apiUrl.home.excel.config).then(res => {
    vData.selectOption = res?.option;
    const isAdmin = res?.option?.is_admin;


    const serchFileds = ['statistical'];
    serchFileds.forEach(field => {
      const serchItem = obj.mainTableConfig.searchConfig.search.find(item => item.field === field);
      if (serchItem) serchItem.options.options = vData.selectOption[field] || [];
    })

    obj.mainTableConfig.tableConfig = { ...obj.mainTableConfig.tableConfig, ...res.table };
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;

    if(!isAdmin.includes('excel_text_add')){
      delete obj.mainTableConfig.menuConfig.menu.create
    }
    if(!isAdmin.includes('excel_text_del')){
      delete obj.mainTableConfig.menuConfig.menu.delete
    }
    if(!isAdmin.includes('excel_text_edit')){
      delete obj.mainTableConfig.menuConfig.menu.edit
    }

    if(!isAdmin.includes('excel_text_export')) {
      obj.mainTableConfig.menuConfig.defaultMenuShowList = obj.mainTableConfig.menuConfig.defaultMenuShowList.filter(
          item => item !== 'pageExport'
      )
    }


    /************过滤权限**************/
    // delete obj.mainTableConfig.menuConfig.menu
    // obj.mainTableConfig.tableConfig.columns.forEach((field , index) => {
    //   if(field.editor){
    //     obj.mainTableConfig.tableConfig.columns[index].editor='false'
    //   }
    // })
    /************过滤权限**************/


    refObj.mainTableShow = true;
    loading.close();
  });

  api.get(apiUrl.home.excel.month_init).then(res => {
    obj.processTableConfig.tabcleConfig = { ...obj.processTableConfig.tableConfig, ...res.table };
    obj.processTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.processTableShow = true;
  });
  
});
</script>


<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 3px;

  >.mainTable {
    height: calc(100vh - 170px);
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

.excel_title {
  text-align: center;
  font-size: 25px;
  color: #0c93e5;
  position: absolute;
  top: 39px;
  z-index: 999;
  left: 775px;
  font-family:'微软雅黑';
}
</style>