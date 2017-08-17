/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {ChatClient} from './client'

Vue.use(Vuex);

function connect(state) {
  state.client = new ChatClient({host: '47.94.2.0', port: 80})//todo js获取origin
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
      return sessions.filter(session => session.loginName.toUpperCase().includes(filterKey.toUpperCase()))
    }
  },
  mutations: {
    //添加会话
    changeSession (state, currentToSession) {
      var exitSession
      state.sessions.forEach(session => {
        if (session.loginName === currentToSession.loginName) {
          exitSession = session
        }
      })
      if (exitSession) {
        //历史session包含要切换的session
        state.currentToSession = exitSession
      } else {
        state.currentToSession = currentToSession
        state.sessions.push(state.currentToSession)
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
        self: true,
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
