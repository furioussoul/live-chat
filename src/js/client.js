import store from './store'

//注册事件
function registerEvent() {
  this.socket.on("register", function ({code, rMsg, rData}) {
    if (code === 1) {
      store.state.user = rData.user
      store.state.sessions = rData.sessions
    } else {
      alert(rMsg)
    }
  })
  this.socket.on("login", function ({code, rMsg, rData}) {
    if (code === 1) {
      store.state.user = rData.user
      store.state.sessions = rData.sessions
    } else {
      alert(rMsg)
    }
  })
  this.socket.on('sendMsg', function (param) {
    store.state.currentToSession.messages.push(param)
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
