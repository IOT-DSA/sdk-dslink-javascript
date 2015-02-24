var Node = require('./node.js').Node,
    Errors = require('./connection/error.js').Errors,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal/util.js');

function NodeProvider(root) {
  this.root = root || new Node('');

  return Object.freeze(this);
}

NodeProvider.prototype.getNode = function(path) {
  path = path || '';

  var returnNode = this.root;

  _.replaceAll(path, '+', '_');
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

module.exports = {
  'NodeProvider': NodeProvider
};
