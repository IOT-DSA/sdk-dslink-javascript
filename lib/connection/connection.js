var EventEmitter = require('eventemitter2').EventEmitter2,
    Poller = require('../util.js').Poller,
    _ = require('../internal.js');

function Connection() {
  this.__priv__ = {
    sendQueue: [],
    pollerInterval: 100,
    poller: new Poller(function() {
      this.handleSendQueue(2);
    }.bind(this))
  };
}

_.inherits(Connection, EventEmitter);

Connection.prototype.send = function(message) {
  this.__priv__.sendQueue.push(message);
};

module.exports = {
  Connection: Connection
};
