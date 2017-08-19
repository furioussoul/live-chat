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
    me: null, // 我的id（登录人id）
    sessions: [],// 会话列表
    currentSession: '',//当前聊天窗口id
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
      var exitSession = findSession(session.loginName)
      if (exitSession) {
        state.currentSession = exitSession
      } else {
        state.currentSession = session
        state.sessions.push(session)
      }
    },
    //添加消息到当前窗口或者sessions
    addMsg(state, message){
      var exitSession,
        sessions = state.sessions,
        currentSession = state.currentSession

      //更新当前会话的消息
      if (currentSession.loginName === message.from) {
        //当前聊天窗口的聊天对象是消息发送者
        currentSession.messages.push(message)
      }

      //更新历史会话的消息
      if (exitSession = findSession(message.from)) {
        //聊天记录里面有from的session
        //from的session加入消息
        exitSession.messages.push(message)
      } else {
        exitSession = {
          loginName: message.from,
          messages: [message],
          img: message.img
        }
        //插入新建from的session
        sessions.push(exitSession)
        state.currentSession = exitSession
      }
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
    logout:(state)=> state.me = null
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
