var DS = require('../index.js');

var provider = new DS.NodeProvider();

var ToggleLocker = DS.Node.createNode({
  onInvoke: function(params) {
    this.value = true;
  }
});

client.connect('http://localhost:8080').then(function() {
  provider.load({
    locker1: {
      open: {
        '$is': ToggleLocker,
        '$invokable': 'read'
      },
      opened: {
        '$type': 'bool',
        '?value': false
      }
    },
    locker2: {
      open: {
        '$is': ToggleLocker,
        '$invokable': 'read'
      },
      opened: {
        '$type': 'bool',
        '?value': false
      }
    }
  });

  provider.attribute('hello', 'hello world');
});
