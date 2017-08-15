/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {ChatClient} from './client'

Vue.use(Vuex);

function connect(state) {
  state.client = new ChatClient({host: '127.0.0.1', port: 8080})
  if (!state.client.connect({a: 123})) {
    alert('连接失败')
  }
}

const store = new Vuex.Store({
  state: {
    client: null,//socket client
    user: null, // 当前用户
    userList: null,
    sessions: [],// 会话列表
    currentToSession: {
      loginName: '',
      img: '',
      messages: ''
    }, // 当前选中的对方的会话
    filterKey: '' //过滤会话列表
  },
  getters: {
    client: (state) => state.client,
    user: (state) => state.user,
    userList: (state) => state.userList,
    currentToSession: (state) => state.currentToSession,
    sessions({sessions, filterKey}){
      if (!filterKey) {
        return sessions
      }
      sessions.filter(session => session.user.loginName.toUpperCase().includes(filterKey.toUpperCase()))
    }
  },
  mutations: {
    addSession (state, currentToSession) {
      var exitSession
      state.sessions.forEach(session => {
        if (session.loginName === currentToSession.loginName) {
          exitSession = session
        }
      })
      if (exitSession) {
        state.currentToSession = {
          loginName: exitSession.loginName,
          img: exitSession.img,
          messages: exitSession.messages
        }
      } else {
        state.currentToSession = {
          loginName: currentToSession.loginName,
          img: currentToSession.img,
          messages: currentToSession.messages
        }
        state.sessions.push(state.currentToSession)
      }
    },
    changeCurrentToSession (state, loginName) {
      state.currentToSession = state.sessions.find(session => session.loginName === loginName)
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
      if (store.state.currentToSession.messages) {
        //如果已经有消息
        store.state.currentToSession.messages.forEach(msg => {
          messages.push(msg)
        })
      }
      var param = {
        from: state.user.loginName,
        to: state.currentToSession.loginName,
        content: content,
        date: new Date()
      }
      messages.push(param)
      var session = {
        loginName: state.currentToSession.loginName,
        img: store.state.currentToSession.img,
        messages: messages
      }
      //要想绑定内部属性必须复制一个对象
      store.state.currentToSession = session

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
          'to': state.currentToSession.loginName,
          content
        }
      )
    }
  }
});
export default store
