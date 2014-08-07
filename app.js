var express = require('express');
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fs = require("fs"),
    session = require('express-session'),
    mongo = require('mongoskin');
    app = express(),
    options = {
      key: fs.readFileSync(__dirname +'/cert/privatekey.pem'),
      cert: fs.readFileSync(__dirname +'/cert/certificate.pem')
    },
    uuid = require('shortid'),
    pass =  require('./routes/pass'),
    hasher  = new pass();
    var db;
    console.log(hasher.md5Hash('password'))

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
    if(index == 2 && val == "local"){
        db = mongo.db("mongodb://localhost:27017/partyy", {native_parser:true});
        app.set('server','local');
    }else{
       // db = mongo.db("mongodb://ravinder:devapps@ds053459.mongolab.com:53459/newrkdb",{safe: true, auto_reconnect: true});
        db = mongo.db("mongodb://ravinderrk:tst1apps198@ds059509.mongolab.com:59509/newrkmozidb",{safe: true, auto_reconnect: true});
        app.set('server','heroku');
    }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(__dirname + '/public'));
console.log(express.static(path));
app.use(session({ secret: 'shhhh, very secret' }));
// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});
// Session-persisted message middleware

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});
/*
var https = process.env.HTTPS || 1;
if(https > 0) {*/
   //    app.set('port', process.env.PORT || 3000);
   // var app_secure = require('https').createServer(options, app).listen(process.env.PORT || 4000);

/*} else {
    var app_secure = module.exports = express.createServer();
}

*/
var app_secure = require('https');
if(app.get('server') === 'local' ){
    app_secure.createServer(options, app).listen(process.env.PORT_SECURE || 443);
}else{
    app_secure.createServer(options, app).listen(process.env.PORT_SECURE || 3001);
}



var index = require('./routes/index')(app,app_secure,hasher),
	venues = require('./routes/venues')(app,app_secure,uuid),
	users = require('./routes/users')(app,app_secure,uuid,hasher),
	offers = require('./routes/offers')(app,app_secure,uuid),
	events = require('./routes/events')(app,app_secure,uuid);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


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

app.get('*',function(req,res,next){
  if(req.headers['x-forwarded-proto']!='https')
    res.redirect('https://' + req.header('Host') + req.url);
  else
    next() /* Continue to other routes if we're not redirecting */
})

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports= app;
