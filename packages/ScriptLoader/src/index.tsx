import { useState, useMemo, useEffect, ReactNode } from "react"
import { requireScriptRetryable, RequireScriptLoading } from "@fsjohnhuang/react-amap2-require-script"
import { identify, parallel, sequential } from "@fsjohnhuang/react-amap2-utils"
import { IdentifiedPromise } from "@fsjohnhuang/react-amap2-utils/cjs/identify"

export interface ScriptLoaderURL {
  url: string
  id?: string
  returns: () => Promise<any>
  crossorigin?: 'anonymous' | 'use-credentials'
  retry?: number
  retryDelay?: number
}

export interface ScriptLoaderProps {
  urls: ScriptLoaderURL[]
  parallel?: boolean
  fallback?: ReactNode
  crossorigin?: 'anonymous' | 'use-credentials'
  retry?: number
  retryDelay?: number
  visible?: boolean
  children: (value: {[id: string]: any}) => ReactNode 
}

export function ScriptLoader(props: ScriptLoaderProps)  {
  const {visible = true} = props

  if (props.urls.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`The 'urls' props is an empty array.`)
    }
    return visible ? props.children({}) : props.fallback
  }

  const [result, setResult] = useState<{[id: string]: any | RequireScriptLoading | Error}>({})
  const actions: Array<() => IdentifiedPromise> = useMemo(() => {
    return props.urls.map(({id, url, returns, crossorigin, retry, retryDelay}) => {
      const action: () => IdentifiedPromise = () => {
        const promise = requireScriptRetryable(url, {
          times: retry || props.retry,
          crossorigin: crossorigin || props.crossorigin,
          retryDelay: retryDelay || props.retryDelay,
          returns,
        })
        
        return identify(promise, id || url)
      }

      return action
    })
  }, [props.urls, props.retry, props.crossorigin, props.retryDelay])
  
  
  const execute = props.parallel ? parallel : sequential
  useEffect(() => {
    ;(async () => {
      setResult(await execute(actions))
    })()
  }, [actions])

  const values = Object.values(result)
  let error = values.find(value => value instanceof Error)
  if (error) {
    throw error
  }
  if (!visible || values.find(value => value instanceof RequireScriptLoading)) {
    return props.fallback
  }

  return props.children(result)
}