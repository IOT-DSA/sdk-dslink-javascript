var EventEmitter = require('events').EventEmitter,
    stream = require('../stream.js'),
    Stream = stream.Stream,
    StreamState = stream.StreamState,
    Poller = require('../../util.js').Poller,
    _ = require('../../internal.js');

function Client() {
  EventEmitter.call(this);
  this.__priv__ = {
    pollerInterval: 200,
    poller: new Poller(function() {
      var messages = [];

      var max = Math.min(this.responses.length, this.messageLimit + 1);
      _.each(_.Object.slice(this.responses, 1, max), function(stream, key) {
        if(stream.state === StreamState.CLOSED) {
          messages.push(_.mixin({
            rid: key,
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
          messages.push({
            rid: key,
            stream: stream.state,
            updates: updates
          });
        }
      });

      if(messages.length > 0) {
        this.sendMessages({
          responses: messages
        });
      }
    }.bind(this))
  };

  this.responses = {
    0: new Stream()
  };
  this.messageLimit = 3;
}

_.inherits(Client, EventEmitter);

Client.prototype.streamResponse = function(rid, data) {
  if(!_.isNull(this.responses[rid]))
    return this.responses[rid];

  this.responses[rid] = new Stream(data);
  return this.responses[rid];
};

module.exports = {
  Client: Client
};
