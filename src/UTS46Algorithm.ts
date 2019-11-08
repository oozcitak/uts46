import { IDNAMappingTable, Status } from './IDNAMappingTable'
import { toASCII as punycodeToASCII, decode as punycodeDecode } from 'punycode'
import { clone } from '@oozcitak/util'

/**
 * Represents processing options.
 */
type ProcessOptions = {
  /**
   * Determines whether to abide by the rules in 
   * [STD3](http://www.rfc-editor.org/std/std3.txt). These rules exclude ASCII
   * characters outside the set consisting of A-Z, a-z, 0-9, and U+002D ( - )
   * HYPHEN-MINUS.
   */
  useSTD3ASCIIRules?: boolean
  /**
   * Determines whether to allow a domain name label to start or end with a
   * U+002D ( - ) HYPHEN-MINUS character and also to contain hyphen-minus in both
   * its third and fourth characters.
   */
  checkHyphens?: boolean
  /**
   * Determines whether to abide by the rules of 
   * [RFC 5893](http://tools.ietf.org/html/rfc5893) for a bidirectional domain
   * name.
   */
  checkBidi?: boolean
  /**
   * Determines whether to abide by the rules of 
   * [RFC 5892](http://tools.ietf.org/html/rfc5892) ContextJ rules.
   */
  checkJoiners?: boolean
  /**
   * Determines whether to replace deviation characters in the domain name
   * string.
   */
  transitionalProcessing?: boolean
}

/**
 * Represents ASCII conversion options.
 */
export type ToASCIIOptions = ProcessOptions & {
  /**
   * Determines whether to apply DNS length restrictions to the domain name
   * string and its labels.
   */
  verifyDnsLength?: boolean
}

/**
 * Represents Unicode conversion options.
 */
export type ToUnicodeOptions = ProcessOptions

/**
 * Represents validation options.
 */
type ValidateOptions = ProcessOptions & {
  checkNormalization?: boolean
  checkDot?: boolean
}

/**
 * Processes a domain name string.
 * 
 * @param domainName - domain name
 * @param options - processing options
 * @param output - determines if any errors were produced during processing
 */
