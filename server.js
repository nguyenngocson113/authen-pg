var express  = require('express');
var app      = express();
var passport = require('passport');
var flash    = require('connect-flash'); // su dung de tao ra cac flash messages

var morgan       = require('morgan'); //module luu log trong cac lan dang nhap
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.set('view engine', 'ejs');


app.use(session({ secret: 'qwertyuiop1234567890' })); // session secret
app.use(passport.initialize());//middleware dc goi o tung request, kiem tra session lay ra passport.user
app.use(passport.session()); //middleware su dung kich ban passport, kiem tra session lay thong tin user roi gan vao req.user
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(3000);
