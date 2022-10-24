import { forwardRef, useImperativeHandle } from 'react'
import useMarker from './useMarker'

export default forwardRef(function Marker(props, ref) {
  const { Portal, marker } = useMarker(props)
  useImperativeHandle(ref, () => ({...props, marker}))
  if (props.children) {
    return <Portal>{props.children}</Portal>
  }
})