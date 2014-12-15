var assert = require('better-assert'),
    DS = require('../index.js');

describe('Value', function() {
  describe('determineType', function() {
    it('should identify strings', function() {
      assert((new DS.Value("Hello")).type === DS.ValueType.STRING);
    });

    it('should identify booleans', function() {
      assert((new DS.Value(true)).type === DS.ValueType.BOOLEAN);
    });

    it('should identify integers', function() {
      assert((new DS.Value(1)).type === DS.ValueType.INTEGER);
    });

    it('should identify doubles', function() {
      assert((new DS.Value(1.1)).type === DS.ValueType.DOUBLE);
    });

    it('should identify null/undefined', function() {
      assert((new DS.Value(null)).type === DS.ValueType.NULL);
      assert((new DS.Value(undefined)).type === DS.ValueType.NULL);
    });

    it('should throw on unsupported type', function() {
      try {
        new DS.Value({});
        assert(false);
      } catch(e) {
      }
    });
  });

  it('isNull()', function() {
    assert((new DS.Value(null)).isNull());
    assert((new DS.Value(undefined)).isNull());
    assert(!(new DS.Value(0)).isNull());
    assert(!(new DS.Value("")).isNull());
  });

  it('isTruthy()', function() {
    assert((new DS.Value(true)).isTruthy());
    assert((new DS.Value("true")).isTruthy());
    assert((new DS.Value(1)).isTruthy());
    assert(!(new DS.Value(false)).isTruthy());
    assert(!(new DS.Value("false")).isTruthy());
    assert(!(new DS.Value(0)).isTruthy());
  });
});

describe('Node', function() {
  it("should keep identity but change it's path", function() {
    var node = new DS.Node("TestA");
    assert(node.name === "TestA");
    assert(node.getPath() === "/");
    var rootNode = new DS.Node("Root");
    assert(rootNode.name === "Root");
    assert(rootNode.getPath() === "/");
    rootNode.addChild(node);
    assert(node.name === "TestA");
    assert(node.getPath() === "/TestA");
  });
});