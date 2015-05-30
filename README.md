# sdk-dslink-javascript

JavaScript SDK for the DSA protocol.

This is the new JavaScript SDK, which is a wrapper around the Dart SDK. Please report all bugs about the new SDK here and not on the Dart SDK repository.

An older version of the SDK can be found at the old-sdk branch (not right now, this isn't merged into master yet). This is the primary SDK, and
the old-sdk branch will only be officially supported for bugs.

## Packaging

### node.js

TODO

### Browser

To package for the browser, you'll need a recent version of node.js installed (0.10, 0.12, io.js), as well as the newest version of the Dart VM,
dart2js, and pub.

```
pub get
npm install
sh build.sh
```

A compiled version of the DSLink API can now be found at dist/dslink.js. A minified version can be found at dist/dslink.min.js.

The SDK can be used in browser under the DS namespace.
