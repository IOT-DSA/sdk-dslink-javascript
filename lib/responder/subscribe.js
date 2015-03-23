var stream = require('../connection/stream.js'),
    Stream = stream.Stream,
    StreamState = stream.StreamState,
    ValueType = require('../value.js').ValueType,
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
    if(localLimit <= 0 || node.values.length === 0)
      return;

    var length = node.values.length;
    var value = node.values[length - 1];

    var nodeData = {
      sid: parseInt(sid),
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

SubscribeStream.prototype.addNode = function(responder, path) {
  if(_.typeOf(path) === 'string') {
    _.Log.warning('Subscription request using legacy format, ignoring.');
  }
  var node = responder.provider.getNode(path.path);
  var sid = path.sid;

  var valueHandler = function(val) {
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
