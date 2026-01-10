<template>
  <div class="login" :style="wall" >
    <video class="video" ref="video" :src="core.videoFile" muted playsinline autoplay loop></video>
    <div class="box">
      <div class="logo" :style="logo"></div>
      <form autocomplete="off" @submit.prevent="submit">
        <input id="username" v-model="username" type="text" placeholder="工号" v-if="inputShow">
        <input id="password" v-model="password" type="password" placeholder="密码" v-if="inputShow">
        <button :class="className" type="submit" :disabled="className==='loading'" v-if="inputShow"><span>登录</span></button>
        <button :class="className" type="button" :disabled="className==='loading'" v-if="!inputShow" @click="inputShow=true"><span><i class="ri-user-line"></i>员工账号登录</span></button>
        <button :class="[className,'wx-login','wechat']"  type="button" v-if="siyi.pc && !siyi.wechat" :disabled="className==='loading'"  @click="className='loading';wxBox.open()"><span>企业微信登录</span></button>
        <button :class="[className,'wx-login','weixin']"  type="button" v-if="siyi.weixin && !inputShow" :disabled="className==='loading'"  @click="className='loading';user.weixinJumpLogin()"><span><i class="ri-wechat-fill"></i>访客微信登录</span></button>
      </form>
    </div>
    <footer class="copyright">
      <span>龙腾电子</span><br>
      <a v-if="!siyi.weixin" href="javascript:void(0)" :title="core.deviceSwitch('title')" @click="core.deviceSwitch()">{{ core.deviceSwitch('title') }}</a>
      <br v-if="!siyi.weixin">
      <b>倾听·合作·创造·共赢</b>
    </footer>
    <dialogComponent v-if="wxBox.isShow" v-bind="wxBox.bind" >
      <div id="wechat"></div>
    </dialogComponent>
  </div>


</template>
<script setup>
import {onActivated, onMounted, reactive, ref} from 'vue'
import * as app from '@/core/script/app.js'
import * as user from '@/core/script/user.js'
import * as core from '@/core/script/core.js'
import dialog from '@/core/script/dialog.js'
import {getClientIP} from '@/core/script/api.js'
import {checkBrowser} from '@/utils/browser.js'
import wallimg from '@/core/assets/wall/5.jpg'
import logoimg from '@/core/assets/img/logo.png'
import {pcLogin as wxPcLogin} from "@/utils/Wechat.js";
import siyi from "@/core/script/siyi.js";
import dialogComponent from '@/core/component/dialog.vue'

const wall = {backgroundImage: `url('${wallimg}')`}
const logo = {backgroundImage: `url('${logoimg}')`}
const video = ref()
//用户信息
const username = ref()
const password = ref()
const className = ref('')

const inputShow=ref(!siyi.weixin);

const submit = async () => {
  if (username.value === '') {
    dialog.error('用户名不能为空', 3000)
    document.getElementById('username').focus()
    return
  }
  if (password.value === '') {
    dialog.error('密码不能为空', 3000)
    document.getElementById('password').focus()
    return
  }
  className.value = 'loading'
  const client_info = {
    screen: window.screen.width + "x" + window.screen.height, // 屏幕宽度/高度
    window: window.innerWidth + "x" + window.innerHeight,// 当前窗口的宽度/高度
    pixelRatio: window.devicePixelRatio,  // 屏幕的设备像素比
    ip: await getClientIP(), // 获取IP
  }
  const res = await user.login(username.value, password.value, client_info)
  const path = new URL(window.location.href).pathname //路径
  res && await user.isLogin(false); // 登录成功后，检查用户信息
  res === true ? await app.to(path==='/'?'index':'page') : dialog.error(res, 3000)
  className.value = ''
}

const wxBox=reactive({
  isShow:false,
  bind:{
    type:"window",
    className:"wxBox",
    title:'企业微信扫码登录',
    width:'800px',
    height:'600px',
    container:'.login',
    onAfterOpen: () => {
      wxPcLogin("#wechat", 'callback', (code, state) => {
        const loading = dialog.loading('#wechat')
        user.isLogin(false, {code, state}).then(res => {
          res === true ? app.to('index') : dialog.error(res, 3000)
        }).finally(()=>{
          loading.close();
        })
      })
    },
    onAfterClose:()=>{
      wxBox.isShow = false;
    }
  },
  open:()=>{
    wxBox.isShow = true;
  }
})


