var DS = require('../index.js');

var node = new DS.Node("Hello");
node.value = new DS.Value("Hello world!");

var mathNode = new DS.Node("Math");

var action = new DS.Action("One", doActionOne, {
  'params': {
  	'one': DS.ValueType.NUMBER,
  	'two': DS.ValueType.NUMBER
  },
  'results': {
  	'sum': DS.ValueType.NUMBER,
  	'product': DS.ValueType.NUMBER
  }
});
mathNode.addAction(action);

console.log(JSON.stringify(node.toMap(),undefined, 2));

console.log(JSON.stringify(node.value.toMap(),undefined, 2));

var link = new DS.Link("New_Link");

link.connect("rnd.iot-dsa.org", function(err, result) {
  link.rootNode.addChild(node);
  link.rootNode.addChild(mathNode);
});

function doActionOne(params) {
  console.log(params);
  var result = {};
  
  result.sum = {value:params.one + params.two};
  result.product = {value:params.one * params.two};
  
  return result;
}