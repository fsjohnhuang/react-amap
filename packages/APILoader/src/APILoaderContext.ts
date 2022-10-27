import { createContext, useContext } from 'react'
import { APILoaderContextConfig } from './types'

const Context = createContext<APILoaderContextConfig>({})

export function useAPILoaderContext() {
  return useContext(Context)
}

export const APILoaderContextProvider = Context.Provider
