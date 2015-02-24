var assert = require('assert'),
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

describe('Method', function() {
  var provider;
  var responder;

  before(function() {
    responder = new DS.Responder(new TestClient(), provider);
  });

  beforeEach(function() {
    provider = new DS.NodeProvider();
    responder.provider = provider;
  });

  it('invoke', function(done) {
    var invoked = false;
    var action = new DS.Action(function(node, params) {
      invoked = true;
    });

    provider.root.load({
      test: {
        '$invokable': 'read',
        '?invoke': action
      }
    });

    responder.client.once('send', function(msg) {
      var res = msg.responses[0];
      assert(res.rid === 1);
      assert(res.stream === 'closed');
      assert(invoked);

      responder.client.done();
      done();
    });
    responder.client.receiveMessage({
      requests: [{
        rid: 1,
        method: 'invoke',
        path: '/test'
      }]
    });
  });

  it('subscribe', function(done) {
    responder.client.done();
    responder.client.start();
    provider.root.load({
      test: {
        '?value': new DS.Value(true)
      }
    });

    responder.client.once('send', function(msg) {
      var sub = msg.responses[0];
      var res = msg.responses[1];

      assert(sub.rid === 0);
      assert(sub.stream === 'open');

      var update = sub.updates[0];

      assert(update.path === '/test');
      assert(update.value === true);
      assert(!_.isNull(update.timestamp));

      assert(res.rid === 2);
      assert(res.stream === 'closed');

      responder.client.done();
      done();
    });
    responder.client.receiveMessage({
      requests: [{
        rid: 2,
        method: 'subscribe',
        paths: ['/test']
      }]
    });
  });
});
