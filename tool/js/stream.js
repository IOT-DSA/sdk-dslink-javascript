var EventEmitter = require('events').EventEmitter;

// aiming for a node-like Stream API, but without the weight
// isn't really for data, but for just values elapsed over time
function Stream(dartStream) {
  dartStream._createSubscription$4({
    // onData
    call$1: function(data) {
      this.emit('data', dynamicFrom(data));
    }.bind(this)
  },
  {
    // onError
    call$1: function(error) {
      this.emit('error', error);
    }.bind(this)
  }, {
    // onDone
    call$0: function() {
      this.emit('done');
    }.bind(this)
  // cancel on error
  }, true);
}

Stream.prototype = new EventEmitter();

module.exports.Stream = Stream;
