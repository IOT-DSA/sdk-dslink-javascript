var crypto = require('crypto'),
    Promise = Promise || require('es6-promises'),
    _ = require('goal');

// the node crypto module wasn't Promise based, and the Web Crypto API is
// hence, this.

function sha256(buffer, outEncoding) {
  return new Promise(function(complete, reject) {
    var hash = crypto.createHash('sha256');
    hash.update(buffer);

    complete(hash.digest(outEncoding));
  });
}

module.exports = {
  sha256: sha256
};
