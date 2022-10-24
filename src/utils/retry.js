const delay = async ms => new Promise(resolve => setTimeout(resolve, ms))

export default function retry(callback, times = 3, baseDelay = 200) {
  return async function(...args) {
    for (let i = 1; i <= times; ++i) {
      try {
        return await callback.apply(this, args)
      }
      catch(e) {
        if (i >= times) {
          throw e
        }
      }
      await delay(1 * baseDelay)
    }
  }
}