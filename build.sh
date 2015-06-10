#!/usr/bin/env bash
set -e
COL_RESET=$'\e[0m'

COL_GREEN=$'\e[1;32m'
COL_BLUE=$'\e[1;34m'

if [ "$2" != "dev" ]
then
  rm -rf temp dist

  mkdir temp
  mkdir dist

  echo -n "$COL_BLUE"
  echo "1/9 Cloning Dart SDK"
  echo -n "$COL_RESET"

  git clone https://github.com/IOT-DSA/sdk-dslink-dart temp/sdk-dslink-dart

  echo -n "$COL_BLUE"
  echo "2/9 Patching Dart SDK for node_io"
  echo -n "$COL_RESET"

  dart tool/patch_sdk.dart temp/sdk-dslink-dart

  echo -n "$COL_BLUE"
  echo "3/9 Fetching Dart dependencies"
  echo -n "$COL_RESET"

  pub get

  echo -n "$COL_BLUE"
  echo "4/9 Fetching node dependencies"
  echo -n "$COL_RESET"

  npm install

  echo -n "$COL_BLUE"
  echo "5/9 Building Dart SDK with dart2js"
  echo -n "$COL_RESET"

  dart2js --dump-info --enable-experimental-mirrors -o temp/dslink.js "tool/$1_stub.dart"
else
  echo -n "$COL_GREEN"
  echo "Dev build! Skipping the first 5 steps."
  echo "This requires you to have already built the full SDK once with the correct platform."
  echo -n "$COL_RESET"
fi

echo -n "$COL_BLUE"
echo "6/9 Generating JS wrapper for Dart SDK"
echo -n "$COL_RESET"

dart tool/wrapper_gen.dart "tool/$1_stub.dart" > temp/wrapper.js

echo -n "$COL_BLUE"
echo "7/9 Patching JS wrapper into dart2js output"
echo -n "$COL_RESET"

pub run calzone:calpatcher -t "$1" -f temp/dslink.js -w temp/wrapper.js  > temp/dslink.patched.js

echo -n "$COL_BLUE"
echo "8/9 Generating JS SDK at dist/dslink.js"
echo -n "$COL_RESET"

if [ "$1" == "browser" ]
then
  node node_modules/browserify/bin/cmd.js temp/dslink.patched.js --standalone DS > "dist/dslink.$1.js"
else
  cat temp/dslink.patched.js > dist/"dslink.$1.js"
fi

echo -n "$COL_BLUE"
echo "9/9 Minifing at dist/dslink.min.js"
echo -n "$COL_RESET"

node node_modules/uglify-js/bin/uglifyjs "dist/dslink.$1.js" > "dist/dslink.$1.min.js"

echo -n "$COL_GREEN"
echo "Done!"
echo -n "$COL_RESET"
