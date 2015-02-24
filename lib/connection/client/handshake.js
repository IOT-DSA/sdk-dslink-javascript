var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    curve = require('dhcurve'),
    NamedCurve = curve.NamedCurve,
    _ = require('../../internal/util.js');

function sha256(buf) {
  var sha = crypto.createHash('sha256');
  sha.update(buf);
  return sha.digest();
}

module.exports = function handshake(name, hostname, keys, cb) {
  keys = keys || curve.generateKeyPair(NamedCurve.P256);

  this.hostname = hostname;
  this.keys = keys;

  var hash = sha256(keys.publicKey.getEncoded());
  hash = _.Base64.urlSafe(hash);

  this.dsId = 'link-' + name + '-' + _.replaceAll(hash, '=', '');

  // TODO: Make this not hardcoded.
  var connDetails = JSON.stringify({
    publicKey: _.Base64.urlSafe(keys.publicKey.getEncoded()),
    isRequester: false,
    isResponder: true
  });

  var isHttps = url.parse(this.hostname).protocol.indexOf('https') >= 0;

  var req = (isHttps ? https : http).request({
    hostname: url.parse(this.hostname).hostname,
    port: url.parse(this.hostname).port ||
          (isHttps ? 443 : 80),
    path: '/conn?dsId=' + this.dsId,
    method: 'POST',
    headers: {
      'Content-Length': connDetails.length
    },
    // weird http-browserify default
    withCredentials: false
  }, function(res) {
    res.on('data', function(buf) {
      var data = JSON.parse(buf.toString());

      this.__priv__.pollerInterval = data.updateInterval || 200;
      this.__priv__.salt = data.salt;

      var tempKey = new Buffer(data.tempKey, 'base64');
      this.__priv__.sharedSecret = this.keys.privateKey.getSharedSecret(curve.Point.fromEncoded(NamedCurve.P256, tempKey));
      cb(data);
    }.bind(this));
  }.bind(this));

  req.write(connDetails);
  req.end();
};
