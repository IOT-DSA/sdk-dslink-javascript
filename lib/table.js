var _ = require('./internal.js');

function SingleRowTable(columns, values) {
  // 'private' variables go here.
  this.__priv__ = {};
  this.__priv__.next = false;

  _.immutable(this, 'columns', columns || {});
  _.immutable(this, 'values', values || {});
  _.immutable(this, 'names', Object.keys(columns) || []);

  _.getter(this, 'columnCount', function() {
  	return this.names.length;
  });
}

function _toMap(table) {
  var map = {
    columns: [],
    rows: []
  };

  table.names.forEach(function(name) {
    var columnMap = _.merge({
      "name": "value",
      "type": table.columns[name].name
    }, table.columns[name].toMap(false));

    map.columns.push(columnMap);
  });

  while(table.next()) {
    var values = [],
        count = table.columns.length;

    while(--count >= 0) {
      values.push(table.get(count).value);
    }

    map.rows.push(values.reverse());
  }
}

SingleRowTable.prototype.get = function(column) {
  return this.values[this.names[column]];
};

SingleRowTable.prototype.getColumnName = function(column) {
  return this.names[column];
};

SingleRowTable.prototype.getColumnType = function(column) {
  return this.columns[this.names[column]];
};

SingleRowTable.prototype.isNull = function(column) {
  return _.isNull(this.values[this.names[column]]) || this.values[this.names[column]].isNull();
};


SingleRowTable.prototype.next = function() {
  this.__priv__.next = !this.__priv__.next;
  return this.__priv__.next;
};

SingleRowTable.prototype.toMap = function() {
  return _toMap(this);
};

function Table(columns, values) {
  // 'private' variables go here.
  this.__priv__ = {};
  this.__priv__.current = -1;

  _.immutable(this, 'columns', columns || {});
  _.immutable(this, 'values', values || []);
  _.immutable(this, 'names', Object.keys(columns) || []);

  _.get(this, 'columnCount', function() {
  	return this.names.length;
  });
}

Table.prototype.get = function(column) {
  return this.values[this.__priv__.current][this.names[column]];
};
	
Table.prototype.getColumnType = function(column) {
  return this.columns[this.names[column]];
};

Table.prototype.getColumnNames = function(column) {
  return this.names[column];
};

Table.prototype.isNull = function(column) {
  return _.isNull(this.values[this.__priv__.current][this.names[column]]) || this.values[this.__priv__.current][this.names[column]].isNull();
};


Table.prototype.next = function() {
  if(this.values.length === 0)
  	return false;
  this.__priv__.current++;
  if(this.__priv__.current >= this.values.length) {
  	this.__priv__.current = -1;
  	return false;
  }
  return true;
};

Table.prototype.toMap = function() {
  return _toMap(this);
};

module.exports = {
  'SingleRowTable': SingleRowTable,
  'Table': Table
};