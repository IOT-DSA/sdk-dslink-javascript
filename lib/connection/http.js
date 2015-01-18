var Client = require('../connection.js').Client,
    EventEmitter = require('eventemitter2').EventEmitter2,
    _ = require('../internal.js');

function HttpClient() {
  Client.call(this);
}

_.inherits(HttpClient, Client);

function HttpServer() {
}

_.inherits(HttpServer, EventEmitter);

module.exports = {
  HttpClient: HttpClient,
  HttpServer: HttpServer
};
