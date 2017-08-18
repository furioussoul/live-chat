/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {ChatClient} from './client'
import {findSession} from './util'
Vue.use(Vuex);

function connect(state) {
  state.client = new ChatClient({host: '127.0.0.1', port: 8080})//todo js获取origin
  if (!state.client.connect()) {
    alert('连接失败')
  }
}

const store = new Vuex.Store({
  state: {
    client: null,//socket 客户端
    users: null,//用户列表
    myId: '', // 我的id（登录人id）
    sessions: [],// 会话列表
    currentSessionId: '',//当前聊天窗口id
    filterKey: '' //搜索用户的所搜词
  },
  getters: {
    client: (state) => state.client,
    users: ({users}) => users,
    me: ({users, myId}) => users.find(user => myId === user.id),
    sessions({sessions, filterKey}){
      if (!filterKey) {
        return sessions
      }
      return sessions.filter(session => session.loginName.toUpperCase().includes(filterKey.toUpperCase()))
    },
    currentSession: ({sessions,currentSessionId}) => sessions.find(session => currentSessionId === session.id)
  },
  mutations: {
    //选择聊天窗口
    selectSession ({sessions,currentSession}, selectedSession) {
      var exitSession = findSession(selectedSession.loginName)
      if (exitSession) {
        //历史session包含要切换的session
        currentSession = exitSession
      } else {
        currentSession = selectedSession
        sessions.push(currentSession)
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
