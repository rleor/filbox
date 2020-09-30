import expressjwt from "express-jwt";
import log4js from "./logger";

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');
var minersRouter = require('./routes/miners');

var app = express();

app.use(log4js.connectLogger(log4js.getLogger('http'), { level: log4js.levels.INFO }));
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
app.use('/api/v1/miners', minersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('NotFound')
});

module.exports = app;
