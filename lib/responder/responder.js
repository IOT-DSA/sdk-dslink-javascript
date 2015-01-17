var method = require('./method.js'),
    Method = method.Method,
    _ = require('../internal.js');

function Responder(conn, provider) {
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

module.exports = _.mixin({
    Responder: Responder
  },
  method);
