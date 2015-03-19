var assert = require('assert'),
    DS = require('../index.js'),
    _ = require('../lib/internal');

describe('NodeProvider', function() {
  it('getNode()', function() {
    var provider = new DS.NodeProvider();
    var child = new DS.Node('child');
    provider.addChild(child);

    assert(provider.getNode('/') === provider);
    assert(provider.getNode('') === provider);
    assert(provider.getNode('/child') === child);
    assert(provider.getNode('// /child') === child);
  });

  it('addNode()', function() {
    var provider = new DS.NodeProvider();
    provider.addNode('/one');

    assert(!_.isNull(provider.children['one']));

    try {
      provider.addNode('/');
      assert(false);
    } catch(e) {}

    try {
      provider.addNode('/one');
      assert(false);
    } catch(e) {}
  });

  it('function()', function() {
    var provider = new DS.NodeProvider();

    var test = false;
    provider.function('hello', new DS.Action(function() {
      test = true;
    }));

    provider.load({
      'hello': {
        '$function': 'hello'
      }
    });

    provider.getNode('/hello').invoke();
    assert(test);
    assert(provider.getNode('/hello').action === provider.function('hello'));
  });
});
