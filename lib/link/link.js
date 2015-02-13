var node = require('../node.js'),
    responder = require('../responder/responder.js'),
    Responder = responder.Responder,
    Errors = require('../connection/error.js').Errors,
    Node = node.Node,
    _ = require('../internal/util.js');

function Link(conn) {
  this.__priv__ = {
    rootNode: new Node('Root')
  };

  this.responder = new Responder(conn, this);
}

Link.prototype.resolvePath = function(path) {
  var returnNode = this.rootNode;

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

module.exports = {
  Link: Link
};
