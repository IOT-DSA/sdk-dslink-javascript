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
  	return {
  	  'nodes': children.map(function(child) {
  	  	return node.children[child].toMap();
  	  })
  	};
  }

  children.forEach(function(child, index) {
  	var res = ({
  	  'nodes': node.children[child].toMap()
  	});
  	if(index === 0)
  	  res.partial = 'nodes';
  	else if(index === children.length - 1)
  	  res.done = true;
  	
  	return res;
  });
};

Method.GetNode = function(link, req, reply) {
  var node = link.resolvePath(req.path);

  return {
  	'node': node.toMap()
  };
};

Method.GetValue = function(link, req, reply) {
  var node = link.resolvePath(req.path);
  var map = node.value.toMap();
  map.path = req.path;

  return map;
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

  return node.getValueHistory().toMap();
};

Method.Invoke = function(link, req, reply) {
	var node = link.resolvePath(req.path),
      action = req.action,
      params = req.parameters;

  var map = {},
      results = node.invokeAction(action, params);

  if(!_.isNull(results) && results.length > 0) {
    Object.keys(results).forEach(function(result) {
      if(node.actions[action].hasTableReturn) {
        results[node.actions[action].tableName] = results[result].toMap();
      } else {
        results[result] = results[result].value;
      }
    });

    map.results = results;
  }

  map.path = req.path;
  return map;
};

Method.Subscribe = function(link, req, reply) {
  var nodes = req.paths.map(function(path) { return link.resolvePath(path); });

  var values = [];
  nodes.forEach(function(node) {
    var count = 0;
    link.subscribe(node, function() {
      link.send({
        'responses': [{
          'method': 'UpdateSubscription',
          'updateId': ++count,
          'values': [node.value.toMap()]
        }]
      });
    });

    values.push(node.value.toMap());
  });

  link.send({
    'responses': [{
      'method': 'Subscription',
      'values': values
    }]
  });
};

Method.Unsubscribe = function(link, req, reply) {
  var nodes = req.paths.map(function(path) { return link.resolvePath(path); });

  nodes.forEach(function(node) {
    link.unsubscribe(node);
  });

  return {};
};

Method.SubscribeNodeList = function(link, req, reply) {
  var node = link.resolvePath(req.path);

  if(node.isWatchable) {
    var count = 0;
    link.subscribeNodeList(node, function() {
      link.send({
        'responses': [
          _.merge(Method.GetNodeList(link, req, reply), {
            'method': 'UpdateNodeList',
            'updateId': ++count
          })
        ]
      });
    });
  }

  return Method.GetNodeList(link, req, reply);
};

Method.UnsubscribeNodeList = function(link, req, reply) {
  var node = link.resolvePath(req.path);
  link.unsubscribeNodeList(node);

  return {};
};

module.exports = {
  'Method': Object.freeze(Method)
};