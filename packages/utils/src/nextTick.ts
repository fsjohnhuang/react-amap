const promise = Promise.resolve()

export function nextTick<T>(callback: () => T): Promise<T> {
  return promise.then(callback)
}