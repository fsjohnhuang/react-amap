export default function identify(promise, id) {
  promise.id = typeof id === 'function' ? id() : id
  promise.catch(e => {
    e.id = promise.id
    throw e
  })
  return promise
}