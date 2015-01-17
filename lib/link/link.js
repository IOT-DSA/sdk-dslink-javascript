var node = require('../node.js'),
    responder = require('../responder/responder.js'),
    Responder = responder.Responder,
    Node = node.Node,
    _ = require('../internal.js');

function Link(name, conn) {
  this.__priv__ = {
    rootNode: new Node("Root")
  };

  this.name = name;
  this.responder = new Responder(conn, this);
}

Link.prototype.resolvePath = function(path) {
  var returnNode = this.rootNode;

  _.replaceAll(path, '+', '_');
  var nodes = path.split("/").filter(function(node) {
    return node.trim() !== "";
  });

  _.each(nodes, function(node) {
    if (_.isNull(returnNode.children[node]))
      throw "Node does not have child '" + node + "'!";
    returnNode = returnNode.children[node];
  });

  return returnNode;
};

module.exports = {
  Link: Link
};
