var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const now = new Date();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var dataSource = {}

io.on('connection', function (socket) {
  socket.on('login', function (res) {
    console.log(res)
    socket.emit('login', {
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
    socket.on('sendMsg', function (res) {
      //数据库里存一下 todo
      //发给一个组的 todo
      //发给某个人的 cmd+sessionId todo
      socket.broadcast.emit('sendMsg', res);
    })
  })
});

var config = {
  "ListenPort": 8080,
  "RoomTotal": 100,
  "MaxClientNum": 300
};
var connections = {},//连接
  connectionCount = 0
//用户登陆
var OnLogin = function (identity) {
  var ret = 0;
  var socketId = this.id;//socket id
  if (connectionCount >= config.MaxClientNum) {
    //登陆失败
    this.emit("login", {"ret": 0})
    return void console.log('连接数太多')
  }

  var currentConnection = {
    socket: this,
    nickname: identity.loginName
  };

  //更新客户端链接
  connections[socketId] = currentConnection
  connectionCount++

  //登陆成功
  if (identity.loginName && identity.password) {
    this.emit("login", {
      "ret": 1,
      "info": {
        "id": currentConnection.socket.id,
        "nickname": currentConnection.nickname,
        "status": currentConnection.status
      }
    });
  } else {
    this.emit("login", {"ret": 0})
  }
}


http.listen(8080, function () {
  console.log('listening on *:8080');
});
