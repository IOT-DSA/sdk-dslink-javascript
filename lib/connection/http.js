var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    ursa = require('ursa'),
    connection = require('./connection.js'),
    Client = connection.Client,
    EventEmitter = require('eventemitter2').EventEmitter2,
    _ = require('../internal.js');

function HttpClient(name, hostname, cb) {
  Client.call(this);

  this.hostname = hostname;

  var keys = ursa.generatePrivateKey();

  this.privateObj = ursa.createPrivateKey(keys.toPrivatePem('base64'), '', 'base64');
  this.publicObj = ursa.createPublicKey(keys.toPublicPem('base64'), 'base64');

  var hash = crypto.createHash('sha384');
  hash.update(this.publicObj.getModulus());

  this.dsId = "link-" + name + "-" + _.Base64.urlSafe(hash.digest('base64'));
  this.publicKey = _.Base64.urlSafe(_.Buffer.extraByte(this.publicObj.getModulus()).toString('base64'));

  // TODO: Make this not hardcoded.
  var connDetails = JSON.stringify({
    publicKey: this.publicKey,
    isRequester: false,
    isResponder: true
  });

  var req = (url.parse(this.hostname).protocol.indexOf('https') >= 0 ? https : http).request({
    hostname: url.parse(this.hostname).hostname,
    port: url.parse(this.hostname).port || (url.parse(this.hostname).protocol.indexOf('https') >= 0 ? 443 : 80),
    path: '/conn?dsId=' + this.dsId,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': connDetails.length
    }
  }, function(res) {
    var data = "";

    res.on('data', function(buf) {
      data += buf.toString();
    });

    res.on('close', function() {
      data = JSON.parse(data);

      this.__priv__.pollerInterval = data.updateInterval;
      this.__priv__.salt = data.salt;
      this.__priv__.nonce = this.privateObj.decrypt(data.encryptedNonce, 'base64', 'binary');

      cb();
      // this.__priv__.poller.poll(this.__priv__.pollerInterval);
    });
  });

  req.write(connDetails);
  req.end();
}

_.inherits(HttpClient, Client);

HttpClient.prototype.handleSendQueue = function(limit) {
  (url.parse(this.hostname).protocol.indexOf('https') !== 0 ? https : http)
};

function HttpServer() {
}

_.inherits(HttpServer, EventEmitter);

module.exports = {
  HttpClient: HttpClient,
  HttpServer: HttpServer
};
