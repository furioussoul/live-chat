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
var loginNameMapSocket = {}

io.on('connection', function (socket) {
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
