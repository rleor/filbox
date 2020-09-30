#!/usr/bin/env node

/**
 * Module dependencies.
 */

import log4js from "./logger";
var logger = log4js.getLogger();

const config = require('config-lite')(__dirname);
logger.info("==========================================");
logger.info(`port: ${config.port}`);
logger.info(`password_rounds: ${config.password_rounds}`);
logger.info(`jwt_expire_in: ${config.jwt_expire_in}`);
logger.info(`jwt_secret: ${config.jwt_secret}`);
logger.info(`pow_host: ${config.pow_host}`);
logger.info(`pow_ffs_token: ${config.pow_ffs_token}`);
logger.info(`knex_config: ${JSON.stringify(config.knex_config)}`);
logger.info(`default_storage_config: ${JSON.stringify(config.default_storage_config)}`);
logger.info("==========================================");

var app = require('./app');
var debug = require('debug')('filbox:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(config.port || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
