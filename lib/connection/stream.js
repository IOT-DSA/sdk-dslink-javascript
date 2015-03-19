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

function SubscribeStream() {
  Stream.call(this);

  this.nodes = {};
}

_.inherits(SubscribeStream, Stream);

SubscribeStream.prototype.next = function() {
  var localLimit = this.limit;
  var data = [];

  _.each(this.nodes, function(node, path) {
    if(localLimit <= 0 || node.values.length === 0)
      return;

    var length = node.values.length;
    var value = node.values[length - 1];

    var nodeData = {
      path: path,
      value: value.value,
      ts: value.timestamp.toISOString()
    };

    if(value.type === ValueType.NUMBER) {
      _.mixin(nodeData, {
        // TODO
      });
    }

    data.push(nodeData);

    node.values = [];
    localLimit -= length;
  }, this);

  if(data.length === 0)
    return null;
  return data;
};

SubscribeStream.prototype.addNode = function(node) {
  var valueHandler = function(val) {
    this.nodes[node.path()].values.push(val);
  }.bind(this);

  this.nodes[node.path()] = {
    node: node,
    handler: valueHandler,
    values: [ node.value ]
  };

  node.on('value', valueHandler);
};

SubscribeStream.prototype.removeNode = function(node) {
  if(!_.isNull(this.nodes[node.path()])) {
    var nnode = this.nodes[node.path()];
    nnode.node.removeListener('value', nnode.handler);

    delete this.nodes[node.path()];
    return true;
  }
  return false;
};

module.exports = {
  StreamState: StreamState,
  Stream: Stream,
  SubscribeStream: SubscribeStream
};
