<template>
  <div class="workbench" :style="wall">
    <video class="video" ref="video" :src="core.videoFile" muted playsinline autoplay loop></video>
    <div class="on" @click="active=!active"></div>
    <div class="box">
      <div class="apps">
        <div :class="['user',{'active':active}]">
          <a v-for="item in userData" :target="getTarget(item)" :title="item.title" :href="item.url">
            <span :style="item.img"></span>
            <span>{{ item.title }}</span>
          </a>
        </div>
        <div :class="['admin',{'active':!active}]">
          <a v-for="item in adminData" :target="getTarget(item)"  :title="item.title" :href="item.url">
            <span :style="item.img"></span>
            <span>{{ item.title }}</span>
          </a>
        </div>
      </div>
    </div>
    <footer class="copyright">
      <span>龙腾电子</span><br>
      <a href="javascript:void(0)" :title="core.deviceSwitch('title')" @click="core.deviceSwitch()">{{ core.deviceSwitch('title') }}</a><br>
      <b>倾听·合作·创造·共赢</b>
    </footer>
  </div>
</template>
<script setup>
import {onActivated, ref} from 'vue'
import * as core from '@/core/script/core.js'
import wallimg from '@/core/assets/wall/5.jpg'
import cimforce from '@/core/assets/img/cimforce.png'
import OAimg from '@/core/assets/img/OA.png'
import QTimg from '@/core/assets/img/QT.png'
import DS2img from '@/core/assets/img/DS2.png'
import CDimg from '@/core/assets/img/cd.svg'
import realorimg from '@/core/assets/img/realor.png'
import VPNimg from '@/core/assets/img/VPN.png'
import exmailimg from '@/core/assets/img/exmail.png'
import knowledgeimg from '@/core/assets/img/knowledge.png'
import wwwimg from '@/core/assets/img/www.png'
import ACimg from '@/core/assets/img/AC.png'
import NACimg from '@/core/assets/img/NAC.png'
import aCloudimg from '@/core/assets/img/aCloud.png'
import TXHYimg from '@/core/assets/img/TXHY.png'
import TXCloudimg from '@/core/assets/img/TXCloud.png'
import yuntuimg from '@/core/assets/img/yuntu.png'
import GFimg from '@/core/assets/img/GF.svg'
import dialog from "@/core/script/dialog.js"
import siyi from "@/core/script/siyi.js";

const wall = {backgroundImage: `url('${wallimg}')`}
const video = ref()
// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => video.value.play().catch(error => console.log('背景播放中断', 5000)))

//普通用户和管理后端界面切换
const active = ref(true)

const getTarget = (item) => {
  return item?.target || (core.query.get('target') || (siyi.pc ? '_blank' : '_self'));
}

//普通用户看到的列表
const userData = [
  {
    title: 'ERP系统',
    url: 'https://erp.ltepcb.com:52023',
    img: {
      backgroundImage: `url('${cimforce}')`
    },
  },
  {
    title: 'OA系统',
    url: 'https://oa.ltepcb.com:52024',
    img: {
      backgroundImage: `url('${OAimg}')`
    },
  },
  {
    title: '报价系统',
    url: 'https://qt.ltepcb.com:52020',
    img: {
      backgroundImage: `url('${QTimg}')`
    },
  },
  {
    title: '辅助平台',
    url: '/#home',
    img: {
      backgroundImage: `url('${DS2img}')`
    },
  },
  {
    title: '项目管理系统',
    url: 'http://pro.ltepcb.com:52026/zentao/product-browse.html',
    img: {
      backgroundImage: `url('${CDimg}')`
    },
  },
  {
    title: '瑞友天翼',
    url: 'http://realor.ltepcb.com:888',
    img: {
      backgroundImage: `url('${realorimg}')`
    },
  },
  {
    title: 'VPN',
    url: 'https://vpn.ltepcb.com:52011',
    img: {
      backgroundImage: `url('${VPNimg}')`
    },
  },
  {
    title: '企业邮箱',
    url: 'https://exmail.qq.com/login',
    img: {
      backgroundImage: `url('${exmailimg}')`
    },
  },
  {
    title: '龙腾知识库',
    url: 'https://office.ltepcb.com:52030/knowledge',
    img: {
      backgroundImage: `url('${knowledgeimg}')`
    },
  },
  {
    title: '龙腾官网',
    url: 'http://www.ltepcb.com',
    img: {
      backgroundImage: `url('${wwwimg}')`
    },
  }
]


