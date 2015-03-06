var _ = require('goal');

module.exports = function addMembers(aliasMap) {
  return {
    $runAfter: ['ids-computed'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      _.each(docs, function(doc) {
        if(doc.codeNode.type !== 'ExpressionStatement' ||
            doc.codeNode.expression.type !== 'AssignmentExpression')
          return;

        if(doc.codeNode.expression.right.type !== 'FunctionExpression')
          return;

        if(typeof doc.codeNode.expression.left.object === 'undefined')
          return;

        if(doc.codeNode.expression.left.object.property.name === 'prototype') {
          var parent = '';
          if(doc.codeNode.expression.left.object.object.type === 'Identifier') {
            parent = doc.codeNode.expression.left.object.object.name;
          } else if(doc.codeNode.expression.left.object.object.type === 'MemberExpression') {
            parent = doc.codeNode.expression.left.object.object.property.name;
          }

          if(parent !== '' && aliasMap.getDocs(parent).length > 0) {
            doc.memberof = parent;
          }
        }
      });
    }
  }
};
