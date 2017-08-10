//注册事件
function registerEvent() {
  this.socket.on("login", function (data) {//登陆返回
    if (data.ret === 1) {
      $('#cover').remove()
      identity.nickname = data.info.nickname
    } else {
      alert("登陆失败");
    }
  }).on('sendMsg', function (res) {
    console.log(res)
  }).on('getUserList', function (res) {
    console.log(res)
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

  this.getUserList = function () {
    this.socket.emit("getUserList");
  }

  this.sendMsg = function (obj) {
    this.socket.emit('chat message', obj);
  }
}
