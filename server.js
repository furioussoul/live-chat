var express = require('express'),
  cookie = require('cookie-parser'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  redis = require("redis"),
  redisClient = redis.createClient('6333', '47.94.2.0')

process.on('uncaughtException', function (err) {
  console.error('An uncaught error occurred!');
  console.error(err.stack);
});

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

app.use(cookie())
app.use('/static', express.static(__dirname + '/dist/static'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});
app.get('/getUser', function (req, res) {
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  // res.send({status:"success", message:"delete user success"});
  //todo 选择用户加入聊天
});

var dataSource = {},
  loginNameMapSocket = {}, //上线注册列表
  nameMapName = {}, //服务端记录用户映射，可应对权群聊
  registerCode = 'xjbmy' //注册秘钥

var response = {
  ok: function (data) {
    this.code = 1
    this.rData = data
    return this
  },
  fail: function (msg) {
    this.code = 0
    this.rMsg = msg
    return this
  }
}

io.on('connection', function (socket) {
  socket.on('register', function (param) {
    if (param.registerCode !== 'xjbmy') {
      return void socket.emit('register', response.fail('验证秘钥失败'))
    }
    redisClient.hgetall(param.loginName, function (err, userInfo) {
      if (err) throw(err)
      if (userInfo) {
        return void socket.emit('register', response.fail('用户名已被注册'))
      }

      param.createTime = new Date()
      redisClient.hmset(param.loginName, param)//注册入库
      redisClient.sadd('room', param.loginName)
      loginNameMapSocket[param.loginName] = socket

      return void socket.emit('register', response.ok({
        user: {
          loginName: param.loginName,
          password: userInfo.password,//todo加密
          name: param.loginName,
          img: '/static/images/2.png' //默认头像
        },
        sessions: userInfo.sessions || []
      }))
    })
  })

  socket.on('login', function (param) {
    //获取用户信息,聊天记录
    redisClient.hgetall(param.loginName, function (err, userInfo) {
      if (err) throw(err)
      if (!userInfo || userInfo.password !== param.password) {
        return void socket.emit('login', response.fail('用户名密码错误'))
      }

      redisClient.sadd('room', param.loginName)
      redisClient.hmset(param.loginName, 'createTime', new Date())//更新登录时间
      loginNameMapSocket[param.loginName] = socket

      return void socket.emit('login', response.ok({
        user: {
          loginName: userInfo.loginName,
          password: userInfo.password,//todo加密
          name: userInfo.nickName || userInfo.loginName,
          img: userInfo.img || '/static/images/2.png'
        },
        sessions: userInfo.sessions || []
      }))
    })
  })

  socket.on('sendMsg', function (param) {
    var fromSocket = loginNameMapSocket[param.from],
      toSocket = loginNameMapSocket[param.to]

    saveSession(param)
    fromSocket.emit('sendMsg', param)
    toSocket.emit('sendMsg', param)

    console.log('from ' + param.from + ',to ' + param.to + ' content:' + param.content)
  })

  socket.on('getUserList', function (loginName) {
    redisClient.smembers('room',function (error, loginNames) {
      if(error) throw error
      var socket = loginNameMapSocket[loginName]
      socket.emit('getUserList', loginNames)
    })
  })

  socket.on('disconnect', function () {
    var disconnected = false
    for (var loginName in loginNameMapSocket){
      if(loginNameMapSocket[loginName].id === socket.id){
        delete loginNameMapSocket[loginName]
        disconnected =true
        console.log(socket.id + " disconnected")
      }
    }
    if(!disconnected){
      console.log("disconnect cant find socketId")
    }
  })
})

/**
 * @param param
 * @param self true代表自己发出的，false代表别人发过来的
 */
function saveSession(param) {
  var sessions,
    messages,
    now = new Date()

  sessions = redisClient.hmget(param.from, 'sessions')
  messages = sessions[param.to]
  if (!messages) messages = []
  messages.push(
    {
      self: true,
      content: param.content,
      date: now
    }
  )
  redisClient.hmset(param.from, 'sessions', messages)

  sessions = redisClient.hmget(param.to, 'sessions')
  messages = sessions[param.from]
  if (!messages) messages = []
  messages.push(
    {
      self: false,
      content: param.content,
      date: now
    }
  )
  redisClient.hmset(param.to, 'sessions', messages)
}

http.listen(8080, function () {
  console.log('listening on *:8080');
});
