var DS = require('../index.js');

var provider = new DS.NodeProvider();

(new DS.Link('test', provider)).connect('http://localhost:8080/conn').then(function() {
  var action = new DS.Action(function(node, params) {
    node.value = new DS.Value(true);
  });

  provider.load({
    locker1: {
      open: {
        '$invokable': 'read',
        '?invoke': action
      },
      opened: {
        '$type': 'bool',
        '?value': false
      }
    },
    locker2: {
      open: {
        '$invokable': 'read',
        '?invoke': action
      },
      opened: {
        '$type': 'bool',
        '?value': false
      }
    }
  });

  provider.attribute('hello', 'hello world');
});
