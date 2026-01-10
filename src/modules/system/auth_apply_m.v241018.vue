<template>
  <div class="siyi-auth-apply" title="权限申请单处理（移动端）">

    <t-dropdown-menu class="head-filter" v-if="vData.action==='list'">
      <t-dropdown-item :label="'状态('+(vData.listOption?.status?.[vData.params.status] || '全部')+')'" v-bind="tabs.bind('status')" @change="(value)=>tabs.change('status',value)"/>
      <t-dropdown-item label="类型" v-bind="tabs.bind('type')" @change="(value)=>tabs.change('type',value)"/>
    </t-dropdown-menu>

    <t-row class="head-search" v-if="vData.action==='list'">
      <t-col span="24" class="light">
        <t-search v-model="vData.params.search" v-bind="searcher.bind" v-on="searcher.on"></t-search>
      </t-col>
    </t-row>

    <t-loading id="loader" theme="spinner" :loading="vData.loading" v-show="vData.loading" layout="vertical" size="30px" />

    <t-pull-down-refresh id="main-pull"
                         v-model="vData.refreshing"
                         :loading-bar-height="66"
                         :loading-texts="['下拉刷新', '松开刷新', '正在刷新', '刷新完成']"
                         @refresh="()=>getList()" v-if="vData.action==='list'"
    >
      <t-list id="main-list" @scroll="listCell.scroll" @loadMore="()=>getList('next')">
        <t-cell-group theme="default">
          <t-cell v-for="(item,index) in vData.list" :key="item.id"
                  v-bind="listCell.bind(item)"
                  @click="listCell.click(item,$event)"
          >
            <template #title>
              <t-badge color="#13151d" :count="index+1" style="position: absolute;left:10px;top:10px" />
              <p>{{item.identity_info +"\t"+ item.nickname + "" }}</p>
            </template>

            <template #description>
              <p>{{ "类型：" + item['_text']['type']}}</p>
              <p>{{ "节点：" + item['item']['name']}}</p>
              <p>{{ "描述：" + item['description']}}</p>
              <p>{{ "状态：" + item['_text']['status']}}</p>
              <p>{{ "时间：" + item['_text']['created_at'] }}</p>
            </template>
          </t-cell>
        </t-cell-group>
        <template #footer>
          <t-empty :description="vData.msg"></t-empty>
        </template>
      </t-list>

    </t-pull-down-refresh>

    <t-fab v-show="backBtn.isShow()" v-bind="backBtn.bind" v-on="backBtn.on" />
    <t-fab v-show="goTop.isShow" v-bind="goTop.bind" v-on="goTop.on"/>
  </div>
</template>

<script setup>
import {h, onActivated, onDeactivated, onMounted, reactive} from "vue"
import _ from "lodash"
import {BacktopIcon, RollbackIcon} from 'tdesign-icons-vue-next'
import {http, url as apiUrl} from "@/core/script/api.js";

import {back as navBack} from "@/core/script/nav"
import {getOptionsLabel} from "@/utils/vars.js";
import dialog from "@/core/script/dialog.js";


// 接口URL
const _apiUrl = apiUrl.system.authApply;

//默认数据
const defaultData = {
  params: {
    search: '',//搜索关键字
    type: undefined,//类型
    status: 0,//状态
    currentPage: 1,//当前页
    pageSize: 10,//每页多少条
  },
};


//页面数据
const vData = reactive({
  params: {...defaultData.params},
  action: 'list',
  list: [],
  listOption: {},
  listLabel: {},
  refreshing: false,
  loading: false,
  msg: '',
});


//筛选器
const tabs = {
  bind: (field) => {
    return {
      multiple: field !== 'status',
      optionsColumns: 2,
      options: vData?.listLabel[field],
    };
  },
  change: (field, value) => {
    vData.params[field] = value;
    getList();
  },
};

//搜索器
const searcher = reactive({
  bind:{},
  on: {
    keydown: _.debounce((e) => getList(), 500),
    search: (e) => getList(),
    submit: (e) => getList(),
    clear: (e) => getList(),
  }
})

