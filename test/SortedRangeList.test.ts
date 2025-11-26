import { suite, test } from 'node:test'
import { strictEqual } from 'node:assert'
import { SortedRangeList } from '../lib/SortedRangeList.js'

suite('SortedRangeList', () => {

  test('get', () => {
    const list = new SortedRangeList<string>()
    list.add(0, 4, "A")
    list.add(5, 5, "B")
    list.add(6, 9, "C")

    strictEqual(list.get(0), "A")
    strictEqual(list.get(1), "A")
    strictEqual(list.get(2), "A")
    strictEqual(list.get(3), "A")
    strictEqual(list.get(4), "A")
    strictEqual(list.get(5), "B")
    strictEqual(list.get(6), "C")
    strictEqual(list.get(7), "C")
    strictEqual(list.get(8), "C")
    strictEqual(list.get(9), "C")
    strictEqual(list.get(-1), undefined)
    strictEqual(list.get(10), undefined)
  })

  test('missing interval', () => {
    const list = new SortedRangeList<string>()
    list.add(0, 3, "A")
    list.add(7, 9, "C")

    strictEqual(list.get(0), "A")
    strictEqual(list.get(1), "A")
    strictEqual(list.get(2), "A")
    strictEqual(list.get(3), "A")
    strictEqual(list.get(4), undefined)
    strictEqual(list.get(5), undefined)
    strictEqual(list.get(6), undefined)
    strictEqual(list.get(7), "C")
    strictEqual(list.get(8), "C")
    strictEqual(list.get(9), "C")
    strictEqual(list.get(-1), undefined)
    strictEqual(list.get(10), undefined)
  })

})