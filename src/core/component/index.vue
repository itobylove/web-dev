<template>
  <div ref="siyiRef" :class="['siyi',siyi.deviceName,siyi.user.view.theme]">
    <div class="logo" @click="siyi.navHide=!siyi.navHide" v-if="siyi.pc">LONGTENG</div>
    <div class="module">
      <div v-for="module in nav.nav.value"
           :active="module.id===refobj.activeModule"
           :module="module.id"
           :show="module.show"
           @click="obj.moduleSwitch(module.id,'click')"
           @mouseover="obj.moduleSwitch(module.id,'mouseover')"
           @mouseleave="refobj.navShow=false">
        <span class="icon"><i :class="module.icon"/></span>
        <span class="title">{{ module.title }}</span>
      </div>
    </div>
    <div class="user" v-if="siyi.pc">
      <span class="name">{{ siyi.user.nickname }}，{{ siyi.user.username }}</span>
      <span class="avatar" :style="refobj.avatar"></span>
      <span class="icon" :title="core.themeSwitch('title')" @click="core.themeSwitch()"><i :class="core.themeSwitch('icon')"/></span>
      <span class="icon" :title="core.deviceSwitch('title')" @click="core.deviceSwitch()"><i :class="core.deviceSwitch('icon')"/></span>
      <span class="icon" title="绑定微信" @click="obj.getWeixinQrcode()"><i class="ri-wechat-fill"></i></span>
      <span class="icon" :title="core.fullscreenSwitch('title')" @click="siyi.navHide=core.fullscreenSwitch()">
        <i :class="core.fullscreenSwitch('icon')"/>
      </span>
      <span class="icon" title="退出" @click="logout(true)"><i class="ri-logout-circle-r-line"/></span>
    </div>
    <div :class="['left',{'hide':siyi.navHide,'show':refobj.navShow}]" @mouseenter="refobj.navShow=siyi.navHide&&true" @mouseleave="refobj.navShow=false">
      <div class="search"><input type="text" placeholder="搜索其实很方便" v-model="refobj.navSearch" @input="nav.filter(refobj.navSearch,refobj.activeModule)"></div>
      <div class="nav">
        <div class="module" v-for="module in nav.nav.value" :active="module.id===refobj.activeModule">
          <a v-for="item in module.items"
             :auth="item.auth"
             :active="siyi.nav.id===item.id"
             :show="item.show"
             :module="module.id"
             :group="item.group"
             :groupIcon="item.groupIcon"
             :groupShow="item.groupShow"
             :href="item.href?item.href:'#'+item.id"
             @click.stop="obj.navTo(item)">
            <span class="icon" :style="{'background':(siyi.mobile&&item.auth)?item.background:''}"><i :class="item.icon"/></span>
            <span class="title">{{ item.title }}</span>
            <span class="operation">
              <span class="favorites" @click.stop="nav.favorites(item.id)"><i :class="item.favorites?'ri-heart-3-fill':'ri-heart-3-line'"/></span>
              <span class="version" v-if="item.groupIcon&&!['open','favorites'].includes(module.id)" @click.stop="nav.groupSwitch(item.group)"><i class="ri-git-commit-line"/></span>
              <span class="close" v-if="item.open" @click.stop="nav.close(item.id)"><i class="ri-close-line"/></span>
          </span>
          </a>
        </div>
      </div>
      <div class="time" v-if="siyi.pc">{{ refobj.systemTime }}</div>
    </div>
    <main class="right" ref="rightRef">
      <transition>
        <keep-alive>
          <component :id="siyi.nav.key" :is="nav.activeComponent.value" :key="siyi.nav.key"/>
        </keep-alive>
      </transition>
    </main>
    <aside class="mobileTabBar" v-if="siyi.mobile">
      <a :class="[{active:refobj.mobileTabBarItem==='home'}]" title="主页" href="#home" @click="obj.navTo({id:'home'})">
        <span class="icon"><i class="ri-home-8-line"/></span>
        <span class="title">主页</span>
      </a>
      <a :class="[{active:refobj.mobileTabBarItem==='module'}]" title="模块" href="javascript:void(0)" @click="obj.mobileModule()">
        <span class="icon"><i class="ri-apps-line"/></span>
        <span class="title">模块</span>
      </a>
      <a :class="[{active:refobj.mobileTabBarItem==='profile'}]" title="我的" href="#profile" @click="obj.navTo({id:'profile'})">
        <span class="icon"><i class="ri-user-line"/></span>
        <span class="title">我的</span>
      </a>
    </aside>
  </div>
