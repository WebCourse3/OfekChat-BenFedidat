const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('static'));

io.on('connection', function(socket, user){
  console.log('a user connected');
  io.emit('user connect event', 'connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    io.emit('user connect event', 'disconnected');
  });
  socket.on('chat message', function(user, msg){
    console.log('chat message: ' + user + 'said \"' + msg + '"');
    io.emit('chat message', user, msg);
  });
});

http.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
    