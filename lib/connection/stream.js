var value = require('../value.js'),
    ValueType = value.ValueType,
    _ = require('../internal');

var StreamState = {
  INIT: 'initialize',
  OPEN: 'open',
  CLOSED: 'closed'
};

function Stream(data, closeOnEnd) {
  data = data || [];

  this._originalLength = data.length;

  this.state = this._originalLength > 0 ? StreamState.INIT : StreamState.OPEN;
  this.data = data;
  this.closeOnEnd = closeOnEnd || false;
  this.limit = 2000;
}

Stream.closed = function() {
  var stream = new Stream();
  stream.state = StreamState.CLOSED;
  return stream;
};

Stream.prototype.close = function(error) {
  this.state = StreamState.CLOSED;
  if(!_.isNull(error))
    this.error = error;
  return this;
};

Stream.prototype.next = function() {
  if(this.data.length === 0 || this.state === StreamState.CLOSED)
    return null;
  if(this._originalLength > 0) {
    this._originalLength -= Math.min(this.data.length, this.limit);
  }

  var data = this.data.splice(0, Math.min(this.data.length, this.limit));

  if(this._originalLength <= 0) {
    if(this.closeOnEnd) {
      this.close();
    } else {
      this.state = StreamState.OPEN;
    }
  }

  return data;
};

Stream.prototype.push = function(element) {
  this.data.push(element);
  return this;
};

module.exports = {
  StreamState: Object.freeze(StreamState),
  Stream: Stream
};
