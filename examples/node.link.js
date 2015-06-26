var DS = require('../dist/dslink.node.js');

var a = DS.buildEnumType(['a', 'b', 'c']);
console.log(a);

// Process the arguments and initializes the default nodes.
var link = new DS.LinkProvider(process.argv.slice(2), "simple-responder-new-js-", {
  defaultLogLevel: "INFO",
  defaultNodes: {
    a: {}
  }
});

// Connect to the broker.
link.connect();
