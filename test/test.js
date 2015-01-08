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
      assert((new DS.Value(1.1)).type === DS.ValueType.NUMBER);
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
    assert(!(new DS.Value("Hello world!")).isTruthy());
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
  
  it('should properly add an action to the map', function () {
    var action = new DS.Action("One", undefined, {
      'params': {
        'one': DS.ValueType.STRING,
        'two': DS.ValueType.STRING
      },
      'results': {
        'three': DS.ValueType.STRING,
        'four': DS.ValueType.STRING
      }
    });
    var node = new DS.Node("Hello");
    node.addAction(action);
    
    console.log(node);
    //assert(node.actions.One.params.
  });
});

describe('Actions', function() {
  it("should create a proper action", function() {
    var action = new DS.Action("One", undefined, {
      'params': {
        'one': DS.ValueType.STRING,
        'two': DS.ValueType.STRING
      },
      'results': {
        'three': DS.ValueType.STRING,
        'four': DS.ValueType.STRING
      }
    });
    assert(action.params.one !== undefined);
    assert(action.results.three !== undefined);
  });

  it("should create a proper action map", function() {
    var action = new DS.Action("One", undefined, {
      'params': {
        'one': DS.ValueType.STRING,
        'two': DS.ValueType.STRING
      },
      'results': {
        'three': DS.ValueType.STRING,
        'four': DS.ValueType.STRING
      }
    });
    var map = action.toMap();
    assert(map.name === 'One');
    assert(map.parameters[0].name === 'one');
    assert(map.results[0].name === 'three');
  });
});

describe('Link', function() {
  it("Should be able to add nodes with actions to a link", function() {
    var action = new DS.Action("One", undefined, {
      'params': {
        'one': DS.ValueType.STRING,
        'two': DS.ValueType.STRING
      },
      'results': {
        'three': DS.ValueType.STRING,
        'four': DS.ValueType.STRING
      }
    });
    var node = new DS.Node("Hello");
    var link = new DS.Link("New_Link");
    
    node.addAction(action);
    link.rootNode.addChild(node);
    
    assert(link.rootNode.children.Hello.actions.One.params.one !== undefined);
    assert(link.rootNode.children.Hello.actions.One.results.three !== undefined);
  });
});

describe('Rollups', function() {
  it('avg()', function() {
    var a = new DS.Value(1);
    var b = new DS.Value(3.5);
    var c = new DS.Value(true);

    assert(DS.Rollup.avg([a, b]).value === 2.25);
    assert(DS.Rollup.avg([b, a]).value === 2.25);

    try {
      DS.Rollup.avg([a, c]);
      assert(false);
    } catch(e) {
    }
  });

  it('min()', function() {
    var a = new DS.Value(1);
    var b = new DS.Value(3.5);
    var c = new DS.Value(false);
    var d = new DS.Value(null);
    var e = new DS.Value("Hello world!");

    assert(DS.Rollup.min([a, b]).value === 1);
    assert(DS.Rollup.min([c, a]).value === false);
    assert(DS.Rollup.min([a, d]).value === null);
    assert(DS.Rollup.min([a, a]).value === 1);
    assert(DS.Rollup.min([e, d]) === e);
  });

  it('max()', function() {
    var a = new DS.Value(2);
    var b = new DS.Value(3.5);
    var c = new DS.Value(false);
    var d = new DS.Value(null);
    var e = new DS.Value("Hello world!");

    assert(DS.Rollup.max([a, b]).value === 3.5);
    assert(DS.Rollup.max([a, c]).value === 2);
    assert(DS.Rollup.max([a, d]).value === 2);
    assert(DS.Rollup.max([a, a]).value === 2);
    assert(DS.Rollup.max([e, d]).value === null);
  });

  it('sum()', function() {
    var a = new DS.Value(1);
    var b = new DS.Value(3.5);
    var c = new DS.Value(true);

    assert(DS.Rollup.sum([a, b]).value === 4.5);
    assert(DS.Rollup.sum([b, a]).value === 4.5);

    try {
      DS.Rollup.sum([a, c]);
      assert(false);
    } catch(e) {
    }
  });

  it('first()', function() {
    var a = new DS.Value(1);
    var b = new DS.Value(3.5);

    assert(DS.Rollup.first([a, b]) === a);
    assert(DS.Rollup.first([b, a]) === b);
  });

  it('last()', function() {
    var a = new DS.Value(1);
    var b = new DS.Value(3.5);

    assert(DS.Rollup.last([a, b]) === b);
    assert(DS.Rollup.last([b, a]) === a);
    assert(DS.Rollup.last([new DS.Value(1), a, b]) === b);
  });

  it('or()', function() {
    var a = new DS.Value(0);
    var b = new DS.Value(null);
    var c = new DS.Value(1);
    var d = new DS.Value("true");

    assert(DS.Rollup.or([a, b]).value == false);
    assert(DS.Rollup.or([a, c]).value == true);
    assert(DS.Rollup.or([a, d]).value == true);
    assert(DS.Rollup.or([c, d]).value == true);
  });

  it('and()', function() {
    var a = new DS.Value(0);
    var b = new DS.Value(null);
    var c = new DS.Value(1);
    var d = new DS.Value("true");

    assert(DS.Rollup.and([a, b]).value == false);
    assert(DS.Rollup.and([a, c]).value == false);
    assert(DS.Rollup.and([a, d]).value == false);
    assert(DS.Rollup.and([c, d]).value == true);
  });

  it('count()', function() {
    var a = new DS.Value(0);
    var b = new DS.Value(null);

    assert(DS.Rollup.count([]).value == 0);
    assert(DS.Rollup.count([a, b]).value == 2);
  });
});

describe('SingleRowTables', function() {
  var table;
  before(function() { 
    table = new DS.SingleRowTable({
      'name': DS.ValueType.STRING,
      'age': DS.ValueType.INTEGER
    }, {
      'name': new DS.Value("Alex"),
      'age': new DS.Value(15)
    });
  });

  it('has correct column count', function() {
    assert(table.columnCount === 2);
  });

  it('only iterates once', function() {
    assert(table.next() === true);
    assert(table.next() === false);
  });

  it('correctly selects columns', function() {
    assert(table.get(0).value === "Alex");
    assert(table.get(1).value === 15);
  });

  it('has correct column names', function() {
    assert(table.getColumnName(0) === "name");
    assert(table.getColumnName(1) === "age");
  });

  it('has correct column types', function() {
    assert(table.getColumnType(0) === DS.ValueType.STRING);
    assert(table.getColumnType(1) === DS.ValueType.INTEGER);
  });
});