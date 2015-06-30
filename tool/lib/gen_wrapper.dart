part of dslink_js.build;

// node.js Buffer (or Browserify equivelent) to ByteData, and back.
class BufferTransformer implements TypeTransformer {
  final List<String> types = ["ByteData"];

  BufferTransformer();

  @override
  transformToDart(Compiler compiler, StringBuffer output) {
    output.write("""
      if(obj instanceof Buffer) {
        function toArrayBuffer(buffer) {
          console.log(buffer.length);
          var ab = new ArrayBuffer(buffer.length);
          var view = new Uint8Array(ab);
          for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
          }
          console.log(view.length);
          return ab;
        }

        return new DataView(toArrayBuffer(obj));
      }
    """);
  }

  @override
  transformFromDart(Compiler compiler, StringBuffer output) {
    output.write("""
      if(obj instanceof DataView) {
        function toBuffer(ab) {
          var buffer = new Buffer(ab.byteLength);
          var view = new Uint8Array(ab);
          console.log(view.length);
          for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
          }
          console.log(buffer.length);
          return buffer;
        }
        return toBuffer(obj.buffer);
      }
    """);
  }
}

class StreamTransformer extends TypeTransformer {
  final List<String> types = ["Stream"];

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

String _generateWrapper(String dartFile, String compiledFile, {bool isMinified: false}) {
  StringBuffer output = new StringBuffer();

  var compiler = new Compiler(dartFile, "temp/$compiledFile.js.info.json", "temp/$compiledFile.scraper.json", typeTransformers: [
    new CollectionsTransformer(true),
    new PromiseTransformer(true),
    new ClosureTransformer(),
    new BufferTransformer(),
    new StreamTransformer()
  ], isMinified: isMinified);

  var include = new File("tool/dslink.include").readAsLinesSync().where((line) => line.trim().length > 0 && !line.trim().startsWith("#"));

  var str = compiler.compile(include);

  output.write(str);
  output.write(new File("tool/js/mixin.js").readAsStringSync());

  return output.toString();
}
