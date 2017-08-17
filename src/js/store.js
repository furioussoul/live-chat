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
    client: null,
    // 当前用户
    user: {},
    // 会话列表
    sessions: [],
    // 当前选中的会话
    currentSessionId: null,
    //当前登录的会话
    loginSessionId:null,
    currentSession: {},//todo 合并
    // 过滤出只包含这个key的会话
    filterKey: ''
  },
  getters: {
    user: (state) => state.user,
    currentSessionId: ({currentSessionId}) => currentSessionId,
    currentSession: ({sessions, currentSessionId}) => sessions.find(session => session.id === currentSessionId),
    sessions: ({sessions, filterKey}) => sessions.filter(session => session.user.name.toUpperCase().includes(filterKey.toUpperCase()))
  },
  mutations: {
    selectSession (state, currentSessionId) {
      state.currentSessionId = currentSessionId
    },
    setFilterKey: (state, value) => state.filterKey = value
  },
  actions: {
    login({state}) {
      state.client = new ChatClient({host: '127.0.0.1', port: 8080})
      if (!state.client.connect()) {
        alert('连接失败')
      }
      state.client.login({loginSessionId:state.loginSessionId}) //todo 换成登录
    },
    sendMsg ({state}, content) {
      state.client.sendMsg({'to': state.currentSessionId,'from':state.loginSessionId, content})
    }
  }
});
export default store
