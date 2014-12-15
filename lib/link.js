var WebSocketClient = require('websocket').client,
    _ = require("./internal.js");

var methods = {
  // TODO: Implement methods.
};

function DSLink(name) {
  // 'private' variables go here.
  this.__priv__ = {};
  his.__priv__.conn = null;
  this.name = name;

  return Object.freeze(this);
}

DSLink.prototype.connect = function(host, cb) {
  if(_.isNull(conn))
  cb("Link is already connected to a broker. Use Link.disconnect() and try to connect again.");

  var sock = new WebSocketClient({
    'keepalive': true,
    'keepaliveInterval': 10000 // 10 seconds
  });

  sock.on('connectFailed', function(err) {
    cb(err);
  });

  sock.on('connect', function(conn) {
    this.__priv__.conn = conn;

    this.__priv__.conn.on('error', function(err) {
      this.__priv__.conn = undefined;
    });

    this.__priv__.conn.on('close', function() {
      this.__priv__.conn = null;
    });

    this.__priv__.conn.on('message', function(req) {
      if (req.type === 'utf8') {
        var message = req.utf8Data;
        this.handleMessage(message);
      }
    });

    cb();
  });

  var url = 'ws://' + host + '/wstunnel?' + name;
  socket.connect(url);
};

DSLink.prototype.disconnect = function() {
  if(!_.isNull(this.__priv__.conn) && this.__priv__.conn.connected) {
    this.__priv__.conn.close();
    return true;
  }
  return false;
};

DSLink.prototype.handleMessage = function(message) {
  var json = JSON.parse(message);

  json.requests.forEach(function(req) {
    var method = req.method;
    method = method === null || method === undefined ? "" : method;

    if(!_.isNull(methods[method])) {
      // TODO: Make this part more robust.
      // Going to do node.js first.
      methods[method]();
    }
  });
};

module.exports = {
  'Link': DSLink
};
