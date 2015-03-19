var assert = require('assert'),
    DS = require('../index.js'),
    TestClient = require('./client.test.js'),
    _ = require('../lib/internal');

describe('Responder Methods', function() {
  var provider;
  var responder;

  before(function() {
    responder = new DS.Responder(provider);
    client = new TestClient(responder);
  });

  beforeEach(function() {
    provider = new DS.NodeProvider();
    responder.provider = provider;
  });

  it('invoke', function(done) {
    client.start();

    var invoked = false;
    var action = new DS.Action(function(node, params) {
      // make sure it's only called once
      invoked = !invoked;
    });

    provider.load({
      test: {
        '$invokable': 'read',
        '?invoke': action
      }
    });

    client.once('send', function(msg) {
      var res = msg.responses[0];
      assert(res.rid === 1);
      assert(res.stream === 'closed');
      assert(invoked);

      client.done();
      done();
    });

    client.receiveMessage({
      requests: [{
        rid: 1,
        method: 'invoke',
        path: '/test'
      }]
    });
  });

  it('subscribe/unsubscribe', function(done) {
    client.done();
    client.start();

    provider.load({
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

        client.receiveMessage({
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
        assert(Object.keys(client.streamResponse(0).nodes).length === 0);

        client.removeListener('send', subscribeHandler);
        client.done();
        done();
      }
    };

    client.on('send', subscribeHandler);

    client.receiveMessage({
      requests: [{
        rid: 2,
        method: 'subscribe',
        paths: ['/test']
      }]
    });
  });
});
