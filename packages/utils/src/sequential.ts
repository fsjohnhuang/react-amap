import { identify, IdentifiedPromise, IdentifiedType, IdentifiedError } from "./identify"

export async function sequential(
  actions: Array<() => IdentifiedPromise>,
  lazy?: boolean
): Promise<{[id: string]: any}>
{
  return (lazy ? sequentialLazy : sequentialEager)(actions)
}

async function sequentialEager(
  actions: Array<() => IdentifiedPromise>
): Promise<{[id: string]: any}> 
{
  const result: {[id: string]: any} = {}
  let i = 0
  try {
    for (; i < actions.length; ++i) {
      const promise = actions[i]()
      result[identify(promise as IdentifiedType)!] = await promise
    }
  }
  catch(e) {
    result[identify(e as IdentifiedError)!] = (e as IdentifiedError).error
  }

  return result
}

async function sequentialLazy(
  actions: Array<() => IdentifiedPromise>
): Promise<{[id: string]: any}> 
{
  const result: {[id: string]: any} = {}
  let i = 0
  for (; i < actions.length; ++i) {
    const promise = actions[i]()
    try {
      result[identify(promise as IdentifiedType)!] = await promise
    }
    catch(e) {
      result[identify(e as IdentifiedError)!] = (e as IdentifiedError).error
    }
  }

  return result
}