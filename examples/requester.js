var DS = require('../index.js');

var requester = new DS.Requester();
var client = new DS.WebSocketClient('jsrequester', requester);
var keys = DS.ECDH.importKey('uhj7Q+GoK7HIrbfJLE+15arEuRMLluxHK6PQDCTdoOY=');

client.connect({
  hostname: 'http://rnd.iot-dsa.org:8081/conn',
  keys: keys
}).then(function() {
  var stream = requester.list('/conns');

  stream.on('data', function(data) {
    console.log(data);
  });
});
