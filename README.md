# sdk-dslink-javascript

JavaScript SDK for the DSA protocol.

This is the new JavaScript SDK, which is a wrapper around the Dart SDK. Please report all bugs about the new SDK here and not on the Dart SDK repository.

An older version of the SDK can be found at the old-sdk branch (not right now, this isn't merged into master yet). This is the primary SDK, and
the old-sdk branch will only be officially supported for bugs.

## Examples

For a heavily annotated example on using the JavaScript SDK, please look at the
[Template DSLink](https://github.com/IOT-DSA/template-dslink-javascript).

## Packaging

In it's most simple form, simply use dslink by downloading the latest version
from npm.

```sh
npm install --save dslink
```

To package, you'll need a recent version of node.js installed (0.10, 0.12, io.js), as well as the newest version of the Dart VM,
dart2js, and pub.

```sh
grind [node|browser]
```

A compiled version of the DSLink API can now be found at dist/dslink.[node|browser].js. A minified version can be found at dist/dslink.[node|browser].min.js.

The SDK can be used in browser under the DS namespace in the browser, or just normally via require() with node.

We also have an automated build system that pushes built versions of the SDK to the artifacts branch. Here is an example of adding the branch to your package.json.

```json
"dependencies": {
  "dslink": "IOT-DSA/sdk-dslink-javascript#artifacts"
}
```
