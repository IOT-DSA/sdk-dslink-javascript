var Responder = require('../../responder/responder.js').Responder,
    EventEmitter = require('events').EventEmitter,
    Poller = require('../../util.js').Poller,
    _ = require('../../internal');

function Client(args) {

  this._pollerInterval = 200;

  this._poller = new Poller(function() {
    if(this.responder !== null)
      this.responder.tick(this);
  }.bind(this));

  // public variables

  this.responder = null;
  this.requester = null;

  _.each(args, function(arg) {
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
