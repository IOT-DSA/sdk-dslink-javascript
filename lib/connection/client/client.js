var EventEmitter = require('events').EventEmitter,
    stream = require('../stream.js'),
    Stream = stream.Stream,
    SubscribeStream = stream.SubscribeStream,
    StreamState = stream.StreamState,
    Poller = require('../../util.js').Poller,
    _ = require('../../internal/util.js');

function Client() {
  EventEmitter.call(this);
  this.__priv__ = {
    pollerInterval: 200,
    poller: new Poller(function() {
      var message = [];

      var max = Math.min(this.responses.length, this.messageLimit + 1);
      _.each(_.Object.slice(this.responses, 1, max), function(stream, key) {
        if(stream.state === StreamState.CLOSED) {
          message.push(_.mixin({
            rid: parseInt(key),
            stream: StreamState.CLOSED,
          }, !_.isNull(stream.error) ? {
            error: stream.error
          } : {}));

          this.emit('streamClosed', key);
          delete this.responses[key];
          return;
        }

        var updates = stream.next();

        if(!_.isNull(updates)) {
          message.push({
            rid: parseInt(key),
            stream: stream.state,
            updates: updates
          });
        }
      }, this);

      if(message.length > 0) {
        this.sendMessage({
          responses: message
        });
      }
    }.bind(this))
  };

  this.responses = {
    0: new SubscribeStream()
  };
  this.messageLimit = 3;
}

_.inherits(Client, EventEmitter);

Client.prototype.streamResponse = function(rid, data) {
  if(!_.isNull(this.responses[rid]))
    return this.responses[rid];

  this.responses[rid] = data;
  return this.responses[rid];
};

module.exports = {
  Client: Client
};
