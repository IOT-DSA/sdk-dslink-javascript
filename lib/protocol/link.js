var WebSocketClient = require('websocket').client,
    Method = require('./method.js').Method,
    util = require('../util.js'),
    Poller = util.Poller,
    _ = require("../internal.js");

function DSLink(name) {
  // 'private' variables go here.
  this.__priv__ = {};
  this.__priv__.conn = null;
  this.__priv__.sendQueue = [];
  this.__priv__.receiveQueue = {};
  this.__priv__.poller = new Poller(function() {
    this.handleSendQueue(2);
  });

  this.name = name;

  return Object.freeze(this);
}

DSLink.prototype.connect = function(host, cb) {
  if(_.isNull(conn))
  cb("Link is already connected to a broker. Use Link.disconnect() and try to connect again.");

  var sock = new WebSocketClient({
    'keepalive': true,
    'keepaliveInterval': 10000 // 10 seconds
  });

  sock.on('connectFailed', function(err) {
    cb(err);
  });

  sock.on('connect', function(conn) {
    this.__priv__.conn = conn;
    this.__priv__.poller.poll(100);

    this.__priv__.conn.on('error', function(err) {
      this.__priv__.conn = null;
      this.__priv__.poller.cancel();
    });

    this.__priv__.conn.on('close', function() {
      this.__priv__.conn = null;
      this.__priv__.poller.cancel();
    });

    this.__priv__.conn.on('message', function(req) {
      if (req.type === 'utf8') {
        var message = req.utf8Data;
        this.handleMessage(message);
      }
    });

    cb();
  });

  var url = 'ws://' + host + '/wstunnel?' + name;
  socket.connect(url);
};

DSLink.prototype.disconnect = function() {
  if(!_.isNull(this.__priv__.conn) && this.__priv__.conn.connected) {
    this.handleSendQueue(-1);
    this.__priv__.conn.close();
    return true;
  }
  return false;
};

DSLink.prototype.handleMessage = function(message) {
  var json = JSON.parse(message);

  json.requests.forEach(function(req) {
    if(!_.isNull(req.partial)) {
      this.__priv__.receiveQueue[req.reqId] = req;
      return;
    }

    if(!_.isNull(this__.__priv__.receiveQueue[req.reqId])) {
      var partialPath = queue.partial.split("."),
          path = partialPath.splice(-1),
          name = partialPath.splice(0, -1),
          queuePath = _.traverse(this.__priv__.receiveQueue[req.reqId], path),
          reqPath = _.traverse(req, path);

      if(req.done === true) {
        reqPath[name] = _.merge(queuePath[name], reqPath[name]);
        this.__priv__.receiveQueue[req.reqId] = undefined;
      } else {
        queuePath[name] = _.merge(queuePath[name], reqPath[name]);
        return;
      }
    }

    var method = req.method;
    method = method === null || method === undefined ? "" : method;

    if(!_.isNull(Method[method])) {
      Method[method](req, function(resjson) {
        if(resjson.reqId !== req.reqId)
          resjson.reqId = req.reqId;
        var res = {
          'responses': [resjson]
        };
        if(json.subscription) { res.subscription = json.subscription; }
        res.method = json.method;
        if(!_.isNull(this.__priv__.conn)) {
          this.__priv__.sendQueue.push(res);
        }
      });
    }
  });
};

DSLink.prototype.handleSendQueue = function(limit) {
  var subscriptions = this.__priv__.sendQueue.map(function(res) {
    return res.subscription;
  });

  subscriptions.forEach(function(subscription) {
    var data = this.__priv__.sendQueue.filter(function(res) {
      return res.subscription === subscription;
    });
    data = data.splice(limit <= 0 ? 0 : limit, limit <= 0 ? data.length : null);

    this.__priv__.sendQueue = _.removeWhere(this.__priv__.sendQueue, function(value) {
      return data.indexOf(value) !== -1;
    });

    this.__priv__.conn.sendUTF(JSON.stringify(data));
  });
};

module.exports = {
  'Link': DSLink
};