function process(domainName: string, options: ProcessOptions, 
  output: { errors: boolean } = { errors: false }): string {

  output.errors = false
  let result = ""
  /**
   * 1. Map. For each code point in the domain_name string, look up the status
   * value in Section 5, IDNA Mapping Table, and take the following actions:
   * - disallowed: Leave the code point unchanged in the string, and record that
   * there was an error.
   * - ignored: Remove the code point from the string. This is equivalent to
   * mapping the code point to an empty string.
   * - mapped: Replace the code point in the string by the value for the mapping
   * in Section 5, IDNA Mapping Table.
   * - deviation:
   *   If Transitional_Processing, replace the code point in the string by the
   * value for the mapping in Section 5, IDNA Mapping Table .
   *   Otherwise, leave the code point unchanged in the string.
   * - valid: Leave the code point unchanged in the string.
   */
  for (const char of domainName) {
    const cp = char.codePointAt(0)
    /* istanbul ignore next */
    if (cp === undefined) {
      throw new Error("Invalid code point.")
    }
    const mapping = IDNAMappingTable.instance.get(cp)
    let status = mapping[0]
    /**
     * Resolve STD3 status codes into Valid, Mapped or Disallowed
     * - disallowed_STD3_valid: the status is disallowed if 
     *   UseSTD3ASCIIRules=true (the normal case); implementations that 
     *   allow UseSTD3ASCIIRules=false would treat the code point as valid.
     * - disallowed_STD3_mapped: the status is disallowed if 
     *   UseSTD3ASCIIRules=true (the normal case); implementations that allow
     *   UseSTD3ASCIIRules=false would treat the code point as mapped.
     */
    if (status === Status.DisallowedSTD3Valid) {
      status = (options.useSTD3ASCIIRules ? Status.Disallowed : Status.Valid)
    } else if (status === Status.DisallowedSTD3Mapped) {
      status = (options.useSTD3ASCIIRules ? Status.Disallowed : Status.Mapped)
    }

    switch (status) {
      case Status.Disallowed:
        output. errors = true
        result += char
        break
      case Status.Ignored:
        // skip this code point
        break
      case Status.Mapped:
        result += String.fromCodePoint(...mapping[1])
        break
      case Status.Deviation:
        if (options.transitionalProcessing)
          result += String.fromCodePoint(...mapping[1])
        else
          result += char
        break
      case Status.Valid:
          result += char
        break                    
    }
  }

  /** 2. Normalize. Normalize the domain_name string to Unicode Normalization
   * Form C. */
  result = result.normalize("NFC")

  /**
   * 3. Break. Break the string into labels at U+002E ( . ) FULL STOP.
   */
  const labels = result.split('.')

  /**
   * 4. Convert/Validate. For each label in the domain_name string:
   */
  const validateOptions = clone(options) as ValidateOptions
  validateOptions.checkNormalization = false
  validateOptions.checkDot = false
  const transitionalProcessing = validateOptions.transitionalProcessing
  for (let i = 0; i < labels.length; i++) {
    let label = labels[i]
    if (label.startsWith("xn--")) {
      /**
       * - If the label starts with “xn--”:
       *   - Attempt to convert the rest of the label to Unicode according to
       * Punycode [RFC3492]. If that conversion fails, record that there was an
       * error, and continue with the next label. Otherwise replace the original
       * label in the string by the results of the conversion.
       *   - Verify that the label meets the validity criteria in Section 4.1,
       * Validity Criteria for Nontransitional Processing. If any of the validity 
       * criteria are not satisfied, record that there was an error.
       */
      try {
        label = punycodeDecode(label.substring(4))
        labels[i] = label
      } catch {
        output.errors = true
        continue
      }
      validateOptions.transitionalProcessing = false
      if (!validate(label, validateOptions)) output.errors = true
      validateOptions.transitionalProcessing = transitionalProcessing
  } else {
      /**
       * - If the label does not start with “xn--”:
       *   - Verify that the label meets the validity criteria in Section 4.1,
       * Validity Criteria for the input Processing choice (Transitional or
       * Nontransitional). If any of the validity criteria are not satisfied,
       * record that there was an error.
       */
      if (!validate(label, options)) output.errors = true
    }

  }

  return labels.join('.')
}

/**
 * Validates a label in a domain name string.
 * 
 * @param label - a label
 * @param options - processing options 
 */
function validate(label: string, options: ValidateOptions): boolean {
  /**
   * 1. The label must be in Unicode Normalization Form NFC.
   */
  if (options.checkNormalization && (label.normalize("NFC") !== label)) return false

  /**
   * 2. If CheckHyphens, the label must not contain a U+002D HYPHEN-MINUS 
   * character in both the third and fourth positions.
   */
  if (options.checkHyphens && label[2] === '-' && label[3] === '-') return false

  /**
   * 3. If CheckHyphens, the label must neither begin nor end with a 
   * U+002D HYPHEN-MINUS character.
   */
  if (options.checkHyphens && (label[0] === '-' || label[label.length - 1] === '-')) return false

  /**
   * 4. The label must not contain a U+002E ( . ) FULL STOP.
   */
  if (options.checkDot && /\./.test(label)) return false

  /**
   * 5. The label must not begin with a combining mark, that is:
   * General_Category=Mark.
   */
  // TODO
  /**
   * 6. Each code point in the label must only have certain status values 
   * according to Section 5, IDNA Mapping Table:
   * 6.1. For Transitional Processing, each value must be valid.
   * 6.2. For Nontransitional Processing, each value must be either valid or 
   * deviation.
   */
  for (const char of label) {
    const cp = char.codePointAt(0)
    /* istanbul ignore next */
    if (cp === undefined) {
      throw new Error("Invalid code point.")
    }
    let status = IDNAMappingTable.instance.get(cp)[0]
    /**
     * Resolve STD3 status codes into Valid, Mapped or Disallowed
     * - disallowed_STD3_valid: the status is disallowed if 
     *   UseSTD3ASCIIRules=true (the normal case); implementations that 
     *   allow UseSTD3ASCIIRules=false would treat the code point as valid.
     * - disallowed_STD3_mapped: the status is disallowed if 
     *   UseSTD3ASCIIRules=true (the normal case); implementations that allow
     *   UseSTD3ASCIIRules=false would treat the code point as mapped.
     */
    if (status === Status.DisallowedSTD3Valid) {
      status = (options.useSTD3ASCIIRules ? Status.Disallowed : Status.Valid)
    } else if (status === Status.DisallowedSTD3Mapped) {
      status = (options.useSTD3ASCIIRules ? Status.Disallowed : Status.Mapped)
    }
    if (options.transitionalProcessing && status !== Status.Valid) return false
    if (!options.transitionalProcessing && status !== Status.Valid && 
      status !== Status.Deviation) return false
  }

  /**
   * 7. If CheckJoiners, the label must satisfy the ContextJ rules from 
   * Appendix A, in The Unicode Code Points and Internationalized Domain Names 
   * for Applications (IDNA) [IDNA2008].
   */
  // TODO

  /**
   * 8. If CheckBidi, and if the domain name is a  Bidi domain name, then the
   * label must satisfy all six of the numbered conditions in [IDNA2008]
   * RFC 5893, Section 2.
   */
  // TODO

  return true
}

