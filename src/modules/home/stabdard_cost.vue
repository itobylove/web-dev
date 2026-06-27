<template>
  <div style="position:relative;" >
    <div style="text-align: center;font-size: 20px;line-height: 150%;font-weight: bold;color:#0c93e5;letter-spacing:8px;position: absolute;left: 40%;z-index: 999;">标准成本框架 [未税成本]</div>
    <TableComponent class="mainTable" ref="mainTable" v-if="refObj.mainTableShow" v-bind="obj.mainTableConfig" style="width: 100%;height: 345px" />
    <TableComponent class="detailsTable" ref="detailsTable" v-if="refObj.detailsTableShow" v-bind="obj.detailsTableConfig" style="width: 100%;height:calc(100vh - 385px)" />

    <div
        v-if="showDialog"
        class="custom-dialog"
        :style="{ left: `${pos.x}px`, top: `${pos.y}px`,position: `fixed`,border: `1px solid #e0e0e0`,backgroundColor: `#fff`,height: `200px`,width: `150px` , padding: `5px`}"
        @click.stop
    >
      <ul>
        <li v-for="item in OptionArr" key="item.id" @click="fn.clickArr(item)" >{{ item.title }}</li>
      </ul>
    </div>

  </div>
</template>
<script setup>
import { onMounted, reactive, ref, onUnmounted } from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from '@/core/script/api';
import * as tableFn from '@/core/script/tableFn';
import siyi from '@/core/script/siyi';
import dialog from "@/core/script/dialog.js";
import {getQuery} from "@/core/script/nav.js";
import {register,  ListTable} from '@visactor/vtable';
import {ListEditor} from '@visactor/vtable-editors';



const showDialog = ref(false)
const OptionArr = ref([])
const argsData = ref({})

const mainTable = ref();
const detailsTable = ref();
const timestampHex = ref(Math.floor(new Date().getTime() / 1000 ) );

const refObj = reactive({
  mainTableShow: false,
  detailsTableShow: false
});

const closeDialogOnClickOutside = (e) => {
  showDialog.value = false;
};

const vData = reactive({
  selectOption:{statistical:[]},
})

const options = ref({});

const pos = reactive({ x: 0, y: 0 })

// const tempDom = document.createElement('div');
// const tempTable = new ListTable({ container: tempDom });
// const editableTheme = JSON.parse(JSON.stringify(tempTable.theme));
// tempTable.release();

// editableTheme.scrollStyle = {
//   visible: 'always',
//   barToSide: true,
//   width: 8
// };

