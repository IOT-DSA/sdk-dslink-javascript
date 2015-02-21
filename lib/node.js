var value = require('./value.js'),
    Value = value.Value,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal/util.js');

function NodeProvider(root) {
  this.root = root || new Node('');
}

NodeProvider.prototype.getNode = function(path) {
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

function Node(name, displayName, opt) {
  opt = opt || {};

  EventEmitter.call(this);

  this.__priv__ = {
    attributes: {}
  };

  _.immutable(this, 'name', name);
  _.immutable(this, 'profile', opt.profile || 'node');
  _.immutable(this, 'config', {});
  _.immutable(this, 'children', {});

  _.prop(this, 'value', null, function(val) {
    this.__priv__.value = val;
    this.emit('value', val);
  }.bind(this));

  this.displayName = displayName || name;
  this.value = opt.value;

  this.parent = null;
}

_.inherits(Node, EventEmitter);

Node.prototype.isInvokable = function(level) {
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

Node.prototype.load = function(map) {
  _.each(map, function(item, key) {
    if(key[0] === '@') {
      this.attribute(key, item);
      return;
    }

    if(key[0] === '$') {
      if(key === '$is') {
        this.profile = item;
        return;
      }

      if(key === '$invokable') {
        this.invokable = item;
      }

      this.config[key] = item;
      return;
    }

    if(key[0] === '?') {
      if(key === '?invoke') {
        this.action = item;
      }

      if(key === '?value') {
        this.value = item instanceof Value ? item : new Value(item);
      }
      return;
    }

    var child;
    if(!_.isNull(item['?invoke']) || !_.isNull(item.$invokable)) {
      child = new ActionNode(key);
    } else {
      child = new Node(key);
    }

    this.addChild(child);
    child.load(item);
  }, this);
};

Node.prototype.toStreamData = function(isChild) {
  var data;

  isChild = isChild || false;
  if(isChild) {
    data = [this.name, {
      $is: this.profile,
      invokable: this.isInvokable()
    }];

    if(!_.isNull(this.displayName)) {
      _.mixin(data[1], {
        name: this.displayName
      });
    }

    return data;
  }

  data = [];

  data.push(['$is', this.profile]);

  if(!_.isNull(this.value)) {
    data.push(['$type', this.value.type]);
  }

  _.each(this.config, function(obj, key) {
    data.push([key, obj]);
  });

  _.each(this.__priv__.attributes, function(obj, key) {
    data.push(['@' + key, obj.value]);
  });

  _.each(this.children, function(child) {
    data.push(child.toStreamData(true));
  });

  return data;
};

function ActionNode(name, displayName, action, opt) {
  Node.call(this, name, displayName, opt);

  this.action = action;
  this.invokable = 'none';
}

_.inherits(ActionNode, Node);

ActionNode.prototype.isInvokable = function(level) {
  return true;
};

ActionNode.prototype.invoke = function(params) {
  return this.action.cb(this, params);
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
    parent.push(['$invokable', this.invokable]);
  }

  return parent;
};

function Action(cb, params, columns) {
  this.params = params || {};
  this.columns = columns || {};
  this.cb = cb;
}

module.exports = {
  'NodeProvider': NodeProvider,
  'Node': Node,
  'ActionNode': ActionNode,
  'Action': Action
};
