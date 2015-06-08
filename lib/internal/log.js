var _ = require('goal');

function timestamp() {
  var now = new Date();
  return "[" + [now.getHours(), now.getMinutes(), now.getSeconds()].join(":") + "]";
}

function curry(obj, args) {
  if(_.typeOf(args) !== 'array')
    args = [args];
  return function() {
    obj.apply(this, args.concat(_.args(arguments)));
  };
}

var LogLevel = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

function Log() {
  this.level = LogLevel.warn;
}

Log.prototype.log = function(level, msg) {
  if(level <= this.level) {
    console.log(timestamp() + "[" + Object.keys(LogLevel)[level] + "] " + msg);
  }
};

Log.prototype.error = curry(Log.prototype.log, 1);
Log.prototype.warn = curry(Log.prototype.log, 2);
Log.prototype.info = curry(Log.prototype.log, 3);
Log.prototype.debug = curry(Log.prototype.log, 4);

module.exports = {
  LogLevel: LogLevel,
  Log: new Log()
};
