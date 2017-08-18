<script>
  import {
    mapGetters,
    mapActions
  } from 'vuex'
  import{
    cache
  }from '../js/util'
  export default{
    data(){
      return {
        showLoginForm: true,
        user: {
          loginName: '',
          password: '',
          confirmPassword: '',
          registerCode: ''
        }
      }
    },
    methods: {
      ...mapActions(['login', 'register']),
      denglu () {
        if (!this.user.loginName) {
          alert('用户名不能为空')
          return
        }
        if (!this.user.password) {
          alert('密码不能为空')
          return
        }
        this.login(this.user);
      },
      zhuce(){
        if (!this.user.loginName) {
          alert('用户名不能为空')
          return
        }
        if (!this.user.password) {
          alert('密码不能为空')
          return
        }
        if (!this.user.password) {
          alert('确认密码不能为空')
          return
        }
        if (this.user.password !== this.user.password) {
          alert('两次输入密码不一致')
          return
        }
        this.register(this.user);
      },
      toggleLogin(){
        this.showLoginForm = !this.showLoginForm
      }
    },
    mounted(){
      var credential = cache('credential');
      if (!credential) {
        return
      }
      credential = JSON.parse(credential)
      if (credential.autoLogin) {
        this.$store.dispatch('login', credential)
      } else {
        this.user.loginName = credential.loginName
        this.user.password = credential.password
      }
    }
  }
</script>
<template>
  <div id="loginPanel">
    <div id="loginForm">
      <div class="login" v-show="showLoginForm">
        <p>
          <span class="soul-label">
          账号:
          </span>
          <input class="soul-input" type="text" v-model="user.loginName"/>
        </p>
        <p>
          <span class="soul-label">
           密码:
          </span>
          <input class="soul-input" type="text" v-model="user.password"/>
        </p>
        <div class="loginButtonPanel">
          <a class="toggle" @click="toggleLogin">还没注册？</a>
          <button class="soul-button" @click="denglu">登录</button>
        </div>
      </div>
      <div class="register" v-show="!showLoginForm">
        <p>
          <span class="soul-label">
          账号:
          </span>
          <input class="soul-input" type="text" v-model="user.loginName"/>
        </p>
        <p>
          <span class="soul-label">
           密码:
          </span>
          <input class="soul-input" type="text" v-model="user.password"/>
        </p>
        <p>
          <span class="soul-label">
           确认密码:
          </span>
          <input class="soul-input" type="text" v-model="user.confirmPassword"/>
        </p>
        <p>
          <span class="soul-label">
           注册秘钥:
          </span>
          <input class="soul-input" type="text" v-model="user.registerCode"/>
        </p>
        <div class="loginButtonPanel">
          <a class="toggle" @click="toggleLogin">已经注册？</a>
          <button class="soul-button" @click="zhuce">注册</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .soul-button {
    margin-left:2%;;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    white-space: nowrap;
    line-height: 1.5;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 6px 15px;
    font-size: 12px;
    border-radius: 4px;
    transition: color .2s linear, background-color .2s linear, border .2s linear;
    color: #fff;
    background: rgb(25, 190, 170) none;
    border: 1px solid #19be6b;
    &:hover {
      color: #fff;
      background: rgba(25, 190, 170, 0.8);
      border-color: #19be6b;
    }
  }

  #loginPanel {
    display: -webkit-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center;
    -webkit-justify-content: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 3px;
    background-color: rgb(255, 255, 255);
  }

  #loginForm {
    width: 80%;
  }

  .loginButtonPanel {
    display: -webkit-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center;
    -webkit-justify-content: center;
    justify-content: center;
  }

  .toggle {
    color: blue;
    &:hover {
      cursor: pointer;
    }
  }

  .soul-label {
    width: 20%;
    display: inline-block;
    text-align: center;
  }

  .soul-input {
    display: inline-block;
    width: 76%;
    height: 32px;
    line-height: 1.5;
    padding: 4px 7px;
    font-size: 12px;
    border: 1px solid #dddee1;
    border-radius: 4px;
    color: #495060;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    transition: border 1s ease-in-out, background 1s ease-in-out, box-shadow 1s ease-in-out;

    &:hover {
      -webkit-transition: border linear .2s, -webkit-box-shadow linear .5s;
      border-color: rgba(141, 39, 142, .75);
      -webkit-box-shadow: 0 0 18px rgba(111, 1, 32, 3);
    }
  }
</style>
