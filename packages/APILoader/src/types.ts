import { PropsWithChildren, ReactElement } from 'react'

export type APILoaderProps = PropsWithChildren<{
  maps?: boolean
  loca?: boolean
  plugins?: string[]
  visible?: boolean
  fallback?: ReactElement
  parallel?: boolean
  akey?: string
  securityJsCode?: string
  serviceHost?: string
  protocol?: string
  host?: string
  version?: string
  retry?: number
  retryDelay?: number
}>

export type AMapWindow = 
  Window & 
  typeof globalThis & 
  { 
    _AMapSecurityConfig: {
      securityJsCode?: string
      serviceHost?: string
    } 
  }

export type APILoaderContextConfig = {
  akey?: string
  securityJsCode?: string
  serviceHost?: string
  protocol?: string
  host?: string
  version?: string
  retry?: number
  retryDelay?: number
}