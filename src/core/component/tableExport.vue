<template>
  <div ref="box" class="exprtoData">
    <div class="header">
      <Menu :menu :search="searchRef" :defaultMenuShowList="[search.length>0?'clearWhere':'']"/>
      <Search ref="searchRef" :search v-if="search.length>0" :filter="false"/>
    </div>
    <div class="body">
      <div>
        <span v-for="col in columns" @click="checkCol(col)" :class="columnsCheck[col.oldfield]?'yes':'no'">{{ col.title }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import {reactive, ref} from 'vue'
import Menu from '@/core/component/menu.vue'
import Search from '@/core/component/search.vue'
import * as core from '@/core/script/core.js'
import * as api from '@/core/script/api.js'
import dialog from '@/core/script/dialog.js'
import siyi from '@/core/script/siyi.js'


const props = defineProps({
  table: {type: Object, default: {}},
  search: {type: Array, default: []},
  dialog: {type: Object}
})


const menu = {
  exportExcelData: {title: '导出数据', icon: 'ri-save-line', sort: 1, click: () => exportExcelData()},
  allSelect: {title: '全选', icon: 'ri-checkbox-fill', sort: 2, click: () => allSelect()},
  unSelect: {title: '反选', icon: 'ri-checkbox-line', sort: 3, click: () => unSelect()},
}
const searchRef = ref()
const search = []
props.search.forEach(item => item.filter === false && search.push(item))


const box = ref(false)
const columnsCheck = reactive({})
const columns = reactive([])
props.table.options.columns.forEach(col => {
  if (!col.disabledExport && col.cellType !== 'checkbox') {
    columns.push({title: col.title, field: col.field, oldfield: col.oldfield})
    if (!col.hide) columnsCheck[col.oldfield] = col.title
  }
})

//选择
const checkCol = col => columnsCheck[col.oldfield] = columnsCheck[col.oldfield] ? false : col.title
//全选
const allSelect = () => columns.forEach(col => columnsCheck[col.oldfield] = col.title)
//反选
const unSelect = () => columns.forEach(col => columnsCheck[col.oldfield] = columnsCheck[col.oldfield] ? false : col.title)
//导出
const exportExcelData = async () => {
  const field = {}
  for (const oldfield in columnsCheck) {
    if (columnsCheck[oldfield]) field[oldfield] = columnsCheck[oldfield]
  }
  const where = searchRef.value?.get() || {}
  where.page = 1
  where.pageNum = 99999999
  const info = dialog.info('后台正在努力导出数据中，完成后会提示您下载，请稍等一会儿。',1e10)
  props.dialog.close()
  const res = await api.post(props.table.url, {
    exec: props.table.id,
    field,
    where,
    filename: siyi.user.nickname + '.' + props.table.name,
    type: 'export',
  })
  core.files.downloadFile(res)
  info.close()
}

</script>
<style scoped>
.exprtoData {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .header {
    border-bottom: 1px solid #e1e4e8;
    background-color: #f3f3f3;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }


  > .body {
    flex: 1;
    margin: 5px;
    overflow: hidden auto;
    flex-shrink: 0;

    &::-webkit-scrollbar {
      display: none;
    }

    > div {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;

      > span {
        width: 150px;
        height: 60px;
        cursor: pointer;
        border-radius: 5px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.yes {
          background-color: #35a1fd;
        }

        &.no {
          background-color: #e9e9e9;
        }
      }
    }
  }
}
</style>