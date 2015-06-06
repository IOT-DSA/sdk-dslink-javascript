import "package:dslink/dslink.dart";
import "package:dslink/src/crypto/pk.dart";
import "dart:async";
import "dart:typed_data";

@MirrorsUsed(
    targets: const [
  "dslink.common",
  "dslink.requester",
  "dslink.responder",
  "dslink.client",
  "dslink.utils.Scheduler",
  "dslink.utils.Interval",
  "dslink.utils.DSLinkJSON",
  "dslink.utils.updateLogLevel",
  "dslink.utils.buildEnumType",
  "dslink.utils.buildActionIO",
  "dslink.pk.PrivateKey",
  "dart.async.Completer",
  "dart.async.Future",
  "dart.typed_data.ByteBuffer"
])
import "dart:mirrors";

main(List<String> args) {
  var a = " ";
  a += args.length;

  reflectClass(a).getField(a);
  reflectClass(a).invoke(a, []);
}
