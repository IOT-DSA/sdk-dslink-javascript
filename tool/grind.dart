library dslink_js.build;

import "package:calzone/transformers.dart";
import "package:calzone/patcher.dart";
import "package:calzone/compiler.dart";
import "package:calzone/util.dart";

import "package:grinder/grinder.dart";

import "package:yaml/yaml.dart";

import "dart:io";
import "dart:async";
import "dart:convert";

part "lib/gen_wrapper.dart";
part "lib/patch_deps.dart";
part "lib/util.dart";

PatcherTarget target;

main(args) => grind(args);

@Task("Clean environment")
clean() {
  var temp = new Directory("temp");
  var dist = new Directory("dist");

  delete(temp);
  delete(dist);

  temp.createSync();
  dist.createSync();
}

@Task("Cloning Dart SDK")
cloneSDK() {
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

@Task("Building Dart SDK with dart2js")
buildSDK() {
  dart2js(["dump-info",
          "trust-type-annotations",
          "trust-primitives",
          "enable-experimental-mirrors"],
      "temp/dslink.js",
      "tool/${target}_stub.dart");

  dart2js(["dump-info",
          "trust-type-annotations",
          "trust-primitives",
          "enable-experimental-mirrors",],
      "temp/dslink.min.js",
      "tool/${target}_stub.dart",
      isMinified: true);
}

@Task("Scraping Dart SDK for wrapper")
scrapeSDK() async {
  var scraper = new Scraper("temp/dslink.js", "temp/dslink.js.info.json");
  var minified = new Scraper("temp/dslink.min.js", "temp/dslink.min.js.info.json",
      isMinified: true);

  var file = new File("temp/dslink.scraper.json");
  var minifiedFile = new File("temp/dslink.min.scraper.json");

  file.createSync();
  minifiedFile.createSync();

  file.writeAsStringSync(await scraper.scrape());
  minifiedFile.writeAsStringSync(await minified.scrape());
}

@Task("Generating JS wrapper for Dart SDK")
genWrapper() {
  var wrapper = _generateWrapper("tool/${target}_stub.dart", "dslink");
  var minified = _generateWrapper("tool/${target}_stub.dart", "dslink.min", isMinified: true);

  var file = new File("temp/wrapper.js");
  var minifiedFile = new File("temp/wrapper.min.js");

  file.createSync();
  minifiedFile.createSync();

  file.writeAsStringSync(wrapper);
  minifiedFile.writeAsStringSync(minified);
}

@Task("Mangle JS wrapper")
mangleWrapper() {
  var output = npmBin("uglify-js", "uglifyjs temp/wrapper.min.js -m");
  var file = new File("temp/wrapper.min.min.js");

  file.createSync();
  file.writeAsStringSync(output);
}

@Task("Patching JS wrapper")
patchWrapper() async {
  var patcher = new Patcher("temp/dslink.js", "temp/dslink.js.info.json",
      "temp/wrapper.js", target: target);
  var minified = new Patcher("temp/dslink.min.js", "temp/dslink.min.js.info.json",
      "temp/wrapper.min.min.js", target: target, isMinified: true);

  var file = new File("dist/dslink.$target.js");
  var minifiedFile = new File("dist/dslink.$target.min.js");

  file.createSync();
  minifiedFile.createSync();

  file.writeAsStringSync(patcher.patch());

  minifiedFile.writeAsStringSync(await npmBinAsync("uglify-js", "uglifyjs", input: minified.patch()));

  if(target == PatcherTarget.BROWSER) {
    var browserify = npmBin("browserify", "browserify dist/dslink.browser.js");
    var minBrowserify = npmBin("browserify", "browserify dist/dslink.browser.min.js");

    file.writeAsStringSync(browserify);
    minifiedFile.writeAsStringSync(minBrowserify);
  }
}

@DefaultTask()
@Task("Build for the browser")
browser() {
  target = PatcherTarget.BROWSER;
  runGrinderTasks(["clean",
      "cloneSDK",
      "patchDeps",
      "fetchDeps",
      "buildSDK",
      "scrapeSDK",
      "genWrapper",
      "mangleWrapper",
      "patchWrapper"]);
}

@Task("Build for node.js")
node() {
  target = PatcherTarget.NODE;
  runGrinderTasks(["clean",
      "cloneSDK",
      "patchDeps",
      "fetchDeps",
      "buildSDK",
      "scrapeSDK",
      "genWrapper",
      "mangleWrapper",
      "patchWrapper"]);
}

@Task("Dev build for the browser")
browserDev() {
  target = PatcherTarget.BROWSER;
  runGrinderTasks(["scrapeSDK",
      "genWrapper",
      "mangleWrapper",
      "patchWrapper"]);
}

@Task("Dev build for node.js")
nodeDev() async {
  target = PatcherTarget.NODE;
  await runGrinderTasks(["scrapeSDK",
      "genWrapper",
      "mangleWrapper",
      "patchWrapper"]);
}
