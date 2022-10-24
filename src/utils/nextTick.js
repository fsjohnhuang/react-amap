const promise = Promise.resolve()
const nextTick = callback => promise.then(callback)

export default nextTick