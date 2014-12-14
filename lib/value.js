function determineType(value) {
  var types = {
    'string': ValueType.STRING,
    'boolean': ValueType.BOOLEAN,
    'undefined': ValueType.NULL
  };

  var type = typeof value;
  if(type === 'number') {
    if(value % 1 === 0)
      return ValueType.INTEGER;
    return ValueType.DOUBLE;
  }

  if(value === null) {
    return ValueType.NULL;
  }

  if(types[type] !== undefined)
    return types[type];

  throw new Exception("Unsupported Type: " + type);
}

function Value(value, type, timestamp, status) {
  this.value = value;
  this.type = type || determineType(value);
  this.timestamp = timestamp || Date.now();
  this.status = status || "ok";

  return Object.freeze(this);
}

Value.prototype.toString = function() {
  return this.value.toString();
};

Value.prototype.isNull = function() {
  return this.type === ValueType.NULL;
};

Value.prototype.isTruthy = function() {
  return (typeof this.value == 'number' && this.value !== 0) || this.value === "true" || this.value === true;
};

function ValueType(name, obj) {
  obj = obj || {};
  return {
    'name': name,
    'enum': obj.enum,
    'precision': obj.precision,
    'max': obj.max,
    'min': obj.min,
    'unit': obj.unit
  };
}

ValueType.STRING = ValueType('string');
ValueType.INTEGER = ValueType('number', { 'precision': 0 });
ValueType.DOUBLE = ValueType('number');
ValueType.BOOLEAN = ValueType('bool', { 'enum': ['true', 'false'] });
ValueType.NULL = ValueType('null');
ValueType.BINARY = ValueType('number', { 'precision': 0, 'min': 0, 'max': 255 });

module.exports = {
  'Value': Value,
  'ValueType': Object.freeze(ValueType)
};
