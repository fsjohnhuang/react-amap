import { forwardRef, useImperativeHandle } from 'react'
import useMassMarks from './useMassMarks'

export default forwardRef(function MassMarks(props, ref) {
  const { instance } = useMassMarks(props)
  useImperativeHandle(ref, () => ({...props, instance}))
})