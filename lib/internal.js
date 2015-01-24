var _ = require('goal');

function base64_urlSafe(message) {
  return _.replaceAll(_.replaceAll(message, '+', '-'), '/', '_');
}

function encrypt(key, message, encoding, outEncoding) {
}

function decrypt(key, message, encoding, outEncoding) {
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
  Crypto: {
    encrypt: encrypt,
    decrypt: decrypt
  },
  isNull: isNull,
  prop: prop,
  getter: getter,
  immutable: immutable
});
