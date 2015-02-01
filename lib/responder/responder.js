var _ = require('../internal.js'),
    error = require('../connection/error.js'),
    SteamState = require('../connection/stream.js'),
    Method = {};

Method.list = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
};

Method.set = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
};

Method.remove = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
};

Method.invoke = function(responder, req) {
  var node = responder.provider.resolvePath(req.path);
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
