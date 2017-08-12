<script>
  import Card from './components/card';
  import List from './components/list';
  import TextBox from './components/textBox';
  import Message from './components/message';
  import {
    mapGetters,
    mapActions
  } from 'vuex'
  export default {
    components: {Card, List, TextBox, Message},
    computed: {
      ...mapGetters(['client'])
    },
    mounted () {
    }
  }
</script>

<template>
  <div v-if="client" id="app">
    <div class="sidebar">
      <card></card>
      <list></list>
    </div>
    <div class="main">
      <message></message>
      <TextBox></TextBox>
    </div>
  </div>
  <div v-else>
    <div id="loginPanel">
      <div id="loginForm">
        <p>
          <span class="soul-label">
          账号:
          </span>
          <input class="soul-input" type="text"/>
        </p>
        <p>
          <span class="soul-label">
           密码:
          </span>
          <input class="soul-input" type="text"/>
        </p>
        <p>
          <button class="soul-button">登录</button>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .soul-button{
    margin: 0 auto;
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
    transition: color .2s linear,background-color .2s linear,border .2s linear;
    color: #fff;
    background: rgb(25, 190, 170) none;
    border: 1px solid #19be6b;
    display: block;
    &:hover{
        color: #fff;
        background: rgba(25,190, 170,0.8);
        border-color: #19be6b;
      }
  }
  #loginForm {
    position: absolute;
    top:100px;
    left: 40px;
    width: 230px;
  }

  .soul-label {
    width: 17%;
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

  #loginPanel {
    margin: 20px auto;
    width: 300px;
    height: 400px;
    border-radius: 3px;
    background-color: rgb(255, 255, 255);
    position: relative;
  }

  #app {
    margin: 20px auto;
    width: 800px;
    height: 600px;

    overflow: hidden;
    border-radius: 3px;

    .sidebar, .main {
      height: 100%;
    }
    .sidebar {
      float: left;
      width: 200px;
      color: #f4f4f4;
      background-color: #2e3238;
    }
    .main {
      position: relative;
      overflow: hidden;
      background-color: #eee;
    }
    .text {
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
    }
    .message {
      height: ~'calc(100% - 160px)';
    }
  }
</style>
