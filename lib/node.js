var EventEmitter = require('events').EventEmitter,
    value = require('./value.js'),
    trends = require('./trends.js'),
    _ = require('./internal.js');

function Node(name, displayName) {
  // 'private' variables go here.
  this.__priv__ = {};

  // super constructor
  EventEmitter.call(this);

  _.immutable(this, 'name', name);
  _.immutable(this, 'attributes', {});
  _.immutable(this, 'config', {
    "$is": "node" // TODO
  });
  _.immutable(this, 'children', {});

  this.displayName = displayName || name;
  this.action = null;
  this.parent = null;

  _.getter(this, 'valueType', function() {
    return this.hasValue() ? this.value.type : null;
  });

  // careful, here be dragons.
  _.prop(this, 'value', function() {
    if (!_.isNull(this.__priv__.value)) {
      return this.__priv__.value;
    } else {
      this.value = new value.Value();
      return this.__priv__.value;
    }
  }, function(val) {
    var _val;
    if(val instanceof value.Value) {
      _val = val;
    } else {
      _val = new value.Value(val);
    }
    if(this.__priv__.value !== _val) {
      this.__priv__.value = _val;
      this.emit('valueChanged', this);
    }
  });

  return this;
}

_.inherits(Node, EventEmitter);

Node.prototype.getPath = function() {
  var _this = this;
  var tree = [];

  while (!_.isNull(_this.parent)) {
    tree.push(_this.name);
    _this = _this.parent;
  }

  tree = tree.reverse();
  return '/' + tree.join('/');
};

Node.prototype.hasValue = function() {
  return !_.isNull(this.value);
};

Node.prototype.addChild = function(child) {
  this.children[child.name] = child;
  child.parent = this;
  this.emit('treeChanged', this);
  return this;
};

Node.prototype.createChild = function(displayName, obj) {
  var recording = !_.isNull(obj.recording) ? obj.recording : false;

  var name = _.replaceAll(displayName, ' ', '_');
  var node = recording ? new RecordingNode(name) : new Node(name);
  this.addChild(node);

  if(!_.isNull(obj.value)) node.value = obj.value;
  node.displayName = displayName;
  node.icon = obj.icon;

  return node;
};

Node.prototype.invokeAction = function(args) {
  if (!_.isNull(this.action)) {
    return this.action.invoke(args);
  }
  return null;
};

function DSAction(name, callback, obj) {
  obj = obj || {};

  this.name = name;
  this.results = obj.results || {};
  this.params = obj.params || {};
  this.callback = callback || function() {};
  this.hasTableReturn = !_.isNull(obj.hasTableReturn) ? obj.hasTableReturn : false;
  this.tableName = !_.isNull(obj.tableName) ? obj.tableName : 'table';

  return Object.freeze(this);
}

DSAction.prototype.invoke = function(params) {
  return this.callback(params);
};

module.exports = {
  'Node': Node,
  'Action': DSAction
};
