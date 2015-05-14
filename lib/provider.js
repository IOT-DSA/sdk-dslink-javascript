var Node = require('./node.js').Node,
    Errors = require('./error.js').Errors,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal');

function NodeProvider() {
  Node.call(this, '');

  this.profileReg = {};

  return Object.freeze(this);
}

_.inherits(NodeProvider, Node);

NodeProvider.prototype.is = function(key, value) {
  return _.propFunc(this.profileReg, key, value);
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

NodeProvider.prototype.getNodesByAttributeValue = function (key, value) {
  var nodes = [];
  _.each(this.children, function (node) {
    if (node._attributes.hasOwnProperty(key) && node._attributes[key] === value) {
      nodes.push(node);
    }
  });
  return nodes;
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

  var child;
  if(!_isNull(opt) && !_.isNull(opt['$is']) && !_.isNull(this.profileReg[opt['$is']])) {
    var Child = (this.profileReg[opt['$is']]);
    child = new Child(id, opt);
  } else {
    child = new Node(id, opt);
  }

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

  return node.removeChild(id);
};

NodeProvider.prototype._autoSaveTimer = null;
NodeProvider.prototype.enableAutosave = function(config) {
  if (!config) config = {};
  var interval = config.interval || 5000;
  var filePath = config.filePath || '.nodes.json';
  var self = this;
  this._autoSaveTimer = setInterval(function () {
    var state = JSON.stringify(self.save());
    fs.writeFile(filePath, state, function () {});
  }, interval);
};

NodeProvider.prototype.disableAutosave = function () {
  if (this._autoSaveTimer) clearInterval(this._autoSaveTimer);
};

module.exports = {
  'NodeProvider': NodeProvider
};
