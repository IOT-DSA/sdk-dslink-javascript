var _ = require('goal');

// For one reason or another, I don't think these belong in goal,
// or just haven't gotten around to it yet.
// We can use goal.mixin to 'extend' goal and add our own functions.

function isNull(obj) {
  return (typeof obj === 'undefined' || obj === null);
}

var ObjectUtils = {
  slice: function(obj, start, end) {
    var returnObj = {},
        count = 0;

    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        returnObj[prop] = obj[prop];
        count++;

        if(count === end)
          break;
      }
    }

    return returnObj;
  }
};

var Base64Utils = {
  urlSafe: function(message) {
    return _.replaceAll(_.replaceAll(message, '+', '-'), '/', '_');
  }
};

var BufferUtils = {
  merge: function() {
    var buffers = _.args(arguments),
        length = 0;

    _.each(buffers, function(buf) {
      length += buf.length;
    });

    var returnBuf = new Buffer(length);
    length = 0;

    _.each(buffers, function(buf) {
      buf.copy(returnBuf, length);
      length += buf.length;
    });

    return returnBuf;
  }
};

var StringUtils = {
  // converts camelCase to Title Case.
  title: function(camelCase) {
    if(isNull(camelCase))
      return camelCase;

    var regex = /[A-Z]/g,
        result = regex.exec(camelCase);
    if(!isNull(result)) {
      _.each(result, function(r, index) {
        if(index >= result.length)
          return;

        camelCase = camelCase.replace(r, ' ' + r.toUpperCase());
      });
    }
    camelCase = camelCase.replace(camelCase[0], camelCase[0].toUpperCase());

    return camelCase;
  }
};

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
  Object: ObjectUtils,
  Base64: Base64Utils,
  Buffer: BufferUtils,
  String: StringUtils,
  isNull: isNull,
  prop: prop,
  getter: getter,
  immutable: immutable
});
