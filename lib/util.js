var _ = require('./internal.js');

function Poller(callback) {
  // 'private' variables go here.
  this.__priv__ = {};
  this.__priv__.timer = null;

  this.callback = callback;

  return Object.freeze(this);
}

Poller.prototype.poll = function(duration) {
  if(!_.isNull(this.__priv__.timer)) {
  	throw ("Poller already started!");
  }

  this.__priv__.timer = setInterval(this.callback, duration);
};

Poller.prototype.cancel = function() {
  if(!_.isNull(this.__priv__.timer)) clearInterval(this.__priv__.timer);
  this.__priv__.timer = null;
};

var Duration = {
  'milliseconds': function(duration) {
    return duration;
  },
  'seconds': function(duration) {
    return duration * 1000;
  },
  'minutes': function(duration) {
    return duration * 60000;
  },
  'hours': function(duration) {
    return duration * 3600000;
  }
};

module.exports = {
  'Poller': Poller,
  'Duration': Duration
};