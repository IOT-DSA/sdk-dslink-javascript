var stream = require('./stream.js'),
    value = require('../value.js'),
    Stream = stream.Stream,
    StreamState = stream.StreamState,
    Value = value.Value,
    ValueType = value.ValueType,
    DSError = require('../error.js').Error,
    _ = require('../internal');

function SubscribeStream() {
  Stream.call(this);

  this.nodes = {};
}

_.inherits(SubscribeStream, Stream);

SubscribeStream.prototype.next = function() {
  var localLimit = this.limit;
  var data = [];

  _.each(this.nodes, function(node, sid) {
    if(localLimit <= 0)
      return;

    if(node.values.length === 0 && _.isNull(node.error))
      return;

    var nodeData = {
      sid: parseInt(sid),
    };

    if(node.values.length > 0) {
      var length = node.values.length;
      var value = node.values[length - 1];

      nodeData.value = value.value;
      nodeData.ts = value.timestamp.toISOString();

      node.values = [];
      localLimit -= length;
    }

    if(!_.isNull(node.error)) {
      nodeData.status = 'error';
      nodeData.msg = node.error.getMessage();

      node.error = null;
    }

    data.push(nodeData);
  }, this);

  if(data.length === 0)
    return null;
  return data;
};

SubscribeStream.prototype.addNode = function(responder, path) {
  if(_.typeOf(path) === 'string') {
    _.Log.warning('Subscription request using legacy format, ignoring.');
  }
  var node = responder.provider.getNode(path.path);
  var sid = path.sid;

  var valueHandler = function(val) {
    if(val instanceof DSError) {
      this.nodes[sid].error = val;
      return;
    }
    this.nodes[sid].values.push(val);
  }.bind(this);

  this.nodes[sid] = {
    node: node,
    handler: valueHandler,
    values: []
  };

  if(!(node.value instanceof DSError)) {
    this.nodes[sid].values.push(node.value);
  }

  node.on('value', valueHandler);
};

SubscribeStream.prototype.removeNode = function(sid) {
  if(!_.isNull(this.nodes[sid])) {
    var node = this.nodes[sid];
    node.node.removeListener('value', node.handler);

    delete this.nodes[sid];
    return true;
  }
  return false;
};

module.exports = {
  SubscribeStream: SubscribeStream
};
