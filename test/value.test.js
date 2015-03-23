var assert = require('assert'),
    DS = require('../index.js'),
    _ = require('../lib/internal');

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
      assert(new DS.Value({}).type === DS.ValueType.MAP);
      assert(new DS.Value(new Object()).type === DS.ValueType.MAP);
      assert(new DS.Value([]).type === DS.ValueType.LIST);
      assert(new DS.Value(new Array()).type === DS.ValueType.LIST);

      assert.throws(function() {
        new DS.Value();
      });
    });

    it('isValid', function() {
      assert(!(new DS.Value(1)).isValid(DS.ValueType.LIST));
      assert((new DS.Value(1)).isValid(DS.ValueType.NUMBER));
    });

    it('is immutable', function() {
      try {
        var value = new DS.Value(true);
        value.value = false;
        assert(false);
      } catch(e) {}
    });
  });

  it('toString()', function() {
    var value = new DS.Value(true);
    assert(value.value === true);
    assert(value.toString() === 'true');
  });
});
