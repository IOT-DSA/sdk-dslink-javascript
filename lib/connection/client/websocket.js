var global = function() {
  return this;
}();

var crypto = require('crypto'),
    url = require('url'),
    handshake = require('./handshake.js'),
    util = require('../../util.js'),
    Poller = util.Poller,
    Duration = util.Duration,
    WebSocket = require('websocket').w3cwebsocket,
    Client = require('./client.js').Client,
    Promise = Promise || require('es6-promises'),
    _ = require('../../internal');

function _parseData(data) {
  console.log('received:' + data);
  data = JSON.parse(data);

  if(!_.isNull(data.responses)) {
    _.each(data.responses, function(res) {
      // TODO
    }, this);
  }

  if(!_.isNull(data.requests)) {
    _.each(data.requests, function(req) {
      if(this.responder !== null) {
        this.responder.handleRequest(req);
      }
    }, this);
  }
}

function WebSocketClient(name) {
  Client.call(this, _.args(arguments));

  this.name = name;

/*
  this._pingCount = 0;
  this._tick = new Poller(function() {
    console.log("piny" + this._pingCount);
    this._conn.send(new Buffer(JSON.stringify({
      ping: ++this._pingCount
    })));
  });
  */
}

_.inherits(WebSocketClient, Client);

WebSocketClient.prototype.connect = function(opt) {
  opt = _.typeOf(opt) === 'object' ? opt : {
    hostname: opt
  };

  _.mixin(opt, {
    responder: this.responder !== null,
    requester: this.requester !== null
  });

  return handshake.call(this, opt).then(function(data) {
    return new Promise(function(resolve, reject) {
      var hash = _.sha256(_.Buffer.merge(new Buffer(this._salt, 'utf8'), this._sharedSecret));
      hash = _.replaceAll(_.Base64.urlSafe(hash), '=', '');

      var hosturl = url.parse(opt.hostname);
      var isHttps = hosturl.protocol.indexOf('https') >= 0;
      var protocol = _.replaceAll(hosturl.protocol, {
        https: 'wss',
        http: 'ws'
      });

      var path = protocol + '//' + hosturl.hostname + ':' + (hosturl.port || (isHttps ? 443 : 80)) + data.wsUri + '?dsId=' + this.dsId + '&auth=' + hash;

      this._conn = new WebSocket(path);

      this._conn.onopen = function() {
        this._conn.send(new Buffer('{}'));
        this._poller.poll(this._pollerInterval);
        // this._tick.poll(Duration.seconds(20));
        resolve(this);
      }.bind(this);

      this._conn.onclose = function() {
        this._poller.cancel();
        // this._tick.cancel();
        this._conn = null;
      }.bind(this);

      this._conn.onerror = function() {
        this._poller.cancel();
        // this._tick.cancel();
        this._conn = null;
        reject();
      }.bind(this);

      this._conn.onmessage = function(message) {
        var data;

        if(message.data instanceof String) {
          data = message.data;
        }

        if(!_.isNull(global.Blob) && message.data instanceof global.Blob) {
          var reader = new FileReader();
          reader.onload = function() {
            _parseData.call(this, reader.result);
          }.bind(this);
          reader.readAsText(message.data);
        }

        if(message.data instanceof ArrayBuffer) {
          data = String.fromCharCode.apply(null, new Uint8Array(message.data));
        }

        if(!_.isNull(data)) {
          _parseData.call(this, data);
        }
      }.bind(this);
    }.bind(this));
  }.bind(this));
};

WebSocketClient.prototype.sendMessage = function(message) {
  if(_.isNull(this._conn) || this._conn.readyState !== this._conn.OPEN)
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
  this._conn.send(new Buffer(JSON.stringify(map)));
};

module.exports = {
  WebSocketClient: WebSocketClient
};
