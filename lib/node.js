var value = require('./value.js'),
    Value = value.Value,
    DSError = require('./error.js').Error,
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

    if(val instanceof DSError) {
      this._value = val;
      this.emit('value', val);
      return;
    }

    if(!(val instanceof Value)) {
      val = new Value(val);
    }

    if((this.type.indexOf('enum') !== -1 &&
        _.typeOf(this._value.value) === 'string' &&
        this.type.substring(5).split(',').indexOf(this.value) !== -1) ||
        val.type === this.type) {
      this._value = val;
      this.emit('value', val);
      return;
    } else {
      throw new Error('Value has incorrect type');
    }
  }.bind(this));

  _prop(this, 'name');
  _prop(this, 'type');
  _prop(this, 'profile', 'is');
  _prop(this, 'invokable');
  _prop(this, 'mixin');
  _prop(this, 'interface');


  _.each(opt, function(item, key) {
    _load(this, item, key);
  }, this);

  this.profile = this.profile || 'node';
  this.name = this.name || id;

  this.parent = null;
}

Node.createNode = function(obj) {
  function Child() { Node.apply(this, arguments); }
  _.inherits(Child, Node);
  _.mixin(Child.prototype, obj);
  return Child;
};

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
  return _.propFunc.bind(this)(this._attributes, key, value, 'attribute');
};

Node.prototype.config = function(key, value) {
  return _.propFunc.bind(this)(this._config, key, value, 'config');
};

Node.prototype.addChild = function(child) {
  this.children[child.id] = child;
  child.parent = this;
  if(!_.isNull(this.onChildCreated)) {
    this.onChildCreated(child);
  }

  if(!_.isNull(child.onCreated)) {
    child.onCreated();
  }
  this.emit('child', child, child.toStreamData(true));
  return this;
};

Node.prototype.removeChild = function(id) {
  var child = this.children[id];
  if(!_.isNull(child.onRemoved)) {
    child.onRemoved();
  }

  delete this.children[id];
  child.parent = null;

  this.emit('child', child, null);
  if(!_.isNull(this.onChildRemoved)) {
    this.onChildRemoved(child);
  }
  return child;
};

Node.prototype.load = function(map) {
  _.each(map, function(item, key) {
    if(_load(this, item, key))
      return;

    var child;
    var provider = this;
    while(_.isNull(provider.profileReg)) {
	    provider = provider.parent;
	  }

    if(!_.isNull(item['$is']) && !_.isNull(provider.profileReg[item['$is']])) {
      var Child = (provider.profileReg[item['$is']]);
      child = new Child(key);
    } else {
      child = new Node(key);
    }

    child.parent = this;
    child.load(item);
    this.addChild(child);
  }, this);
};

Node.prototype.toStreamData = function(isChild) {
  isChild = isChild || false;

  if(isChild) {
    var data = [this.id, {
      '$is': this.profile,
      '$name': this.name
    }];

    if(this.mixin) {
      data[1].$mixin = this.mixin;
    }

    if(this.invokable) {
      data[1].$invokable = this.invokable;
    }

    if(this.type) {
      data[1].$type = this.type;
    }

    if(this.interface) {
      data[1].$interface = this.interface;
    }

    return data;
  }

  var data = [];

  data.push(['$is', this.profile]);

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

  data['$is'] = this.profile;

  if(!_.isNull(this.name) && this.name !== '') {
    data['$name'] = this.name;
  }

  _.each(this._config, function(obj, key) {
    if(key !== 'name' && key !== 'is')
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

module.exports = {
  'Node': Node
};
