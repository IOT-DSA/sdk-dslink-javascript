var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    bignum = require('bignum'),
    curve = require('dhcurve'),
    Client = require('./client.js').Client,
    NamedCurve = curve.NamedCurve,
    _ = require('../../internal.js');

function HandshakeClient(name, hostname, cb) {
  Client.call(this);

  this.hostname = hostname;

  curve.generateKeyPair(NamedCurve.P256).then(function(keys) {
    this.__priv__.publicKey = keys.publicKey;
    this.__priv__.privateKey = keys.privateKey;

    var hash = crypto.createHash('sha256');
    hash.update(keys.publicKey.getEncoded());

    this.dsId = 'link-' + name + '-' + _.replaceAll(_.Base64.urlSafe(hash.digest()), '=', '');
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
        'Content-Type': 'application/json',
        'Content-Length': connDetails.length
      }
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
  }.bind(this)).catch(function(e) {
    console.log(e);
  });
}

_.inherits(HandshakeClient, Client);

module.exports = {
  HandshakeClient: HandshakeClient
};
