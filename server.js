var express = require('express'),
  cookie = require('cookie-parser'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  redis = require("redis"),
  redisClient = redis.createClient('6334', '47.94.2.0'),//测试redis
  socketServer

//捕获node进程异常
process.on('uncaughtException', function (err) {
  console.error('An uncaught error occurred!');
  console.error(err.stack);
});

//捕获redis异常
redisClient.on("error", function (err) {
  console.log("Error " + err);
});

//express配置
app.use(cookie())
app.use('/static', express.static(__dirname + '/dist/static'))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

//socket连接，注册事件
io.on('connection',onConnect)

var loginNameMapSocket = {}, //上线注册列表
  registerCode = 'xjbmy' //注册秘钥

function onConnect(socket) {
  socketServer = socket
  socketServer.on('register', onRegister)
  socketServer.on('login', onLogin)
  socketServer.on('sendMsg', onSendMsg)
  socketServer.on('disconnect', onDisconnected)
}

function onDisconnected() {
  var disconnected = false,
    disconnectName
  for (var loginName in loginNameMapSocket) {
    if (loginNameMapSocket[loginName].id === socketServer.id) {
      delete loginNameMapSocket[loginName]
      disconnected = true
      disconnectName = loginName
      break
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
}

function onRegister(credential) {
  if (credential.registerCode !== registerCode) {
    return void socketServer.emit('register', response.fail('验证秘钥失败'))
  }
  redisClient.hgetall(param.loginName, function (error, userInfo) {
    if (error) throw(error)
    if (userInfo) {
      return void socketServer.emit('register', response.fail('用户名已被注册'))
    }

    if (!credential.img) {
      credential.img = '/static/images/2.png' //默认头像
    }
    credential.createTime = new Date()

    redisClient.hmset(param.loginName, credential)//注册入库

    loginNameMapSocket[param.loginName] = socketServer//缓存socket

    var user = {
      loginName: param.loginName,
      name: param.loginName,
      img: param.img,
      sessions: []
    }

    socketServer.emit('register', response.ok(user))//通知前段注册成功

    //查询在线用户
    redisClient.smembers('room', function (error, loginUsers) {
      if (error) throw error

      loginUsers.push(JSON.stringify(user))
      io.emit('receiveUsers', loginUsers)//广播在线用户
      redisClient.sadd('room', JSON.stringify(user))//在线用户入库
    })
  })
}

function onLogin(credential) {
  //获取用户信息,聊天记录
  redisClient.hgetall(credential.loginName, function (err, userInfo) {
    if (err) throw(err)
    if (!userInfo || userInfo.password !== credential.password) {
      return void socketServer.emit('login', response.fail('用户名密码错误'))
    }

    redisClient.smembers('room', function (error, loginUsers) {
      if (error) throw error

      for (var i = 0; i < loginUsers.length; i++) {
        if (JSON.parse(loginUsers[i]).loginName === credential.loginName) {//该账号已经登陆了
          loginNameMapSocket[credential.loginName].emit('kickOff', response.ok('你的账号在别处被登录了'))
          loginNameMapSocket[credential.loginName].disconnect()
        }
      }
      loginNameMapSocket[credential.loginName] = socketServer

      var user = {
        loginName: userInfo.loginName,
        name: userInfo.nickName || userInfo.loginName,
        img: userInfo.img,
        sessions: JSON.parse(userInfo.sessions)
      }
      socketServer.emit('login', response.ok(user))
      loginUsers.push(JSON.stringify(user))
      io.emit('receiveUsers', loginUsers)
      redisClient.sadd('room', JSON.stringify(user))
    })
  })
}

function onSendMsg(message) {
  //把消息保存到message.from这个用户下
  redisClient.hgetall(message.from, function (error, fromUserInfo) {
    if (error) throw error

    var sessions = JSON.parse(fromUserInfo.sessions),
      toSession,
      now = new Date()

    //查找fromUser下的所有会话中是否已经有了和toUser的会话
    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i] && sessions[i].loginName === message.to) {
        toSession = sessions[i]
        break
      }
    }

    if (!toSession) {
      // 没有toUser的会话
      toSession = {
        loginName: message.to,
        img: fromUserInfo.img,
        messages: []
      }
      sessions.push(toSession)
    }

    toSession.messages.push({
      from: message.from,
      to: message.to,
      content: message.content,
      date: now,
      self: true
    })

    redisClient.hmset(message.from, 'sessions', JSON.stringify(sessions)) //保存到fromUser下

    //把消息保存到message.to这个用户下，并且通知message.to
    redisClient.hgetall(message.to, function (error, toUserInfo) {
      if (error) throw error

      var sessions = JSON.parse(toUserInfo.sessions),
        fromSession,
        now = new Date()

      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i] && sessions[i].loginName === message.from) {
          fromSession = sessions[i]
          break
        }
      }

      if (!fromSession) {
        fromSession = {
          loginName: message.from,
          img: toUserInfo.img,
          messages: []
        }
        sessions.push(fromSession)
      }

      var emitData = {
        from: message.from,
        to: message.to,
        content: message.content,
        date: now,
        self: false,
      }

      fromSession.messages.push(emitData)
      redisClient.hmset(message.to, 'sessions', JSON.stringify(sessions))//保存到toUser下
      loginNameMapSocket[message.to].emit('receiveMsg', emitData)//通知toUser
    })
  })
}

http.listen(8080, function () {
  console.log('listening on *:80');
});

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
