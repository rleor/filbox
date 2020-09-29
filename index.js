#!/usr/bin/env node

/**
 * Module dependencies.
 */

const config = require('config-lite')(__dirname);
console.log("==========================================");
console.log(`port: ${config.port}`);
console.log(`password_rounds: ${config.password_rounds}`);
console.log(`jwt_expire_in: ${config.jwt_expire_in}`);
console.log(`jwt_secret: ${config.jwt_secret}`);
console.log(`pow_host: ${config.pow_host}`);
console.log(`pow_ffs_token: ${config.pow_ffs_token}`);
console.log(`db_host: ${config.db_host}`);
console.log(`db_user: ${config.db_user}`);
console.log(`db_password: ${config.db_password}`);
console.log(`default_storage_config: ${JSON.stringify(config.default_storage_config)}`);
console.log("==========================================");

var app = require('./app');
var debug = require('debug')('filbox:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
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
