var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    HandshakeClient = require('./handshake.js').HandshakeClient,
    _ = require('../../internal.js');

function HttpClient(name, hostname) {
  HandshakeClient.call(this, name, hostname, function(data) {
    this.__priv__.httpUri = data.httpUri;
    this.__priv__.poller.poll(this.__priv__.pollerInterval);
  }.bind(this));
}

_.inherits(HttpClient, HandshakeClient);

HttpClient.prototype.sendMessages = function(messages) {
  var map = {
    requests: [],
    responses: []
  };

  _.each(messages, function(message) {
    if(!_.isNull(message.responses))
      map.responses = map.responses.concat(message.responses);
    if(!_.isNull(message.requests))
      map.requests = map.requests.concat(message.requests);
  });

  map = JSON.stringify(map);

  var auth = crypto.createHash('sha256');
  auth.update(_.Buffer.merge(new Buffer(this.__priv__.salt, 'utf8'), this.__priv__.nonce));

  var isHttps = url.parse(this.hostname).protocol.indexOf('https') >= 0;

  var req = (isHttps ? https : http).request({
    hostname: url.parse(this.hostname).hostname,
    port: url.parse(this.hostname).port || (isHttps ? 443 : 80),
    path: this.__priv__.httpUri +
        '?dsId=' + this.dsId +
        '&auth=' + _.Base64.urlSafe(auth.digest('base64')),
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
        _.each(data.responses, function(res) {
          this.emit('response', res);
        }, this);
      }

      if(!_.isNull(data.requests)) {
        _.each(data.requests, function(req) {
          this.emit('request', req);
        }, this);
      }
    }.bind(this));
  }.bind(this));

  req.write(map);
  req.end();
};

module.exports = {
  HttpClient: HttpClient
};
