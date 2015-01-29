var EventEmitter = require('events').EventEmitter,
    value = require('./value.js'),
    trends = require('./trends.js'),
    _ = require('./internal.js');

function Node(name, displayName, action) {
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
  this.action = action;
  this.parent = null;
}

_.inherits(Node, EventEmitter);

Node.prototype.isInvokable = function() {
  return !_.isNull(this.action);
};

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

Node.prototype.addChild = function(child) {
  this.children[child.name] = child;
  child.parent = this;
  this.emit('newChild', this);
  return this;
};

Node.prototype.invoke = function(params) {
  return !_.isNull(this.action) ? this.action(params) : null;
};

Node.prototype.toMap = function() {
  var map = {};

  _.each(this.attributes, function(obj, key) {
    map[('@' + key)] = obj;
  });

  if(this.isInvokable()) {
    map['$params'] = [];
    map['$columns'] = [];

    _.each(this.action.params, function(obj, key) {
      map['$params'].push(_.mixin({
        name: key
      }, obj));
    });

    _.each(this.action.columns, function(obj, key) {
      map['$columns'].push(_.mixin({
        name: key
      }, obj));
    });
  }

  return _.mixin({}, this.config, map);
};

module.exports = {
  'Node': Node
};
