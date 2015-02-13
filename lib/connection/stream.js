var _ = require('../internal/util.js');

var StreamState = {
  INIT: 'initialize',
  OPEN: 'open',
  CLOSED: 'closed'
};

function Stream(data) {
  data = data || [];

  this.__priv__ = {
    originalLength: data.length
  };

  this.state = this.__priv__.originalLength > 0 ? StreamState.INIT : StreamState.OPEN;
  this.data = data;
  this.limit = 100;
}

Stream.prototype.close = function(error) {
  this.state = StreamState.CLOSED;
  if(!_.isNull(error))
    this.error = error;
};

Stream.prototype.next = function() {
  if(this.data.length === 0)
    return null;
  if(this.__priv__.originalLength > 0) {
    this.__priv__.originalLength -= Math.min(this.data.length, this.limit);

    if(this.__priv__.originalLength <= 0)
      this.state = StreamState.OPEN;
  }
  return this.data.splice(0, Math.min(this.data.length, this.limit));
};

Stream.prototype.push = function(element) {
  this.data.push(element);
  return this;
};

module.exports = {
  StreamState: StreamState,
  Stream: Stream
};
