var EventEmitter = require('eventemitter2').EventEmitter2,
    value = require('./value.js'),
    trends = require('./trends.js'),
    _ = require('./internal.js');

function Node(name) {
  // 'private' variables go here.
  this.__priv__ = {};

  // super constructor
  EventEmitter.call(this);

  _.immutable(this, 'name', name);
  _.immutable(this, 'attributes', {});
  _.immutable(this, 'children', {});
  _.immutable(this, 'actions', {});

  this.valueCreator = function() {};
  this.displayName = name;
  this.icon = null;
  this.driver = null;
  this.parent = null;
  this.updateInterval = null;
  this.isWatchable = true;

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

Node.prototype.hasValueHistory = function() {
  return false;
};

Node.prototype.getValueHistory = function() {
  return null;
};

Node.prototype.getDisplayValue = function(value) {
  return null;
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

Node.prototype.addAction = function(action) {
  this.actions[action.name] = action;
};

Node.prototype.removeAction = function(action) {
  this.actions[action.name] = undefined;
};

Node.prototype.invokeAction = function(name, args) {
  var action = this.actions[name];
  if (!_.isNull(action)) {
    return action.invoke(args);
  }
  return null;
};

Node.prototype.toMap = function() {
  var map = {
    'path': this.getPath(),
    'name': this.displayName,
    'hasChildren': Object.keys(this.children).length !== 0,
    'hasValue': this.hasValue(),
    'hasHistory': this.hasValueHistory(),
    'watchable': this.isWatchable,
    'type': this.valueType.name,
    'actions': _.map(Object.keys(this.actions), function(action) { return this.actions[action].toMap(); }, this)
  };
  if(!_.isNull(this.icon))
    map.icon = this.icon;
  if(!_.isNull(this.updateInterval))
    map.configs.updateInterval = this.updateInterval;

  _.mixin(map, this.valueType.toMap(false));

  return map;
};

function DSRecordingNode() {
  // super constructor
  Node.call(this);
  this.values = [];
  this.__priv__.start = new Date();

  this.on('valueChanged', function(node) {
    values.push(node.value);
  });
}

_.inherits(DSRecordingNode, Node);

DSRecordingNode.prototype.hasValueHistory = function() {
  return true;
};

DSRecordingNode.prototype.getValueHistory = function() {
  return trends.Trends.create(valueType, values);
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

DSAction.prototype.toMap = function() {
  var listParams = function(obj, key, table) {
    var returned = {
      'name': key,
      'type': this.hasTableReturn ? 'table' : obj[key].name
    };
    if(['string', 'number', 'bool', 'time', 'duration'].indexOf(returned.type) === -1) {
      if(table ? returned.name !== table : true)
        throw 'Invalid value type for Action parameter! ' + returned.type;
    }
    return returned;
  };

  var map = {
    'name': this.name,
    'parameters': _.map(Object.keys(this.params), function(param) { return listParams(this.params, param, false); }, this)
  };
  if(this.results) {
    map.results = _.map(Object.keys(this.results), function(result) { return listParams(this.results, result, true); }, this);
  }

  return map;
};

module.exports = {
  'Node': Node,
  'RecordingNode': DSRecordingNode,
  'Action': DSAction
};
