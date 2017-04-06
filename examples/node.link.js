"use strict";

const DS = require('../dist/dslink.node.min.js');
var time = Date.now();

var myNode = DS.createNode({});

console.log("startup: " + (Date.now() - time));
var a = DS.buildEnumType(['a', 'b', 'c']);
console.log(a);

var link = new DS.LinkProvider(process.argv.slice(2), "simple-responder-new-js-", {
    defaultLogLevel: "INFO",
    defaultNodes: {
        a: {
          $is: 'start'
        }
    },
    profiles: {
      start(path, provider) {
        console.log('start profile');
        return new myNode(path, provider);
      }
    }
});

time = Date.now();

link.connect().then(function () {
    console.log("connect: " + (Date.now() - time));
    console.log("connected!");
}).catch(e => console.log(e));