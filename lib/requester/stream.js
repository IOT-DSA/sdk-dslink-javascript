var value = require('../value.js'),
    StreamState = require('../responder/stream.js').StreamState,
    EventEmitter = require('events').EventEmitter,
    DSError = require('../error.js').Error,
    ValueType = value.ValueType,
    _ = require('../internal');

function RequesterStream(rid, requester) {
  this.rid = rid;
  this.requester = requester;

  this.state = StreamState.INIT;
  this.data = [];
}

_.inherits(RequesterStream, EventEmitter);

RequesterStream.prototype.close = function() {
  this.state = StreamState.CLOSED;
  this.requester.close(this.rid);
  return this;
};

RequesterStream.prototype.push = function(element) {
  if(element instanceof DSError) {
    this.emit('error', element);
  } else {
    this.data.push(element);
    this.emit('data', element);
  }
  return this;
};

RequesterStream.prototype.concat = function(arr) {
  this.data.concat(arr);
  _.each(arr, function(element) {
    this.emit('data', element);
  }, this);
  return this;
};

module.exports = {
  RequesterStream: RequesterStream
};
