var DS = require('../dist/dslink.js');

// Process the arguments and initializes the default nodes.
var link = new DS.LinkProvider(process.argv.slice(2), "simple-responder-new-js-", {
  defaultLogLevel: "INFO",
  defaultNodes: {
    "Message": {
      "$type": "string", // The type of the node is a string.
      "$writable": "write", // This node's value can be set by a requester.
      "?value": "Hello World" // The default message value.
    }
  }
});

// Connect to the broker.
link.connect().then(function() {
  console.log(link.getNode('/Message'));
});
