import { retry, nextEventLoop } from '@fsjohnhuang/react-amap2-utils'

export interface RequireScriptOptions {
  crossorigin?: 'anonymous' | 'use-credentials'
  returns?: () => Promise<any>
  force?: boolean
}

export interface RequireScriptRetryableOptions extends RequireScriptOptions {
  times?: number
  retryDelay?: number
}

export class RequireScriptLoading {
  constructor(public src: string){}

  toString() {
    return `Script "${this.src}" is loading by other require script call.`
  }
}

/**
 * @param {string} src 
 * @param {RequireScriptOptions} options 
 * @returns {undefined | any} `undefined` or the return value of `options.returns`
 * @throws {RequireScriptLoading}
 */
export async function requireScript(src: string, options: RequireScriptOptions): Promise<any> {
  if (process.env.NODE_ENV === 'development') {
    console.info('requireScript', src, options)
  }

  if (!options.force && src in loadedScripts) {
    return loadedScripts[src]
  }
  else if (loadingScripts[src]) {
    if (options.returns) {
      try {
        loadedScripts[src] = await options.returns()
        return loadedScripts[src]
      }
      catch(e) {}
    }
    
    throw new RequireScriptLoading(src)
  }

  const parent = document.head || document.getElementsByTagName('head')[0] || document.body
  const script = createScriptElement(src, options.crossorigin)
  function createError() {
    parent.removeChild(script)
    return URIError(`The script ${src} is not accessible.`)
  }

  return new Promise((resolve, reject) => {
    let disposed = false
    function dispose(finalize: () => void): void {
      if (disposed) return

      disposed = true
      delete loadingScripts[src]
      nextEventLoop(() => { window.removeEventListener('error', handleError) })
      finalize()
    }

    // #issue: response 404 or 500 and so forth would not fire error event on script element, but it will trigger syntax error which could be caught by window.onerror.
    function handleError(err: ErrorEvent) {
      if (
        err.filename === src || 
        RegExp(`^${window.location.protocol}//${window.location.host}/?$`.replace('.', '\\.')).test(err.filename.replace(src, ''))
      ) {
        dispose(() => reject(createError()))
      }
    }

    script.onerror = () => dispose(() => reject(createError()))
    script.onload = async () => {
      if (options.returns) {
        try {
          loadedScripts[src] = await options.returns()
          dispose(() => resolve(loadedScripts[src]))
        }
        catch(e) {
          dispose(() => reject(createError()))
        }
      }
      else {
        dispose(() => resolve(undefined))
      }
    }

    parent.appendChild(script)
  })
}

export function requireScriptRetryable(src: string, options: RequireScriptRetryableOptions): Promise<any> {
  const {times, retryDelay, ...others} = options
  return retry(requireScript, times, retryDelay)(src, others)
}

const loadingScripts: {[src: string]: boolean} = {}
const loadedScripts: {[src: string]: any} = {}

function createScriptElement(src: string, crossorigin?: 'anonymous' | 'use-credentials'): HTMLScriptElement {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.defer = true
  script.src = src
  if(crossorigin) {
    script.setAttribute('crossorigin', crossorigin)
  }

  return script
}