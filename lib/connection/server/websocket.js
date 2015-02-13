var EventEmitter = require('events').EventEmitter,
    _ = require('../../internal/util.js');

function WebSocketServer() {
}

_.inherits(WebSocketServer, EventEmitter);

module.exports = {
  WebSocketServer: WebSocketServer
};
