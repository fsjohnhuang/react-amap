import { forwardRef, useImperativeHandle } from 'react'
import useText from './useText'

export default forwardRef(function Text(props, ref) {
  const { text, Portal } = useText(props)
  useImperativeHandle(ref, () => ({...props, text}))
  if (props.children) {
    return <Portal>{props.children}</Portal>
  }
})
