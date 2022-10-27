import { describe, test, expect } from '@jest/globals'
import { identify, IdentifiedPromise } from '../identify'

describe('identify module', () =>{
  test('add identity to promise instance', () => {
    const promise = Promise.resolve()
    const identifiedPromise:IdentifiedPromise = identify(promise, 'dummy-id')
    expect(identify(identifiedPromise)).toBe('dummy-id')
  })

  test('the original promise instance does not have identity', () => {
    const promise = Promise.resolve()
    identify(promise, 'dummy-id')
    expect(identify(promise as IdentifiedPromise)).toBeUndefined()
  })

  test('add identity to error type of which is Object', () => {
    expect.assertions(2)
    const expectedError = {}
    const promise = Promise.reject(expectedError)
    return identify(promise, 'dummy-id').catch(e => {
      expect(identify(e)).toBe('dummy-id')
      expect(e).toHaveProperty('error', expectedError)
    })
  })

  describe('add identity to error type of which is primitive', () => {
    test('number', () => {
      expect.assertions(2)
      const expectedError = 1
      const promise = Promise.reject(expectedError)
      return identify(promise, 'dummy-id').catch(e => {
        expect(identify(e)).toBe('dummy-id')
        expect(e).toHaveProperty('error', expectedError)
      })
    })
    test('string', () => {
      expect.assertions(2)
      const expectedError = ''
      const promise = Promise.reject(expectedError)
      return identify(promise, 'dummy-id').catch(e => {
        expect(identify(e)).toBe('dummy-id')
        expect(e).toHaveProperty('error', expectedError)
      })
    })
    test('boolean', () => {
      expect.assertions(2)
      const expectedError = true
      const promise = Promise.reject(expectedError)
      return identify(promise, 'dummy-id').catch(e => {
        expect(identify(e)).toBe('dummy-id')
        expect(e).toHaveProperty('error', expectedError)
      })
    })
    test('undefined', () => {
      expect.assertions(2)
      const expectedError = undefined
      const promise = Promise.reject(expectedError)
      return identify(promise, 'dummy-id').catch(e => {
        expect(identify(e)).toBe('dummy-id')
        expect(e).toHaveProperty('error', expectedError)
      })
    })
    test('null', () => {
      expect.assertions(2)
      const expectedError = null
      const promise = Promise.reject(expectedError)
      return identify(promise, 'dummy-id').catch(e => {
        expect(identify(e)).toBe('dummy-id')
        expect(e).toHaveProperty('error', expectedError)
      })
    })
  })
})