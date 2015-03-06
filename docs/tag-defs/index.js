/*
 A small focused set of jsdoc-like tags.
 Adds support for EventEmitter events, etc.

 Tries to enforce a doc-style by having only
 one real way to define certain things.

 DIFFERENCES FROM JSDOC:

 '@memberof Constructor#' is now just
 '@memberof Constructor'.
*/

var jsdoc = 'dgeni-packages/jsdoc/tag-defs/';

module.exports = [
  require(jsdoc + 'name.js'),
  require(jsdoc + 'param.js'),
  require(jsdoc + 'returns.js'),
  require(jsdoc + 'type.js'),
  require(jsdoc + 'description.js'),
  require(jsdoc + 'deprecated.js'),
  require(jsdoc + 'see.js'),
  require(jsdoc + 'constructor.js'),
  require(jsdoc + 'function.js'),
  require('./memberof.js'),
  require('./event.js')
];
