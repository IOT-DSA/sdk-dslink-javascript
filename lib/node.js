var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    value = require('./value.js'),
    trends = require('./trends.js'),
    _ = require('./internal.js');

function DSNode(name) {
  // 'private' variables go here.
  this.__priv__ = {};

  // super constructor
  EventEmitter.call(this);

  _.immutable(this, 'name', name);
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

inherits(DSNode, EventEmitter);

DSNode.prototype.getPath = function() {
  var _this = this;
  var tree = [];

  while (!_.isNull(_this.parent)) {
    tree.push(_this.name);
    _this = _this.parent;
  }

  tree = tree.reverse();
  return '/' + tree.join('/');
};

DSNode.prototype.hasValue = function() {
  return !_.isNull(this.value);
};

DSNode.prototype.hasValueHistory = function() {
  return false;
};

DSNode.prototype.getValueHistory = function() {
  return null;
};

DSNode.prototype.getDisplayValue = function(value) {
  return null;
};

DSNode.prototype.addChild = function(child) {
  this.children[child.name] = child;
  child.parent = this;
  this.emit('treeChanged', this);
  return this;
};

DSNode.prototype.createChild = function(displayName, obj) {
  var recording = !_.isNull(obj.recording) ? obj.recording : false;
  
  var name = _.replaceAll(displayName, ' ', '_');
  var node = recording ? new RecordingNode(name) : new DSNode(name);
  this.addChild(node);

  if(!_.isNull(obj.value)) node.value = obj.value;
  node.displayName = displayName;
  node.icon = obj.icon;

  return node;
};

DSNode.prototype.addAction = function(action) {
  this.actions[action.name] = action;
};

DSNode.prototype.removeAction = function(action) {
  this.actions[action.name] = undefined;
};

DSNode.prototype.invokeAction = function(name, args) {
  var action = this.actions[name];
  if (!_.isNull(action)) {
    return action.invoke(args);
  }
  return null;
};

DSNode.prototype.toMap = function() {
  var map = {
    'path': this.getPath(),
    'name': this.displayName,
    'hasChildren': Object.keys(this.children).length !== 0,
    'hasValue': this.hasValue(),
    'hasHistory': this.hasValueHistory(),
    'watchable': this.isWatchable,
    'type': this.valueType.name,
    'actions': Object.keys(this.actions).map(function(action) { return this.actions[action].toMap(); }, this)
  };
  if(!_.isNull(this.icon))
    map.icon = this.icon;
  if(!_.isNull(this.updateInterval))
    map.configs.updateInterval = this.updateInterval;

  map = _.merge(map, this.valueType.toMap(false));

  return map;
};

function DSRecordingNode() {
  // super constructor
  DSNode.call(this);
  this.values = [];
  this.__priv__.start = new Date();

  this.on('valueChanged', function(node) {
    values.push(node.value);
  });
}

inherits(DSRecordingNode, DSNode);

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
    'parameters': Object.keys(this.params).map(function(param) { return listParams(this.params, param, false); }, this)
  };
  if(this.results) {
    map.results = Object.keys(this.results).map(function(result) { return listParams(this.results, result, true); }, this);
  }

  return map;
};

module.exports = {
  'Node': DSNode,
  'RecordingNode': DSRecordingNode,
  'Action': DSAction
};
