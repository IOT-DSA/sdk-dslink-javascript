var stream = require('./stream.js'),
    Stream = stream.Stream,
    StreamState = stream.StreamState,
    SubscribeStream = require('./subscribe.js').SubscribeStream,
    EventEmitter = require('events').EventEmitter,
    Method = require('./method.js').Method,
    DSError = require('../error.js').Error,
    _ = require('../internal');

function Responder(provider) {
  EventEmitter.call(this);
  this.setMaxListeners(0);

  this.provider = provider;
  this.messageLimit = 3;

  this._responses = {
    0: new SubscribeStream()
  };
}

_.inherits(Responder, EventEmitter);

Responder.prototype._tick = function(client) {
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

      if(!_.isNull(stream.meta)) {
        _.mixin(closeMessage, stream.meta);
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
      message.push(_.mixin({
        rid: parseInt(key),
        stream: stream.state,
        updates: updates
      }, stream.meta));
    }
  }, this);

  return message;
};

Responder.prototype.handleRequest = function(req) {
  var method = req.method || '';

  if(!_.isNull(Method[method])) {
    try {
      var data = Method[method](this, req);

      if(!_.isNull(data)) {
        this.streamResponse(req.rid, data);
      }
    } catch(err) {
      if(_.typeOf(err) === 'string' || err instanceof DSError) {
        this.streamResponse(req.rid, new Stream().close(err.toString()));
      } else {
        throw err;
      }
    }
  }
};

Responder.prototype.streamResponse = function(rid, data) {
  if(!_.isNull(this._responses[rid]))
    return this._responses[rid];

  this._responses[rid] = data;
  return this._responses[rid];
};

module.exports = {
  Responder: Responder
};
