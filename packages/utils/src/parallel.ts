import { identify, IdentifiedPromise, IdentifiedError } from './identify'

export function parallel(actions: Array<() => IdentifiedPromise>): Promise<{[id: string]: any}> {
  const promises = actions.map(action => action())
  if (promises.find((promise) => identify(promise) === undefined)) {
    throw Error('Each element should have a "id" property with a unique value.')
  }

  return doParallel(promises)
}

async function doParallel(
  promises: Array<IdentifiedPromise>, 
  result: {[id: string]: any} = {}
): Promise<{[id: string]: any}> 
{
  const nextPromises: Array<IdentifiedPromise> = []
  try {
    await (await Promise.all(promises)).forEach((value, i) => {
      result[identify(promises[i])!] = value
    })
  }
  catch(e) {
    promises.forEach(promise => {
      if (identify(e as IdentifiedError) === identify(promise)) {
        result[identify(promise)!] = (e as IdentifiedError).error
      }
      else {
        nextPromises.push(promise)
      }
    })
  }

  if (nextPromises.length === promises.length) {
    throw new Error(`Call 'identity' function of @fsjohnhuang/react-amap2-utils to add id property to both the Proimse instance and its error object.`)
  }
  else if (nextPromises.length > 0) {
    return await doParallel(nextPromises, result)
  }
  else {
    return result
  }
}