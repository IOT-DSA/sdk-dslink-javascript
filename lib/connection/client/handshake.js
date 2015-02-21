var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    curve = require('dhcurve'),
    Client = require('./client.js').Client,
    NamedCurve = curve.NamedCurve,
    _ = require('../../internal/util.js');

function sha256(buf) {
  var sha = crypto.createHash('sha256');
  sha.update(buf);
  return sha.digest();
}

function HandshakeClient(name, hostname, cb) {
  Client.call(this);

  this.hostname = hostname;

  var keys = curve.generateKeyPair(NamedCurve.P256);

  this.__priv__.publicKey = keys.publicKey;
  this.__priv__.privateKey = keys.privateKey;

  var hash = sha256(keys.publicKey.getEncoded());
  hash = _.Base64.urlSafe(hash);

  this.dsId = 'link-' + name + '-' + _.replaceAll(hash, '=', '');
  this.publicKey = _.Base64.urlSafe(keys.publicKey.getEncoded());

  // TODO: Make this not hardcoded.
  var connDetails = JSON.stringify({
    publicKey: this.publicKey,
    isRequester: false,
    isResponder: true
  });

  var req = (url.parse(this.hostname).protocol.indexOf('https') >= 0 ? https : http).request({
    hostname: url.parse(this.hostname).hostname,
    port: url.parse(this.hostname).port ||
          (url.parse(this.hostname).protocol.indexOf('https') >= 0 ? 443 : 80),
    path: '/conn?dsId=' + this.dsId,
    method: 'POST',
    headers: {
      'Content-Length': connDetails.length
    },
    withCredentials: false
  }, function(res) {
    res.on('data', function(buf) {
      var data = JSON.parse(buf.toString());

      this.__priv__.pollerInterval = data.updateInterval || 200;
      this.__priv__.salt = data.salt;

      var tempKey = new Buffer(data.tempKey, 'base64');
      this.__priv__.sharedSecret = this.__priv__.privateKey.getSharedSecret(curve.Point.fromEncoded(NamedCurve.P256, tempKey));
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
