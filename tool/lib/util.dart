part of dslink_js.build;

exec(String exec) {
  var parts = exec.split(" ");
  return run(parts[0], arguments: parts.sublist(1), runOptions: new RunOptions(runInShell: true), quiet: true);
}

Future runGrinderTasks(List<String> tasks) async {
  for(var task in tasks) {
    task = task.replaceAllMapped(new RegExp(r"[A-Z]"), (Match m) => "-${m[0].toLowerCase()}");
    print(task);
    await context.grinder.getTask(task).execute(context);
  }
}

bool dart2js(List flags, String outputFile, String inputFile, {bool isMinified: false}) {
  var arguments = flags.map((flag) => "--$flag").toList();
  if(isMinified)
    arguments.add("-m");
  arguments.addAll(["-o", outputFile, inputFile]);
  return Process.runSync("dart2js", arguments).exitCode == 0;
}

String getNpmBinPath(String npmPackage, String bin) {
  var package = JSON.decode((new File("node_modules/$npmPackage/package.json")).readAsStringSync());
  return "node_modules/$npmPackage/" + package["bin"][bin];
}

String npmBin(String npmPackage, String str) {
  var parts = str.split(" ");
  parts[0] = "node ${getNpmBinPath(npmPackage, parts[0])}";

  return exec(parts.join(" "));
}

Future<String> npmBinAsync(String npmPackage, String str, {String input: ""}) async {
  var parts = str.split(" ");
  parts[0] = "${getNpmBinPath(npmPackage, parts[0])}";

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
