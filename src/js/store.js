/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import {
  ChatClient
} from './client'
import {
  findSession,
  findUser,
  copyProperties
} from './util'
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
    users: [],//用户列表
    myLoginName: '', // 我的id（登录人id）
    sessions: [],// 会话列表
    currentSessionId: '',//当前聊天窗口id
    filterKey: '' //搜索用户的所搜词
  },
  getters: {
    client: ({client}) => client,
    users: ({users}) => users,
    me: ({users, myLoginName}) => users.find(user => myLoginName === user.loginName),
    sessions: ({sessions, filterKey}) => sessions.filter(session => !filterKey || session.loginName.toUpperCase().includes(filterKey.toUpperCase())),
    currentSession: ({sessions, currentSessionId}) => sessions.find(session => currentSessionId === session.id)
  },
  mutations: {
    initSessions(sessions){

    },
    //设置当前会话
    setCurrentSession (state, session) {
      var exitSession = findSession(session.loginName)
      if (exitSession) {
        state.currentSession = exitSession
      } else {
        state.currentSession = session
        state.sessions.push(session)
      }
    },
    //添加消息到当前窗口或者sessions
    addMsg(){

    },
    //更新用户列表中用户的信息
    refreshUser(state, user){
      state.myLoginName = user.loginName
      var oldUser
      if ((oldUser = findUser(user.loginName))) {
        //用户已经在用户列表,更新用户信息
        return copyProperties(oldUser, user)
      }
      //将用户加入列表
      state.users.push(user)
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
    sendMsg ({currentSession, myLoginName, client}, content) {
      var message = {
        from: myLoginName,
        to: currentSession.loginName,
        content: content,
        self: true,
        date: new Date()
      }
      currentSession.messages.push(message)//往当前窗口写消息

      var exitSession = findSession(message.to)
      exitSession.messages.push(message)
      client.sendMsg(
        {
          'from': myLoginName,
          'to': currentSession.loginName,
          content
        }
      )
    }
  }
});
export default store
