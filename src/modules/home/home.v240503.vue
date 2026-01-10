<template>
  <div class="box">
    <div class="content">

      <div class="content-left">

        <t-card :bordered="false" size="small" header-bordered hover-shadow style="flex: 1">
          <t-descriptions title="欢迎使用龙腾SIYI信息化平台" :column="2" :label-style="{ width: '100px', textAlign: 'left',}"
                          :content-style="{ textAlign: 'right',padding:'0 20px'}">
            <t-descriptions-item label="用户账号">{{ userInfo.username }}</t-descriptions-item>
            <t-descriptions-item label="用户昵称">{{ userInfo.nickname }}</t-descriptions-item>
            <t-descriptions-item label="账号类型">{{ userInfo.type_text }}{{ userInfo.administrator?'(超级管理员)':'' }}</t-descriptions-item>
            <t-descriptions-item label="账号信息">{{ userInfo.identity_info }}</t-descriptions-item>
            <t-descriptions-item label="账号岗位" span="12" v-show="assignment_info">{{assignment_info }}</t-descriptions-item>
            <t-descriptions-item label=""></t-descriptions-item>
            <t-descriptions-item label="软件名称" span="12">龙腾SIYI信息化平台</t-descriptions-item>
            <t-descriptions-item label="开发团队" span="12">湖北龙腾电子科技股份有限公司</t-descriptions-item>
            <t-descriptions-item label="软件版本" span="12">{{ lastLog.version }}</t-descriptions-item>
            <t-descriptions-item label="更新时间" span="12">{{ lastLog.time }}</t-descriptions-item>
          </t-descriptions>
        </t-card>

        <t-card class="user-nav" :bordered="false" hover-shadow title="常用功能" style="flex: 1;">
          <t-tag @click="navOpen(item.id)" v-show="item.title" theme="primary" color="#0052d9" size="large" v-for="item in userNav">{{ item.title }}</t-tag>
        </t-card>


        <t-card :bordered="false" size="small" header-bordered hover-shadow style="flex: 1" v-show="tongji.user.isShow" @click="navOpen('user_list')">
          <t-descriptions title="用户统计" :column="2" :label-style="{ width: '100px', textAlign: 'left',}" :content-style="{ textAlign: 'right',padding:'0 20px'}">
            <t-descriptions-item label="实时在线">
              <t-tooltip :content="'实时在线:'+tongji.user.online+' / 今日上线:'+tongji.user.today+' / 历史最高在线:'+tongji.user.online_top">
                <t-progress theme="line" :percentage="(tongji.user.online/tongji.user.today)*100" :label="tongji.user.online +'/'+tongji.user.today" />
              </t-tooltip>
              </t-descriptions-item>

            <t-descriptions-item label="今日上线">
              <t-tooltip :content="'今日日活:'+tongji.user.today+' / 正常用户:'+tongji.user.normal+' / 历史最高日活:'+tongji.user.day_top">
                <t-progress theme="line" :percentage="(tongji.user.today/tongji.user.normal)*100" :label="tongji.user.today +'/'+tongji.user.normal" />
              </t-tooltip>
            </t-descriptions-item>

            <t-descriptions-item label="ERP在线">
              <t-tooltip :content="'实时在线:'+tongji.user.erp_online+' / 今日上线:'+tongji.user.erp_today+' / 用户总数:'+tongji.user.erp_all">
                <t-progress theme="line" :percentage="(tongji.user.erp_online/tongji.user.erp_today)*100" :label="tongji.user.erp_online +'/'+tongji.user.erp_today" />
              </t-tooltip>
            </t-descriptions-item>
          </t-descriptions>
        </t-card>


        <t-card :bordered="false" size="small" header-bordered hover-shadow style="flex: 1" v-show="tongji.auth.isShow" @click="navOpen('user_auth_apply')">
          <t-descriptions title="权限审核" :column="2" :label-style="{ width: '200px', textAlign: 'left',}" :content-style="{ textAlign: 'right',padding:'0 20px'}">
            <t-descriptions-item label="待审核（实时）">{{ tongji.auth.todo }}</t-descriptions-item>
            <t-descriptions-item label="已审核（今日）">{{ tongji.auth.done }}</t-descriptions-item>
            <t-descriptions-item label="已通过（累计）">{{ tongji.auth.accept }}</t-descriptions-item>
            <t-descriptions-item label="已拒绝（累计）">{{ tongji.auth.refuse }}</t-descriptions-item>
          </t-descriptions>
        </t-card>

      </div>
      <div class="content-right" style="flex: 1.2;display: flex; ">
        <t-card title="更新日志" style="overflow-y: scroll;flex: 1.5;" :bordered="false" hover-shadow v-show="userInfo.type===1">
          <t-timeline mode="same" :reverse="true" theme="dot" style="">
            <t-timeline-item v-for="(item,date) in logData" dot-color="#08ae00">
              <div class="title">{{ date }}</div>
              <div class="log-list" v-for="row in item">
                <span class="icon"><t-tag :color="row.color">{{ row.type }}</t-tag></span>
                <span class="author">{{ row.author }}</span>
                <span class="date">{{ row.time }}</span>
                <span class="content">{{ row.content }}</span>
              </div>
            </t-timeline-item>
          </t-timeline>
        </t-card>
        <t-card class="visit" :bordered="false" size="small" hover-shadow title="模块统计" style="flex: 1;" v-show="tongji.visit.isShow">
          <t-tabs v-model="tongji.visit.tab">
            <t-tab-panel v-for="(tab,key) in tongji.visit.tabs" :value="key" :label="tab" :destroy-on-hide="false">
            </t-tab-panel>
          </t-tabs>
          <div v-for="data in tongji.visit.data[tongji.visit.tab]">
            <div class="t-progress-domo-margin">{{data.title}}</div>
            <t-progress theme="line" :percentage="data.percent" :label="data.count" />
          </div>
        </t-card>
      </div>


    </div>
  </div>
