import { useMemo } from 'react'
import { APILoaderProps } from './types'
import { APILoaderContextProvider } from './APILoaderContext'
import { ScriptLoader } from '@fsjohnhuang/react-amap2-script-loader'

export function APILoaderImpl(props: APILoaderProps) {
  const { protocol, host, version, akey, plugins, maps, loca, ...others } = props
  const [namespaces, instances] = useNamespacesAndInstances(protocol!, host!, version!, akey!, plugins, {maps, loca})

  const urls = useMemo(() => {
    return Object.entries(namespaces).map(([url, namespace]) => ({
      id: namespace,
      url,
      returns() {
        if (namespace in window) {
          // TODO: simplify type conversion
          return (window as Window & typeof globalThis & {[id: string]: any})[namespace]
        }
        throw Error()
      }
    }))
  }
  , [namespaces])
  

  return (
    <ScriptLoader 
      urls={urls}
      visible={others.visible}
      parallel={others.parallel}
      crossorigin='anonymous' 
      retry={others.retry} 
      retryDelay={others.retryDelay}
    >
      {
        (value) => {
          return (
            <APILoaderContextProvider 
              value={{
                akey,
                securityJsCode: others.securityJsCode,
                serviceHost: others.serviceHost,
                protocol,
                host,
                version
              }}
            >
              {props.children}
            </APILoaderContextProvider>
          )
        }
      }
    </ScriptLoader>
  )
}

const PROPS_NAMESPACE = {
  maps: 'AMap',
  loca: 'Loca'
}
type PropsNamespace = keyof (typeof PROPS_NAMESPACE)

function useNamespacesAndInstances(
  protocol: string, 
  host: string, 
  version: string, 
  akey: string, 
  plugins?: string[], 
  props?: {
    maps?: boolean,
    loca?: boolean,
  }
): [{[name: string]: string}, {[name: string]: any}] {
  const plugin = (plugins || []).join(',')

  const [namespaces, instances] = useMemo(() => {
    if (props) {
      return Object.keys(PROPS_NAMESPACE)
        .filter(name => props[name as PropsNamespace])
        .reduce<[{[name: string]: string}, {[name: string]: any}]>(([namespaces, instances], path) => {
          const url = `${protocol}//${host}/${path}?v=${version}&key=${akey}${plugin ? '&plugin=' + plugin : ''}`
          namespaces[url] = PROPS_NAMESPACE[path as PropsNamespace]
          // TODO: simplify the type declaration
          instances[url] = (window as Window & typeof globalThis & { AMap: any, Loca: any })[PROPS_NAMESPACE[path as PropsNamespace] as 'AMap' | 'Loca']

          return [namespaces, instances]
        }, [{}, {}])
    }
    return [{}, {}] 
  }, [protocol, host, version, akey, plugin, props])

  return [namespaces, instances]
}