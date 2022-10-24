import { useRef, useEffect } from 'react'
import { useAMap } from '../../hooks'

export default function ReactAMapAdapter(props) {
  const { onReady, style, className, ...others } = props
  const { AMap } = useAMap()
  const containerRef = useRef()

  useEffect(() => {
    if (!AMap) return

    const map = new AMap.Map(containerRef.current, others)
    onReady(map)
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [AMap])

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ width: '100%', height: '100%', ...style }} 
    />
  )
}
ReactAMapAdapter.attach = 'MapAdapter'