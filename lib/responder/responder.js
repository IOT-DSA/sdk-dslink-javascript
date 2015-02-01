// jshint quotmark:false
var _ = require('../internal.js'),
    error = require('./error.js'),
    SteamState = require('./stream.js').StreamState,
    Method = {};

Method.list = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return _.mixin({}, e, {
      path: req.path
    });
  }
};

Method.set = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return _.mixin({}, e, {
      path: req.path
    });  }
};

Method.remove = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return _.mixin({}, e, {
      path: req.path
    });
  }
};

Method.invoke = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return _.mixin({}, e, {
      path: req.path
    });  }
};

Method.subscribe = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return _.mixin({}, e, {
      path: req.path
    });  }
};

Method.unsubscribe = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return _.mixin({}, e, {
      path: req.path
    });  }
};

Method.close = function(responder, req) {
  delete responder.__priv__.streamWatcher[req.rid];
  return {
    "stream": StreamState.CLOSED
  };
};

function Responder(client, provider) {
  this.__priv__ = {
    streamWatcher: {}
  };

  this.client = client;
  this.provider = provider;

  client.on('request', this.handleRequest);
}

Responder.prototype.handleRequest = function(req) {
  var json = JSON.parse(req);

  _.each(json.requests, function(req) {
    var method = req.method;
    method = method === null || method === undefined ? "" : method;

    if(!_.isNull(Method[method])) {
      var res = Method[method](this, req);

      if(!_.isNull(res)) {
        res.rid = req.rid;
        res.method = req.method;

        this.client.send({
          responses: res
        });
      }
    }
  }, this);
};

module.exports = {
  Responder: Responder
};
