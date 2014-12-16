var hash = require('hashcode').hashCode();

function isNull(obj) {
  return (typeof obj === 'undefined' || obj === null);
}

function argsToArray(args) {
  var _args = [];
  Array.prototype.push.apply(_args, args);
  return _args.sort();
}

function merge() {
  var returned = {};
  argsToArray(arguments).forEach(function(arg) {
    for(var prop in arg) {
      if(arg.hasOwnProperty(prop)) {
        // this shouldn't really happen as merge() is used in a controlled
        // enviroment, but to be on the safe side.
        if(isNull(returned[prop])) {
          returned[prop] = arg[prop];
        }
      }
    }
  });
  return returned;
}

function replaceAll(string, query, replacement) {
  return string.split(query).join(replacement);
}

// only works on primitives
function toDouble(value) {
  var type = typeof value;
  if(type === "number")
    return value;
  if(type === "boolean")
    return value ? 1 : 0;
  if(type === "string")
    return hash.value(value);
  return 0;
}

// I like to call these functions, the three functions that shouldn't need to exist

// basic function for defining a property with a setter/getter
// might not work in all situations, it depends on a __priv__ object in this
// there is a reason why these functions are not a part of the DSLink API
function prop(obj, name, get, set) {
  Object.defineProperty(obj, name, {
    'configurable': true,
    'enumerable': true,
    'get': get || function() {
      return obj.__priv__[name];
    },
    'set': set || function(val) {
      obj.__priv__[name] = val;
    }
  });
}

// interface for an immutable getter
function getter(obj, name, get) {
  Object.defineProperty(obj, name, {
    'get': get
  });
}

// the equivalent of let/const/final
function immutable(obj, name, value) {
  Object.defineProperty(obj, name, {
    'value': value
  });
}

module.exports = {
  'isNull': isNull,
  'replaceAll': replaceAll,
  'toDouble': toDouble,
  'merge': merge,
  'prop': prop,
  'getter': getter,
  'immutable': immutable
};
