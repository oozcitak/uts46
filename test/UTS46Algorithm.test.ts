import * as uts46 from '../src'

describe('UTS46Algorithm', () => {

  test('toUnicode - non-transitional', () => {
    expect(uts46.toUnicode("fass.de", { transitionalProcessing: false })).toBe("fass.de")
    expect(uts46.toUnicode("faß.de", { transitionalProcessing: false })).toBe("faß.de")
    expect(uts46.toUnicode("Faß.de", { transitionalProcessing: false })).toBe("faß.de")
    expect(uts46.toUnicode("xn--fa-hia.de", { transitionalProcessing: false })).toBe("faß.de")
  })

  test('toASCII - transitional', () => {
    expect(uts46.toASCII("fass.de")).toBe("fass.de")
    expect(uts46.toASCII("faß.de")).toBe("fass.de")
    expect(uts46.toASCII("Faß.de")).toBe("fass.de")
    expect(uts46.toASCII("xn--fa-hia.de")).toBe("xn--fa-hia.de")
  })

  test('toASCII - non-transitional', () => {
    expect(uts46.toASCII("fass.de", { transitionalProcessing: false })).toBe("fass.de")
    expect(uts46.toASCII("faß.de", { transitionalProcessing: false })).toBe("xn--fa-hia.de")
    expect(uts46.toASCII("Faß.de", { transitionalProcessing: false })).toBe("xn--fa-hia.de")
    expect(uts46.toASCII("xn--fa-hia.de", { transitionalProcessing: false })).toBe("xn--fa-hia.de")
  })

})