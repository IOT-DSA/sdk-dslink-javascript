var _ = require('./internal');

var ValueType = {
  DYNAMIC: 'dynamic',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'bool',
  LIST: 'list',
  MAP: 'map'
};

function determineType(value) {
  var types = {
    'string': ValueType.STRING,
    'number': ValueType.NUMBER,
    'boolean': ValueType.BOOLEAN,
    'array': ValueType.LIST,
    'object': ValueType.MAP
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

Value.prototype.isValid = function(type) {
  return determineType(this.value) === this.type && (this.type === type || type === ValueType.DYNAMIC);
};

Value.prototype.toString = function() {
  return this.value.toString();
};

module.exports = {
  'Value': Value,
  'ValueType': Object.freeze(ValueType)
};
