function mixin(dest) {
  var count = 1;
  var length = arguments.length;

  for(; count < length; count++) {
    var arg = arguments[count];

    for(var prop in arg) {
      if(arg.hasOwnProperty(prop)) {
        dest[prop] = arg[prop];
      }
    }
  }
  return dest;
}

module.exports.createNode = function(opt) {
  var extend = exports.SimpleNode.class;

  function Node(path) {
    extend.call(this, path);
  }

  Node.prototype = Object.create(extend.prototype);

  mixin(Node.prototype, opt);
  return Node;
};

var SimpleActionNode_super = module.exports.SimpleNode.class;

function SimpleActionNode(path, cb) {
  SimpleActionNode_super.call(this, path);
  this.cb = cb;
}

SimpleActionNode.prototype = Object.create(SimpleActionNode_super.prototype);

SimpleActionNode.prototype.onInvoke = function(params) {
  return this.cb(this, params);
};

module.exports.SimpleActionNode = SimpleActionNode;
