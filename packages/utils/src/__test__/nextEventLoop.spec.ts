import { describe, test, expect } from '@jest/globals'
import { nextEventLoop } from '../nextEventLoop'

describe('nextEventLoop module', () => {
  test('run after micor queue clean up', (done) => {
    let actualValue: any = undefined
    nextEventLoop(() => {
      expect(actualValue).toBe(1)
      done()
    })
    Promise.resolve().then(() => {
      actualValue = 1
    })
  })
})