</template>
<script setup>
import dayjs from "dayjs"
import {onMounted, ref,reactive} from "vue"
import {date} from '@/core/script/core.js';
import * as api from '@/core//script/api.js';
import * as nav from '@/core//script/nav.js';
import {nav as navList} from '@/core//config/nav.js';
import siyi from '@/core/script/siyi.js'

const userInfo = siyi.user
const assignment_info= siyi.user.assignment.map(item => item.dept_name+" · "+item.position_name).join(' / ')
const tongji = reactive({
  user:{
    isShow:siyi.user.administrator,
    online: 0,  // 实时在线
    today: 0, // 今日上线
    online_top: 0, // 历史最高在线
    day_top: 0, // 今日最高在线
    normal: 0, // 正常用户
    disabled: 0, // 禁用用户
    erp_online: 0, // ERP在线
    erp_today: 0, // ERP今日上线
    erp_all: 0, // ERP用户总数
  },
  auth:{
    isShow:siyi.user.administrator,
    todo:0,
    done:0,
    accept:0,
    refuse:0,
  },
  visit:{
    isShow:siyi.user.administrator,
    tab:'nav_today',
    tabs:{
      nav_today:'页面（今日）',
      nav_all:'页面',
      api_today:'API（今日）',
      api_all:'API',
      ip_today:'IP（今日）',
      ip_all:'IP',
      user_today:'用户（今日）',
      user_all:'用户',
    },
    data:{
      nav_today:[],
      nav_all:[],
      api_today:[],
      api_all:[],
      ip_today:[],
      ip_all:[],
      user_today:[],
      user_all:[],
    }
  }
})

const logData = ref({})
const lastLog = ref({version: '', time: ''})


const logStyle = {
  "backend": {
    "type": 'PHP',
    "color": '#4F5B93'
  },
  "frontend": {
    "type": 'VUE',
    "color": '#42b883'
  },
  "proc": {
    "type": 'SQL',
    "color": '#0052d9'
  },
  "doc": {
    "type": 'DOC',
    "color": 'green'
  },
  "other": {
    "type": 'O',
    "color": ''
  }
};

const getGitLog = async () => {
  const url = '/data/gitlog.json?t=' + date.dateFormat(new Date(), 'YYYYMMDD');
  const gitLog = await (await fetch(url)).json();
  if (!Array.isArray(gitLog)) return
  const tongji = {}
  gitLog.forEach(row => {
    if (/^(Merge|vault)/.test(row.content)) return

    const rowFormated = logStyle?.[row.type] || logStyle?.['other'];
    rowFormated.day = dayjs(row.date).format('YYYY-MM-DD');
    rowFormated.time = dayjs(row.date).format('YYYY-MM-DD HH:mm:ss');
    rowFormated.content = row.content.split('Signed-off-by')[0].trim();

    typeof logData.value[rowFormated.day] === 'undefined' && (logData.value[rowFormated.day] = []);
    const _row = {...row, ...rowFormated}
    logData.value[rowFormated.day].push(_row)

    const ym = dayjs(_row.date).format('YYYY-MM') + '-' + _row.type
    if (tongji[ym] === undefined) tongji[ym] = []
    tongji[ym].push(_row)
  })
  console.log(tongji)
  // 对 logData.value 中的每个日期对应的数组按时间降序排序
  Object.entries(logData.value).forEach(([date, logs]) => {
    logs.sort((a, b) => b.time.localeCompare(a.time));
  });

// 按日期升序重新排列 logData.value 的键，并保留排序后的值
  logData.value = Object.fromEntries(
      Object.entries(logData.value).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  );

  // const _lastLog = logData.value[Object.keys(logData.value).slice(-1)[0]][0];
  // lastLog.value = {version: 'V' + dayjs(_lastLog.date).format('YYMMDD'), time: _lastLog.time}; // 保存更新时间

}


