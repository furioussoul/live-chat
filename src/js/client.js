import store from './store'
import {
  flashInfo
} from './notification'
import {
  findSession
} from './util'

//保存登录信息到localstorage
function cacheLocal(key, value) {
  if (!value) {
    return window.localStorage.getItem(key)
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  window.localStorage.setItem(key, value)
}
//注册事件
function registerEvent() {
  function cb({code, rMsg, rData}) {
    if (code === 1) {
      store.state.user = rData.user
      store.state.sessions = rData.sessions
      if (rData.sessions && rData.sessions[0]) {
        store.state.currentSession = rData.sessions[0]
      }
      cacheLocal('live-chat', rData.user)
    } else {
      alert(rMsg)
    }
  }

  this.socket.on("register", cb)
  this.socket.on("login", cb)
  this.socket.on('receiveMsg', function (param) {//todo 改名-》getMsg
    var exitSession,
      sessions = store.state.sessions,
      currentSession = store.state.currentSession

    flashInfo.flash = true

    if (!(exitSession = findSession(sessions, param.from))) {
      //要想绑定内部属性必须复制一个对象
      var session = {
        loginName: param.from,
        messages: [param],
        img: param.img
      }
      sessions.push(session)
      currentSession = session
    } else {
      var messages = []
      if (currentSession.loginName === param.from) {
        //接收消息的来源是当前窗口的发送者
        if (currentSession.messages) {
          currentSession.messages.forEach(msg => {
            messages.push(msg)
          })
        }
        messages.push(param)
        var session = {
          loginName: currentSession.loginName,
          img: currentSession.img,
          messages: messages
        }
        //要想绑定内部属性必须复制一个对象
        currentSession = session
        if (!exitSession.messages) {
          exitSession.messages = []
        }
        exitSession.messages.push(param)
      }
    }
  })
  this.socket.on('disconnect', function (loginName) {
    store.state.userList = store.state.userList.filter(item => item.loginName !== loginName)
  })

  this.socket.on('receiveOnlineUsers', function (onlineUsers) {
    var userList = []
    onlineUsers.forEach(user => {
      userList.push(JSON.parse(user)) //todo mvc 自动序列化
    })
    store.state.userList = userList.filter(item => item.loginName !== store.state.user.loginName)
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
