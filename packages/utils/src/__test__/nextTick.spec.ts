import { describe, test, expect } from '@jest/globals'
import { nextTick } from '../nextTick'

describe('nextTick module', () => {
  test('run before next marco task call', (done) => {
    let actualValue = 1
    setTimeout(() => {
      actualValue = 2
    }, 0)
    nextTick(() => {
      expect(actualValue).toBe(1)
      done()
    })
  })
})