// 用户链接
const userNav = ref([]);
const getUserLink = async () => {
  // 获取用户导航数据
  const res = await api.get(api.url.user.link, {count: 20});
  if (typeof res.list === undefined) return;
  userNav.value = res.list.map(item => ({...item, ...findElementById(navList.value, item.page)}));
}


//打开页面
const navOpen = (id) => {
  nav.to(id);
  // todo 更新模块和页面URL
}

const getTongji=async (item)=>{
  const items=item || Object.keys(tongji).filter(key=>tongji[key].isShow);
  if(items.length<1) return ;
  const res=await api.get(api.url.system.home.index,{items});
  if (typeof res==="undefined") return ;
  for (const key in res) {
    tongji[key]={...tongji[key],...res[key]}
  }
  for (let dataKey in tongji.visit.data) {
    const maxNum = tongji.visit.data[dataKey].reduce((max, item) => Math.max(max, item.count), -Infinity);
    if(maxNum<1) continue;
    tongji.visit.data[dataKey].forEach(item=>{
      if(dataKey==='nav_today' || dataKey==='nav_all'){
        const nav_item=findElementById(navList.value, item[item.field]);
        item.title=nav_item?.title+'('+item[item.field]+')';
      }else{
        item.title=typeof item.title==='undefined'?item[item.field]:item.title;
      }
      item.percent= (item.count/maxNum)*100;
    })
  }
}

const getVersion=async ()=>{
  try {
    const version=Number(JSON.parse(await (await fetch('/version.js?t='+new Date().getTime())).text())?.version);
    lastLog.value = {version: 'V' + dayjs(version).format('YYMMDD-HHmmss'), time: dayjs(version).format('YYYY-MM-DD HH:mm:ss')};
  }catch (e) {
    const _lastLog = logData.value[Object.keys(logData.value).slice(-1)?.[0]]?.[0] || {date:'',time:''};
    lastLog.value = {version: 'V' + dayjs(_lastLog.date).format('YYMMDD'), time: _lastLog.time}; // 保存更新时间
  }
}



onMounted(async () => {
  await getGitLog();
  await getVersion();
  await getUserLink();
  await getTongji();
  setInterval(()=>getTongji(),600000);//定时刷新
})


function findElementById(data, targetId, idKey = 'id', childrenKey = 'items') {
  // 如果输入是数组，遍历数组中的每个元素
  if (Array.isArray(data)) {
    for (const item of data) {
      const result = findElementById(item, targetId, idKey, childrenKey);
      if (result) {
        return result;
      }
    }
    return null;
  }
  // 如果不是对象或为null，返回null
  if (!data || typeof data !== 'object') return null;
  // 检查当前对象是否匹配
  if (data[idKey] === targetId) {
    return data;
  }
  // 如果有指定的 children 属性并且是数组，递归查找
  if (Array.isArray(data[childrenKey])) {
    for (const child of data[childrenKey]) {
      const result = findElementById(child, targetId, idKey, childrenKey);
      if (result) {
        return result;
      }
    }
  }
  return null;
}


</script>
<style>
.t-card__header,.t-card__body{
  margin:5px;
  padding: 10px;
}
</style>
<style scoped>
.box {
  padding: 10px;
  background-color: var(--td-bg-color-container-hover);

  > .content {
    width: 100%;
    height: 100%;
    overflow: auto;


    display: flex;
    flex-direction: row;
    gap:5px;

    .content-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap:10px;
    }
    .content-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap:10px;
    }

    .title {
      font-size: 20px;
      color: #08ae00;
      font-weight: bold;
    }

    .user-nav .t-tag {
      margin: 5px;
      cursor: pointer;
    }

    .log-list {
      line-height: 32px;

      > .icon {
        margin-right: 5px;
      }

      > .author {
        margin: 0 5px;
      }

      > .date {
        margin-right: 5px;
      }
    }
  }
}


</style>
