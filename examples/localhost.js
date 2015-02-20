var DS = require('../index.js');

var link = new DS.Link(new DS.WebSocketClient("test", "http://localhost:8080"));

link.root.attribute('hello', new DS.Value('hello'));
