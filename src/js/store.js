/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {ChatClient} from './client'

Vue.use(Vuex);

function connect(state){
  state.client = new ChatClient({host: '127.0.0.1', port: 8080})
  if (!state.client.connect()) {
    alert('连接失败')
  }
}

const store = new Vuex.Store({
  state: {
    client: null,//socket client
    user: null, // 当前用户
    userList:null,
    sessions: [],// 会话列表
    currentToSession: {}, // 当前选中的对方的会话
    filterKey: '' //过滤会话列表
  },
  getters: {
    client: (state) => state.client,
    user: (state) => state.user,
    userList:(state) => state.userList,
    currentToSession: (state) => state.currentToSession,
    sessions: ({sessions, filterKey}) => sessions.filter(session => session.user.name.toUpperCase().includes(filterKey.toUpperCase()))
  },
  mutations: {
    /**
     * @param state
     * @param loginName
     */
    changeCurrentToSession (state, loginName) {
      state.currentToSession = state.sessions.find(session => session.loginName === loginName)
    },
    setFilterKey: (state, value) => state.filterKey = value
  },
  actions: {
    register({state},payload){
      connect(state)
      state.client.register(payload)
    },
    login({state},payload) {
      connect(state)
      state.client.login(payload)
    },
    sendMsg ({state}, content) {
      state.client.sendMsg(
        {
          'from': state.user.loginName,
          'to': state.currentToSession.loginName,
          content
        }
      )
    }
  }
});
export default store
