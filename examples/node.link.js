var time = Date.now();
var DS = require('../dist/dslink.node.min.js');
console.log("startup: " + (Date.now() - time));

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
time = Date.now();
link.connect().then(function() {
  console.log("connect: " + (Date.now() - time));
  console.log("VICTORY SCREECH");
});
