var _ = require('goal');

module.exports = function mergeMembers(aliasMap) {
  return {
    $runAfter: ['addMembers'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      var iter = [].concat(docs);
      _.each(iter, function(doc) {
        console.log(doc.event);
        if(!doc.memberof)
          return;

        var parents = aliasMap.getDocs(doc.memberof);

        if(parents.length <= 0)
          return;

        var parent = parents[0];

        // TODO: Event support
        if(doc.type) {
          parent.properties = parent.properties || [];
          parent.properties.push(doc);
        } else {
          parent.methods = parent.methods || [];
          parent.methods.push(doc);
        }

        aliasMap.removeDoc(doc);
        docs.splice(docs.indexOf(doc), 1);
      });
      return docs;
    }
  };
};
