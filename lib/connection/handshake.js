var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    ursa = require('ursa'),
    Client = require('./client.js').Client,
    _ = require('../internal.js');

function HandshakeClient(name, hostname, cb) {
  Client.call(this);

  this.hostname = hostname;

  var keys = ursa.generatePrivateKey();

  this.privateObj = ursa.createPrivateKey(keys.toPrivatePem('base64'), '', 'base64');
  this.publicObj = ursa.createPublicKey(keys.toPublicPem('base64'), 'base64');

  var hash = crypto.createHash('sha256');
  hash.update(this.publicObj.getModulus());

  var result = hash.digest('base64');
  this.dsId = "link-" + name + "-" + _.replaceAll(_.Base64.urlSafe(result), '=', '');
  this.publicKey = _.Base64.urlSafe(this.publicObj.getModulus().toString('base64'));

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
      
      cb();
    }.bind(this));
  }.bind(this));

  req.write(connDetails);
  req.end();
}

_.inherits(HandshakeClient, Client);

module.exports = {
  HandshakeClient: HandshakeClient
};