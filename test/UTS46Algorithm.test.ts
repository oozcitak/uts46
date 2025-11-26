import { suite, test } from 'node:test'
import { strictEqual } from 'node:assert'
import * as uts46 from '../lib/index.js'

suite('UTS46Algorithm', () => {

  test('toUnicode - non-transitional', () => {
    strictEqual(uts46.toUnicode("fass.de", { transitionalProcessing: false }), "fass.de")
    strictEqual(uts46.toUnicode("faß.de", { transitionalProcessing: false }), "faß.de")
    strictEqual(uts46.toUnicode("Faß.de", { transitionalProcessing: false }), "faß.de")
    strictEqual(uts46.toUnicode("xn--fa-hia.de", { transitionalProcessing: false }), "faß.de")
  })

  test('toASCII - transitional', () => {
    strictEqual(uts46.toASCII("fass.de"), "fass.de")
    strictEqual(uts46.toASCII("faß.de"), "fass.de")
    strictEqual(uts46.toASCII("Faß.de"), "fass.de")
    strictEqual(uts46.toASCII("xn--fa-hia.de"), "xn--fa-hia.de")
  })

  test('toASCII - non-transitional', () => {
    strictEqual(uts46.toASCII("fass.de", { transitionalProcessing: false }), "fass.de")
    strictEqual(uts46.toASCII("faß.de", { transitionalProcessing: false }), "xn--fa-hia.de")
    strictEqual(uts46.toASCII("Faß.de", { transitionalProcessing: false }), "xn--fa-hia.de")
    strictEqual(uts46.toASCII("xn--fa-hia.de", { transitionalProcessing: false }), "xn--fa-hia.de")
  })

})