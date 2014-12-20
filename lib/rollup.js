var value = require('./value.js'),
    hash = require('hashcode').hashCode(),
	  Value = value.Value,
	  ValueType = value.ValueType,
	  _ = require('./internal.js');

function copySort(array, callback) {
  var returned = Array.prototype.slice.call(array);
  returned.sort(callback);
  return returned;
}

function valueToDouble(value) {
  var type = value.type;
  if(type.name === ValueType.NUMBER.name)
    return value.value;
  if(type === ValueType.BOOLEAN)
    return value.value ? 1 : 0;
  if(type === ValueType.STRING)
    return hash.value(value.value);
  if(type === ValueType.ENUM)
    return value.type.enum.indexOf(value.value);
  return 0;
}

var RollupType = ['avg', 'min', 'max', 'sum', 'first', 'last', 'or', 'and', 'count'];

var Rollup = Object.freeze({
  'avg': function(vals) {
  	if(!vals.every(function(val) { return val.type.name === ValueType.NUMBER.name; })) {
  	  throw "Rollup contains non-numerical values.";
  	}

  	var prims = vals.map(function(val) { return val.value; });
  	return new Value(prims.reduce(function(a, b) { return a+b; }) / prims.length);
  },
  'min': function(vals) {
  	return copySort(vals, function(a, b) {
  	  return Math.min(valueToDouble(a), valueToDouble(b)) === valueToDouble(a) ? -1 : 1;
  	})[0];
  },
  'max': function(vals) {
  	return copySort(vals, function(a, b) {
  	  return Math.max(valueToDouble(a), valueToDouble(b)) === valueToDouble(a) ? -1 : 1;
  	})[0];
  },
  'sum': function(vals) {
  	if(!vals.every(function(val) { return val.type.name === ValueType.NUMBER.name; })) {
  	  throw "Rollup contains non-numerical values.";
  	}

  	var prims = vals.map(function(val) { return val.value; });
  	return new Value(prims.reduce(function(a, b) { return a+b; }));
  },
  'first': function(vals) {
  	return vals[0];
  },
  'last': function(vals) {
  	return vals[vals.length - 1];
  },
  'or': function(vals) {
  	return new Value(vals.some(function(val) {
  	  return val.isTruthy();
  	}));
  },
  'and': function(vals) {
  	return new Value(vals.every(function(val) {
  	  return val.isTruthy();
  	}));
  },
  'count': function(vals) {
  	return new Value(vals.length);
  }
});

module.exports = {
  'RollupType': RollupType,
  'Rollup': Rollup
};