var fs = require('fs'),
    path = require('path'),
    curve = require('dhcurve'),
    ECDH = require('../util.js').ECDH,
    Responder = require('../responder/responder.js').Responder,
    WebSocketClient = require('../connection/client/websocket.js').WebSocketClient,
    LogLevel = require('../internal/log.js').LogLevel,
    _ = require('../internal');

function parseArgv() {
  var argv = process.argv;
  var map = {};

  var argument = '';
  _.each(argv, function(value) {
    if(argument !== '') {
      map[argument] = value;
      argument = '';
      return;
    }

    if(value.indexOf('--') === 0) {
      argument = value.substring(2);
    }
  });

  return map;
}

function Link(name, provider) {
  this.provider = provider;

  var argv = parseArgv();

  if(!_.isNull(argv.broker)) {
    this.brokerHost = argv.broker;
  }

  if(!_.isNull(argv.log)) {
    if(!_.isNull(LogLevel[argv.log])) {
      _.Log.level = LogLevel[argv.log];
    } else {
      console.log('Unknown log level ' + argv.log);
      process.exit(1);
    }
  }

  var jsonPath = path.resolve(process.cwd(), 'dslink.json');
  if(fs.existsSync(jsonPath)) {
    var json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if(_.isNull(json.configs)) {
      this.keys = curve.generateKeyPair(curve.NamedCurve.P256);
      return;
    }

    var brokerHost = _.Object.traverse(json.configs, 'broker.value');
    if(!_.isNull(brokerHost))
      this.brokerHost = brokerHost;

    var nodePath = _.Object.traverse(json.configs, 'nodes.value') || 'ds_nodes.json';
    nodePath = path.resolve(process.cwd(), nodePath);
    this.nodePath = nodePath;
    if(fs.existsSync(nodePath)) {
      this.provider.load(JSON.parse(fs.readFileSync(nodePath, 'utf8')));
    }

    process.on('exit', this.save);

    var keyPath = _.Object.traverse(json.configs, 'key.value') || '.dslink.key';
    keyPath = path.resolve(process.cwd(), keyPath);
    if(fs.existsSync(keyPath)) {
      this.keys = ECDH.importKey(fs.readFileSync(keyPath, 'utf8'));
    } else {
      var keypair = curve.generateKeyPair(curve.NamedCurve.P256);
      this.keys = keypair;

      fs.writeFileSync(keyPath, keypair.privateKey.d.toString('base64'));
    }
  } else {
    this.keys = curve.generateKeyPair(curve.NamedCurve.P256);
  }

  this.responder = new Responder(this.provider);
  this.client = new WebSocketClient(name, this.responder);
}

Link.prototype.connect = function(brokerHost) {
  if(!_.isNull(brokerHost) && brokerHost.constructor.name === 'Object')
    return this.client.connect(brokerHost);
  return this.client.connect({
    hostname: brokerHost || this.brokerHost,
    keys: this.keys
  });
};

Link.prototype.save = function() {
  if(!_.isNull(this.nodePath))
    fs.writeFileSync(this.nodePath, JSON.stringify(this.provider.save()));
};

module.exports = {
  Link: Link
};
