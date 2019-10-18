/**
 * Deep clones the given object.
 * 
 * @param obj - an object
 */
export function clone(obj: any): any {
  if (isFunction(obj)) {
    return obj
  } else if (isArray(obj)) {
    const result: any = []
    for (const item of obj) {
      result.push(clone(item))
    }
    return result
  } else if (isObject(obj)) {
    const result: any = {}
    for (const key in obj) {
      /* istanbul ignore else */
      if (obj.hasOwnProperty(key)) {
        result[key] = clone(obj[key])
      }
    }
    return result
  } else {
    return obj
  }
}

/**
 * Type guard for boolean types
 * 
 * @param x - a variable to type check
 */
export function isBoolean(x: any): x is boolean {
  return typeof x === "boolean"
}

/**
 * Type guard for numeric types
 * 
 * @param x - a variable to type check
 */
export function isNumber(x: any): x is number {
  return typeof x === "number"
}

/**
 * Type guard for strings
 * 
 * @param x - a variable to type check
 */
export function isString(x: any): x is string {
  return typeof x === "string"
}

/**
 * Type guard for function objects
 * 
 * @param x - a variable to type check
 */
export function isFunction(x: any): x is Function {
  return !!x && Object.prototype.toString.call(x) === '[object Function]'
}

/**
 * Type guard for JS objects
 * 
 * _Note:_ Functions are objects too
 * 
 * @param x - a variable to type check
 */
export function isObject(x: any): x is { [key: string]: any } {
  const type = typeof x
  return !!x && (type === 'function' || type === 'object')
}

/**
 * Type guard for arrays
 * 
 * @param x - a variable to type check
 */
export function isArray(x: any): x is any[] {
  return Array.isArray(x)
}

/**
 * Determines if `x` is an empty Array or an Object with no own properties.
 * 
 * @param x - a variable to check
 */
export function isEmpty(x: any): boolean {
  if (isArray(x)) {
    return !x.length
  } else if (isObject(x)) {
    for(const key in x) {
      if(x.hasOwnProperty(key)) {
        return false
      }
    }    
    return true
  }

  return false
}

/**
 * UTF-8 encodes the given string.
 * 
 * @param input - a string
 */
export function utf8Encode(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length * 4)
  let byteIndex = 0
	for (let i = 0; i < input.length; i++) {
		let char = input.charCodeAt(i)
		if (char < 128) {
			bytes[byteIndex++] = char
			continue
		} else if (char < 2048) {
			bytes[byteIndex++] = char >> 6 | 192
		} else {
			if (char > 0xd7ff && char < 0xdc00) {
				if (++i >= input.length) {
          throw new Error("Incomplete surrogate pair.")
        }
				const c2 = input.charCodeAt(i)
				if (c2 < 0xdc00 || c2 > 0xdfff) {
          throw new Error("Invalid surrogate character.")
        }
				char = 0x10000 + ((char & 0x03ff) << 10) + (c2 & 0x03ff)
				bytes[byteIndex++] = char >> 18 | 240
				bytes[byteIndex++] = char >> 12 & 63 | 128
			} else {
        bytes[byteIndex++] = char >> 12 | 224
      }
			bytes[byteIndex++] = char >> 6 & 63 | 128
		}
		bytes[byteIndex++] = char & 63 | 128
  }
  
	return bytes.subarray(0, byteIndex)
}

/**
 * UTF-8 decodes the given byte sequence into a string.
 * 
 * @param bytes - a byte sequence
 */
export function utf8Decode(bytes: Uint8Array): string {
	let result = ""
	let i = 0
	while (i < bytes.length) {
		var c = bytes[i++]
		if (c > 127) {
			if (c > 191 && c < 224) {
				if (i >= bytes.length) {
          throw new Error("Incomplete 2-byte sequence.")
        }
				c = (c & 31) << 6 | bytes[i++] & 63
			} else if (c > 223 && c < 240) {
				if (i + 1 >= bytes.length) {
          throw new Error("Incomplete 3-byte sequence.")
        }
				c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63
			} else if (c > 239 && c < 248) {
				if (i + 2 >= bytes.length) {
          throw new Error("Incomplete 4-byte sequence.")
        }
				c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63
			} else {
        throw new Error("Unknown multi-byte start.")
      }
		}
		if (c <= 0xffff) {
      result += String.fromCharCode(c)
    }
		else if (c <= 0x10ffff) {
			c -= 0x10000
			result += String.fromCharCode(c >> 10 | 0xd800)
			result += String.fromCharCode(c & 0x3FF | 0xdc00)
		} else {
      throw new Error("Code point exceeds UTF-16 limit.")
    }
  }
  
	return result
}

export { SortedRangeList } from './SortedRangeList'