# UTS46
A Javascript implementation of [Unicode IDNA Compatibility Processing (UTS 46)](http://www.unicode.org/reports/tr46/).

[![License](http://img.shields.io/npm/l/@oozcitak/uts46.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![NPM Version](http://img.shields.io/npm/v/@oozcitak/uts46.svg?style=flat-square)](https://www.npmjs.com/package/@oozcitak/uts46)

[![Travis Build Status](http://img.shields.io/travis/oozcitak/uts46.svg?style=flat-square)](http://travis-ci.org/oozcitak/uts46)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/c3nh17og08wo1i8m?svg=true)](https://ci.appveyor.com/project/oozcitak/uts46)
[![Dev Dependency Status](http://img.shields.io/david/dev/oozcitak/uts46.svg?style=flat-square)](https://david-dm.org/oozcitak/uts46)
[![Code Coverage](https://img.shields.io/codecov/c/github/oozcitak/uts46?style=flat-square)](https://codecov.io/gh/oozcitak/uts46)

# Version
Current version implements the standard as of version [24](http://www.unicode.org/reports/tr46/tr46-24.html).

# Documentation
The library exports the following functions:

## toASCII(domainName, options)
Converts a domain name string to ASCII. Returns the converted string or `null` if an
error occurs during conversion.

- `domainName` - a domain name string
- `options` - an object with the following boolean properties:
  - `useSTD3ASCIIRules` - determines whether to abide by the rules in 
    [STD3](http://www.rfc-editor.org/std/std3.txt). These rules exclude ASCII
    characters outside the set consisting of A-Z, a-z, 0-9, and U+002D ( - )
    HYPHEN-MINUS. Defaults to `true`.
  - `checkHyphens` - determines whether to allow a domain name label to start
    or end with a U+002D ( - ) HYPHEN-MINUS character and also to contain 
    a hyphen-minus in both its third and fourth characters. Defaults to `true`.
  - `checkBidi` - determines whether to abide by the rules of 
    [RFC 5893](http://tools.ietf.org/html/rfc5893) for a bidirectional domain
    name. Defaults to `true`.
  - `checkJoiners` - determines whether to abide by the rules of 
    [RFC 5892](http://tools.ietf.org/html/rfc5892) ContextJ. Defaults to `true`.
  - `transitionalProcessing` - determines whether to replace deviation characters
    in the domain name string. Defaults to `true`.
  - `verifyDnsLength` - determines whether to apply DNS length restrictions to 
    the domain name string and its labels. Defaults to `true`.

## toUnicode(domainName, options, output)
Converts a domain name string to Unicode.

- `domainName` - a domain name string
- `options` - an object with the following boolean properties:
  - `useSTD3ASCIIRules` - determines whether to abide by the rules in 
    [STD3](http://www.rfc-editor.org/std/std3.txt). These rules exclude ASCII
    characters outside the set consisting of A-Z, a-z, 0-9, and U+002D ( - )
    HYPHEN-MINUS. Defaults to `true`.
  - `checkHyphens` - determines whether to allow a domain name label to start
    or end with a U+002D ( - ) HYPHEN-MINUS character and also to contain 
    a hyphen-minus in both its third and fourth characters. Defaults to `true`.
  - `checkBidi` - determines whether to abide by the rules of 
    [RFC 5893](http://tools.ietf.org/html/rfc5893) for a bidirectional domain
    name. Defaults to `true`.
  - `checkJoiners` - determines whether to abide by the rules of 
    [RFC 5892](http://tools.ietf.org/html/rfc5892) ContextJ. Defaults to `true`.
  - `transitionalProcessing` - Determines whether to replace deviation characters
    in the domain name string. Defaults to `true`.
- `output` - an object containing a single boolean `error` property that is set on return
  indicating if any errors were encountered during conversion.

# Examples
```js
// toUnicode without transitional processing
toUnicode("fass.de", { transitionalProcessing: false }); // "fass.de"
toUnicode("faß.de", { transitionalProcessing: false }); //"faß.de"
toUnicode("Faß.de", { transitionalProcessing: false }); // "faß.de"
toUnicode("xn--fa-hia.de", { transitionalProcessing: false }); // "faß.de"

// toASCII with transitional processing
toASCII("fass.de"); // "fass.de"
toASCII("faß.de"); // "fass.de"
toASCII("Faß.de"); // "fass.de"
toASCII("xn--fa-hia.de"); // "xn--fa-hia.de"

// toASCII without transitional processing'
toASCII("fass.de", { transitionalProcessing: false }); // "fass.de"
toASCII("faß.de", { transitionalProcessing: false }); // "xn--fa-hia.de"
toASCII("Faß.de", { transitionalProcessing: false }); // "xn--fa-hia.de"
toASCII("xn--fa-hia.de", { transitionalProcessing: false }); // "xn--fa-hia.de"
```
