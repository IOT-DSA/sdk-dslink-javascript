var _ = require('goal');

function base64_urlSafe(message) {
  return _.replaceAll(_.replaceAll(message, '+', '-'), '/', '_');
}

function buffer_extraByte(buf) {
  var nbuf = new Buffer(257);
  nbuf[0] = 0;
  buf.copy(nbuf, 1, 0, 256);
  return nbuf;
}

function isNull(obj) {
  return (typeof obj === 'undefined' || obj === null);
}

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

module.exports = _.mixin({}, _, {
  Base64: {
    urlSafe: base64_urlSafe
  },
  Buffer: {
    extraByte: buffer_extraByte
  },
  isNull: isNull,
  prop: prop,
  getter: getter,
  immutable: immutable
});
