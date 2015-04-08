var _ = require('../internal');

function DSError(opt) {
  opt = opt || {};
  opt.phase = opt.phase || 'request';

  _.mixin(this, opt);
}

DSError.prototype.getMessage = function() {
  return this.msg || !_.isNull(this.type) ? _.String.title(this.type) : 'Error';
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
