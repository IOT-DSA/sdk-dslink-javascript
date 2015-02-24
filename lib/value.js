var _ = require('./internal/util.js');

var ValueType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'bool',
  NULL: 'null'
};

function determineType(value) {
  var types = {
    'number': ValueType.NUMBER,
    'string': ValueType.STRING,
    'boolean': ValueType.BOOLEAN,
    'undefined': ValueType.NULL,
    'null': ValueType.NULL
  };

  var type = _.typeOf(value);

  if(types[type] !== undefined)
    return types[type];

  throw new Error('Unsupported Type: ' + type);
}

function Value(value, opt) {
  opt = opt || {};

  this.value = value;
  this.type = opt.type || determineType(value);
  this.timestamp = opt.timestamp || new Date();

  return Object.freeze(this);
}

Value.prototype.isValid = function() {
  return determineType(this.value) === this.type;
};

Value.prototype.toString = function() {
  return this.value.toString();
};

module.exports = {
  'Value': Value,
  'ValueType': Object.freeze(ValueType)
};
