var crypto = require('crypto'),
    WebSocket = require('websocket').w3cwebsocket,
    HandshakeClient = require('./handshake.js').HandshakeClient,
    _ = require('../../internal.js');

function WebSocketClient(name, hostname) {
  HandshakeClient.call(this, name, hostname, function(data) {
    var auth = crypto.createHash('sha256');
    auth.update(_.Buffer.merge(new Buffer(this.__priv__.salt, 'utf8'), this.__priv__.sharedSecret));

    auth = _.replaceAll(_.Base64.urlSafe(auth.digest('base64')), '=', '');

    var path = _.replaceAll(_.replaceAll(this.hostname, 'https', 'wss'), 'http', 'ws') +
        data.wsUri + '?dsId=' +
        this.dsId + '&auth=' + auth;

    this.__priv__.conn = new WebSocket(path);

    this.__priv__.conn.onopen = function() {
      this.__priv__.poller.poll(this.__priv__.pollerInterval);
    }.bind(this);

    this.__priv__.conn.onclose = function() {
      this.__priv__.poller.cancel();
      this.__priv__.conn = null;
    }.bind(this);

    this.__priv__.conn.onerror = function() {
      this.__priv__.poller.cancel();
      this.__priv__.conn = null;
    }.bind(this);

    this.__priv__.conn.onmessage = function(message) {
      if(_.typeOf(message.data) === 'string') {
        var data = JSON.parse(message.data);

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
      }
    }.bind(this);
  }.bind(this));
}

_.inherits(WebSocketClient, HandshakeClient);

WebSocketClient.prototype.sendMessages = function(messages) {
  if(_.isNull(this.__priv__.conn) || this.__priv__.conn.readyState !== this.__priv__.conn.OPEN)
    return;

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

  this.__priv__.conn.send(JSON.stringify(map));
};

module.exports = {
  WebSocketClient: WebSocketClient
};