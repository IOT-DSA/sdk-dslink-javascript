var _ = require('./lib/internal');

if(typeof Uint8Array === 'undefined') {
  throw new Error('Unsupported browser');
}

module.exports = _.mixin({},
  require('./lib/connection/client/websocket.js'),
  require('./lib/connection/client/client.js'),
  require('./lib/connection/server/websocket.js'),
  require('./lib/requester/requester.js'),
  require('./lib/responder/responder.js'),
  require('./lib/responder/stream.js'),
  require('./lib/link/link.js'),
  require('./lib/error.js'),
  require('./lib/value.js'),
  require('./lib/node.js'),
  require('./lib/provider.js'),
  require('./lib/util.js'));
