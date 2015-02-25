var crypto = require('crypto'),
    handshake = require('./handshake.js'),
    WebSocket = require('websocket').w3cwebsocket,
    Client = require('./client.js').Client,
    _ = require('../../internal/util.js');

var global = function() {
  return this;
}();

function sha256(buf) {
  var sha = crypto.createHash('sha256');
  sha.update(buf);
  return sha.digest();
}

function parseData(data) {
  console.log('received:' + data);
  data = JSON.parse(data);

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

function WebSocketClient(name, hostname, keys) {
  Client.call(this);
  handshake.call(this, name, hostname, keys, function(data) {
    var hash = sha256(_.Buffer.merge(new Buffer(this.__priv__.salt, 'utf8'), this.__priv__.sharedSecret));
    hash = _.replaceAll(_.Base64.urlSafe(hash), '=', '');

    var path = _.replaceAll(this.hostname, {
      'https': 'wss',
      'http': 'ws'
    }) + data.wsUri + '?dsId=' +
         this.dsId + '&auth=' + hash;

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
      var data;

      if(message.data instanceof String) {
        data = message.data;
      }

      if(!_.isNull(global.Blob) && message.data instanceof global.Blob) {
        var reader = new FileReader();
        reader.onload = function() {
          parseData.call(this, reader.result);
        }.bind(this);
        reader.readAsText(message.data);
      }

      if(message.data instanceof ArrayBuffer) {
        data = String.fromCharCode.apply(null, new Uint8Array(message.data));
      }

      if(!_.isNull(data)) {
        parseData.call(this, data);
      }
    }.bind(this);
  }.bind(this));
}

_.inherits(WebSocketClient, Client);

WebSocketClient.prototype.sendMessage = function(message) {
  if(_.isNull(this.__priv__.conn) || this.__priv__.conn.readyState !== this.__priv__.conn.OPEN)
    return;

  var requests = [];
  var responses = [];

  if(!_.isNull(message.requests))
    requests = requests.concat(message.requests);
  if(!_.isNull(message.responses))
    responses = responses.concat(message.responses);

  var map = {};
  if(requests.length > 0)
    map.requests = requests;
  if(responses.length > 0)
    map.responses = responses;

  console.log('sent:' + JSON.stringify(map));
  this.__priv__.conn.send(new Buffer(JSON.stringify(map)));
};

module.exports = {
  WebSocketClient: WebSocketClient
};
