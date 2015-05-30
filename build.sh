CALZONE_PATH="./.pub/bin/calzone"
# CALZONE_PATH="../calzone.dart/bin"

CALZONE_EXT=".dart.snapshot"
# CALZONE_EXT=".dart"

# rm -rf temp
mkdir temp
mkdir dist
echo "Building the JavaScript SDK"
dart2js --dump-info --enable-experimental-mirrors -o temp/dslink.js tool/$1_stub.dart
echo "Building bridge/wrapper from dart2js to JS"
dart $CALZONE_PATH/calzone$CALZONE_EXT temp/dslink.js.info.json tool/dslink.include > temp/wrapper.js
echo "Patching into SDK"
dart $CALZONE_PATH/calpatcher$CALZONE_EXT -t $1 -f temp/dslink.js -w temp/wrapper.js  > temp/dslink.patched.js
if [ $1 == "browser" ]; then
  echo "Building patched SDK w/ Browserify"
  node node_modules/browserify/bin/cmd.js temp/dslink.patched.js --standalone DS > dist/dslink.js
else
  echo "Moving to dist/dslinkk.js"
  cat temp/dslink.patched.js > dist/dslink.js
fi
echo "Minifing"
node node_modules/uglify-js/bin/uglifyjs dist/dslink.js > dist/dslink.min.js
echo "Done."
