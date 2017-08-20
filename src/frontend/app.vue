<script>
  import Card from './components/card';
  import List from './components/list';
  import TextBox from './components/textBox';
  import Message from './components/message';
  import loginPanel from './components/loginPanel.vue';
  import userListPanel from './components/userListPanel.vue';
  import danmu from './components/danmu.vue';
  import store from './js/store'
  import {
    mapGetters,
    mapActions
  } from 'vuex'
  export default {
    components: {Card, List, TextBox, Message, loginPanel, userListPanel, danmu},
    computed: {
      ...mapGetters(['me'])
    }
  }
</script>

<template>
  <div class="view" v-if="me">
    <div class="sidebar">
      <card></card>
      <list></list>
    </div>
    <div class="main">
      <message></message>
      <TextBox></TextBox>
    </div>
    <div class="userListPanel">
      <userListPanel></userListPanel>
    </div>
    <danmu></danmu>
  </div>
  <div class="view" v-else>
    <loginPanel></loginPanel>
  </div>
</template>

<style lang="less" scoped>
  .view {
    margin: 0 auto;
    height: 100%;

    overflow: hidden;
    position: relative;
    border-radius: 3px;

    .sidebar, .main {
      height: 90%;
    }
    .sidebar {
      float: left;
      width: 25%;
      color: #f4f4f4;
      background-color: #2e3238;
      overflow: scroll;
    }
    .main {
      width: 75%;
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

  .userListPanel {
    position: fixed;
    top: 20px;
    right: 100px;
    width: 100px;
    background-color: white;
  }

  @media screen and (min-width: 1200px) {
    .view {
      width: 900px;
      height: 100%;
    }

    .loginPanel {
      width: 900px;
      height: 100%;
      margin: 0 auto;
    }
  }

</style>
