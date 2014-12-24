var DS = require('../index.js');

var node = new DS.Node("Hello");
node.value = new DS.Value("Hello world!");

var action = new DS.Action("One", {
  'params': {
  	'one': DS.ValueType.STRING,
  	'two': DS.ValueType.STRING
  },
  'results': {
  	'three': DS.ValueType.STRING,
  	'four': DS.ValueType.STRING
  },
});
node.addAction(action);

console.log(JSON.stringify(node.toMap()));

console.log(JSON.stringify(node.value.toMap()));