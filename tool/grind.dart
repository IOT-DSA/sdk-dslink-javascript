library dslink_js.build;

import "package:calzone/transformers.dart";
import "package:calzone/patcher.dart";
import "package:calzone/compiler.dart";
import "package:calzone/builder.dart";
import "package:calzone/util.dart";

import "package:calzone/visitor_typescript.dart";

import "package:grinder/grinder.dart";

import "package:yaml/yaml.dart";

import "dart:io";
import "dart:async";
import "dart:convert";

part "lib/transformers.dart";
part "lib/patch_deps.dart";
part "lib/util.dart";

const String BROWSER_PREFIX = """
  if(!self)
    var self = global;
  self.__iot_dsa__ = {
    global: global,
    require: require,
    Buffer: Buffer
  };

  self.setTimeout = setTimeout.bind(window);
  self.setInterval = setInterval.bind(window);
  self.clearTimeout = clearTimeout.bind(window);
  self.clearInterval = clearInterval.bind(window);

  // TODO: Look into Browserify setImmediate polyfill instead of setTimeout
  self.scheduleImmediate = function(cb) {
    if(self.setImmediate) {
      self.setImmediate(cb);
    } else {
      self.setTimeout(cb, 0);
    }
  };

  require('dhcurve');
  require('crypto');
""";

const String TS_PREFIX = """
\tclass Stream {
\t\t// event emitter
\t\taddListener(event: string, listener: Function): this;
\t\ton(event: string, listener: Function): this;
\t\tonce(event: string, listener: Function): this;
\t\tremoveListener(event: string, listener: Function): this;
\t\tremoveAllListeners(event?: string): this;
\t\tsetMaxListeners(n: number): this;
\t\tgetMaxListeners(): number;
\t\tlisteners(event: string): Function[];
\t\temit(event: string, ...args: any[]): boolean;
\t\tlistenerCount(type: string): number;
      
\t\tclose(): void;
\t}

\tclass SimpleActionNode extends SimpleNode {
\t\tconstructor(path: string, provider: any, cb?: any);
\t}

\tclass UnserializableNode extends SimpleNode {
\t\tconstructor(path: string, provider?: NodeProvider);
\t}

\tfunction createNode(opt: any): any;
\tfunction encodeNodeName(str: string): string;
""";

class DSLinkBuilder extends Builder {
  final TypeScriptCompilerVisitor tsVisitor;
  final PatcherTarget target;

  DSLinkBuilder({PatcherTarget target: PatcherTarget.NODE,
      BuilderStage stage: BuilderStage.ALL,
      bool isMinified: false,
      TypeScriptCompilerVisitor tsVisitor}):
    this.tsVisitor = tsVisitor,
    this.target = target,
    super("tool/${target}_stub.dart", "tool/dslink.include",
      stage: stage,
      target: target,
      typeTransformers: [
        new PromiseTransformer(true),
        new ClosureTransformer(),
        new BufferTransformer(),
        new StreamTransformer(),
        new CollectionsTransformer()
      ],
      compilerVisitors: [
        tsVisitor
      ],
      directory: isMinified ? "temp/min" : "temp/full",
      isMinified: isMinified);

  Future<String> onWrapperGenerated(String wrapper) async {
    var file = new File("$directory/wrapper.js");

    file.createSync();
    file.writeAsStringSync(wrapper);

    return await npmBinAsync("uglifyjs --screw-ie8 -c sequences,properties,dead_code,unsafe,join_vars,cascade -m", input: wrapper);
  }

  Future<String> build() async {
    var output = await super.build() + "\n";
    output += new File("tool/js/mixin.js").readAsStringSync();

    if(stage == BuilderStage.COMPILE)
      return null;

    var filename = "dist/dslink.${target}.${isMinified ? "min.js" : "js"}";
    var file = new File(filename);
    file.createSync();

    if(target == PatcherTarget.BROWSER)
      output = BROWSER_PREFIX + output;
    file.writeAsStringSync(output);
    
    if (!isMinified) {
      var tsFilename = "dist/dslink.${target}.d.ts";
      var tsFile = new File(tsFilename);
      tsFile.createSync();
    
      tsFile.writeAsStringSync("""
${tsVisitor.output}
""");
    }

    if(target == PatcherTarget.BROWSER) {
      var browserify = npmBin("browserify $filename --standalone DS --full-paths");
      file.writeAsStringSync(browserify);
    }

    if(isMinified) {
      file.writeAsStringSync(await npmBinAsync("uglifyjs $filename"));
    }

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

  exec("node tool/yarn-0.27.5.js");
}

@DefaultTask()
@Depends(clean, cloneSdk, patchDeps, fetchDeps)
@Task("Build for node.js")
node() async {
  TypeScriptCompilerVisitor tsVisitor = new TypeScriptCompilerVisitor("dslink", mixinTypes: TS_PREFIX);
  
  var builder = new DSLinkBuilder(target: PatcherTarget.NODE, tsVisitor: tsVisitor);
  var minified = new DSLinkBuilder(target: PatcherTarget.NODE, isMinified: true,
      tsVisitor: tsVisitor);

  await builder.build();
  await minified.build();
}

@Depends(clean, cloneSdk, patchDeps, fetchDeps)
@Task("Build for the browser")
browser() async {
  TypeScriptCompilerVisitor tsVisitor = new TypeScriptCompilerVisitor("dslink", mixinTypes: TS_PREFIX);

  var builder = new DSLinkBuilder(target: PatcherTarget.BROWSER, tsVisitor: tsVisitor);
  var minified = new DSLinkBuilder(target: PatcherTarget.BROWSER, isMinified: true,
      tsVisitor: tsVisitor);

  await builder.build();
  await minified.build();
}

@Task("Dev build for node.js")
nodeDev() async {
  TypeScriptCompilerVisitor tsVisitor = new TypeScriptCompilerVisitor("dslink", mixinTypes: TS_PREFIX);

  var builder = new DSLinkBuilder(target: PatcherTarget.NODE, stage: BuilderStage.WRAP,
      tsVisitor: tsVisitor);
  var minified = new DSLinkBuilder(target: PatcherTarget.NODE,
      isMinified: true,
      stage: BuilderStage.WRAP,
      tsVisitor: tsVisitor);

  await builder.build();
  await minified.build();
}

@Task("Dev build for the browser")
browserDev() async {
  TypeScriptCompilerVisitor tsVisitor = new TypeScriptCompilerVisitor("dslink", mixinTypes: TS_PREFIX);

  var builder = new DSLinkBuilder(target: PatcherTarget.BROWSER, stage: BuilderStage.WRAP,
      tsVisitor: tsVisitor);
  var minified = new DSLinkBuilder(target: PatcherTarget.BROWSER,
      isMinified: true,
      stage: BuilderStage.WRAP,
      tsVisitor: tsVisitor);

  await builder.build();
  await minified.build();
}