const obj = {
  options: [],
  plantId: siyi.user.plantId,
  mainTableConfig: {
    swipeable: false,
    changeSizeBottom: false,
    footer: false,
    menuConfig: {
      defaultMenuShowList: [],
      menu: {
        quotation: {
          sort: 110, title: '重新报价', icon: 'ri-chat-new-line', click: () => {
            mainTable.value.reportConfig.getData();
            detailsTable.value.reportConfig.getData();
            timestampHex.value = Math.floor(new Date().getTime() / 1000 )

        } },

        click_one: {
          sort: 110, title: '跳转 1', icon: 'ri-chat-new-line', click: () => {
            const vTable = mainTable.value?.reportConfig.table;
            vTable?.scrollToCell({col:5}) // 跳转列指定 rows 行 col 列
          } },
        click_two: {
          sort: 110, title: '跳转 2', icon: 'ri-chat-new-line', click: () => {
            const vTable = mainTable.value?.reportConfig.table;
            vTable?.scrollToCell({col:9}) // 跳转列指定 rows 行 col 列
          } },
        click_three: {
          sort: 110, title: '跳转 3', icon: 'ri-chat-new-line', click: () => {
            const vTable = mainTable.value?.reportConfig.table;
            vTable?.scrollToCell({col:11}) // 跳转列指定 rows 行 col 列
          } },
        click_four: {
          sort: 110, title: '跳转 4', icon: 'ri-chat-new-line', click: () => {
            const vTable = mainTable.value?.reportConfig.table;
            vTable?.scrollToCell({col:33}) // 跳转列指定 rows 行 col 列
          } },
        click_six: {
          sort: 110, title: '跳转 5', icon: 'ri-chat-new-line', click: () => {
            const vTable = mainTable.value?.reportConfig.table;
            vTable?.scrollToCell({col:50}) // 跳转列指定 rows 行 col 列
          } },
        click_seven: {
          sort: 110, title: '跳转 6', icon: 'ri-chat-new-line', click: () => {
            const vTable = mainTable.value?.reportConfig.table;
            vTable?.scrollToCell({col:70}) // 跳转列指定 rows 行 col 列
          } },
      }
    },
    searchConfig: false,
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.stabdardCost.config_list,
      emptyRow: false, // 不填充空行
      showCheck: false ,
      checkField: 'check',
      disablePage: true ,
      options: {
        hierarchyExpandLevel: 3,
        columnResizeMode: 'none', // 列宽拖拽
        autoWrapText:true,
        enableLineBreak: true,
        defaultRowHeight: 'auto', // 行高
        rowSeriesNumber: false, // 显示行号 设置
        customMergeCell : (col, row, table) => {
          const vTable = mainTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          // const record = vTable.getRecordByCell(col, row);

          const tipRules = [
            {s: 0, e: 0, r: 4, t: '请选择', bg: '#466cbd', color: '#fff'},
            {s: 0, e: 0, r: 5, t: '取值说明', bg: '#466cbd', color: '#fff'},
            {s: 0, e: 0, r: 6, t: '未税成本\n' + '元/平米', bg: '#466cbd', color: '#fff'},
            { s:1,e:6,r:5,t:'请手动输入以上基础信息'},
            { s:11,e:11,r:5,t:'单价随加工路线的不同而变化' },
            { s:13,e:14,r:5,t:'此处为选择表面处理方式' },
            { s:15,e:22,r:5,t:"金价基价970元/克\n当金价上涨10%时，涨幅单元格需同步上涨10%" },
            { s:23,e:29,r:5,t:'根据I列所选表面处理方式自动计算' },
            { s:30,e:34,r:5,t:'此工序外发，镍厚≦200时按200收费，受镀面积≦13%时，按13%收取费用' },
            { s:35,e:36,r:5,t:'单双面板不取，涨幅依行情波动调整' },
            { s:37,e:39,r:5,t:'单双面板不取，涨幅依行情波动调整' },
            { s:40,e:40,r:5,t:'单双面板不取' },
            { s:41,e:41,r:5,t:'光模块会出现次数重复，已按加工路线锁定次数' },
            { s:42,e:42,r:5,t:'若过树脂塞孔，则电镀次数需+树脂塞孔次数' },
            { s:43,e:43,r:5,t:'与加工路线关联，盲埋孔板需过填孔' },
            { s:45,e:45,r:5,t:'表面处理为喷锡则有计价' },
            { s:46,e:46,r:5,t:'成品铜厚≥2OZ，需二次阻焊' },
            { s:48,e:48,r:5,t:'按需选择' },
            { s:50,e:51,r:5,t:'自选孔数区间' },
            { s:53,e:54,r:5,t:'平米PCS数*单PCS沉头孔个数*0.5元/个' },
            { s:55,e:56,r:5,t:'按需选择' },
            { s:57,e:58,r:5,t:'按需选择' },
            { s:59,e:59,r:5,t:'平米SET数*单价' },
            { s:60,e:61,r:5,t:'平米PCS数*单PCS沉头孔个数*0.5元/个' },
            { s:62,e:63,r:5,t:'按需选择' },
            { s:64,e:64,r:5,t:'平米SET数*单价' },
            { s:65,e:65,r:5,t:'按需选择' },
            { s:66,e:67,r:5,t:'默认选1\n' + '特殊手动输入' },
            { s:68,e:69,r:5,t:'平米SET数*单价' },
            { s:70,e:74,r:5,t:'根据客户要求手动选择添加' },
            { s:75,e:79,r:5,t:'测试方式可多选，需手动选择，\n 另注意：光板不需测试，互调测试只针对高频板，HCT测试只针对HDI盲埋孔板' },
            { s:80,e:81,r:5,t:'飞针与电感需手入平米测试点数,\n计价=平米测试点数*单价' },
            { s:82,e:82,r:5,t:'含工厂级所有跟生产相关制费' },
            { s:83,e:83,r:5,t:'集团级销管财平米费用' },

            { s:2,e:7,r:6,t:'', col:2 , row:6 ,key:'value_43' },
            { s:8,e:11,r:6,t:'', col:8 , row:6 ,key:'value_49' },
            { s:9,e:9,r:6,t:'', col:9 , row:6 ,key:'value_53' },
            { s:15,e:18,r:6,t:'', col:15 , row:6 ,key:'value_74' },
            { s:19,e:22,r:6,t:'', col:19 , row:6 ,key:'value_78' },
            { s:37,e:39,r:6,t:'', col:37 , row:6 ,key:'value_100'},

            { s:53,e:54,r:6,t:'', col:53 , row:6 ,key:'value_100'},
            { s:55,e:56,r:6,t:'', col:55 , row:6 ,key:'value_129'},
            { s:57,e:58,r:6,t:'', col:57 , row:6 ,key:'value_131'},
            { s:60,e:61,r:6,t:'', col:60 , row:6 ,key:'value_133'},
            { s:62,e:63,r:6,t:'', col:62 , row:6 ,key:'value_135'},
            { s:66,e:67,r:6,t:'', col:66 , row:6 ,key:'value_137'},
            { s:68,e:69,r:6,t:'', col:68 , row:6 ,key:'value_139'},
          ];

          // 缓存表格实例，只读取一次
          const match = tipRules.find(item => item.r === row && col >= item.s && col <= item.e);
          if (!match) return null;

          let tipText = match.t;
          let targetRecord = null;

          if (match.col != null && match.row != null && match.key && vTable) {
            targetRecord = vTable.getCellOriginRecord(match.col, match.row);
            tipText = targetRecord?.[match.key] ?? match.t;
          }

          const cellStyle = { textAlign: 'center' };

          if (match.bg || targetRecord ) {
            cellStyle.bgColor = match.bg ?? ( targetRecord?.state === 1 ? 'red' : '');
          }
          if(match?.color) {
            cellStyle.color = match.color;

          }
          cellStyle.lineHeight = 20;

          return {
            text: tipText,
            range: {
              start: { col: match.s, row },
              end: { col: match.e, row }
            },
            style: cellStyle
          };

        }
      },
      events: {
        click_cell: async (args) => {
          // console.log(228, args)
          if (args.row !== 4 || args.col < 7) { return false; }
          if (args.originData?.name !== '' && args.originData?.value !== '' ) {
            console.log(230, args)



            // console.log(rec)
            // if (!rec) {
            //   console.error(`坐标col:${targetCol},row:${targetRow}无数据记录，请核对行列索引`);
            //   return;
            // }
            //

            // // console.log(rec)
            // // const d = vTable?.scenegraph.updateCellContent(2, 6);	// 刷新表格数据
            // // vTable?.scenegraph.updateRow(6);
            // try {
            //   vTable?.scenegraph.updateRow(6);
            // } catch (err) {
            //   console.warn('渲染提示存在空数组，已捕获', err.message);
            // }
            // console.log(d)




            showDialog.value = false
            if(args?.field.includes('value_')){
              argsData.value = args
              const num1Num = Number(args?.field?.split('_')[1])
              // console.log('num1Num', num1Num)

              const excludeArr = [57, 58, 59, 60, 61, 61, 66, 67, 68, 69, 70, 71, 72 , 359, 80, 103, 104, 91, 94, 106, 105, 95, 97, 99, 146]
              if(!excludeArr.includes(num1Num)){
                await fn.urlPidListTitle(num1Num)  // 获取弹窗异步选项
              }

              handleClick(args.event)
              showDialog.value = true
            }

          }
        },
        dblclick_cell: (args) => {

        },

        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          const vTable= mainTable.value.reportConfig.table; // 表格实例
          const field = vTable.getHeaderField(col, row); //获取列名
          const record = vTable.getRecordByCell(col, row); //根据单元格获取行数据
          const res = await api.post(apiUrl.home.stabdardCost.save, {
            unique_value: timestampHex.value,
            col: Number(field?.split('_')[1]),
            data: changedValue,
          }, null, true)

          if( res?.data?.code === 20000 ) {
            let resData = res?.data?.data;
            // console.log(resData.list)
            const vTable = mainTable.value?.reportConfig.table; // 表格实例
            for (const key in resData.list) {

            }
            

            const rec = vTable?.getRecordByCell(1, 6);  // 获取数据
            rec.value_43 = 1;								// 设置参数
            // rec.text_value = 21;
            vTable.setRecords([...vTable.records]); // 重新渲染表格
            detailsTable.value.reportConfig.getData();

          }

        }
      },
      colAfterCallback: (col) => {
        let START_COL_INDEX = 3;
        let HIGHLIGHT_ROW = 4;
        let HIGHLIGHT_COLOR = '#e0e0e0';

        let setCellStyle = (targetItem) => {
          targetItem.style = {
            bgColor: (args) => args.row === HIGHLIGHT_ROW ? HIGHLIGHT_COLOR : null,
          };
        };

        let loopColumns = (columns) => {
          columns.forEach(column => {
            setCellStyle(column);
            if (column?.columns) loopColumns(column.columns);
          });
        };

        if (col.index >= START_COL_INDEX && col?.columns) {
          loopColumns(col.columns);
        }

        col.style = {
          bgColor: (args) => {
            if(args.row === 4){
              return "#e0e0e0"
            }
            return null;
          }
        }

        return col;
      },
    },
  },
  detailsTableConfig:{

    changeSizeBottom: false,
    // menuConfig: false,
    menuConfig: {
      defaultMenuShowList: ['search', 'moreSettings','pageExport','clearWhere','pageExport'],
      menu: {
        // create: {},
        // update: {},
        // delete: {},
      }
    },
    // searchConfig: false,
    // filterWhere: false,
    searchConfig: {
      search: [],
    },
    tableConfig: {
      useEncryptionFields: false,
      url: apiUrl.home.stabdardCost.list,
      showCheck: false ,
      checkField: 'check',
      disablePage: true ,

      options: {
        hierarchyExpandLevel: 3,
        autoWrapText:true,
        enableLineBreak: true,
        defaultRowHeight: 'auto', // 行高
        rowSeriesNumber:{
          width: 55,
        }
      },
      events: {
        click_cell: args => {
          if (args.originData?.name !== '' && args.originData?.value !== '' ) {
            return args
          }
        },
        change_cell_value: async ({row, col, changedValue, currentValue, rawValue}) => {
          const vTable = detailsTable.value?.reportConfig.table; // 表格实例
          const field = vTable?.getHeaderField(col, row); //获取列名
          const record = vTable?.getRecordByCell(col, row); //根据单元格获取行数据
          await api.post(apiUrl.home.stabdardCost.save, {
                unique_value: record.unique_value.split('_')[1],
                col: Number(field.split('_')[1]),
                data: changedValue,
          })

        }
      },
      colAfterCallback: (col) => {

        return col;

      },
    },
  }
}

