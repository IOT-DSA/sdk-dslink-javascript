var _ = require('./internal.js');

var ValueType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
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

  throw ('Unsupported Type: ' + type);
}

function Value(value, obj) {
  obj = obj || {};

  this.value = value;
  this.type = obj.type || determineType(value);
  this.timestamp = obj.timestamp || new Date();
  this.status = obj.status || 'ok';
  
  return Object.freeze(this);
}

Value.prototype.toString = function() {
  return this.value.toString();
};

Value.prototype.isNull = function() {
  return this.type === ValueType.NULL;
};

Value.prototype.isOk = function() {
  return this.status === 'ok';
};

module.exports = {
  'Value': Value,
  'ValueType': Object.freeze(ValueType)
};
