var sjcl = require('dhcurve/vendor/sjcl');

module.exports = {
  randomBytes: function() {
    var buf = new Buffer(4);
    buf.writeUInt32BE(sjcl.random.randomWords(1, 0)[0]);
    return buf;
  },
  createHash: require('sha.js')
};