//管理员看到的列表
const adminData = [
  {
    title: '湖北超融合',
    url: 'https://10.10.10.20',
    img: {
      backgroundImage: `url('${aCloudimg}')`
    },
  },
  {
    title: '湖北防火墙',
    url: 'https://10.10.10.10',
    img: {
      backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJiIiBjeD0iLTQyMzEuNzYiIGN5PSIxNDQuNjQiIHI9IjE0NC4yOCIgZ3JhZGllbnRUcmFuc2Zvcm09InJvdGF0ZSgtMTcxLjYzIC0xNzQzLjY3OCA5Ljg2Mikgc2NhbGUoLjg4KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzdkY2NmMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBiMzA4ZSIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJhIiBjeD0iNDgyLjA5IiBjeT0iNTEyLjc0IiByPSIxNDQuMjgiIGdyYWRpZW50VHJhbnNmb3JtPSJyb3RhdGUoOC4zNyAxNTUwLjg4OSAtMTI3NC40NzUpIHNjYWxlKC44OCkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNjY2RlNzciLz48c3RvcCBvZmZzZXQ9Ii44NiIgc3RvcC1jb2xvcj0iIzZmYjkyYyIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJjIiBjeD0iMjg3LjA4IiBjeT0iMjAwLjAyIiByPSIxNDYuNjkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjg4IDAgMCAuODggMjQuODggMjQuNzUpIiB4bGluazpocmVmPSIjYSIvPjxyYWRpYWxHcmFkaWVudCBpZD0iZCIgY3g9Ii0zOTExLjQ1IiBjeT0iMjAxLjY1IiByPSIxNDYuNjkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLS44OCAwIDAgLjg4IC0zMjUzLjA5IDI0Ljc1KSIgeGxpbms6aHJlZj0iI2IiLz48L2RlZnM+PGcgZGF0YS1uYW1lPSLlm77lsYIgMSI+PHBhdGggZD0iTTUwLjQxIDE5OS43NWEyNy43NCAyNy43NCAwIDAwMzguNjQgNy45M2MyNy40Ny0xOC4xMiA2OS4zMy0zMC42MSAxMTYuNjQtMzIuNDcgODQuNzQtMy4zNCAxNTQuODEgMjguNjUgMTU2LjUgNzEuNDdhNDAuNDQgNDAuNDQgMCAwMS0xLjQgMTIuMTkgMi42OSAyLjY5IDAgMDA0Ljc0IDIuMzZjOS41My0xMi43NiAxNC43Mi0yNi43NiAxNC40Ni00MS4zOS0xLTU2LjQ4LTgyLjQyLTEwMC44NC0xODEuODUtOTkuMDgtNTcuOCAxLTEwOSAxNy40MS0xNDEuNDcgNDJhMjcuNTcgMjcuNTcgMCAwMC02LjI2IDM2Ljk1eiIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5IiBmaWxsPSJ1cmwoI2IpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzQ5LjU5IDI0Ni44MmEyNy43NCAyNy43NCAwIDAwLTM4LjY0LTcuOTNjLTI3LjQ3IDE4LjEyLTY5LjMzIDMwLjYxLTExNi42NCAzMi40Ny04NC43NCAzLjM0LTE1NC44MS0yOC42NS0xNTYuNS03MS40N2E0MC40NCA0MC40NCAwIDAxMS40LTEyLjE5IDIuNjkgMi42OSAwIDAwLTQuNzQtMi4zNkMyNC45MyAxOTguMSAxOS43NSAyMTIuMSAyMCAyMjYuNzNjMSA1Ni40OCA4Mi40MiAxMDAuODQgMTgxLjg1IDk5LjA4IDU3LjgtMSAxMDktMTcuNDEgMTQxLjQ3LTQyYTI3LjU3IDI3LjU3IDAgMDA2LjI2LTM2Ljk1eiIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5IiBmaWxsPSJ1cmwoI2EpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzQ5LjM4IDEwNi42YTMxMC4yNyAzMTAuMjcgMCAwMS0zLjM4IDQ1LjYyQTMwOC4yNSAzMDguMjUgMCAwMTIwNy41NyAzNjZhMi42OCAyLjY4IDAgMDEtMy4zNi00LjEzIDMwNi45NCAzMDYuOTQgMCAwMDg0LjM0LTIxMS43N3EwLTEyLjI5LTEtMjQuM2E2Ljc4IDYuNzggMCAwMC0yLjkxLTUgMjU0LjA2IDI1NC4wNiAwIDAxLTc1Ljc3LTgzLjI2IDIuNjkgMi42OSAwIDAxMy45My0zLjQ4IDI1MS44NyAyNTEuODcgMCAwMDY0LjUyIDMzLjM0IDI1MS41MSAyNTEuNTEgMCAwMDY2LjE5IDEzLjMgNS41MSA1LjUxIDAgMDE1LjE5IDUuMDlxLjY4IDEwLjMzLjY4IDIwLjgxeiIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5IiBmaWxsPSJ1cmwoI2MpIi8+PHBhdGggZD0iTTUxLjE2IDEwNi42QTMwNy41MSAzMDcuNTEgMCAwMDE5MyAzNjZhMi42OCAyLjY4IDAgMDAzLjM2LTQuMTNBMzA2Ljk0IDMwNi45NCAwIDAxMTEyIDE1MC4xcTAtMTIuMjkgMS0yNC4zYTYuNzggNi43OCAwIDAxMi45MS01IDI1NC4wNiAyNTQuMDYgMCAwMDc1Ljc3LTgzLjI2IDIuNjkgMi42OSAwIDAwLTMuOTMtMy40OCAyNTEuODcgMjUxLjg3IDAgMDEtNjQuNTMgMzMuMzRBMjUxLjUxIDI1MS41MSAwIDAxNTcgODAuN2E1LjUxIDUuNTEgMCAwMC01LjE5IDUuMDlxLS42NSAxMC4zMy0uNjUgMjAuODF6IiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiIGZpbGw9InVybCgjZCkiLz48L2c+PC9zdmc+')`
    },
  },
  {
    title: '深圳防火墙',
    url: 'https://192.168.2.1',
    img: {
      backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJiIiBjeD0iLTQyMzEuNzYiIGN5PSIxNDQuNjQiIHI9IjE0NC4yOCIgZ3JhZGllbnRUcmFuc2Zvcm09InJvdGF0ZSgtMTcxLjYzIC0xNzQzLjY3OCA5Ljg2Mikgc2NhbGUoLjg4KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzdkY2NmMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBiMzA4ZSIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJhIiBjeD0iNDgyLjA5IiBjeT0iNTEyLjc0IiByPSIxNDQuMjgiIGdyYWRpZW50VHJhbnNmb3JtPSJyb3RhdGUoOC4zNyAxNTUwLjg4OSAtMTI3NC40NzUpIHNjYWxlKC44OCkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNjY2RlNzciLz48c3RvcCBvZmZzZXQ9Ii44NiIgc3RvcC1jb2xvcj0iIzZmYjkyYyIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJjIiBjeD0iMjg3LjA4IiBjeT0iMjAwLjAyIiByPSIxNDYuNjkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjg4IDAgMCAuODggMjQuODggMjQuNzUpIiB4bGluazpocmVmPSIjYSIvPjxyYWRpYWxHcmFkaWVudCBpZD0iZCIgY3g9Ii0zOTExLjQ1IiBjeT0iMjAxLjY1IiByPSIxNDYuNjkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLS44OCAwIDAgLjg4IC0zMjUzLjA5IDI0Ljc1KSIgeGxpbms6aHJlZj0iI2IiLz48L2RlZnM+PGcgZGF0YS1uYW1lPSLlm77lsYIgMSI+PHBhdGggZD0iTTUwLjQxIDE5OS43NWEyNy43NCAyNy43NCAwIDAwMzguNjQgNy45M2MyNy40Ny0xOC4xMiA2OS4zMy0zMC42MSAxMTYuNjQtMzIuNDcgODQuNzQtMy4zNCAxNTQuODEgMjguNjUgMTU2LjUgNzEuNDdhNDAuNDQgNDAuNDQgMCAwMS0xLjQgMTIuMTkgMi42OSAyLjY5IDAgMDA0Ljc0IDIuMzZjOS41My0xMi43NiAxNC43Mi0yNi43NiAxNC40Ni00MS4zOS0xLTU2LjQ4LTgyLjQyLTEwMC44NC0xODEuODUtOTkuMDgtNTcuOCAxLTEwOSAxNy40MS0xNDEuNDcgNDJhMjcuNTcgMjcuNTcgMCAwMC02LjI2IDM2Ljk1eiIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5IiBmaWxsPSJ1cmwoI2IpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzQ5LjU5IDI0Ni44MmEyNy43NCAyNy43NCAwIDAwLTM4LjY0LTcuOTNjLTI3LjQ3IDE4LjEyLTY5LjMzIDMwLjYxLTExNi42NCAzMi40Ny04NC43NCAzLjM0LTE1NC44MS0yOC42NS0xNTYuNS03MS40N2E0MC40NCA0MC40NCAwIDAxMS40LTEyLjE5IDIuNjkgMi42OSAwIDAwLTQuNzQtMi4zNkMyNC45MyAxOTguMSAxOS43NSAyMTIuMSAyMCAyMjYuNzNjMSA1Ni40OCA4Mi40MiAxMDAuODQgMTgxLjg1IDk5LjA4IDU3LjgtMSAxMDktMTcuNDEgMTQxLjQ3LTQyYTI3LjU3IDI3LjU3IDAgMDA2LjI2LTM2Ljk1eiIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5IiBmaWxsPSJ1cmwoI2EpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzQ5LjM4IDEwNi42YTMxMC4yNyAzMTAuMjcgMCAwMS0zLjM4IDQ1LjYyQTMwOC4yNSAzMDguMjUgMCAwMTIwNy41NyAzNjZhMi42OCAyLjY4IDAgMDEtMy4zNi00LjEzIDMwNi45NCAzMDYuOTQgMCAwMDg0LjM0LTIxMS43N3EwLTEyLjI5LTEtMjQuM2E2Ljc4IDYuNzggMCAwMC0yLjkxLTUgMjU0LjA2IDI1NC4wNiAwIDAxLTc1Ljc3LTgzLjI2IDIuNjkgMi42OSAwIDAxMy45My0zLjQ4IDI1MS44NyAyNTEuODcgMCAwMDY0LjUyIDMzLjM0IDI1MS41MSAyNTEuNTEgMCAwMDY2LjE5IDEzLjMgNS41MSA1LjUxIDAgMDE1LjE5IDUuMDlxLjY4IDEwLjMzLjY4IDIwLjgxeiIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5IiBmaWxsPSJ1cmwoI2MpIi8+PHBhdGggZD0iTTUxLjE2IDEwNi42QTMwNy41MSAzMDcuNTEgMCAwMDE5MyAzNjZhMi42OCAyLjY4IDAgMDAzLjM2LTQuMTNBMzA2Ljk0IDMwNi45NCAwIDAxMTEyIDE1MC4xcTAtMTIuMjkgMS0yNC4zYTYuNzggNi43OCAwIDAxMi45MS01IDI1NC4wNiAyNTQuMDYgMCAwMDc1Ljc3LTgzLjI2IDIuNjkgMi42OSAwIDAwLTMuOTMtMy40OCAyNTEuODcgMjUxLjg3IDAgMDEtNjQuNTMgMzMuMzRBMjUxLjUxIDI1MS41MSAwIDAxNTcgODAuN2E1LjUxIDUuNTEgMCAwMC01LjE5IDUuMDlxLS42NSAxMC4zMy0uNjUgMjAuODF6IiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiIGZpbGw9InVybCgjZCkiLz48L2c+PC9zdmc+')`
    },
  },
  {
    title: '湖北行为管理',
    url: 'https://10.10.10.11',
    img: {
      backgroundImage: `url('${ACimg}')`
    },
  },
  {
    title: '湖北NAC控制器',
    url: 'https://10.10.10.12',
    img: {
      backgroundImage: `url('${NACimg}')`
    },
  },
  {
    title: '湖北VPN后台',
    url: 'https://10.10.10.13:4430',
    img: {
      backgroundImage: `url('${VPNimg}')`
    },
  },
  {
    title: '腾讯会议',
    url: 'https://meeting.tencent.com/qrcode-login.html',
    img: {
      backgroundImage: `url('${TXHYimg}')`
    },
  },
  {
    title: '腾讯云',
    url: 'https://cloud.tencent.com/login',
    img: {
      backgroundImage: `url('${TXCloudimg}')`
    },
  },
  {
    title: '深信服云图',
    url: 'https://xaasauth.sangfor.com.cn',
    img: {
      backgroundImage: `url('${yuntuimg}')`
    },
  },
  {
    title: '中企动力',
    url: 'https://new-console.300.cn/index',
    img: {
      backgroundImage: `url('${GFimg}')`
    },
  }, {
    title: '辅助平台(测试版)',
    url: 'http://office.ltepcb.com:8002/#home',
    img: {
      backgroundImage: `url('${DS2img}')`
    },
  },
]
</script>
<style scoped>
.workbench {
  width: 100%;
  height: 100%;
  position: absolute;
  background: no-repeat 50% 50% / cover;
  z-index: 0;

  /*
  .wall:before {
    content: "";
    width: 105%;
    height: 105%;
    position: absolute;
    background: inherit;
    left: -2.5%;
    top: -2.5%;
    filter: blur(10px);
  }
  */

  > .video {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 0;
    object-fit: cover;
  }

  > .on {
    width: 100px;
    height: 100px;
    position: absolute;
    z-index: 3;
  }

  > .box {
    width: 800px;
    height: 100%;
    overflow: hidden;
    padding: 100px 0;
    position: absolute;
    z-index: 2;
    left: calc(50% - 400px);
    display: grid;
    grid-template-rows: auto;

    > .apps {
      width: 100%;
      overflow: hidden auto;

      &::-webkit-scrollbar {
        display: none;
      }

      > div {
        display: none;
        grid-template-columns: repeat(auto-fill, 130px);
        grid-gap: 10px;
        place-content: start center;

        &.active {
          display: grid;
        }

        > a {
          height: 130px;
          border-radius: 3px;
          overflow: hidden;
          background-color: rgba(0, 0, 0, .5);

          &:hover {
            background-color: rgba(0, 0, 0, .8);
          }

          > span {
            width: 100%;
            float: left;
          }

          > span:first-child {
            height: 90px;
            padding: 10px;
            background: no-repeat 50% 50% / contain content-box;
          }

          > span:last-child {
            height: 40px;
            line-height: 40px;
            text-align: center;
            color: white;
          }
        }
      }
    }
  }

  > .copyright {
    width: 100%;
    height: 100px;
    line-height: 25px;
    position: absolute;
    z-index: 4;
    bottom: 0;
    text-align: center;
    color: white;
    font-size: 18px;
    letter-spacing: 10px;

    > a {
      font-size: 14px;
      color: #fff;

      &:hover {
        font-weight: bold;
      }
    }

    > b {
      font-weight: normal;
      font-size: 12px;
      color: #fff;
    }
  }
}

@media screen and (max-width: 768px) {
  .workbench {
    > .on {
      width: 30px;
      height: 30px;
    }

    > .box {
      width: 90%;
      left: 5%;
      padding-top: 0;

      > .apps {
        margin: 10px 0;

        > div {
          grid-template-columns: 100%;
          grid-gap: 2px;

          > a {
            height: 90px;
            background-color: rgba(0, 0, 0, .5);

            > span {
              width: 50%;
              display: inline-table;

              &:last-child {
                line-height: 90px;
                font-size: 20px;
              }
            }
          }
        }
      }
    }
  }
}
</style>