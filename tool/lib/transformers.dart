part of dslink_js.build;

class StreamTransformer extends TypeTransformer with NamedTypeTransformer {
  final List<String> types = ["Stream"];
  final String output = "Stream";
  
  StreamTransformer();

  @override
  transformToDart(Compiler compiler, StringBuffer output) {
    // TODO
  }

  @override
  transformFromDart(Compiler compiler, StringBuffer output) {
    var c = compiler.classes["dslink.utils.CachedStreamWrapper"];
    var ss = compiler.classes["dart.async._BroadcastSubscriptionWrapper"];
    compiler.globals.add("""
    var EventEmitter = require('events').EventEmitter;

    // aiming for a node-like Stream API, but without the weight
    // isn't really for data, but for just values elapsed over time
    function Stream(dartStream) {
      EventEmitter.call(this);
      this._listener = dartStream.${c.key.getMangledName("listen")}({
        // onData
        ${compiler.isMinified ? "\$1" : "call\$1"}: function(data) {
          this.emit('data', dynamicFrom(data));
        }.bind(this)
      }, true, {
        // onDone
        ${compiler.isMinified ? "\$0" : "call\$0"}: function() {
          this.emit('done');
        }.bind(this)
      // cancel on error
      }, {
        // onError
        ${compiler.isMinified ? "\$1" : "call\$1"}: function(error) {
          this.emit('error', error);
        }.bind(this)
      });
    }

    Stream.prototype = Object.create(EventEmitter.prototype);

    Stream.prototype.close = function() {
      this._listener.${ss.key.getMangledName("cancel")}();
    };

    module.exports.Stream = Stream;
    """);
    
    output.write("if(obj.${c.key.getMangledName("listen")}) { return new module.exports.Stream(obj); }");
  }
}
