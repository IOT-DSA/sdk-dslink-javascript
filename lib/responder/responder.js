var _ = require('../internal.js'),
    error = require('./error.js'),
    Method = {};

var StreamState = {
  INIT: 'initialize',
  OPEN: 'open',
  CLOSED: 'closed'
}

Method.list = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return error("node doesn't exist", {
      path: req.path
    });
  }
};

Method.set = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return error("node doesn't exist", {
      path: req.path
    });
  }
};

Method.remove = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return error("node doesn't exist", {
      path: req.path
    });
  }
};

Method.invoke = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return error("node doesn't exist", {
      path: req.path
    });
  }
};

Method.subscribe = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return error("node doesn't exist", {
      path: req.path
    });
  }
};

Method.unsubscribe = function(responder, req) {
  var node;
  try {
    node = responder.provider.resolvePath(req.path);
  } catch(e) {
    return error("node doesn't exist", {
      path: req.path
    });
  }
};

Method.close = function(responder, req) {
  delete responder.__priv__.streamWatcher[req.rid];
  return {
    "stream": StreamState.CLOSED
  };
};

function Responder(conn, provider) {
  this.__priv__ = {
    streamWatcher: {}
  };

  this.conn = conn;
  this.provider = provider;

  conn.on('message', this.handleMessage);
}

Responder.prototype.handleMessage = function(message) {
  var json = JSON.parse(message);

  _.each(json.requests, function(req) {
    var method = req.method;
    method = method === null || method === undefined ? "" : method;

    if(!_.isNull(Method[method])) {
      var res = Method[method](this, req);

      if(!_.isNull(res)) {
        res.rid = req.rid;
        res.method = req.method;

        conn.send({
          responses: res
        });
      }
    }
  }, this);
};

module.exports = {
  Responder: Responder
};
