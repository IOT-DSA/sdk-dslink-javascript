var assert = require('assert'),
    DS = require('../index.js'),
    _ = require('../lib/internal');

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

    assert(node.name === node._config.name);
    assert(node.profile === node._config.is);
    assert(node.type === node._config.type);
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
