var assert = require('better-assert'),
    DS = require('../index.js'),
    TestClient = require('./test.client.js'),
    _ = require('../lib/internal/util.js');

describe('Value', function() {
  it('correctly matches options', function() {
    var date = new Date();
    var value = new DS.Value(null, {
      timestamp: date,
      type: DS.ValueType.BOOLEAN
    });

    assert(value.timestamp === date);
    assert(value.type === DS.ValueType.BOOLEAN);
  });

  it('correctly identifies type', function() {
    assert(new DS.Value(true).type === DS.ValueType.BOOLEAN);
    assert(new DS.Value('').type === DS.ValueType.STRING);
    assert(new DS.Value(new String('')).type === DS.ValueType.STRING);
    assert(new DS.Value(1).type === DS.ValueType.NUMBER);
    assert(new DS.Value(new Number(1)).type === DS.ValueType.NUMBER);
    assert(new DS.Value(null).type === DS.ValueType.NULL);
    assert(new DS.Value(undefined).type === DS.ValueType.NULL);
  });

  it('is immutable', function() {
    try {
      var value = new DS.Value(true);
      value.value = false;
      assert(false);
    } catch(e) {}
  });

  it('isValid()', function() {
    var value = new DS.Value(null, {
      type: DS.ValueType.BOOLEAN
    });

    var value1 = new DS.Value(null, {
      type: DS.ValueType.NULL
    });

    assert(!value.isValid());
    assert(value1.isValid());
  });

  it('toString()', function() {
    var value = new DS.Value(true);
    assert(value.value === true);
    assert(value.toString() === 'true');
  });
});

describe('NodeProvider', function() {
  it('constructor', function() {
    var root = new DS.Node();
    var provider = new DS.NodeProvider(root);
    assert(provider.root === root);
  });

  it('getNode()', function() {
    var provider = new DS.NodeProvider();
    var child = new DS.Node('child');
    provider.root.addChild(child);

    assert(provider.getNode('/') === provider.root);
    assert(provider.getNode('') === provider.root);
    assert(provider.getNode('/child') === child);
    assert(provider.getNode('// /child') === child);
  });
});
