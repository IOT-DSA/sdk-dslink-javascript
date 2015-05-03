var error = require('../error.js'),
    DSError = error.Error,
    Errors = error.Errors,
    Stream = require('./stream.js').Stream,
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
      responder.removeListener('streamClosed', closedHandler);
      node.removeListener('child', childHandler);
    }
  };

  var streamClosed = responder.on('streamClosed', closedHandler);

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

  if(!_.isNull(node.onInvoke)) {
    try {
    var stream = node.onInvoke(req.params);

    if(!(stream instanceof Stream)) {
      // fallback
      if(!_.isNull(stream)) {
        if(_.typeOf(stream) !== 'array')
          stream = [stream];
        stream = new Stream(stream, {}, true);
      } else {
        stream = new Stream.closed();
      }
    }

    return stream;
    } catch(e) {
      if(e instanceof DSError) {
        return new Stream.closed(e);
      }
    }
  }

  return new Stream.closed();
};

Method.subscribe = function(responder, req) {
  _.each(req.paths, function(path) {
    responder.streamResponse(0).addNode(responder, path);
  });

  return new Stream.closed();
};

Method.unsubscribe = function(responder, req) {
  _.each(req.sids, function(sid) {
    responder.streamResponse(0).removeNode(sid);
  });

  return new Stream.closed();
};

Method.close = function(responder, req) {
  if(req.rid !== 0 && responder.streamResponse(req.rid)) {
    responder.streamResponse(req.rid).close();
  }
  return new Stream.closed();
};

module.exports = {
  Method: Method
};
