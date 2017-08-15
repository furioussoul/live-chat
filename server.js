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
      param.img = '/static/images/2.png' //默认头像
      redisClient.hmset(param.loginName, param)//注册入库
      loginNameMapSocket[param.loginName] = socket

      var user = {
        loginName: param.loginName,
        password: param.password,//todo加密
        name: param.loginName,
        img: param.img
      }
      socket.emit('register', response.ok({
        user: user,
        sessions: []
      }))
      redisClient.smembers('room', function (error, loginUsers) {
        if (error) throw error
        loginUsers.push(JSON.stringify(user))
        io.emit('getUserList', loginUsers)
        redisClient.sadd('room', JSON.stringify(user))
      })
    })
  })

  socket.on('login', function (param) {
    //获取用户信息,聊天记录
    redisClient.hgetall(param.loginName, function (err, userInfo) {
      if (err) throw(err)
      if (!userInfo || userInfo.password !== param.password) {
        return void socket.emit('login', response.fail('用户名密码错误'))
      }

      redisClient.smembers('room', function (error, loginUsers) {
        if (error) throw error

        for (var i = 0; i < loginUsers.length; i++) {
          if (JSON.parse(loginUsers[i]).loginName === param.loginName) {
            return void socket.emit('login', response.fail('你的账号在别处被登录了'))//别处登录了 todo 踢掉
          }
        }
        redisClient.hmset(param.loginName, 'loginTime', new Date())//更新登录时间
        loginNameMapSocket[param.loginName] = socket

        var user = {
          loginName: userInfo.loginName,
          password: userInfo.password,//todo加密
          name: userInfo.nickName || userInfo.loginName,
          img: userInfo.img
        }
        socket.emit('login', response.ok({
          user: user,
          sessions: userInfo.sessions
            ? JSON.parse(userInfo.sessions)
            : []
        }))
        loginUsers.push(JSON.stringify(user))
        io.emit('getUserList', loginUsers)
        redisClient.sadd('room', JSON.stringify(user))
      })
    })
  })

  socket.on('sendMsg', function (param) {

    var sessions,
      messages,
      session,
      now = new Date()

    redisClient.hgetall(param.from, function (error, fromUserInfo) {
      if (error) throw error
      var sessions = fromUserInfo.sessions
      if (!sessions) {
        sessions = []
      } else {
        sessions = JSON.parse(sessions)
      }

      var toSession
      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i] && sessions[i].loginName === param.to) {
          toSession = sessions[i]
        }
      }

      if (!toSession) {
        toSession = {}
        toSession.loginName = param.to
        toSession.img = fromUserInfo.img
        toSession.messages = []
        sessions.push(toSession)
      }

      var emitData = {
        from: param.from,
        to: param.to,
        content: param.content,
        date: now,
        self: true
      }
      toSession.messages.push(emitData)
      redisClient.hmset(param.from, 'sessions', JSON.stringify(sessions))

      redisClient.hgetall(param.to, function (error, toUserInfo) {
        if (error) throw error
        var sessions = toUserInfo.sessions
        if (!sessions) {
          sessions = []
        } else {
          sessions = JSON.parse(sessions)
        }

        var fromSession
        for (var i = 0; i < sessions.length; i++) {
          if (sessions[i] && sessions[i].loginName === param.from) {
            fromSession = sessions[i]
          }
        }

        if (!fromSession) {
          fromSession = {}
          fromSession.loginName = param.from
          fromSession.img = toUserInfo.img
          fromSession.messages = []
          sessions.push(fromSession)
        }

        var emitData = {
          from: param.from,
          to: param.to,
          content: param.content,
          date: now,
          self: false,
          img : toUserInfo.img
        }
        fromSession.messages.push(emitData)
        loginNameMapSocket[param.to].emit('sendMsg', emitData)
        redisClient.hmset(param.to, 'sessions', JSON.stringify(sessions))
      })

    })
    console.log('from ' + param.from + ',to ' + param.to + ' content:' + param.content)
  })

  socket.on('disconnect', function () {
    var disconnected = false,
      disconnectName
    for (var loginName in loginNameMapSocket) {
      if (loginNameMapSocket[loginName].id === socket.id) {
        delete loginNameMapSocket[loginName]
        disconnected = true
        disconnectName = loginName
      }
    }
    redisClient.smembers('room', function (error, loginUsers) {
      if (error) throw error
      for (var j = 0; j < loginUsers.length; j++) {
        var userStr = loginUsers[j]
        var userObj = JSON.parse(userStr)
        if (userObj.loginName === disconnectName) {
          redisClient.srem('room', userStr)
        }
      }
      io.emit('disconnect', loginName)
      console.log(loginName + " disconnected")
    })
    if (!disconnected) {
      console.log("disconnect cant find socketId")
    }
  })
})

http.listen(80, function () {
  console.log('listening on *:80');
});
