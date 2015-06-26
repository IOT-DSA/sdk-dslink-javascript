#!/usr/bin/env bash
set -e
COL_RESET=$'\e[0m'

COL_GREEN=$'\e[1;32m'
COL_BLUE=$'\e[1;34m'

if [ -z "$2" ] || [ $2 != "dev" ]; then
  rm -rf temp

  mkdir temp
  mkdir dist

  echo -n "$COL_BLUE"
  echo "1/11 Cloning Dart SDK"
  echo -n "$COL_RESET"

  git clone https://github.com/IOT-DSA/sdk-dslink-dart temp/sdk-dslink-dart

  echo -n "$COL_BLUE"
  echo "2/11 Fetching Dart dependencies"
  echo -n "$COL_RESET"

  pub upgrade
  pub get

  echo -n "$COL_BLUE"
  echo "3/11 Patching Dart SDK for node_io"
  echo -n "$COL_RESET"

  dart tool/patch_sdk.dart temp/sdk-dslink-dart

  echo -n "$COL_BLUE"
  echo "4/11 Fetching dependencies"
  echo -n "$COL_RESET"

  pub get
  npm install

  echo -n "$COL_BLUE"
  echo "5/11 Building Dart SDK with dart2js"
  echo -n "$COL_RESET"

  dart2js --dump-info --enable-experimental-mirrors -m -o temp/dslink.js "tool/$1_stub.dart"
else
  echo -n "$COL_GREEN"
  echo "Dev build! Skipping the first 5 steps."
  echo "This requires you to have already built the full SDK once with the correct platform."
  echo -n "$COL_RESET"
fi

echo -n "$COL_BLUE"
echo "6/11 Precompiling JS wrapper for Dart SDK"
echo -n "$COL_RESET"

pub run calzone:calpatcher -m -t "$1" -f temp/dslink.js -w tool/js/scraper.js -i temp/dslink.js.info.json > temp/dslink.scraper.js
node temp/dslink.scraper.js > temp/dslink.scraper.json

echo -n "$COL_BLUE"
echo "7/11 Generating JS wrapper for Dart SDK"
echo -n "$COL_RESET"

dart tool/wrapper_gen.dart "tool/$1_stub.dart" > temp/wrapper.js

echo -n "$COL_BLUE"
echo "8/11 Mangle/minify JS wrapper"
echo -n "$COL_RESET"

node node_modules/uglify-js/bin/uglifyjs "temp/wrapper.js" -m -r "mdex,obdp" > "temp/wrapper.min.js"

echo -n "$COL_BLUE"
echo "9/11 Patching JS wrapper into dart2js output"
echo -n "$COL_RESET"

pub run calzone:calpatcher -m -t "$1" -f temp/dslink.js -w temp/wrapper.min.js -i temp/dslink.js.info.json > temp/dslink.patched.js

echo -n "$COL_BLUE"
echo "10/11 Generating JS SDK at dist/dslink.js"
echo -n "$COL_RESET"

if [ "$1" == "browser" ]
then
  node node_modules/browserify/bin/cmd.js temp/dslink.patched.js --standalone DS > "dist/dslink.$1.js"
else
  cat temp/dslink.patched.js > dist/"dslink.$1.js"
fi

echo -n "$COL_BLUE"
echo "11/11 Minifing at dist/dslink.min.js"
echo -n "$COL_RESET"

node node_modules/uglify-js/bin/uglifyjs "dist/dslink.$1.js" > "dist/dslink.$1.min.js"

echo -n "$COL_GREEN"
echo "Done!"
echo -n "$COL_RESET"
