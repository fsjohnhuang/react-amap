import isArray from './isArray'

async function doParallel(actions, result = {}) {
  const promises = actions.map(action => action())
  if (promises.find(({id}) => id === undefined)) {
    throw Error('Each element should `id` property with a unique value.')
  }

  const nextPromises = []
  try {
    (await Promise.all(promises)).forEach((value, i) => {
      result[promises[i].id] = value
    })
  }
  catch(e) {
    promises.forEach(promise => {
      if (e.id === promise.id) {
        result[promise.id] = e
      }
      else {
        nextPromises.push(promise)
      }
    })
  }

  if (nextPromises.length) {
    return await doParallel(nextPromises, result)
  }
  else {
    return result
  }
}

export default function parallel(actions, ...otherActions) {
  actions = isArray(actions) ? actions.concat(otherActions) : [actions, ...otherActions]

  return doParallel(actions)
}