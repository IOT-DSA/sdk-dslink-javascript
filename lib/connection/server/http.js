var EventEmitter = require('events').EventEmitter,
    _ = require('../../internal/util.js');

function HttpServer() {
}

_.inherits(HttpServer, EventEmitter);

module.exports = {
  HttpServer: HttpServer
};
