# sdk-dslink-javascript [![Build Status](https://drone.io/github.com/IOT-DSA/sdk-dslink-javascript/status.png)](https://drone.io/github.com/IOT-DSA/sdk-dslink-javascript/latest)

JavaScript SDK for DSA.

## Packaging

### node.js

For use with node.js/io.js, no packaging step is required. Just require() and go!

### Browser

To package for the browser, you'll need a recent version of node.js installed (0.10, 0.12, io.js).

```
npm install
gulp browser
```

A minified, compiled version of the DSLink API can now be found at dist/dslink.js. The SDK can be used in browser under the DS namespace.

### Contributing

When contributing, please make sure the test suite passes before pull requesting (or change the tests accordingly). The Gulp task 'test' will lint the SDK, as well as run tests.
