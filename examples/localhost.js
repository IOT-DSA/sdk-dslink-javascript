var DS = require('../index.js');

var link = new DS.Link(new DS.WebSocketClient("test", "https://localhost:8443"));

link.rootNode.attribute('hello', new DS.Value('hello'));
