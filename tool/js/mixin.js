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
  var extend = module.exports.SimpleNode.class;

  function Node(path) {
    extend.call(this, path);
  }

  Node.prototype = Object.create(extend);

  mixin(Node.prototype, opt);
  return Node;
};