// 在首次挂载 以及每次从缓存中被重新插入的时候调用
onActivated(() => video.value.play().catch(error => console.warn('Playback was interrupted:', error)))
// 首次挂载
onMounted(() => {
  checkBrowser().catch(info => dialog.warning(info + '，(推荐使用谷歌浏览器，360急速浏览器)', 3000));
})
</script>
<style scoped>
.login {
  width: 100%;
  height: 100%;
  position: absolute;
  min-width: 360px;
  min-height: 540px;
  background: no-repeat 50% 50% / cover;

  > .video {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 0;
    object-fit: cover;
  }

  #wechat{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  > .box {
    width: 600px;
    position: absolute;
    top: 20%;
    left: calc(50% - 300px);
    z-index: 1;
    display: grid;
    grid-template-rows: 160px auto;
    transition: all 300ms ease;

    > .logo {
      width: 100%;
      height: 100%;
      background: no-repeat 50% 50% / contain;
    }

    > form {
      display: grid;
      grid-gap: 5px;
      grid-template-columns: auto auto 45px;
      grid-template-rows: 45px;
      align-self: end;

      > input, > button {
        border: 0 none;
        outline: none;
        font-size: 18px;
        border-radius: 3px;
        color: #000;
        background-color: rgba(255, 255, 255, .7);
      }

      > input {
        padding: 0 20px;

        &::-webkit-input-placeholder {
          color: rgba(0, 0, 0, .7);
        }

        &:focus {
          background-color: #FFF;
        }
      }

      > button {
        text-align: center;
        cursor: pointer;
        position: relative;

        &:focus {
          background-color: #FFF;
        }

        &:hover {
          background-color: #FFF;
        }

        &:before {
          content: '';
          width: 10px;
          height: 10px;
          border-left: 2px solid #2a414b;
          border-top: 2px solid #2a414b;
          margin: -6px 0 0 -6px;
          transform: rotate(135deg);
          position: absolute;
          left: 50%;
          top: 50%;
        }

        &.loading {
          &:before {
            width: 15px;
            height: 15px;
            margin: -8.5px 0 0 -8.5px;
            border-radius: 50%;
            animation: loading .1s infinite linear;
          }
        }

        > span {
          display: none;
        }
      }


      .wx-login{
        height: 50px;
        line-height: 50px;
        background-color: #35a1fd00;
        color: #FFFFFF !important;
        margin-top: 20px;
        &:before{
          content: none;
        }
        &:hover{
          background-color: #4095db;
        }
        span{
          display: unset;
        }
      }

      .wechat{

      }

      .weixin{
        background-color: #36AF6EFF;
        &:hover{
          background-color: #72B290FF;
        }
      }

      .loading:last-of-type > span:last-child::after {
        content: "...";
        animation: dots 1.5s steps(3, end) infinite;
      }


    }
  }

  > .copyright {
    width: 100%;
    height: 100px;
    line-height: 25px;
    position: absolute;
    z-index: 2;
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

  @media screen and (min-width: 768px) {
    .wx-login{
      grid-column: span 2; /* 跨 2 列 */
      justify-self: center; /* 水平居中 */
      width: 200px;
    }
  }

  @media screen and (max-width: 768px) {
    > .box {
      width: 90%;
      left: 5%;
      top: 15%;
      grid-template-rows: 200px 250px;

      > form {
        grid-template-columns: auto;
        grid-template-rows: repeat(3, 50px);
        grid-gap: 30px;



        > button {
          &:before {
            display: none;
          }

          > span {
            display: block;
          }
        }
      }
    }
  }
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dots {
  0% { content: ""; }
  33% { content: "."; }
  66% { content: ".."; }
  100% { content: "..."; }
}

</style>