const fn = {
  urlPidListTitle: async (id) => {
    let isTextAreaEditor = false
    let to52 = [77, 81, 87, 102];
    let to74 = [78];
    let to75 = [79];
    let to148 = [149];
    let TEXT_AREA = 76;

    if (id === TEXT_AREA) {
      isTextAreaEditor = true;
    } else if (to52.includes(id)) {
      id = 52;
    } else if (to74.includes(id)) {
      id = 74;
    } else if (to75.includes(id)) {
      id = 75;
    } else if (to148.includes(id)) {
      id = 148;
    }
    if (isTextAreaEditor === false) {
      const res = await api.get(apiUrl.home.stabdardCost.getOption, {id: id === 149 ? 148 : id});
      OptionArr.value = res?.list
    }

    if(isTextAreaEditor === true) {

    }

  },
  clickArr: async (item) => {
    showDialog.value = false

    const vTable = mainTable.value.reportConfig.table;
    vTable.changeCellValue(argsData.value.col, argsData.value.row, item.title ); // 设置行列数据值

    const res = await api.post(apiUrl.home.stabdardCost.save, {
      unique_value: timestampHex.value,
      col: Number(argsData.value?.field?.split('_')[1]),
      data: item?.id,
    })

    // if(res) {
    //   detailsTable.value.reportConfig.getData();
    // }

  },
}

