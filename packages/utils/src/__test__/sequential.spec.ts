import { describe, test, expect } from '@jest/globals'
import { sequential } from '../sequential'
import { identify } from '../identify'

describe('sequential module', () => {
  test('eager sequential: all fulfills', async () => {
    const result = await sequential([
      () => identify(Promise.resolve(1), '1'),
      () => identify(Promise.resolve(2), '2'),
    ])

    expect(result).toEqual({
      1: 1,
      2: 2
    })
  })
  test('eager sequential: one rejected', async () => {
    const result = await sequential([
      () => identify(Promise.resolve(1), '1'),
      () => identify(Promise.reject(2), '2'),
      () => identify(Promise.resolve(3), '3'),
    ])

    expect(result).toEqual({
      1: 1,
      2: 2,
    })
  })
  test('lazy sequential: one rejected', async () => {
    const result = await sequential([
      () => identify(Promise.resolve(1), '1'),
      () => identify(Promise.reject(2), '2'),
      () => identify(Promise.resolve(3), '3'),
    ], true)

    expect(result).toEqual({
      1: 1,
      2: 2,
      3: 3,
    })
  })
})