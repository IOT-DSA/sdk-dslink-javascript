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

  function Node(path, provider) {
    extend.call(this, path, provider);
  }

  Node.prototype = Object.create(extend.prototype);

  mixin(Node.prototype, opt);
  return Node;
};

var SimpleNode_super = module.exports.SimpleNode.class;

function SimpleActionNode(path, provider, cb) {
  SimpleNode_super.call(this, path, provider);
  this.cb = cb;
}

SimpleActionNode.prototype = Object.create(SimpleNode_super.prototype);

SimpleActionNode.prototype.onInvoke = function(params) {
  return this.cb(this, params);
};

module.exports.SimpleActionNode = SimpleActionNode;

require('crypto');
require('dhcurve');
