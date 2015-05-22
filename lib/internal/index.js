var _ = require('goal');

// For one reason or another, I don't think these belong in goal,
// or just haven't gotten around to it yet.
// We can use goal.mixin to 'extend' goal and add our own functions.

function sha256(buf) {
  var sha = require('crypto').createHash('sha256');
  sha.update(buf);
  return sha.digest();
}

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
  },
  traverse: function(obj, path) {
    path = path.split('.');
    var index = 0;
    var r = obj;
    while(!isNull(r) && index < path.length) {
      r = r[path[index]];
      index++;
    }

    return r;
  }
};

var Base64Utils = {
  urlSafe: function(message) {
    return _.replaceAll(message.toString('base64'), {
      '+': '-',
      '/': '_'
    });
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
      return obj['_' + name];
    },
    'set': set || function(val) {
      obj['_' + name] = val;
    }
  });
}

function propFunc(obj, key, value, emit) {
  if(isNull(key)) {
    return obj;
  }

  if(typeof value === 'undefined') {
    if(_.typeOf(key) === 'object') {
      _.each(key, function(mapValue, mapKey) {
        obj[mapKey] = mapValue;
      }, this);
      return this;
    }

    return obj[key];
  }

  if(value === null) {
    delete obj[key];

    if(!isNull(emit)) {
      this.emit(emit, key, null);
    }
    return this;
  }

  obj[key] = value;
  if(!isNull(emit)) {
    this.emit(emit, key, value);
  }
  return this;
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
  sha256: sha256,
  prop: prop,
  propFunc: propFunc,
  getter: getter,
  immutable: immutable,
  Log: require('./log.js').Log,
  'DSA_VERSION': '1.0.1'
});
