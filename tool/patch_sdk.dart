import "dart:io";
import "dart:convert";

import "package:yaml/yaml.dart";

main(List<String> args) {
  Directory dir = new Directory(args[0] + "/lib");

  _recurseEntity(entity) {
    if(entity is Directory) {
      entity.listSync().forEach((e) => _recurseEntity(e));
    }

    if(entity is File) {
      String text = entity.readAsStringSync();
      text = text.replaceAll("dart:io", "package:node_io/io.dart");
      text = text.replaceAll("package:dslink/src/crypto/dart/pk.dart", "package:dslink/src/crypto/node/pk.dart");
      text = text.replaceAll(" DartCryptoProvider", " NodeCryptoProvider");
      entity.writeAsStringSync(text);
    }
  }

  dir.listSync().forEach((entity) => _recurseEntity(entity));

  var pubspecFile = new File(args[0] + "/pubspec.yaml");

  var pubspec = {}..addAll(loadYaml(pubspecFile.readAsStringSync()));

  pubspec["dependencies"] = {
    "node_io": {
      // "path": "/home/michael/Projects/Work/node_io.dart"
      "git": "https://github.com/DirectMyFile/node_io.dart.git"
    }
  }..addAll(pubspec["dependencies"]);

  pubspecFile.writeAsStringSync(JSON.encode(pubspec));
}
