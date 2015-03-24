var value = require('./value.js'),
    Value = value.Value,
    EventEmitter = require('events').EventEmitter,
    _ = require('./internal');

function _prop(obj, name, configName) {
  configName = configName || name;
  Object.defineProperty(obj, name, {
    'configurable': true,
    'enumerable': true,
    'get': function() {
      return obj._config[configName];
    },
    'set': function(val) {
      obj._config[configName] = val;
    }
  });
}

function _load(self, item, key) {
  var ident = key.substring(1);

  if(key[0] === '$') {
    if(key === '$function') {
      self.functionName = item;
      return true;
    }

    self._config[ident] = item;
    if(key === '$type' && !_.isNull(self._value)) {
      if(!self._value.isValid(item)) {
        // throw something
      }
    }
    return true;
  }

  if(key[0] === '@') {
    self._attributes[ident] = item;
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

      self._value = item;
      self.type = self.value.type;
    }
    return true;
  }
  return false;
}

/**
 * @constructor
 * @param {string} id - An id for the node to be referenced by within the node structure.
 */
function Node(id, opt) {
  opt = opt || {};

  /**
   * @name value
   * @event
   * @description Value
   * @memberof Node
   */
  EventEmitter.call(this);
  this.setMaxListeners(0);

  this._attributes = {};
  this._config = {};

  _.immutable(this, 'id', id);
  _.immutable(this, 'children', {});

  /**
   * @type {Value|object}
   * @memberof Node
   * @description Hello.
   */
  _.prop(this, 'value', null, function(val) {
    if(_.isNull(this.value)) {
      throw new Error('Node was not constructed with value, value cannot be set');
    }
    if(!(val instanceof Value)) {
      val = new Value(val);
    }

    if(val.type === this.type) {
      this._value = val;
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
  return _.propFunc(this._attributes, key, value);
};

Node.prototype.config = function(key, value) {
  return _.propFunc(this._config, key, value);
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
    if(!_.isNull(item['?invoke']) || !_.isNull(item['$function'])) {
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

  data['$is'] = this.profile;

  _.each(this._config, function(obj, key) {
    if(key !== 'name' && key !== 'is')
      data.push(['$' + key, obj]);
  });

  _.each(this._attributes, function(obj, key) {
    data.push(['@' + key, obj]);
  });

  _.each(this.children, function(child) {
    data.push(child.toStreamData(true));
  });

  return data;
};

Node.prototype.save = function() {
  var data = {};

  _.each(this._config, function(obj, key) {
    data['$' + key] = obj;
  });

  _.each(this._attributes, function(obj, key) {
    data['@' + key] = obj;
  });

  _.each(this.children, function(child) {
    data[child.id] = child.save();
  });

  if(!_.isNull(this.value)) {
    data['?value'] = this.value.value;
  }

  return data;
};

function ActionNode(id, opt) {
  Node.call(this, id, opt);

  this._config.invokable = this._config.invokable || 'read';

  _.prop(this, 'functionName', function() {
    return this._config.function;
  }, function(val) {
    this._config.function = val;

    var node = this;
    while(_.isNull(node.functionReg)) {
      node = node.parent;
    }

    if(!_.isNull(node.functionReg[val])) {
      this.action = node.functionReg[val];
    }
  });
}

_.inherits(ActionNode, Node);

ActionNode.prototype.invoke = function(params) {
  return this.action.cb(this, params);
};

ActionNode.prototype.toStreamData = function(isChild) {
  var parent = Node.prototype.toStreamData.call(this, isChild);

  if(isChild) {
    parent[1].$invokable = this._config.invokable;
  } else {
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

ActionNode.prototype.save = function() {
  var parent = Node.prototype.save.call(this);

  if(!_.isNull(this.functionName))
    parent['$function'] = this.functionName;

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
