import { describe, test, expect } from '@jest/globals'
import { delay } from '../delay'

describe('delay module', () => {
  test('delay 1000ms', async () => {
    const start = +new Date()
    await delay(1000)
    const end = +new Date()
    expect(end - start).toBeGreaterThanOrEqual(1000)
  })
})