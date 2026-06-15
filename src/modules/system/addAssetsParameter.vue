<template>
  <div class="container">
    <div class="base-info">
      <div class="base-info-content">
        <template v-for="(v, index) in getAsset" :key="index">
          <div>工厂名称：<span>{{ v['plant_id_text'] }}</span></div>
          <div>资产编号：<span>{{ v['code'] }}</span></div>
          <div>资产名称：<span>{{ v['name'] }}</span></div>
          <div>资产类型：<span>{{ v['type_text'] }}</span></div>
        </template>
      </div>
    </div>
    <div class="parameter-lists">
      <TableComponent class="table" ref="parameter" v-if="refObj.parameterShow" v-bind="obj.parameterConfig" />
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import TableComponent from '@/core/component/table_v2.vue';
import apiUrl from '@/core/config/url2';
import * as api from "@/core/script/api.js";
import * as tableFn from '@/core/script/tableFn';
import dialog from "@/core/script/dialog.js";

const props = defineProps({
  query: {
    type: Object,
    default: {}
  },
  dialog: { type: Object },
  getAttach: { type: Function,default: () => {} },
})
//过滤数据，获取设备信息
const getAsset = computed(() => {
  const result = [];
  result.push({
    'plant_id_text': props.query.asset['plant_id_text'],
    'code': props.query.asset['code'],
    'name': props.query.asset['name'],
    'type_text': props.query.asset['type_text'],
  });
  return result;
});
const parameter = ref(null);
const refObj = ref({parameterShow: false,});
const obj = {
  parameterConfig: {
    searchConfig: {},
    menuConfig: {
      defaultMenuShowList: ['search', 'clearWhere'],
      menu: {
        create: {
          click: () => {
            let checkedRecords = tableFn.getCheckedRecords(parameter.value.reportConfig);
            let fids = checkedRecords.map(i => i.id), assetId = props.query.asset.id,type = props.query.asset.type,str = props.query.asset.type === 'group' ? '资产组' : '资产';
            if (fids.length === 0) {
              dialog.info('请先选择要添加的资产属性');
              return;
            }
            dialog.confirm(`确定要添加${fids.length}个资产属性到${str}《${props.query.asset['name']}》吗？`, async () => {
              const arr = [];
              checkedRecords.forEach((item) => {
                arr[item.id] = item.name;
              });
              await api.post(apiUrl.sys.asset.addParameter, { assetId, fids,type }).then(res => {
                if (typeof (res.ret) === 'boolean') {
                  if (res.ret === true) {
                    props.getAttach(true);
                    dialog.success(`成功添加${fids.length}个资产属性到${str}《${props.query.asset['name']}》`);
                  } else {
                    dialog.error('添加失败');
                  }
                } else if (typeof (res.ret) === 'number') {
                  if (res.ret < 0) {
                    dialog.error('资产组赞时不支持添加资产属性');
                  }
                } else {
                  dialog.error('网络错误，请稍后再试');
                }
                props.dialog.close();
              })
            });
          }
        },
      },
    },
    query: {
      id: props.query.asset.id, type: props.query.asset.type, flag: true
    },
    tableConfig: { url: apiUrl.sys.asset.addParameterList, showCheck: 'multiple' }
  }
}
onMounted(async () => {
  await api.get(apiUrl.sys.asset.addParameterConfig).then(res => {
    obj.parameterConfig.tableConfig = { ...obj.parameterConfig.tableConfig, ...res.table };
    obj.parameterConfig.tableConfig.columns = tableFn.createColumns(res.columns);
    refObj.value.parameterShow = true;
  });
});
</script>

<style scoped>
.container {
  padding: 20px;
  display: flex;
  flex-direction: column;

  .base-info {
    margin-bottom: 20px;

    .base-info-content {
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid #eee;

      >div {
        width: 50%;
        margin-bottom: 15px;
      }

      span {
        font-weight: 500;
        color: #606266;
        margin-right: 5px;
      }
    }
  }

  .parameter-lists {
    overflow: auto;

    .table {
      height: 635px;
      overflow: auto;
      flex-shrink: 0;
    }
  }

}
</style>