import * as uts46 from '../src'

describe('UTS46Algorithm', () => {

  test('toASCII', () => {
    expect(uts46.toASCII("fass.de")).toBe("fass.de")
  })

})