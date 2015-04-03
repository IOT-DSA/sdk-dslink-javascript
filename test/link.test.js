var assert = require('assert'),
    DS = require('../index.js'),
    _ = require('../lib/internal');

// not really proper testing, but it's good for now.

if(!_.isNull(DS.Link)) {
  var mock = require('mock' + '-fs');
  var path = require('pa' + 'th');
  var fs = require('f' + 's');

  describe('Link', function() {
    before(function() {
      var map = {};

      map[path.resolve(process.cwd(), 'dslink.json')] = JSON.stringify({
        configs: {}
      });

      mock(map);
    });

    it('generates files correctly', function() {
      var provider = new DS.NodeProvider();
      var link = new DS.Link('test', provider);

      provider.load({
        hello: {
          '?value': {}
        }
      });

      link.save();

      var readdir = fs.readdirSync(process.cwd());
      assert(readdir.indexOf('.dslink.key') >= 0 && readdir.indexOf('ds_nodes.json') >= 0);
    });

    it('loads node structure', function() {
      var provider = new DS.NodeProvider();
      var link = new DS.Link('test', provider);

      assert(!_.isNull(provider.children.hello));
    });
  });
}
