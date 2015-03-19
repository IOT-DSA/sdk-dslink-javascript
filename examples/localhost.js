var DS = require('../index.js');

var provider = new DS.NodeProvider();
var responder = new DS.Responder(provider);
var client = new DS.WebSocketClient('test', responder);

client.connect('http://localhost:8080').then(function() {
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
