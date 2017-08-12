import store from './store'

//注册事件
function registerEvent() {
  this.socket.on("login", function ({user, sessions}) {
    store.state.user = user
    store.state.sessions = sessions
  })
  this.socket.on('sendMsg', function (res) {
    store.state.sessions.forEach(function (session) {
      session .messages.push({
        content:res.content,
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

  this.login = function (sessionId) {
    this.socket.emit("login",sessionId);
  }

  this.sendMsg = function (data) {
    this.socket.emit('sendMsg', data);
  }
}
