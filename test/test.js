var assert = require('assert'),
    DS = require('../index.js'),
    TestClient = require('./test.client.js'),
    _ = require('../lib/internal/util.js');

describe('Value', function() {
  describe('constructor', function() {
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

  it('addNode()', function() {
    var provider = new DS.NodeProvider();
    provider.addNode('/one');

    assert(!_.isNull(provider.root.children['one']));

    try {
      provider.addNode('/');
      assert(false);
    } catch(e) {}

    try {
      provider.addNode('/one');
      assert(false);
    } catch(e) {}
  });
});

describe('Node', function() {
  it('constructor', function() {
    var node = new DS.Node('test');
    assert(node.id === node.name);

    node = new DS.Node('test', {
      '$name': 'pizza',
      '@hello': 'hello world!',
      '?value': 2,
      '$type': 'bool'
    });

    assert(node.id === 'test');
    assert(node.name === 'pizza');
    assert(node.attribute('hello') === 'hello world!');
    assert(node.value.value === 2);
    assert(node.type === 'number');

    node = new DS.Node('test', {
      '?value': new DS.Value(2)
    });

    assert(node.value.value === 2);
    assert(node.type === 'number');
  });

  it('config properties', function() {
    var node = new DS.Node('test');

    assert(node.name === node.__priv__.config.name);
    assert(node.profile === node.__priv__.config.is);
    assert(node.type === node.__priv__.config.type);
  });

  it('value', function() {
    var node = new DS.Node('test');

    try {
      node.value = true;
      assert(false);
    } catch(e) {}

    var node = new DS.Node('test', {
      '?value': true
    });

    try {
      node.value = 0;
      assert(false);
    } catch(e) {}

    node.value = false;
    assert(node.value.value === false);

    node.value = new DS.Value(true);
    assert(node.value.value === true);
  });

  it('attribute()', function() {
    var node = new DS.Node('test', {
      '@one': 1,
      '@two': 2
    });

    assert(_.typeOf(node.attribute()) === 'object');

    assert(node.attribute('one') === 1);
    assert(node.attribute('two') === 2);

    node.attribute('one', 2);
    node.attribute('two', 3);

    assert(node.attribute('one') === 2);
    assert(node.attribute('two') === 3);

    node.attribute({
      one: 3,
      two: 4
    });

    assert(node.attribute('one') === 3);
    assert(node.attribute('two') === 4);

    node.attribute('three', 3);
    assert(node.attribute('three') === 3);

    node.attribute('three', null);
    assert(Object.keys(node.attribute()).indexOf('three') === -1);
  });

  // fun with tests
  it('config()', function() {
    var node = new DS.Node('test', {
      '$name': 'pizza'
    });

    assert(_.typeOf(node.config()) === 'object');

    assert(node.config('name') === 'pizza');
    assert(node.config('is') === 'node');

    node.config('name', 'ice cream');
    node.config('is', 'io.js');

    assert(node.config('name') === 'ice cream');
    assert(node.config('is') === 'io.js');

    node.config({
      name: 'mountain dew',
      is: 'rhino'
    });

    assert(node.config('name') === 'mountain dew');
    assert(node.config('is') === 'rhino');

    node.config('invokable', 'read');
    assert(node.config('invokable') === 'read');

    node.config('invokable', null);
    assert(Object.keys(node.config()).indexOf('invokable') === -1);
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
      // make sure it's only called once
      invoked = !invoked;
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

  it('subscribe/unsubscribe', function(done) {
    responder.client.done();
    responder.client.start();
    provider.root.load({
      test: {
        '?value': true
      }
    });

    var count = 0;
    var subscribeHandler = function(msg) {
      count++;

      if(count === 1) {
        var sub = msg.responses[0];
        var res = msg.responses[1];

        assert(sub.rid === 0);
        assert(sub.stream === 'open');

        var update = sub.updates[0];

        assert(update.path === '/test');
        assert(update.value === true);
        assert(!_.isNull(update.ts));

        assert(res.rid === 2);
        assert(res.stream === 'closed');

        provider.getNode('/test').value = false;
      }

      if(count === 2) {
        var sub = msg.responses[0];

        assert(sub.rid === 0);
        assert(sub.stream === 'open');

        var update = sub.updates[0];

        assert(update.path === '/test');
        assert(update.value === false);
        assert(!_.isNull(update.ts));

        responder.client.receiveMessage({
          requests: [{
            rid: 3,
            method: 'unsubscribe',
            paths: ['/test']
          }]
        });
      }

      if(count === 3) {
        var res = msg.responses[0];

        assert(res.rid === 3);
        assert(res.stream === 'closed');
        assert(Object.keys(responder.client.streamResponse(0).nodes).length === 0);

        responder.client.removeListener('send', subscribeHandler);
        responder.client.done();
        done();
      }
    };

    responder.client.on('send', subscribeHandler);

    responder.client.receiveMessage({
      requests: [{
        rid: 2,
        method: 'subscribe',
        paths: ['/test']
      }]
    });
  });
});
