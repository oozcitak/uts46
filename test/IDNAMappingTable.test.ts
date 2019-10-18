import { IDNAMappingTable, Status, IDNA2008Status } from '../src/IDNAMappingTable'

describe('IDNAMappingTable', () => {

  test('get', () => {
    const table = IDNAMappingTable.instance

    expect(table.get(0x0000)).toEqual([Status.DisallowedSTD3Valid, [], IDNA2008Status.None])
    expect(() => table.get(-1)).toThrow()
    expect(() => table.get(0x110000)).toThrow()
  })

})