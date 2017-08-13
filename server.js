var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  redis = require("redis"),
  redisClient = redis.createClient('6333', '47.94.2.0')

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

const now = new Date();

app.use('/static', express.static(__dirname + '/dist/static'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

var dataSource = {},
  loginNameMapSocket = {}, //上线注册列表
  nameMapName = {}, //服务端记录用户映射，可应对权群聊
  registerCode = 'xjbmy' //注册秘钥

var response = {
  code: 1,
  rMsg: 'success',
  rData: null,

  ok: function (data) {
    this.rData = data
    return this
  },
  fail: function (msg) {
    this.code = 0
    this.rMsg = msg
    return this
  }
}

redisClient.get("aoe", function (err, value) {
  if (err) throw(err)
  console.log(JSON.parse(value))
})
io.on('connection', function (socket) {
  socket.on('register', function (param) {
    if (param.registerCode !== 'xjbmy') {
      return void socket.emit('register', response.fail('验证秘钥失败'))
    }
    redisClient.hmset(param.loginName, param)//登录信息入库
    loginNameMapSocket[socket.id] = socket//以socketId为键缓存连接

    socket.emit('register', {
      user: {
        id: socket.id,
        name: param.loginName,
        img: '/static/images/2.jpg' //默认头像
      }
    })
  })
  socket.on('login', function (param) {

    //获取用户信息,聊天记录
    var userInfo = redisClient.hgetall(param.loginName);
    if(!userInfo || userInfo.password !== param.password){
      return void socket.emit('login', response.fail('用户名密码错误'))
    }

    loginNameMapSocket[socket.id] = socket

    socket.emit('login', {
      user: {
        id: socket.id,
        name: userInfo.nickName || user.loginName,
        img: userInfo.img || '/static/images/2.jpg'
      },
      sessions: userInfo.sessions
    })
  })
  socket.on('sendMsg', function (param) {

    var now = new Date(),
      fromSocket = loginNameMapSocket[param.from],
      toSocket = loginNameMapSocket[param.to]
    if (fromSocket) {
      param.self = false
      param.date = now
      fromSocket.emit('sendMsg', param)
    }
    if (toSocket) {
      param.self = true
      param.date = now
      toSocket.emit('sendMsg', param)
    }
    console.log('from ' + param.from + ',to ' + param.to + ' content:' + param.content)

    //数据库里存一下 todo
  })
  socket.on('disconnect', function(){
    console.log(socket.id + " disconnected")
    delete loginNameMapSocket[socket.id]
  })
})


http.listen(8080, function () {
  console.log('listening on *:8080');
});
