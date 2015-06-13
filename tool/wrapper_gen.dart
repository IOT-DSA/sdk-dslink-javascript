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
  dynamicTransformTo(StringBuffer output, List<String> globals) {
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
  dynamicTransformFrom(StringBuffer output, List<String> globals) {
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

  @override
  transformToDart(StringBuffer output, TypeTransformer base, String name, List tree, List<String> globals) {
    output.write("var _obj = $name; $name = new init.allClasses.ByteData(_obj.length);");
    output.write("for(var index = 0; index < _obj.length; index++) { $name.setUint8\$2(index, _obj.readUInt8(index)); }");
  }

  @override
  transformFromDart(StringBuffer output, TypeTransformer base, String name, List tree, List<String> globals) {
    output.write("""
    function toBuffer(ab) {
      var buffer = new Buffer(ab.byteLength);
      var view = new Uint8Array(ab);
      for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
      }
      return buffer;
    }
    $name = toBuffer($name.buffer);
    """);
  }
}

class StreamTransformer extends TypeTransformer {
  final List<String> types = ["Stream"];

  StreamTransformer();

  @override
  dynamicTransformTo(StringBuffer output, List<String> globals) {
    if(!globals.contains(_STREAM_PREFIX))
      globals.add(_STREAM_PREFIX);
    // TODO
  }

  @override
  dynamicTransformFrom(StringBuffer output, List<String> globals) {
    if(!globals.contains(_STREAM_PREFIX))
      globals.add(_STREAM_PREFIX);
    output.write("if(typeof(obj._createSubscription\$4) !== 'undefined') { return new module.exports.Stream(obj); }");
  }

  @override
  transformToDart(StringBuffer output, TypeTransformer base, String name, List tree, List<String> globals) {
    if(!globals.contains(_STREAM_PREFIX))
      globals.add(_STREAM_PREFIX);
    // TODO
  }

  @override
  transformFromDart(StringBuffer output, TypeTransformer base, String name, List tree, List<String> globals) {
    if(!globals.contains(_STREAM_PREFIX))
      globals.add(_STREAM_PREFIX);
    output.write("$name = new module.exports.Stream($name);");
  }
}

main(List<String> args) {
  var compiler = new Compiler.fromPath(args[0], "temp/dslink.js.info.json", typeTransformers: [
    new CollectionsTransformer(true),
    new PromiseTransformer(true),
    new ClosureTransformer(),
    new BufferTransformer(),
    new StreamTransformer()
  ]);

  var include = new File("tool/dslink.include").readAsLinesSync().where((line) => line.trim().length > 0 && !line.trim().startsWith("#"));

  var str = compiler.compile(include);

  print(str);
  print(new File("tool/js/mixin.js").readAsStringSync());
}
