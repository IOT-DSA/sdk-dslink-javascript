rm -rf temp
mkdir temp
mkdir dist
echo "Building the JavaScript SDK"
dart2js --dump-info --enable-experimental-mirrors -o temp/dslink.js tool/browser_stub.dart
echo "Building bridge/wrapper from dart2js to JS"
# dart ../calzone.dart/bin/calzone.dart temp/dslink.js.info.json dslink.browser dslink.common dslink.requester dslink.responder dslink.browser_client dslink.utils dslink.pk > temp/wrapper.js
dart ./.pub/bin/calzone/calzone.dart.snapshot temp/dslink.js.info.json dslink.browser dslink.common dslink.requester dslink.responder dslink.browser_client dslink.utils dslink.pk > temp/wrapper.js
echo "Patching into SDK"
# dart ../calzone.dart/bin/calpatcher.dart -t browser -f ./temp/dslink.js -w ./temp/wrapper.js  > ./temp/dslink.patched.js
dart ./.pub/bin/calzone/calpatcher.dart.snapshot -t browser -f temp/dslink.js -w temp/wrapper.js  > temp/dslink.patched.js
echo "Building patched SDK w/ Browserify"
node node_modules/browserify/bin/cmd.js temp/dslink.patched.js --standalone DS > dist/dslink.js
echo "Minifing"
node node_modules/uglify-js/bin/uglifyjs dist/dslink.js > dist/dslink.min.js
echo "Done."
