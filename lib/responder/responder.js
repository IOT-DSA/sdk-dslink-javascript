var error = require('../connection/error.js'),
    stream = require('../connection/stream.js'),
    Stream = stream.Stream,
    Errors = error.Errors,
    _ = require('../internal/util.js');

var Method = {};

Method.list = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
  var stream = new Stream(node.toStreamData());

  var childHandler = function(child, deleted) {
  var data = child.toStreamData(true);

    _.mixin(data[1], {
      change: deleted ? 'remove' : 'update'
    });

    stream.push(data);
  };

  node.on('child', childHandler);

  var streamClosed = responder.client.on('streamClosed', function(rid) {
    if(rid === req.rid) {
      responder.client.removeListener('streamClosed', streamClosed);
      node.removeListener('child', childHandler);
    }
  });

  return stream;
};

Method.set = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
};

Method.remove = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
};

Method.invoke = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);

  if(!node.isInvokable())
    throw Errors.INVALID_PATH;
  var stream = new Stream([node.invoke(req.params)]);

  return stream;
};

Method.subscribe = function(responder, req) {
  _.each(req.paths, function(path) {
    var node = responder.provider.resolvePath(path);
    responder.client.streamResponse(0).addNode(node);
  });

  return new Stream.closed();
};

Method.unsubscribe = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
  responder.client.streamResponse(0).removeNode(node);
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
    var data;
    try {
      data = Method[method](this, req);
    } catch(err) {
      if(err instanceof TypeError) {
        this.client.streamResponse(req.rid, []).close(Errors.INVALID_METHOD);
      }
      this.client.streamResponse(req.rid, []).close(err.toString());
      throw err;
      return;
    }

    if(!_.isNull(data)) {
      this.client.streamResponse(req.rid, data);
    }
  }
};

module.exports = {
  Responder: Responder
};
