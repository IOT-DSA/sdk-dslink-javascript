var DS = require('../index.js'),
    _ = require('../lib/internal/util.js');

function TestClient() {
  DS.Client.call(this);
}

_.inherits(TestClient, DS.Client);

TestClient.prototype.receiveMessage = function(data) {
  if(!_.isNull(data.responses)) {
    _.each(data.responses, function(res) {
      this.emit('response', res);
    }, this);
  }

  if(!_.isNull(data.requests)) {
    _.each(data.requests, function(req) {
      this.emit('request', req);
    }, this);
  }
}

TestClient.prototype.sendMessage = function(message) {
  var requests = [];
  var responses = [];

  if(!_.isNull(message.requests))
    requests = requests.concat(message.requests);
  if(!_.isNull(message.responses))
    responses = responses.concat(message.responses);

  var map = {};
  if(requests.length > 0)
    map.requests = requests;
  if(responses.length > 0)
    map.responses = responses;

  this.emit('send', map);
};