const handleClick = (e) => {
  e.stopPropagation();
  let x = e.clientX // - 300
  let y = e.clientY + 20
  pos.x = x
  pos.y = y
}


onMounted(() => {

  siyi.navHide = true;

  // console.log('timestampHex', timestampHex.value)

  document.addEventListener('click', closeDialogOnClickOutside);



  const loading = dialog.loading()
  api.get(apiUrl.home.stabdardCost.init, {table: 'mainTable'}).then(res => {
    options.value = res?.list;
    vData.selectOption = res?.option;
    obj.mainTableConfig.tableConfig = {...obj.mainTableConfig.tableConfig, ...res.table};
    obj.mainTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);

    obj.options = res.option;
    refObj.mainTableShow = true;
    loading.close();

  });



  api.get(apiUrl.home.stabdardCost.init, {table:'detailsTable'} ).then(res => {
    vData.selectOption = res?.option;
    obj.detailsTableConfig.tableConfig = { ...obj.detailsTableConfig.tableConfig, ...res.table };
    obj.detailsTableConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    obj.options = res.option;
    refObj.detailsTableShow = true;
  });

});

onUnmounted(() => {
  // 组件卸载时移除监听，避免内存泄漏
  document.removeEventListener('click', closeDialogOnClickOutside);
});

</script>

<style scoped>
.dept-position {
  display: flex;
  flex-direction: row;
  & .tableBox {
    flex: 1;
    padding-right: 0;
  }
  .user-list {
    flex: 5;
  }
}

.custom-dialog ul li {
  list-style: none;
  cursor: pointer;
}
.custom-dialog {
  overflow: hidden;
  overflow-y: auto;
  scrollbar-width: none;
}

.custom-dialog ul{

}




</style>