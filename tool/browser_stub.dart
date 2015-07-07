library dslink.stub;

import "package:dslink/browser.dart";
import "package:dslink/src/crypto/node/pk.dart";
import "package:dslink/src/crypto/pk.dart";

import "dart:async";
import "dart:convert";
import "dart:collection";
import "dart:typed_data";

@MirrorsUsed(
    targets: const [
  "dslink.browser",
  "dslink.common",
  "dslink.requester",
  "dslink.responder",
  "dslink.browser_client",
  "dslink.utils.Scheduler",
  "dslink.utils.Interval",
  "dslink.utils.DSLinkJSON",
  "dslink.utils.updateLogLevel",
  "dslink.utils.buildEnumType",
  "dslink.utils.buildActionIO",
  "dslink.pk",
  "dslink.pk.node.NodeCryptoProvider",
  "dart.async.Completer",
  "dart.async.Future",
  "dart.convert.JSON",
  "dart.collection.LinkedHashMap",
  "dart.typed_data.ByteData",
  "dslink.stub.NodeStub"
])
import "dart:mirrors";

class NodeStub extends SimpleNode {
  NodeStub(String path): super(path);

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
    print(JSON.decode('{"a":"hello"}').values);
  }

  /// after child node is removed
  void onChildRemoved(String name, Node node) {
    print(JSON.decode('{"a":"hello"}').keys);
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
