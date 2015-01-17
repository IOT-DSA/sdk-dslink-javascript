var Client = require('../connection.js').Client,
    EventEmitter = require('eventemitter2').EventEmitter2
    _ = require('../internal.js');

// TODO: Work on this after the spec allows for WebSocket auth to be in plaintext instead of HTTP request headers.

function WebSocketClient() {
  Client.call(this);
}

_.inherits(WebSocketClient, Client);

function WebSocketServer() {
}

_.inherits(WebSocketServer, EventEmitter);

module.exports = {
  WebSocketClient: WebSocketClient
  WebSocketServer: WebSocketServer
};
