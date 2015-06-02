var EventEmitter = require('events').EventEmitter;

// aiming for a node-like Stream API, but without the weight
// isn't really for data, but for just values elapsed over time
function Stream(dartStream) {

}

Stream.prototype = new EventEmitter();

module.exports.Stream = Stream;
