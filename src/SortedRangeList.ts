/**
 * Represents a sorted list of ranges.
 */
export class SortedRangeList<T> {
  protected _items: [number, number, T][] = []

  /**
   * Adds a new range of values.
   * 
   * @param min - minimum value
   * @param max - maximum value
   * @param value - value
   */
  add(min: number, max: number, value: T) {
    this._items.push([min, max, value])
  }

  /**
   * Gets a value.
   * 
   * @param key - a key
   */
  get(key: number): T | undefined {
    return this._binarySearch(key, 0, this._items.length - 1)
  }

  /**
   * Binary searches a key between the given array indices.
   * 
   * @param key - a key
   */
  protected _binarySearch(key: number, left: number, right: number): T | undefined {
    if (key < this._items[left][0]) {
      return undefined
    } else if (key > this._items[right][1]) {
      return undefined
    } else if (left === right) {
      return this._items[left][2]
    } else {
      const mid = Math.floor((left + right) / 2)
      const itemMid = this._items[mid]
      if (key < itemMid[0]) {
        return this._binarySearch(key, left, mid - 1)
      } else if (key > itemMid[1]) {
        return this._binarySearch(key, mid + 1, right)
      } else {
        return this._binarySearch(key, mid, mid)
      }
    }
  }

}
