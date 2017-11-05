var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images/favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/popper.js/dist'));
app.use(express.static(__dirname + '/node_modules/jquery/dist'));
app.use(express.static(__dirname + '/node_modules/jquery.cookie'));

connectedUsers = [];
app.post('/register', function(req, res, next){
  var user = req.body.user;
  if(connectedUsers.indexOf(user)<0) {
    connectedUsers.push(user);
    res.cookie('user', user, {maxAge: 60*60*24*365})
      .send("success");
  }
  else {
    res.status(401).send('User "' + user + '" already exists');
  }
});

app.use('/', function(req, res, next){
  if(!req.cookies || !req.cookies['user']) {
    if(req.url === 'login.html') {
      res.redirect('login.html');
    }
    res.redirect('login.html?redirect=' + req.url);
  }
  else {
    next();
  }
});

app.use(express.static(path.join(__dirname, 'views')));

/////////////////START chat
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socketCookieParser = require('socket.io-cookie-parser');

io.use(socketCookieParser());

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
  var user = socket.request.cookies["user"];
  console.log('User ' + user + ' connected');
  socket.broadcast.emit('user connect event', user, 'connected');
  socket.on('disconnect', function(){
    console.log('User ' + user + ' disconnected');
    io.emit('user connect event', user, 'disconnected');
  });
  socket.on('chat message', function(msg){
    console.log('chat message: ' + user + ' said \"' + msg + '"');
    var style = getUserStyle(user);
    socket.emit('apply style', style);
    socket.broadcast.emit('chat message', user, msg, style);
  });
  socket.on('setColor', function(value){
    console.log('setColor: ' + user + ', ' + value);
    setUserStyle(user, "color", value);
    io.emit('setColor', user, value);
  });
  socket.on('setBold', function(value){
    console.log('setBold: ' + user + ', ' + value);
    setUserStyle(user, "font-weight", value);
    io.emit('setBold', user, value);
  });
  socket.on('setItalic', function(value){
    console.log('setItalic: ' + user + ', ' + value);
    setUserStyle(user, "font-weight", value);
    io.emit('setItalic', user, value);
  });
  socket.on('setBorder', function(value){
    console.log('setBorder: ' + user + ', ' + value);
    setUserStyle(user, "border", value);
    io.emit('setBorder', user, value);
  });
});
///END////////////////


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
    


module.exports = app;
