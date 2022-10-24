export default async function sequential(actions) {
  const result = {}

  let i = 0
  try {
    for (; i < actions.length; ++i) {
      const promise = actions[i]()
      const value = await promise
      result[promise.id] = value
    }
  }
  catch(e) {
    result[e.id] = e
  }

  return result
}