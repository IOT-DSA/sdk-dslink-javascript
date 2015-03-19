var error = require('../connection/error.js'),
    Stream = require('../connection/stream.js').Stream,
    Errors = error.Errors,
    _ = require('../internal');

var Method = {};

Method.list = function(responder, client, req) {
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
      client.removeListener('streamClosed', closedHandler);
      node.removeListener('child', childHandler);
    }
  };

  var streamClosed = client.on('streamClosed', closedHandler);

  return stream;
};

Method.set = function(responder, client, req) {
  var node = responder.provider.getNode(req.path);
};

Method.remove = function(responder, client, req) {
  var node = responder.provider.getNode(req.path);
};

Method.invoke = function(responder, client, req) {
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

Method.subscribe = function(responder, client, req) {
  _.each(req.paths, function(path) {
    var node = responder.provider.getNode(path);
    client.streamResponse(0).addNode(node);
  });

  return new Stream.closed();
};

Method.unsubscribe = function(responder, client, req) {
  _.each(req.paths, function(path) {
    var node = responder.provider.getNode(path);
    client.streamResponse(0).removeNode(node);
  });

  return new Stream.closed();
};

Method.close = function(responder, client, req) {
  if(req.rid !== 0) {
    client.streamResponse(req.rid).close();
  }
  return new Stream.closed();
};

function Responder(provider) {
  this.provider = provider;
}

Responder.prototype.handleRequest = function(client, req) {
  var method = req.method || '';

  if(!_.isNull(Method[method])) {
    try {
      var data = Method[method](this, client, req);

      if(!_.isNull(data)) {
        client.streamResponse(req.rid, data);
      }
    } catch(err) {
      if(_.typeOf(err) === 'string') {
        client.streamResponse(req.rid, new Stream().close(err.toString()));
      } else {
        throw err;
      }
    }
  }
};

module.exports = {
  Responder: Responder
};
