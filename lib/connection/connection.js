var EventEmitter = require('eventemitter2').EventEmitter2,
    _ = require('../internal.js');

function Connection() {
}

_.inherits(Connection, EventEmitter);

Connection.prototype.send = function() {
  
};

module.exports = {
  Connection: Connection
};
