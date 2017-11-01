const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('static'));

//[{"ben":[{"color", "red"}, {"bold", "regular"}]}]
var userStyles = {};

getUserStyle = function(user){
  var styleString = "";
  if(userStyles[user]) {
    for (var style in userStyles[user]) {
      styleString += style + ": " + userStyles[user][style] + "; ";
    }
  }
  return styleString;
}
setUserStyle = function(user, key, value) {
  if(!userStyles[user])
    userStyles[user] = {};
  userStyles[user][key] = value;
}

io.on('connection', function(socket){
  console.log('a user connected');
  socket.broadcast.emit('user connect event', 'connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
    io.emit('user connect event', 'disconnected');
  });
  socket.on('chat message', function(user, msg){
    console.log('chat message: ' + user + ' said \"' + msg + '"');
    var style = getUserStyle(user);
    socket.emit('apply style', style);
    socket.broadcast.emit('chat message', user, msg, style);
  });
  socket.on('setColor', function(user, value){
    console.log('setColor: ' + user + ', ' + value);
    setUserStyle(user, "color", value);
    io.emit('setColor', user, value);
  });
  socket.on('setBold', function(user, value){
    console.log('setBold: ' + user + ', ' + value);
    setUserStyle(user, "font-weight", value);
    io.emit('setBold', user, value);
  });
  socket.on('setItalic', function(user, value){
    console.log('setItalic: ' + user + ', ' + value);
    setUserStyle(user, "font-weight", value);
    io.emit('setItalic', user, value);
  });
  socket.on('setBorder', function(user, value){
    console.log('setBorder: ' + user + ', ' + value);
    setUserStyle(user, "border", value);
    io.emit('setBorder', user, value);
  });
});

http.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
    