var EventEmitter = require('events').EventEmitter,
    _ = require('../../internal');

function HttpServer() {
}

_.inherits(HttpServer, EventEmitter);

module.exports = {
  HttpServer: HttpServer
};
