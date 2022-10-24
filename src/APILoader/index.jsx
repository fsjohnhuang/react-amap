import { useEffect, useState, useRef, createContext, useContext } from 'react'
import { requireScriptRetryable, WaitQueue } from '../require-script'
import useNamespacesAndInstances from './useNamespacesAndInstances'
import parallel from '../utils/parallel'
import sequential from '../utils/sequential'
import isDefaultTrue from '../utils/isDefaultTrue'

const VERSION = '2.0'
const PROTOCOL = /^file/.test(window.location.protocol) ? 'https' : window.location.protocol
const HOST = 'webapi.amap.com'
const PATH_NAMESPACE = {
  'maps': 'AMap',
  'loca': 'Loca'
}

const APILoaderContext = createContext()
export const useAPILoaderContext = message => {
  if (useContext(APILoaderContext).type !== APILoaderContext) {
    throw Error(`APILoaderContext ${message}` )
  }
}

export const AMapContext = createContext()

const waitQueue = new WaitQueue()

/**
 * @throws {URIError} - Deal with error by Error Boundary - the native approach of React
 */
export default function APILoader({ 
  securityJsCode,
  serviceHost,
  akey,
  children, 
  protocol = PROTOCOL, 
  host = HOST, 
  version = VERSION, 
  plugin,
  retry = 3,
  pathNamespace = PATH_NAMESPACE, 
  crossorigin = 'anonymous',
  loading,
  visible,
  ...others // like { maps: true, loca: true }
}) {
  const {
    securityJsCode: ancestorSecurityJsCode, 
    serviceHost: ancestorServiceHost,
    protocol: ancestorProtocol,
    host: ancestorHost,
    version: ancestorVersion,
    pathNamespace: ancestorPathNamespace,
    loading: ancestorLoading,
    AMap, 
    Loca,
  } = (useContext(APILoaderContext) || {})

  // inherit config from ancestor like <APILoader><APILoader></APILoader></APILoader>
  securityJsCode = securityJsCode || ancestorSecurityJsCode
  serviceHost = serviceHost || ancestorServiceHost
  protocol = !ancestorProtocol 
    ? protocol
    : protocol === PROTOCOL
    ? ancestorProtocol
    : protocol
  host = !ancestorHost 
    ? host
    : host === HOST
    ? ancestorHost
    : host
  version = !ancestorVersion 
    ? version
    : version === VERSION
    ? ancestorVersion
    : version
  pathNamespace = !ancestorPathNamespace 
    ? pathNamespace
    : pathNamespace === PATH_NAMESPACE
    ? ancestorPathNamespace
    : pathNamespace
  loading = loading || ancestorLoading

  if (!securityJsCode && !serviceHost) throw Error('Either of `securityJsCode` and `serviceHost` should be configured.')
  const { parallel: isParallel } = others
  visible = isDefaultTrue(visible)

  const [ namespaces, instances ] = useNamespacesAndInstances(pathNamespace, protocol, host, version, akey, plugin, others) 
  const [ loaded, setLoaded ] = useState(() => instances)
  const cleanups = useRef([])

  useEffect(() => {
    setLoaded(instances)
  }, [instances])

  useEffect(() => {
    const urls = Object.entries(instances).filter(([_, instance]) => !instance).map(([url]) => url)
    if (urls.length === 0) return

    cleanups.current = urls.map(url => 
      waitQueue.add(url, value => {
        setLoaded(loaded => ({
          ...loaded,
          [url]:  value
        }))
      })
    )

    window._AMapSecurityConfig = { securityJsCode, serviceHost }

    ;(async () => {
      const execute = isParallel ? parallel : sequential
      const actions = urls.map(url => () => requireScriptRetryable(url, { 
        times: retry,
        crossorigin,
        isSuccess: () => window[namespaces[url]] ? window[namespaces[url]] : false
      }))
      const result = await execute(actions)
      waitQueue.notify(result)
    })()

    return () => {
      cleanups.current.forEach(cleanup => cleanup())
    }
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [instances, securityJsCode, serviceHost, namespaces])

  const values = Object.values(loaded)
  let error = values.find(instance => instance instanceof URIError)
  if (error) {
    cleanups.current.forEach(cleanup => cleanup())
    throw error
  }
  if (!visible || !values.every(instance => !!instance)) {
    return loading
  }

  const value = Object.entries(loaded)
    .reduce((value, [url, instance]) => {
      value[namespaces[url]] = instance
      return value
    }, {})

  // for nested APILoader situation like <APILoader><APILoader></APILoader></APILoader>
  value.AMap = value.AMap || AMap
  value.Loca = value.Loca || Loca
  value.securityJsCode = securityJsCode
  value.serviceHost = serviceHost
  value.protocol = protocol
  value.host = host
  value.version = version
  value.pathNamespace = pathNamespace
  value.loading = loading
  value.type = APILoaderContext

  return (
    <APILoaderContext.Provider value={value}>
      <AMapContext.Provider value={{ AMap: value.AMap, Loca: value.Loca }}>
        {children}
      </AMapContext.Provider>
    </APILoaderContext.Provider>
  )
}