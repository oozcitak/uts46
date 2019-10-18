import { SortedRangeList } from '../../src/util'

describe('SortedRangeList', () => {

  test('get', () => {
    const list = new SortedRangeList<string>()
    list.add(0, 4, "A")
    list.add(5, 5, "B")
    list.add(6, 9, "C")

    expect(list.get(0)).toBe("A")
    expect(list.get(1)).toBe("A")
    expect(list.get(2)).toBe("A")
    expect(list.get(3)).toBe("A")
    expect(list.get(4)).toBe("A")
    expect(list.get(5)).toBe("B")
    expect(list.get(6)).toBe("C")
    expect(list.get(7)).toBe("C")
    expect(list.get(8)).toBe("C")
    expect(list.get(9)).toBe("C")
    expect(list.get(-1)).toBeUndefined()
    expect(list.get(10)).toBeUndefined()
  })

  test('missing interval', () => {
    const list = new SortedRangeList<string>()
    list.add(0, 3, "A")
    list.add(7, 9, "C")

    expect(list.get(0)).toBe("A")
    expect(list.get(1)).toBe("A")
    expect(list.get(2)).toBe("A")
    expect(list.get(3)).toBe("A")
    expect(list.get(4)).toBeUndefined()
    expect(list.get(5)).toBeUndefined()
    expect(list.get(6)).toBeUndefined()
    expect(list.get(7)).toBe("C")
    expect(list.get(8)).toBe("C")
    expect(list.get(9)).toBe("C")
    expect(list.get(-1)).toBeUndefined()
    expect(list.get(10)).toBeUndefined()
  })

})