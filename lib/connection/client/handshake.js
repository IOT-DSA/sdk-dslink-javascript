var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    curve = require('dhcurve'),
    Promise = Promise || require('es6-promises'),
    NamedCurve = curve.NamedCurve,
    _ = require('../../internal');


module.exports = function handshake(opt) {
  return new Promise(function(resolve, reject) {
    opt.keys = opt.keys || curve.generateKeyPair(NamedCurve.P256);
    var hash = _.sha256(opt.keys.publicKey.getEncoded());
    hash = _.Base64.urlSafe(hash);

    // used for exporting/storing generated keys
    this.keys = opt.keys;
    this.dsId = 'link-' + this.name + '-' + _.replaceAll(hash, '=', '');


    // TODO: Make this not hardcoded.
    var connDetails = JSON.stringify({
      publicKey: _.Base64.urlSafe(opt.keys.publicKey.getEncoded()),
      isRequester: opt.requester,
      isResponder: opt.responder
    });

    var hosturl = url.parse(opt.hostname);
    var isHttps = hosturl.protocol.indexOf('https') >= 0;

    var req = (isHttps ? https : http).request({
      hostname: hosturl.hostname,
      port: hosturl.port || (isHttps ? 443 : 80),
      path: hosturl.pathname + '?dsId=' + this.dsId,
      method: 'POST',
      headers: {
        'Content-Length': connDetails.length
      },
      // weird http-browserify default
      withCredentials: false
    }, function(res) {
      res.on('data', function(buf) {
        var data = JSON.parse(buf.toString());

        if(!_.isNull(data.updateInterval)) {
          this._pollerInterval = data.updateInterval;
        }

        this._salt = data.salt;

        var tempKey = new Buffer(data.tempKey, 'base64');
        this._sharedSecret = opt.keys.privateKey.getSharedSecret(curve.Point.fromEncoded(NamedCurve.P256, tempKey));

        resolve(data);
      }.bind(this));
    }.bind(this));

    req.write(connDetails);
    req.end();
  }.bind(this));
};
