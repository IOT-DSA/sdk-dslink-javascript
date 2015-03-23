var DS = require('../index.js'),
    Promise = Promise || require('es6-promises'),
    EventEmitter = require('events').EventEmitter,
    _ = require('../lib/internal');

function TestClient() {
  DS.Client.call(this, _.args(arguments));
  EventEmitter.call(this);
  this.setMaxListeners(0);
}

_.mixin(TestClient.prototype, DS.Client.prototype, EventEmitter.prototype);

TestClient.prototype.connect = function(opt) {
  return new Promise(function(resolve, reject) {
    this.start();
    resolve();
  });
};

TestClient.prototype.receiveMessage = function(data) {
  if(!_.isNull(data.responses)) {
    _.each(data.responses, function(res) {
      this.emit('response', res);
    }, this);
  }

  if(!_.isNull(data.requests)) {
    _.each(data.requests, function(req) {
      if(this.responder !== null) {
        this.responder.handleRequest(req);
      }
      this.emit('request', req);
    }, this);
  }
};

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

TestClient.prototype.start = function() {
  this._poller.poll(20);
};

TestClient.prototype.done = function() {
  this._poller.cancel();
};

module.exports = TestClient;
