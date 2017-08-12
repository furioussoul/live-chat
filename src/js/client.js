import store from './store'

//注册事件
function registerEvent() {
  this.socket.on("initData", function ({user, sessions}) {
    store.state.user = user
    store.state.sessions = sessions
  })
  this.socket.on('sendMsg', function (param) {
    store.state.sessions.forEach(function (session) {
      session.messages.push({
        content:param.content,
        date:new Date()
    })
    })
  })
}

//与服务器建立webSocket连接
ChatClient.prototype.connect = function () {
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

export function ChatClient ({host, port}) {

  this.host = host
  this.port = port
  this.socket = null
  this.events = []

  this.login = function (param) {
    this.socket.emit("login",param);
  }

  this.sendMsg = function (param) {
    this.socket.emit('sendMsg', param);
  }
}