</template>
<script setup>
import {onActivated, onDeactivated, onMounted, ref, reactive} from 'vue'
import * as core from '@/core/script/core'
import * as nav from '@/core/script/nav'
import {heartbeat, logout} from '@/core/script/user'
import siyi from '@/core/script/siyi'
import * as api from '@/core/script/api'
import dialog from "@/core/script/dialog";

const siyiRef = ref('');//主容器
const rightRef = ref('');//工作区容器


const refobj = reactive({
  avatar: {backgroundImage: `url('${siyi.user.avatar}')`},//头像
  systemTime: '',//时间
  activeModule: '',//活动模块
  navShow: false,//导航悬浮显示
  navLeft: '0px',//导航悬浮显示横向位置
  navSearch: '',//导航搜索内容
  rightZindex: 100,//手机端主工作区显示层级
  mobileTabBarItem: 'home',//手机底部菜单
});


const obj = {
  /**
   * 导航跳转
   * @param cfg
   */
  navTo: cfg => {
    !cfg.href && nav.to(cfg.id);
    if (siyi.mobile) {
      refobj.mobileTabBarItem = cfg.id;
      refobj.rightZindex = 100;
    }
  },
  /**
   * 手机端模块切换
   */
  mobileModule: () => {
    refobj.mobileTabBarItem = 'module';
    refobj.rightZindex = 1;
  },
  /**
   * 获取微信二维码
   * @returns {Promise<void>}
   */
  getWeixinQrcode: async () => {
    const loading = dialog.loading();
    const {src, timeout} = await api.get(api.url.user.bindWeixin)
    loading.close();
    if (!src) return;
    const _window = dialog.window(`<img src="${src}" style="width: 80%;height: 80%" />  <h3>请使用个人微信扫二维码，然后关注服务号绑定</h3>`, {},
        {title: '个人微信绑定', width: '500px', height: '500px', bodyStyle: {display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}})
    const timer = setTimeout(async () => {
      const {src} = await api.get(api.url.user.bindWeixin);
      if (!src) {
        clearTimeout(timer);// 关闭窗口,清除定时器
        _window.close();
      }
    }, timeout);
  },
  /**
   * 模块切换
   * @param id
   * @param type
   */
  moduleSwitch: (id, type) => {
    if (!siyi.navHide && type === 'mouseover') return;
    refobj.navSearch = '';
    refobj.activeModule = id;
    nav.filter(refobj.navSearch, refobj.activeModule);
    if (siyi.navHide) {
      refobj.navShow = true;
      const ddrect = document.querySelector('body>.siyi>.module>div[module=' + id + ']').getBoundingClientRect();
      refobj.navLeft = ddrect.left + window.scrollX + ddrect.width / 2 - 125 + 'px';
    }
  },
  timer: null,
  onActivated: () => {
    const hash = core.query.get(null, 'hash').slice(1);
    refobj.mobileTabBarItem = ['home', 'profile'].includes(hash) ? hash : 'module';
    nav.to(hash);
    refobj.activeModule = siyi.nav.moduleid;
    // 倒计时，超时退出登录
    obj.timer = setInterval(async () => {
      const time = parseInt(sessionStorage.getItem('x-api-time') - Date.now() / 1000);
      refobj.systemTime = core.date.YmdHis() + ' ' + core.date.week() + ' (' + time + ')';
      if (time <= 0) {
        clearInterval(obj.timer);
        !siyi.isDev && await logout();
      }
      time % 30 === 0 && !siyi.isDev && heartbeat().then();//每隔30秒检查一次登录状态
    }, 1000);
  },
  onDeactivated: () => {
    clearInterval(obj.timer);
    obj.timer = null;
  },
  onMounted: () => {
    core.query.set('token');// 清除token
    !siyi.isDev && core.watermark();// 水印
  }
};


onActivated(() => obj.onActivated());// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onDeactivated(() => obj.onDeactivated());// 在从 DOM 上移除、进入缓存 以及组件卸载时调用
onMounted(() => obj.onMounted());// 挂载

</script>
<style scoped>
.siyi {
  width: 100%;
  height: 100%;
  position: relative;
}

