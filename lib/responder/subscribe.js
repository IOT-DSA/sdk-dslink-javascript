var stream = require('../connection/stream.js'),
    value = require('../value.js'),
    Stream = stream.Stream,
    StreamState = stream.StreamState,
    Value = value.Value,
    ValueType = value.ValueType,
    DSError = require('../connection/error.js').Error,
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
    if(!_.isNull(node.error)) {
      data.push({
        sid: parseInt(sid),
        status: 'error',
        msg: node.error.getMessage()
      });
      this.removeNode(parseInt(sid));
      return;
    }

    if(localLimit <= 0 || node.values.length === 0)
      return;

    var length = node.values.length;
    var value = node.values[length - 1];

    var nodeData = {
      sid: parseInt(sid),
      value: value.value,
      ts: value.timestamp.toISOString()
    };

    data.push(nodeData);

    node.values = [];
    localLimit -= length;
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
    values: [ node.value ]
  };

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
