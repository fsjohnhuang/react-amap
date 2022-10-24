import { useContext } from 'react'
import { useAPILoaderContext, AMapContext } from '../APILoader'

export default function useAMap() {
  useAPILoaderContext('useAMap')
  return useContext(AMapContext)
}