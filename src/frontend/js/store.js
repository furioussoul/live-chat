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
  copyProperties,
  guid
} from './util'
Vue.use(Vuex);

function connect(state) {
  state.client = new ChatClient({host: location.origin, port: 6444})
  if (!state.client.connect()) {
    alert('连接失败')
  }
}

const store = new Vuex.Store({
  state: {
    client: null,//socket 客户端
    users: [],//用户列表
    me: null, // 我的id（登录人id）
    sessions: [],// 会话列表
    currentSession: null,//当前聊天窗口id
    filterKey: '' //搜索用户的所搜词
  },
  getters: {
    client: ({client}) => client,
    users: ({users}) => users,
    onlineUsers: ({users, myLoginName}) => users.filter(user => user.loginName !== myLoginName),
    me: ({me}) => me,
    myLoginName: ({myLoginName}) => myLoginName,
    sessions: ({sessions, filterKey}) => sessions && sessions.filter(session => !filterKey || session.loginName.toUpperCase().includes(filterKey.toUpperCase())),
    currentSession: ({currentSession}) => currentSession
  },
  mutations: {
    //初始化会话记录
    initSessions(state, sessions){
      state.sessions = sessions
    },
    //设置当前会话
    setCurrentSession (state, session) {
      if (!session.messages) session.messages = []
      var exitSession = findSession(session.loginName)
      if (exitSession) {
        state.currentSession = exitSession
      } else {
        exitSession = session
        state.currentSession = session //sessions包含currentSession的引用
        state.sessions.push(session)
      }

      exitSession.messages.forEach(msg => {
        if(state.me.loginName === msg.to){
          //自己是收消息的人
          state.client.read(msg)
        }
      })
    },
    //初始化用户列表
    initUsers(state, user){
      state.me = user
      state.users = user.onlineUsers
    },
    //更新用户列表中用户的信息
    refreshUser(state, user){
      var oldUser
      if ((oldUser = findUser(user.loginName))) {
        //用户已经在用户列表,更新用户信息
        copyProperties(oldUser, user)
        return state.users[state.users.indexOf(oldUser)] = user
      }
      //将用户加入列表
      state.users.push(user)
    },
    setFilterKey: (state, value) => state.filterKey = value,
    logout: (state) => state.me = null
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
      var msgId = guid(),
        message = {
          id: msgId,
          from: state.me.loginName,
          to: state.currentSession.loginName,
          content,
          self: true,
          read: false,
          date: new Date()
        }

      var session = {}
      copyProperties(session, state.currentSession)
      session.messages.push(message)
      state.currentSession = session
      //往当前窗口写消息

      state.client.sendMsg({
        id: msgId,
        'from': state.me.loginName,
        'to': state.currentSession.loginName,
        content
      })
    }
  }
});
export default store
