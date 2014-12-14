function isUndefined(obj) {
  return typeof obj === 'undefined';
}

function merge() {
  var returned = {};
  arguments.forEach((obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        // this shouldn't really happen as merge() is used in a controlled
        // enviroment, but to be on the safe side.
        if(isUndefined(returned[prop])) {
          returned[prop] = obj[prop];
        }
      }
    }
  });
  return returned;
}
