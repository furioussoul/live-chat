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
  registerEvent()
  return true
}

//注册回调事件（监听服务端推送事件）
ChatClient.prototype.on = function (event, callback) {
  this.events[event] = callback;
  return this;
}

var ChatClient = function ({host, port}) {

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

$(function () {
  var host = '127.0.0.1'
  var port = 8080
  var client = new ChatClient(host, port)
  var identity = {};
  //登陆
  $("#login").click(function () {
    //链接服务器
    if (client.connect() === false) {
      console.log('链接失败')
      return false;
    }

    //登陆
    var loginName = $("#loginName").val();
    if (!loginName) {
      alert("请输入登录名");
      $("#loginName").val('').focus();
      return;
    }
    var password = $("#password").val();
    if (!password) {
      alert("请输入密码");
      $("#password").val('').focus();
      return;
    }
    client.login({loginName: loginName, password: password});
  });

  client.on("login", function (data) {//登陆返回
    if (data.ret === 1) {
      $('#cover').remove()
      identity.nickname = data.info.nickname
    } else {
      alert("登陆失败");
    }
  })

  client.on('chat message', function (obj) {
    $('#messages').append($('<li>').text(obj.nickname + ':' + obj.msg));
  });
  //发消息
  $('form').submit(function () {
    client.sendMsg({nickname: identity.nickname, msg: $('#m').val()})
    $('#m').val('');
    return false;
  });
});
