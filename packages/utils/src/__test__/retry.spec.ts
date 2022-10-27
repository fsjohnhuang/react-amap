import { describe, test, expect } from '@jest/globals'
import { retry } from '../retry'

describe('retry module', () => {
  test('success without retry', async () => {
    let count = 0
    const result = await retry(function(a, b){
      count = count + a + b
      return true
    })(1, 2)
    expect(count).toBe(3)
    expect(result).toBeTruthy()
  })

  test('success after retry 2 times', async () => {
    let count = 0
    const result = await retry(function(a, b){
      count = count + a + b
      if (count > 4) {
        return true
      }
      throw Error()
    })(1, 1)
    expect(count).toBe(6)
    expect(result).toBeTruthy()
  })

  test('fail after retry 1 times', async () => {
    expect.assertions(2)

    let count = 0
    try {
      await retry(function(a, b){
        count = count + a + b
        throw new Error()
      }, 2)(1, 1)
    }
    catch(e) {
      expect(count).toBe(4)
      expect(e).toBeInstanceOf(Error)
    }
  })
})