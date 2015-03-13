var EventEmitter = require('events').EventEmitter,
    _ = require('../../internal');

function WebSocketServer() {
}

_.inherits(WebSocketServer, EventEmitter);

module.exports = {
  WebSocketServer: WebSocketServer
};
