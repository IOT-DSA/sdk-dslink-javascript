import "package:calzone/compiler.dart";
import "package:calzone/transformers.dart";
import "package:calzone/util.dart";

import "dart:io";

String _STREAM_PREFIX = (new File("tool/js/stream.js")).readAsStringSync();

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
    output.write("if(typeof(obj._createSubscription\$4) !== 'undefined') { return new module.exports.Stream(obj, dynamicTo); }");
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
    output.write("$name = new module.exports.Stream($name, function(obj) {");
    if(tree.length > 1) {
      base.transformToDart(output, null, "obj", tree[1], globals);
    }
    output.write("return obj; });");
  }
}

main(List<String> args) {
  var compiler = new Compiler.fromPath(args[0], "temp/dslink.js.info.json", typeTransformers: [
    new CollectionsTransformer(true),
    new PromiseTransformer(true),
    new ClosureTransformer(),
    new StreamTransformer()
  ]);

  var include = new File("tool/dslink.include").readAsLinesSync().where((line) => line.trim().length > 0 && !line.trim().startsWith("#"));

  var str = compiler.compile(include);

  print(str);
}
