var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on("login", OnLogin);
    socket.on('getUserList', function(obj){
        io.emit('getUserList', "userList");
    });
    socket.on("login", OnLogin);
});

var config = {
    "ListenPort" : 8080,
    "RoomTotal" : 100,
    "MaxClientNum" : 300
};
var connections = {},//连接
    connectionCount = 0
//用户登陆
var OnLogin = function(identity){
    var ret = 0;
    var socketId = this.id;//socket id
    if(connectionCount >= config.MaxClientNum){
        //登陆失败
        this.emit("login", {"ret" : 0})
        return void console.log('连接数太多')
    }

    var currentConnection = {
        socket   : this,
        nickname : identity.loginName
    };

    //更新客户端链接
    connections[socketId] = currentConnection
    connectionCount++

    //登陆成功
    if(identity.loginName  && identity.password){
        this.emit("login", {
            "ret"  : 1,
            "info":{
                "id" : currentConnection.socket.id,
                "nickname" :currentConnection.nickname,
                "status" : currentConnection.status
            }
        });
    }else {
        this.emit("login", {"ret" : 0})
    }
}


http.listen(8080,function(){
    console.log('listening on *:8080');
});
