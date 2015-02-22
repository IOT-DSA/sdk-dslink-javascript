var _ = require('./lib/internal/util.js');

if(typeof window !== 'undefined' &&
    (typeof Promise === 'undefined' ||
    typeof Uint8Array === 'undefined' ||
    typeof window.crypto === 'undefined' ||
    typeof window.crypto.subtle === 'undefined')) {
  throw "Unsupported browser";
}

module.exports = _.mixin({},
  require('./lib/connection/error.js'),
  require('./lib/connection/client/websocket.js'),
  require('./lib/connection/client/http.js'),
  require('./lib/connection/client/client.js'),
  require('./lib/connection/server/websocket.js'),
  require('./lib/connection/server/http.js'),
  require('./lib/responder/responder.js'),
  require('./lib/link/link.js'),
  require('./lib/value.js'),
  require('./lib/node.js'),
  require('./lib/util.js'));
