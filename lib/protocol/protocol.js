var _ = require('../internal.js');

module.exports = _.mixin({},
  require('./link.js'), 
  require('./method.js'));