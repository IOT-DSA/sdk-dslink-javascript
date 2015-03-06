var Node = require('./node.js').Node,
    Errors = require('./connection/error.js').Errors,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal/util.js');

/**
 * It's a node provider.
 * @constructor
 */
function NodeProvider(root) {
  this.root = root || new Node('');

  return Object.freeze(this);
}

NodeProvider.prototype.getNode = function(path) {
  path = path || '';

  var returnNode = this.root;

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

NodeProvider.prototype.load = function() {
  this.root.load.apply(this.root, arguments);
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

  node.addChild(new Node(id, opt));
};

module.exports = {
  'NodeProvider': NodeProvider
};
