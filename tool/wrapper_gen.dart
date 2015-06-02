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
  }

  @override
  dynamicTransformFrom(StringBuffer output, List<String> globals) {
    if(!globals.contains(_STREAM_PREFIX))
      globals.add(_STREAM_PREFIX);
  }

  @override
  transformToDart(StringBuffer output, TypeTransformer base, String name, List tree, List<String> globals) {
    if(!globals.contains(_STREAM_PREFIX))
      globals.add(_STREAM_PREFIX);
  }

  @override
  transformFromDart(StringBuffer output, TypeTransformer base, String name, List tree, List<String> globals) {
    if(!globals.contains(_STREAM_PREFIX))
      globals.add(_STREAM_PREFIX);
  }
}

main(List<String> args) {
  var compiler = new Compiler.fromPath(args[0], "temp/dslink.js.info.json");
  var include = new File("tool/dslink.include").readAsLinesSync().where((line) => line.trim().length > 0 && !line.trim().startsWith("#"));

  compiler.typeTransformers.addAll([
    new CollectionsTransformer(true),
    new PromiseTransformer(true),
    new ClosureTransformer()
  ]);

  var str = compiler.compile(include);

  print(str);
}
