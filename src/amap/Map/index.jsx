import { forwardRef, useImperativeHandle } from 'react'
import { Context } from '../../hooks/useMap'
import useMap from './useMap'

export default forwardRef(function Map(props, ref) {
  const { map, adapter, childs } = useMap(props)
  useImperativeHandle(ref, () => ({...props, map}), [map, props])

  return (
    <>
      {adapter}
      {
        map && 
        <Context.Provider value={{map}}>
          {childs}
        </Context.Provider>
      }
    </>
  )
})