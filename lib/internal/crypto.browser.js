var crypto = window.crypto.subtle,
    _ = require('goal');

// Buffers are of Uint8Array in browser. Because that's how Browserify rolls.
function sha256(buffer, outEncoding) {
  return crypto.digest('SHA-256', buffer).then(function(data) {
    return new Buffer(data);
  });
}

module.exports = {
  sha256: sha256
};
