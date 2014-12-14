var WebSocketClient = require('websocket').client,
    _ = require("./util.js");

var methods = {
  // TODO: Implement methods.
};

function DSLink(name) {
  // 'private' variables go here.
  var _conn;

  var instance = {
    'name': name,

    'connect': function(host, cb) {
      if(_.isUndefined(conn))
        cb("Link is already connected to a broker. Use Link.disconnect() and try to connect again.");

      var sock = new WebSocketClient({
        'keepalive': true,
        'keepaliveInterval': 10000 // 10 seconds
      });

      sock.on('connectFailed', function(err) {
        cb(err);
      });

      sock.on('connect', function(conn) {
        _conn = conn;

        _conn.on('error', function(err) {
          _conn = undefined;
        });

        _conn.on('close', function() {
          _conn = undefined;
        });

        _conn.on('message', function(req) {
          if (req.type === 'utf8') {
            var message = req.utf8Data;
            DSLink.prototype.handleMessage(message);
          }
        });

        cb();
      });

      var url = 'ws://' + host + '/wstunnel?' + name;
      socket.connect(url);
    },

    'disconnect': function() {
      if(!_.isUndefined(_conn) && _conn.connected) {
        _conn.close();
        return true;
      }
      return false;
    }
  };

  // init goes here.

  // essentially makes the instance immutable
  return Object.freeze(instance);
}

DSLink.prototype.handleMessage = function(message) {
  var json = JSON.parse(message);

  json.requests.forEach(function(req) {
    var method = req.method;
    method = method === null || method === undefined ? "" : method;

    if(!_.isUndefined(methods[method])) {
      // TODO: Make this part more robust.
      // Going to do node.js first.
      methods[method]();
    }
  });
};

module.exports = {
  'Link': DSLink
};
