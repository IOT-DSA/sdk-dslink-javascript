part of dslink_js.build;

// hopefully this hack can be replaced in the future by configurable imports
_patchDependencies([String sdkDirectory = "temp/sdk-dslink-dart"]) {
  Directory dir = new Directory("$sdkDirectory/lib");

  _recurseEntity(entity) {
    if(entity is Directory) {
      entity.listSync().forEach((e) => _recurseEntity(e));
    }

    if(entity is File) {
      String text = entity.readAsStringSync();
      text = text.replaceAll("dart:io", "package:node_io/io.dart");
      text = text.replaceAll("import 'dart/pk.dart' show DartCryptoProvider;", "import 'node/pk.dart' show NodeCryptoProvider;");
      text = text.replaceAll(" DartCryptoProvider", " NodeCryptoProvider");
      entity.writeAsStringSync(text);
    }
  }

  dir.listSync().forEach((entity) => _recurseEntity(entity));

  var pubspecFile = new File("$sdkDirectory/pubspec.yaml");

  var pubspec = {}..addAll(loadYaml(pubspecFile.readAsStringSync()));

  pubspec["dependencies"] = {
    "node_io": {
      // "path": "/home/michael/Projects/Work/node_io.dart"
      "git": "https://github.com/dglogik/node_io.dart.git"
    }
  }..addAll(pubspec["dependencies"]);

  pubspecFile.writeAsStringSync(JSON.encode(pubspec));
}
