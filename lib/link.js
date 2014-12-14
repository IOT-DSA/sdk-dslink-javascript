var WebSocketClient = require('websocket').client;
var _ = require("./util.js");

function DSLink(name) {
  // 'private' variables go here.
  var conn;

  var instance = {
    'name': name,

    'connect': function(host, cb) {
      if(_.isUndefined(conn))
        cb("Link is already connected to a broker. Use Link.disconnect() and try to connect again.");

      var sock = new WebSocketClient();

      sock.on('connectFailed', function(err) {
        cb(err);
      });

      sock.on('connect', function(_conn) {
        conn = _conn;

        // connection junk here
        // TODO: remove above comment

        cb();
      });

      var url = 'ws://' + host + '/wstunnel?' + name;
      socket.connect(url);
    },

    'disconnect': function() {
      if(!_.isUndefined(conn)) {
        conn.close();
        return true;
      }
      return false;
    }
  };

  // init goes here.

  // essentially makes the instance immutable
  return Object.freeze(instance);
}

module.exports = {
  'Link': DSLink
};