/**
 * Converts domain name string to ASCII.
 * 
 * @param domainName - domain name
 * @param options - conversion options
 * @param output - determines if any errors were produced during conversion
 */
export function toASCII(domainName: string, { useSTD3ASCIIRules = true,
  checkHyphens = true, checkBidi = true, checkJoiners = true,
  transitionalProcessing = true, verifyDnsLength = true }: ToASCIIOptions = {}
  ): string | null {
  /**
   * 1. To the input domain_name, apply the Processing Steps in Section 4, 
   * Processing, using the input boolean flags Transitional_Processing, 
   * CheckHyphens, CheckBidi, CheckJoiners, and UseSTD3ASCIIRules. This may 
   * record an error.
   * 2. Break the result into labels at U+002E FULL STOP.
   * 3. Convert each label with non-ASCII characters into Punycode [RFC3492], 
   * and prefix by “xn--”. This may record an error.
   * 4. If VerifyDnsLength flag is true, then verify DNS length restrictions. 
   * This may record an error. For more information, see [STD13] and [STD3].
   * 4.1. The length of the domain name, excluding the root label and its dot, 
   * is from 1 to 253.
   * 4.2. The length of each label is from 1 to 63.
   * 5. If an error was recorded in steps 1-4, then the operation has failed 
   * and a failure value is returned. No DNS lookup should be done.
   * 6. Otherwise join the labels using U+002E FULL STOP as a separator, and 
   * return the result.
   */
  const output = { errors: false }
  const processedName = process(domainName, { useSTD3ASCIIRules, 
    checkHyphens, checkBidi, checkJoiners, transitionalProcessing }, output)
  if (output.errors) {
    return null
  }
  const result = punycodeToASCII(processedName)

  if (verifyDnsLength) {
    const lengthExpectRoot = result.length - (result.indexOf('.') + 1)
    if (lengthExpectRoot < 1 || lengthExpectRoot > 253) {
      output.errors = true
      return null
    }
    for (const label of result.split('.')) {
      if (label.length < 1 || label.length > 63) {
        output.errors = true
        return null
      }
    }
  }

  return result
}

/**
 * Converts domain name string to Unicode.
 * 
 * @param domainName - domain name
 * @param options - conversion options
 * @param output - determines if any errors were produced during conversion
 */
export function toUnicode(domainName: string, { useSTD3ASCIIRules = true,
  checkHyphens = true, checkBidi = true, checkJoiners = true,
  transitionalProcessing = true }: ToUnicodeOptions = { }, 
  output: { errors: boolean } = { errors: false }): string {
  /**
   * 1. To the input domain_name, apply the Processing Steps in Section 4,
   * Processing, using the input boolean flags Transitional_Processing, 
   * CheckHyphens, CheckBidi, CheckJoiners, and UseSTD3ASCIIRules. This may 
   * record an error.
   * 2. Like [RFC3490], this will always produce a converted Unicode string.
   * Unlike ToASCII of [RFC3490], this always signals whether or not there was
   * an error.
   */
  return process(domainName, { useSTD3ASCIIRules, checkHyphens, checkBidi,
    checkJoiners, transitionalProcessing }, output)
}
