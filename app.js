var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Database
var mongo = require('mongoskin');
var db ;//= mongo.db("mongodb://localhost:27017/nodetest2", {native_parser:true});

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  if(index == 2 && val == "local"){
  db = mongo.db("mongodb://localhost:27017/partyy", {native_parser:true});
  }else{
 // db = mongo.db("mongodb://gir.sharma@gmail.com:india123@oceanic.mongohq.com:10019/app25479731",{native_parser:true});
  db = mongo.db("mongodb://girish:india123@oceanic.mongohq.com:10019/app25479731",{safe: true, auto_reconnect: true});
  }
});

var routes = require('./routes/index'),
	users = require('./routes/users'),
	offers = require('./routes/offers'),
	venues = require('./routes/venues'),
	events = require('./routes/events');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', config.allowedDomains);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

 app.use(allowCrossDomain);
// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/venues', venues);
app.use('/offers', offers);
app.use('/events',events);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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


module.exports = app;
