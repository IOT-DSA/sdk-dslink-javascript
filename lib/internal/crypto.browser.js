module.exports = {
  createHash: function(name) {
    return require('hash.js')[name]();
  }
};
