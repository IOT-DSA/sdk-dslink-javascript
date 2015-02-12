var error = require('../connection/error.js'),
    Stream = require('../connection/stream.js').Stream,
    Errors = error.Errors,
    _ = require('../internal.js');

var Method = {};

Method.list = function(responder, req) {
  var node = responder.provider.resolvePath(req.path),
      stream = new Stream(node.toStreamData());

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
  var node = responder.provider.resolvePath(req.path);
};

Method.unsubscribe = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
};

Method.close = function(responder, req) {
  responder.client.streamResponse(req.rid).close();
  return [];
};

function Responder(client, provider) {
  this.client = client;
  this.provider = provider;

  client.on('request', this.handleRequest);
}

Responder.prototype.handleRequest = function(req) {
  var json = JSON.parse(req);

  _.each(json.requests, function(req) {
    var method = req.method || '';

    if(!_.isNull(Method[method])) {
      var data;
      try {
        data = Method[method](this, req);
      } catch(err) {
        if(err instanceof TypeError) {
          this.client.streamResponse(req.rid, []).close(Errors.INVALID_METHOD);
        }
        this.client.streamResponse(req.rid, []).close(err);
        return;
      }

      if(!_.isNull(data)) {
        this.client.sendResponse(req.rid, data);
      }
    }
  }, this);
};

module.exports = {
  Responder: Responder
};
