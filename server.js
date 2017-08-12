var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const now = new Date();

app.use('/static', express.static(__dirname + '/dist/static'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

var dataSource = {}
var loginNameMapSocket = {} //上线注册列表
var nameMapName = {} //服务端记录用户映射，可应对权群聊

function checkAlive(toName){
  if(loginNameMapSocket[toName]) {
    return true;
  }
  return false;
}

io.on('connection', function (socket) {
  console.log(socket.id)

  socket.on('login', function (param) {
    console.log(param)
    loginNameMapSocket[param.loginName] = socket
    socket.emit('initData', {
      user: {
        name: 'coffce',
        img: '/static/images/1.jpg'
      },
      sessions: [
        {
          id: 1,
          user: {
            name: '示例介绍',
            img: '/static/images/2.png'
          },
          messages: [
            {
              content: 'Foo',
              date: now
            }
          ]
        },
        {
          id: 2,
          user: {
            name: 'webpack',
            img: '/static/images/3.jpg'
          },
          messages: [
            {
              content: 'Bar',
              date: now
            }
          ]
        }
      ]
    })
  })
  socket.on('sendMsg', function (param) {
    if(!checkAlive(param.to)) {
      var fromSocket = loginNameMapSocket[param.from];
      fromSocket.emit('sendMsg', '用户不在线');
      return;
    }

    var toSocket = loginNameMapSocket[param.to];
    if(toSocket) {
      toSocket.emit('sendMsg', param)
    }
    //数据库里存一下 todo
  })
  socket.on('disconnect', () => console.log('disconnected'))
})


http.listen(8080, function () {
  console.log('listening on *:8080');
});
