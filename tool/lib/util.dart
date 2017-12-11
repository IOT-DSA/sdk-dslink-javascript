part of dslink_js.build;

exec(String exec) {
  var parts = exec.split(" ");
  return run(parts[0], arguments: parts.sublist(1), runOptions: new RunOptions(runInShell: true), quiet: true);
}

String getNpmBinPath(String bin) => "./node_modules/.bin/${bin}";

String npmBin(String str) {
  var parts = str.split(" ");
  parts[0] = getNpmBinPath(parts[0]);

  return exec(parts.join(" "));
}

Future<String> npmBinAsync(String str, {String input: ""}) async {
  var parts = str.split(" ");
  parts[0] = getNpmBinPath(parts[0]);

  var process = await Process.start("node", parts);
  if(input.length > 0) {
    process.stdin.write(input);
    await process.stdin.flush();
    process.stdin.close();
  }

  String returned = "";

  await process.stdout.forEach((data) => returned += UTF8.decode(data));

  return returned;
}
