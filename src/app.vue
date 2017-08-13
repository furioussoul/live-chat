<script>
  import Card from './components/card';
  import List from './components/list';
  import TextBox from './components/textBox';
  import Message from './components/message';
  import loginPanel from './components/loginPanel.vue';
  import userListPanel from './components/userListPanel.vue';
  import {
    mapGetters,
    mapActions
  } from 'vuex'
  export default {
    components: {Card, List, TextBox, Message, loginPanel, userListPanel},
    computed: {
      ...mapGetters(['user'])
    }
  }
</script>

<template>
  <div v-if="user" id="app">
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
  </div>
  <div v-else>
    <loginPanel></loginPanel>
  </div>
</template>

<style lang="less" scoped>
  .userListPanel {
    position: fixed;
    top:20px;
    right: 100px;
    width:100px;
    background-color: white;
  }
  #app {
    margin: 20px auto;
    width: 900px;
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
      width: 600px;
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
