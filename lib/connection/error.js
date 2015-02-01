var _ = require('../internal.js');

function DSError(type, opt) {
  opt = opt || {};
  opt.phase = opt.phase || 'request';

  _.mixin(this, {
    type: type
  }, opt);
}

DSError.prototype.getMessage = function() {
  return this.msg || _.String.title(this.type) || 'Error';
};

var Errors = {
  PERMISSION_DENIED: new DSError('permissionDenied'),
  INVALID_METHOD: new DSError('invalidMethod'),
  INVALID_PATH: new DSError('invalidPath'),
  INVALID_PATHS: new DSError('invalidPaths'),
  INVALID_VALUE: new DSError('invalidValue')
};

module.exports = {
  Error: DSError,
  Errors: Errors
};