//列表
const listCell = {
  bind: (row) => {
    return {
      arrow: true,
      bordered: true,
      align: 'middle',
      note: '',
    }
  },
  scroll: _.debounce((scrollBottom, scrollTop, e) => {
    console.log('listCell', scrollTop, scrollBottom, e);
    if (scrollBottom < 50) {
      getList('next');
    }
    goTop.scroll(scrollTop, 'main-list');
  }, 500),
  click: (item, e) => {
    const content=item.identity_info +"\t"+ item.nickname +"<br>"+ item['_text']['type']+item['description']+'<br>'+item['item']['name'];
    dialog.confirm({
      content,
      okval:[0,2].includes(item.status)?'通过':'',
      noval:[0,1].includes(item.status)?'拒绝':'',
      otherval:item.status===1?'撤销':'',
      onOk:()=>{
        formEvent.audit({id:item.id,status:1});
      },
      onNo:()=>{
        formEvent.audit({id:item.id,status:2});
      },
      onOther:()=>{
        formEvent.audit({id:item.id,status:3});
      }
    });
  },
};


const formEvent = {
  audit:async (param)=>{
    const res= await http.get(_apiUrl.audit,{params:param});
    if (res.data.code !== 20000) {
      dialog.error(res.data.message);
      return;
    }
    await getList()
  },
}

//返回按钮
const backBtn=reactive({
  isShow: ()=>vData.action==='list' && vData.params.case_id!==undefined,
  bind: {
    buttonProps: {
      theme: 'light',
      size: 'medium',
      style: {color: '#13151d',bottom:'50px'},
    },
    icon: () => h(RollbackIcon, {size: '20px', color: '#13151d'}),
    text: '',
    draggable:true,
  },
  on:{
    click: async () => {
      navBack();
    }
  },
});

//回到底部
const goTop = reactive({
  targetId: '',
  isShow: false,
  bind: {
    buttonProps: {
      theme: 'light',
      size: 'small',
      style: {color: '#13151d',bottom:'20px'},
    },
    icon: () => h(BacktopIcon, {size: '18px', color: '#13151d'}),
    text: 'TOP',
    draggable:true,
  },
  on: {
    click: () => {
      document.getElementById(goTop.targetId).scrollTo({
        top: 0,
        behavior: 'smooth' // 使用平滑滚动效果
      });
    }
  },
  scroll: (scrollTop, targetId) => {
    // let logoDom = document.getElementsByClassName('siyi-logo')[0];
    // let rightDom = document.getElementsByClassName('siyi-right')[0];
    // logoDom.setAttribute('style', scrollTop === 0 ? 'display:grid' : 'display:none');
    // rightDom.setAttribute('style', scrollTop === 0 ? 'padding-top:40px' : 'padding-top:0px');
    goTop.isShow = scrollTop > 0;
    goTop.targetId = targetId;
  }
});

//搜索
const getList = async (type = 'init', params = {}) => {
  vData.action = 'list';
  if (type === 'next') {
    vData.params.currentPage += 1
  } else if (type === 'init') {
    vData.params.currentPage = 1
    vData.list = [];
  }
  vData.params = {...vData.params, ...params};
  if (vData.params.currentPage < 1) {
    return;
  }
  // vData.loading = true;
  vData.msg = '正在加载，请稍等！'
  let res = await http.get(_apiUrl.list, {params: vData.params});
  // vData.loading = false;
  vData.refreshing = false;
  if (res.data.code !== 20000) {
    dialog.error(res.data.message);
    return;
  }
  vData.list = [...vData.list, ...res.data.data.list];
  vData.msg=vData.list.length>0?'':'没有更多数据了!';
  vData.listOption = res.data.data?.option?.list;
  vData.listLabel = getOptionsLabel(vData.listOption);
  return res.data.data.list;
}

// 首次挂载
onMounted(async () => {
})

// 页面显示时
onActivated(() => {
  return getList();
})

// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onDeactivated(() => {
  vData.params=defaultData.params;
})

</script>




<style scoped>
.siyi-auth-apply {
  width: 100%;
  height: 100%;
  position: absolute;

  .head-search {
    place-items: center;
    text-align: center;
  }

  #loader {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 9999;
    background-color: #fff;
    opacity: 0.9;
    padding-top: 50%
  }

  .t-pull-down-refresh {
    padding-bottom: 100px;
  }

  #main-list{
    position: relative;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 100px;
  }

  #main-list {
    .t-cell {
      padding: 5px 20px;
    }
  }


}
</style>