import retry from './utils/retry'
import identify from './utils/identify'

const importedScripts = {}

const nextEventLoop = callback => setTimeout(callback, 16)

class Loading {
  constructor(src) {
    this.message = `The script ${src} is loading or has been loaded yet.`
  }

  toString() {
    return this.message
  }
}

async function doRequireScript(src, options) {
  if (process.env.NODE_ENV === 'development') {
    console.info('doRequireScript', src, options)
  }
  const { crossorigin, isSuccess } = options

  if (importedScripts[src]) {
    const success = isSuccess === undefined ? true : isSuccess()
    if (success !== false) {
      return success
    }
    throw new Loading(src)
  }

  const headElement = document.head || document.getElementsByTagName('head')[0] || document.body
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.defer = true
  script.src = src
  if (['anonymous', 'use-credentials'].indexOf(crossorigin) !== -1) {
    script.setAttribute('crossorigin', crossorigin)
  }
  importedScripts[src] = true

  function getError() {
    headElement.removeChild(script)
    delete importedScripts[src]
    return URIError(`The script ${src} is not accessible.`)
  }

  return new Promise((resolve, reject) => {
    // #issue: response 404 or 500 and so forth would not fire error event on script element, but it will trigger syntax error which could be caught by window.onerror.
    function handleError(err) {
      if (
        err.filename === src || 
        RegExp(`^${window.location.protocol}//${window.location.host}/?$`.replace('.', '\\.')).test(err.filename.replace(src, ''))
      ) {
        dispose(() => reject(getError()))
      }
    }
    window.addEventListener('error', handleError)
    const dispose = finalize => {
      if (dispose.done) return

      dispose.done = true
      nextEventLoop(() => { window.removeEventListener('error', handleError) })
      finalize && finalize()
    }

    script.onerror = () => dispose(() => reject(getError()))
    script.onload = () => {
      const success = isSuccess === undefined ? true : isSuccess()
      dispose(
        success !== false
        ? resolve(success)
        : () => reject(getError())
      )
    }

    headElement.appendChild(script)
  })
}

export const requireScript = (src, options) => {
  return identify(doRequireScript(src, options), src)
}

export const requireScriptRetryable = (src, options) => {
  const { times, baseDelay, ...others } = options
  const promise = retry(doRequireScript, times, baseDelay)(src, others)
  return identify(promise, src)
}

export class WaitQueue {
  queue = {}

  add(id, callback) {
    this.queue[id] = this.queue[id] || new Set()
    this.queue[id].add(callback)

    return () => {
      this.queue[id] && this.queue[id].delete(callback)
    }
  }

  notify(result) {
    Object.entries(result).forEach(([id, value]) => {
      if (value instanceof Loading || !this.queue[id]) return

      this.queue[id].forEach(callback => callback(value))
      delete this.queue[id]
    })
  }
}