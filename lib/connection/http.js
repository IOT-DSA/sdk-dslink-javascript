var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    ursa = require('ursa'),
    connection = require('./connection.js'),
    Client = connection.Client,
    EventEmitter = require('eventemitter2').EventEmitter2,
    _ = require('../internal.js');

// adds 0 to the Buffer, tells BigInteger that the number is positive
function addExtraByte(buf) {
  var nbuf = new Buffer(257);
  nbuf[0] = 0;
  buf.copy(nbuf, 1, 0, 256);
  return nbuf;
}

function HttpClient(name, hostname) {
  Client.call(this);

  this.hostname = hostname;

  var keys = ursa.generatePrivateKey();

  this.privateObj = ursa.createPrivateKey(keys.toPrivatePem('base64'), '', 'base64');
  this.publicObj = ursa.createPublicKey(keys.toPublicPem('base64'), 'base64');

  var hash = crypto.createHash('sha256');
  hash.update(addExtraByte(this.publicObj.getModulus()));

  var result = hash.digest('base64');
  this.dsId = "link-" + name + "-" + _.replaceAll(_.Base64.urlSafe(result), '=', '');
  this.publicKey = _.Base64.urlSafe(addExtraByte(this.publicObj.getModulus()).toString('base64'));

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
    res.on('data', function(buf) {
      var data = JSON.parse(buf.toString());

      this.__priv__.pollerInterval = data.updateInterval;
      this.__priv__.salt = data.salt;
      // this.__priv__.nonce = this.privateObj.decrypt(data.encryptedNonce, 'base64', 'binary');
      // this.__priv__.poller.poll(this.__priv__.pollerInterval);
    }.bind(this));
  }.bind(this));

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
