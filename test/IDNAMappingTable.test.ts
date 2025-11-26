import { suite, test } from 'node:test'
import { deepEqual, throws } from 'node:assert'
import { IDNAMappingTable, Status, IDNA2008Status } from "../lib/IDNAMappingTable.js"

suite('IDNAMappingTable', () => {

  test('get', () => {
    const table = IDNAMappingTable.instance

    deepEqual(table.get(0x0000), [Status.DisallowedSTD3Valid, [], IDNA2008Status.None])
    throws(() => table.get(-1))
    throws(() => table.get(0x110000))
  })

})
