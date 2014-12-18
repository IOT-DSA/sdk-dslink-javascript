var value = require('./value.js'),
	Value = value.Value,
	ValueType = value.ValueType,
	_ = require('./internal.js');

function copySort(array, callback) {
  var returned = Array.prototype.slice.call(array);
  returned.sort(callback);
  return returned;
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
  	  return Math.min(_.toDouble(a.value), _.toDouble(b.value)) === _.toDouble(a.value) ? -1 : 1;
  	})[0];
  },
  'max': function(vals) {
  	return copySort(vals, function(a, b) {
  	  return Math.max(_.toDouble(a.value), _.toDouble(b.value)) === _.toDouble(a.value) ? -1 : 1;
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