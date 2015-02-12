var value = require('./value.js'),
    Value = value.Value,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal.js');

function Node(name, displayName, opt) {
  opt = opt || {};

  EventEmitter.call(this);

  this.__priv__ = {
    attributes: {}
  };

  _.immutable(this, 'name', name);
  _.immutable(this, 'displayName', displayName || name);
  _.immutable(this, 'profile', opt.profile || 'node');

  _.immutable(this, 'children', {});

  this.value = opt.value || new Value();

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

function ActionNode(name, displayName, action, opt) {
  ActionNode.call(this, name, displayName, opt);

  this.action = action;
}

_.inherits(ActionNode, Node);

ActionNode.prototype.isInvokable = function() {
  return true;
};

ActionNode.prototype.invoke = function(params) {
  return this.action.cb(params);
};

ActionNode.prototype.toStreamData = function(isChild) {
  var parent = Node.prototype.toStreamData.call(this, isChild);

  if(!isChild) {
    var params = [];
    _.each(this.action.params, function(value, key) {
      params.push({
        name: key,
        type: value
      });
    });

    var columns = [];
    _.each(this.action.columns, function(value, key) {
      columns.push({
        name: key,
        type: value
      });
    });

    parent.push(['$params', params]);
    parent.push(['$columns', columns]);
  }

  return parent;
};

function Action(params, columns, cb) {
  this.params = params || {};
  this.columns = columns || {};
  this.cb = cb;
}

module.exports = {
  'Node': Node,
  'ActionNode': ActionNode,
  'Action': Action
};
