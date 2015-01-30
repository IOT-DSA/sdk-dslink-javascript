var crypto = require('crypto'),
    bignum = require('bignum'),
    assert = require('better-assert'),
    handshake = require('../lib/connection/handshake.js'),
    DS = require('../index.js'),
    _ = require('../lib/internal.js');

describe('HandshakeClient', function() {
  var m = 'jjxTpOaEQO4SlZQAGYlMHIEJvz6mDWQlxUW7uMOiSe2Dg60wu8I3pnQ0HDHYTQ35rP2i80WmEbaScTVz-oITO7Lh0470_epOtuwDWezEomdP2dheiGI4jageiJ0ratZ0VqQi63thfGOaBGpG15-TUaDNRUSyB8JQlGWJrojS5lIcVsnkq129mgBOFJCUzLWBp0fwbFBve1T3cYLrPoLQgIQPINiMnokw-iRjp-C9o8cqbh1WBBQOeSxg97AD4L-0mO6NgzhXZ_jjwaJG10e9BHQkvatwU-PFivnasH_fXbyXJqs-plWCQY462Ook2xer_94gCVT8gFubBalBjluw3Q',
      e = 'eBMZkdZAxAe3jKrawrQTmuScc-TRjfCDqlxKM5qEQODP67Ojtn4pOM5Ux5CUx8gKhS3CCJk9rypvyj6T4GE7F2TWHCFNVaYeOXJZCetFvMx2rrNoar5we7X3wODeLF1K7XG3QRBxpe73sM5_a7x9Q6X6ZIWvvbkfCYgGiV9cm65nps4UTTmBnnh6GXcDFx9uPD5uPeMowtZh-bHzFfEYCj9dBaPfa9mQhHtqFODH8TpTOCDB8iPsJpl7loFmQQZzTRq6qr1UfPzRmfhJi_b_zdj8r5_gUEL8593StiXMIcPYlTnmUPRZtWjpFrlu3H4xEIMkPzowLqhp8KKotFGSCQ'
      salt = '0x100',
      nonceBytes = new Buffer([
        0xd2,
        0x65,
        0x38,
        0xaa,
        0xbf,
        0x9a,
        0x97,
        0xbc,
        0xfd,
        0x8b,
        0xc0,
        0xdd,
        0x1a,
        0x72,
        0x7c,
        0x92
      ]),
      encryptedNonce = 'YM2x5wEChxriLalS8tD5l2hlV6MUU-MmqbUNyDz5dUl1x8sNt7cBdh0MLc7mSb8Ohx-Q2_tW-i9fA0WQNFdWIdDZfNziUF4snFtZjez77eOSXFns4j51ZMdGXeWGRrlF5F1pGtIorFfMaofbD-QjX-VIe-TD-6QJDHVL9larXxVS2lnxY5YDhS1niHY-MXCBVUMPt9b9OOz87GTUlTu1mZJbq004mU_Du81D8j7aRNbaSIKmYWPJpoqW00yNXkADQZmVL8xVxyEApMrDF9VQMo1cNle5Tyxtvn79fF7zNE6On0JDaRg0ozP_fjV2-V_afr-OkStIWh5K_zBHfH1Xyg',
      auth = 'MRxHkgT_dEszsB3kWe3HSu1Z8V1c1Z_uTvxP66';

  var modulus = new Buffer(m, 'base64'),
      exponent = new Buffer(e, 'base64');

  it('dsId', function() {
    var hash = crypto.createHash('sha256');
    hash.update(modulus);

    assert("pTrfpbVWb3NNAhMIXr_FpmV3oObtMVxPcNu2mDksp0M" === _.replaceAll(_.Base64.urlSafe(hash.digest('base64')), '=', ''));
  });

  it('nonce', function() {
    var eNonce = bignum.fromBuffer(nonceBytes).powm(65537, bignum.fromBuffer(modulus));
    eNonce = _.replaceAll(_.Base64.urlSafe(eNonce.toBuffer().toString('base64')), '=', '');
    assert(eNonce === encryptedNonce);

    var nonce = handshake.HandshakeClient.prototype.decryptNonce.call(null, {
      getPrivateExponent: function() {
        return exponent;
      },
      getModulus: function() {
        return modulus;
      }
    }, encryptedNonce);

    assert(nonce.toString('binary') === nonceBytes.toString('binary'));
  });

  /*
  it('auth', function() {
    var buf = _.Buffer.merge(new Buffer(salt, 'utf8'), nonceBytes);
    assert(buf.toString('hex') === '3078313030d26538aabf9a97bcfd8bc0dd1a727c92');

    var hash = crypto.createHash('sha256');
    hash.update(buf);
    hash = hash.digest();

    console.log(hash);
    console.log(auth);
    assert(hash.toString('binary') === new Buffer(auth, 'base64').toString('binary'));
  });
  */
});
