var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var indexRouter = require('./routes/index.js');
var chatRoomsRouter = require('./routes/chatrooms.js');
var messagesRouter = require('./routes/messages.js');
var rRouter = require('./routes/r.js');

var db = require('./db.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chatrooms', chatRoomsRouter);
app.use('/messages', messagesRouter);
app.use('/r', rRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

io.on('connection', function(socket) {
    console.log("User connected to socket");

    // When a person emits a chat message
    socket.on('chat message', function(msg) {
        console.log(msg);
        // Send that message to everyone.
        io.emit('chat message', msg);
        db.insertMessage(msg.chatRoom, msg.username, msg.message, msg.unixTime, function(err) {
            if (err) {
                console.log('Error while inserting message into db: ' + err);
            }
        });
    });
});

http.listen(7998, function() {
    console.log('Listening on port 7998');
});
