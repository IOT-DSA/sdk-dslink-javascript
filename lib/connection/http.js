var HandshakeClient = require('./handshake.js').HandshakeClient,
    EventEmitter = require('events').EventEmitter,
    _ = require('../internal.js');

function HttpClient(name, hostname) {
  HandshakeClient.call(this, name, hostname, function() {
    this.__priv__.poller.poll(this.__priv__.pollerInterval);
  });
}

_.inherits(HttpClient, HandshakeClient);

HttpClient.prototype.handleMessages = function(messages) {

};

function HttpServer() {
}

_.inherits(HttpServer, EventEmitter);

module.exports = {
  HttpClient: HttpClient,
  HttpServer: HttpServer
};
