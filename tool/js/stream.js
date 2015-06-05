var EventEmitter = require('events').EventEmitter;

// aiming for a node-like Stream API, but without the weight
// isn't really for data, but for just values elapsed over time
function Stream(dartStream, typeTransform) {
  dartStream._createSubscription$4({
    // onData
    call$1: function(data) {
      data = typeTransform(data);
      this.emit('data', data);
    }
  },
  {
    // onError
    call$1: function(error) {
      this.emit('error', error);
    }
  }, {
    // onDone
    call$0: function() {
      this.emit('done');
    }
  // cancel on error
  }, true);
}

Stream.prototype = new EventEmitter();

module.exports.Stream = Stream;
