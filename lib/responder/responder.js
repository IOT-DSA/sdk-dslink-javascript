var _ = require('../internal.js');

function Responder() {
}

module.exports = _.mixin({
    Responder: Responder
  },
  require('./link.js'), 
  require('./method.js'));