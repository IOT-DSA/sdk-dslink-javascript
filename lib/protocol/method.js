var trends = require('../trends.js'),
    rollup = require('../rollup.js'),
    table = require('../table.js'),
    util = require('../util.js'),
    Table = table.Table,
    RollupType = rollup.RollupType,
    TimeRange = trends.TimeRange,
    Interval = trends.Interval,
    _ = require('../internal.js');

var Method = {};

Method.GetNodeList = function(link, req, reply) {
  var node = link.resolvePath(req.path),
      children = Object.keys(node.children);

  // 50 seems awfully high, the abitary number that the Dart SDK uses.
  if(children.length <= 50) {
  	reply({
  	  'nodes': children.map(function(child) {
  	  	return node.children[child].toMap();
  	  })
  	});
  	return;
  }

  children.forEach(function(child, index) {
  	var res = ({
  	  'nodes': node.children[child].toMap()
  	});
  	if(index === 0)
  	  res.partial = 'nodes';
  	else if(index === children.length - 1)
  	  res.done = true;
  	
  	reply(res);
  });
};

Method.GetNode = function(link, req, reply) {
  var node = link.resolvePath(req.path);

  reply({
  	'node': node.toMap()
  });
};

Method.GetValue = function(link, req, reply) {
  var node = link.resolvePath(req.path);
  var map = node.value.toMap();
  map.path = req.path;

  reply(map);
};

Method.GetValueHistory = function(link, req, reply) {
	var node = link.resolvePath(req.path),
      trArray = req.timeRange.split("/"),
      timeRange = TimeRange(Date.parse(trArray[0]), Date.parse(trArray[1])),
      interval = Interval[req.interval],
      rollup = req.rollup;

  if(!_.isNull(rollup) && RollupType.indexOf(rollup) === -1)
    throw "Unsupported rollup type: " + rollup;

  if(!node.hasValueHistory())
    throw "Node does not have value history: " + req.path;

  util.Context.timeRange = timeRange;
  util.Context.interval = interval;
  util.Context.rollupType = rollup;

  reply(node.getValueHistory().toMap());
};

Method.Invoke = function(link, req, reply) {
	var node = link.resolvePath(req.path),
      action = req.action,
      params = req.parameters;

  var map = {},
      results = node.actions[action].invoke(params);

  if(!_.isNull(results) && results.length > 0) {
    Object.keys(results).forEach(function(result) {
      if(results[result] instanceof Table) {
        results[result] = results[result].toMap();
      } else {
        results[result] = results[result].value;
      }
    });

    map.results = results;
  }

  map.path = req.path;
  reply(map);
};

Method.Subscribe = function() {

};

Method.Unsubscribe = function() {

};

module.exports = {
  'Method': Object.freeze(Method)
};