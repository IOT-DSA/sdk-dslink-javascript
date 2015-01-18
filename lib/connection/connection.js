var url = require('url'),
    http = require('http'),
    https = require('https'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    Poller = require('../util.js').Poller,
    _ = require('../internal.js');

var servers = {};

function handleRequest(host, req, res) {
  if(!_.isNull(servers[host].paths[res.url])) {
    servers[host].paths[res.url](req, res);
    return;
  }

  res.writeHead(404);
}

function hostServer(host, key, cert, port, httpsPort) {
  host = url.parse(host).hostname;
  port = port || 8080;
  httpsPort = httpsPort || 8443;

  if(_.isNull(servers[host])) {
    servers[host] = {
      paths: {},
      http: http.createServer(function(req, res) {
        handleRequest(host, req, res);
      })
    };

    if(!_.isNull(key) && !_.isNull(cert)) {
      servers[host].https = https.createServer({
        key: key,
        cert: cert
      }, function(req, res) {
        handleRequest(host, req, res);
      });
      servers[host].https.listen(httpsPort, host);
    }

    servers[host].http.listen(port, host);
  }
}

function addServer(host, path, cb) {
  host = url.parse(host).hostname;

  if(!_.isNull(servers[host])) {
    servers[host].paths[path] = cb;
    return true;
  }
  return false;
}

function Client() {
  EventEmitter.call(this);
  this.__priv__ = {
    sendQueue: [],
    pollerInterval: 100,
    poller: new Poller(function() {
      this.handleSendQueue(2);
    }.bind(this))
  };
}

_.inherits(Client, EventEmitter);

Client.prototype.send = function(message) {
  this.__priv__.sendQueue.push(message);
};

module.exports = {
  Client: Client,
  hostServer: hostServer,
  addServer: addServer
};
