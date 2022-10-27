import { describe, test, expect } from '@jest/globals'
import { parallel } from '../parallel'
import { identify } from '../identify'

describe('parallel module', () => {
  test('all fulfull', async () => {
    const result = await parallel([
      () => identify(Promise.resolve(1), '1'),
      () => identify(Promise.resolve(2), '2'),
      () => identify(Promise.resolve(3), '3'),
    ])

    expect(result).toEqual({
      1: 1,
      2: 2,
      3: 3,
    })
  })
  test('one rejected', async () => {
    const result = await parallel([
      () => identify(Promise.resolve(1), '1'),
      () => identify(Promise.reject(2), '2'),
      () => identify(Promise.resolve(3), '3'),
    ])

    expect(result).toEqual({
      1: 1,
      2: 2,
      3: 3,
    })
  })
})
