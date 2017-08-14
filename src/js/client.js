import store from './store'

//保存登录信息到localstorage
function cacheLocal(key,value) {
  if(!value){
    return window.localStorage.getItem(key)
  }

  if(typeof value === 'object'){
    value = JSON.stringify(value)
  }
  window.localStorage.setItem(key,value)
}
//注册事件
function registerEvent() {
  function cb({code, rMsg, rData}) {
    if (code === 1) {
      store.state.user = rData.user
      store.state.sessions = rData.sessions
      if(rData.sessions && rData.sessions[0]){
        store.state.currentToSession = rData.sessions[0]
      }
      console.log(store)
      cacheLocal('live-chat', rData.user)
    } else {
      alert(rMsg)
    }
  }

  this.socket.on("register",cb)
  this.socket.on("login", cb)
  this.socket.on('sendMsg', function (param) {
    var messages = []
    if(store.state.currentToSession.messages){
      store.state.currentToSession.messages.forEach(msg=>{
        messages.push(msg)
      })
    }
    messages.push(param)

    var session = {
      loginName:store.state.currentToSession.loginName,
      img:store.state.currentToSession.img,
      messages:messages
    }
    //要想绑定内部属性必须复制一个对象
    store.state.currentToSession = session
  })
  this.socket.on('disconnect', function (loginName) {
    store.state.userList = store.state.userList.filter(item => item !== loginName)
  })

  this.socket.on('getUserList', function (list) {
    var userList = []
    list.forEach(user => {
      userList.push(JSON.parse(user))
    })
    console.log(userList)
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
