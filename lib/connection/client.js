var EventEmitter = require('events').EventEmitter,
    Poller = require('../util.js').Poller,
    _ = require('../internal.js');
    
var messageLimit = 3;

function Client() {
  EventEmitter.call(this);
  this.__priv__ = {
    sendQueue: [],
    pollerInterval: 100,
    poller: new Poller(function() {
      var queue = this.__priv__.sendQueue;
      if(queue.length !== 0) {
        this.handleMessages(queue.splice(0, queue.length >= messageLimit ? messageLimit : queue.length));
      }
    }.bind(this))
  };
}

_.inherits(Client, EventEmitter);

Client.prototype.send = function(message) {
  this.__priv__.sendQueue.push(message);
};

module.exports = {
  Client: Client
};
