var DS = require('../index.js');

var provider = new DS.NodeProvider();

var Action = DS.Node.createNode({
  onInvoke: function(params) {
    this.value = true;
  }
});

provider.is('action', Action);

(new DS.Link('js-test', provider)).connect('http://localhost:8080/conn').then(function() {
  provider.load({
    locker1: {
      open: {
        '$invokable': 'read',
        '$is': 'action'
      },
      opened: {
        '$type': 'bool',
        '?value': false
      }
    },
    locker2: {
      open: {
        '$invokable': 'read',
        '$is': 'action'
      },
      opened: {
        '$type': 'bool',
        '?value': false
      }
    }
  });

  provider.attribute('hello', 'hello world');
});
