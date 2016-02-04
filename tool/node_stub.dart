library dslink.stub;

import "package:dslink/dslink.dart";
import "package:dslink/src/storage/simple_storage.dart";
import "package:dslink/src/crypto/node/pk.dart";
import "package:dslink/src/crypto/pk.dart";

import "dart:async";
import "dart:collection";
import "dart:typed_data";

@MirrorsUsed(
  targets: const [
    "dslink.pk",
    "dslink.common",
    "dslink.requester",
    "dslink.responder",
    "dslink.client",
    "dslink.utils",
    "dart.async.Completer",
    "dart.async.Future",
    "dart.collection.LinkedHashMap",
    "dart.typed_data.ByteData",
    "dslink.stub.NodeStub",
    "dslink.storage.simple"
  ],
  override: '*'
)
import "dart:mirrors";

class NodeStub extends SimpleNode {
  static String hello = "";

  NodeStub(String path): super(path) {
    NodeStub.hello += path;
  }

  /// This is called when this node is invoked.
  dynamic onInvoke(Map params) {
    return params;
  }

  // called before a subscription request is returned
  void onSubscribe() {
    print(this.path);
  }

  /// after node is created
  void onCreated() {
    print({
      "path": this.path
    });
  }

  /// before node gets removed
  void onRemoving() {
    print(unspecified);
  }

  /// after child node is removed
  void onChildRemoved(String name, Node node) {
    print(DSRandom.instance);
  }

  /// after child node is created
  void onChildAdded(String name, Node node) {
    print(name);
  }

  void onSetValue(Object val) {
    print(val);
  }

  void onSetConfig(String name, String value) {
    print(name);
  }

  void onSetAttribute(String name, String value) {
    print(name);
  }
}

main(List<String> args) {
  var a = new Symbol(args.length.toString());

  reflectClass(a).getField(a);
  reflectClass(a).invoke(a, []);
  currentMirrorSystem().findLibrary(a).getField(a);
}
