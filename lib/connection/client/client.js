var Requester = require('../../requester/requester.js').Requester,
    Responder = require('../../responder/responder.js').Responder,
    EventEmitter = require('events').EventEmitter,
    Poller = require('../../util.js').Poller,
    _ = require('../../internal');

function Client(args) {

  this._pollerInterval = 200;

  this._poller = new Poller(function() {
    var requests = [];
    var responses = [];

    if(this.requester !== null)
      requests = this.requester._tick();
    if(this.responder !== null)
      responses = this.responder._tick(this);

    if(requests.length > 0 || responses.length > 0) {
      this.sendMessage({
        requests: requests,
        responses: responses
      });
    }
  }.bind(this));

  // public variables

  this.responder = null;
  this.requester = null;

  _.each(args, function(arg) {
    if(arg instanceof Requester) {
      if(this.requester !== null)
        throw 'Only one Requester can be specified.';
      this.requester = arg;
    }

    if(arg instanceof Responder) {
      if(this.responder !== null)
        throw 'Only one Responder can be specified.';
      this.responder = arg;
    }
  }, this);
}

module.exports = {
  Client: Client
};
