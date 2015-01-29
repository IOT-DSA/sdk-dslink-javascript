var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    bignum = require('bignum'),
    ursa = require('ursa'),
    Client = require('./client.js').Client,
    _ = require('../internal.js');

function decryptNonce(privateKey, encryptedNonce) {
  var modulus = bignum.fromBuffer(privateKey.getModulus());
  var nonce = bignum.fromBuffer(new Buffer(encryptedNonce, 'base64').slice(1));

  nonce = nonce.pow(65537);
  nonce = nonce.mod(modulus);
  nonce = nonce.toBuffer();

  if(nonce.length < 16) {
    var buf = new Buffer(16);
    nonce.copy(buf, 16 - nonce.length);
    return buf;
  }

  if(nonce.length > 16) {
    return nonce.slice(nonce.length - 16);
  }

  return nonce;
}

function HandshakeClient(name, hostname, cb) {
  Client.call(this);

  this.hostname = hostname;

  var keys = ursa.generatePrivateKey();

  this.__priv__.privateObj = ursa.createPrivateKey(keys.toPrivatePem('base64'), '', 'base64');
  this.__priv__.publicObj = ursa.createPublicKey(keys.toPublicPem('base64'), 'base64');

  var hash = crypto.createHash('sha256');
  hash.update(this.__priv__.publicObj.getModulus());

  this.dsId = "link-" + name + "-" + _.replaceAll(_.Base64.urlSafe(hash.digest('base64')), '=', '');
  this.publicKey = _.Base64.urlSafe(this.__priv__.publicObj.getModulus().toString('base64'));

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

      this.__priv__.pollerInterval = data.updateInterval || 200;
      this.__priv__.salt = data.salt;
      this.__priv__.nonce = decryptNonce(this.__priv__.privateObj, data.encryptedNonce);

      cb(data);
    }.bind(this));
  }.bind(this));

  req.write(connDetails);
  req.end();
}

_.inherits(HandshakeClient, Client);

module.exports = {
  HandshakeClient: HandshakeClient
};
