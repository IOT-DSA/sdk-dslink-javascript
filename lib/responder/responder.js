var error = require('../connection/error.js'),
    Stream = require('../connection/stream.js').Stream,
    Errors = error.Errors,
    _ = require('../internal');

var Method = {};

Method.list = function(responder, req) {
  var node = responder.provider.getNode(req.path);
  var stream = new Stream(node.toStreamData());

  var childHandler = function(child, deleted) {
    var data = child.toStreamData(true);

    _.mixin(data[1], {
      change: deleted ? 'remove' : 'update'
    });

    stream.push(data);
  };

  node.on('child', childHandler);

  var closedHandler = function(rid) {
    if(rid === req.rid) {
      responder.client.removeListener('streamClosed', closedHandler);
      node.removeListener('child', childHandler);
    }
  };

  var streamClosed = responder.client.on('streamClosed', closedHandler);

  return stream;
};

Method.set = function(responder, req) {
  var node = responder.provider.getNode(req.path);
};

Method.remove = function(responder, req) {
  var node = responder.provider.getNode(req.path);
};

Method.invoke = function(responder, req) {
  var node = responder.provider.getNode(req.path);
  var stream = node.invoke(req.params);

  if(!(stream instanceof Stream)) {
    // fallback
    if(!_.isNull(stream)) {
      if(_.typeOf(stream) !== 'array')
        stream = [stream];
      stream = new Stream(stream, true);
    } else {
      stream = new Stream.closed();
    }
  }

  return stream;
};

Method.subscribe = function(responder, req) {
  _.each(req.paths, function(path) {
    var node = responder.provider.getNode(path);
    responder.client.streamResponse(0).addNode(node);
  });

  return new Stream.closed();
};

Method.unsubscribe = function(responder, req) {
  _.each(req.paths, function(path) {
    var node = responder.provider.getNode(path);
    responder.client.streamResponse(0).removeNode(node);
  });

  return new Stream.closed();
};

Method.close = function(responder, req) {
  if(req.rid !== 0) {
    responder.client.streamResponse(req.rid).close();
  }
  return new Stream.closed();
};

function Responder(client, provider) {
  this.client = client;
  this.provider = provider;

  client.on('request', this.handleRequest.bind(this));
}

Responder.prototype.handleRequest = function(req) {
  var method = req.method || '';

  if(!_.isNull(Method[method])) {
    try {
      var data = Method[method](this, req);

      if(!_.isNull(data)) {
        this.client.streamResponse(req.rid, data);
      }
    } catch(err) {
      if(_.typeOf(err) === 'string') {
        this.client.streamResponse(req.rid, new Stream().close(err.toString()));
      } else {
        throw err;
      }
    }
  }
};

module.exports = {
  Responder: Responder
};
