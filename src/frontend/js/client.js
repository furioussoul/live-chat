import store from './store'
import {
  findSession,
  cache
} from './util'

//注册事件
function registerEvent() {
  this.socket.on("register", callBack)
  this.socket.on("login", callBack)
  this.socket.on('receiveMsg', onReceiveMsg)
  this.socket.on('disconnect', onDisconnect)
  this.socket.on('notifyUserLogin', onNotifyUserLogin)
}
//注册回调事件（监听服务端推送事件）
ChatClient.prototype.on = function (event, callback) {
  this.events[event] = callback;
  return this;
}

//与服务器建立webSocket连接
ChatClient.prototype.connect = function (data) {
  if (!("io" in window)) {
    alert('浏览器不支持socket.io')
    return false
  }
  let connectUrl = 'http://' + this.host + ':' + this.port
  this.socket = io.connect(connectUrl)
  registerEvent.call(this)
  return true
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

function callBack({code, rMsg, rData}) {
  if (code === 1) {
    store.commit('initUsers',rData)
    store.commit('initSessions', rData.sessions)
    cache('credential', rData)
  } else {
    alert(rMsg)
  }
}

function onReceiveMsg(message) {
  let exitSession,
    sessions = store.state.sessions

  //聊天记录里面没有from的session
  if (!(exitSession = findSession(message.from))) {
    //新建from的session
    exitSession = {
      loginName: message.from,
      img: message.img,
      messages: [message]
    }
    sessions.push(exitSession)
  } else {
    //from的session加入消息
    exitSession.messages.push(message)
  }
}

function onDisconnect(loginName) {
  store.state.users = store.state.users.filter(item => item.loginName !== loginName)
}

function onNotifyUserLogin(onlineUser) {
  store.commit('refreshUser',onlineUser)
}