.siyi.pc {
  > .logo {
    width: 250px;
    height: 40px;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    letter-spacing: 10px;
    background-color: var(--logo-background-color);
    border-right: var(--logo-border-right);
    border-bottom: var(--logo-border-bottom);
    color: var(--logo-font-color);
    user-select: none;
    overflow: hidden;
    cursor: pointer;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  > .module {
    width: calc(100% - 250px - 320px);
    height: 40px;
    overflow: auto hidden;
    position: absolute;
    left: 250px;
    top: 0;
    z-index: 2;
    background-color: var(--module-background-color);
    user-select: none;
    display: flex;
    align-items: center;
    border-bottom: var(--module-border-bottom);

    &::-webkit-scrollbar {
      display: none;
    }

    > div {
      height: 100%;
      padding: 0 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all .2s;

      > .icon {
        margin-right: 5px;
        font-size: 20px;
        color: var(--module-icon-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      > .title {
        white-space: nowrap;
        font-weight: bold;
        color: var(--module-font-color);
      }

      &[show='false'] {
        display: none;
      }

      &[active='true'], &:hover {
        background-color: var(--module-hover-background-color);

        > .icon {
          color: var(--module-hover-icon-color);
        }

        > .title {
          color: var(--module-hover-font-color);
        }
      }
    }
  }

  > .user {
    min-width: 320px;
    max-width: 500px;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 4;
    background-color: var(--user-background-color);
    border-bottom: var(--user-border-bottom);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    user-select: none;
    padding-right: 5px;

    > span {
      margin: 0 5px;
      cursor: pointer;
      color: var(--user-font-color);

      &:hover {
        color: var(--user-hover-font-color);
      }

      &.avatar {
        width: 30px;
        height: 30px;
        border-radius: 3px;
        background: no-repeat 50% 50% / cover content-box;
      }

      &.icon {
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
      }
    }
  }

  > .left {
    width: 250px;
    height: calc(100% - 40px);
    border-right: var(--left-border-right);
    position: absolute;
    left: 0;
    top: 40px;
    z-index: 3;
    user-select: none;
    display: grid;
    grid-template-rows: 40px auto 40px;

    > .search {
      border-bottom: var(--search-border-bottom);

      > input {
        width: 100%;
        height: 100%;
        padding: 0 5px;
        border: 0;
        background-color: var(--search-background-color);
        color: var(--search-font-color);
        outline: none;
      }
    }

    > .nav {
      background-color: var(--nav-background-color);
      overflow: hidden auto;

      &::-webkit-scrollbar {
        display: none;
      }

      > .module {
        width: 100%;
        display: flex;
        flex-direction: column;

        &[active='false'] {
          display: none;
        }

        > a {
          width: 100%;
          height: 40px;
          line-height: 40px;
          transition: all .2s;
          display: grid;
          grid-template-columns: 30px auto auto;

          &[show='false'] {
            display: none;
          }

          /*旧版本隐藏*/

          &[groupIcon='false'][groupShow='false']:not([group='']):not([module='favorites']):not([module='open']) {
            display: none;
          }

          &[groupIcon='false'][groupShow='true']:not([group='']):not([module='favorites']):not([module='open']) {
            grid-template-columns: 40px auto auto;
          }

          > .icon {
            justify-self: end;
            font-size: 16px;
            margin-right: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--nav-icon-color);
          }

          > .title {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: var(--nav-font-color);
          }

          > .operation {
            justify-self: end;

            > .close, > .version, > .favorites {
              width: 20px;
              height: 40px;
              overflow: hidden;
              font-size: 16px;
              display: flex;
              justify-content: center;
              align-items: center;
              float: left;
            }

            > .close {
              color: var(--nav-close-color);
            }

            > .version {
              transform: rotate(-180deg);
              color: var(--nav-gitbranch-color);
            }

            > .favorites {
              display: none;
            }
          }

          /*活动或鼠标放上来亮色*/

          &[active='true'], &[auth='true']:hover {
            background-color: var(--nav-activehover-background-color);

            > .icon {
              color: var(--nav-activehover-icon-color);
            }

            > .title {
              color: var(--nav-activehover-font-color);
            }

            > .operation {
              > .close {
                color: var(--nav-activehover-close-color);
              }

              > .version {
                color: var(--nav-activehover-gitbranch-color);
              }

              > .favorites {
                color: var(--nav-activehover-favorites-color);
              }
            }
          }

          &[auth='true']:hover {
            > .operation {
              > .favorites {
                display: block;
              }
            }
          }

          /*没有权限*/

          &[auth='false'] {
            > .icon {
              color: var(--nav-authno-icon-color);
            }

            > .title {
              color: var(--nav-authno-font-color);
            }

            > .operation {
              > .close {
                color: var(--nav-authno-close-color);
              }

              > .version {
                color: var(--nav-authno-gitbranch-color);
              }

              > .favorites {
                color: var(--nav-authno-favorites-color);
              }
            }
          }

          &[auth='false']:hover {
            background-color: var(--nav-authnohover-background-color);
          }
        }
      }
    }

    > .time {
      background-color: var(--time-background-color);
      color: var(--time-font-color);
      line-height: 40px;
      text-align: center;
    }

    &.hide {
      display: none;

      &.show {
        height: auto;
        left: v-bind(refobj.navLeft);
        display: grid;
        grid-template-rows: 40px auto;

        &:before {
          content: '';
          width: 10px;
          height: 10px;
          transform: rotate(45deg);
          background-color: var(--search-background-color);
          position: absolute;
          left: calc(50% - 5px);
          top: -3px;
        }

        > .nav {
          max-height: 500px;
        }

        > .time {
          border-radius: 0 0 3px 3px;
        }
      }

      + .right {
        width: 100%;
      }
    }
  }

  > .right {
    width: calc(100% - 250px);
    height: calc(100% - 40px);
    overflow: hidden;
    background-color: var(--right-background-color);
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;

    > div {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
  }
}

.siyi.mobile {
  > .mobileTabBar {
    width: 100%;
    height: 50px;
    border-top: var(--mobileTabBar-border-top);
    background-color: var(--mobileTabBar-background-color);
    user-select: none;
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 6;
    display: flex;
    align-items: center;
    justify-content: center;

    > a {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--mobileTabBar-color);

      &.active {
        color: var(--mobileTabBar-hover-color);
      }

      > .icon {
        font-size: 18px;
      }

      > .title {
        font-weight: bold;
      }
    }
  }


  > .right {
    width: 100%;
    height: calc(100% - 50px);
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    z-index: v-bind(refobj.rightZindex);
    background-color: var(--right-background-color);

    > div {
      width: 100%;
      height: 100%;
      position: relative;
    }
  }


  > .module {
    width: 80px;
    height: calc(100% - 50px);
    overflow: hidden auto;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
    user-select: none;
    background-color: var(--module-background-color);

    &::-webkit-scrollbar {
      display: none;
    }

    > div {
      height: 60px;
      cursor: pointer;
      align-items: center;
      padding-left: 5px;
      transition: all .2s;
      display: flex;

      &[show='false'] {
        display: none;
      }

      &[active='true'], &:hover {
        background-color: var(--module-hover-background-color);

        > .icon {
          color: var(--module-hover-icon-color);
        }

        > .title {
          color: var(--module-hover-font-color);
        }
      }

      > .icon {
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--module-icon-color);
      }

      > .title {
        white-space: nowrap;
        font-weight: bold;
        padding-left: 5px;
        color: var(--module-font-color);
      }
    }
  }


  > .left {
    width: calc(100% - 80px);
    height: calc(100% - 50px);
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
    user-select: none;
    background-color: #fff;
    display: flex;
    flex-direction: column;

    > .search {
      flex-shrink: 0;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;

      > input {
        flex-shrink: 0;
        width: 95%;
        height: 38px;
        min-width: 0;
        font-size: 14px;
        border: 1px solid #eaeaea;
        background-color: #FFF;
        outline: none;
        border-radius: 5px;
        padding: 0 35px 0 5px;
      }
    }

    > .nav {
      flex: 1;
      flex-shrink: 0;
      overflow: hidden auto;
      background-color: var(--nav-background-color);

      &::-webkit-scrollbar {
        display: none;
      }

      > .module {
        width: 100%;
        display: flex;
        flex-wrap: wrap;

        &[active='false'] {
          display: none;
        }

        > a {
          width: 95px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;

          &[show='false'] {
            display: none;
          }

          > .icon {
            width: 45px;
            height: 45px;
            border-radius: 30%;
            font-size: 35px;
            background-color: var(--nav-icon-background-color);
            color: var(--nav-icon-color);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          > .title {
            text-align: center;
            padding: 10px;
            color: var(--nav-font-color);
          }

          > .operation {
            display: none;
          }

          /*没有权限*/

          &[auth='false'] {
            > .icon {
              color: var(--nav-authno-icon-color);
              background-color: var(--nav-authno-icon-background-color);
            }

            > .title {
              color: var(--nav-authno-font-color);
            }
          }
        }
      }

      @media screen and (max-width: 768px) {
        > .module {
          display: grid;
          grid-template-columns: repeat(3, auto);

          > a {
            width: auto;
          }
        }
      }
    }
  }
}
</style>