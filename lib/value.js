var _ = require('./internal');

var ValueType = {
  DYNAMIC: 'dynamic',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'bool',
  LIST: 'list',
  MAP: 'map',
  ENUM: function() {
    return 'enum[' + _.args(arguments).join(',') + ']';
  }
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
  if(this.type.indexOf('enum') !== -1) {
    return _.typeOf(this.value) === 'string' && type.indexOf('enum') !== -1 &&
        type.substring(5).split(',').indexOf(this.value) !== -1 &&
        this.type.substring(5).split(',').indexOf(this.value) !== -1;
  }
  return determineType(this.value) === this.type && (this.type === type || type === ValueType.DYNAMIC);
};

Value.prototype.toString = function() {
  return this.value.toString();
};

module.exports = {
  'Value': Value,
  'ValueType': Object.freeze(ValueType)
};
