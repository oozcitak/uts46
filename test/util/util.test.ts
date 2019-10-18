import * as util from '../../src/util'

describe('util', () => {

  test('isBoolean', () => {
    expect(util.isBoolean(true)).toBe(true)
    expect(util.isBoolean(true)).toBe(true)
    expect(util.isBoolean(1)).toBe(false)
    expect(util.isBoolean(0)).toBe(false)
    expect(util.isBoolean("x")).toBe(false)
    expect(util.isBoolean(["x"])).toBe(false)
    expect(util.isBoolean({ x: "x" })).toBe(false)
    expect(util.isBoolean(() => { })).toBe(false)
  })

  test('isNumber', () => {
    expect(util.isNumber(1)).toBe(true)
    expect(util.isNumber(0)).toBe(true)
    expect(util.isNumber(NaN)).toBe(true)
    expect(util.isNumber(Infinity)).toBe(true)
    expect(util.isNumber("x")).toBe(false)
    expect(util.isNumber(["x"])).toBe(false)
    expect(util.isNumber({ x: "x" })).toBe(false)
    expect(util.isNumber(() => { })).toBe(false)
  })

  test('isString', () => {
    expect(util.isString("")).toBe(true)
    expect(util.isString("0")).toBe(true)
    expect(util.isString(1)).toBe(false)
    expect(util.isString(["x"])).toBe(false)
    expect(util.isString({ x: "x" })).toBe(false)
    expect(util.isString(() => { })).toBe(false)
  })

  test('isFunction', () => {
    expect(util.isFunction(() => { })).toBe(true)
    expect(util.isFunction("0")).toBe(false)
    expect(util.isFunction(1)).toBe(false)
    expect(util.isFunction(["x"])).toBe(false)
    expect(util.isFunction({ x: "x" })).toBe(false)
  })

  test('isObject', () => {
    expect(util.isObject(() => { })).toBe(true)
    expect(util.isObject(["x"])).toBe(true)
    expect(util.isObject({ x: "x" })).toBe(true)
    expect(util.isObject("0")).toBe(false)
    expect(util.isObject(1)).toBe(false)
  })

  test('isArray', () => {
    expect(util.isArray(["x"])).toBe(true)
    expect(util.isArray(() => { })).toBe(false)
    expect(util.isArray({ x: "x" })).toBe(false)
    expect(util.isArray("0")).toBe(false)
    expect(util.isArray(1)).toBe(false)
  })

  test('isEmpty', () => {
    expect(util.isEmpty([])).toBe(true)
    expect(util.isEmpty({})).toBe(true)
    expect(util.isEmpty(["x"])).toBe(false)
    expect(util.isEmpty({ x: "x" })).toBe(false)

    expect(util.isEmpty(123)).toBe(false)
    expect(util.isEmpty(0)).toBe(false)
    expect(util.isEmpty(true)).toBe(false)
    expect(util.isEmpty(false)).toBe(false)
    expect(util.isEmpty("nope")).toBe(false)
    expect(util.isEmpty("")).toBe(false)

    class Obj { }
    const emptyObj = new Obj()
    Reflect.setPrototypeOf(emptyObj, { id: 42 })
    expect(util.isEmpty(emptyObj)).toBe(true)
  })

  test('utf8Encode', () => {
    expect(util.utf8Encode("HELLO")).toEqual(new Uint8Array([72, 69, 76, 76, 79]))
    expect(util.utf8Encode("Ö")).toEqual(new Uint8Array([195, 150]))
    expect(util.utf8Encode("\u9733")).toEqual(new Uint8Array([233, 156, 179]))
    expect(util.utf8Encode("\u{1f600}")).toEqual(new Uint8Array([240, 159, 152, 128]))
    expect(util.utf8Encode("\u{1f600}")).toEqual(new Uint8Array([240, 159, 152, 128]))
    // invalid surrogates
    expect(() => util.utf8Encode(String.fromCharCode(0xd83d))).toThrow()
    expect(() => util.utf8Encode(String.fromCharCode(0xd83d, 0xd000))).toThrow()
  })

  test('utf8Decode', () => {
    expect(util.utf8Decode(new Uint8Array([72, 69, 76, 76, 79]))).toBe("HELLO")
    expect(util.utf8Decode(new Uint8Array([195, 150]))).toBe("Ö")
    expect(util.utf8Decode(new Uint8Array([233, 156, 179]))).toBe("\u9733")
    expect(util.utf8Decode(new Uint8Array([240, 159, 152, 128]))).toBe("\u{1f600}")
    expect(util.utf8Decode(new Uint8Array([240, 159, 152, 128]))).toBe("\u{1f600}")
    // invalid byte sequences
    expect(() => util.utf8Decode(new Uint8Array([198]))).toThrow()
    expect(() => util.utf8Decode(new Uint8Array([233, 156]))).toThrow()
    expect(() => util.utf8Decode(new Uint8Array([240, 159, 152]))).toThrow()
    expect(() => util.utf8Decode(new Uint8Array([250]))).toThrow()
    expect(() => util.utf8Decode(new Uint8Array([247, 143, 191, 191]))).toThrow()
  })

})