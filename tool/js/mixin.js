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
  if(typeof(provider) === 'function') {
    var temp = provider;
    cb = provider;
    provider = temp;
  }
  
  SimpleNode_super.call(this, path, provider);
  this.cb = cb;
}

SimpleActionNode.prototype = Object.create(SimpleNode_super.prototype);

SimpleActionNode.prototype.onInvoke = function(params) {
  return this.cb(params, this);
};

module.exports.SimpleActionNode = SimpleActionNode;

function UnserializableNode(path, provider) {
  SimpleNode_super.call(this, path, provider);
  this.serializable = false;
}

UnserializableNode.prototype = Object.create(SimpleNode_super.prototype);

module.exports.UnserializableNode = UnserializableNode;

var bannedChars = {
  '%': '%25',
  '.': '%2E',
  '/': '%2F',
  '\\': '%5C',
  '?': '%3F',
  '*': '%2A',
  ':': '%3A',
  '|': '%7C',
  '<': '%3C',
  '>': '%3E',
  '$': '%24',
  '@': '%40',
  ',': '%2C'
};

module.exports.encodeNodeName = function(str) {
  Object.keys(bannedChars).forEach(function(char) {
    str = str.split(char).join(bannedChars[char]);
  });

  return str;
};
