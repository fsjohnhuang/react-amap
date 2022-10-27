
const ID = '__:id:__'

export type IdentifiedType = {[ID]: string}
export type IdentifiedPromise = Promise<any> & IdentifiedType
export type IdentifiedError = {error: any} & IdentifiedType

export function identify(x: IdentifiedType): string | undefined
export function identify(origin: Promise<any>, id: string | (() => string)): IdentifiedPromise

export function identify(x: any, id?: any): any {
  if (id === undefined) {
    return x[ID]
  }
  else {
    id = typeof id === 'function' ? id() : id
    const promise: IdentifiedPromise = x.catch((error: any) => {
      throw {
        error,
        [ID]: id
      }
    })
    promise[ID] = id
    return promise
  }
}