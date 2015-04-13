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

  it('getNodesByAttributeValue()', function() {
    var provider = new DS.NodeProvider();
    var child1 = new DS.Node('child')
    child1.load({
      '@test': 'test_value'
    });
    var child2 = new DS.Node('child2')
    child2.load({
      '@testfalse': 'test_value'
    });
    var child3 = new DS.Node('child3')
    child3.load({
      '@test': 'test_value'
    });
    provider.addChild(child1);
    provider.addChild(child2);
    provider.addChild(child3);
    var nodes = provider.getNodesByAttributeValue('test', 'test_value');
    assert(nodes.length === 2);
    assert(nodes[0] === child1);
    assert(nodes[1] === child3);
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

  it('is()', function() {
    var provider = new DS.NodeProvider();

    var Hello = new DS.Node.createNode({
      onInvoke: function() {
        this.test = true;
      }
    });

    provider.is('hello', Hello);

    provider.load({
      'hello': {
        '$is': 'hello'
      }
    });

    provider.getNode('/hello').onInvoke();
    assert(provider.getNode('/hello').test);
  });
});
