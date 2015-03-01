var value = require('./value.js'),
    Value = value.Value,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal/util.js');

function _prop(obj, name, configName) {
  configName = configName || name;
  Object.defineProperty(obj, name, {
    'configurable': true,
    'enumerable': true,
    'get': function() {
      return obj.__priv__.config[configName];
    },
    'set': function(val) {
      obj.__priv__.config[configName] = val;
    }
  });
}

function _propFunc(obj, key, value) {
  if(_.isNull(key)) {
    return obj;
  }

  if(typeof value === 'undefined') {
    if(_.typeOf(key) === 'object') {
      _.each(key, function(mapValue, mapKey) {
        obj[mapKey] = mapValue;
      }, this);
      return this;
    }

    return obj[key];
  }

  if(value === null) {
    delete obj[key];
    return this;
  }

  obj[key] = value;
  return this;
}

function _load(self, item, key) {
  var ident = key.substring(1);

  if(key[0] === '$') {
    if(key !== '$type')
      self.__priv__.config[ident] = item;
    return true;
  }

  if(key[0] === '@') {
    self.__priv__.attributes[ident] = item;
    return true;
  }

  if(key[0] === '?') {
    if(key === '?invoke') {
      self.action = item;
    }

    if(key === '?value') {
      if(!(item instanceof Value)) {
        item = new Value(item);
      }

      self.__priv__.value = item;
      self.type = self.value.type;
    }
    return true;
  }
  return false;
}

function Node(id, opt) {
  opt = opt || {};

  EventEmitter.call(this);
  this.setMaxListeners(0);

  this.__priv__ = {
    attributes: {},
    config: {}
  };

  _.immutable(this, 'id', id);
  _.immutable(this, 'children', {});

  _.prop(this, 'value', null, function(val) {
    if(_.isNull(this.value)) {
      throw new Error('Node was not constructed with value, value cannot be set');
    }
    if(!(val instanceof Value)) {
      val = new Value(val);
    }

    if(val.type === this.type) {
      this.__priv__.value = val;
      this.emit('value', val);
      return;
    }

    if(val.type !== this.type) {
      throw new Error('Value has incorrect type');
    }
  }.bind(this));

  _prop(this, 'name');
  _prop(this, 'type');
  _prop(this, 'profile', 'is');

  _.each(opt, function(item, key) {
    _load(this, item, key);
  }, this);

  this.profile = this.profile || 'node';
  this.name = this.name || id;

  this.parent = null;
}

_.inherits(Node, EventEmitter);

Node.prototype.path = function() {
  var _this = this;
  var tree = [];

  while (!_.isNull(_this.parent)) {
    tree.push(_this.id);
    _this = _this.parent;
  }

  tree = tree.reverse();
  return '/' + tree.join('/');
};

Node.prototype.attribute = function(key, value) {
  return _propFunc(this.__priv__.attributes, key, value);
};

Node.prototype.config = function(key, value) {
  return _propFunc(this.__priv__.config, key, value);
};

Node.prototype.addChild = function(child) {
  this.children[child.id] = child;
  child.parent = this;
  this.emit('child', child, false);
  return this;
};

Node.prototype.removeChild = function(id) {
  var child = this.children[id];
  delete this.children[id];
  this.emit('child', child, true);
  return child;
};

Node.prototype.load = function(map) {
  _.each(map, function(item, key) {
    if(_load(this, item, key))
      return;

    var child;
    if(!_.isNull(item['?invoke'])) {
      child = new ActionNode(key, item);
    } else {
      child = new Node(key, item);
    }

    this.addChild(child);
    child.load(item);
  }, this);
};

Node.prototype.toStreamData = function(isChild) {
  isChild = isChild || false;
  if(isChild) {
    var data = [this.id, {
      '$is': this.profile,
      '$name': this.name
    }];

    if(this.type) {
      data[1].$type = this.type;
    }

    return data;
  }

  var data = [];

  _.each(this.__priv__.config, function(obj, key) {
    if(key != 'name')
      data.push(['$' + key, obj]);
  });

  _.each(this.__priv__.attributes, function(obj, key) {
    data.push(['@' + key, obj]);
  });

  _.each(this.children, function(child) {
    data.push(child.toStreamData(true));
  });

  return data;
};

function ActionNode(id, opt) {
  Node.call(this, id, opt);

  this.__priv__.config.invokable = this.__priv__.config.invokable || 'read';
}

_.inherits(ActionNode, Node);

ActionNode.prototype.invoke = function(params) {
  return this.action.cb(this, params);
};

ActionNode.prototype.toStreamData = function(isChild) {
  var parent = Node.prototype.toStreamData.call(this, isChild);

  if(isChild) {
    parent[1].$invokable = this.__priv__.config.invokable;
  }

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

function Action(cb, params, columns) {
  this.params = params || {};
  this.columns = columns || {};
  this.cb = cb;
}

module.exports = {
  'Node': Node,
  'ActionNode': ActionNode,
  'Action': Action
};
