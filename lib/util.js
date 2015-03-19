var curve = require('dhcurve'),
    _ = require('./internal');

function Poller(cb) {
  // 'private' variables go here.

  this._timer = null;

  this.cb = cb;

  return Object.freeze(this);
}

Poller.prototype.poll = function(duration) {
  if(!_.isNull(this._timer)) {
  	throw new Error('Poller already started');
  }

  this._timer = setInterval(this.cb, duration);
};

Poller.prototype.cancel = function() {
  if(!_.isNull(this._timer)) clearInterval(this._timer);
  this._timer = null;
};

var Duration = {
  'milliseconds': function(duration) {
    return duration;
  },
  'seconds': function(duration) {
    return duration * 1000;
  },
  'minutes': function(duration) {
    return duration * 60000;
  },
  'hours': function(duration) {
    return duration * 3600000;
  },
  'days': function(duration) {
    return duration * 86400000;
  },
  'weeks': function(duration) {
    return duration * 604800000;
  },
  'months': function(duration) {
    return duration * 2419200000;
  },
  'years': function(duration) {
    return duration * 29030400000;
  }
};
Duration.none = 0;

var ECDH = {
  importKey: function(string) {
    var privateKey;
    var publicKey;

    if(string.indexOf(' ') !== -1) {
      var parts = string.split(' ');

      privateKey = new curve.PrivateKey(curve.NamedCurve.P256, new Buffer(parts[0], 'base64'));
      publicKey = curve.Point.fromEncoded(curve.NamedCurve.P256, new Buffer(parts[1], 'base64'));
    } else {
      privateKey = new curve.PrivateKey(curve.NamedCurve.P256, new Buffer(string, 'base64'));
      publicKey = privateKey.getPublicKey();
    }

    return {
      publicKey: publicKey,
      privateKey: privateKey
    };
  }
};

module.exports = {
  'Poller': Poller,
  'Duration': Duration,
  'ECDH': ECDH
};
