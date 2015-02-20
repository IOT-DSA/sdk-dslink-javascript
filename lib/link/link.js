var node = require('../node.js'),
    responder = require('../responder/responder.js'),
    Responder = responder.Responder,
    Errors = require('../connection/error.js').Errors,
    Node = node.Node,
    NodeProvider = node.NodeProvider,
    _ = require('../internal/util.js');

function Link(conn, root) {
  NodeProvider.call(this, root);
  this.responder = new Responder(conn, this);
}

_.inherits(Link, NodeProvider);

module.exports = {
  Link: Link
};
