import { delay } from './delay'

export function retry(func: (...args: any[]) => any, times = 3, retryDelay = 200) {
  return async function(this: any, ...args: any[]) {
    for (let i = 1; i <= times; ++i) {
      try {
        return await func.apply(this, args)
      }
      catch(e) {
        if (i >= times) {
          throw e
        }
      }
      await delay(i * retryDelay)
    }
  }
}