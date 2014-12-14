function isUndefined(obj) {
  return typeof obj === 'undefined';
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
        if(isUndefined(returned[prop])) {
          returned[prop] = arg[prop];
        }
      }
    }
  });
  return returned;
}

module.exports = {
  'isUndefined': isUndefined,
  'merge': merge
};
