var url = require('url'),
    http = require('http'),
    https = require('https'),
    crypto = require('crypto'),
    ursa = require('ursa'),
    connection = require('../connection.js'),
    Client = connection.Client,
    EventEmitter = require('eventemitter2').EventEmitter2,
    _ = require('../internal.js');

function HttpClient(name, hostname) {
  Client.call(this);

  this.hostname = hostname;

  var keys = ursa.generatePrivateKey(),
      pem = keys.toPrivatePem('base64');

  this.privateObj = ursa.createPrivateKey(pem, '', 'base64');
  this.publicObj = ursa.createPublicKey(pem, 'base64');

  var hash = crypto.createHash('sha384');
  hash.update(this.publicObj.toPublicPem('binary'));

  this.dsId = "link-" + name + "-" + hash.digest('base64');
  this.publicKey = this.publicObj.getModulus('base64');

  // TODO: Make this not hardcoded.
  var connDetails = JSON.stringify({
    publicKey: this.publicKey,
    isRequester: false,
    isResponder: true
  });

  var req = (url.parse(this.hostname).protocol.indexOf('https') !== 0 ? https : http).request({
    hostname: hostname,
    path: '/conn?dsId=' + this.dsId,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': connDetails.length
    }
  }, function(res) {
    var data = "";

    res.on('data', function(buf) {
      data += buf.toString();
    });

    res.on('close', function() {
      // TODO: Handle /conn response
    });
  });

  req.write(connDetails);
  req.end();
}

_.inherits(HttpClient, Client);

function HttpServer() {
}

_.inherits(HttpServer, EventEmitter);

module.exports = {
  HttpClient: HttpClient,
  HttpServer: HttpServer
};
