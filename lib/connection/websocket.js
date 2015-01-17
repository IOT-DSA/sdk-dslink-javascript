var Connection = require('./connection.js').Connection,
    _ = require('../internal.js');

function WebSocketConnection() {
}

_.inherits(WebSocketConnection, Connection);

module.exports = {
  WebSocketConnection: WebSocketConnection
};
