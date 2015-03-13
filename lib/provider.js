var Node = require('./node.js').Node,
    Errors = require('./connection/error.js').Errors,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal');

function NodeProvider() {
  Node.call(this, '');

  this.functionReg = {};

  return Object.freeze(this);
}

_.inherits(NodeProvider, Node);

NodeProvider.prototype.function = function(key, value) {
  return _.propFunc(this.functionReg, key, value);
};

NodeProvider.prototype.getNode = function(path) {
  path = path || '';

  var returnNode = this;

  var nodes = path.split('/').filter(function(node) {
    return node.trim() !== '';
  });

  _.each(nodes, function(node) {
    if (_.isNull(returnNode.children[node]))
      throw Errors.INVALID_PATH;
    returnNode = returnNode.children[node];
  });

  return returnNode;
};

NodeProvider.prototype.addNode = function(path, opt) {
  path = path.split('/').filter(function(node) {
    return node.trim() !== '';
  });

  if(path.length === 0)
    throw new Error('Cannot add root node');

  var id = path[path.length - 1];
  path = path.slice(0, path.length - 1);

  var node = this.getNode('/' + path.join('/') || '/');

  if(!_.isNull(node.children[id]))
    throw new Error('Node already exists');

  var child = new Node(id, opt);
  node.addChild(child);
  return child;
};

NodeProvider.prototype.removeNode = function(path) {
  path = path.split('/').filter(function(node) {
    return node.trim() !== '';
  });

  if(path.length === 0)
    throw new Error('Cannot remove root node');

  var id = path[path.length - 1];
  path = path.slice(0, path.length - 1);

  var node = this.getNode('/' + path.join('/') || '/');

  if(_.isNull(node.children[id]))
    throw new Error('Node does not exist');

  var child = node.children[id];
  delete node.children[id];
  return child;
};

module.exports = {
  'NodeProvider': NodeProvider
};
