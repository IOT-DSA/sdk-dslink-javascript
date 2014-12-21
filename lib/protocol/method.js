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

Method.GetValueHistory = function() {
	
};

Method.Invoke = function() {
	
};

Method.Subscribe = function() {

};

Method.Unsubscribe = function() {

};

module.exports = {
  'Method': Object.freeze(Method)
};