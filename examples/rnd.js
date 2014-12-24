var DS = require('../index.js');

(function(undefined) {
    var link = new DS.Link("JS Testing Link");
    link.connect("rnd.iot-dsa.org", function(err) {
        link.loadNode({
            'name': 'Hello',
            'value': "Test"
        });
    });
})();