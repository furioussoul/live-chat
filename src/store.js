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
    client: null,
    // 当前用户
    user: {
      name: 'coffce',
      img: '/static/images/1.jpg'
    },
    // 会话列表
    sessions: [
      {
        id: 1,
        user: {
          name: '示例介绍',
          img: '/static/images/2.png'
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
          img: '/static/images/3.jpg'
        },
        messages: []
      }
    ],
    // 当前选中的会话
    currentSessionId: 1,
    // 过滤出只包含这个key的会话
    filterKey: ''
  },
  getters: {
    user: (state) => state.user,
    currentSessionId: ({currentSessionId}) => currentSessionId,
    sessions: ({sessions, filterKey}) => sessions.filter(session => session.user.name.toUpperCase().includes(filterKey.toUpperCase()))
  },
  mutations: {
    selectSession (state, currentSessionId) {
      state.currentSessionId = currentSessionId
    },
    setFilterKey: (state, value) => state.filterKey = value
  },
  actions: {
    login({client}) {
      client = new ChatClient({host: '127.0.0.1', port: 8080})
      if (!client.connect()) {
        alert('连接失败')
      }
      //获取用户列表
      client.login()
    },
    sendMsg ({currentSessionId}, content) {
      this.state.client.sendMsg({currentSessionId, content})
    }
  }
});
export default store
