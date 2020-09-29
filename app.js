import expressjwt from "express-jwt";

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const config = require('config-lite')(__dirname);
app.use(
    expressjwt({ secret: config.jwt_secret, algorithms: ['HS256'] })
        .unless({ path: ['/api/v1/users/signup', '/api/v1/users/signin']})
);

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/files', filesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
  res.status(404).send('NotFound')
});

// error handler
// app.use(function(err, req, res, next) {
// });

module.exports = app;
