var EventEmitter = require('events').EventEmitter,
    stream = require('../stream.js'),
    Stream = stream.Stream,
    SubscribeStream = stream.SubscribeStream,
    StreamState = stream.StreamState,
    Poller = require('../../util.js').Poller,
    Responder = require('../../responder/responder.js').Responder,
    _ = require('../../internal');

function Client(args) {
  EventEmitter.call(this);
  this.setMaxListeners(0);

  // private variables

  this._responses = {
    0: new SubscribeStream()
  };

  this._pollerInterval = 200;

  this._poller = new Poller(function() {
    var message = [];

    var max = Math.min(this._responses.length, this.messageLimit + 1);
    _.each(_.Object.slice(this._responses, 1, max), function(stream, key) {
      var updates = stream.next();

      if(stream.state === StreamState.CLOSED) {
        var closeMessage = {
          rid: parseInt(key),
          stream: StreamState.CLOSED
        };

        if(!_.isNull(stream.error)) {
          _.mixin(closeMessage, {
            error: stream.error
          });
        }

        if(!_.isNull(updates)) {
          _.mixin(closeMessage, {
            updates: updates
          });
        }

        message.push(closeMessage);

        this.emit('streamClosed', parseInt(key));
        delete this._responses[key];
        return;
      }

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
  }.bind(this));

  // public variables

  this.messageLimit = 3;

  this.responder = null;
  this.requester = null;

  _.each(args, function(arg) {
    if(arg instanceof Responder) {
      if(this.responder !== null)
        throw 'Only one Responder can be specified.';
      this.responder = arg;
    }
  }, this);
}

_.inherits(Client, EventEmitter);

Client.prototype.streamResponse = function(rid, data) {
  if(!_.isNull(this._responses[rid]))
    return this._responses[rid];

  this._responses[rid] = data;
  return this._responses[rid];
};

module.exports = {
  Client: Client
};
