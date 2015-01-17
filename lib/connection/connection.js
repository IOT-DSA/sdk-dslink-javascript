var url = require('url'),
    http = require('http'),
    https = require('https'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    Poller = require('../util.js').Poller,
    _ = require('../internal.js');

var servers = {};

function addServer(host, path, cb) {
  host = url.parse(host).hostname;
}

function Client() {
  EventEmitter.call(this);
  this.__priv__ = {
    sendQueue: [],
    pollerInterval: 100,
    poller: new Poller(function() {
      this.handleSendQueue(2);
    }.bind(this))
  };
}

_.inherits(Client, EventEmitter);

Client.prototype.send = function(message) {
  this.__priv__.sendQueue.push(message);
};

module.exports = {
  Client: Client,
  addServer: addServer
};
