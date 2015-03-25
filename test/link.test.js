var assert = require('assert'),
    DS = require('../index.js'),
    _ = require('../lib/internal');

// not really proper testing, but it's good for now.

if(!_.isNull(DS.Link)) {
  var mock = require('mock' + '-fs');
  var path = require('pa' + 'th');

  describe('Link', function() {
    before(function() {
      var map = {};

      map[path.resolve(process.cwd(), 'dslink.json')] = JSON.stringify({
        configs: {

        }
      });

      mock(map);
    });

    it('works', function() {
      var provider = new DS.NodeProvider();
      var link = new DS.Link('test', provider);

      provider.load({
        hello: {
          '?value': {}
        }
      });

      link.save();
    });
  });
}
