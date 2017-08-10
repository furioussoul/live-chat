/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {ChatClient} from './client'

Vue.use(Vuex);

const now = new Date();
const store = new Vuex.Store({
  state: {
    client:null,
    // 当前用户
    user: {
      name: 'coffce',
      img: 'dist/images/1.jpg'
    },
    // 会话列表
    sessions: [
      {
        id: 1,
        user: {
          name: '示例介绍',
          img: 'dist/images/2.png'
        },
        messages: [
          {
            content: 'Hello，这是一个基于Vue + Vuex + Webpack构建的简单chat示例，聊天记录保存在localStorge, 有什么问题可以通过Github Issue问我。',
            date: now
          }, {
            content: '项目地址: https://github.com/coffcer/vue-chat',
            date: now
          }
        ]
      },
      {
        id: 2,
        user: {
          name: 'webpack',
          img: 'dist/images/3.jpg'
        },
        messages: []
      }
    ],
    // 当前选中的会话
    currentSessionId: 1,
    // 过滤出只包含这个key的会话
    filterKey: ''
  },
  mutations: {
    GET_USER_LIST (state) {
      state.client = new ChatClient('127.0.0.1', 8080)
      if (!state.client.connect()) {
        alert('连接失败')
       }

      //获取用户列表
      state.client.getUserList()
    },
    // 发送消息
    SEND_MESSAGE ({sessions, currentSessionId}, content) {
      let session = sessions.find(item => item.id === currentSessionId);
      this.state.client.sendMsg(content)
    },
    // 选择会话
    SELECT_SESSION (state, id) {
      state.currentSessionId = id;
    },
    // 搜索
    SET_FILTER_KEY (state, value) {
      state.filterKey = value;
    }
  },
  actions : {
    getUserList: function(state) {
      state.client = new ChatClient({host:'127.0.0.1', port:8080})
      if (!state.client.connect()) {
        alert('连接失败')
      }
      //获取用户列表
      state.client.getUserList()
    } ,
    sendMessage: ({dispatch}, content) => dispatch('SEND_MESSAGE', content),
    selectSession: ({dispatch}, id) => dispatch('SELECT_SESSION', id),
    search: ({dispatch}, value) => dispatch('SET_FILTER_KEY', value)
  }
});


export default store
