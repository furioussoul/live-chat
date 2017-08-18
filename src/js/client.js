import store from './store'
import {
  findSession,
  cache
} from './util'

//注册事件
function registerEvent() {
  function cb({code, rMsg, rData}) {
    if (code === 1) {
      store.commit('refreshUser',rData.user)
      store.commit('initSessions',rData.user.sessions)
      cache('credential', rData.user)
    } else {
      alert(rMsg)
    }
  }

  this.socket.on("register", cb)
  this.socket.on("login", cb)
  this.socket.on('receiveMsg', function (param) {
    var exitSession,
      sessions = store.state.sessions,
      currentSession = store.state.currentSession

    //当前聊天窗口的聊天对象是消息发送者
    if (currentSession.loginName === param.from) {
      //消息加入当前对话窗口
      currentSession.messages.push(param)
      if (!exitSession.messages) {
        exitSession.messages = []
      }
      exitSession.messages.push(param)
    }

    //聊天记录里面没有from的session
    if (!(exitSession = findSession(param.from))) {
      //新建from的session
      exitSession = {
        loginName: param.from,
        messages: [param],
        img: param.img
      }
      sessions.push(exitSession)
      currentSession = exitSession
    }else {
      //from的session加入消息
      exitSession.messages.push(param)
    }
  })
  this.socket.on('disconnect', function (loginName) {
    store.state.users = store.state.users.filter(item => item.loginName !== loginName)
  })

  this.socket.on('receiveUsers', function (onlineUsers) {
    var userList = []
    onlineUsers.forEach(user => {
      userList.push(JSON.parse(user)) //todo mvc 自动序列化
    })
    store.state.users = userList.filter(item => item.loginName !== store.state.myLoginName)
  })
}

//与服务器建立webSocket连接
ChatClient.prototype.connect = function (data) {
  if (!("io" in window)) {
    alert('浏览器不支持socket.io')
    return false
  }
  var connectUrl = 'http://' + this.host + ':' + this.port
  this.socket = io.connect(connectUrl)
  registerEvent.call(this)
  return true
}

//注册回调事件（监听服务端推送事件）
ChatClient.prototype.on = function (event, callback) {
  this.events[event] = callback;
  return this;
}

export function ChatClient({host, port}) {

  this.host = host
  this.port = port
  this.socket = null
  this.events = []

  this.register = function (param) {
    this.socket.emit("register", param);
  }

  this.login = function (param) {
    this.socket.emit("login", param);
  }

  this.sendMsg = function (param) {
    this.socket.emit('sendMsg', param);
  }
}
