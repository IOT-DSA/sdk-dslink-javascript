var _ = require('../internal.js');

module.exports = function DSAError(msg, opt) {
  opt.phase = opt.phase || "request";

  return _.mixin({
    msg: msg
  }, opt);
};
