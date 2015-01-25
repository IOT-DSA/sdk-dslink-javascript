var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    HandshakeClient = require('./handshake.js').HandshakeClient,
    EventEmitter = require('events').EventEmitter,
    _ = require('../internal.js');
    
function mergeBuffers() {
  var buffers = _.args(arguments),
      length = 0;
      
  _.forEach(buffers, function(buf) {
    length += buf.length;
  });
  
  var returnBuf = new Buffer(length);
  length = 0;
  
  _.forEach(buffers, function(buf) {
    buf.copy(returnBuf, length);
    length += buf.length;
  });
  
  return returnBuf;
}

function HttpClient(name, hostname) {
  HandshakeClient.call(this, name, hostname, function(data) {
    this.__priv__.httpUri = data.httpUri;
    this.__priv__.poller.poll(this.__priv__.pollerInterval);
  }.bind(this));
}

_.inherits(HttpClient, HandshakeClient);

HttpClient.prototype.handleMessages = function(messages) {
  var map = {
    requests: [],
    responses: []
  };
  
  _.forEach(messages, function(message) {
    if(!_.isNull(message.responses))
      responses = responses.concat(message.responses);
    if(!_.isNull(message.requests))
      requests = requests.concat(message.requests);
  });
  
  map = JSON.stringify(map);
  
  var auth = crypto.createHash('sha256');
  auth.update(mergeBuffers(new Buffer(this.__priv__.salt, 'utf8'), this.__priv__.nonce));
  
  var req = (url.parse(this.hostname).protocol.indexOf('https') >= 0 ? https : http).request({
    hostname: url.parse(this.hostname).hostname,
    port: url.parse(this.hostname).port || (url.parse(this.hostname).protocol.indexOf('https') >= 0 ? 443 : 80),
    path: this.__priv__.httpUri + '?dsId=' + this.dsId + '?auth=' + _.Base64.urlSafe(auth.digest('base64')),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': map.length
    }
  }, function(res) {
    res.on('data', function(buf) {
      var data = JSON.parse(buf.toString());

      this.__priv__.salt = data.salt;
      
      if(!_.isNull(data.responses)) {
        _.forEach(data.responses, function(res) {
          this.emit('responses', res);
        }, this);
      }
      
      if(!_.isNull(data.requests)) {
        _.forEach(data.requests, function(req) {
          this.emit('request', req);
        }, this);
      }
    }.bind(this));
  }.bind(this));
  
  req.write(map);
  req.end();
};

function HttpServer() {
}

_.inherits(HttpServer, EventEmitter);

module.exports = {
  HttpClient: HttpClient,
  HttpServer: HttpServer
};
