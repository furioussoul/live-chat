/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {ChatClient} from './client'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    client: null,//socket client
    user: null, // 当前用户
    sessions: [],// 会话列表
    currentToSession: {}, // 当前选中的对方的会话
    filterKey: '' //过滤会话列表
  },
  getters: {
    client: (state) => state.client,
    user: (state) => state.user,
    currentToSession: (state) => state.currentToSession,
    sessions: ({sessions, filterKey}) => sessions.filter(session => session.user.name.toUpperCase().includes(filterKey.toUpperCase()))
  },
  mutations: {
    changeCurrentToSession (state, sessionId) {
      state.currentToSession = state.sessions.find(session => session.id === sessionId)
    },
    setFilterKey: (state, value) => state.filterKey = value
  },
  actions: {
    login({state}) {
      state.client = new ChatClient({host: '127.0.0.1', port: 8080})
      if (!state.client.connect()) {
        alert('连接失败')
      }
      state.client.login({loginName: 1}) //todo 换成登录
    },
    sendMsg ({state}, content) {
      state.client.sendMsg(
        {
          'from': state.user.id,
          'to': state.currentToSession.id,
          content
        }
      )
    }
  }
});
export default store
