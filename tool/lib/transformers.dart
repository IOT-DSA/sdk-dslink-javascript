part of dslink_js.build;

class StreamTransformer extends TypeTransformer {
  StreamTransformer();

  @override
  transformToDart(Compiler compiler, StringBuffer output) {
    // TODO
  }

  @override
  transformFromDart(Compiler compiler, StringBuffer output) {
    var c = compiler.classes["dart.async._ControllerStream"];
    compiler.globals.add("""
    var EventEmitter = require('events').EventEmitter;

    // aiming for a node-like Stream API, but without the weight
    // isn't really for data, but for just values elapsed over time
    function Stream(dartStream) {
      dartStream.${c.key.getMangledName("_createSubscription")}({
        // onData
        ${compiler.isMinified ? "\$1" : "call\$1"}: function(data) {
          this.emit('data', dynamicFrom(data));
        }.bind(this)
      },
      {
        // onError
        ${compiler.isMinified ? "\$1" : "call\$1"}: function(error) {
          this.emit('error', error);
        }.bind(this)
      }, {
        // onDone
        ${compiler.isMinified ? "\$0" : "call\$0"}: function() {
          this.emit('done');
        }.bind(this)
      // cancel on error
      }, true);
    }

    Stream.prototype = new EventEmitter();

    module.exports.Stream = Stream;
    """);
    output.write("if(obj.${c.key.getMangledName("_createSubscription")}) { return new module.exports.Stream(obj); }");
  }
}
