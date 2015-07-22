library dslink_js.build;

import "package:calzone/transformers.dart";
import "package:calzone/patcher.dart";
import "package:calzone/compiler.dart";
import "package:calzone/builder.dart";
import "package:calzone/util.dart";

import "package:grinder/grinder.dart";

import "package:yaml/yaml.dart";

import "dart:io";
import "dart:async";
import "dart:convert";

part "lib/transformers.dart";
part "lib/patch_deps.dart";
part "lib/util.dart";

class DSLinkBuilder extends Builder {
  final PatcherTarget target;

  DSLinkBuilder({PatcherTarget target: PatcherTarget.NODE, BuilderStage stage: BuilderStage.ALL, bool isMinified: false}):
    this.target = target,
    super("tool/${target}_stub.dart", "tool/dslink.include",
      stage: stage,
      target: target,
      typeTransformers: [
        new PromiseTransformer(true),
        new ClosureTransformer(),
        new BufferTransformer(),
        new StreamTransformer(),
        new CollectionsTransformer(true)
      ],
      directory: isMinified ? "temp/min" : "temp/full",
      isMinified: isMinified);


  Future<String> onWrapperGenerated(String wrapper) async {
    var file = new File("$directory/wrapper.js");

    file.createSync();
    file.writeAsStringSync(wrapper);

    return await npmBinAsync("uglify-js", "uglifyjs --screw-ie8 -c sequences,properties,dead_code,unsafe,join_vars,cascade -m", input: wrapper);
  }

  Future<String> build() async {
    var output = await super.build() + "\n";
    output += new File("tool/js/mixin.js").readAsStringSync();

    if(stage == BuilderStage.COMPILE)
      return null;

    var filename = "dist/dslink.${target}.${isMinified ? "min.js" : "js"}";
    var file = new File(filename);
    file.createSync();

    file.writeAsStringSync(output);
    
    if(target == PatcherTarget.BROWSER) {
      var browserify = npmBin("browserify", "browserify $filename --standalone DS");
      file.writeAsStringSync(browserify);
    }
    
    if(isMinified)
      file.writeAsStringSync(await npmBinAsync("uglify-js", "uglifyjs $filename"));

    return null;
  }
}

PatcherTarget target;

main(args) => grind(args);

@Task("Clean environment")
clean() {
  var temp = new Directory("temp");
  var dist = new Directory("dist");

  delete(temp);
  delete(dist);

  dist.createSync();
}

@Task("Cloning Dart SDK")
cloneSdk() {
  exec("git clone https://github.com/IOT-DSA/sdk-dslink-dart temp/sdk-dslink-dart");
}

@Task("Patching dependencies into Dart SDK")
patchDeps() => _patchDependencies();

@Task("Fetching dependencies")
fetchDeps() {
  Pub.upgrade();
  Pub.get();

  exec("npm install");
}

@DefaultTask()
@Depends(clean, cloneSdk, patchDeps, fetchDeps)
@Task("Build for node.js")
node() async {
  var builder = new DSLinkBuilder(target: PatcherTarget.NODE);
  var minified = new DSLinkBuilder(target: PatcherTarget.NODE, isMinified: true);

  await builder.build();
  await minified.build();
}

@Depends(clean, cloneSdk, patchDeps, fetchDeps)
@Task("Build for the browser")
browser() async {
  var builder = new DSLinkBuilder(target: PatcherTarget.BROWSER);
  var minified = new DSLinkBuilder(target: PatcherTarget.BROWSER, isMinified: true);

  await builder.build();
  await minified.build();
}

@Task("Dev build for node.js")
nodeDev() async {
  var builder = new DSLinkBuilder(target: PatcherTarget.NODE, stage: BuilderStage.WRAP);
  var minified = new DSLinkBuilder(target: PatcherTarget.NODE,
      isMinified: true,
      stage: BuilderStage.WRAP);

  await builder.build();
  await minified.build();
}

@Task("Dev build for the browser")
browserDev() async {
  var builder = new DSLinkBuilder(target: PatcherTarget.BROWSER, stage: BuilderStage.WRAP);
  var minified = new DSLinkBuilder(target: PatcherTarget.BROWSER,
      isMinified: true,
      stage: BuilderStage.WRAP);

  await builder.build();
  await minified.build();
}
