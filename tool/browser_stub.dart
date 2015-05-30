import "package:dslink/browser.dart";
import "dart:async";

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
  "dslink.pk.PrivateKey",
  "dart.async.Completer"
])
import "dart:mirrors";

main(List<String> args) {
  var a = " ";
  a += args.length;

  reflectClass(a).getField(a);
  reflectClass(a).invoke(a, []);
}
