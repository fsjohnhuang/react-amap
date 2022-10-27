import { APILoaderProps } from './types'
import { APILoaderImpl } from './APILoaderImpl'

export function APILoader(props: APILoaderProps) {
  const {akey, securityJsCode, serviceHost, protocol, host, version, retry, retryDelay } = useContext(APILoaderContext)
  props.akey = props.akey || akey
  props.securityJsCode = props.securityJsCode || securityJsCode
  props.serviceHost = props.serviceHost || serviceHost
  props.protocol = props.protocol || protocol || PROTOCOL
  props.host = props.host || host || HOST
  props.version = props.version || version || VERSION
  props.retry = props.retry || retry || RETRY
  props.retryDelay = props.retryDelay || retryDelay || RETRY_DELAY

  if (!props.akey) {
    throw Error(`The 'akey' props should not be empty.`)
  }

  if (props.securityJsCode || props.serviceHost) {
    (window as AMapWindow)._AMapSecurityConfig = {
      securityJsCode: props.securityJsCode,
      serviceHost: props.serviceHost,
    }

    return <APILoaderImpl {...props}>{props.children}</APILoaderImpl>
  }
  else {
    throw Error(`Either of 'securityJsCode' and 'serviceHost' should be configured.`)
  }
}

const VERSION = '2.0'
const PROTOCOL = /^file/.test(window.location.protocol) ? 'https' : window.location.protocol
const HOST = 'webapi.amap.com'
const RETRY = 3
const RETRY_DELAY = 200
