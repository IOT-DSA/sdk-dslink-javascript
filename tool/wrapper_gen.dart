import "package:calzone/compiler.dart";
import "package:calzone/transformers.dart";
import "package:calzone/util.dart";

import "dart:io";

String _STREAM_PREFIX = (new File("tool/js/stream.js")).readAsStringSync();

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
    if(!compiler.globals.contains(_STREAM_PREFIX))
      compiler.globals.add(_STREAM_PREFIX);
    // TODO
  }

  @override
  transformFromDart(Compiler compiler, StringBuffer output) {
    if(!compiler.globals.contains(_STREAM_PREFIX))
      compiler.globals.add(_STREAM_PREFIX);
    output.write("if(typeof(obj._createSubscription\$4) !== 'undefined') { return new module.exports.Stream(obj); }");
  }
}

main(List<String> args) {
  var compiler = new Compiler(args[0], "temp/dslink.js.info.json", "temp/dslink.scraper.json", typeTransformers: [
    new CollectionsTransformer(true),
    new PromiseTransformer(true),
    new ClosureTransformer(),
    new BufferTransformer(),
    new StreamTransformer()
  ], isMinified: true);

  var include = new File("tool/dslink.include").readAsLinesSync().where((line) => line.trim().length > 0 && !line.trim().startsWith("#"));

  var str = compiler.compile(include);

  print(str);
  print(new File("tool/js/mixin.js").readAsStringSync());
}
