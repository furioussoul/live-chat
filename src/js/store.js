/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {ChatClient} from './client'

Vue.use(Vuex);

function connect(state) {
  state.client = new ChatClient({host: '127.0.0.1', port: 8080})//todo js获取origin
  if (!state.client.connect()) {
    alert('连接失败')
  }
}

const store = new Vuex.Store({
  state: {
    client: null,//socket client
    user: null, // 当前用户
    userList: null,
    sessions: [],// 会话列表
    currentSession: {
      loginName: '',
      img: '',
      messages: []
    }, // 当前选中的对方的会话
    filterKey: '' //过滤会话列表
  },
  getters: {
    client: (state) => state.client,
    user: (state) => state.user,
    userList: (state) => state.userList,
    currentSession: (state) => state.currentSession,
    sessions({sessions, filterKey}){
      if (!filterKey) {
        return sessions
      }
      return sessions.filter(session => session.loginName.toUpperCase().includes(filterKey.toUpperCase()))
    }
  },
  mutations: {
    //改变当前会话
    changeSession (state, currentToSession) {
      var exitSession
      state.sessions.forEach(session => {
        if (session.loginName === currentToSession.loginName) {
          exitSession = session
        }
      })
      if (exitSession) {
        //历史session包含要切换的session
        state.currentSession = exitSession
      } else {
        state.currentSession = currentToSession
        state.sessions.push(state.currentSession)
      }
    },
    setFilterKey: (state, value) => state.filterKey = value
  },
  actions: {
    register({state}, payload){
      connect(state)
      state.client.register(payload)
    },
    login({state}, payload) {
      connect(state)
      state.client.login(payload)
    },
    sendMsg ({state}, content) {
      var messages = []
      if (store.state.currentSession.messages) {
        //如果已经有消息
        store.state.currentSession.messages.forEach(msg => {
          messages.push(msg)
        })
      }
      var param = {
        from: state.user.loginName,
        to: state.currentSession.loginName,
        content: content,
        self: true,
        date: new Date()
      }
      messages.push(param)
      var session = {
        loginName: state.currentSession.loginName,
        img: store.state.currentSession.img,
        messages: messages
      }
      //要想绑定内部属性必须复制一个对象
      store.state.currentSession = session

      var exitSession
      store.state.sessions.forEach(session => {
        if (session.loginName === param.to) {
          exitSession = session
        }
      })

      if (!exitSession.messages) {
        exitSession.messages = []
      }
      exitSession.messages.push(param)

      state.client.sendMsg(
        {
          'from': state.user.loginName,
          'to': state.currentSession.loginName,
          content
        }
      )
    }
  }
});
export default store
