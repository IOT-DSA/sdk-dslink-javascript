var value = require('./value.js'),
    Value = value.Value,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal.js');

function Node(name, displayName, opt) {
  // super constructor
  EventEmitter.call(this);

  // 'private' variables go here.
  this.__priv__ = {
    attributes: {}
  };

  opt = opt || {};

  _.immutable(this, 'name', name);
  _.immutable(this, 'displayName', displayName || name);
  _.immutable(this, 'profile', opt.profile || 'node');

  _.immutable(this, 'children', {});

  this.parent = null;
}

_.inherits(Node, EventEmitter);

Node.prototype.isInvokable = function() {
  return false;
};

Node.prototype.path = function() {
  var _this = this;
  var tree = [];

  while (!_.isNull(_this.parent)) {
    tree.push(_this.name);
    _this = _this.parent;
  }

  tree = tree.reverse();
  return '/' + tree.join('/');
};

Node.prototype.attribute = function(key, value) {
  if(typeof value === 'undefined') {
    if(_.typeOf(key) === 'object') {
      _.each(key, function(mapValue, mapKey) {
        this.attribute(mapKey, mapValue);
      });
      return this;
    }

    return this.__priv__.attributes[key];
  }

  if(value === null) {
    delete this.__priv__.attributes[key];
    this.emit('attribute', key, true);
    return this;
  }

  this.__priv__.attributes[key] = value;
  this.emit('attribute', key, false);
  return this;
};

Node.prototype.addChild = function(child) {
  this.children[child.name] = child;
  child.parent = this;
  this.emit('child', child, false);
  return this;
};

Node.prototype.removeChild = function(name) {
  var child = this.children[name];
  delete this.children[name];
  this.emit('child', child, true);
  return child;
};

Node.prototype.toStreamData = function(isChild) {
  var data;

  isChild = isChild || false;
  if(isChild) {
    data = [child.name, {
      $is: child.config.$is.value,
      invokable: child.isInvokable()
    }];

    if(!_.isNull(child.config.$interface)) {
      _.mixin(data[1], {
        $interface: child.config.$interface
      });
    }

    if(!_.isNull(child.displayName)) {
      _.mixin(data[1], {
        name: child.displayName
      });
    }

    return data;
  }

  data = [];

  data.push(['$is', this.profile]);

  _.each(this.attributes, function(obj, key) {
    data.push(['@' + key, obj.value]);
  });

  _each(this.children, function(child) {
    data.push(child.toStreamData(true));
  });

  return data;
};

module.exports = {
  'Node': Node
};
