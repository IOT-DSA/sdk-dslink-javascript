var _ = require("./lib/util.js");

module.exports = _.merge(
  require('./lib/link.js'),
  require('./lib/value.js'),
  require('./lib/node.js'));
