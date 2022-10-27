import { describe, expect, test } from '@jest/globals'
import { isArray } from '../isArray'

describe('isArray module', () => {
  test('1 is not an array', () => {
    expect(isArray(1)).toBe(false)
  })
  test('A boolean value is not an array', () => {
    expect(isArray(true)).toBe(false)
  })
  test('A object is not an array', () => {
    expect(isArray({})).toBe(false)
  })
  test('[1,2] is an array', () => {
    expect(isArray([1,2])).toBe(true)
  })
})